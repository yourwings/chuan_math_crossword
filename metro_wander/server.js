/**
 * 地铁漫游多人游戏WebSocket服务器
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 创建HTTP服务器，处理静态文件请求
const server = http.createServer((req, res) => {
  // 获取请求的文件路径
  const filePath = path.join(__dirname, '..', req.url === '/' ? 'index.html' : req.url);
  
  // 获取文件扩展名
  const extname = path.extname(filePath);
  
  // 设置默认的内容类型
  let contentType = 'text/html';
  
  // 根据文件扩展名设置适当的内容类型
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }
  
  // 读取文件
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在
        res.writeHead(404);
        res.end('文件未找到');
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end(`服务器错误: ${err.code}`);
      }
    } else {
      // 成功响应
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 存储游戏房间信息
const gameRooms = {};

// 处理WebSocket连接
wss.on('connection', (ws, req) => {
  // 解析URL查询参数
  const parameters = url.parse(req.url, true).query;
  let roomId = parameters.roomId;
  let playerId = parameters.playerId;
  let playerName = parameters.playerName;
  
  console.log(`玩家 ${playerName} (${playerId}) 已连接`);
  
  // 将玩家信息存储在WebSocket连接对象中
  ws.playerId = playerId;
  ws.playerName = playerName;
  ws.roomId = roomId;
  
  // 处理客户端消息
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`收到来自 ${ws.playerName} 的消息:`, data);
      
      // 根据消息类型处理不同的操作
      switch (data.type) {
        case 'create_room':
          handleCreateRoom(ws, data);
          break;
        case 'join_room':
          handleJoinRoom(ws, data);
          break;
        case 'start_game':
          handleStartGame(ws, data);
          break;
        case 'play_card':
          handlePlayCard(ws, data);
          break;
        case 'draw_card':
          handleDrawCard(ws, data);
          break;
        case 'end_turn':
          handleEndTurn(ws, data);
          break;
        case 'metro_first_card':
          handleMetroFirstCard(ws, data);
          break;
        case 'add_ai':
          handleAddAI(ws, data);
          break;
        case 'get_rooms':
          handleGetRooms(ws);
          break;
        default:
          console.log(`未知消息类型: ${data.type}`);
      }
    } catch (error) {
      console.error('处理消息时出错:', error);
    }
  });
  
  // 处理连接关闭
  ws.on('close', () => {
    console.log(`玩家 ${ws.playerName} (${ws.playerId}) 已断开连接`);
    
    // 如果玩家在房间中，从房间中移除该玩家
    if (ws.roomId && gameRooms[ws.roomId]) {
      const room = gameRooms[ws.roomId];
      
      // 从玩家列表中移除
      room.players = room.players.filter(player => player.id !== ws.playerId);
      
      // 如果房间没有玩家了，删除房间
      if (room.players.length === 0) {
        delete gameRooms[ws.roomId];
        console.log(`房间 ${ws.roomId} 已被删除`);
      } else {
        // 如果房主离开，将房主权限转移给下一个玩家
        if (room.hostId === ws.playerId) {
          room.hostId = room.players[0].id;
          room.players[0].isHost = true;
          console.log(`房间 ${ws.roomId} 的房主已转移给 ${room.players[0].name}`);
        }
        
        // 通知房间中的其他玩家
        broadcastToRoom(ws.roomId, {
          type: 'player_left',
          playerId: ws.playerId,
          players: room.players,
          hostId: room.hostId
        });
      }
    }
  });
  
  // 如果是加入现有房间，发送初始房间信息
  if (roomId && gameRooms[roomId]) {
    handleJoinRoom(ws, { roomId, playerName, playerId });
  }
});

/**
 * 处理创建房间请求
 */
function handleCreateRoom(ws, data) {
  const { roomId, playerName, playerId } = data;
  
  // 检查房间ID是否已存在
  if (gameRooms[roomId]) {
    sendToClient(ws, {
      type: 'error',
      message: '房间ID已存在，请尝试其他ID'
    });
    return;
  }
  
  // 创建新房间
  gameRooms[roomId] = {
    id: roomId,
    hostId: playerId,
    players: [{
      id: playerId,
      name: playerName,
      isHost: true,
      cards: []
    }],
    gameStarted: false,
    tableCards: [],
    currentPlayerId: null,
    deck: [],
    // 添加地铁牌特殊效果的标记
    metroFirstCardPlayed: false,
    metroFirstCardPlayerId: null
  };
  
  // 将玩家加入房间
  ws.roomId = roomId;
  
  // 发送创建成功消息
  sendToClient(ws, {
    type: 'room_created',
    roomId,
    players: gameRooms[roomId].players
  });
  
  console.log(`玩家 ${playerName} 创建了房间 ${roomId}`);
}

/**
 * 处理加入房间请求
 */
function handleJoinRoom(ws, data) {
  const { roomId, playerName, playerId } = data;
  
  // 检查房间是否存在
  if (!gameRooms[roomId]) {
    sendToClient(ws, {
      type: 'error',
      message: '房间不存在'
    });
    return;
  }
  
  // 检查游戏是否已经开始
  if (gameRooms[roomId].gameStarted) {
    sendToClient(ws, {
      type: 'error',
      message: '游戏已经开始，无法加入'
    });
    return;
  }
  
  // 检查房间是否已满
  if (gameRooms[roomId].players.length >= 4) {
    sendToClient(ws, {
      type: 'error',
      message: '房间已满'
    });
    return;
  }
  
  // 检查玩家是否已在房间中
  const existingPlayer = gameRooms[roomId].players.find(p => p.id === playerId);
  if (existingPlayer) {
    // 玩家已在房间中，可能是重新连接
    sendToClient(ws, {
      type: 'room_joined',
      roomId,
      players: gameRooms[roomId].players,
      hostId: gameRooms[roomId].hostId
    });
    return;
  }
  
  // 将玩家添加到房间
  gameRooms[roomId].players.push({
    id: playerId,
    name: playerName,
    isHost: false,
    cards: []
  });
  
  // 更新WebSocket连接的房间ID
  ws.roomId = roomId;
  
  // 发送加入成功消息
  sendToClient(ws, {
    type: 'room_joined',
    roomId,
    players: gameRooms[roomId].players,
    hostId: gameRooms[roomId].hostId
  });
  
  // 通知房间中的其他玩家
  broadcastToRoom(roomId, {
    type: 'player_joined',
    player: {
      id: playerId,
      name: playerName,
      isHost: false
    },
    players: gameRooms[roomId].players
  }, playerId); // 排除刚加入的玩家
  
  console.log(`玩家 ${playerName} 加入了房间 ${roomId}`);
}

/**
 * 处理开始游戏请求
 */
function handleStartGame(ws, data) {
  const { roomId } = data;
  const room = gameRooms[roomId];
  
  // 检查房间是否存在
  if (!room) {
    sendToClient(ws, {
      type: 'error',
      message: '房间不存在'
    });
    return;
  }
  
  // 检查是否是房主
  if (room.hostId !== ws.playerId) {
    sendToClient(ws, {
      type: 'error',
      message: '只有房主可以开始游戏'
    });
    return;
  }
  
  // 检查玩家数量
  if (room.players.length < 2) {
    sendToClient(ws, {
      type: 'error',
      message: '至少需要2名玩家才能开始游戏'
    });
    return;
  }
  
  // 初始化游戏
  initializeGame(room);
  
  // 通知所有玩家游戏开始
  broadcastToRoom(roomId, {
    type: 'game_started',
    players: room.players,
    tableCards: room.tableCards,
    currentPlayerId: room.currentPlayerId
  });
  
  console.log(`房间 ${roomId} 的游戏已开始`);
}

/**
 * 初始化游戏
 */
function initializeGame(room) {
  // 标记游戏已开始
  room.gameStarted = true;
  
  // 创建牌组
  room.deck = createDeck();
  
  // 洗牌
  room.deck = shuffleArray(room.deck);
  
  // 选择初始桌面牌
  const initialTableCardIndex = room.deck.findIndex(card => card.type === 'station');
  if (initialTableCardIndex !== -1) {
    const initialTableCard = room.deck.splice(initialTableCardIndex, 1)[0];
    room.tableCards = [initialTableCard];
  }
  
  // 简化发牌算法，将所有类型牌混在一起随机发放
  // 给每个玩家发8张牌
  room.players.forEach(player => {
    player.cards = [];
    
    // 每个玩家发8张牌
    for (let i = 0; i < 8; i++) {
      if (room.deck.length > 0) {
        player.cards.push(room.deck.pop());
      }
    }
  });
  
  // 牌组已经在前面洗过牌，这里不需要额外处理
  
  // 检查是否有AI玩家，如果有，则让真人玩家先手
  const aiPlayerIndex = room.players.findIndex(player => player.isAI);
  if (aiPlayerIndex !== -1) {
    // 有AI玩家，选择第一个非AI玩家作为先手
    const humanPlayerIndex = room.players.findIndex(player => !player.isAI);
    if (humanPlayerIndex !== -1) {
      room.currentPlayerId = room.players[humanPlayerIndex].id;
    } else {
      // 如果全是AI玩家（理论上不应该发生），随机选择
      const randomIndex = Math.floor(Math.random() * room.players.length);
      room.currentPlayerId = room.players[randomIndex].id;
    }
  } else {
    // 没有AI玩家，随机选择先手玩家
    const randomIndex = Math.floor(Math.random() * room.players.length);
    room.currentPlayerId = room.players[randomIndex].id;
  }
}

/**
 * 处理出牌请求
 */
function handlePlayCard(ws, data) {
  const { roomId, cards, playMode } = data;
  const room = gameRooms[roomId];
  
  // 检查房间是否存在且游戏已开始
  if (!room || !room.gameStarted) {
    sendToClient(ws, {
      type: 'error',
      message: '游戏未开始'
    });
    return;
  }
  
  // 检查是否是当前玩家的回合
  if (room.currentPlayerId !== ws.playerId) {
    sendToClient(ws, {
      type: 'error',
      message: '不是你的回合'
    });
    return;
  }
  
  // 获取当前玩家
  const currentPlayer = room.players.find(p => p.id === ws.playerId);
  if (!currentPlayer) return;
  
  // 检查玩家是否有这些牌
  const validCards = cards.filter(card => {
    return currentPlayer.cards.some(playerCard => 
      playerCard.id === card.id && 
      playerCard.type === card.type && 
      playerCard.name === card.name
    );
  });
  
  if (validCards.length !== cards.length) {
    sendToClient(ws, {
      type: 'error',
      message: '无效的牌'
    });
    return;
  }
  
  // 检查出牌是否符合规则（简化处理，实际应该根据游戏规则检查）
  // TODO: 实现出牌规则检查
  
  // 从玩家手牌中移除出的牌
  cards.forEach(card => {
    const index = currentPlayer.cards.findIndex(c => c.id === card.id);
    if (index !== -1) {
      currentPlayer.cards.splice(index, 1);
    }
  });
  
  // 将牌添加到桌面
  room.tableCards = [...room.tableCards, ...cards];
  
  // 检查玩家是否已经出完所有牌（游戏结束）
  if (currentPlayer.cards.length === 0) {
    // 游戏结束，当前玩家获胜
    broadcastToRoom(roomId, {
      type: 'game_over',
      winner: currentPlayer
    });
    return;
  }
  
  // 检查是否是地铁牌的第一张牌或出租车牌，如果是，则不切换到下一个玩家的回合
  let shouldUpdateCurrentPlayer = true;
  
  // 如果是地铁牌，并且是第一张（没有标记metroFirstCardPlayed），则不切换玩家
  if (playMode === 'metro' && !room.metroFirstCardPlayed) {
    // 这里不设置room.metroFirstCardPlayed，因为这个标记会在handleMetroFirstCard函数中设置
    // 这里只是检查是否应该切换玩家
    shouldUpdateCurrentPlayer = false;
    console.log(`玩家 ${ws.playerName} 出了第一张地铁牌，不切换回合`);
  } else if (room.metroFirstCardPlayed && room.metroFirstCardPlayerId === ws.playerId) {
    // 如果是已经出过第一张地铁牌的玩家出的第二张牌，重置标记
    room.metroFirstCardPlayed = false;
    room.metroFirstCardPlayerId = null;
    console.log(`玩家 ${ws.playerName} 出了第二张地铁牌，重置标记并切换回合`);
  } else if (playMode === 'taxi') {
    // 如果是出租车牌，不切换玩家，允许当前玩家继续出一张地铁牌
    shouldUpdateCurrentPlayer = false;
    console.log(`玩家 ${ws.playerName} 出了出租车牌，不切换回合，允许继续出一张地铁牌`);
    
    // 注意：不在这里自动摸牌，而是等待客户端发送摸牌请求
    // 客户端会在处理card_played消息时，检测到出租车牌，然后发送摸牌请求
    // 这样可以避免摸两张牌的问题
  }
  
  // 只有在需要更新当前玩家时才切换到下一个玩家
  if (shouldUpdateCurrentPlayer) {
    const currentPlayerIndex = room.players.findIndex(p => p.id === room.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
    room.currentPlayerId = room.players[nextPlayerIndex].id;
  }
  
  // 通知所有玩家出牌结果
  broadcastToRoom(roomId, {
    type: 'card_played',
    playerId: ws.playerId,
    cards,
    playMode,
    tableCards: room.tableCards,
    currentPlayerId: room.currentPlayerId,
    remainingCards: currentPlayer.cards.length,
    specialEffect: playMode === 'taxi' ? 'taxi' : undefined // 如果是出租车牌，添加特殊效果标记
  });
}

/**
 * 处理摸牌请求
 */
function handleDrawCard(ws, data) {
  console.log(`[${new Date().toISOString()}] ===== 服务端 handleDrawCard 调试断点 =====`);
  
  // 解构data对象，获取roomId和specialEffect
  const { roomId, specialEffect } = data;
  console.log(`玩家 ${ws.playerName} 请求摸牌，roomId: ${roomId}, specialEffect: ${specialEffect || '无'}`);
  console.log('完整请求数据:', JSON.stringify(data));
  console.log('请求中是否包含specialEffect属性:', data.hasOwnProperty('specialEffect'));
  
  const room = gameRooms[roomId];
  
  // 检查房间是否存在且游戏已开始
  if (!room || !room.gameStarted) {
    console.log('错误：游戏未开始');
    sendToClient(ws, {
      type: 'error',
      message: '游戏未开始'
    });
    return;
  }
  
  // 检查是否是当前玩家的回合
  if (room.currentPlayerId !== ws.playerId) {
    console.log('错误：不是当前玩家的回合');
    sendToClient(ws, {
      type: 'error',
      message: '不是你的回合'
    });
    return;
  }
  
  // 获取当前玩家
  const currentPlayer = room.players.find(p => p.id === ws.playerId);
  if (!currentPlayer) {
    console.log('错误：找不到当前玩家');
    return;
  }
  
  // 检查牌堆是否还有牌
  if (room.deck.length === 0) {
    console.log('错误：牌堆已空');
    sendToClient(ws, {
      type: 'error',
      message: '牌堆已空'
    });
    return;
  }
  
  // 从牌堆中摸一张牌
  const newCard = room.deck.pop();
  currentPlayer.cards.push(newCard);
  console.log(`玩家 ${ws.playerName} 摸了一张牌:`, JSON.stringify(newCard));
  
  // 简化出租车特殊效果的判断逻辑，只检查specialEffect是否严格等于'taxi'
  const isTaxiEffect = specialEffect === 'taxi';
  
  // 只有在非出租车特殊效果下才切换玩家
  if (!isTaxiEffect) {
    // 更新当前玩家（轮到下一个玩家）
    const currentPlayerIndex = room.players.findIndex(p => p.id === room.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
    const oldPlayerId = room.currentPlayerId;
    room.currentPlayerId = room.players[nextPlayerIndex].id;
    console.log(`普通摸牌：切换回合，从玩家 ${oldPlayerId} 到玩家 ${room.currentPlayerId}`);
  } else {
    console.log(`玩家 ${ws.playerName} 使用出租车特殊效果摸牌，不切换回合`);
  }
  
  // 通知当前玩家摸到的牌
  const playerMessage = {
    type: 'card_drawn',
    card: newCard,
    remainingDeckCount: room.deck.length,
    specialEffect: isTaxiEffect ? 'taxi' : undefined // 如果是出租车特殊效果，添加标记
  };
  
  // 发送消息给当前玩家
  sendToClient(ws, playerMessage);
  
  // 通知所有玩家摸牌结果（不包括摸到的具体牌）
  const broadcastMessage = {
    type: 'player_drew_card',
    playerId: ws.playerId,
    currentPlayerId: room.currentPlayerId,
    remainingCards: currentPlayer.cards.length,
    remainingDeckCount: room.deck.length,
    specialEffect: isTaxiEffect ? 'taxi' : undefined // 添加特殊效果标记
  };
  
  // 广播消息给其他玩家
  broadcastToRoom(roomId, broadcastMessage, ws.playerId); // 排除当前玩家，因为已经单独发送了消息
}

/**
 * 处理添加AI玩家请求
 */
function handleAddAI(ws, data) {
  const { roomId } = data;
  const room = gameRooms[roomId];
  
  // 检查房间是否存在
  if (!room) {
    sendToClient(ws, {
      type: 'error',
      message: '房间不存在'
    });
    return;
  }
  
  // 检查是否是房主
  if (room.hostId !== ws.playerId) {
    sendToClient(ws, {
      type: 'error',
      message: '只有房主可以添加AI玩家'
    });
    return;
  }
  
  // 检查游戏是否已经开始
  if (room.gameStarted) {
    sendToClient(ws, {
      type: 'error',
      message: '游戏已经开始，无法添加AI玩家'
    });
    return;
  }
  
  // 检查房间是否已满
  if (room.players.length >= 4) {
    sendToClient(ws, {
      type: 'error',
      message: '房间已满'
    });
    return;
  }
  
  // 创建AI玩家
  const aiPlayer = {
    id: 'ai_' + Date.now(),
    name: 'AI玩家' + (room.players.length),
    isHost: false,
    isAI: true,
    cards: []
  };
  
  // 将AI玩家添加到房间
  room.players.push(aiPlayer);
  
  // 通知所有玩家
  broadcastToRoom(roomId, {
    type: 'ai_added',
    player: aiPlayer,
    players: room.players
  });
  
  console.log(`房主 ${ws.playerName} 在房间 ${roomId} 中添加了AI玩家 ${aiPlayer.name}`);
}

/**
 * 处理结束回合请求
 */
function handleEndTurn(ws, data) {
  const { roomId } = data;
  const room = gameRooms[roomId];
  
  // 检查房间是否存在且游戏已开始
  if (!room || !room.gameStarted) {
    sendToClient(ws, {
      type: 'error',
      message: '游戏未开始'
    });
    return;
  }
  
  // 检查是否是当前玩家的回合
  if (room.currentPlayerId !== ws.playerId) {
    sendToClient(ws, {
      type: 'error',
      message: '不是你的回合'
    });
    return;
  }
  
  // 清除地铁牌特殊标记
  if (room.metroFirstCardPlayed && room.metroFirstCardPlayerId === ws.playerId) {
    room.metroFirstCardPlayed = false;
    room.metroFirstCardPlayerId = null;
    console.log(`玩家 ${ws.playerName} 结束回合，清除地铁牌特殊标记`);
  }
  
  // 更新当前玩家（轮到下一个玩家）
  const currentPlayerIndex = room.players.findIndex(p => p.id === room.currentPlayerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
  room.currentPlayerId = room.players[nextPlayerIndex].id;
  
  // 通知所有玩家回合已结束
  broadcastToRoom(roomId, {
    type: 'turn_ended',
    previousPlayerId: ws.playerId,
    currentPlayerId: room.currentPlayerId
  });
}

/**
 * 处理地铁牌第一张牌的特殊消息
 */
function handleMetroFirstCard(ws, data) {
  const { roomId, playerId } = data;
  const room = gameRooms[roomId];
  
  // 检查房间是否存在且游戏已开始
  if (!room || !room.gameStarted) {
    sendToClient(ws, {
      type: 'error',
      message: '游戏未开始'
    });
    return;
  }
  
  // 检查是否是当前玩家的回合
  if (room.currentPlayerId !== ws.playerId) {
    sendToClient(ws, {
      type: 'error',
      message: '不是你的回合'
    });
    return;
  }
  
  // 标记该玩家正在使用地铁牌特殊效果（出第一张地铁牌后的状态）
  room.metroFirstCardPlayed = true;
  room.metroFirstCardPlayerId = playerId;
  
  console.log(`玩家 ${ws.playerName} 出了第一张地铁牌，等待出第二张或结束回合`);
  
  // 通知所有玩家当前玩家出了第一张地铁牌
  broadcastToRoom(roomId, {
    type: 'metro_first_card_played',
    playerId: playerId
  });
}

/**
 * 处理获取房间列表请求
 */
function handleGetRooms(ws) {
  // 收集可用的房间信息（只包括未开始游戏的房间）
  const availableRooms = Object.values(gameRooms)
    .filter(room => !room.gameStarted)
    .map(room => ({
      id: room.id,
      host: room.players.find(p => p.id === room.hostId)?.name || '未知',
      players: room.players.length
    }));
  
  // 发送房间列表
  sendToClient(ws, {
    type: 'room_list',
    rooms: availableRooms
  });
}

/**
 * 向客户端发送消息
 */
function sendToClient(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

/**
 * 向房间中的所有玩家广播消息
 */
function broadcastToRoom(roomId, data, excludePlayerId = null) {
  // 调试日志，打印完整的消息对象
  console.log('广播消息到房间，完整消息对象:', JSON.stringify(data));
  
  wss.clients.forEach(client => {
    if (client.roomId === roomId && client.readyState === WebSocket.OPEN && (!excludePlayerId || client.playerId !== excludePlayerId)) {
      client.send(JSON.stringify(data));
    }
  });
}

/**
 * 创建牌组
 */
function createDeck() {
  // 导入地铁数据
  const metroData = require('./metro_data.js').metroData;
  const deck = [];
  
  // 添加地铁站牌 - 使用实际的地铁站数据
  const stationCards = metroData.stations
    .filter(station => station.cardmode === 1)
    .map(station => ({
      id: `station_${station.name}`,
      type: 'station',
      name: station.name,
      lines: station.lines
    }));
  
  // 添加出租车牌（5张）
  const taxiCards = Array(5).fill().map((_, i) => ({
    id: `taxi_${i+1}`,
    type: 'taxi',
    name: '出租车'
  }));
  
  // 添加公交车牌（5张）
  const busCards = Array(5).fill().map((_, i) => ({
    id: `bus_${i+1}`,
    type: 'bus',
    name: '公交车'
  }));
  
  // 合并所有牌并返回
  return [...stationCards, ...taxiCards, ...busCards];
}

/**
 * 洗牌函数
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket服务器已启动，监听端口 ${PORT}`);
});