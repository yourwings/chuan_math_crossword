// 北京地铁漫游 - 真人对战模式核心逻辑

// 导入地铁数据
import { metroData } from './metro_data.js';

// 游戏状态变量
let gameId = null;
let playerId = null;
let playerName = '';
let isHost = false;
let players = [];
let gameStarted = false;

// 游戏数据
let deck = [];
let tableCards = [];
let playerHands = {}; // 玩家ID -> 手牌数组
let currentTurn = null; // 当前回合的玩家ID
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
let setupPanelElement;
let gameContainerElement;
let playerNameInput;
let createGameBtn;
let joinGameBtn;
let joinGamePanel;
let availableGamesElement;
let refreshGamesBtn;
let waitingRoomElement;
let joinedPlayersElement;
let startGameBtn;
let playerHandElement;
let tableCardsElement;
let deckCountElement;
let currentTurnElement;
let gameMessageElement;
let gameResultElement;
let playersListElement;

// 按钮元素
let playMetroBtn;
let playTaxiBtn;
let playBusBtn;
let drawCardBtn;
let cancelSelectionBtn;
let newGameBtn;
let debugBtn;

// 调试元素
let debugInfoElement;
let debugContentElement;

// 模拟网络连接（在实际应用中，这里应该使用WebSocket或其他网络通信方式）
let availableGames = [];

/**
 * 生成游戏ID
 * @returns {string} 游戏ID
 */
function generateGameId() {
  return 'game_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 生成玩家ID
 * @returns {string} 玩家ID
 */
function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  setupPanelElement = document.getElementById('setup-panel');
  gameContainerElement = document.getElementById('game-container');
  playerNameInput = document.getElementById('player-name');
  createGameBtn = document.getElementById('create-game-btn');
  joinGameBtn = document.getElementById('join-game-btn');
  joinGamePanel = document.getElementById('join-game-panel');
  availableGamesElement = document.getElementById('available-games');
  refreshGamesBtn = document.getElementById('refresh-games-btn');
  waitingRoomElement = document.getElementById('waiting-room');
  joinedPlayersElement = document.getElementById('joined-players');
  startGameBtn = document.getElementById('start-game-btn');
  
  playerHandElement = document.getElementById('player-hand');
  tableCardsElement = document.getElementById('table-cards');
  deckCountElement = document.getElementById('deck-count');
  currentTurnElement = document.getElementById('current-turn');
  gameMessageElement = document.getElementById('game-message');
  gameResultElement = document.getElementById('game-result');
  playersListElement = document.getElementById('players-list');
  
  // 获取按钮元素
  playMetroBtn = document.getElementById('play-metro-btn');
  playTaxiBtn = document.getElementById('play-taxi-btn');
  playBusBtn = document.getElementById('play-bus-btn');
  drawCardBtn = document.getElementById('draw-card-btn');
  cancelSelectionBtn = document.getElementById('cancel-selection-btn');
  newGameBtn = document.getElementById('new-game-btn');
  
  // 初始化特殊效果标记
  window.metroCardPlayed = false;
  window.specialEffectPlayed = false;
  
  // 创建调试按钮
  debugBtn = document.createElement('button');
  debugBtn.id = 'debug-btn';
  debugBtn.className = 'action-button';
  debugBtn.textContent = '调试模式';
  debugBtn.style.backgroundColor = '#ff9800';
  
  // 创建调试信息区域
  debugInfoElement = document.createElement('div');
  debugInfoElement.id = 'debug-info';
  debugInfoElement.className = 'debug-info';
  debugInfoElement.style.display = 'none';
  debugInfoElement.style.padding = '10px';
  debugInfoElement.style.margin = '10px 0';
  debugInfoElement.style.backgroundColor = '#f5f5f5';
  debugInfoElement.style.border = '1px solid #ddd';
  debugInfoElement.style.borderRadius = '5px';
  debugInfoElement.innerHTML = '<h3>调试信息</h3><div id="debug-content"></div>';
  
  setupEventListeners();
});



// 这里不需要重复定义函数，已在前面定义过

/**
 * 以下事件监听器已移至setupEventListeners函数中统一定义
 */

/**
 * 验证玩家名称
 * @returns {boolean} 名称是否有效
 */
function validatePlayerName() {
  playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert('请输入你的名字');
    return false;
  }
  return true;
}

/**
 * 创建新游戏
 */
function createGame() {
  isHost = true;
  gameId = generateGameId();
  playerId = generatePlayerId();
  
  // 添加自己作为第一个玩家
  players = [{
    id: playerId,
    name: playerName,
    isHost: true,
    cardsCount: 0
  }];
  
  // 添加到可用游戏列表（模拟）
  availableGames.push({
    id: gameId,
    hostName: playerName,
    playerCount: 1
  });
  
  // 显示等待室
  setupPanelElement.querySelector('.form-group').style.display = 'none';
  waitingRoomElement.style.display = 'block';
  
  // 更新玩家列表
  updateJoinedPlayersList();
}

/**
 * 加入游戏
 * @param {string} gameIdToJoin 要加入的游戏ID
 */
function joinGame(gameIdToJoin) {
  isHost = false;
  gameId = gameIdToJoin;
  playerId = generatePlayerId();
  
  // 模拟加入游戏
  const gameIndex = availableGames.findIndex(game => game.id === gameIdToJoin);
  if (gameIndex !== -1) {
    availableGames[gameIndex].playerCount++;
    
    // 添加自己到玩家列表
    players.push({
      id: playerId,
      name: playerName,
      isHost: false,
      cardsCount: 0
    });
    
    // 显示等待室
    joinGamePanel.style.display = 'none';
    waitingRoomElement.style.display = 'block';
    
    // 更新玩家列表
    updateJoinedPlayersList();
  } else {
    alert('无法加入游戏，请刷新游戏列表重试');
  }
}

/**
 * 刷新可用游戏列表
 */
function refreshAvailableGames() {
  // 清空列表
  availableGamesElement.innerHTML = '';
  
  // 如果没有可用游戏
  if (availableGames.length === 0) {
    availableGamesElement.innerHTML = '<div class="player-list-item">当前没有可用的游戏</div>';
    return;
  }
  
  // 添加每个可用游戏
  availableGames.forEach(game => {
    const gameItem = document.createElement('div');
    gameItem.className = 'player-list-item';
    gameItem.innerHTML = `
      <span>${game.hostName}的游戏 (${game.playerCount}人)</span>
      <button class="action-button">加入</button>
    `;
    
    // 添加加入按钮事件
    const joinButton = gameItem.querySelector('button');
    joinButton.addEventListener('click', () => joinGame(game.id));
    
    availableGamesElement.appendChild(gameItem);
  });
}

/**
 * 更新已加入玩家列表
 */
function updateJoinedPlayersList() {
  // 清空列表
  joinedPlayersElement.innerHTML = '';
  
  // 添加每个玩家
  players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-list-item';
    playerItem.innerHTML = `
      <span>${player.name}${player.isHost ? ' (房主)' : ''}</span>
      <span class="connection-status connected"></span>
    `;
    
    joinedPlayersElement.appendChild(playerItem);
  });
  
  // 更新开始游戏按钮状态
  if (isHost) {
    // 允许单人游戏开始，AI玩家会在startGame函数中添加
    startGameBtn.disabled = false;
    startGameBtn.textContent = '开始游戏';
  } else {
    startGameBtn.style.display = 'none';
  }
}

/**
 * 开始游戏
 */
function startGame() {
  // 允许单人也能开始游戏（临时修改，等网络功能实现后可以恢复）
  // if (!isHost) return;
  
  // 如果没有玩家，添加一个AI玩家
  if (players.length < 2) {
    players.push({
      id: 'ai_player',
      name: 'AI玩家',
      isHost: false,
      cardsCount: 8
    });
  }
  
  // 初始化游戏
  initializeGameData();
  
  // 设置游戏已开始标志
  gameStarted = true;
  
  // 切换到游戏界面
  setupPanelElement.style.display = 'none';
  gameContainerElement.style.display = 'block';
  
  // 更新游戏UI
  updateGameUI();
  
  // 如果处于调试模式，更新调试信息
  if (debugMode && typeof updateDebugInfo === 'function') {
    updateDebugInfo();
  }
}

/**
 * 更新游戏UI
 */
function updateGameUI() {
  // 更新游戏信息
  updateGameInfo();
  
  // 渲染卡牌
  renderCards();
  
  // 更新按钮状态
  updateButtonStates();
  
  // 显示初始游戏消息
  showGameMessage('游戏开始！');
  
  // 检查是否是当前玩家的回合
  if (currentTurn === playerId) {
    showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
  } else {
    showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
  }
  
  // 如果处于调试模式，更新调试信息
  if (debugMode && typeof updateDebugInfo === 'function') {
    updateDebugInfo();
  }
}

/**
 * 初始化游戏数据
 */
function initializeGameData() {
  // 初始化牌组
  initializeCards();
  
  // 发牌给每个玩家
  const cardsPerPlayer = 8;
  players.forEach(player => {
    playerHands[player.id] = deck.splice(0, cardsPerPlayer);
    player.cardsCount = cardsPerPlayer;
  });
  
  // 从牌组中选择一张地铁站牌作为初始桌面牌
  const initialTableCardIndex = deck.findIndex(card => card.type === CARD_TYPE.STATION);
  if (initialTableCardIndex !== -1) {
    const initialTableCard = deck.splice(initialTableCardIndex, 1)[0];
    tableCards = [initialTableCard];
  }
  
  // 设置第一个玩家为当前回合
  currentTurn = players[0].id;
  
  // 重置特殊效果标记
  window.metroCardPlayed = false;
  window.specialEffectPlayed = false;
  
  // 重置出牌模式
  playMode = null;
  selectedCards = [];
  
  // 移除可能存在的结束回合按钮
  const existingEndTurnBtn = document.getElementById('end-turn-btn');
  if (existingEndTurnBtn) {
    existingEndTurnBtn.remove();
  }
}

/**
 * 初始化牌组
 */
function initializeCards() {
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
  
  // 合并所有牌并洗牌
  deck = shuffleArray([...stationCards, ...taxiCards, ...busCards]);
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



// 这里不需要重复定义函数，已在前面定义过

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 创建游戏按钮
  if (createGameBtn) createGameBtn.addEventListener('click', () => {
    if (validatePlayerName()) {
      createGame();
    }
  });
  
  // 加入游戏按钮
  if (joinGameBtn) joinGameBtn.addEventListener('click', () => {
    if (validatePlayerName()) {
      joinGamePanel.style.display = 'block';
      refreshAvailableGames();
    }
  });
  
  // 刷新游戏列表按钮
  if (refreshGamesBtn) refreshGamesBtn.addEventListener('click', refreshAvailableGames);
  
  // 开始游戏按钮
  if (startGameBtn) startGameBtn.addEventListener('click', startGame);
  
  // 添加调试按钮到DOM
  document.querySelector('.action-buttons')?.appendChild(debugBtn);
  document.querySelector('.game-container')?.appendChild(debugInfoElement);
  debugContentElement = document.getElementById('debug-content');
  
  // 添加调试按钮点击事件
  debugBtn.addEventListener('click', () => {
    debugMode = !debugMode;
    debugBtn.textContent = debugMode ? '关闭调试' : '调试模式';
    debugInfoElement.style.display = debugMode ? 'block' : 'none';
    // 更新调试信息
    if (typeof updateDebugInfo === 'function') {
      updateDebugInfo();
    }
  });
}

/**
 * 更新调试信息
 */
function updateDebugInfo() {
  if (!debugMode || !debugContentElement) return;
  
  // 清空调试内容
  debugContentElement.innerHTML = '';
  
  // 添加游戏状态信息
  const gameStateInfo = document.createElement('div');
  gameStateInfo.innerHTML = '<h4>游戏状态信息</h4>';
  
  // 游戏基本信息
  const gameBasicInfo = document.createElement('div');
  gameBasicInfo.innerHTML = `
    <p>游戏ID: ${gameId || '未创建'}</p>
    <p>玩家ID: ${playerId || '未分配'}</p>
    <p>玩家名称: ${playerName || '未设置'}</p>
    <p>房主: ${isHost ? '是' : '否'}</p>
    <p>游戏已开始: ${gameStarted ? '是' : '否'}</p>
    <p>当前回合: ${currentTurn === playerId ? '你的回合' : players.find(p => p.id === currentTurn)?.name || '未开始'}</p>
    <p>出牌模式: ${playMode || '无'}</p>
    <p>特殊效果标记: ${window.specialEffectPlayed ? '已使用' : '未使用'}</p>
    <p>地铁牌出牌标记: ${window.metroCardPlayed ? '已出牌' : '未出牌'}</p>
  `;
  gameStateInfo.appendChild(gameBasicInfo);
  
  // 玩家信息
  const playersInfo = document.createElement('div');
  playersInfo.innerHTML = '<h4>玩家信息</h4>';
  
  const playersList = document.createElement('ul');
  players.forEach(player => {
    const playerItem = document.createElement('li');
    playerItem.textContent = `${player.name}${player.isHost ? ' (房主)' : ''} - 手牌数量: ${player.cardsCount}`;
    playersList.appendChild(playerItem);
  });
  playersInfo.appendChild(playersList);
  
  // 牌组信息
  const deckInfo = document.createElement('div');
  deckInfo.innerHTML = `
    <h4>牌组信息</h4>
    <p>牌堆剩余: ${deck.length}张</p>
    <p>桌面牌数量: ${tableCards.length}张</p>
  `;
  
  // 桌面最后一张牌信息
  if (tableCards.length > 0) {
    const lastCard = tableCards[tableCards.length - 1];
    let lastCardInfo = '';
    
    if (lastCard.type === CARD_TYPE.STATION) {
      lastCardInfo = `地铁站: ${lastCard.name} (线路: ${lastCard.lines.join(', ')})`;
    } else if (lastCard.type === CARD_TYPE.TAXI) {
      lastCardInfo = '出租车';
    } else if (lastCard.type === CARD_TYPE.BUS) {
      lastCardInfo = '公交车';
    }
    
    const lastCardElement = document.createElement('p');
    lastCardElement.innerHTML = `桌面最后一张牌: ${lastCardInfo}`;
    deckInfo.appendChild(lastCardElement);
  }
  
  // 游戏统计
  const statsInfo = document.createElement('div');
  statsInfo.innerHTML = `
    <h4>游戏统计</h4>
    <p>总共出牌数: ${gameStats.totalCards}</p>
    <p>经过地铁站数: ${gameStats.metroStations}</p>
    <p>乘坐出租车次数: ${gameStats.taxiRides}</p>
    <p>乘坐公交车次数: ${gameStats.busRides}</p>
  `;
  
  // 将所有信息添加到调试内容区域
  debugContentElement.appendChild(gameStateInfo);
  debugContentElement.appendChild(playersInfo);
  debugContentElement.appendChild(deckInfo);
  debugContentElement.appendChild(statsInfo);

  
  // 出牌按钮
  if (playMetroBtn) playMetroBtn.addEventListener('click', () => handlePlayMode('metro'));
  if (playTaxiBtn) playTaxiBtn.addEventListener('click', () => handlePlayMode('taxi'));
  if (playBusBtn) playBusBtn.addEventListener('click', () => handlePlayMode('bus'));
  
  // 摸牌按钮
  if (drawCardBtn) drawCardBtn.addEventListener('click', handleDrawCard);
  
  /**
   * 处理摸牌
   */
  function handleDrawCard() {
    if (currentTurn !== playerId || gameOver) return;
    
    // 检查是否有选中的牌
    if (selectedCards.length > 0) {
      showGameMessage('你已经选择了牌，不能摸牌');
      return;
    }
    
    // 检查牌堆是否为空
    if (deck.length === 0) {
      showGameMessage('牌堆已经空了');
      return;
    }
    
    // 从牌堆摸一张牌
    const newCard = deck.pop();
    playerHands[playerId].push(newCard);
    
    // 更新玩家手牌数量
    const player = players.find(p => p.id === playerId);
    if (player) {
      player.cardsCount++;
    }
    
    // 更新UI
    renderCards();
    updateButtonStates();
    
    // 显示消息
    showGameMessage(`摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌`);
    
    // 切换到下一个玩家
    const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentTurn = players[nextPlayerIndex].id;
    
    // 更新UI
    updateGameInfo();
    
    // 显示提示信息
    if (currentTurn === playerId) {
      showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
    } else {
      showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
      
      // 如果是AI玩家，模拟AI出牌
      if (currentTurn === 'ai_player') {
        setTimeout(simulateAIPlay, 1500);
      }
    }
  }
  
  // 取消选择按钮
  if (cancelSelectionBtn) cancelSelectionBtn.addEventListener('click', () => {
    // 取消所有已选择的牌
    document.querySelectorAll('.card.selected').forEach(el => {
      el.classList.remove('selected');
    });
    selectedCards = [];
    
    // 更新按钮状态
    updateButtonStates();
    showGameMessage('已取消选择');
  });
  
  // 新游戏按钮
  if (newGameBtn) newGameBtn.addEventListener('click', () => {
    // 重置游戏状态
    gameStarted = false;
    gameId = null;
    playerId = null;
    isHost = false;
    players = [];
    
    // 显示设置面板，隐藏游戏界面
    setupPanelElement.style.display = 'block';
    setupPanelElement.querySelector('.form-group').style.display = 'block';
    waitingRoomElement.style.display = 'none';
    joinGamePanel.style.display = 'none';
    gameContainerElement.style.display = 'none';
  });
}

/**
 * 更新游戏信息显示
 */
function updateGameInfo() {
  // 更新牌堆剩余数量
  if (deckCountElement) {
    deckCountElement.textContent = `牌堆剩余: ${deck.length}`;
  }
  
  // 更新当前回合信息
  if (currentTurnElement) {
    currentTurnElement.textContent = `当前回合: ${currentTurn === playerId ? '你的回合' : players.find(p => p.id === currentTurn)?.name || '对方回合'}`;
  }
  
  // 更新玩家列表
  updatePlayersList();
}

/**
 * 更新玩家列表显示
 */
function updatePlayersList() {
  if (!playersListElement) return;
  
  // 清空列表
  playersListElement.innerHTML = '';
  
  // 添加每个玩家
  players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-list-item';
    
    // 高亮当前回合的玩家
    if (player.id === currentTurn) {
      playerItem.classList.add('current-turn');
    }
    
    // 显示玩家信息
    playerItem.innerHTML = `
      <span>${player.name}${player.isHost ? ' (房主)' : ''}</span>
      <span class="cards-count">手牌: ${player.cardsCount}</span>
    `;
    
    playersListElement.appendChild(playerItem);
  });
}

/**
 * 检查游戏是否结束
 * @returns {boolean} 游戏是否结束
 */
function checkGameEnd() {
  // 检查是否有玩家手牌为空
  const emptyHandPlayer = players.find(player => playerHands[player.id]?.length === 0);
  
  if (emptyHandPlayer) {
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
    if (emptyHandPlayer.id === playerId) {
      titleElement.textContent = '恭喜你赢了！';
      gameResultElement.className = 'game-result win';
    } else {
      titleElement.textContent = `${emptyHandPlayer.name}赢了，再接再厉！`;
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
    newGameBtnElement.onclick = () => newGameBtn.click();
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
 * 模拟AI玩家出牌
 */
function simulateAIPlay() {
  if (currentTurn !== 'ai_player' || gameOver) return;
  
  // 获取AI玩家的手牌
  const aiHand = playerHands['ai_player'];
  
  // 如果没有手牌，结束游戏
  if (!aiHand || aiHand.length === 0) {
    checkGameEnd();
    return;
  }
  
  // 简单AI策略：优先出地铁站牌，其次出功能牌
  let cardToPlay = null;
  let cardIndex = -1;
  let playType = null;
  
  // 首先尝试找一张可以出的地铁站牌
  for (let i = 0; i < aiHand.length; i++) {
    if (aiHand[i].type === CARD_TYPE.STATION) {
      // 检查是否符合规则
      if (isValidPlay([aiHand[i]], 'metro')) {
        cardToPlay = aiHand[i];
        cardIndex = i;
        playType = 'metro';
        break;
      }
    }
  }
  
  // 如果没有找到可以出的地铁站牌，尝试出功能牌
  if (!cardToPlay) {
    // 尝试出出租车
    for (let i = 0; i < aiHand.length; i++) {
      if (aiHand[i].type === CARD_TYPE.TAXI) {
        cardToPlay = aiHand[i];
        cardIndex = i;
        playType = 'taxi';
        break;
      }
    }
    
    // 如果没有出租车，尝试出公交车
    if (!cardToPlay) {
      for (let i = 0; i < aiHand.length; i++) {
        if (aiHand[i].type === CARD_TYPE.BUS) {
          cardToPlay = aiHand[i];
          cardIndex = i;
          playType = 'bus';
          break;
        }
      }
    }
  }
  
  // 如果找到了可以出的牌
  if (cardToPlay) {
    // 设置出牌模式
    playMode = playType;
    
    // 将牌放到桌面上
    tableCards.push(cardToPlay);
    
    // 从手牌中移除
    aiHand.splice(cardIndex, 1);
    
    // 更新游戏统计数据
    if (playType === 'metro') {
      gameStats.metroStations += 1;
    } else if (playType === 'taxi') {
      gameStats.taxiRides += 1;
      
      // 出租车特殊效果：摸一张牌
      if (deck.length > 0) {
        const newCard = deck.pop();
        aiHand.push(newCard);
      }
    } else if (playType === 'bus') {
      gameStats.busRides += 1;
      
      // 公交车特殊效果：将倒数第二张地铁牌放到牌堆末尾
      const stationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION);
      if (stationCards.length >= 2) {
        const secondLastStationIndex = tableCards.findIndex((card, index) => {
          if (card.type !== CARD_TYPE.STATION) return false;
          const stationsAfter = tableCards.slice(index + 1).filter(c => c.type === CARD_TYPE.STATION);
          return stationsAfter.length === 1;
        });
        
        if (secondLastStationIndex !== -1) {
          const secondLastStation = tableCards[secondLastStationIndex];
          tableCards.splice(secondLastStationIndex, 1);
          tableCards.push(secondLastStation);
        }
      }
    }
    gameStats.totalCards += 1;
    
    // 显示消息
    showGameMessage(`AI玩家出了一张${playType === 'metro' ? '地铁站' : playType === 'taxi' ? '出租车' : '公交车'}牌`);
  } else {
    // 如果没有可以出的牌，摸一张牌
    if (deck.length > 0) {
      const newCard = deck.pop();
      aiHand.push(newCard);
      showGameMessage('AI玩家摸了一张牌');
    } else {
      showGameMessage('AI玩家没有可出的牌，但牌堆已空');
    }
  }
  
  // 更新UI
  renderCards();
  
  // 检查游戏是否结束
  if (checkGameEnd()) return;
  
  // 重置特殊效果标记
  window.metroCardPlayed = false;
  window.specialEffectPlayed = false;
  playMode = null;
  
  // 切换到下一个玩家
  const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  currentTurn = players[nextPlayerIndex].id;
  
  // 更新UI
  updateGameInfo();
  
  // 显示提示信息
  if (currentTurn === playerId) {
    showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
    // 确保在玩家回合开始时更新按钮状态
    updateButtonStates();
  } else {
    showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
    
    // 如果还是AI玩家，继续模拟AI出牌
    if (currentTurn === 'ai_player') {
      setTimeout(simulateAIPlay, 1500);
    }
  }
}

/**
 * 更新按钮状态
 */
function updateButtonStates() {
  // 根据当前回合和游戏状态更新按钮状态
  const isCurrentPlayerTurn = currentTurn === playerId; // 检查是否是当前玩家的回合
  const hasSelectedCards = selectedCards.length > 0;
  
  // 默认所有按钮都是禁用的
  if (playMetroBtn) playMetroBtn.disabled = true;
  if (playTaxiBtn) playTaxiBtn.disabled = true;
  if (playBusBtn) playBusBtn.disabled = true;
  if (drawCardBtn) drawCardBtn.disabled = true;
  if (cancelSelectionBtn) cancelSelectionBtn.disabled = true;
  
  // 如果不是当前玩家的回合或游戏已结束，所有按钮都保持禁用状态
  if (!isCurrentPlayerTurn || gameOver) return;
  
  // 检查玩家手牌中是否有可以出的牌
  const playerCards = playerHands[playerId] || [];
  const hasMetroCards = playerCards.some(card => card.type === CARD_TYPE.STATION);
  const hasTaxiCards = playerCards.some(card => card.type === CARD_TYPE.TAXI);
  const hasBusCards = playerCards.some(card => card.type === CARD_TYPE.BUS);
  
  // 检查是否是特殊效果后的出牌
  const isSpecialEffectPlay = window.specialEffectPlayed || false;
  
  // 检查是否已经出过一张地铁牌
  const hasPlayedMetroCard = window.metroCardPlayed || false;
  
  // 根据当前状态启用相应按钮
  if (hasSelectedCards) {
    // 如果已选择牌，只启用对应类型的出牌按钮和取消选择按钮
    const selectedCardType = selectedCards[0].card.type;
    
    if (selectedCardType === CARD_TYPE.STATION) {
      // 如果是特殊效果后的出牌，只能出地铁牌
      if (isSpecialEffectPlay || hasPlayedMetroCard) {
        // 检查是否符合出牌规则
        playMetroBtn.disabled = !isValidPlay(selectedCards.map(c => c.card), 'metro');
      } else {
        playMetroBtn.disabled = !isValidPlay(selectedCards.map(c => c.card), 'metro');
      }
    } else if (selectedCardType === CARD_TYPE.TAXI && !isSpecialEffectPlay && !hasPlayedMetroCard) {
      playTaxiBtn.disabled = false;
    } else if (selectedCardType === CARD_TYPE.BUS && !isSpecialEffectPlay && !hasPlayedMetroCard) {
      playBusBtn.disabled = false;
    }
    
    cancelSelectionBtn.disabled = false;
  } else {
    // 如果没有选择牌，根据当前状态启用相应按钮
    if (isSpecialEffectPlay) {
      // 特殊效果后只能出地铁牌
      playMetroBtn.disabled = !hasMetroCards;
      // 确保其他按钮都是禁用的
      playTaxiBtn.disabled = true;
      playBusBtn.disabled = true;
      drawCardBtn.disabled = true;
    } else if (hasPlayedMetroCard) {
      // 已出过一张地铁牌，只能再出一张地铁牌
      playMetroBtn.disabled = !hasMetroCards;
      // 确保其他按钮都是禁用的
      playTaxiBtn.disabled = true;
      playBusBtn.disabled = true;
      drawCardBtn.disabled = true;
    } else {
      // 正常回合，可以出任意类型的牌
      playMetroBtn.disabled = !hasMetroCards;
      playTaxiBtn.disabled = !hasTaxiCards;
      playBusBtn.disabled = !hasBusCards;
      drawCardBtn.disabled = false;
    }
  }
  
  // 在每次更新按钮状态后，确保在控制台输出当前状态，便于调试
  console.log('按钮状态更新：', {
    isCurrentPlayerTurn,
    hasMetroCards,
    hasTaxiCards,
    hasBusCards,
    isSpecialEffectPlay,
    hasPlayedMetroCard,
    playMetroBtnDisabled: playMetroBtn ? playMetroBtn.disabled : 'N/A',
    playTaxiBtnDisabled: playTaxiBtn ? playTaxiBtn.disabled : 'N/A',
    playBusBtnDisabled: playBusBtn ? playBusBtn.disabled : 'N/A'
  });
}

/**
 * 显示游戏消息
 * @param {string} message 要显示的消息
 */
function showGameMessage(message) {
  if (gameMessageElement) {
    gameMessageElement.textContent = message;
  }
}

/**
 * 渲染卡牌
 */
function renderCards() {
  // 渲染玩家手牌
  if (playerHandElement && playerHands[playerId]) {
    playerHandElement.innerHTML = '';
    playerHands[playerId].forEach((card, index) => {
      const cardElement = createCardElement(card, index, true);
      playerHandElement.appendChild(cardElement);
    });
  }
  
  // 渲染桌面牌，只显示最后10张牌，横向显示以节省空间
  if (tableCardsElement) {
    tableCardsElement.innerHTML = '';
    // 设置为横向显示
    tableCardsElement.style.display = 'flex';
    tableCardsElement.style.flexDirection = 'row';
    tableCardsElement.style.flexWrap = 'wrap';
    tableCardsElement.style.gap = '5px';
    tableCardsElement.style.overflowX = 'auto';
    
    // 只显示最后10张牌
    const cardsToShow = tableCards.length > 10 ? tableCards.slice(-10) : tableCards;
    cardsToShow.forEach((card, index) => {
      // 计算实际索引，用于正确显示牌的ID
      const actualIndex = tableCards.length > 10 ? (tableCards.length - 10 + index) : index;
      const cardElement = createCardElement(card, actualIndex, true, true);
      tableCardsElement.appendChild(cardElement);
    });
    
    // 如果有超过10张牌，显示提示信息
    if (tableCards.length > 10) {
      const infoElement = document.createElement('div');
      infoElement.className = 'cards-info';
      infoElement.textContent = `显示最后 10/${tableCards.length} 张牌`;
      infoElement.style.width = '100%';
      tableCardsElement.prepend(infoElement);
    }
  }
}

/**
 * 创建卡牌元素
 * @param {Object} card 卡牌数据
 * @param {number} index 卡牌索引
 * @param {boolean} showContent 是否显示卡牌内容
 * @param {boolean} isTableCard 是否是桌面牌
 * @returns {HTMLElement} 卡牌元素
 */
function createCardElement(card, index, showContent = true, isTableCard = false) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.id = isTableCard ? `table-card-${index}` : `player-card-${index}`;
  
  if (card.type === CARD_TYPE.STATION) {
    // 地铁站牌
    if (showContent) {
      // 站名
      const stationNameElement = document.createElement('div');
      stationNameElement.className = 'station-name';
      stationNameElement.textContent = card.name;
      cardElement.appendChild(stationNameElement);
      
      // 添加线路标签
      const stationLinesElement = document.createElement('div');
      stationLinesElement.className = 'station-lines';
      
      // 获取站点信息
      const stationInfo = metroData.stations.find(s => s.name === card.name);
      if (stationInfo && stationInfo.lines) {
        stationInfo.lines.forEach(line => {
          const lineTagElement = document.createElement('div');
          lineTagElement.className = 'line-tag';
          
          // 获取线路名称而不是ID
          let lineName = '';
          if (typeof line === 'number') {
            lineName = `${line}`;
          } else if (line === 'S1') {
            lineName = 'S1';
          } else if (line === 'sdjc') {
            lineName = '机场';
          } else if (line === 'dxjc') {
            lineName = '大兴';
          } else if (line === 'cp') {
            lineName = '昌平';
          } else if (line === 'yz') {
            lineName = '亦庄';
          } else if (line === 'fs') {
            lineName = '房山';
          } else if (line === 'xj') {
            lineName = '西郊';
          } else if (line === 'yf') {
            lineName = '燕房';
          } else if (line === 'yzt1') {
            lineName = '亦T1';
          } else {
            lineName = line;
          }
          
          lineTagElement.textContent = lineName;
          lineTagElement.style.backgroundColor = LINE_COLORS[line] || '#999';
          stationLinesElement.appendChild(lineTagElement);
        });
      }
      
      cardElement.appendChild(stationLinesElement);
    } else {
      // 背面
      cardElement.classList.add('card-back');
      cardElement.textContent = '地铁站';
    }
  } else if (card.type === CARD_TYPE.TAXI) {
    // 出租车牌
    cardElement.classList.add('function-card');
    cardElement.classList.add('taxi');
    
    if (showContent) {
      const nameElement = document.createElement('div');
      nameElement.className = 'station-name';
      nameElement.textContent = '出租车';
      cardElement.appendChild(nameElement);
      
      const iconElement = document.createElement('div');
      iconElement.className = 'card-icon';
      iconElement.textContent = '🚕';
      cardElement.appendChild(iconElement);
    } else {
      cardElement.classList.add('card-back');
      cardElement.textContent = '功能牌';
    }
  } else if (card.type === CARD_TYPE.BUS) {
    // 公交车牌
    cardElement.classList.add('function-card');
    cardElement.classList.add('bus');
    
    if (showContent) {
      const nameElement = document.createElement('div');
      nameElement.className = 'station-name';
      nameElement.textContent = '公交车';
      cardElement.appendChild(nameElement);
      
      const iconElement = document.createElement('div');
      iconElement.className = 'card-icon';
      iconElement.textContent = '🚌';
      cardElement.appendChild(iconElement);
    } else {
      cardElement.classList.add('card-back');
      cardElement.textContent = '功能牌';
    }
  }
  
  // 如果是玩家的手牌，添加点击事件
  if (!isTableCard && showContent) {
    cardElement.addEventListener('click', () => handleCardSelection(card, index));
  }
  
  return cardElement;
}

/**
 * 处理卡牌选择
 * @param {Object} card 选择的卡牌
 * @param {number} index 卡牌在手牌中的索引
 */
function handleCardSelection(card, index) {
  if (currentTurn !== playerId || gameOver) return;
  
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
 * 处理出牌模式选择
 * @param {string} mode 出牌模式
 */
function handlePlayMode(mode) {
  if (currentTurn !== playerId || gameOver) return;
  
  // 检查是否是特殊效果后的出牌
  if (window.specialEffectPlayed) {
    // 特殊效果后只能出地铁牌
    if (mode !== 'metro') {
      showGameMessage('特殊效果后只能出地铁站牌');
      return;
    }
  }
  
  // 检查是否已经出过地铁牌
  if (window.metroCardPlayed && mode !== 'metro') {
    showGameMessage('已经出过地铁牌，只能再出一张地铁站牌或结束回合');
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
      if (window.metroCardPlayed) {
        message = '请选择要出的第二张地铁站牌';
      } else if (window.specialEffectPlayed) {
        message = '特殊效果：请选择要出的地铁站牌';
      } else {
        message = '请选择要出的地铁站牌';
      }
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
 * 检查出牌是否符合规则
 * @param {Array} cards 要出的牌
 * @param {string} mode 出牌模式
 * @returns {boolean} 是否符合规则
 */
function isValidPlay(cards, mode) {
  // 基本检查：必须有牌
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
      // 检查是否是出租车特殊效果后的出牌
      if (window.specialEffectPlayed && playMode === 'metro') {
        // 出租车特殊效果：可以出任意地铁站牌，不需要检查连通性
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
 * 处理玩家出牌
 */
function handlePlayerPlay() {
  if (selectedCards.length === 0) return;
  
  // 获取选中的牌
  const cardsToPlay = selectedCards.map(c => c.card);
  
  // 检查是否符合出牌规则
  if (!isValidPlay(cardsToPlay, playMode)) {
    showGameMessage('出牌不符合规则，请重新选择');
    return;
  }
  
  // 处理特殊牌效果
  let effectMessage = '';
  let specialAction = false;
  
  // 根据出牌模式设置特殊效果
  if (playMode === 'metro') {
    // 检查是否已经出过一张地铁牌
    if (window.metroCardPlayed) {
      // 如果已经出过一张地铁牌，这是第二张
      effectMessage = '已打出第二张地铁站牌，回合将结束';
      // 第二张地铁牌后不再有特殊行动
      specialAction = false;
    } else {
      // 第一张地铁牌
      effectMessage = '可以选择打出第二张地铁站牌或结束回合';
      specialAction = true;
      // 标记已经出过一张地铁牌
      window.metroCardPlayed = true;
      console.log('出第一张地铁牌，specialAction =', specialAction);
    }
  } else if (playMode === 'taxi') {
    // 出租车牌特殊效果：出牌后摸一张牌并可选择打出一张地铁牌
    effectMessage = '出租车可以连接任意两个地铁站！摸一张牌后可以选择打出一张地铁牌';
    specialAction = true;
    // 设置特殊效果标记，表示这是特殊效果后的出牌，只能出一张地铁牌
    window.specialEffectPlayed = true;
    
    // 摸一张牌
    if (deck.length > 0) {
      const newCard = deck.pop();
      playerHands[playerId].push(newCard);
      players.find(p => p.id === playerId).cardsCount++;
    }
  } else if (playMode === 'bus') {
    // 公交车牌特殊效果：将倒数第二张地铁牌放到牌堆末尾
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
        // 将倒数第二张地铁站牌移到牌堆末尾
        const secondLastStation = tableCards[secondLastStationIndex];
        tableCards.splice(secondLastStationIndex, 1);
        tableCards.push(secondLastStation);
        effectMessage = `公交车将${secondLastStation.name}站移到了牌堆末尾！可以选择打出一张地铁牌`;
        specialAction = true; // 公交车也设置为特殊行动，允许继续出一张地铁牌
        // 设置特殊效果标记，表示这是特殊效果后的出牌，只能出一张地铁牌
        window.specialEffectPlayed = true;
      } else {
        effectMessage = '公交车效果：无法找到倒数第二张地铁站牌';
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
    specialAction = false;
    console.log('检测到特殊效果后出牌');
  }
  
  // 将牌放到桌面上
  tableCards = [...tableCards, ...cardsToPlay];
  
  // 从手牌中移除出的牌（从大索引到小索引，避免删除影响索引）
  selectedCards.sort((a, b) => b.index - a.index);
  for (const selected of selectedCards) {
    playerHands[playerId].splice(selected.index, 1);
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
  updateButtonStates();
  
  // 检查游戏是否结束
  if (checkGameEnd()) return;
  
  // 如果是地铁牌，并且是第二张，直接结束回合
  if (playMode === 'metro' && window.metroCardPlayed && !specialAction) {
    // 如果已经出过一张地铁牌，这是第二张，直接结束回合
    
    // 移除所有可能存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 重置标记
    window.metroCardPlayed = false;
    
    // 切换到下一个玩家
    const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentTurn = players[nextPlayerIndex].id;
    
    // 更新UI
    updateGameInfo();
    
    // 显示提示信息
    showGameMessage('已打出第二张地铁牌，自动结束回合');
    if (currentTurn === playerId) {
      showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
    } else {
      showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
      
      // 如果是AI玩家，模拟AI出牌
      if (currentTurn === 'ai_player') {
        setTimeout(simulateAIPlay, 1500);
      }
    }
    return;
  }
  
  // 处理特殊效果：出租车或公交车后可以选择打出一张地铁牌，或者第一张地铁牌后可以选择打出第二张
  console.log('处理特殊效果，specialAction =', specialAction, 'playMode =', playMode, 'metroCardPlayed =', window.metroCardPlayed);
  
  // 如果是特殊效果后出的地铁牌，直接结束回合
  if (isSpecialEffectPlay) {
    console.log('特殊效果后出完地铁牌，自动结束回合');
    
    // 移除所有可能存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 重置标记
    window.metroCardPlayed = false;
    
    // 切换到下一个玩家
    const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentTurn = players[nextPlayerIndex].id;
    
    // 更新UI
    updateGameInfo();
    showGameMessage('特殊效果后出完地铁牌，自动结束回合');
    
    // 显示提示信息
    if (currentTurn === playerId) {
      showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
    } else {
      showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
      
      // 如果是AI玩家，模拟AI出牌
      if (currentTurn === 'ai_player') {
        setTimeout(simulateAIPlay, 1500);
      }
    }
    return;
  }
  
  if (specialAction) {
    console.log('进入特殊行动处理流程');
    
    // 如果是出租车，先摸一张牌
    if (playMode === 'taxi') {
      // 摸一张牌已在前面处理
      showGameMessage(`摸了一张${playerHands[playerId][playerHands[playerId].length-1].type === CARD_TYPE.STATION ? '地铁站' : playerHands[playerId][playerHands[playerId].length-1].type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌，可以选择打出一张地铁站牌或结束回合`);
      console.log('出租车效果：摸了一张牌');
      // 设置出牌模式为地铁，并标记这是特殊效果后的出牌（只能出一张）
      playMode = 'metro';
      // 添加一个标记，表示这是特殊效果后的出牌，只能出一张
      window.specialEffectPlayed = true;
    } else if (playMode === 'bus') {
      // 公交车效果已经在前面处理过了
      showGameMessage('公交车效果已生效，可以选择打出一张地铁站牌或结束回合');
      console.log('公交车效果已处理完毕');
      // 设置出牌模式为地铁，并标记这是特殊效果后的出牌（只能出一张）
      playMode = 'metro';
      // 添加一个标记，表示这是特殊效果后的出牌，只能出一张
      window.specialEffectPlayed = true;
    } else if (playMode === 'metro') {
      // 地铁牌效果：可以出第二张地铁牌
      showGameMessage('可以选择打出第二张地铁站牌或结束回合');
    }
    
    // 移除所有可能已存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 创建结束回合按钮
    const endTurnBtn = document.createElement('button');
    endTurnBtn.id = 'end-turn-btn';
    endTurnBtn.className = 'action-button';
    endTurnBtn.textContent = '结束回合';
    document.querySelector('.action-buttons').appendChild(endTurnBtn);
    console.log('创建了结束回合按钮');
    
    // 添加结束回合按钮点击事件
    endTurnBtn.addEventListener('click', () => {
      // 移除结束回合按钮
      endTurnBtn.remove();
      
      // 重置标记
      window.metroCardPlayed = false;
      window.specialEffectPlayed = false;
      
      // 切换到下一个玩家
      const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      currentTurn = players[nextPlayerIndex].id;
      
      // 更新UI
      updateGameInfo();
      showGameMessage('回合结束');
      
      // 显示提示信息
      if (currentTurn === playerId) {
        showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
      } else {
        showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
        
        // 如果是AI玩家，模拟AI出牌
        if (currentTurn === 'ai_player') {
          setTimeout(simulateAIPlay, 1500);
        }
      }
    });
    
    // 设置出牌模式为地铁，并标记这是特殊效果后的出牌（只能出一张）
    playMode = 'metro';
    // 添加一个标记，表示这是特殊效果后的出牌，只能出一张
    window.specialEffectPlayed = true;
    // 修改提示信息，明确告知玩家只能出一张地铁牌
    showGameMessage('可以出一张地铁站牌，出完后将自动结束回合');
    updateButtonStates();
    return;
  } else {
    console.log('未触发特殊行动处理流程');
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
      
      // 切换到下一个玩家
      const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      currentTurn = players[nextPlayerIndex].id;
      
      // 更新UI
      updateGameInfo();
      showGameMessage('已出过地铁牌，自动结束回合');
      
      // 显示提示信息
      if (currentTurn === playerId) {
        showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
      } else {
        showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
        
        // 如果是AI玩家，模拟AI出牌
        if (currentTurn === 'ai_player') {
          setTimeout(simulateAIPlay, 1500);
        }
      }
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
    document.querySelector('.action-buttons').appendChild(endTurnBtn);
    
    // 添加结束回合按钮点击事件
    endTurnBtn.addEventListener('click', () => {
      // 移除结束回合按钮
      endTurnBtn.remove();
      
      // 重置标记
      window.metroCardPlayed = false;
      window.specialEffectPlayed = false;
      
      // 切换到下一个玩家
      const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      currentTurn = players[nextPlayerIndex].id;
      
      // 更新UI
      updateGameInfo();
      showGameMessage('回合结束');
      
      // 显示提示信息
      if (currentTurn === playerId) {
        showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
      } else {
        showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
        
        // 如果是AI玩家，模拟AI出牌
        if (currentTurn === 'ai_player') {
          setTimeout(simulateAIPlay, 1500);
        }
      }
    });
    
    showGameMessage('可以选择打出第二张地铁站牌或结束回合');
    return;
  }
  
  // 切换到下一个玩家
  const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  currentTurn = players[nextPlayerIndex].id;
  
  // 更新UI
  updateGameInfo();
  
  // 显示提示信息
  if (currentTurn === playerId) {
    showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
  } else {
    showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
    
    // 如果是AI玩家，模拟AI出牌
    if (currentTurn === 'ai_player') {
      setTimeout(simulateAIPlay, 1500);
    }
  }
    
    // 确保按钮可见
    endTurnBtn.style.display = 'inline-block';
    endTurnBtn.style.zIndex = '1000';
    
    // 如果是出租车或公交车特殊效果，设置出牌模式为地铁
    if (playMode === 'taxi' || playMode === 'bus') {
      playMode = 'metro';
      // 添加一个标记，表示这是特殊效果后的出牌，只能出一张
      window.specialEffectPlayed = true;
      showGameMessage('可以出一张地铁站牌，出完后将自动结束回合');
      console.log('特殊效果标记已设置:', window.specialEffectPlayed);
    }
    
    updateButtonStates();
    
    // 更新调试信息
    if (debugMode && typeof updateDebugInfo === 'function') {
      updateDebugInfo();
    }
    return;
  }
  
  /*if (isSpecialEffectPlay) {
    // 如果是特殊效果后出的地铁牌，直接结束回合
    
    // 移除所有可能存在的结束回合按钮
    const allEndTurnBtns = document.querySelectorAll('#end-turn-btn');
    allEndTurnBtns.forEach(btn => btn.remove());
    
    // 重置标记
    window.metroCardPlayed = false;
    window.specialEffectPlayed = false;
    
    // 切换到下一个玩家
    const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentTurn = players[nextPlayerIndex].id;
    
    // 更新UI
    updateGameInfo();
    
    // 显示提示信息
    showGameMessage('特殊效果后出完地铁牌，自动结束回合');
    if (currentTurn === playerId) {
      showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
    } else {
      showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
      
      // 如果是AI玩家，模拟AI出牌
      if (currentTurn === 'ai_player') {
        setTimeout(simulateAIPlay, 1500);
      }
    }
    //return;
  } else {
    // 正常出牌结束回合
    // 切换到下一个玩家
    const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentTurn = players[nextPlayerIndex].id;
    
    // 更新UI
    updateGameInfo();
    
    // 显示提示信息
    if (currentTurn === playerId) {
      showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
    } else {
      showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
      
      // 如果是AI玩家，模拟AI出牌
      if (currentTurn === 'ai_player') {
        setTimeout(simulateAIPlay, 1500);
      }
    }
  }
*/

// 此函数已在文件前面定义

/**
 * 处理摸牌
 */
function handleDrawCard() {
  if (currentTurn !== playerId || gameOver) return;
  
  // 检查牌堆是否为空，如果为空则重新洗牌
  if (deck.length === 0) {
    // 收集所有已出的牌（除了桌面上的牌）
    const discardedCards = [];
    // 这里可以添加收集弃牌堆的逻辑
    
    // 重新洗牌
    deck = shuffleArray(discardedCards);
    showGameMessage('牌堆已重新洗牌');
  }
  
  // 从牌堆中摸一张牌
  if (deck.length > 0) {
    const newCard = deck.pop();
    playerHands[playerId].push(newCard);
    players.find(p => p.id === playerId).cardsCount++;
    
    // 更新UI
    renderCards();
    updateGameInfo();
    showGameMessage(`摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌`);
    
    // 切换到下一个玩家
    const currentPlayerIndex = players.findIndex(p => p.id === currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentTurn = players[nextPlayerIndex].id;
    
    // 更新UI
    updateGameInfo();
    
    // 显示提示信息
    if (currentTurn === playerId) {
      showGameMessage('轮到你的回合了，请选择一张牌出牌或摸牌');
    } else {
      showGameMessage(`等待 ${players.find(p => p.id === currentTurn)?.name || '对方'} 出牌...`);
      
      // 如果是AI玩家，模拟AI出牌
      if (currentTurn === 'ai_player') {
        setTimeout(simulateAIPlay, 1500);
      }
    }
  } else {
    showGameMessage('牌堆已空，无法摸牌');
  }
}
