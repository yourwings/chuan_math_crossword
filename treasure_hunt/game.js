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
  startTime: null,    // 游戏开始时间
  optimalScore: 0     // 当前游戏的最优解分数
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
const toggleInstructionsButton = document.getElementById('toggle-instructions-btn');
const gameInstructionsElement = document.getElementById('game-instructions');
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
  
  // 确保游戏说明默认隐藏
  if (gameInstructionsElement && !gameInstructionsElement.classList.contains('hidden')) {
    gameInstructionsElement.classList.add('hidden');
    if (toggleInstructionsButton) {
      toggleInstructionsButton.textContent = '显示游戏说明';
    }
  }
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
  
  // 计算当前游戏的最优解
  gameState.optimalScore = calculateOptimalScore(gameState.grid);
  console.log('当前游戏的最优解分数：', gameState.optimalScore);
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
  
  // 检查是否满足生日彩蛋条件
  checkBirthdayEggCondition();
}

// 检查是否满足生日彩蛋条件
function checkBirthdayEggCondition() {
  // 检查是否是小川生日（6月7日）
  const today = new Date();
  const isChauanBirthday = (today.getMonth() === 5 && today.getDate() === 7); // 月份从0开始，所以6月是5
  
  // 检查得分是否大于67
  const isScoreHighEnough = gameState.score > 67;
  
  // 如果满足条件，显示生日彩蛋
  if (isChauanBirthday && isScoreHighEnough && window.birthdayChecker) {
    // 延迟2秒后显示彩蛋，让用户先看到得分
    setTimeout(() => {
      window.birthdayChecker.showEgg();
    }, 2000);
  }
}

// 更新排行榜
function updateLeaderboard() {
  // 添加新的得分记录
  const now = new Date();
  const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  // 计算游戏时长（秒）
  const gameDuration = Math.floor((now - gameState.startTime) / 1000);
  
  // 检查是否达到最优解
  const isOptimal = gameState.score >= gameState.optimalScore;
  
  leaderboard.push({
    score: gameState.score,
    date: dateString,
    duration: gameDuration,
    isOptimal: isOptimal // 添加是否达到最优解的标记
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
    
    // 如果达到最优解，添加皇冠标记
    if (entry.isOptimal) {
      const scoreText = document.createTextNode(entry.score);
      scoreElement.appendChild(scoreText);
      
      const crownIcon = document.createElement('span');
      crownIcon.className = 'crown-icon';
      crownIcon.textContent = '👑';
      crownIcon.title = '达到最优解';
      scoreElement.appendChild(crownIcon);
    } else {
      scoreElement.textContent = entry.score;
    }
    
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

// 计算最优解分数
function calculateOptimalScore(grid) {
  // 创建网格的副本，避免修改原始网格
  const gridCopy = JSON.parse(JSON.stringify(grid));
  
  // 存储所有单元格的坐标和价值
  const cells = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (gridCopy[i][j] > 0) {
        cells.push({ row: i, col: j, value: gridCopy[i][j] });
      }
    }
  }
  
  // 按价值降序排序单元格
  cells.sort((a, b) => b.value - a.value);
  
  // 创建已挖掘单元格的标记数组
  const revealed = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
  
  let totalScore = 0;
  let remainingShovel = INITIAL_TOOLS.shovel;
  let remainingDrill = INITIAL_TOOLS.drill;
  let remainingBomb = INITIAL_TOOLS.bomb;
  
  // 首先使用炸弹（3x3范围）
  if (remainingBomb > 0) {
    // 找出使用炸弹能获得最高分数的位置
    let bestBombScore = 0;
    let bestBombRow = -1;
    let bestBombCol = -1;
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        let bombScore = 0;
        // 计算使用炸弹在(i,j)位置能获得的分数
        for (let r = Math.max(0, i - 1); r <= Math.min(GRID_SIZE - 1, i + 1); r++) {
          for (let c = Math.max(0, j - 1); c <= Math.min(GRID_SIZE - 1, j + 1); c++) {
            if (gridCopy[r][c] > 0) {
              bombScore += gridCopy[r][c];
            }
          }
        }
        
        if (bombScore > bestBombScore) {
          bestBombScore = bombScore;
          bestBombRow = i;
          bestBombCol = j;
        }
      }
    }
    
    // 使用炸弹
    if (bestBombRow !== -1 && bestBombCol !== -1) {
      for (let r = Math.max(0, bestBombRow - 1); r <= Math.min(GRID_SIZE - 1, bestBombRow + 1); r++) {
        for (let c = Math.max(0, bestBombCol - 1); c <= Math.min(GRID_SIZE - 1, bestBombCol + 1); c++) {
          if (gridCopy[r][c] > 0 && !revealed[r][c]) {
            totalScore += gridCopy[r][c];
            revealed[r][c] = true;
          }
        }
      }
      remainingBomb--;
    }
  }
  
  // 然后使用钻头（整列）
  if (remainingDrill > 0) {
    // 找出使用钻头能获得最高分数的列
    let bestDrillScore = 0;
    let bestDrillCol = -1;
    
    for (let j = 0; j < GRID_SIZE; j++) {
      let drillScore = 0;
      // 计算使用钻头在第j列能获得的分数
      for (let i = 0; i < GRID_SIZE; i++) {
        if (gridCopy[i][j] > 0 && !revealed[i][j]) {
          drillScore += gridCopy[i][j];
        }
      }
      
      if (drillScore > bestDrillScore) {
        bestDrillScore = drillScore;
        bestDrillCol = j;
      }
    }
    
    // 使用钻头
    if (bestDrillCol !== -1) {
      for (let i = 0; i < GRID_SIZE; i++) {
        if (gridCopy[i][bestDrillCol] > 0 && !revealed[i][bestDrillCol]) {
          totalScore += gridCopy[i][bestDrillCol];
          revealed[i][bestDrillCol] = true;
        }
      }
      remainingDrill--;
    }
  }
  
  // 最后使用铲子，按价值从高到低挖掘
  for (const cell of cells) {
    if (!revealed[cell.row][cell.col] && remainingShovel > 0) {
      totalScore += cell.value;
      revealed[cell.row][cell.col] = true;
      remainingShovel--;
    }
    
    // 如果铲子用完了，结束循环
    if (remainingShovel <= 0) {
      break;
    }
  }
  
  return totalScore;
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
  
  // 游戏说明显示/隐藏按钮
  toggleInstructionsButton.addEventListener('click', () => {
    const isHidden = gameInstructionsElement.classList.contains('hidden');
    if (isHidden) {
      gameInstructionsElement.classList.remove('hidden');
      toggleInstructionsButton.textContent = '隐藏游戏说明';
    } else {
      gameInstructionsElement.classList.add('hidden');
      toggleInstructionsButton.textContent = '显示游戏说明';
    }
  });
  
  // 渲染排行榜
  renderLeaderboard();
});