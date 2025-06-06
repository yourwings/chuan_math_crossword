// 游戏变量
let gameBoard = [];
let currentNumber = 1;
let selectedCells = [];
let timer;
let seconds = 0;
let gameStarted = false;
let foundNumbers = [];
let skippedNumbers = [];
let totalSelections = 0;

// 棋盘大小常量
const BOARD_SIZE = 18;
const MAX_NUMBER = 99;

// DOM元素
const gameBoardElement = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const currentNumberElement = document.getElementById('current-number');
const selectionCountElement = document.getElementById('selection-count');
const gameStatusElement = document.getElementById('game-status');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const backButton = document.getElementById('back-btn');
const toggleRulesButton = document.getElementById('toggle-rules');
const rulesContent = document.getElementById('rules-content');
const gameOverModal = document.getElementById('game-over-modal');
const gameResultElement = document.getElementById('game-result');
const playAgainButton = document.getElementById('play-again-btn');
const returnHomeButton = document.getElementById('return-home-btn');

// 初始化游戏
function initializeGame() {
    // 重置游戏状态
    gameBoard = [];
    currentNumber = 1;
    selectedCells = [];
    seconds = 0;
    gameStarted = true;
    foundNumbers = [];
    skippedNumbers = [];
    totalSelections = 0;
    
    // 更新UI
    timerElement.textContent = '时间: 00:00';
    currentNumberElement.textContent = `当前寻找: ${currentNumber}`;
    selectionCountElement.textContent = '已选择: 0/2';
    gameStatusElement.textContent = '';
    
    // 生成棋盘
    generateBoard();
    
    // 开始计时器
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    
    // 启用重新开始按钮
    restartButton.disabled = false;
    startButton.disabled = true;
}

// 生成棋盘
function generateBoard() {
    // 清空棋盘元素
    gameBoardElement.innerHTML = '';
    
    // 生成随机数字棋盘
    let board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        let row = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            row.push(Math.floor(Math.random() * 10)); // 0-9的随机数字
        }
        board.push(row);
    }
    
    // 验证棋盘上是否可以找到1-99的所有数字
    let findableNumbers = validateBoard(board);
    
    // 记录无法找到的数字
    skippedNumbers = [];
    for (let num = 1; num <= MAX_NUMBER; num++) {
        if (!findableNumbers.includes(num)) {
            skippedNumbers.push(num);
        }
    }
    
    // 创建棋盘UI
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.value = board[i][j];
            cell.textContent = board[i][j];
            
            // 添加点击事件
            cell.addEventListener('click', handleCellClick);
            
            gameBoardElement.appendChild(cell);
        }
    }
    
    // 保存棋盘数据
    gameBoard = board;
    
    // 如果有跳过的数字，显示提示
    if (skippedNumbers.length > 0) {
        gameStatusElement.textContent = `注意：棋盘上找不到以下数字，将被跳过：${skippedNumbers.join(', ')}`;
    }
}

// 验证棋盘上是否可以找到1-99的所有数字
function validateBoard(board) {
    let findableNumbers = [];
    
    // 检查单个格子的数字
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            let num = board[i][j];
            if (num >= 1 && num <= MAX_NUMBER && !findableNumbers.includes(num)) {
                findableNumbers.push(num);
            }
        }
    }
    
    // 检查相邻格子组成的数字
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            // 检查右侧相邻
            if (j < BOARD_SIZE - 1) {
                let num = parseInt(`${board[i][j]}${board[i][j+1]}`);
                if (num >= 1 && num <= MAX_NUMBER && !findableNumbers.includes(num)) {
                    findableNumbers.push(num);
                }
            }
            
            // 检查下方相邻
            if (i < BOARD_SIZE - 1) {
                let num = parseInt(`${board[i][j]}${board[i+1][j]}`);
                if (num >= 1 && num <= MAX_NUMBER && !findableNumbers.includes(num)) {
                    findableNumbers.push(num);
                }
            }
        }
    }
    
    return findableNumbers.sort((a, b) => a - b);
}

// 处理格子点击
function handleCellClick(event) {
    if (!gameStarted) return;
    
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const value = parseInt(cell.dataset.value);
    
    // 移除对已找到格子的点击限制，允许复用已找到的数字
    // if (cell.classList.contains('found')) return;
    
    // 如果格子已经被选中，取消选中
    if (cell.classList.contains('selected')) {
        cell.classList.remove('selected');
        selectedCells = selectedCells.filter(c => c.element !== cell);
        updateSelectionCount();
        return;
    }
    
    // 如果已经选中了一个格子，检查新选择的格子是否与之相邻
    if (selectedCells.length === 1) {
        const firstCell = selectedCells[0];
        const isAdjacent = (
            (firstCell.row === row && Math.abs(firstCell.col - col) === 1) || // 左右相邻
            (firstCell.col === col && Math.abs(firstCell.row - row) === 1)    // 上下相邻
        );
        
        // 如果不相邻，清空第一个选择
        if (!isAdjacent) {
            selectedCells[0].element.classList.remove('selected');
            selectedCells = [];
        }
    }
    
    // 如果已经选中了2个格子，取消最早选中的格子
    if (selectedCells.length >= 2) {
        const oldestCell = selectedCells.shift();
        oldestCell.element.classList.remove('selected');
    }
    
    // 选中当前格子
    cell.classList.add('selected');
    selectedCells.push({
        element: cell,
        row: row,
        col: col,
        value: value
    });
    
    // 更新选中计数
    updateSelectionCount();
    totalSelections++;
    
    // 检查是否满足当前要找的数字
    checkSelection();
}

// 更新选中计数
function updateSelectionCount() {
    selectionCountElement.textContent = `已选择: ${selectedCells.length}/2`;
}

// 检查选中的格子是否满足当前要找的数字
function checkSelection() {
    // 跳过无法找到的数字
    while (skippedNumbers.includes(currentNumber) && currentNumber <= MAX_NUMBER) {
        currentNumber++;
        currentNumberElement.textContent = currentNumber > MAX_NUMBER ? '完成!' : `当前寻找: ${currentNumber}`;
    }
    
    // 如果已经完成所有数字，结束游戏
    if (currentNumber > MAX_NUMBER) {
        endGame();
        return;
    }
    
    // 检查选中的格子
    if (selectedCells.length === 1) {
        // 单个格子
        if (selectedCells[0].value === currentNumber) {
            foundNumber();
        }
    } else if (selectedCells.length === 2) {
        // 检查两个格子是否相邻
        const cell1 = selectedCells[0];
        const cell2 = selectedCells[1];
        
        // 检查是否相邻（上下或左右）
        const isAdjacent = (
            (cell1.row === cell2.row && Math.abs(cell1.col - cell2.col) === 1) || // 左右相邻
            (cell1.col === cell2.col && Math.abs(cell1.row - cell2.row) === 1)    // 上下相邻
        );
        
        if (isAdjacent) {
            // 组合数字（按选择顺序）
            const combinedNumber = parseInt(`${cell1.value}${cell2.value}`);
            
            if (combinedNumber === currentNumber) {
                foundNumber();
            }
        }
    }
}

// 找到数字后的处理
function foundNumber() {
    // 标记找到的格子
    selectedCells.forEach(cell => {
        cell.element.classList.remove('selected');
        cell.element.classList.add('found');
    });
    
    // 记录找到的数字
    foundNumbers.push(currentNumber);
    
    // 清空选中的格子
    selectedCells = [];
    
    // 更新选中计数
    updateSelectionCount();
    
    // 更新当前要找的数字
    currentNumber++;
    
    // 跳过无法找到的数字
    while (skippedNumbers.includes(currentNumber) && currentNumber <= MAX_NUMBER) {
        currentNumber++;
    }
    
    // 更新UI
    currentNumberElement.textContent = currentNumber > MAX_NUMBER ? '完成!' : `当前寻找: ${currentNumber}`;
    
    // 显示成功消息
    gameStatusElement.textContent = `找到: ${currentNumber - 1}`;
    setTimeout(() => {
        if (gameStarted) {
            gameStatusElement.textContent = '';
        }
    }, 2000);
    
    // 检查游戏是否结束
    if (currentNumber > MAX_NUMBER) {
        endGame();
    }
}

// 更新计时器
function updateTimer() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerElement.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 结束游戏
function endGame() {
    gameStarted = false;
    clearInterval(timer);
    
    // 显示游戏结果
    const resultText = `
        恭喜你完成了游戏！<br>
        用时: ${formatTime(seconds)}<br>
        总选择次数: ${totalSelections}<br>
        找到的数字: ${foundNumbers.length}个<br>
        跳过的数字: ${skippedNumbers.length}个
    `;
    
    gameResultElement.innerHTML = resultText;
    gameOverModal.style.display = 'flex';
}

// 格式化时间
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 事件监听器
startButton.addEventListener('click', () => {
    initializeGame();
});

restartButton.addEventListener('click', () => {
    if (confirm('确定要重新开始游戏吗？')) {
        initializeGame();
    }
});

backButton.addEventListener('click', () => {
    window.location.href = '../index.html';
});

toggleRulesButton.addEventListener('click', () => {
    if (rulesContent.style.display === 'none') {
        rulesContent.style.display = 'block';
        toggleRulesButton.textContent = '隐藏规则';
    } else {
        rulesContent.style.display = 'none';
        toggleRulesButton.textContent = '显示规则';
    }
});

playAgainButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    initializeGame();
});

returnHomeButton.addEventListener('click', () => {
    window.location.href = '../index.html';
});

// 初始页面设置
document.addEventListener('DOMContentLoaded', () => {
    restartButton.disabled = true;
});