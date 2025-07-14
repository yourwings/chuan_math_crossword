// 北京地铁漫游 - 多人对战模式核心逻辑

// 导入地铁数据
import { metroData } from './metro_data.js';
// 导入 WebRTC 点对点连接管理类
import WebRTCPeerManager from './webrtc_peer.js';

// WebRTC 连接
let peerManager = null;
let isConnected = false;

// 多人游戏状态变量
let isHost = false;
let roomId = null;
let players = [];
let currentPlayerId = null;
let localPlayerId = null;
let localPlayerName = '';
let gameStarted = false;
let isInWaitingRoom = false;

// 游戏状态变量
let playerHand = [];
let aiHand = [];
let tableCards = [];
let currentTurn = 'player'; // 'player' 或 'ai'
let selectedCards = [];
let playMode = null; // 'metro', 'taxi', 'bus' 或 null
let gameOver = false;

// 牌组类型常量
const CARD_TYPE = {
  STATION: 'station',
  TAXI: 'taxi',
  BUS: 'bus'
};

// 颜色映射
const LINE_COLORS = {
  1: '#A52A2A', // 一号线 - 红色
  2: '#0000FF', // 二号线 - 蓝色
  3: '#C71585', // 三号线 - 深粉色
  4: '#008000', // 四号线 - 绿色
  5: '#800080', // 五号线 - 紫色
  6: '#FFA500', // 六号线 - 橙色
  7: '#FFC0CB', // 七号线 - 粉色
  8: '#008B8B', // 八号线 - 青色
  9: '#006400', // 九号线 - 深绿色
  10: '#4682B4', // 十号线 - 钢蓝色
  11: '#8B4513', // 十一号线 - 棕色
  12: '#9370DB', // 十二号线 - 中紫色
  13: '#FFFF00', // 十三号线 - 黄色
  14: '#B8860B', // 十四号线 - 暗金色
  15: '#FF00FF', // 十五号线 - 品红色
  16: '#00FFFF', // 十六号线 - 青绿色
  17: '#FF4500', // 十七号线 - 橙红色
  19: '#00FF00', // 十九号线 - 亮绿色
  'S1': '#808080', // S1线 - 灰色
  'sdjc': '#C0C0C0', // 首都机场线 - 银色
  'dxjc': '#D2B48C', // 大兴机场线 - 棕褐色
  'xj': '#E6E6FA', // 西郊线 - 淡紫色
  'fs': '#F0E68C', // 房山线 - 卡其色
  'cp': '#98FB98', // 昌平线 - 淡绿色
  'yz': '#DDA0DD', // 亦庄线 - 淡紫色
  'yf': '#CD853F', // 燕房线 - 秘鲁色
  'yzt1': '#7B68EE' // 亦庄T1线 - 中暗蓝色
};

// 游戏统计数据
let gameStats = {
  totalCards: 0,      // 总共出牌数
  metroStations: 0,   // 经过地铁站数
  taxiRides: 0,       // 乘坐出租车次数
  busRides: 0         // 乘坐公交车次数
};

// 调试模式
let debugMode = false;

// DOM元素
const playerHandElement = document.getElementById('player-hand');
const aiHandElement = document.getElementById('ai-hand'); // 注意：在multiplayer_battle.html中可能不存在
const tableCardsElement = document.getElementById('table-cards');
const playerCardsCountElement = document.getElementById('player-cards-count'); // 注意：在multiplayer_battle.html中可能不存在
const aiCardsCountElement = document.getElementById('ai-cards-count'); // 注意：在multiplayer_battle.html中可能不存在
const deckCountElement = document.getElementById('deck-count');
const currentTurnElement = document.getElementById('current-turn');
const gameMessageElement = document.getElementById('game-message');
const gameResultElement = document.getElementById('game-result');

// 多人游戏界面元素
const setupPanelElement = document.getElementById('setup-panel');
const gameContainerElement = document.getElementById('game-container');
const playerNameInput = document.getElementById('player-name');
const createGameBtn = document.getElementById('create-game-btn');
const joinGameBtn = document.getElementById('join-game-btn');
const joinGamePanelElement = document.getElementById('join-game-panel');
const availableGamesElement = document.getElementById('available-games');
const refreshGamesBtn = document.getElementById('refresh-games-btn');
const waitingRoomElement = document.getElementById('waiting-room');
const joinedPlayersElement = document.getElementById('joined-players');
const startGameBtn = document.getElementById('start-game-btn');
const playersListElement = document.getElementById('players-list');

// 按钮元素
const playMetroBtn = document.getElementById('play-metro-btn');
const playTaxiBtn = document.getElementById('play-taxi-btn');
const playBusBtn = document.getElementById('play-bus-btn');
const drawCardBtn = document.getElementById('draw-card-btn');
const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
const newGameBtn = document.getElementById('new-game-btn');

// 创建调试按钮
const debugBtn = document.createElement('button');
debugBtn.id = 'debug-btn';
debugBtn.className = 'action-button';
debugBtn.textContent = '调试模式';
// 使用id选择器确保添加到正确的按钮容器中
document.getElementById('action-buttons').appendChild(debugBtn);

// 创建调试信息区域
const debugInfoElement = document.createElement('div');
debugInfoElement.id = 'debug-info';
debugInfoElement.className = 'debug-info';
debugInfoElement.style.display = 'none';
debugInfoElement.innerHTML = '<h3>调试信息</h3><div id="debug-content"></div>';
document.querySelector('.game-container').appendChild(debugInfoElement);
const debugContentElement = document.getElementById('debug-content');

// 添加调试按钮点击事件
debugBtn.addEventListener('click', () => {
  debugMode = !debugMode;
  debugBtn.textContent = debugMode ? '关闭调试' : '调试模式';
  debugInfoElement.style.display = debugMode ? 'block' : 'none';
  // 显示或隐藏AI手牌区域，在多人游戏模式下始终隐藏
  if (aiHandElement) {
    aiHandElement.style.display = (gameStarted && players.length > 0) ? 'none' : (debugMode ? 'flex' : 'none');
  }
  // 更新调试信息
  updateDebugInfo();
  renderCards(); // 重新渲染卡牌
});

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  setupMultiplayerEventListeners();
});

/**
 * 初始化WebRTC连接
 */
function initializeWebRTC(playerName, joinRoomId = null) {
  // 生成唯一的玩家ID
  localPlayerId = 'player_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  localPlayerName = playerName;
  
  // 创建WebRTC点对点连接管理器
  peerManager = new WebRTCPeerManager();
  
  // 注册消息回调
  registerWebRTCCallbacks();
  
  // 设置连接状态
  isConnected = true;
  showGameMessage('WebRTC连接已初始化');
  
  // 如果是加入现有房间
  if (joinRoomId) {
    roomId = joinRoomId;
    // 作为客户端加入房间
    peerManager.joinPeer(playerName);
  } else {
    // 作为主机创建房间
    peerManager.initializeAsHost(playerName);
  }
}

/**
 * 注册WebRTC消息回调
 */
function registerWebRTCCallbacks() {
  // 房间创建回调
  peerManager.on('room_created', (data) => {
    handleRoomCreated(data);
  });
  
  // 房间加入回调
  peerManager.on('room_joined', (data) => {
    handleRoomJoined(data);
  });
  
  // 玩家加入回调
  peerManager.on('player_joined', (data) => {
    handlePlayerJoined(data);
  });
  
  // 玩家离开回调
  peerManager.on('player_left', (data) => {
    handlePlayerLeft(data);
  });
  
  // 游戏开始回调
  peerManager.on('game_started', (data) => {
    handleGameStarted(data);
  });
  
  // 出牌回调
  peerManager.on('card_played', (data) => {
    handleCardPlayed(data);
  });
  
  // 玩家摸牌回调
  peerManager.on('player_drew_card', (data) => {
    handlePlayerDrewCard(data);
  });
  
  // 摸牌结果回调
  peerManager.on('card_drawn', (data) => {
    handleCardDrawn(data);
  });
  
  // 回合结束回调
  peerManager.on('turn_ended', (data) => {
    handleTurnEnded(data);
  });
}
  
/**
 * 发送消息到对等方
 */
function sendToPeers(message) {
  if (peerManager) {
    if (isHost) {
      // 如果是房主，广播消息给所有对等方
      peerManager.broadcastToPeers(message);
    } else {
      // 如果不是房主，发送消息给房主
      const hostPlayer = players.find(p => p.isHost);
      if (hostPlayer) {
        peerManager.sendToPeer(hostPlayer.id, message);
      } else {
        console.error('找不到房主玩家');
        showGameMessage('通信错误，找不到房主', true);
      }
    }
  } else {
    console.error('WebRTC 连接未初始化');
    showGameMessage('连接未初始化，请刷新页面重试', true);
  }
}


/**
 * 处理房间创建成功消息
 */
function handleRoomCreated(data) {
  console.log('执行handleRoomCreated函数，接收到的数据:', data);
  roomId = data.roomId;
  players = data.players;
  isHost = true;
  isInWaitingRoom = true;
  
  console.log('设置状态变量 - roomId:', roomId);
  console.log('设置状态变量 - players:', players);
  console.log('设置状态变量 - isHost:', isHost);
  console.log('设置状态变量 - isInWaitingRoom:', isInWaitingRoom);
  
  // 更新UI
  console.log('更新UI元素显示状态');
  console.log('setupPanelElement:', setupPanelElement);
  console.log('waitingRoomElement:', waitingRoomElement);
  
  // 不隐藏整个setupPanelElement，因为waitingRoomElement是它的子元素
  // 隐藏设置面板中的其他元素
  document.querySelectorAll('#setup-panel > *:not(#waiting-room)').forEach(el => {
    if (el.id !== 'waiting-room') {
      el.style.display = 'none';
    }
  });
  
  // 显示等待室
  waitingRoomElement.style.display = 'block';
  
  // 确保等待室可见
  waitingRoomElement.style.visibility = 'visible';
  waitingRoomElement.style.opacity = '1';
  
  startGameBtn.disabled = players.length < 2;
  
  console.log('UI元素显示状态更新后:');
  console.log('waitingRoomElement.style.display:', waitingRoomElement.style.display);
  console.log('waitingRoomElement.style.visibility:', waitingRoomElement.style.visibility);
  console.log('waitingRoomElement.style.opacity:', waitingRoomElement.style.opacity);
  
  // 更新已加入玩家列表
  console.log('调用updateJoinedPlayersList更新玩家列表');
  updateJoinedPlayersList();
  
  showGameMessage(`房间已创建，ID: ${roomId}`);
  console.log('handleRoomCreated函数执行完毕');
}

/**
 * 处理加入房间成功消息
 */
function handleRoomJoined(data) {
  console.log('执行handleRoomJoined函数，接收到的数据:', data);
  roomId = data.roomId;
  players = data.players;
  isHost = data.hostId === localPlayerId;
  isInWaitingRoom = true;
  
  console.log('设置状态变量 - roomId:', roomId);
  console.log('设置状态变量 - players:', players);
  console.log('设置状态变量 - isHost:', isHost);
  console.log('设置状态变量 - isInWaitingRoom:', isInWaitingRoom);
  
  // 更新UI
  console.log('更新UI元素显示状态');
  console.log('setupPanelElement:', setupPanelElement);
  console.log('joinGamePanelElement:', joinGamePanelElement);
  console.log('waitingRoomElement:', waitingRoomElement);
  
  // 不隐藏整个setupPanelElement，因为waitingRoomElement是它的子元素
  // 隐藏设置面板中的其他元素
  document.querySelectorAll('#setup-panel > *:not(#waiting-room)').forEach(el => {
    if (el.id !== 'waiting-room') {
      el.style.display = 'none';
    }
  });
  joinGamePanelElement.style.display = 'none';
  waitingRoomElement.style.display = 'block';
  startGameBtn.disabled = !isHost || players.length < 2;
  
  console.log('UI元素显示状态更新后:');
  console.log('setupPanelElement.style.display:', setupPanelElement.style.display);
  console.log('joinGamePanelElement.style.display:', joinGamePanelElement.style.display);
  console.log('waitingRoomElement.style.display:', waitingRoomElement.style.display);
  
  // 更新已加入玩家列表
  console.log('调用updateJoinedPlayersList更新玩家列表');
  updateJoinedPlayersList();
  
  showGameMessage(`已加入房间 ${roomId}`);
  console.log('handleRoomJoined函数执行完毕');
}

/**
 * 处理玩家加入消息
 */
function handlePlayerJoined(data) {
  players = data.players;
  
  // 更新已加入玩家列表
  updateJoinedPlayersList();
  
  // 如果是房主，当玩家数量达到2人或以上时启用开始游戏按钮
  if (isHost) {
    startGameBtn.disabled = players.length < 2;
  }
  
  showGameMessage(`玩家 ${data.player.name} 加入了游戏`);
}

/**
 * 处理玩家离开消息
 */
function handlePlayerLeft(data) {
  players = data.players;
  
  // 检查房主是否变更
  isHost = data.hostId === localPlayerId;
  
  // 更新已加入玩家列表
  updateJoinedPlayersList();
  
  // 如果是房主，当玩家数量少于2人时禁用开始游戏按钮
  if (isHost) {
    startGameBtn.disabled = players.length < 2;
  }
  
  showGameMessage(`玩家离开了游戏`);
}

/**
 * 处理游戏开始消息
 */
function handleGameStarted(data) {
  players = data.players;
  tableCards = data.tableCards;
  currentPlayerId = data.currentPlayerId;
  gameStarted = true;
  isInWaitingRoom = false;
  
  // 更新本地玩家手牌
  const localPlayer = players.find(player => player.id === localPlayerId);
  if (localPlayer) {
    playerHand = localPlayer.cards;
  }
  
  // 更新UI
  waitingRoomElement.style.display = 'none';
  gameContainerElement.style.display = 'block';
  
  // 渲染卡牌
  renderCards();
  
  // 更新游戏信息
  updateGameInfo();
  
  // 更新玩家列表UI
  updatePlayersListUI();
  
  // 更新按钮状态
  updateButtonStates();
  
  showGameMessage('游戏开始！');
}

/**
 * 处理玩家出牌消息
 */
function handleCardPlayed(data) {
  // 更新桌面牌
  tableCards = data.tableCards;
  
  // 更新当前玩家
  console.log('出牌前当前玩家ID:', currentPlayerId);
  console.log('服务器返回的当前玩家ID:', data.currentPlayerId);
  console.log('出牌模式:', data.playMode);
  
  // 更新当前玩家ID为服务器返回的值
  // 如果是出租车牌特殊效果，不更新当前玩家ID，保持当前玩家不变
  if (data.playMode === 'taxi') {
    console.log('出租车牌特殊效果：保持当前玩家ID不变 =', currentPlayerId);
  } else {
    currentPlayerId = data.currentPlayerId;
    console.log('更新后当前玩家ID:', currentPlayerId);
  }
  
  // 如果是出租车牌，显示特殊提示
  if (data.playMode === 'taxi') {
    console.log('出租车牌特殊效果：当前玩家ID =', currentPlayerId);
    // 如果当前玩家是本地玩家，显示提示
    if (currentPlayerId === localPlayerId) {
      showGameMessage('现在是你的回合，可以出一张地铁站牌或结束回合');
    }
  }
  
  // 如果是其他玩家出的牌，更新他们的手牌数量
  const playerIndex = players.findIndex(p => p.id === data.playerId);
  if (playerIndex !== -1) {
    players[playerIndex].cards = players[playerIndex].cards || [];
    players[playerIndex].cards.length = data.remainingCards;
  }
  
  // 渲染卡牌
  renderCards();
  
  // 更新游戏信息
  updateGameInfo();
  
  // 更新玩家列表UI
  updatePlayersListUI();
  
  // 更新按钮状态
  updateButtonStates();
  
  // 显示出牌消息
  const playerName = players.find(p => p.id === data.playerId)?.name || '玩家';
  let cardTypeText = '';
  let effectMessage = '';
  let specialAction = false;
  
  switch (data.playMode) {
    case 'metro':
      cardTypeText = '地铁站牌';
      // 地铁牌特殊效果：可以连续出两张地铁牌
      if (data.playerId === localPlayerId) {
        effectMessage = '可以选择打出第二张地铁站牌';
        specialAction = true;
        console.log('地铁牌特殊效果已触发，specialAction =', specialAction);
      }
      break;
    case 'taxi':
      cardTypeText = '出租车牌';
      // 出租车牌特殊效果：出牌后摸一张牌并可选择打出一张地铁牌
      // 确保window.specialEffectPlayed和window.taxiEffectActive已定义
      if (window.specialEffectPlayed === undefined) {
        window.specialEffectPlayed = false;
        console.log('初始化window.specialEffectPlayed为false');
      }
      if (window.taxiEffectActive === undefined) {
        window.taxiEffectActive = false;
        console.log('初始化window.taxiEffectActive为false');
      }
      if (window.metroFirstCardConfirmed === undefined) {
        window.metroFirstCardConfirmed = false;
        console.log('初始化window.metroFirstCardConfirmed为false');
      }
      
      // 无论是谁出的出租车牌，都设置出租车特殊效果标记和特殊效果已播放标记
      window.taxiEffectActive = true;
      window.specialEffectPlayed = true;
      console.log('出租车特殊效果已触发，设置window.taxiEffectActive =', window.taxiEffectActive);
      console.log('出租车特殊效果已触发，设置window.specialEffectPlayed =', window.specialEffectPlayed);
      
      // 添加特殊效果标记到服务器返回的数据中，确保客户端能正确识别
      if (!data.specialEffect) {
        data.specialEffect = 'taxi';
        console.log('添加specialEffect到服务器返回的数据:', data.specialEffect);
      }
      
      // 如果是本地玩家出的出租车牌，设置特殊行动和特殊效果标记
      if (data.playerId === localPlayerId) {
        effectMessage = '出租车可以连接任意两个地铁站！摸一张牌后可以选择打出一张地铁牌';
        specialAction = true;
        console.log('本地玩家出租车特殊效果已触发，specialAction =', specialAction);
      }
      break;
    case 'bus':
      cardTypeText = '公交车牌';
      // 公交车牌特殊效果：将倒数第二张地铁牌放到牌堆末尾
      if (data.playerId === localPlayerId) {
        // 首先检查是否有足够的地铁站牌在桌面上
        const stationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION);
        if (stationCards.length >= 2) {
          // 找到倒数第二张地铁站牌
          const secondLastStationIndex = tableCards.findIndex((card, index) => {
            if (card.type !== CARD_TYPE.STATION) return false;
            const stationsAfter = tableCards.slice(index + 1).filter(c => c.type === CARD_TYPE.STATION);
            return stationsAfter.length === 1; // 如果后面只有一张地铁站牌，那么这张就是倒数第二张
          });
          
          if (secondLastStationIndex !== -1) {
            // 将倒数第二张地铁站牌移到牌堆末尾（而不是牌堆首位）
            const secondLastStation = tableCards[secondLastStationIndex];
            effectMessage = `公交车将${secondLastStation.name}站移到了牌堆末尾！可以选择打出一张地铁牌`;
            specialAction = true; // 公交车也设置为特殊行动，允许继续出一张地铁牌
            console.log('公交车特殊效果已触发，specialAction =', specialAction);
            // 确保window.specialEffectPlayed已定义，如果未定义则初始化为false
            if (window.specialEffectPlayed === undefined) {
              window.specialEffectPlayed = false;
              console.log('初始化window.specialEffectPlayed为false');
            }
            // 设置特殊效果标记，表示这是特殊效果后的出牌，只能出一张地铁牌
            window.specialEffectPlayed = true;
          } else {
            effectMessage = '公交车效果：无法找到倒数第二张地铁站牌';
          }
        } else {
          effectMessage = '公交车效果：桌面上没有足够的地铁站牌';
        }
      }
      break;
    default:
      cardTypeText = '牌';
  }
  
  // 显示出牌消息
  showGameMessage(`${playerName} 出了 ${data.cards.length} 张${cardTypeText}`);
  
  // 检查是否是特殊效果后的出牌（只能出一张）
  let isSpecialEffectPlay = false;
  // 确保window.specialEffectPlayed和window.metroFirstCardConfirmed已定义，如果未定义则初始化为false
  if (window.specialEffectPlayed === undefined) {
    window.specialEffectPlayed = false;
    console.log('初始化window.specialEffectPlayed为false');
  }
  if (window.metroFirstCardConfirmed === undefined) {
    window.metroFirstCardConfirmed = false;
    console.log('初始化window.metroFirstCardConfirmed为false');
  }
  if (window.specialEffectPlayed && data.playMode === 'metro') {
    // 标记这是特殊效果后的出牌
    isSpecialEffectPlay = true;
    // 重置特殊效果标记
    window.specialEffectPlayed = false;
    window.taxiEffectActive = false; // 重置出租车/公交车特殊效果标记
    specialAction = false;
    
    // 移除所有可能存在的结束回合按钮
    const existingEndTurnBtn = document.getElementById('end-turn-btn');
    if (existingEndTurnBtn) {
      existingEndTurnBtn.remove();
    }
    
    console.log('特殊效果后出地铁牌');
  }
  
  // 处理特殊效果
  if (specialAction || data.specialEffect === 'taxi') {
    console.log('进入特殊行动处理流程');
    console.log('出牌玩家ID:', data.playerId);
    console.log('本地玩家ID:', localPlayerId);
    console.log('当前回合玩家ID:', currentPlayerId);
    console.log('特殊效果标记:', data.specialEffect);
    
    // 如果是出租车，先摸一张牌
    if (data.playMode === 'taxi' || data.specialEffect === 'taxi') {
      // ===== 调试断点：出租车牌处理 =====
      console.log('===== 客户端 handleCardPlayed 出租车牌处理调试断点 =====');
      console.log('当前时间:', new Date().toISOString());
      console.log('出牌玩家ID:', data.playerId);
      console.log('本地玩家ID:', localPlayerId);
      console.log('当前回合玩家ID:', currentPlayerId);
      console.log('出牌模式:', data.playMode);
      console.log('特殊效果标记:', data.specialEffect);
      console.log('是否是当前玩家出的出租车牌:', data.playerId === localPlayerId);
      console.log('是否是本地玩家的回合:', currentPlayerId === localPlayerId);
      console.log('window.taxiEffectActive:', window.taxiEffectActive);
      console.log('window.specialEffectPlayed:', window.specialEffectPlayed);
      // ===== 调试断点结束 =====
      
      // 设置全局出租车效果标记，无论是谁出的出租车牌
      window.taxiEffectActive = true;
      window.specialEffectPlayed = true; // 设置特殊效果已播放标记
      console.log('出租车效果：设置 window.taxiEffectActive =', window.taxiEffectActive);
      console.log('出租车效果：设置 window.specialEffectPlayed =', window.specialEffectPlayed);
      
      // 显示出租车效果提示消息
      const playerName = players.find(p => p.id === data.playerId)?.name || '其他玩家';
      showGameMessage(`${playerName} 出了出租车牌，特殊效果激活`);
      
      // 如果是当前玩家出的出租车牌，发送摸牌请求
      if (data.playerId === localPlayerId) {
        console.log('1本地玩家出了出租车牌，发送摸牌请求');
        // 发送摸牌请求到服务器，并标记这是出租车特殊效果
        const drawCardRequest = {
          type: 'draw_card',
          roomId: roomId,
          specialEffect: 'taxi' // 添加标记，告诉服务器这是出租车特殊效果下的摸牌
        };
        
        console.log('本地玩家出租车牌，发送摸牌请求:', JSON.stringify(drawCardRequest));
        sendToServer(drawCardRequest);
        
        // 显示提示消息
        showGameMessage('出租车效果：摸了一张牌，可以选择打出一张地铁站牌或结束回合');
      } else {
        // 如果是其他玩家出的出租车牌
        console.log('其他玩家出了出租车牌:', playerName);
        showGameMessage(`${playerName} 出了出租车牌，正在摸牌...`);
        
        // 检查当前玩家是否是本地玩家
        if (currentPlayerId === localPlayerId) {
          console.log('出租车牌特殊效果：当前玩家是本地玩家，显示提示');
          showGameMessage('现在是你的回合，等待对方摸牌后，你可以出一张地铁站牌或结束回合');
          
          // 重要：如果当前玩家是本地玩家，但出牌的是其他玩家，说明服务器没有切换玩家
          // 这种情况下，我们需要自动发送摸牌请求，并带上出租车特殊效果标记
          console.log('非房主出出租车牌，自动发送带特殊效果的摸牌请求');
          
          // 延迟发送摸牌请求，确保服务器有足够时间处理前一个请求
          setTimeout(() => {
            console.log('===== 延时执行：非房主出出租车牌后的摸牌请求 =====');
            console.log('当前时间:', new Date().toISOString());
            console.log('出牌玩家ID:', data.playerId);
            console.log('本地玩家ID:', localPlayerId);
            console.log('当前回合玩家ID:', currentPlayerId);
            console.log('出牌模式:', data.playMode);
            console.log('特殊效果标记:', data.specialEffect);
            
            // 检查当前状态
            console.log('延迟执行前 - window.taxiEffectActive:', window.taxiEffectActive);
            console.log('延迟执行前 - window.specialEffectPlayed:', window.specialEffectPlayed);
            
            // 确保window.taxiEffectActive为true，并设置为全局变量
            window.taxiEffectActive = true;
            window.specialEffectPlayed = true;
            console.log('设置window.taxiEffectActive =', window.taxiEffectActive);
            console.log('设置window.specialEffectPlayed =', window.specialEffectPlayed);
            
            // 构建请求对象并确保包含specialEffect参数
            const drawCardRequest = {
              type: 'draw_card',
              roomId: roomId,
              specialEffect: 'taxi' // 添加标记，告诉服务器这是出租车特殊效果下的摸牌
            };
            
            console.log('===== 构建摸牌请求 =====');
            console.log('非房主出出租车牌，发送摸牌请求:', JSON.stringify(drawCardRequest));
            console.log('drawCardRequest对象的所有属性名:', Object.keys(drawCardRequest));
            console.log('specialEffect的值:', drawCardRequest.specialEffect);
            console.log('specialEffect的类型:', typeof drawCardRequest.specialEffect);
            console.log('drawCardRequest中是否包含specialEffect属性:', drawCardRequest.hasOwnProperty('specialEffect'));
            
            // 使用sendToServer函数发送请求，确保一致性
            console.log('===== 使用sendToServer函数发送请求 =====');
            sendToServer(drawCardRequest);
            
            // 同时直接使用socket.send发送请求，确保所有属性都被正确传递
            if (socket && socket.readyState === WebSocket.OPEN) {
              console.log('===== 使用socket.send发送请求 =====');
              console.log('WebSocket状态:', socket.readyState);
              console.log('WebSocket.OPEN值:', WebSocket.OPEN);
              
              const jsonString = JSON.stringify(drawCardRequest);
              console.log('使用socket.send发送的JSON字符串:', jsonString);
              console.log('JSON字符串长度:', jsonString.length);
              console.log('JSON字符串是否包含"specialEffect":', jsonString.includes('"specialEffect"'));
              socket.send(jsonString);
              
              // 保存最后一次发送的摸牌请求，用于调试
              window.lastDrawCardRequest = drawCardRequest;
              console.log('保存最后一次发送的摸牌请求:', JSON.stringify(window.lastDrawCardRequest));
              console.log('window.lastDrawCardRequest.specialEffect:', window.lastDrawCardRequest.specialEffect);
              
              // 确保window.specialEffectPlayed设置为true
              window.specialEffectPlayed = true;
              console.log('设置window.specialEffectPlayed =', window.specialEffectPlayed);
            } else {
              console.error('WebSocket连接未建立或已关闭');
              console.error('WebSocket状态:', socket ? socket.readyState : 'socket未定义');
              showGameMessage('与服务器的连接已断开，请刷新页面重试', true);
            }
          }, 500);
          
          // 不要在这里创建结束回合按钮，而是在handleCardDrawn中创建
          // 这样可以确保在摸牌后才显示结束回合按钮
        }
      }
    } else if (data.playMode === 'bus') {
      // 公交车效果已经在前面处理过了
      showGameMessage('公交车效果已生效，可以选择打出一张地铁站牌或结束回合');
    }
    
    // 只有当前玩家出牌时才创建结束回合按钮，且不是出租车特殊效果时
    if (data.playerId === localPlayerId && data.playMode !== 'taxi') {
    
      // 移除所有可能已存在的结束回合按钮
      const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
      allEndTurnBtns.forEach(btn => btn.remove());
      
      // 创建结束回合按钮
      const endTurnBtn = document.createElement('button');
      endTurnBtn.id = 'end-turn-btn';
      endTurnBtn.className = 'action-button';
      endTurnBtn.textContent = '结束回合';
      // 使用id选择器确保添加到正确的按钮容器中
      document.getElementById('action-buttons').appendChild(endTurnBtn);
      console.log('创建了结束回合按钮');
      
      // 添加结束回合按钮点击事件
      endTurnBtn.addEventListener('click', () => {
        // 移除结束回合按钮
        endTurnBtn.remove();
        
        // 重置标记
        window.metroCardPlayed = false;
        window.metroFirstCardConfirmed = false;
        window.specialEffectPlayed = false;
        window.taxiEffectActive = false;
        
        // 发送结束回合请求到服务器
        sendToServer({
          type: 'end_turn',
          roomId: roomId
        });
        
        showGameMessage('结束了回合');
      });
    }
    
    // 设置出牌模式为地铁，并标记这是特殊效果后的出牌（只能出一张）
    playMode = 'metro';
    // 确保window.specialEffectPlayed已定义，如果未定义则初始化为false
    if (window.specialEffectPlayed === undefined) {
      window.specialEffectPlayed = false;
      console.log('初始化window.specialEffectPlayed为false');
    }
    // 添加一个标记，表示这是特殊效果后的出牌，只能出一张
    window.specialEffectPlayed = true;
    // 修改提示信息，根据不同的牌类型显示不同的提示
    if (data.playerId === localPlayerId) {
      if (data.playMode === 'bus') {
        showGameMessage('公交车效果已生效，可以选择打出一张地铁站牌或结束回合');
      } else {
        showGameMessage('可以出一张地铁站牌，出完后将自动结束回合');
      }
    }
    updateButtonStates();
  } else if (data.playMode === 'metro' && data.playerId === localPlayerId) {
    // 如果是地铁牌，允许玩家选择出第二张地铁牌或结束回合
    // 检查是否已经出过一张地铁牌（第二次出牌）
    if (window.metroCardPlayed) {
      // 如果已经出过一张地铁牌，直接结束回合
      console.log('已经出过一张地铁牌，自动结束回合');
      
      // 移除所有可能存在的结束回合按钮
      const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
      allEndTurnBtns.forEach(btn => btn.remove());
      
      // 重置标记
      window.metroCardPlayed = false;
      
      // 发送结束回合请求到服务器
      sendToServer({
        type: 'end_turn',
        roomId: roomId,
        playerId: localPlayerId
      });
      
      showGameMessage('已出过地铁牌，自动结束回合');
    } else {
      // 标记已经出过一张地铁牌
      window.metroCardPlayed = true;
      
      // 向服务器发送地铁牌第一张牌的特殊消息
      sendToServer({
        type: 'metro_first_card',
        roomId: roomId,
        playerId: localPlayerId
      });
      
      console.log('向服务器发送地铁牌第一张牌的特殊消息');
      
      // 移除所有可能存在的结束回合按钮
      const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
      allEndTurnBtns.forEach(btn => btn.remove());
      
      // 创建结束回合按钮
      const endTurnBtn = document.createElement('button');
      endTurnBtn.id = 'end-turn-btn';
      endTurnBtn.className = 'action-button';
      endTurnBtn.textContent = '结束回合';
      // 使用id选择器确保添加到正确的按钮容器中
      document.getElementById('action-buttons').appendChild(endTurnBtn);
      
      // 添加结束回合按钮点击事件
      endTurnBtn.addEventListener('click', () => {
        // 移除结束回合按钮
        endTurnBtn.remove();
        
        // 重置标记
        window.metroCardPlayed = false;
        window.specialEffectPlayed = false;
        
        // 发送结束回合请求到服务器
        sendToServer({
          type: 'end_turn',
          roomId: roomId,
          playerId: localPlayerId
        });
        
        showGameMessage('结束了回合');
      });
    }
  }
  
  // 如果是特殊效果后出的地铁牌，直接结束回合
  if (isSpecialEffectPlay) {
    console.log('特殊效果后出完地铁牌，自动结束回合');
    
    // 移除所有可能存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 重置标记
    window.metroCardPlayed = false;
    window.metroFirstCardConfirmed = false;
    
    // 发送结束回合请求到服务器
    sendToServer({
      type: 'end_turn',
      roomId: roomId
    });
    
    showGameMessage('特殊效果后出完地铁牌，自动结束回合');
    return;
  }
  
  // 如果是地铁牌，允许玩家选择出第二张地铁牌或结束回合
  if (data.playMode === 'metro' && data.playerId === localPlayerId) {
    // 检查是否已经出过一张地铁牌（第二次出牌）
    if (window.metroCardPlayed) {
      // 如果已经出过一张地铁牌，直接结束回合
      console.log('已经出过一张地铁牌，自动结束回合');
      
      // 移除所有可能存在的结束回合按钮
      const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
      allEndTurnBtns.forEach(btn => btn.remove());
      
      // 重置标记
      window.metroCardPlayed = false;
      
      // 重置出牌模式
      playMode = null;
      console.log('出完第二张地铁牌，重置playMode为null');
      
      // 发送结束回合请求到服务器
      sendToServer({
        type: 'end_turn',
        roomId: roomId
      });
      
      showGameMessage('已出第二张地铁牌，自动结束回合');
      return;
    }
    
    // 标记已经出过一张地铁牌
    window.metroCardPlayed = true;
    console.log('出了第一张地铁牌，设置window.metroCardPlayed =', window.metroCardPlayed);
    
    // 防止服务器自动切换回合，发送一个特殊消息告知服务器当前玩家的回合还没有结束
    sendToServer({
      type: 'metro_first_card',
      roomId: roomId,
      playerId: localPlayerId
    });
    console.log('发送metro_first_card消息，防止回合自动结束');
    
    // 移除所有可能存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 创建结束回合按钮
    const endTurnBtn = document.createElement('button');
    endTurnBtn.id = 'end-turn-btn';
    endTurnBtn.className = 'action-button';
    endTurnBtn.textContent = '结束回合';
    // 使用id选择器确保添加到正确的按钮容器中
    document.getElementById('action-buttons').appendChild(endTurnBtn);
    
    // 添加结束回合按钮点击事件
    endTurnBtn.addEventListener('click', () => {
      // 移除结束回合按钮
      endTurnBtn.remove();
      
      // 重置标记
      window.metroCardPlayed = false;
      window.metroFirstCardConfirmed = false;
      window.specialEffectPlayed = false;
      window.taxiEffectActive = false;
      
      // 发送结束回合请求到服务器
      sendToServer({
        type: 'end_turn',
        roomId: roomId
      });
    });
    
    showGameMessage('可以选择打出第二张地铁站牌或结束回合');
  } else if (data.playMode === 'metro' && window.metroCardPlayed && data.playerId !== localPlayerId) {
    // 如果是其他玩家出的第二张地铁牌，显示相应消息
    const playerName = players.find(p => p.id === data.playerId)?.name || '玩家';
    // 不使用 lastAction 参数，避免显示"上一步: true"
    showGameMessage(`${playerName} 出了第二张地铁牌`);
    
    // 重置出牌模式，确保下一个玩家不受限制
    playMode = null;
    console.log('其他玩家出了第二张地铁牌，重置playMode为null');
  }
}

/**
 * 处理回合结束消息
 */
function handleTurnEnded(data) {
  // 更新当前玩家ID
  currentPlayerId = data.currentPlayerId;
  
  // 确保所有特殊效果标记已定义
  if (window.metroCardPlayed === undefined) {
    window.metroCardPlayed = false;
    console.log('初始化window.metroCardPlayed为false');
  }
  if (window.specialEffectPlayed === undefined) {
    window.specialEffectPlayed = false;
    console.log('初始化window.specialEffectPlayed为false');
  }
  if (window.taxiEffectActive === undefined) {
    window.taxiEffectActive = false;
    console.log('初始化window.taxiEffectActive为false');
  }
  
  // 清除所有特殊效果标记
  window.metroCardPlayed = false;
  
  // 重置出牌模式，确保下一个玩家不受限制
  playMode = null;
  console.log('回合结束，重置playMode为null');
  window.specialEffectPlayed = false;
  window.taxiEffectActive = false;
  
  // 重置出牌模式
  playMode = null;
  console.log('回合结束，重置playMode为null');
  
  // 移除所有可能存在的结束回合按钮
  const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
  allEndTurnBtns.forEach(btn => btn.remove());
  
  // 更新游戏信息
  updateGameInfo();
  
  // 更新按钮状态
  updateButtonStates();
  
  // 显示回合结束消息
  const previousPlayer = players.find(p => p.id === data.previousPlayerId)?.name || '玩家';
  const currentPlayer = players.find(p => p.id === data.currentPlayerId)?.name || '玩家';
  const isLocalPlayerTurn = data.currentPlayerId === localPlayerId;
  
  if (isLocalPlayerTurn) {
    showGameMessage(`${previousPlayer} 结束了回合，现在轮到你了`);
  } else {
    showGameMessage(`${previousPlayer} 结束了回合，现在轮到 ${currentPlayer} 了`);
  }
}

/**
 * 处理地铁牌第一张牌的特殊消息
 */
function handleMetroFirstCardPlayed(data) {
  // 获取出牌玩家信息
  const player = players.find(p => p.id === data.playerId);
  const playerName = player ? player.name : '玩家';
  
  // 如果是当前玩家出的第一张地铁牌，更新状态
  if (data.playerId === localPlayerId) {
    // 标记已经出过一张地铁牌
    window.metroCardPlayed = true;
    // 标记服务器已确认第一张地铁牌
    window.metroFirstCardConfirmed = true;
    console.log('收到metro_first_card_played消息，设置window.metroCardPlayed =', window.metroCardPlayed);
    console.log('收到metro_first_card_played消息，设置window.metroFirstCardConfirmed =', window.metroFirstCardConfirmed);
    
    // 显示消息
    showGameMessage('你出了第一张地铁牌，可以继续出第二张或结束回合');
  } else {
    // 显示其他玩家出了第一张地铁牌的消息
    showGameMessage(`${playerName} 出了第一张地铁牌，可以继续出第二张或结束回合`);
  }
  
  // 更新按钮状态
  updateButtonStates();
}

/**
 * 处理玩家摸牌消息（其他玩家摸牌）
 */
function handlePlayerDrewCard(data) {
  console.log('收到其他玩家摸牌消息:', JSON.stringify(data));
  
  // 检查是否是出租车特殊效果摸的牌
  const isTaxiEffect = data.specialEffect === 'taxi';
  
  if (isTaxiEffect) {
    console.log('出租车特殊效果：其他玩家摸了一张牌，不切换回合');
    
    // 更新游戏信息，确保UI显示正确的当前回合玩家
    updateGameInfo();
    
    // 更新玩家列表UI
    updatePlayersListUI();
    
    // 更新按钮状态
    updateButtonStates();
    
    // 显示摸牌消息，但不提示回合结束
    const playerName = players.find(p => p.id === data.playerId)?.name || '玩家';
    showGameMessage(`${playerName} 使用出租车效果摸了一张牌，可以继续出一张地铁站牌`);
    
    return;
  }
  
  // 保存之前的当前玩家ID，用于显示回合结束消息
  const previousPlayerId = data.playerId;
  const previousPlayerName = players.find(p => p.id === previousPlayerId)?.name || '玩家';
  
  console.log('其他玩家摸牌：准备切换回合，之前玩家ID:', previousPlayerId);
  
  // 更新当前玩家
  currentPlayerId = data.currentPlayerId;
  console.log('更新当前玩家ID为:', currentPlayerId);
  
  const currentPlayerName = players.find(p => p.id === currentPlayerId)?.name || '玩家';
  const isLocalPlayerTurn = currentPlayerId === localPlayerId;
  
  console.log('其他玩家摸牌：切换回合，新的当前玩家ID:', currentPlayerId);
  
  // 更新牌堆剩余数量
  deckCountElement.textContent = `牌堆剩余: ${data.remainingDeckCount}`;
  
  // 如果是其他玩家摸的牌，更新他们的手牌数量
  const playerIndex = players.findIndex(p => p.id === previousPlayerId);
  if (playerIndex !== -1) {
    players[playerIndex].cards = players[playerIndex].cards || [];
    players[playerIndex].cards.length = data.remainingCards;
  }
  
  // 更新游戏信息
  updateGameInfo();
  
  // 更新玩家列表UI
  updatePlayersListUI();
  
  // 更新按钮状态
  updateButtonStates();
  
  // 显示摸牌消息
  showGameMessage(`${previousPlayerName} 摸了一张牌`);
  
  // 显示回合切换消息
  if (isLocalPlayerTurn) {
    showGameMessage(`${previousPlayerName} 摸牌后回合结束，现在轮到你了`);
  } else {
    showGameMessage(`${previousPlayerName} 摸牌后回合结束，现在轮到 ${currentPlayerName} 了`);
  }
}

/**
 * 处理摸牌消息（当前玩家摸牌）
 */
function handleCardDrawn(data) {
  console.log('收到摸牌消息:', JSON.stringify(data));
  
  // 使用drawCard函数处理服务器发送的卡牌
  drawCard('player', data.card);
  
  // 更新牌堆剩余数量
  deckCountElement.textContent = `牌堆剩余: ${data.remainingDeckCount}`;
  
  // 渲染卡牌
  renderCards();
  
  // 检查是否是出租车特殊效果摸的牌
  const isTaxiEffect = data.specialEffect === 'taxi';
  
  if (isTaxiEffect) {
    console.log('出租车特殊效果：摸了一张牌，不切换回合');
    
    // 设置出租车效果激活标记
    window.taxiEffectActive = true;
    window.specialEffectPlayed = true; // 确保特殊效果标记被设置
    
    console.log('设置window.taxiEffectActive =', window.taxiEffectActive);
    console.log('设置window.specialEffectPlayed =', window.specialEffectPlayed);
    
    // 更新游戏信息，确保UI显示正确的当前回合玩家
    updateGameInfo();
    
    // 更新玩家列表UI
    updatePlayersListUI();
    
    // 更新按钮状态
    updateButtonStates();
    
    // 显示摸牌消息
    showGameMessage('你使用出租车牌摸了一张牌，可以继续出一张地铁站牌');
    
    // 移除所有可能已存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 创建结束回合按钮
    const endTurnBtn = document.createElement('button');
    endTurnBtn.id = 'end-turn-btn';
    endTurnBtn.className = 'action-button';
    endTurnBtn.textContent = '结束回合';
    document.getElementById('action-buttons').appendChild(endTurnBtn);
    
    // 添加结束回合按钮点击事件
    endTurnBtn.addEventListener('click', () => {
      // 移除结束回合按钮
      endTurnBtn.remove();
      
      // 重置标记
      window.metroCardPlayed = false;
      window.metroFirstCardConfirmed = false;
      window.specialEffectPlayed = false;
      window.taxiEffectActive = false;
      
      console.log('重置window.metroCardPlayed =', window.metroCardPlayed);
      console.log('重置window.specialEffectPlayed =', window.specialEffectPlayed);
      console.log('重置window.taxiEffectActive =', window.taxiEffectActive);
      
      // 发送结束回合请求到服务器
      sendToServer({
        type: 'end_turn',
        roomId: roomId
      });
      
      showGameMessage('结束了回合');
    });
    
    // 设置出牌模式为地铁，并标记这是特殊效果后的出牌（只能出一张）
    playMode = 'metro';
    
    return;
  }
  
  // 保存当前玩家ID（即摸牌的玩家，也就是本地玩家）
  const previousPlayerId = localPlayerId;
  console.log('普通摸牌：准备切换回合，当前玩家ID:', previousPlayerId);
  
  // 计算下一个玩家ID（服务器不会在card_drawn消息中发送currentPlayerId）
  // 找到当前玩家在players数组中的索引
  const currentPlayerIndex = players.findIndex(p => p.id === localPlayerId);
  // 计算下一个玩家的索引（循环到数组开头）
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  // 更新当前玩家ID为下一个玩家
  currentPlayerId = players[nextPlayerIndex].id;
  
  console.log('普通摸牌：切换回合，新的当前玩家ID:', currentPlayerId);
  
  // 获取下一个玩家的名称
  const nextPlayer = players[nextPlayerIndex];
  const nextPlayerName = nextPlayer ? nextPlayer.name : '其他玩家';
  
  // 更新游戏信息，确保UI显示正确的当前回合玩家
  updateGameInfo();
  
  // 更新玩家列表UI
  updatePlayersListUI();
  
  // 更新按钮状态
  updateButtonStates();
  
  // 显示摸牌消息
  showGameMessage('你摸了一张牌');
  
  // 显示回合结束消息 - 这里不再判断isLocalPlayerTurn，因为摸牌后回合一定会切换到其他玩家
  showGameMessage(`你摸牌后回合结束，现在轮到 ${nextPlayerName} 了`);
}

/**
 * 处理游戏结束消息
 */
function handleGameOver(data) {
  gameOver = true;
  
  // 更新UI
  const winnerName = data.winner.name;
  const isLocalPlayerWin = data.winner.id === localPlayerId;
  
  // 显示游戏结果
  gameResultElement.innerHTML = `
    <h2>${isLocalPlayerWin ? '恭喜你获胜！' : `${winnerName} 获胜了！`}</h2>
    <div class="game-stats">
      <h3>游戏统计</h3>
      <p>总共出牌数: ${gameStats.totalCards}</p>
      <p>经过地铁站数: ${gameStats.metroStations}</p>
      <p>乘坐出租车次数: ${gameStats.taxiRides}</p>
      <p>乘坐公交车次数: ${gameStats.busRides}</p>
    </div>
  `;
  
  gameResultElement.className = isLocalPlayerWin ? 'game-result win' : 'game-result lose';
  gameResultElement.style.display = 'block';
  
  // 禁用所有游戏按钮
  playMetroBtn.disabled = true;
  playTaxiBtn.disabled = true;
  playBusBtn.disabled = true;
  drawCardBtn.disabled = true;
  cancelSelectionBtn.disabled = true;
  
  showGameMessage(`游戏结束，${winnerName} 获胜！`);
}

/**
 * 处理房间列表消息
 */
function handleRoomList(data) {
  const rooms = data.rooms;
  
  if (rooms.length === 0) {
    availableGamesElement.innerHTML = '<div class="player-list-item">没有可用的游戏</div>';
    return;
  }
  
  let roomsHtml = '';
  rooms.forEach(room => {
    roomsHtml += `
      <div class="player-list-item">
        <span>${room.id} (${room.host})</span>
        <span>${room.players}/4 玩家</span>
        <button class="action-button join-room-btn" data-room-id="${room.id}">加入</button>
      </div>
    `;
  });
  
  availableGamesElement.innerHTML = roomsHtml;
  
  // 添加加入房间按钮点击事件
  document.querySelectorAll('.join-room-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const roomId = btn.getAttribute('data-room-id');
      joinRoom(roomId);
    });
  });
}

/**
 * 加入房间
 * @param {string} roomId 房间ID
 */
function joinRoom(roomId) {
  console.log('执行joinRoom函数，房间ID:', roomId);
  
  // 检查玩家名称
  console.log('检查玩家名称，localPlayerName:', localPlayerName);
  if (!localPlayerName) {
    console.error('错误: 玩家名称为空');
    alert('请输入你的名字');
    return;
  }
  
  // 生成本地玩家ID（如果尚未生成）
  if (!localPlayerId) {
    localPlayerId = 'player_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    console.log('生成新的本地玩家ID:', localPlayerId);
  } else {
    console.log('使用现有本地玩家ID:', localPlayerId);
  }
  
  // 如果WebSocket未连接，先初始化连接
  console.log('当前WebSocket连接状态 isConnected:', isConnected);
  if (!isConnected) {
    console.log('WebSocket未连接，初始化连接');
    initializeWebSocket(localPlayerName);
    
    // 等待连接成功后发送加入房间请求
    console.log('设置定时器等待连接建立');
    const checkConnectionInterval = setInterval(() => {
      console.log('检查WebSocket连接状态 isConnected:', isConnected);
      if (isConnected) {
        clearInterval(checkConnectionInterval);
        console.log('WebSocket连接已建立，发送加入房间请求');
        
        // 发送加入房间请求
        sendToServer({
          type: 'join_room',
          roomId: roomId,
          playerName: localPlayerName,
          playerId: localPlayerId
        });
      }
    }, 100);
  } else {
    // 直接发送加入房间请求
    console.log('WebSocket已连接，直接发送加入房间请求');
    sendToServer({
      type: 'join_room',
      roomId: roomId,
      playerName: localPlayerName,
      playerId: localPlayerId
    });
  }
  
  console.log('joinRoom函数执行完毕');
}

/**
 * 处理AI玩家添加消息
 */
function handleAIAdded(data) {
  players = data.players;
  
  // 更新已加入玩家列表
  updateJoinedPlayersList();
  
  // 如果是房主，当玩家数量达到2人或以上时启用开始游戏按钮
  if (isHost) {
    startGameBtn.disabled = players.length < 2;
  }
  
  showGameMessage(`AI玩家 ${data.player.name} 已添加`);
}

/**
 * 初始化游戏
 */
function initializeGame() {
  // 重置游戏状态
  playerHand = [];
  aiHand = [];
  tableCards = [];
  selectedCards = [];
  playMode = null;
  currentTurn = 'player';
  gameOver = false;
  
  // 重置出牌次数标记
  window.metroCardPlayed = false;
  window.specialEffectPlayed = false;
  window.taxiEffectActive = false; // 新增标记，用于区分出租车特殊效果
  
  // 重置游戏统计数据
  gameStats = {
    totalCards: 0,
    metroStations: 0,
    taxiRides: 0,
    busRides: 0
  };
  
  // 隐藏游戏结果
  gameResultElement.style.display = 'none';
  
  // 设置AI手牌区域可见性
  // 在多人游戏模式下始终隐藏AI手牌区域，只有在单人模式且开启调试模式时才显示
  if (aiHandElement) {
    aiHandElement.style.display = (gameStarted && players.length > 0) ? 'none' : (debugMode ? 'flex' : 'none');
  }
  
  // 如果是多人游戏模式，服务器会处理牌组创建和发牌
  if (gameStarted && players.length > 0) {
    return;
  }
  
  // 单人游戏模式下的初始化
  // 创建牌组
  const deck = createDeck();
  
  // 洗牌
  const shuffledDeck = shuffleArray(deck);
  
  // 从洗牌后的牌组中选择一张地铁站牌作为初始桌面牌
  const initialTableCardIndex = shuffledDeck.findIndex(card => card.type === CARD_TYPE.STATION);
  if (initialTableCardIndex !== -1) {
    // 将这张牌从牌组中移除
    const initialTableCard = shuffledDeck.splice(initialTableCardIndex, 1)[0];
    
    // 放到桌面上
    tableCards = [initialTableCard];
  }
  
  // 单人游戏模式下，给玩家和AI各发8张牌
  for (let i = 0; i < 8; i++) {
    if (shuffledDeck.length > 0) {
      playerHand.push(shuffledDeck.pop());
    }
    
    if (shuffledDeck.length > 0) {
      aiHand.push(shuffledDeck.pop());
    }
  }
  
  // 如果是双人游戏，设置AI手牌
  if (players.length === 2) {
    const otherPlayer = players.find(player => player.id !== localPlayerId);
    if (otherPlayer) {
      aiHand = otherPlayer.cards || [];
    } else {
      aiHand = []; // 确保aiHand始终是一个数组
    }
  } else {
    aiHand = []; // 如果不是双人游戏，确保aiHand是一个空数组
  }
  
  // 设置当前玩家
  currentPlayerId = players[0].id;
  currentTurn = currentPlayerId === localPlayerId ? 'player' : 'ai';
  // } else {
  //   // 单人游戏模式，直接发牌给玩家和AI
  //   playerHand = shuffledDeck.slice(0, 8);
  //   aiHand = shuffledDeck.slice(8, 16);
  // }
  
  // 更新UI
  updateGameInfo();
  renderCards();
  updateButtonStates();
  updatePlayersListUI();
  
  // 如果处于调试模式，更新调试信息
  if (debugMode) {
    updateDebugInfo();
  }
  
  // 显示游戏开始消息
  showGameMessage('游戏开始！请选择一种出牌方式');
}

/**
 * 创建牌组
 * @returns {Array} 创建的牌组
 */
function createDeck() {
  // 筛选cardmode为1的地铁站牌
  const stationCards = metroData.stations
    .filter(station => station.cardmode === 1)
    .map(station => ({
      type: CARD_TYPE.STATION,
      name: station.name,
      lines: station.lines
    }));
  
  // 创建出租车牌（5张）
  const taxiCards = Array(5).fill().map(() => ({
    type: CARD_TYPE.TAXI,
    name: '出租车',
    description: '可以连接任意两个地铁站，即使它们没有共同线路'
  }));
  
  // 创建公交车牌（5张）
  const busCards = Array(5).fill().map(() => ({
    type: CARD_TYPE.BUS,
    name: '公交车',
    description: '可以跳过一个站点进行连接'
  }));
  
  // 合并所有牌并返回
  return [...stationCards, ...taxiCards, ...busCards];
}

/**
 * 给玩家分发手牌
 * @param {Array} deck 牌组
 * @param {Array} players 玩家列表
 * @param {number} cardsPerPlayer 每个玩家分发的牌数
 */
function dealCards(deck, players, cardsPerPlayer) {
  // 确保牌组有足够的牌
  if (deck.length < players.length * cardsPerPlayer) {
    console.warn('牌组中的牌不足以分发给所有玩家');
    return;
  }
  
  // 给每个玩家分发指定数量的牌
  for (let i = 0; i < players.length; i++) {
    const startIndex = i * cardsPerPlayer;
    const playerCards = deck.slice(startIndex, startIndex + cardsPerPlayer);
    players[i].cards = playerCards;
  }
  
  // 从牌组中移除已分发的牌
  deck.splice(0, players.length * cardsPerPlayer);
}

/**
 * 洗牌算法
 * @param {Array} array 要洗牌的数组
 * @returns {Array} 洗牌后的数组
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 出牌按钮
  playMetroBtn.addEventListener('click', () => handlePlayMode('metro'));
  playTaxiBtn.addEventListener('click', () => handlePlayMode('taxi'));
  playBusBtn.addEventListener('click', () => handlePlayMode('bus'));
  
  // 摸牌按钮
  drawCardBtn.addEventListener('click', handleDrawCard);
  
  // 取消选择按钮
  cancelSelectionBtn.addEventListener('click', cancelSelection);
  
  // 新游戏按钮
  newGameBtn.addEventListener('click', initializeGame);
}

/**
 * 发送消息到服务器
 * @deprecated 使用 sendToPeers 替代
 */
function sendToServer(message) {
  // 转发到 sendToPeers 函数
  sendToPeers(message);
}

/**
 * 设置多人游戏事件监听器
 */
function setupMultiplayerEventListeners() {
  // 创建游戏按钮
  createGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      alert('请输入你的名字');
      return;
    }
    
    localPlayerName = playerName;
    
    // 初始化WebRTC连接作为主机
    initializeWebRTC(playerName);
    
    // 不在这里调用showWaitingRoom，而是等待room_created回调中调用
    // showWaitingRoom();
    console.log('已初始化WebRTC连接，等待room_created回调...');
  });
 
  
  // 加入游戏按钮
  joinGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      alert('请输入你的名字');
      return;
    }
    
    localPlayerName = playerName;
    
    // 显示可用游戏列表
    joinGamePanelElement.style.display = 'block';
    
    // 初始化WebSocket连接
    initializeWebSocket(playerName);
    
    // 连接成功后获取房间列表
    const checkConnectionInterval = setInterval(() => {
      if (isConnected) {
        clearInterval(checkConnectionInterval);
        
        // 发送获取房间列表请求
        sendToServer({
          type: 'get_rooms'
        });
      }
    }, 100);
  });
  
  // 刷新游戏列表按钮
  refreshGamesBtn.addEventListener('click', () => {
    availableGamesElement.innerHTML = '<div class="player-list-item">正在搜索游戏...</div>';
    
    // 发送获取房间列表请求
    sendToServer({
      type: 'get_rooms'
    });
  });
  
  // 添加AI玩家按钮
  document.getElementById('add-ai-btn').addEventListener('click', () => {
    if (players.length >= 4) {
      alert('房间已满');
      return;
    }
    
    // 发送添加AI玩家请求
    sendToServer({
      type: 'add_ai',
      roomId: roomId
    });
  });
  
  // 开始游戏按钮
  startGameBtn.addEventListener('click', () => {
    if (players.length < 2) {
      alert('至少需要2名玩家才能开始游戏');
      return;
    }
    
    // 发送开始游戏请求
    sendToServer({
      type: 'start_game',
      roomId: roomId
    });
  });
  
  // 游戏内按钮
  setupEventListeners();
}

/**
 * 处理创建游戏
 */
function handleCreateGame() {
  // 检查玩家名称
  localPlayerName = playerNameInput.value.trim();
  if (!localPlayerName) {
    alert('请输入你的名字');
    return;
  }
  
  // 设置为房主
  isHost = true;
  
  // 生成房间ID（简单实现，实际应用中可能需要更复杂的逻辑）
  roomId = 'room_' + Math.floor(Math.random() * 10000);
  
  // 添加本地玩家
  localPlayerId = 'player_' + Math.floor(Math.random() * 10000);
  players = [{
    id: localPlayerId,
    name: localPlayerName,
    isHost: true,
    cards: []
  }];
  
  // 显示等待室
  showWaitingRoom();
  
  // 不再自动添加AI玩家，改为手动点击按钮添加
}

/**
 * 处理加入游戏按钮点击
 */
function handleJoinGameClick() {
  // 检查玩家名称
  localPlayerName = playerNameInput.value.trim();
  if (!localPlayerName) {
    alert('请输入你的名字');
    return;
  }
  
  // 显示可用游戏列表
  joinGamePanelElement.style.display = 'block';
  waitingRoomElement.style.display = 'none';
  
  // 刷新可用游戏列表
  refreshAvailableGames();
}

/**
 * 刷新可用游戏列表
 */
function refreshAvailableGames() {
  // 清空现有列表
  availableGamesElement.innerHTML = '';
  
  // 显示加载中
  const loadingItem = document.createElement('div');
  loadingItem.className = 'player-list-item';
  loadingItem.textContent = '正在搜索局域网内的游戏...';
  availableGamesElement.appendChild(loadingItem);
  
  // 模拟搜索延迟
  setTimeout(() => {
    // 清空加载提示
    availableGamesElement.innerHTML = '';
    
    // 模拟找到的游戏（实际应用中应该通过网络发现）
    const mockGames = [
      { id: 'room_1234', host: '玩家A', players: 1 },
      { id: 'room_5678', host: '玩家B', players: 2 }
    ];
    
    if (mockGames.length === 0) {
      const noGamesItem = document.createElement('div');
      noGamesItem.className = 'player-list-item';
      noGamesItem.textContent = '没有找到可用的游戏';
      availableGamesElement.appendChild(noGamesItem);
    } else {
      // 显示找到的游戏
      mockGames.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'player-list-item';
        gameItem.innerHTML = `
          <span>${game.host}的游戏 (${game.players}人)</span>
          <button class="action-button join-room-btn">加入</button>
        `;
        availableGamesElement.appendChild(gameItem);
        
        // 添加加入按钮点击事件
        const joinBtn = gameItem.querySelector('.join-room-btn');
        joinBtn.addEventListener('click', () => handleJoinGame(game.id));
      });
    }
  }, 1000);
}

/**
 * 处理加入游戏
 * @param {string} gameId 游戏ID
 */
function handleJoinGame(gameId) {
  // 设置房间ID
  roomId = gameId;
  isHost = false;
  
  // 生成本地玩家ID
  localPlayerId = 'player_' + Math.floor(Math.random() * 10000);
  
  // 模拟获取房间信息（实际应用中应该通过网络获取）
  players = [
    { id: 'host_id', name: '房主', isHost: true, cards: [] },
    { id: localPlayerId, name: localPlayerName, isHost: false, cards: [] }
  ];
  
  // 显示等待室
  showWaitingRoom();
}

/**
 * 显示等待室
 */
function showWaitingRoom() {
  isInWaitingRoom = true;
  joinGamePanelElement.style.display = 'none';
  waitingRoomElement.style.display = 'block';
  
  // 更新玩家列表
  updateJoinedPlayersList();
  
  // 如果是房主，启用开始游戏按钮和添加AI按钮
  if (isHost) {
    startGameBtn.disabled = players.length < 2;
    startGameBtn.textContent = `开始游戏 (${players.length}/2-4名玩家)`;
    
    // 显示添加AI按钮
    document.getElementById('add-ai-btn').style.display = 'inline-block';
    document.getElementById('add-ai-btn').disabled = players.length >= 4;
  } else {
    startGameBtn.disabled = true;
    startGameBtn.textContent = '等待房主开始游戏';
    
    // 隐藏添加AI按钮
    document.getElementById('add-ai-btn').style.display = 'none';
  }
}

/**
 * 更新已加入玩家列表
 */
function updateJoinedPlayersList() {
  console.log('执行updateJoinedPlayersList函数');
  console.log('joinedPlayersElement:', joinedPlayersElement);
  console.log('当前players数组:', players);
  
  if (!joinedPlayersElement) {
    console.error('错误: joinedPlayersElement 元素不存在!');
    return;
  }
  
  joinedPlayersElement.innerHTML = '';
  console.log('已清空joinedPlayersElement内容');
  
  players.forEach((player, index) => {
    console.log(`处理玩家 ${index}:`, player);
    const playerItem = document.createElement('div');
    playerItem.className = 'player-list-item';
    playerItem.innerHTML = `
      <span>${player.name}${player.isHost ? ' (房主)' : ''}</span>
      <span class="connection-status connected"></span>
    `;
    joinedPlayersElement.appendChild(playerItem);
    console.log(`已添加玩家 ${player.name} 到列表`);
  });
  
  console.log('updateJoinedPlayersList函数执行完毕，最终HTML:', joinedPlayersElement.innerHTML);
}

/**
 * 添加AI玩家
 */
function addAIPlayer() {
  // 检查是否已达到最大玩家数量限制
  if (players.length >= 4) {
    alert('已达到最大玩家数量限制(4人)');
    return;
  }
  
  // 创建AI玩家
  const aiPlayer = {
    id: 'ai_player_' + Math.floor(Math.random() * 10000),
    name: 'AI玩家' + (players.length),
    isHost: false,
    isAI: true,
    cards: []
  };
  
  // 添加到玩家列表
  players.push(aiPlayer);
  updateJoinedPlayersList();
  
  // 更新开始游戏按钮状态
  startGameBtn.disabled = players.length < 2;
  startGameBtn.textContent = `开始游戏 (${players.length}/${players.length >= 4 ? '4' : '2-4'}名玩家)`;
  
  // 如果已达到最大玩家数量，禁用添加AI按钮
  if (players.length >= 4) {
    document.getElementById('add-ai-btn').disabled = true;
  }
}

/**
 * 处理开始游戏
 */
function handleStartGame() {
  // 检查是否是房主且玩家数量在2-4人之间
  if (!isHost || players.length < 2 || players.length > 4) return;
  
  // 隐藏设置面板，显示游戏界面
  // 不隐藏整个setupPanelElement，因为waitingRoomElement是它的子元素
  // 隐藏设置面板中的其他元素
  document.querySelectorAll('#setup-panel > *:not(#waiting-room)').forEach(el => {
    if (el.id !== 'waiting-room') {
      el.style.display = 'none';
    }
  });
  gameContainerElement.style.display = 'block';
  
  // 初始化游戏
  gameStarted = true;
  isInWaitingRoom = false;
  initializeGame();
  
  // 更新玩家列表UI
  updatePlayersListUI();
}

/**
 * 更新玩家列表UI
 */
function updatePlayersListUI() {
  playersListElement.innerHTML = '';
  
  players.forEach(player => {
    const playerInfo = document.createElement('div');
    playerInfo.className = 'player-info';
    if (player.id === currentPlayerId) {
      playerInfo.classList.add('current-player');
    }
    
    // 确保cards数组存在并且是数组
    const cardsCount = player.cards && Array.isArray(player.cards) ? player.cards.length : 0;
    
    // 如果是本地玩家，使用playerHand的长度作为备用
    const displayCount = player.id === localPlayerId && playerHand.length > 0 ? playerHand.length : cardsCount;
    
    playerInfo.innerHTML = `
      <div class="player-avatar">${player.name.charAt(0)}</div>
      <div class="player-name">${player.name}${player.id === localPlayerId ? ' (你)' : ''}</div>
      <div class="player-cards-count">剩余: ${displayCount}张</div>
    `;
    
    // 如果是当前玩家，添加计时器
    if (player.id === currentPlayerId) {
      const timerBar = document.createElement('div');
      timerBar.className = 'timer-bar';
      timerBar.innerHTML = '<div class="timer-progress"></div>';
      playerInfo.appendChild(timerBar);
    }
    
    playersListElement.appendChild(playerInfo);
  });
}

/**
 * 处理出牌模式选择
 * @param {string} mode 出牌模式
 */
function handlePlayMode(mode) {
  // 判断是否是当前玩家的回合
  let isPlayerTurn = false;
  
  if (gameStarted && players.length > 0) {
    // 多人游戏模式：检查当前玩家ID是否是本地玩家ID
    isPlayerTurn = currentPlayerId === localPlayerId;
  } else {
    // 单人游戏模式：使用currentTurn变量
    isPlayerTurn = currentTurn === 'player';
  }
  
  // 如果不是当前玩家的回合或游戏已结束，不允许选择出牌模式
  if (!isPlayerTurn || gameOver) {
    if (gameStarted && players.length > 0 && !gameOver) {
      // 在多人游戏模式下显示错误提示
      showGameMessage('错误：不是你的回合');
    }
    return;
  }
  
  // 如果已经选择了牌，则执行出牌操作
  if (selectedCards.length > 0) {
    // 检查选中的牌类型是否与模式匹配
    const selectedCardType = selectedCards[0].card.type;
    if ((mode === 'metro' && selectedCardType === CARD_TYPE.STATION) ||
        (mode === 'taxi' && selectedCardType === CARD_TYPE.TAXI) ||
        (mode === 'bus' && selectedCardType === CARD_TYPE.BUS)) {
      // 设置出牌模式
      playMode = mode;
      handlePlayerPlay();
      return;
    }
  }
  
  // 设置出牌模式
  playMode = mode;
  updateButtonStates();
  
  // 根据模式显示提示信息
  let message = '';
  switch (mode) {
    case 'metro':
      message = '请选择要出的地铁站牌';
      break;
    case 'taxi':
      message = '请选择要出的出租车牌';
      break;
    case 'bus':
      message = '请选择要出的公交车牌';
      break;
  }
  
  showGameMessage(message);
}

/**
 * 处理玩家选择卡牌
 * @param {Object} card 选择的卡牌
 * @param {number} index 卡牌在手牌中的索引
 */
function handleCardSelection(card, index) {
  // 判断是否是当前玩家的回合
  let isPlayerTurn = false;
  
  if (gameStarted && players.length > 0) {
    // 多人游戏模式：检查当前玩家ID是否是本地玩家ID
    isPlayerTurn = currentPlayerId === localPlayerId;
  } else {
    // 单人游戏模式：使用currentTurn变量
    isPlayerTurn = currentTurn === 'player';
  }
  
  // 如果不是当前玩家的回合或游戏已结束，不允许选择卡牌
  if (!isPlayerTurn || gameOver) {
    if (gameStarted && players.length > 0 && !gameOver) {
      // 在多人游戏模式下显示错误提示
      showGameMessage('错误：不是你的回合');
    }
    return;
  }
  
  // 检查是否符合当前出牌模式
  if (playMode === 'metro' && card.type !== CARD_TYPE.STATION) {
    showGameMessage('请选择地铁站牌');
    return;
  } else if (playMode === 'taxi' && card.type !== CARD_TYPE.TAXI) {
    showGameMessage('请选择出租车牌');
    return;
  } else if (playMode === 'bus' && card.type !== CARD_TYPE.BUS) {
    showGameMessage('请选择公交车牌');
    return;
  }
  
  // 检查是否已经选择了这张牌
  const cardElement = document.querySelector(`#player-card-${index}`);
  if (cardElement.classList.contains('selected')) {
    // 取消选择
    cardElement.classList.remove('selected');
    selectedCards = selectedCards.filter(c => c.index !== index);
  } else {
    // 取消所有已选择的牌，确保同一时间只能选中一张牌
    document.querySelectorAll('.card.selected').forEach(el => {
      el.classList.remove('selected');
    });
    selectedCards = [];
    
    // 选择新牌
    cardElement.classList.add('selected');
    selectedCards.push({ card, index });
  }
  
  // 更新按钮状态
  updateButtonStates();
  
  // 检查是否可以出牌
  if (selectedCards.length > 0) {
    drawCardBtn.disabled = true;
    showGameMessage(`已选择 ${selectedCards.length} 张牌，点击相应按钮出牌`);
  } else {
    drawCardBtn.disabled = false;
    showGameMessage('请选择要出的牌');
  }
}

/**
 * 处理玩家出牌
 */
function handlePlayerPlay() {
  if (selectedCards.length === 0) return;
  
  // 判断是否是当前玩家的回合
  let isPlayerTurn = false;
  
  if (gameStarted && players.length > 0) {
    // 多人游戏模式：检查当前玩家ID是否是本地玩家ID
    isPlayerTurn = currentPlayerId === localPlayerId;
  } else {
    // 单人游戏模式：使用currentTurn变量
    isPlayerTurn = currentTurn === 'player';
  }
  
  // 如果不是当前玩家的回合或游戏已结束，不允许出牌
  // 但是如果是出第二张地铁牌的特殊情况（且已收到服务器确认）或出租车特殊效果激活，则允许出牌
  if ((!isPlayerTurn && !(window.metroCardPlayed && window.metroFirstCardConfirmed) && !window.taxiEffectActive) || gameOver) {
    if (gameStarted && players.length > 0 && !gameOver) {
      // 在多人游戏模式下显示错误提示
      showGameMessage('错误：不是你的回合');
    }
    return;
  }
  
  // 获取选中的牌
  const cardsToPlay = selectedCards.map(c => c.card);
  
  // 检查是否符合出牌规则
  if (!isValidPlay(cardsToPlay, playMode)) {
    showGameMessage('出牌不符合规则，请重新选择');
    return;
  }
  
  // 如果是多人游戏模式，通过WebSocket发送出牌请求
  if (gameStarted && players.length > 0) {
    // 从玩家手牌中移除选中的牌
    selectedCards.forEach(selected => {
      const index = playerHand.findIndex(card => 
        card.type === selected.card.type && 
        (card.type !== CARD_TYPE.STATION || card.name === selected.card.name)
      );
      if (index !== -1) {
        playerHand.splice(index, 1);
      }
    });
    
    // 发送出牌请求到服务器
    sendToServer({
      type: 'play_card',
      roomId: roomId,
      playerId: localPlayerId,
      cards: cardsToPlay,
      playMode: playMode
    });
    
    // 清空选中的牌
    selectedCards = [];
    
    // 更新UI
    renderCards();
    updateButtonStates();
    
    return;
  }
  
  // 单人游戏模式下的处理逻辑
  // 处理特殊牌效果
  let effectMessage = '';
  let specialAction = false;
  
  // 根据出牌模式设置特殊效果
  if (playMode === 'metro') {
    // 地铁牌特殊效果：可以连续出两张地铁牌
    effectMessage = '可以选择打出第二张地铁站牌';
    specialAction = true;
    console.log('地铁牌特殊效果已触发，specialAction =', specialAction);
  } else if (playMode === 'taxi') {
    // 出租车牌特殊效果：出牌后摸一张牌并可选择打出一张地铁牌
    effectMessage = '出租车可以连接任意两个地铁站！摸一张牌后可以选择打出一张地铁牌';
    specialAction = true;
    // 设置特殊效果标记，表示这是特殊效果后的出牌，只能出一张地铁牌
    window.specialEffectPlayed = true;
    window.taxiEffectActive = true; // 设置出租车特殊效果标记
    console.log('出租车特殊效果已触发，specialAction =', specialAction);
  } else if (playMode === 'bus') {
    // 公交车牌特殊效果：交换最后两张地铁站牌的位置
    // 首先检查是否有足够的地铁站牌在桌面上
    const stationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION);
    if (stationCards.length >= 2) {
      // 找到最后一张和倒数第二张地铁站牌
      const lastStationIndices = [];
      for (let i = tableCards.length - 1; i >= 0; i--) {
        if (tableCards[i].type === CARD_TYPE.STATION) {
          lastStationIndices.push(i);
          if (lastStationIndices.length === 2) break;
        }
      }
      
      if (lastStationIndices.length === 2) {
        // 获取最后一张和倒数第二张地铁站牌的索引
        const lastStationIndex = lastStationIndices[0];
        const secondLastStationIndex = lastStationIndices[1];
        
        // 交换这两张地铁站牌
        const lastStation = tableCards[lastStationIndex];
        const secondLastStation = tableCards[secondLastStationIndex];
        
        // 执行交换
        tableCards[lastStationIndex] = secondLastStation;
        tableCards[secondLastStationIndex] = lastStation;
        
        effectMessage = `公交车交换了${lastStation.name}站和${secondLastStation.name}站的位置！可以选择打出一张地铁牌`;
        specialAction = true; // 公交车也设置为特殊行动，允许继续出一张地铁牌
        console.log('公交车特殊效果已触发，specialAction =', specialAction);
        // 设置特殊效果标记，表示这是特殊效果后的出牌，只能出一张地铁牌
        window.specialEffectPlayed = true;
      } else {
        effectMessage = '公交车效果：无法找到足够的地铁站牌';
      }
    } else {
      effectMessage = '公交车效果：桌面上没有足够的地铁站牌';
    }
  }
  
  // 检查是否是特殊效果后的出牌（只能出一张）
  let isSpecialEffectPlay = false;
  if (window.specialEffectPlayed && playMode === 'metro') {
    // 标记这是特殊效果后的出牌
    isSpecialEffectPlay = true;
    // 重置特殊效果标记
    window.specialEffectPlayed = false;
    window.taxiEffectActive = false; // 重置出租车/公交车特殊效果标记
    specialAction = false;
    
    // 移除所有可能存在的结束回合按钮
    const existingEndTurnBtn = document.getElementById('end-turn-btn');
    if (existingEndTurnBtn) {
      existingEndTurnBtn.remove();
    }
    
    console.log('特殊效果后出地铁牌');
  }
  
  // 调试输出
  console.log('出牌模式:', playMode, '特殊行动状态:', specialAction);
  
  // 将牌放到桌面上（累积而不是替换）
  tableCards = [...tableCards, ...cardsToPlay];
  
  // 从手牌中移除出的牌（从大索引到小索引，避免删除影响索引）
  selectedCards.sort((a, b) => b.index - a.index);
  for (const selected of selectedCards) {
    playerHand.splice(selected.index, 1);
  }
  
  // 更新游戏统计数据
  if (playMode === 'metro') {
    gameStats.metroStations += cardsToPlay.length;
  } else if (playMode === 'taxi') {
    gameStats.taxiRides += cardsToPlay.length;
  } else if (playMode === 'bus') {
    gameStats.busRides += cardsToPlay.length;
  }
  gameStats.totalCards += cardsToPlay.length;
  
  // 显示特殊效果消息
  if (effectMessage) {
    showGameMessage(effectMessage);
  }
  
  // 清空选择
  selectedCards = [];
  
  // 更新UI
  renderCards();
  updateGameInfo();
  updatePlayersListUI(); // 更新玩家列表UI，显示正确的剩余牌数
  // updatePlayersListUI(); // 更新玩家列表UI，显示正确的剩余牌数
  
  // 检查游戏是否结束
  if (checkGameEnd()) return;
  
  // 处理特殊效果：出租车或公交车后可以选择打出一张地铁牌
  if (specialAction) {
    console.log('进入特殊行动处理流程');
    
    // 如果是出租车，先摸一张牌
      if (playMode === 'taxi') {
        // 摸一张牌
        const newCard = drawCard('player');
        // 在多人游戏模式下，牌已经在drawCard函数中添加到了localPlayer.cards
        // 只在单人游戏模式下添加到playerHand
        if (!(gameStarted && players.length > 0)) {
          playerHand.push(newCard);
        } else {
          // 在多人模式下，确保playerHand和localPlayer.cards保持同步
          const localPlayer = players.find(p => p.id === localPlayerId);
          if (localPlayer) {
            playerHand = localPlayer.cards;
          }
        }
        renderCards();
        updateGameInfo();
        showGameMessage(`摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌，可以选择打出一张地铁站牌或结束回合`);
        console.log('出租车效果：摸了一张牌', newCard);
    } else if (playMode === 'bus') {
      // 公交车效果已经在前面处理过了
      showGameMessage('公交车已交换了最后两张地铁站牌的位置，可以选择打出一张地铁站牌或结束回合');
      console.log('公交车效果已处理完毕');
    }
    
    // 移除所有可能已存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 创建结束回合按钮
    const endTurnBtn = document.createElement('button');
    endTurnBtn.id = 'end-turn-btn';
    endTurnBtn.className = 'action-button';
    endTurnBtn.textContent = '结束回合';
    // 使用id选择器确保添加到正确的按钮容器中
    document.getElementById('action-buttons').appendChild(endTurnBtn);
    console.log('创建了结束回合按钮');
    
    // 添加结束回合按钮点击事件
    endTurnBtn.addEventListener('click', () => {
      // 移除结束回合按钮
      endTurnBtn.remove();
      
      // 重置标记
      window.metroCardPlayed = false;
      window.metroFirstCardConfirmed = false;
      window.specialEffectPlayed = false;
      window.taxiEffectActive = false;
      
      // 记录玩家的动作
      const lastAction = '结束了回合';
      
      // 切换到AI回合
      currentTurn = 'ai';
      updateGameInfo();
      showGameMessage('AI回合...', lastAction);
      
      // AI延迟出牌
      setTimeout(handleAITurn, 1500);
    });
    
    // 设置出牌模式为地铁，并标记这是特殊效果后的出牌（只能出一张）
    playMode = 'metro';
    // 确保window.specialEffectPlayed已定义，如果未定义则初始化为false
    if (window.specialEffectPlayed === undefined) {
      window.specialEffectPlayed = false;
      console.log('初始化window.specialEffectPlayed为false');
    }
    // 添加一个标记，表示这是特殊效果后的出牌，只能出一张
    window.specialEffectPlayed = true;
    // 修改提示信息，明确告知玩家只能出一张地铁牌
    showGameMessage('可以出一张地铁站牌，出完后将自动结束回合');
    updateButtonStates();
    return;
  } else {
    console.log('未触发特殊行动处理流程');
  }
  
  // 如果是特殊效果后出的地铁牌，直接结束回合
  if (isSpecialEffectPlay) {
    console.log('特殊效果后出完地铁牌，自动结束回合');
    
    // 移除所有可能存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 重置标记
    window.metroCardPlayed = false;
    window.metroFirstCardConfirmed = false;
    
    // 记录玩家的动作
    const lastAction = '特殊效果后出了一张地铁站牌';
    
    // 切换到AI回合
    currentTurn = 'ai';
    updateGameInfo();
    showGameMessage('特殊效果后出完地铁牌，自动结束回合。AI回合...', lastAction);
    
    // AI延迟出牌
    setTimeout(handleAITurn, 1500);
    return;
  }
  
  // 如果是地铁牌，允许玩家选择出第二张地铁牌或结束回合
  if (playMode === 'metro') {
    // 检查是否已经出过一张地铁牌（第二次出牌）
    if (window.metroCardPlayed) {
      // 如果已经出过一张地铁牌，直接结束回合
      console.log('已经出过一张地铁牌，自动结束回合');
      
      // 移除所有可能存在的结束回合按钮
      const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
      allEndTurnBtns.forEach(btn => btn.remove());
      
      // 重置标记
      window.metroCardPlayed = false;
      
      // 记录玩家的动作
      const lastAction = '已出过地铁牌，自动结束回合';
      
      // 切换到AI回合
      currentTurn = 'ai';
      updateGameInfo();
      showGameMessage('已出过地铁牌，自动结束回合。AI回合...', lastAction);
      
      // AI延迟出牌
      setTimeout(handleAITurn, 1500);
      return;
    }
    
    // 标记已经出过一张地铁牌
    window.metroCardPlayed = true;
    
    // 移除所有可能存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 创建结束回合按钮
    const endTurnBtn = document.createElement('button');
    endTurnBtn.id = 'end-turn-btn';
    endTurnBtn.className = 'action-button';
    endTurnBtn.textContent = '结束回合';
    // 使用id选择器确保添加到正确的按钮容器中
    document.getElementById('action-buttons').appendChild(endTurnBtn);
    
    // 添加结束回合按钮点击事件
    endTurnBtn.addEventListener('click', () => {
      // 移除结束回合按钮
      endTurnBtn.remove();
      
      // 重置标记
      window.metroCardPlayed = false;
      window.metroFirstCardConfirmed = false;
      window.specialEffectPlayed = false;
      window.taxiEffectActive = false;
      
      // 记录玩家的动作
      const lastAction = '结束了回合';
      
      // 切换到AI回合
      currentTurn = 'ai';
      updateGameInfo();
      showGameMessage('AI回合...', lastAction);
      
      // AI延迟出牌
      setTimeout(handleAITurn, 1500);
    });
    
    showGameMessage('可以选择打出第二张地铁站牌或结束回合');
    return;
  }
  
  // 记录玩家的动作
  let lastAction = `出了${cardsToPlay.length}张${playMode === 'metro' ? '地铁站' : playMode === 'taxi' ? '出租车' : '公交车'}牌`;
  
  // 切换到AI回合
  currentTurn = 'ai';
  updateGameInfo();
  showGameMessage('AI回合...', lastAction);
  
  // AI延迟出牌
  setTimeout(handleAITurn, 1500);
}

/**
 * 处理AI回合
 */
function handleAITurn() {
  if (gameOver) return;
  
  // AI决策
  const aiDecision = makeAIDecision();
  
  if (aiDecision.action === 'play') {
    // AI出牌
    const cardsToPlay = aiDecision.cards;
    const playMode = aiDecision.mode;
    
    // 显示AI出牌信息
    let modeText = '';
    switch (playMode) {
      case 'metro': modeText = '坐地铁'; break;
      case 'taxi': modeText = '乘出租'; break;
      case 'bus': modeText = '坐公交'; break;
    }
    
    showGameMessage(`AI选择${modeText}，出了 ${cardsToPlay.length} 张牌`);
    
    // 将牌放到桌面上（累积而不是替换）
    tableCards = [...tableCards, ...cardsToPlay];
    
    // 从AI手牌中移除出的牌
    for (const card of cardsToPlay) {
      const index = aiHand.findIndex(c => c === card);
      if (index !== -1) {
        aiHand.splice(index, 1);
      }
    }
    
    // 更新游戏统计数据
    if (playMode === 'metro') {
      gameStats.metroStations += cardsToPlay.length;
    } else if (playMode === 'taxi') {
      gameStats.taxiRides += cardsToPlay.length;
    } else if (playMode === 'bus') {
      gameStats.busRides += cardsToPlay.length;
    }
    gameStats.totalCards += cardsToPlay.length;
  } else {
    // AI摸牌
    // 使用通用摸牌函数
    const newCard = drawCard('ai');
    
    // 将新牌添加到AI手牌（仅在非多人游戏模式下）
    // 在多人游戏模式下，牌已经在drawCard函数中添加到了对应玩家的cards
    if (!(gameStarted && players.length > 0)) {
      aiHand.push(newCard);
    } else {
      // 在多人模式下，确保aiHand和对应玩家的cards保持同步
      const aiPlayer = players.find(p => p.id !== localPlayerId);
      if (aiPlayer) {
        aiHand = aiPlayer.cards;
      }
    }
    showGameMessage(`AI摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌`);
  }
  
  // 处理特殊牌效果
  let aiSpecialAction = false;
  
  // 如果AI出了出租车牌，可以摸一张牌并选择出一张地铁站牌
  if (aiDecision.action === 'play' && aiDecision.mode === 'taxi') {
    aiSpecialAction = true;
    console.log('AI出租车特殊效果触发');
    
    // AI摸一张牌
    const newCard = drawCard('ai');
    
    // 将新牌添加到AI手牌（仅在非多人游戏模式下）
    // 在多人游戏模式下，牌已经在drawCard函数中添加到了对应玩家的cards
    if (!(gameStarted && players.length > 0)) {
      aiHand.push(newCard);
    } else {
      // 在多人模式下，确保aiHand和对应玩家的cards保持同步
      const aiPlayer = players.find(p => p.id !== localPlayerId);
      if (aiPlayer) {
        aiHand = aiPlayer.cards;
      }
    }
    showGameMessage(`AI因出租车效果摸了一张牌`);
    
    // AI可能会选择出一张地铁站牌
    const stationCards = aiHand.filter(card => card.type === CARD_TYPE.STATION);
    if (stationCards.length > 0) {
      // 检查是否有连通的地铁站牌
      const lastTableCard = tableCards[tableCards.length - 1];
      const connectedStationCards = stationCards.filter(card => {
        if (lastTableCard.type !== CARD_TYPE.STATION) return true;
        
        const lastCardStation = metroData.stations.find(s => s.name === lastTableCard.name);
        const newCardStation = metroData.stations.find(s => s.name === card.name);
        
        if (!lastCardStation || !newCardStation) return false;
        
        // 检查是否有共同线路
        return lastCardStation.lines.some(line => newCardStation.lines.includes(line));
      });
      
      if (connectedStationCards.length > 0) {
        // AI选择出一张连通的地铁站牌
        const cardToPlay = connectedStationCards[0];
        tableCards.push(cardToPlay);
        
        // 从AI手牌中移除
        const index = aiHand.findIndex(c => c === cardToPlay);
        if (index !== -1) {
          aiHand.splice(index, 1);
        }
        
        showGameMessage(`AI因出租车效果出了一张地铁站牌：${cardToPlay.name}`);
        gameStats.metroStations += 1;
        gameStats.totalCards += 1;
        console.log('AI出租车效果：出了一张地铁站牌', cardToPlay.name);
        
        // 出租车效果后只能出一张地铁牌，不能继续出牌
        aiSpecialAction = false;
      } else {
        console.log('AI没有可出的连通地铁站牌');
      }
    } else {
      console.log('AI手牌中没有地铁站牌');
    }
  }
  
  // 如果AI出了公交车牌，将倒数第二张地铁牌放到牌堆末尾
  if (aiDecision.action === 'play' && aiDecision.mode === 'bus') {
    aiSpecialAction = true;
    console.log('AI公交车特殊效果触发');
    
    const stationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION);
    if (stationCards.length >= 2) {
      // 找到倒数第二张地铁站牌
      const secondLastStationIndex = tableCards.findIndex((card, index) => {
        if (card.type !== CARD_TYPE.STATION) return false;
        const stationsAfter = tableCards.slice(index + 1).filter(c => c.type === CARD_TYPE.STATION);
        return stationsAfter.length === 1; // 如果后面只有一张地铁站牌，那么这张就是倒数第二张
      });
      
      if (secondLastStationIndex !== -1) {
        // 将倒数第二张地铁站牌移到牌堆末尾（而不是牌堆首位）
        const secondLastStation = tableCards[secondLastStationIndex];
        tableCards.splice(secondLastStationIndex, 1);
        // 将地铁站牌放到末尾，而不是首位
        tableCards.push(secondLastStation);
        showGameMessage(`AI使用公交车将${secondLastStation.name}站移到了牌堆末尾！`);
        console.log('AI公交车效果：移动了地铁站牌', secondLastStation.name);
        
        // 设置特殊效果标记，表示这是特殊效果后的出牌，只能出一张地铁牌
        window.specialEffectPlayed = true;
        
        // AI可能会选择出一张地铁站牌
        const stationCards = aiHand.filter(card => card.type === CARD_TYPE.STATION);
        if (stationCards.length > 0) {
          // 检查是否有连通的地铁站牌
          // 现在应该检查与末尾牌的连通性，因为地铁站牌已经移到末尾
          const lastTableCard = tableCards[tableCards.length - 1];
          const connectedStationCards = stationCards.filter(card => {
            if (lastTableCard.type !== CARD_TYPE.STATION) return true;
            
            const lastCardStation = metroData.stations.find(s => s.name === lastTableCard.name);
            const newCardStation = metroData.stations.find(s => s.name === card.name);
            
            if (!lastCardStation || !newCardStation) return false;
            
            // 检查是否有共同线路
            return lastCardStation.lines.some(line => newCardStation.lines.includes(line));
          });
          
          if (connectedStationCards.length > 0) {
            // AI选择出一张连通的地铁站牌
            const cardToPlay = connectedStationCards[0];
            tableCards.push(cardToPlay);
            
            // 从AI手牌中移除
            const index = aiHand.findIndex(c => c === cardToPlay);
            if (index !== -1) {
              aiHand.splice(index, 1);
            }
            
            showGameMessage(`AI因公交车效果出了一张地铁站牌：${cardToPlay.name}`);
            gameStats.metroStations += 1;
            gameStats.totalCards += 1;
            console.log('AI公交车效果：出了一张地铁站牌', cardToPlay.name);
            
            // 公交车效果后只能出一张地铁牌，不能继续出牌
            aiSpecialAction = false;
          }
        }
      } else {
        console.log('找不到倒数第二张地铁站牌');
      }
    } else {
      console.log('桌面上没有足够的地铁站牌');
    }
  }
  console.log('AI特殊行动状态:', aiSpecialAction);
  
  // 更新UI
  renderCards();
  updateGameInfo();
  updatePlayersListUI(); // 更新玩家列表UI，显示正确的剩余牌数
  updatePlayersListUI(); // 更新玩家列表UI，显示正确的剩余牌数
  
  // 检查游戏是否结束
  if (checkGameEnd()) return;
  
  // 切换到玩家回合
  currentTurn = 'player';
  playMode = null;
  updateGameInfo();
  updateButtonStates();
  showGameMessage('你的回合，请选择一种出牌方式');
}

/**
 * AI决策逻辑
 * @returns {Object} AI决策结果
 */
function makeAIDecision() {
  // 统计AI手牌中各类型的数量
  const stationCards = aiHand.filter(card => card.type === CARD_TYPE.STATION);
  const taxiCards = aiHand.filter(card => card.type === CARD_TYPE.TAXI);
  const busCards = aiHand.filter(card => card.type === CARD_TYPE.BUS);
  
  // 检查桌面上的牌
  const tableCardTypes = tableCards.length > 0 ? tableCards[0].type : null;
  
  // 决策逻辑
  // 1. 如果桌面上有牌，尝试出同类型的牌
  if (tableCardTypes) {
    if (tableCardTypes === CARD_TYPE.STATION && stationCards.length > 0) {
      // 获取桌面上最后一张牌
      const lastTableCard = tableCards[tableCards.length - 1];
      
      // 如果最后一张牌是地铁站牌，检查是否有连通的站点可以出
      if (lastTableCard.type === CARD_TYPE.STATION) {
        const lastCardStation = metroData.stations.find(s => s.name === lastTableCard.name);
        
        // 找出所有与最后一张牌连通的站点
        const connectedStationCards = stationCards.filter(card => {
          const station = metroData.stations.find(s => s.name === card.name);
          if (!station || !lastCardStation) return false;
          
          // 检查是否有共同线路
          return station.lines.some(line => lastCardStation.lines.includes(line));
        });
        
        // 如果有连通的站点，出第一张连通的站点牌
        if (connectedStationCards.length > 0) {
          return {
            action: 'play',
            mode: 'metro',
            cards: [connectedStationCards[0]]
          };
        }
        
        // 如果没有连通的站点，选择摸牌而不是随机出牌
        return {
          action: 'draw'
        };
      } else {
        // 如果最后一张牌不是地铁站牌，可以出任意地铁站牌
        return {
          action: 'play',
          mode: 'metro',
          cards: [stationCards[0]]
        };
      }
    } else if (tableCardTypes === CARD_TYPE.TAXI && taxiCards.length > 0) {
      // 出一张出租车牌
      return {
        action: 'play',
        mode: 'taxi',
        cards: [taxiCards[0]]
      };
    } else if (tableCardTypes === CARD_TYPE.BUS && busCards.length > 0) {
      // 出一张公交车牌
      return {
        action: 'play',
        mode: 'bus',
        cards: [busCards[0]]
      };
    } else {
      // 如果没有对应类型的牌，选择摸牌
      return {
        action: 'draw'
      };
    }
  }
  // 2. 如果桌面上没有牌，选择数量最多的类型出牌
  if (stationCards.length >= taxiCards.length && stationCards.length >= busCards.length && stationCards.length > 0) {
    // 出一张地铁站牌
    return {
      action: 'play',
      mode: 'metro',
      cards: [stationCards[0]]
    };
  } else if (taxiCards.length >= stationCards.length && taxiCards.length >= busCards.length && taxiCards.length > 0) {
    // 出一张出租车牌
    return {
      action: 'play',
      mode: 'taxi',
      cards: [taxiCards[0]]
    };
  } else if (busCards.length > 0) {
    // 出一张公交车牌
    return {
      action: 'play',
      mode: 'bus',
      cards: [busCards[0]]
    };
  }
  
  // 3. 如果没有牌可出，选择摸牌
  return {
    action: 'draw'
  };
}

/**
 * 检查出牌是否符合规则
 * @param {Array} cards 要出的牌
 * @param {string} mode 出牌模式
 * @returns {boolean} 是否符合规则
 */
function isValidPlay(cards, mode) {
  if (cards.length === 0) return false;
  
  // 检查所有牌是否为同一类型
  const cardType = cards[0].type;
  if (!cards.every(card => card.type === cardType)) return false;
  
  // 检查牌类型是否与模式匹配
  if (mode === 'metro' && cardType !== CARD_TYPE.STATION) return false;
  if (mode === 'taxi' && cardType !== CARD_TYPE.TAXI) return false;
  if (mode === 'bus' && cardType !== CARD_TYPE.BUS) return false;
  
  // 检查桌面上的牌
  if (tableCards.length > 0) {
    // 如果是出租车牌或公交车牌，可以直接出，不需要额外检查
    if (cardType === CARD_TYPE.TAXI || cardType === CARD_TYPE.BUS) {
      return true;
    }
    
    // 如果桌面上有牌，必须与桌面上的牌类型相同
    if (tableCards[0].type !== cardType) return false;
    
    // 如果是地铁站牌，检查连通性
    if (cardType === CARD_TYPE.STATION && tableCards.length > 0) {
      // 检查是否是出租车/公交车特殊效果后的出牌
      if (window.taxiEffectActive && playMode === 'metro') {
        // 出租车/公交车特殊效果：可以出任意地铁站牌，不需要检查连通性
        // 但是限制只能出一张牌
        if (cards.length > 1) { 
          return false; // 只能出一张牌
        }
        return true; // 跳过连通性检查
      }
      
      // 获取桌面上最后一张牌
      const lastTableCard = tableCards[tableCards.length - 1];
      
      // 如果最后一张牌也是地铁站牌，检查是否连通
      if (lastTableCard.type === CARD_TYPE.STATION) {
        // 对于每张要出的牌，检查是否与最后一张桌面牌连通
        for (const card of cards) {
          // 获取两个站点的线路信息
          const lastCardStation = metroData.stations.find(s => s.name === lastTableCard.name);
          const newCardStation = metroData.stations.find(s => s.name === card.name);
          
          if (lastCardStation && newCardStation) {
            // 检查两个站点是否有共同线路（连通性检查）
            const hasCommonLine = lastCardStation.lines.some(line => 
              newCardStation.lines.includes(line)
            );
            
            if (!hasCommonLine) {
              return false; // 没有共同线路，不连通
            }
          }
        }
      }
    }
  }
  return true;
}

/**
 * 通用摸牌函数，为玩家和AI提供统一的摸牌逻辑
 * @param {string} player 玩家类型 'player' 或 'ai'
 * @param {Object} [specificCard] - 在多人游戏模式下，服务器指定的卡牌
 * @returns {Object} 摸到的牌
 */
function drawCard(player, specificCard = null) {
  // 如果是多人游戏模式且提供了特定卡牌，直接使用该卡牌
  if (gameStarted && players.length > 0 && specificCard) {
    // 如果是多人游戏模式，更新对应玩家的手牌
    if (player === 'player') {
      const localPlayer = players.find(p => p.id === localPlayerId);
      if (localPlayer && localPlayer.cards) {
        localPlayer.cards.push(specificCard);
      }
    } else if (player === 'ai') {
      const aiPlayer = players.find(p => p.id !== localPlayerId);
      if (aiPlayer && aiPlayer.cards) {
        aiPlayer.cards.push(specificCard);
      }
    }
    
    return specificCard;
  }
  
  // 创建一张随机牌，确保不会摸到已经打出的牌或弃牌堆的牌
  let newCard;
  let isCardValid = false;
  let attempts = 0;
  const maxAttempts = 50; // 防止无限循环
  
  while (!isCardValid && attempts < maxAttempts) {
    attempts++;
    
    // 计算各类型牌的剩余数量
    const stationCardCount = metroData.stations.filter(station => station.cardmode === 1).length;
    
    // 计算已使用的地铁站牌数量
    let usedStationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION).length;
    
    // 计算已使用的出租车牌数量
    let usedTaxiCards = tableCards.filter(card => card.type === CARD_TYPE.TAXI).length;
    
    // 计算已使用的公交车牌数量
    let usedBusCards = tableCards.filter(card => card.type === CARD_TYPE.BUS).length;
    
    // 如果是多人游戏模式，统计所有玩家手牌中的牌
    if (gameStarted && players.length > 0) {
      for (const p of players) {
        if (p.cards) {
          usedStationCards += p.cards.filter(card => card.type === CARD_TYPE.STATION).length;
          usedTaxiCards += p.cards.filter(card => card.type === CARD_TYPE.TAXI).length;
          usedBusCards += p.cards.filter(card => card.type === CARD_TYPE.BUS).length;
        }
      }
    } else {
      // 单人游戏模式，统计玩家和AI手牌
      usedStationCards += playerHand.filter(card => card.type === CARD_TYPE.STATION).length;
      usedStationCards += aiHand.filter(card => card.type === CARD_TYPE.STATION).length;
      
      usedTaxiCards += playerHand.filter(card => card.type === CARD_TYPE.TAXI).length;
      usedTaxiCards += aiHand.filter(card => card.type === CARD_TYPE.TAXI).length;
      
      usedBusCards += playerHand.filter(card => card.type === CARD_TYPE.BUS).length;
      usedBusCards += aiHand.filter(card => card.type === CARD_TYPE.BUS).length;
    }
    
    const remainingStationCards = Math.max(0, stationCardCount - usedStationCards);
    const remainingTaxiCards = Math.max(0, 5 - usedTaxiCards); // 最多5张出租车牌
    const remainingBusCards = Math.max(0, 5 - usedBusCards); // 最多5张公交车牌
    
    // 计算总剩余牌数
    const totalRemainingCards = remainingStationCards + remainingTaxiCards + remainingBusCards;
    
    // 如果没有剩余牌，跳出循环
    if (totalRemainingCards === 0) break;
    
    // 根据剩余牌的比例随机选择牌类型
    const randomValue = Math.random() * totalRemainingCards;
    
    if (randomValue < remainingStationCards) {
      // 随机选择一个地铁站
      const availableStations = metroData.stations.filter(station => {
        // 只选择cardmode为1的站点
        if (station.cardmode !== 1) return false;
        
        // 检查该站点是否已经在所有玩家手牌或桌面上
        let isUsed = false;
        
        // 检查是否在桌面上
        isUsed = isUsed || tableCards.some(card => 
          card.type === CARD_TYPE.STATION && card.name === station.name
        );
        
        // 如果是多人游戏模式，检查所有玩家的手牌
        if (gameStarted && players.length > 0) {
          for (const p of players) {
            if (p.cards) {
              isUsed = isUsed || p.cards.some(card => 
                card.type === CARD_TYPE.STATION && card.name === station.name
              );
            }
          }
        } else {
          // 单人游戏模式，检查玩家和AI手牌
          isUsed = isUsed || playerHand.some(card => 
            card.type === CARD_TYPE.STATION && card.name === station.name
          );
          isUsed = isUsed || aiHand.some(card => 
            card.type === CARD_TYPE.STATION && card.name === station.name
          );
        }
        
        return !isUsed;
      });
      
      if (availableStations.length > 0) {
        const randomStationIndex = Math.floor(Math.random() * availableStations.length);
        const station = availableStations[randomStationIndex];
        newCard = {
          type: CARD_TYPE.STATION,
          name: station.name,
          lines: station.lines
        };
        isCardValid = true;
      }
    } else if (randomValue < remainingStationCards + remainingTaxiCards) {
      // 检查出租车牌的数量是否已达上限
      if (remainingTaxiCards > 0) {
        newCard = {
          type: CARD_TYPE.TAXI,
          name: '出租车',
          description: '可以连接任意两个地铁站，然后摸一张牌并可选择打出一张地铁牌'
        };
        isCardValid = true;
      }
    } else {
      // 检查公交车牌的数量是否已达上限
      if (remainingBusCards > 0) {
        newCard = {
          type: CARD_TYPE.BUS,
          name: '公交车',
          description: '将当前牌堆倒数第二张地铁牌放到牌堆顶'
        };
        isCardValid = true;
      }
    }
  }
  
  // 如果无法找到有效牌，创建一个地铁站牌（如果可能）
  if (!isCardValid) {
    const availableStations = metroData.stations.filter(station => {
      if (station.cardmode !== 1) return false;
      
      // 检查该站点是否已经在所有玩家手牌或桌面上
      let isUsed = false;
      
      // 检查是否在桌面上
      isUsed = isUsed || tableCards.some(card => 
        card.type === CARD_TYPE.STATION && card.name === station.name
      );
      
      // 如果是多人游戏模式，检查所有玩家的手牌
      if (gameStarted && players.length > 0) {
        for (const p of players) {
          if (p.cards) {
            isUsed = isUsed || p.cards.some(card => 
              card.type === CARD_TYPE.STATION && card.name === station.name
            );
          }
        }
      } else {
        // 单人游戏模式，检查玩家和AI手牌
        isUsed = isUsed || playerHand.some(card => 
          card.type === CARD_TYPE.STATION && card.name === station.name
        );
        isUsed = isUsed || aiHand.some(card => 
          card.type === CARD_TYPE.STATION && card.name === station.name
        );
      }
      
      return !isUsed;
    });
    
    if (availableStations.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableStations.length);
      const station = availableStations[randomIndex];
      newCard = {
        type: CARD_TYPE.STATION,
        name: station.name,
        lines: station.lines
      };
    } else {
      // 如果没有可用的地铁站牌，创建一个通用牌
      newCard = {
        type: CARD_TYPE.STATION,
        name: '通用地铁站',
        lines: [1, 2] // 假设这个通用站连接1号线和2号线
      };
    }
  }
  
  // 如果是多人游戏模式，更新对应玩家的手牌
  // 注意：在多人模式下，我们在这里更新玩家手牌
  // 但在单人模式下，我们在handleDrawCard中更新
  // 对于AI玩家，我们在handleAITurn中更新
  if (gameStarted && players.length > 0) {
    if (player === 'player') {
      const localPlayer = players.find(p => p.id === localPlayerId);
      if (localPlayer && localPlayer.cards) {
        localPlayer.cards.push(newCard);
      }
    } else if (player === 'ai') {
      const aiPlayer = players.find(p => p.id !== localPlayerId);
      if (aiPlayer && aiPlayer.cards) {
        aiPlayer.cards.push(newCard);
      }
    }
  }
  
  return newCard;
}

/**
 * 处理玩家摸牌
 */
function handleDrawCard() {
  console.log('===== 客户端 handleDrawCard 调试断点 =====');
  
  // 判断是否是当前玩家的回合
  let isPlayerTurn = false;
  
  if (gameStarted && players.length > 0) {
    // 多人游戏模式：检查当前玩家ID是否是本地玩家ID
    isPlayerTurn = currentPlayerId === localPlayerId;
    console.log('多人游戏模式 - isPlayerTurn:', isPlayerTurn);
  } else {
    // 单人游戏模式：使用currentTurn变量
    isPlayerTurn = currentTurn === 'player';
    console.log('单人游戏模式 - isPlayerTurn:', isPlayerTurn);
  }
  
  // 如果不是当前玩家的回合或游戏已结束，不允许摸牌
  if (!isPlayerTurn || gameOver) {
    if (gameStarted && players.length > 0 && !gameOver) {
      // 在多人游戏模式下显示错误提示
      console.log('错误：不是你的回合');
      showGameMessage('错误：不是你的回合');
    }
    return;
  }
  
  // 如果是多人游戏模式，通过WebSocket发送摸牌请求
  if (gameStarted && players.length > 0) {
    console.log('===== 多人游戏模式摸牌处理 =====');
    console.log('当前时间:', new Date().toISOString());
    console.log('当前玩家ID:', currentPlayerId);
    console.log('本地玩家ID:', localPlayerId);
    console.log('是否是房主:', isHost);
    
    // 清除上一次可能存在的lastDrawCardRequest，避免复用旧的specialEffect
    window.lastDrawCardRequest = null;
    console.log('已清除window.lastDrawCardRequest');
    
    // 构建全新的请求对象
    const drawCardRequest = {
      type: 'draw_card',
      roomId: roomId
    };
    
    // 检查是否处于出租车特殊效果状态 - 只使用window变量，不使用localStorage
    const isTaxiEffect = window.taxiEffectActive === true;
    console.log('window.taxiEffectActive:', window.taxiEffectActive);
    console.log('isTaxiEffect判断结果:', isTaxiEffect);
    
    // 只有在确实处于出租车特效状态时才添加specialEffect参数
    if (isTaxiEffect) {
      drawCardRequest.specialEffect = 'taxi';
      console.log('添加specialEffect=taxi到摸牌请求，当前处于出租车特效状态');
    }
    
    // 发送请求
    console.log('发送摸牌请求:', JSON.stringify(drawCardRequest));
    console.log('请求中是否包含specialEffect属性:', drawCardRequest.hasOwnProperty('specialEffect'));
    console.log('请求对象的所有属性名:', Object.keys(drawCardRequest));
    
    // 使用socket.send发送请求
    if (socket && socket.readyState === WebSocket.OPEN) {
      // 直接发送请求对象的JSON字符串，避免引用问题
      const requestJson = JSON.stringify(drawCardRequest);
      console.log('发送的JSON字符串:', requestJson);
      console.log('JSON字符串是否包含"specialEffect":', requestJson.includes('"specialEffect"'));
      socket.send(requestJson);
      
      // 保存当前请求的副本，用于调试 - 使用深拷贝
      window.lastDrawCardRequest = JSON.parse(requestJson);
      console.log('保存的lastDrawCardRequest:', JSON.stringify(window.lastDrawCardRequest));
      
      // 如果这次请求包含了specialEffect=taxi，则在发送后清除标记
      // 这样可以确保出租车效果只使用一次
      if (isTaxiEffect) {
        console.log('出租车效果已使用，清除相关标记');
        // 清除window变量
        window.taxiEffectActive = false;
        window.specialEffectPlayed = false;
        console.log('清除后的window.taxiEffectActive:', window.taxiEffectActive);
        
        // 添加验证日志
        console.log('验证清除是否成功 - window.taxiEffectActive:', window.taxiEffectActive);
        console.log('验证清除是否成功 - window.specialEffectPlayed:', window.specialEffectPlayed);
      }
    } else {
      console.error('WebSocket连接未建立或已关闭');
      showGameMessage('与服务器的连接已断开，请刷新页面重试', true);
    }
    return;
  }
  
  // 单人游戏模式下的处理逻辑
  // 使用通用摸牌函数
  const newCard = drawCard('player');
  
  // 将新牌添加到玩家手牌
  playerHand.push(newCard);
  
  // 记录玩家的动作
  const lastAction = `摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌`;
  
  // 更新UI
  renderCards();
  updateGameInfo();
  updatePlayersListUI(); // 更新玩家列表UI，显示正确的剩余牌数
  showGameMessage(lastAction);
  
  // 切换到AI回合
  currentTurn = 'ai';
  updateGameInfo();
  showGameMessage('AI回合...', lastAction);
  
  // AI延迟出牌
  setTimeout(handleAITurn, 1500);
}

/**
 * 取消选择
 */
function cancelSelection() {
  // 判断是否是当前玩家的回合
  let isPlayerTurn = false;
  
  if (gameStarted && players.length > 0) {
    // 多人游戏模式：检查当前玩家ID是否是本地玩家ID
    isPlayerTurn = currentPlayerId === localPlayerId;
  } else {
    // 单人游戏模式：使用currentTurn变量
    isPlayerTurn = currentTurn === 'player';
  }
  
  // 如果不是当前玩家的回合或游戏已结束，不允许取消选择
  if (!isPlayerTurn || gameOver) {
    if (gameStarted && players.length > 0 && !gameOver) {
      // 在多人游戏模式下显示错误提示
      showGameMessage('错误：不是你的回合');
    }
    return;
  }
  
  // 取消所有选中的牌
  const selectedCardElements = document.querySelectorAll('.card.selected');
  selectedCardElements.forEach(element => {
    element.classList.remove('selected');
  });
  
  selectedCards = [];
  drawCardBtn.disabled = false;
  showGameMessage('已取消选择，请重新选择');
}

/**
 * 检查游戏是否结束
 * @returns {boolean} 游戏是否结束
 */
function checkGameEnd() {
  if (playerHand.length === 0 || aiHand.length === 0) {
    gameOver = true;
    
    // 计算游戏统计数据
    const stationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION).length;
    const taxiCards = tableCards.filter(card => card.type === CARD_TYPE.TAXI).length;
    const busCards = tableCards.filter(card => card.type === CARD_TYPE.BUS).length;
    
    gameStats.totalCards = tableCards.length;
    gameStats.metroStations = stationCards;
    gameStats.taxiRides = taxiCards;
    gameStats.busRides = busCards;
    
    // 创建游戏结算画面
    gameResultElement.innerHTML = '';
    gameResultElement.style.display = 'block';
    
    // 添加标题
    const titleElement = document.createElement('h2');
    if (playerHand.length === 0) {
      titleElement.textContent = '恭喜你赢了！';
      gameResultElement.className = 'game-result win';
    } else {
      titleElement.textContent = 'AI赢了，再接再厉！';
      gameResultElement.className = 'game-result lose';
    }
    gameResultElement.appendChild(titleElement);
    
    // 添加游戏统计数据
    const statsElement = document.createElement('div');
    statsElement.className = 'game-stats';
    statsElement.innerHTML = `
      <h3>游戏统计</h3>
      <p>总共出牌数: ${gameStats.totalCards}</p>
      <p>经过地铁站数: ${gameStats.metroStations}</p>
      <p>乘坐出租车次数: ${gameStats.taxiRides}</p>
      <p>乘坐公交车次数: ${gameStats.busRides}</p>
    `;
    gameResultElement.appendChild(statsElement);
    
    // 添加新游戏按钮
    const newGameBtnElement = document.createElement('button');
    newGameBtnElement.className = 'action-button';
    newGameBtnElement.textContent = '开始新游戏';
    newGameBtnElement.onclick = initializeGame;
    gameResultElement.appendChild(newGameBtnElement);
    
    // 禁用所有游戏按钮
    playMetroBtn.disabled = true;
    playTaxiBtn.disabled = true;
    playBusBtn.disabled = true;
    drawCardBtn.disabled = true;
    cancelSelectionBtn.disabled = true;
    
    return true;
  }
  
  return false;
}

/**
 * 更新游戏信息
 */
function updateGameInfo() {
  // 添加null检查，防止在元素不存在时报错
  if (playerCardsCountElement) {
    // 在多人游戏模式下，使用localPlayer.cards的长度
    if (gameStarted && players.length > 0) {
      const localPlayer = players.find(p => p.id === localPlayerId);
      if (localPlayer && localPlayer.cards) {
        playerCardsCountElement.textContent = `玩家手牌: ${localPlayer.cards.length}`;
      } else {
        playerCardsCountElement.textContent = `玩家手牌: 0`;
      }
    } else {
      playerCardsCountElement.textContent = `玩家手牌: ${playerHand ? playerHand.length : 0}`;
    }
  }
  
  if (aiCardsCountElement) {
    // 在多人游戏模式下，使用aiPlayer.cards的长度
    if (gameStarted && players.length > 0) {
      const aiPlayer = players.find(p => p.id !== localPlayerId);
      if (aiPlayer && aiPlayer.cards) {
        aiCardsCountElement.textContent = `AI手牌: ${aiPlayer.cards.length}`;
      } else {
        aiCardsCountElement.textContent = `AI手牌: 0`;
      }
    } else {
      aiCardsCountElement.textContent = `AI手牌: ${aiHand ? aiHand.length : 0}`;
    }
  }
  // 计算牌堆剩余数量：总牌数减去玩家手牌、AI手牌和桌面牌
  // 地铁站牌数量 + 出租车牌(5) + 公交车牌(5) - 已使用的牌
  const stationCardCount = metroData.stations.filter(station => station.cardmode === 1).length;
  const totalCardCount = stationCardCount + 5 + 5; // 地铁站牌 + 5张出租车 + 5张公交车
  
  let playerCardCount = 0;
  let aiCardCount = 0;
  
  // 在多人游戏模式下，使用players中的cards长度
  if (gameStarted && players.length > 0) {
    const localPlayer = players.find(p => p.id === localPlayerId);
    const aiPlayer = players.find(p => p.id !== localPlayerId);
    
    playerCardCount = localPlayer && localPlayer.cards ? localPlayer.cards.length : 0;
    aiCardCount = aiPlayer && aiPlayer.cards ? aiPlayer.cards.length : 0;
  } else {
    playerCardCount = playerHand ? playerHand.length : 0;
    aiCardCount = aiHand ? aiHand.length : 0;
  }
  
  const usedCardCount = playerCardCount + aiCardCount + (tableCards ? tableCards.length : 0);
  const remainingCards = Math.max(0, totalCardCount - usedCardCount);
  
  if (deckCountElement) {
    deckCountElement.textContent = `牌堆剩余: ${remainingCards}`;
  }
  
  if (currentTurnElement) {
    if (gameStarted && players.length > 0) {
      // 多人游戏模式：显示当前玩家的名称
      
      // 确保currentPlayerId已定义
      if (!currentPlayerId && players.length > 0) {
        // 如果currentPlayerId未定义但有玩家列表，设置为第一个玩家
        currentPlayerId = players[0].id;
      }
      
      const isLocalPlayer = currentPlayerId === localPlayerId;
      
      // 先检查是否是本地玩家的回合
      if (isLocalPlayer) {
        // 如果是本地玩家的回合
        currentTurnElement.textContent = `当前回合: 你`;
        currentTurnElement.classList.add('current-turn-highlight');
        currentTurnElement.style.fontWeight = 'bold';
        currentTurnElement.style.color = '#ff5722';
      } else {
        // 如果是其他玩家的回合，尝试获取玩家信息
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        
        if (currentPlayer) {
          // 如果找到了玩家信息
          currentTurnElement.textContent = `当前回合: ${currentPlayer.name}`;
        } else {
          // 如果找不到当前玩家信息，显示ID的一部分作为标识
          const shortId = currentPlayerId ? currentPlayerId.substring(0, 8) : '未知';
          currentTurnElement.textContent = `当前回合: 玩家(${shortId})`;
        }
        
        currentTurnElement.classList.remove('current-turn-highlight');
        currentTurnElement.style.fontWeight = 'normal';
        currentTurnElement.style.color = '';
      }
    } else {
      // 单人游戏模式：显示玩家或AI
      currentTurnElement.textContent = `当前回合: ${currentTurn === 'player' ? '玩家' : 'AI'}`;
      // 在单人模式下也添加高亮
      if (currentTurn === 'player') {
        currentTurnElement.classList.add('current-turn-highlight');
        currentTurnElement.style.fontWeight = 'bold';
        currentTurnElement.style.color = '#ff5722';
      } else {
        currentTurnElement.classList.remove('current-turn-highlight');
        currentTurnElement.style.fontWeight = 'normal';
        currentTurnElement.style.color = '';
      }
    }
  }
}

/**
 * 更新按钮状态
 */
function updateButtonStates() {
  // 判断是否是当前玩家的回合
  let isPlayerTurn = false;
  
  if (gameStarted && players.length > 0) {
    // 多人游戏模式：检查当前玩家ID是否是本地玩家ID
    isPlayerTurn = currentPlayerId === localPlayerId;
  } else {
    // 单人游戏模式：使用currentTurn变量
    isPlayerTurn = currentTurn === 'player';
  }
  
  // 如果游戏结束，禁用所有按钮
  isPlayerTurn = isPlayerTurn && !gameOver;
  
  // 检查玩家手牌中是否有各类型的牌
  const hasMetroCard = playerHand.some(card => card.type === CARD_TYPE.STATION);
  const hasTaxiCard = playerHand.some(card => card.type === CARD_TYPE.TAXI);
  const hasBusCard = playerHand.some(card => card.type === CARD_TYPE.BUS);
  
  // 检查选中的牌类型
  let selectedCardType = null;
  if (selectedCards.length > 0) {
    selectedCardType = selectedCards[0].card.type;
  }
  
  // 出牌按钮状态
  // 检查是否是特殊效果状态（出租车效果或已出过一张地铁牌）
  const isSpecialEffect = window.taxiEffectActive || window.metroCardPlayed;
  
  if (selectedCards.length > 0) {
    // 如果已选择牌，只启用对应类型的按钮
    // 在特殊效果状态下，即使不是玩家回合也允许出牌
    playMetroBtn.disabled = !((isPlayerTurn || isSpecialEffect) && selectedCardType === CARD_TYPE.STATION);
    // 出租车和公交车按钮仍然需要是玩家回合才能启用
    playTaxiBtn.disabled = !(isPlayerTurn && selectedCardType === CARD_TYPE.TAXI);
    playBusBtn.disabled = !(isPlayerTurn && selectedCardType === CARD_TYPE.BUS);
  } else {
    // 如果未选择牌，根据手牌中是否有对应类型的牌来启用按钮
    // 在特殊效果状态下，如果是出租车效果，允许出地铁牌
    playMetroBtn.disabled = !(isPlayerTurn || (window.taxiEffectActive && playMode === 'metro')) || (playMode !== null && playMode !== 'metro') || !hasMetroCard;
    // 出租车和公交车按钮仍然需要是玩家回合才能启用
    playTaxiBtn.disabled = !isPlayerTurn || (playMode !== null && playMode !== 'taxi') || !hasTaxiCard;
    playBusBtn.disabled = !isPlayerTurn || (playMode !== null && playMode !== 'bus') || !hasBusCard;
  }
  
  // 摸牌按钮状态
  drawCardBtn.disabled = !isPlayerTurn || playMode !== null || selectedCards.length > 0;
  
  // 取消选择按钮状态
  cancelSelectionBtn.disabled = !isPlayerTurn || selectedCards.length === 0;
}

/**
 * 显示游戏消息
 * @param {string} message 消息内容
 * @param {string} [lastAction] 上一位玩家的行动信息
 */
function showGameMessage(message, lastAction) {
  // 如果提供了上一位玩家的行动信息，且不是布尔值true，添加到消息前面并使用不同样式
  if (lastAction && typeof lastAction === 'string') {
    // 清空原有内容
    gameMessageElement.innerHTML = '';
    
    // 创建上一步操作的元素，使用特殊样式
    const lastActionSpan = document.createElement('span');
    lastActionSpan.className = 'last-action';
    lastActionSpan.textContent = `上一步: ${lastAction}`;
    
    // 创建当前消息元素
    const currentMessageSpan = document.createElement('span');
    currentMessageSpan.textContent = message;
    
    // 添加到消息区域
    gameMessageElement.appendChild(lastActionSpan);
    gameMessageElement.appendChild(document.createElement('br'));
    gameMessageElement.appendChild(currentMessageSpan);
  } else {
    gameMessageElement.textContent = message;
  }
}

/**
 * 渲染卡牌
 */
function renderCards() {
  // 清空卡牌区域
  playerHandElement.innerHTML = '';
  if (aiHandElement) {
    aiHandElement.innerHTML = '';
  }
  tableCardsElement.innerHTML = '';
  
  // 渲染玩家手牌
  playerHand.forEach((card, index) => {
    const cardElement = createCardElement(card, index);
    cardElement.id = `player-card-${index}`;
    cardElement.addEventListener('click', () => handleCardSelection(card, index));
    playerHandElement.appendChild(cardElement);
  });
  
  // 渲染AI手牌 - 只在调试模式下显示
  if (debugMode && aiHand && aiHand.length > 0) {
    // 调试模式下显示AI完整手牌
    aiHand.forEach((card, index) => {
      const cardElement = createCardElement(card, index);
      cardElement.id = `ai-card-${index}`;
      if (aiHandElement) {
        aiHandElement.appendChild(cardElement);
      }
    });
  }
  
  // 控制AI手牌标题的显示/隐藏
  const aiHandTitle = document.querySelector('.card-area h3:nth-of-type(2)');
  if (aiHandTitle) {
    aiHandTitle.style.display = debugMode ? 'block' : 'none';
  }
  // 注意：AI手牌区域的显示/隐藏由调试按钮点击事件和initializeGame函数控制

  
  // 修改桌面牌区域为横向显示
  tableCardsElement.style.display = 'flex';
  tableCardsElement.style.flexDirection = 'row';
  tableCardsElement.style.flexWrap = 'wrap';
  tableCardsElement.style.justifyContent = 'flex-start';
  tableCardsElement.style.alignItems = 'center';
  tableCardsElement.style.gap = '10px';
  
  // 渲染桌面牌（只显示最近的8张）
  const visibleCards = tableCards.length > 8 ? tableCards.slice(tableCards.length - 8) : tableCards;
  
  // 如果有被隐藏的牌，显示提示信息
  if (tableCards.length > 8) {
    const hiddenInfoElement = document.createElement('div');
    hiddenInfoElement.className = 'hidden-cards-info';
    hiddenInfoElement.textContent = `还有 ${tableCards.length - 8} 张较早的牌被隐藏`;
    tableCardsElement.appendChild(hiddenInfoElement);
  }
  
  // 渲染可见的桌面牌
  visibleCards.forEach((card, index) => {
    const cardElement = createCardElement(card);
    tableCardsElement.appendChild(cardElement);
  });
  
  // 更新调试信息
  if (debugMode) {
    updateDebugInfo();
  }
}

/**
 * 创建卡牌元素
 * @param {Object} card 卡牌数据
 * @param {number} index 卡牌索引
 * @returns {HTMLElement} 卡牌元素
 */
function createCardElement(card, index) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  
  // 根据卡牌类型设置样式
  if (card.type === CARD_TYPE.STATION) {
    // 地铁站牌
    const stationNameElement = document.createElement('div');
    stationNameElement.className = 'station-name';
    stationNameElement.textContent = card.name;
    cardElement.appendChild(stationNameElement);
    
    // 添加线路标签
    const stationLinesElement = document.createElement('div');
    stationLinesElement.className = 'station-lines';
    
    // 优先使用卡牌自带的线路信息，如果没有再从metroData中查找
    const lines = card.lines || (metroData.stations.find(s => s.name === card.name)?.lines || []);
    
    if (lines && lines.length > 0) {
      lines.forEach(line => {
        const lineTagElement = document.createElement('div');
        lineTagElement.className = 'line-tag';
        
        // 获取线路名称而不是ID
        let lineName = '';
        if (typeof line === 'number') {
          lineName = `${line}号线`;
        } else if (line === 'S1') {
          lineName = 'S1线';
        } else if (line === 'sdjc') {
          lineName = '机场线';
        } else if (line === 'dxjc') {
          lineName = '大兴机场线';
        } else if (line === 'cp') {
          lineName = '昌平线';
        } else if (line === 'yz') {
          lineName = '亦庄线';
        } else if (line === 'fs') {
          lineName = '房山线';
        } else if (line === 'xj') {
          lineName = '西郊线';
        } else if (line === 'yf') {
          lineName = '燕房线';
        } else if (line === 'yzt1') {
          lineName = '亦庄T1线';
        } else {
          lineName = line;
        }
        
        lineTagElement.textContent = lineName;
        lineTagElement.style.backgroundColor = LINE_COLORS[line] || '#999';
        stationLinesElement.appendChild(lineTagElement);
      });
    }
    
    cardElement.appendChild(stationLinesElement);
  } else if (card.type === CARD_TYPE.TAXI) {
    // 出租车牌
    cardElement.classList.add('taxi');
    
    const iconElement = document.createElement('div');
    iconElement.className = 'function-icon';
    iconElement.textContent = '🚕';
    cardElement.appendChild(iconElement);
    
    const nameElement = document.createElement('div');
    nameElement.textContent = '出租车';
    cardElement.appendChild(nameElement);
  } else if (card.type === CARD_TYPE.BUS) {
    // 公交车牌
    cardElement.classList.add('bus');
    
    const iconElement = document.createElement('div');
    iconElement.className = 'function-icon';
    iconElement.textContent = '🚌';
    cardElement.appendChild(iconElement);
    
    const nameElement = document.createElement('div');
    nameElement.textContent = '公交车';
    cardElement.appendChild(nameElement);
  }
  
  return cardElement;
}

/**
 * 更新调试信息
 */
function updateDebugInfo() {
  if (!debugMode) return;
  
  // 清空调试内容
  debugContentElement.innerHTML = '';
  
  // 添加AI手牌信息
  const aiHandInfo = document.createElement('div');
  aiHandInfo.innerHTML = '<h4>AI手牌详情</h4>';
  
  // 统计AI手牌中各类型的数量
  const stationCards = aiHand.filter(card => card.type === CARD_TYPE.STATION).length;
  const taxiCards = aiHand.filter(card => card.type === CARD_TYPE.TAXI).length;
  const busCards = aiHand.filter(card => card.type === CARD_TYPE.BUS).length;
  
  const aiCardStats = document.createElement('div');
  aiCardStats.innerHTML = `
    <p>地铁站牌: ${stationCards}张</p>
    <p>出租车牌: ${taxiCards}张</p>
    <p>公交车牌: ${busCards}张</p>
  `;
  aiHandInfo.appendChild(aiCardStats);
  
  // 添加AI决策逻辑信息
  const aiDecisionInfo = document.createElement('div');
  aiDecisionInfo.innerHTML = '<h4>AI决策逻辑</h4>';
  
  // 获取桌面上最后一张牌的信息
  let lastCardInfo = '无';
  if (tableCards.length > 0) {
    const lastCard = tableCards[tableCards.length - 1];
    if (lastCard.type === CARD_TYPE.STATION) {
      lastCardInfo = `地铁站: ${lastCard.name}`;
    } else if (lastCard.type === CARD_TYPE.TAXI) {
      lastCardInfo = '出租车';
    } else if (lastCard.type === CARD_TYPE.BUS) {
      lastCardInfo = '公交车';
    }
  }
  
  const decisionLogic = document.createElement('div');
  decisionLogic.innerHTML = `
    <p>桌面最后一张牌: ${lastCardInfo}</p>    <p>当前回合: ${currentTurn === 'player' ? '玩家' : 'AI'}</p>
    <p>游戏统计:</p>
    <ul>
      <li>总共出牌数: ${gameStats.totalCards}</li>
      <li>经过地铁站数: ${gameStats.metroStations}</li>
      <li>乘坐出租车次数: ${gameStats.taxiRides}</li>
      <li>乘坐公交车次数: ${gameStats.busRides}</li>
    </ul>
  `;
  aiDecisionInfo.appendChild(decisionLogic);
  
  // 将信息添加到调试内容区域
  debugContentElement.appendChild(aiHandInfo);
  debugContentElement.appendChild(aiDecisionInfo);
}
