// 北京地铁漫游 - AI对战模式核心逻辑

// 导入地铁数据
import { metroData } from './metro_data.js';

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
  4: '#008000', // 四号线 - 绿色
  5: '#800080', // 五号线 - 紫色
  6: '#FFA500', // 六号线 - 橙色
  7: '#FFC0CB', // 七号线 - 粉色
  8: '#008B8B', // 八号线 - 青色
  9: '#006400', // 九号线 - 深绿色
  10: '#4682B4', // 十号线 - 钢蓝色
  13: '#FFFF00', // 十三号线 - 黄色
  14: '#B8860B', // 十四号线 - 暗金色
  15: '#FF00FF', // 十五号线 - 品红色
  16: '#00FFFF', // 十六号线 - 青绿色
  17: '#FF4500', // 十七号线 - 橙红色
  19: '#00FF00', // 十九号线 - 亮绿色
  'S1': '#808080', // S1线 - 灰色
  'sdjc': '#C0C0C0', // 首都机场线 - 银色
  'dxjc': '#D2B48C', // 大兴机场线 - 棕褐色
  'xjl': '#E6E6FA', // 西郊线 - 淡紫色
  'fs': '#F0E68C', // 房山线 - 卡其色
  'cp': '#98FB98', // 昌平线 - 淡绿色
  'yz': '#DDA0DD', // 亦庄线 - 淡紫色
  'bt': '#AFEEEE', // 八通线 - 淡青色
  'dx': '#FFB6C1', // 大兴线 - 淡粉色
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
const aiHandElement = document.getElementById('ai-hand');
const tableCardsElement = document.getElementById('table-cards');
const playerCardsCountElement = document.getElementById('player-cards-count');
const aiCardsCountElement = document.getElementById('ai-cards-count');
const deckCountElement = document.getElementById('deck-count');
const currentTurnElement = document.getElementById('current-turn');
const gameMessageElement = document.getElementById('game-message');
const gameResultElement = document.getElementById('game-result');

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
document.querySelector('.action-buttons').appendChild(debugBtn);

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
  renderCards(); // 重新渲染卡牌以显示或隐藏AI手牌
});

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
  setupEventListeners();
});

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
  
  // 重置游戏统计数据
  gameStats = {
    totalCards: 0,
    metroStations: 0,
    taxiRides: 0,
    busRides: 0
  };
  
  // 隐藏游戏结果
  gameResultElement.style.display = 'none';
  
  // 初始化牌组
  initializeCards();
  
  // 更新UI
  updateGameInfo();
  renderCards();
  updateButtonStates();
  
  // 显示游戏开始消息
  showGameMessage('游戏开始！请选择一种出牌方式');
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
  
  // 合并所有牌
  const allCards = [...stationCards, ...taxiCards, ...busCards];
  
  // 洗牌
  const shuffledCards = shuffleArray(allCards);
  
  // 从洗牌后的牌组中选择一张地铁站牌作为初始桌面牌
  const initialTableCard = shuffledCards.find(card => card.type === CARD_TYPE.STATION);
  if (initialTableCard) {
    // 将这张牌从牌组中移除
    const initialCardIndex = shuffledCards.indexOf(initialTableCard);
    shuffledCards.splice(initialCardIndex, 1);
    
    // 放到桌面上
    tableCards = [initialTableCard];
  }
  
  // 发牌给玩家和AI各8张
  playerHand = shuffledCards.slice(0, 8);
  aiHand = shuffledCards.slice(8, 16);
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
 * 处理出牌模式选择
 * @param {string} mode 出牌模式
 */
function handlePlayMode(mode) {
  if (currentTurn !== 'player' || gameOver) return;
  
  // 如果已经选择了牌，则执行出牌操作
  if (selectedCards.length > 0) {
    // 检查选中的牌类型是否与模式匹配
    const selectedCardType = selectedCards[0].card.type;
    if ((mode === 'metro' && selectedCardType === CARD_TYPE.STATION) ||
        (mode === 'taxi' && selectedCardType === CARD_TYPE.TAXI) ||
        (mode === 'bus' && selectedCardType === CARD_TYPE.BUS)) {
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
  if (currentTurn !== 'player' || gameOver) return;
  
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
  
  if (playMode === 'taxi') {
    // 出租车牌特殊效果：出牌后摸一张牌并可选择打出一张地铁牌
    effectMessage = '出租车可以连接任意两个地铁站！摸一张牌后可以选择打出一张地铁牌';
    specialAction = true;
  } else if (playMode === 'bus') {
    // 公交车牌特殊效果：将倒数第二张地铁牌放到牌堆顶
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
        // 将倒数第二张地铁站牌移到牌堆顶
        const secondLastStation = tableCards[secondLastStationIndex];
        tableCards.splice(secondLastStationIndex, 1);
        tableCards.push(secondLastStation);
        effectMessage = `公交车将${secondLastStation.name}站移到了牌堆顶！可以选择打出一张地铁牌`;
        specialAction = true; // 公交车也设置为特殊行动，允许继续出一张地铁牌
      } else {
        effectMessage = '公交车效果：无法找到倒数第二张地铁站牌';
      }
    } else {
      effectMessage = '公交车效果：桌面上没有足够的地铁站牌';
    }
  }
  
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
  
  // 检查游戏是否结束
  if (checkGameEnd()) return;
  
  // 处理特殊效果：出租车或公交车后可以选择打出一张地铁牌
  if (specialAction) {
    // 如果是出租车，先摸一张牌
    if (playMode === 'taxi') {
      // 摸一张牌
      const newCard = drawCard('player');
      playerHand.push(newCard);
      renderCards();
      updateGameInfo();
      showGameMessage(`摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌，可以选择打出一张地铁站牌或结束回合`);
    } else if (playMode === 'bus') {
      // 公交车效果已经在前面处理过了
      showGameMessage('公交车效果已生效，可以选择打出一张地铁站牌或结束回合');
    }
    
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
      
      // 切换到AI回合
      currentTurn = 'ai';
      updateGameInfo();
      showGameMessage('AI回合...');
      
      // AI延迟出牌
      setTimeout(handleAITurn, 1500);
    });
    
    // 设置出牌模式为地铁
    playMode = 'metro';
    updateButtonStates();
    return;
  }
  
  // 如果是地铁牌，允许玩家选择出第二张地铁牌或结束回合
  if (playMode === 'metro') {
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
      
      // 切换到AI回合
      currentTurn = 'ai';
      updateGameInfo();
      showGameMessage('AI回合...');
      
      // AI延迟出牌
      setTimeout(handleAITurn, 1500);
    });
    
    showGameMessage('可以选择打出第二张地铁站牌或结束回合');
    return;
  }
  
  // 切换到AI回合
  currentTurn = 'ai';
  updateGameInfo();
  showGameMessage('AI回合...');
  
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
    
    // 将新牌添加到AI手牌
    aiHand.push(newCard);
    showGameMessage(`AI摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌`);
  }
  
  // 处理特殊牌效果
  // 如果AI出了出租车牌，可以摸一张牌并选择出一张地铁站牌
  if (aiDecision.action === 'play' && aiDecision.mode === 'taxi') {
    // AI摸一张牌
    const newCard = drawCard('ai');
    aiHand.push(newCard);
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
      }
    }
  }
  
  // 如果AI出了公交车牌，将倒数第二张地铁牌放到牌堆顶
  if (aiDecision.action === 'play' && aiDecision.mode === 'bus') {
    const stationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION);
    if (stationCards.length >= 2) {
      // 找到倒数第二张地铁站牌
      const secondLastStationIndex = tableCards.findIndex((card, index) => {
        if (card.type !== CARD_TYPE.STATION) return false;
        const stationsAfter = tableCards.slice(index + 1).filter(c => c.type === CARD_TYPE.STATION);
        return stationsAfter.length === 1; // 如果后面只有一张地铁站牌，那么这张就是倒数第二张
      });
      
      if (secondLastStationIndex !== -1) {
        // 将倒数第二张地铁站牌移到牌堆顶
        const secondLastStation = tableCards[secondLastStationIndex];
        tableCards.splice(secondLastStationIndex, 1);
        tableCards.push(secondLastStation);
        showGameMessage(`AI使用公交车将${secondLastStation.name}站移到了牌堆顶！`);
      }
    }
  }
  
  // 更新UI
  renderCards();
  updateGameInfo();
  
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
 * @returns {Object} 摸到的牌
 */
function drawCard(player) {
  // 创建一张随机牌，确保不会摸到已经打出的牌或弃牌堆的牌
  let newCard;
  let isCardValid = false;
  let attempts = 0;
  const maxAttempts = 50; // 防止无限循环
  
  while (!isCardValid && attempts < maxAttempts) {
    attempts++;
    
    // 计算各类型牌的剩余数量
    const stationCardCount = metroData.stations.filter(station => station.cardmode === 1).length;
    const usedStationCards = tableCards.filter(card => card.type === CARD_TYPE.STATION).length + 
                            playerHand.filter(card => card.type === CARD_TYPE.STATION).length + 
                            aiHand.filter(card => card.type === CARD_TYPE.STATION).length;
    const remainingStationCards = Math.max(0, stationCardCount - usedStationCards);
    
    const usedTaxiCards = tableCards.filter(card => card.type === CARD_TYPE.TAXI).length + 
                         playerHand.filter(card => card.type === CARD_TYPE.TAXI).length + 
                         aiHand.filter(card => card.type === CARD_TYPE.TAXI).length;
    const remainingTaxiCards = Math.max(0, 5 - usedTaxiCards); // 最多5张出租车牌
    
    const usedBusCards = tableCards.filter(card => card.type === CARD_TYPE.BUS).length + 
                        playerHand.filter(card => card.type === CARD_TYPE.BUS).length + 
                        aiHand.filter(card => card.type === CARD_TYPE.BUS).length;
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
        
        // 检查该站点是否已经在玩家手牌、AI手牌或桌面上
        const isInPlayerHand = playerHand.some(card => 
          card.type === CARD_TYPE.STATION && card.name === station.name
        );
        const isInAIHand = aiHand.some(card => 
          card.type === CARD_TYPE.STATION && card.name === station.name
        );
        const isOnTable = tableCards.some(card => 
          card.type === CARD_TYPE.STATION && card.name === station.name
        );
        
        return !isInPlayerHand && !isInAIHand && !isOnTable;
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
      
      const isUsed = [...playerHand, ...aiHand, ...tableCards].some(card => 
        card.type === CARD_TYPE.STATION && card.name === station.name
      );
      
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
  
  return newCard;
}

/**
 * 处理玩家摸牌
 */
function handleDrawCard() {
  if (currentTurn !== 'player' || gameOver) return;
  
  // 使用通用摸牌函数
  const newCard = drawCard('player');
  
  // 将新牌添加到玩家手牌
  playerHand.push(newCard);
  
  // 更新UI
  renderCards();
  updateGameInfo();
  showGameMessage(`摸了一张${newCard.type === CARD_TYPE.STATION ? '地铁站' : newCard.type === CARD_TYPE.TAXI ? '出租车' : '公交车'}牌`);
  
  // 切换到AI回合
  currentTurn = 'ai';
  updateGameInfo();
  showGameMessage('AI回合...');
  
  // AI延迟出牌
  setTimeout(handleAITurn, 1500);
}

/**
 * 取消选择
 */
function cancelSelection() {
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
  playerCardsCountElement.textContent = `玩家手牌: ${playerHand.length}`;
  aiCardsCountElement.textContent = `AI手牌: ${aiHand.length}`;
  
  // 计算牌堆剩余数量：总牌数减去玩家手牌、AI手牌和桌面牌
  // 地铁站牌数量 + 出租车牌数量(5) + 公交车牌数量(5) - 已使用的牌
  const stationCardCount = metroData.stations.filter(station => station.cardmode === 1).length;
  const totalCardCount = stationCardCount + 5 + 5; // 地铁站牌 + 5张出租车 + 5张公交车
  const usedCardCount = playerHand.length + aiHand.length + tableCards.length;
  const remainingCards = Math.max(0, totalCardCount - usedCardCount);
  
  deckCountElement.textContent = `牌堆剩余: ${remainingCards}`;
  currentTurnElement.textContent = `当前回合: ${currentTurn === 'player' ? '玩家' : 'AI'}`;
}

/**
 * 更新按钮状态
 */
function updateButtonStates() {
  const isPlayerTurn = currentTurn === 'player' && !gameOver;
  
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
  if (selectedCards.length > 0) {
    // 如果已选择牌，只启用对应类型的按钮
    playMetroBtn.disabled = !(isPlayerTurn && selectedCardType === CARD_TYPE.STATION);
    playTaxiBtn.disabled = !(isPlayerTurn && selectedCardType === CARD_TYPE.TAXI);
    playBusBtn.disabled = !(isPlayerTurn && selectedCardType === CARD_TYPE.BUS);
  } else {
    // 如果未选择牌，根据手牌中是否有对应类型的牌来启用按钮
    playMetroBtn.disabled = !isPlayerTurn || (playMode !== null && playMode !== 'metro') || !hasMetroCard;
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
 */
function showGameMessage(message) {
  gameMessageElement.textContent = message;
}

/**
 * 渲染卡牌
 */
function renderCards() {
  // 清空卡牌区域
  playerHandElement.innerHTML = '';
  aiHandElement.innerHTML = '';
  tableCardsElement.innerHTML = '';
  
  // 渲染玩家手牌
  playerHand.forEach((card, index) => {
    const cardElement = createCardElement(card, index);
    cardElement.id = `player-card-${index}`;
    cardElement.addEventListener('click', () => handleCardSelection(card, index));
    playerHandElement.appendChild(cardElement);
  });
  
  // 渲染AI手牌 - 只在调试模式下显示
  if (debugMode) {
    // 显示AI手牌区域
    aiHandElement.style.display = 'block';
    // 调试模式下显示AI完整手牌
    aiHand.forEach((card, index) => {
      const cardElement = createCardElement(card, index);
      cardElement.id = `ai-card-${index}`;
      aiHandElement.appendChild(cardElement);
    });
  } else {
    // 非调试模式下隐藏AI手牌区域
    aiHandElement.style.display = 'none';
  }

  
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
    
    // 获取站点信息
    const stationInfo = metroData.stations.find(s => s.name === card.name);
    if (stationInfo && stationInfo.lines) {
      stationInfo.lines.forEach(line => {
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
    <p>桌面最后一张牌: ${lastCardInfo}</p>
    <p>当前回合: ${currentTurn === 'player' ? '玩家' : 'AI'}</p>
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