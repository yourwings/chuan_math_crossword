// 小川数字宝藏 - 游戏逻辑

// 游戏配置
const GRID_SIZE = 10; // 10x10的网格
const MIN_VALUE = 1; // 最小宝藏值
const MAX_VALUE = 5; // 最大宝藏值
const EMPTY_CELL_PROBABILITY = 0.2; // 空白单元格的概率

// 工具初始数量
const INITIAL_TOOLS = {
  shovel: 10, // 铲子
  drill: 1,   // 钻头
  bomb: 1     // 炸弹
};

// 游戏状态
let gameState = {
  grid: [],           // 宝藏网格
  originalGrid: [],   // 原始宝藏网格（用于重试）
  revealedCells: [],  // 已挖掘的单元格
  score: 0,           // 当前得分
  tools: { ...INITIAL_TOOLS }, // 当前工具数量
  selectedTool: 'shovel', // 当前选择的工具
  isGameOver: false,  // 游戏是否结束
  startTime: null     // 游戏开始时间
};

// 排行榜 - 只针对当前游戏
let leaderboard = [];

// DOM元素
const treasureGridElement = document.getElementById('treasure-grid');
const scoreElement = document.getElementById('score');
const shovelCountElement = document.getElementById('shovel-count');
const drillCountElement = document.getElementById('drill-count');
const bombCountElement = document.getElementById('bomb-count');
const newGameButton = document.getElementById('new-game-btn');
const retryButton = document.getElementById('retry-btn');
const backButton = document.getElementById('back-btn');
const gameResultElement = document.getElementById('game-result');
const finalScoreElement = document.getElementById('final-score');
const newGameResultButton = document.getElementById('new-game-result-btn');
const retryResultButton = document.getElementById('retry-result-btn');
const leaderboardEntriesElement = document.getElementById('leaderboard-entries');
const toolElements = {
  shovel: document.getElementById('shovel-tool'),
  drill: document.getElementById('drill-tool'),
  bomb: document.getElementById('bomb-tool')
};

// 初始化游戏
function initializeGame(isNewGame = true) {
  // 如果是新游戏，生成新的宝藏网格并重置排行榜
  if (isNewGame) {
    // 重置排行榜
    leaderboard = [];
    
    // 重置游戏状态
    gameState = {
      grid: [],
      originalGrid: [],
      revealedCells: [],
      score: 0,
      tools: { ...INITIAL_TOOLS },
      selectedTool: 'shovel',
      isGameOver: false,
      startTime: new Date()
    };
    
    generateTreasureGrid();
    // 保存原始网格用于重试
    gameState.originalGrid = JSON.parse(JSON.stringify(gameState.grid));
  } else {
    // 重试游戏，使用原始网格
    gameState = {
      grid: JSON.parse(JSON.stringify(gameState.originalGrid)),
      originalGrid: gameState.originalGrid,
      revealedCells: [],
      score: 0,
      tools: { ...INITIAL_TOOLS },
      selectedTool: 'shovel',
      isGameOver: false,
      startTime: new Date()
    };
  }

  // 初始化已挖掘的单元格数组
  gameState.revealedCells = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));

  // 更新UI
  updateUI();

  // 隐藏游戏结果
  gameResultElement.classList.add('hidden');
  
  // 保存排行榜
  saveLeaderboard();
}

// 生成宝藏网格
function generateTreasureGrid() {
  gameState.grid = [];
  
  for (let i = 0; i < GRID_SIZE; i++) {
    const row = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      // 随机决定是否为空白单元格
      if (Math.random() < EMPTY_CELL_PROBABILITY) {
        row.push(0); // 0表示空白单元格
      } else {
        // 随机生成1-5的宝藏值
        row.push(Math.floor(Math.random() * MAX_VALUE) + 1);
      }
    }
    gameState.grid.push(row);
  }
}

// 更新UI
function updateUI() {
  // 更新分数
  scoreElement.textContent = gameState.score;
  
  // 更新工具数量
  shovelCountElement.textContent = gameState.tools.shovel;
  drillCountElement.textContent = gameState.tools.drill;
  bombCountElement.textContent = gameState.tools.bomb;
  
  // 更新工具选择状态
  Object.keys(toolElements).forEach(tool => {
    const element = toolElements[tool];
    if (element) {
      // 设置选中状态
      element.classList.toggle('active', tool === gameState.selectedTool);
      // 设置禁用状态
      element.classList.toggle('disabled', gameState.tools[tool] <= 0);
    }
  });
  
  // 渲染宝藏网格
  renderTreasureGrid();
  
  // 更新排行榜
  renderLeaderboard();
}

// 渲染宝藏网格
function renderTreasureGrid() {
  // 清空网格容器
  treasureGridElement.innerHTML = '';
  
  // 创建网格单元格
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      
      const value = gameState.grid[i][j];
      
      // 显示单元格的值（默认显示数字）
      if (value === 0) {
        cell.classList.add('empty');
        cell.textContent = '';
      } else {
        cell.classList.add(`value-${value}`);
        cell.textContent = value;
      }
      
      // 如果单元格已被挖掘
      if (gameState.revealedCells[i][j]) {
        cell.classList.add('revealed');
      } else {
        // 添加点击事件（不添加覆盖层，使数字直接可见）
        cell.addEventListener('click', () => handleCellClick(i, j));
      }
      
      
      treasureGridElement.appendChild(cell);
    }
  }
}

// 处理单元格点击
function handleCellClick(row, col) {
  // 如果游戏已结束或单元格已被挖掘，不做任何操作
  if (gameState.isGameOver || gameState.revealedCells[row][col]) {
    return;
  }
  
  // 检查是否有足够的工具
  if (gameState.tools[gameState.selectedTool] <= 0) {
    alert(`没有足够的${getToolName(gameState.selectedTool)}！`);
    return;
  }
  
  // 根据选择的工具执行不同的操作
  switch (gameState.selectedTool) {
    case 'shovel':
      // 铲子：挖掘单个单元格
      revealCell(row, col);
      break;
      
    case 'drill':
      // 钻头：挖掘一列单元格
      for (let i = 0; i < GRID_SIZE; i++) {
        revealCell(i, col);
      }
      break;
      
    case 'bomb':
      // 炸弹：挖掘3x3的单元格
      for (let i = Math.max(0, row - 1); i <= Math.min(GRID_SIZE - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(GRID_SIZE - 1, col + 1); j++) {
          revealCell(i, j);
        }
      }
      break;
  }
  
  // 减少工具数量
  gameState.tools[gameState.selectedTool]--;
  
  // 更新UI
  updateUI();
  
  // 检查游戏是否结束
  checkGameOver();
}

// 挖掘单元格
function revealCell(row, col) {
  // 如果单元格已被挖掘，不做任何操作
  if (gameState.revealedCells[row][col]) {
    return;
  }
  
  // 标记单元格为已挖掘
  gameState.revealedCells[row][col] = true;
  
  // 获取单元格的宝藏值
  const value = gameState.grid[row][col];
  
  // 更新得分
  if (value > 0) {
    gameState.score += value;
  }
  
  // 添加挖掘效果
  const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
  if (cell) {
    cell.classList.add('tool-effect');
    setTimeout(() => {
      cell.classList.remove('tool-effect');
    }, 500);
  }
}

// 检查游戏是否结束
function checkGameOver() {
  // 如果所有工具都用完了，游戏结束
  if (gameState.tools.shovel <= 0 && gameState.tools.drill <= 0 && gameState.tools.bomb <= 0) {
    gameState.isGameOver = true;
    showGameResult();
  }
}

// 显示游戏结果
function showGameResult() {
  // 更新最终得分
  finalScoreElement.textContent = gameState.score;
  
  // 显示游戏结果
  gameResultElement.classList.remove('hidden');
  
  // 更新排行榜
  updateLeaderboard();
}

// 更新排行榜
function updateLeaderboard() {
  // 添加新的得分记录
  const now = new Date();
  const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  // 计算游戏时长（秒）
  const gameDuration = Math.floor((now - gameState.startTime) / 1000);
  
  leaderboard.push({
    score: gameState.score,
    date: dateString,
    duration: gameDuration
  });
  
  // 按得分降序排序
  leaderboard.sort((a, b) => b.score - a.score);
  
  // 只保留前10名
  if (leaderboard.length > 10) {
    leaderboard = leaderboard.slice(0, 10);
  }
  
  // 保存到本地存储
  saveLeaderboard();
  
  // 渲染排行榜
  renderLeaderboard();
}

// 加载排行榜 - 不再从本地存储加载，因为排行榜只针对当前游戏
function loadLeaderboard() {
  // 排行榜已经在内存中，不需要从本地存储加载
  return;
}

// 保存排行榜 - 只在内存中保存，不再使用本地存储
function saveLeaderboard() {
  // 排行榜只针对当前游戏，不需要持久化存储
  return;
}

// 渲染排行榜
function renderLeaderboard() {
  // 清空排行榜容器
  leaderboardEntriesElement.innerHTML = '';
  
  // 如果排行榜为空
  if (leaderboard.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = '暂无记录';
    emptyMessage.className = 'leaderboard-empty';
    leaderboardEntriesElement.appendChild(emptyMessage);
    return;
  }
  
  // 添加每个排行榜条目
  leaderboard.forEach((entry, index) => {
    const entryElement = document.createElement('div');
    entryElement.className = 'leaderboard-entry';
    
    const rankElement = document.createElement('div');
    rankElement.className = 'leaderboard-rank';
    rankElement.textContent = `${index + 1}.`;
    
    const dateElement = document.createElement('div');
    dateElement.className = 'leaderboard-date';
    dateElement.textContent = entry.date;
    
    const scoreElement = document.createElement('div');
    scoreElement.className = 'leaderboard-score';
    scoreElement.textContent = entry.score;
    
    // 添加游戏时长
    const durationElement = document.createElement('div');
    durationElement.className = 'leaderboard-duration';
    durationElement.textContent = `${entry.duration}秒`;
    
    entryElement.appendChild(rankElement);
    entryElement.appendChild(dateElement);
    entryElement.appendChild(scoreElement);
    entryElement.appendChild(durationElement);
    
    leaderboardEntriesElement.appendChild(entryElement);
  });
}

// 获取工具名称
function getToolName(tool) {
  switch (tool) {
    case 'shovel': return '铲子';
    case 'drill': return '钻头';
    case 'bomb': return '炸弹';
    default: return '';
  }
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
  // 初始化游戏
  initializeGame(true);
  
  // 工具选择
  Object.keys(toolElements).forEach(tool => {
    const element = toolElements[tool];
    if (element) {
      element.addEventListener('click', () => {
        if (!element.classList.contains('disabled') && gameState.tools[tool] > 0) {
          gameState.selectedTool = tool;
          updateUI();
        }
      });
    }
  });
  
  // 新游戏按钮
  newGameButton.addEventListener('click', () => {
    initializeGame(true);
  });
  
  // 重试按钮
  retryButton.addEventListener('click', () => {
    initializeGame(false);
  });
  
  // 返回主页按钮
  backButton.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
  
  // 游戏结果中的新游戏按钮
  newGameResultButton.addEventListener('click', () => {
    initializeGame(true);
  });
  
  // 游戏结果中的重试按钮
  retryResultButton.addEventListener('click', () => {
    initializeGame(false);
  });
  
  // 渲染排行榜
  renderLeaderboard();
});