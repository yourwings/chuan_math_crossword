// 北京地铁漫游 - 多人对战模式核心逻辑

// 导入地铁数据
import { metroData } from './metro_data.js';

// 游戏状态变量
let gameState = {
  players: [],          // 玩家列表
  currentTurn: 0,       // 当前回合玩家索引
  tableCards: [],       // 桌面牌
  deck: [],             // 牌堆
  gameStarted: false,   // 游戏是否开始
  roomOwner: null,      // 房主
  selectedCards: [],    // 选中的卡牌
  playMode: null        // 当前出牌模式：'metro', 'taxi', 'bus' 或 null
};

// 牌组类型常量
const CARD_TYPE = {
  STATION: 'station',
  TAXI: 'taxi',
  BUS: 'bus'
};

// 玩家类
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.hand = [];     // 手牌
    this.isReady = false;
    this.score = 0;     // 玩家得分
  }
}

// DOM元素
const playerNameInput = document.getElementById('player-name');
const createGameBtn = document.getElementById('create-game-btn');
const joinGameBtn = document.getElementById('join-game-btn');
const startGameBtn = document.getElementById('start-game-btn');
const refreshGamesBtn = document.getElementById('refresh-games-btn');
const setupPanel = document.getElementById('setup-panel');
const joinGamePanel = document.getElementById('join-game-panel');
const waitingRoom = document.getElementById('waiting-room');
const gameContainer = document.getElementById('game-container');
const availableGames = document.getElementById('available-games');
const joinedPlayers = document.getElementById('joined-players');
const playerHand = document.getElementById('player-hand');
const tableCards = document.getElementById('table-cards');
const deckCount = document.getElementById('deck-count');
const currentTurn = document.getElementById('current-turn');
const gameMessage = document.getElementById('game-message');

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
  // 创建游戏按钮点击事件
  createGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      alert('请输入你的名字');
      return;
    }
    createGame(playerName);
  });

  // 加入游戏按钮点击事件
  joinGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      alert('请输入你的名字');
      return;
    }
    showJoinGamePanel();
  });

  // 刷新游戏列表按钮点击事件
  refreshGamesBtn.addEventListener('click', refreshGameList);

  // 开始游戏按钮点击事件
  startGameBtn.addEventListener('click', startGame);
}

// 创建游戏
function createGame(playerName) {
  const playerId = generatePlayerId();
  const player = new Player(playerName, playerId);
  
  gameState.players = [player];
  gameState.roomOwner = playerId;
  player.isReady = true;
  
  setupPanel.style.display = 'none';
  waitingRoom.style.display = 'block';
  
  updatePlayerList();
  broadcastGameCreated();
}

// 显示加入游戏面板
function showJoinGamePanel() {
  setupPanel.style.display = 'none';
  joinGamePanel.style.display = 'block';
  refreshGameList();
}

// 刷新游戏列表
function refreshGameList() {
  // 这里应该实现获取可用游戏列表的逻辑
  // 暂时使用模拟数据
  const games = [
    { id: 'game1', owner: '玩家1', players: 1 },
    { id: 'game2', owner: '玩家2', players: 2 }
  ];
  
  availableGames.innerHTML = games.map(game => `
    <div class="player-list-item" onclick="joinGame('${game.id}')">
      ${game.owner}的游戏 (${game.players}/4)
    </div>
  `).join('');
}

// 加入游戏
function joinGame(gameId) {
  const playerName = playerNameInput.value.trim();
  const playerId = generatePlayerId();
  const player = new Player(playerName, playerId);
  
  gameState.players.push(player);
  player.isReady = true;
  
  joinGamePanel.style.display = 'none';
  waitingRoom.style.display = 'block';
  
  updatePlayerList();
  broadcastPlayerJoined(player);
}

// 开始游戏
function startGame() {
  if (gameState.players.length < 2) {
    alert('至少需要2名玩家才能开始游戏');
    return;
  }
  
  gameState.gameStarted = true;
  initializeGameState();
  
  setupPanel.style.display = 'none';
  waitingRoom.style.display = 'none';
  gameContainer.style.display = 'block';
  
  updateGameUI();
  broadcastGameStarted();
}

// 初始化游戏状态
function initializeGameState() {
  // 初始化牌组
  gameState.deck = createDeck();
  gameState.deck = shuffleArray(gameState.deck);
  
  // 发牌
  gameState.players.forEach(player => {
    player.hand = gameState.deck.splice(0, 5);
  });
  
  // 放置第一张桌面牌
  gameState.tableCards = [gameState.deck.splice(0, 1)[0]];
  
  // 设置第一个玩家为当前回合
  gameState.currentTurn = 0;
}

// 创建牌组
function createDeck() {
  const deck = [];
  let cardId = 1;
  
  // 添加地铁站牌
  metroData.stations
    .filter(station => station.cardmode === 1)
    .forEach(station => {
      deck.push({
        id: `card_${cardId++}`,
        type: CARD_TYPE.STATION,
        name: station.name,
        lines: station.lines
      });
    });
  
  // 添加功能牌（出租车和公交车）
  for (let i = 0; i < 5; i++) {
    deck.push({
      id: `card_${cardId++}`,
      type: CARD_TYPE.TAXI,
      name: '出租车',
      description: '可以连接任意两个地铁站'
    });
    
    deck.push({
      id: `card_${cardId++}`,
      type: CARD_TYPE.BUS,
      name: '公交车',
      description: '交换最后两张站牌位置'
    });
  }
  
  return deck;
}

// 检查是否可以使用地铁连接
function canConnectByMetro(card1, card2) {
  if (card1.type !== CARD_TYPE.STATION || card2.type !== CARD_TYPE.STATION) {
    return false;
  }
  
  // 检查两个站点是否有共同的线路
  return card1.lines.some(line => card2.lines.includes(line));
}

// 使用地铁出牌
function playMetroCards() {
  const selectedCards = gameState.selectedCards;
  if (selectedCards.length !== 2) {
    showGameMessage('请选择两张地铁站牌');
    return false;
  }
  
  const [card1, card2] = selectedCards;
  if (card1.type !== CARD_TYPE.STATION || card2.type !== CARD_TYPE.STATION) {
    showGameMessage('只能使用地铁站牌进行连接');
    return false;
  }
  
  if (!canConnectByMetro(card1, card2)) {
    showGameMessage('这两个站点没有共同的线路');
    return false;
  }
  
  // 将选中的牌添加到桌面
  gameState.tableCards.push(...selectedCards);
  return true;
}

// 使用出租车出牌
function playTaxiCard() {
  const selectedCards = gameState.selectedCards;
  if (selectedCards.length !== 3) {
    showGameMessage('请选择一张出租车和两张地铁站牌');
    return false;
  }
  
  const taxiCard = selectedCards.find(card => card.type === CARD_TYPE.TAXI);
  const stationCards = selectedCards.filter(card => card.type === CARD_TYPE.STATION);
  
  if (!taxiCard || stationCards.length !== 2) {
    showGameMessage('需要一张出租车和两张地铁站牌');
    return false;
  }
  
  // 将选中的牌添加到桌面
  gameState.tableCards.push(...stationCards);
  return true;
}

// 使用公交车出牌
function playBusCard() {
  const selectedCards = gameState.selectedCards;
  if (selectedCards.length !== 1 || selectedCards[0].type !== CARD_TYPE.BUS) {
    showGameMessage('请选择一张公交车牌');
    return false;
  }
  
  if (gameState.tableCards.length < 2) {
    showGameMessage('桌面上至少需要两张牌才能使用公交车');
    return false;
  }
  
  // 交换最后两张桌面牌的位置
  const lastIndex = gameState.tableCards.length - 1;
  [gameState.tableCards[lastIndex], gameState.tableCards[lastIndex - 1]] = 
  [gameState.tableCards[lastIndex - 1], gameState.tableCards[lastIndex]];
  
  return true;
}

// 更新玩家列表显示
function updatePlayerList() {
  joinedPlayers.innerHTML = gameState.players.map(player => `
    <div class="player-list-item">
      ${player.name} ${player.isReady ? '(准备就绪)' : ''}
      ${player.id === gameState.roomOwner ? '(房主)' : ''}
      <span class="player-score">得分: ${player.score}</span>
    </div>
  `).join('');
  
  // 如果玩家数量大于等于2且所有玩家都准备就绪，启用开始游戏按钮
  const allPlayersReady = gameState.players.every(player => player.isReady);
  startGameBtn.disabled = gameState.players.length < 2 || !allPlayersReady;
}

// 更新游戏界面
function updateGameUI() {
  // 更新牌堆数量显示
  deckCount.textContent = `牌堆剩余: ${gameState.deck.length}`;
  
  // 更新当前回合显示
  const currentPlayer = gameState.players[gameState.currentTurn];
  currentTurn.textContent = `当前回合: ${currentPlayer.name}`;
  
  // 更新桌面牌显示
  renderTableCards();
  
  // 更新所有玩家手牌显示
  renderAllPlayersHands();
  
  // 更新按钮状态
  updateButtonStates();
}

// 渲染桌面牌
function renderTableCards() {
  tableCards.innerHTML = gameState.tableCards.map(card => 
    createCardElement(card, false)
  ).join('');
}

// 渲染所有玩家手牌
function renderAllPlayersHands() {
  const currentPlayer = gameState.players[gameState.currentTurn];
  
  // 渲染当前玩家手牌
  playerHand.innerHTML = currentPlayer.hand.map(card => 
    createCardElement(card, true, gameState.selectedCards.includes(card))
  ).join('');
  
  // 渲染其他玩家手牌（背面朝上）
  gameState.players.forEach((player, index) => {
    if (index !== gameState.currentTurn) {
      const otherPlayerHand = document.getElementById(`player-${player.id}-hand`);
      if (otherPlayerHand) {
        otherPlayerHand.innerHTML = Array(player.hand.length)
          .fill()
          .map(() => createCardBackElement())
          .join('');
      }
    }
  });
}

// 创建卡牌元素
function createCardElement(card, isPlayable = false, isSelected = false) {
  let cardContent = '';
  let cardClass = `card ${card.type}-card`;
  
  if (isPlayable) {
    cardClass += ' playable';
  }
  if (isSelected) {
    cardClass += ' selected';
  }
  
  if (card.type === CARD_TYPE.STATION) {
    cardContent = `
      <div class="station-name">${card.name}</div>
      <div class="station-lines">
        ${card.lines.map(line => `
          <div class="line-tag line-${line}">${line}</div>
        `).join('')}
      </div>
    `;
  } else {
    const icon = card.type === CARD_TYPE.TAXI ? '🚕' : '🚌';
    cardContent = `
      <div class="function-icon">${icon}</div>
      <div class="station-name">${card.name}</div>
      <div class="card-description">${card.description}</div>
    `;
  }
  
  return `
    <div class="${cardClass}" data-card-id="${card.id}" onclick="handleCardClick(event, '${card.id}')">
      ${cardContent}
    </div>
  `;
}

// 创建卡牌背面元素
function createCardBackElement() {
  return '<div class="card card-back"></div>';
}

// 更新按钮状态
function updateButtonStates() {
  const isCurrentPlayer = gameState.players[gameState.currentTurn].id === playerId;
  const hasSelectedCards = gameState.selectedCards.length > 0;
  
  // 更新出牌按钮状态
  playMetroBtn.disabled = !isCurrentPlayer || !hasSelectedCards;
  playTaxiBtn.disabled = !isCurrentPlayer || !hasSelectedCards;
  playBusBtn.disabled = !isCurrentPlayer || !hasSelectedCards;
  
  // 更新摸牌按钮状态
  drawCardBtn.disabled = !isCurrentPlayer || hasSelectedCards || gameState.deck.length === 0;
  
  // 更新取消选择按钮状态
  cancelSelectionBtn.disabled = !hasSelectedCards;
}

// 处理卡牌点击事件
function handleCardClick(event, cardId) {
  if (!gameState.gameStarted) return;
  
  const currentPlayer = gameState.players[gameState.currentTurn];
  if (currentPlayer.id !== playerId) return;
  
  const card = currentPlayer.hand.find(c => c.id === cardId);
  if (!card) return;
  
  const cardElement = event.currentTarget;
  
  if (gameState.selectedCards.includes(card)) {
    // 取消选择卡牌
    gameState.selectedCards = gameState.selectedCards.filter(c => c.id !== cardId);
    cardElement.classList.remove('selected');
  } else {
    // 选择卡牌
    gameState.selectedCards.push(card);
    cardElement.classList.add('selected');
  }
  
  updateButtonStates();
}

// 处理出牌
function playCards(mode) {
  if (!gameState.gameStarted || gameState.selectedCards.length === 0) return;
  
  const currentPlayer = gameState.players[gameState.currentTurn];
  if (currentPlayer.id !== playerId) return;
  
  gameState.playMode = mode;
  let playSuccess = false;
  
  switch (mode) {
    case 'metro':
      playSuccess = playMetroCards();
      break;
    case 'taxi':
      playSuccess = playTaxiCard();
      break;
    case 'bus':
      playSuccess = playBusCard();
      break;
  }
  
  if (playSuccess) {
    // 移除已出的牌
    gameState.selectedCards.forEach(card => {
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== card.id);
    });
    
    // 清空选中的牌
    gameState.selectedCards = [];
    
    // 检查游戏是否结束
    if (currentPlayer.hand.length === 0) {
      endGame(currentPlayer);
    } else {
      // 切换到下一个玩家
      nextTurn();
    }
    
    // 更新界面
    updateGameUI();
  }
}

// 处理摸牌
function drawCard() {
  if (!gameState.gameStarted) return;
  
  const currentPlayer = gameState.players[gameState.currentTurn];
  if (currentPlayer.id !== playerId) return;
  
  if (gameState.deck.length > 0) {
    const card = gameState.deck.pop();
    currentPlayer.hand.push(card);
    
    // 切换到下一个玩家
    nextTurn();
    
    // 更新界面
    updateGameUI();
  }
}

// 切换到下一个玩家
function nextTurn() {
  gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
  gameState.playMode = null;
  gameState.selectedCards = [];
  
  // 广播回合变更
  broadcastTurnChanged();
}

// 结束游戏
function endGame(winner) {
  gameState.gameStarted = false;
  winner.score += 1;
  
  // 显示游戏结果
  showGameMessage(`游戏结束！${winner.name} 获胜！`);
  
  // 广播游戏结束
  broadcastGameEnded(winner);
}

// 显示游戏消息
function showGameMessage(message) {
  gameMessage.textContent = message;
}

// 工具函数：生成玩家ID
function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

// 工具函数：洗牌算法
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 广播函数（这些函数将在实现网络功能时完善）
function broadcastGameCreated() {
  console.log('游戏已创建');
}

function broadcastPlayerJoined(player) {
  console.log('玩家已加入:', player.name);
}

function broadcastGameStarted() {
  console.log('游戏已开始');
}

function broadcastTurnChanged() {
  console.log('回合切换:', gameState.players[gameState.currentTurn].name);
}

function broadcastGameEnded(winner) {
  console.log('游戏结束，获胜者:', winner.name);
}