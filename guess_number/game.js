// 游戏变量
let gameBoard = [];
let currentNumber = 1;
let moves = 0;
let score = 0;
let timer = null;
let seconds = 0;
let gameMode = 'single';
let currentPlayer = 1; // 1或2，表示当前玩家
let player1Score = 0;
let player2Score = 0;
let gameStarted = false;
let player1Numbers = []; // 玩家1猜对的数字列表
let player2Numbers = []; // 玩家2猜对的数字列表

// DOM元素
const gameBoardElement = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const gameStatusElement = document.getElementById('game-status');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const backButton = document.getElementById('back-btn');
const gameModeSelector = document.getElementById('game-mode');
const toggleRulesButton = document.getElementById('toggle-rules');
const rulesContent = document.getElementById('rules-content');
const currentNumberElement = document.getElementById('current-number');
const playerTurnElement = document.getElementById('player-turn');
const gameOverModal = document.getElementById('game-over-modal');
const gameResultElement = document.getElementById('game-result');
const playAgainButton = document.getElementById('play-again-btn');
const returnHomeButton = document.getElementById('return-home-btn');

// 初始化游戏
function initializeGame() {
    // 重置游戏状态
    gameBoard = [];
    currentNumber = 1;
    moves = 0;
    score = 0;
    seconds = 0;
    player1Score = 0;
    player2Score = 0;
    player1Numbers = [];
    player2Numbers = [];
    currentPlayer = 1;
    gameStarted = true;
    
    // 更新UI
    movesElement.textContent = '翻牌次数: 0';
    timerElement.textContent = '时间: 00:00';
    currentNumberElement.textContent = currentNumber;
    
    // 获取游戏模式
    gameMode = gameModeSelector.value;
    
    // 根据游戏模式设置不同的分数显示
    if (gameMode === 'double') {
        scoreElement.innerHTML = `<span class="player1-score">玩家1: 0</span> | <span class="player2-score">玩家2: 0</span>`;
    } else {
        scoreElement.textContent = '0';
    }
    
    // 更新玩家回合显示
    updatePlayerTurn();
    
    // 生成1-25的随机数字数组
    const numbers = Array.from({length: 25}, (_, i) => i + 1);
    shuffleArray(numbers);
    
    // 创建游戏板
    gameBoardElement.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.dataset.value = numbers[i];
        
        // 添加点击事件
        cell.addEventListener('click', handleCellClick);
        
        gameBoardElement.appendChild(cell);
        gameBoard.push({
            value: numbers[i],
            revealed: false,
            owner: null // 用于双人模式
        });
    }
    
    // 开始计时器
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    
    // 启用重新开始按钮
    restartButton.disabled = false;
}

// 处理格子点击
function handleCellClick(event) {
    if (!gameStarted) return;
    
    const index = parseInt(event.target.dataset.index);
    const value = parseInt(event.target.dataset.value);
    
    // 如果格子已经被翻开，不做任何操作
    if (gameBoard[index].revealed) return;
    
    // 增加翻牌次数
    moves++;
    movesElement.textContent = `翻牌次数: ${moves}`;
    
    // 显示数字
    event.target.textContent = value;
    
    // 检查是否是当前要找的数字
    if (value === currentNumber) {
        // 正确的数字
        gameBoard[index].revealed = true;
        event.target.classList.add('revealed');
        
        // 记录连续猜中的数字，用于检测生日彩蛋
        consecutiveNumbers.push(value);
        // 只保留最近的两个数字
        if (consecutiveNumbers.length > 2) {
            consecutiveNumbers.shift();
        }
        
        // 检查是否连续猜中6和7（小川生日彩蛋）
        checkBirthdayEggCondition();
        
        // 双人模式下，记录格子归属
        if (gameMode === 'double') {
            gameBoard[index].owner = currentPlayer;
            event.target.classList.add(`player${currentPlayer}`);
            
            // 更新玩家分数并记录猜对的数字
            if (currentPlayer === 1) {
                player1Score++;
                player1Numbers.push(value);
            } else {
                player2Score++;
                player2Numbers.push(value);
            }
            
            // 双人模式下，每次猜测后立即切换玩家，无论是否猜对
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            // 更新分数显示
            updatePlayerTurn();
        } else {
            // 单人模式，每次猜对得10分
            score += 10;
            scoreElement.textContent = score;
        }
        
        // 更新当前要找的数字
        currentNumber++;
        currentNumberElement.textContent = currentNumber > 25 ? '完成!' : currentNumber;
        
        // 检查游戏是否结束
        if (currentNumber > 25) {
            endGame();
        }
    } else {
        // 双人模式下，每次猜测后立即切换玩家，无论是否猜对
        if (gameMode === 'double') {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerTurn();
        }
        
        // 错误的数字，延长显示时间后隐藏
        setTimeout(() => {
            event.target.textContent = '';
            
            // 单人模式下，每次猜错减1分（最低为0分）
            if (gameMode === 'single') {
                score = Math.max(0, score - 1);
                scoreElement.textContent = score.toString();
            }
        }, 900); // 延长显示时间，让玩家有更多时间看清数字
    }
}

// 更新玩家回合显示
function updatePlayerTurn() {
    if (gameMode === 'double') {
        playerTurnElement.textContent = `玩家${currentPlayer}回合`;
        playerTurnElement.className = `player${currentPlayer}-turn`;
        
        // 更新分数显示，使两位玩家的得分更容易区分
        scoreElement.innerHTML = `<span class="player1-score">玩家1: ${player1Score}</span> | <span class="player2-score">玩家2: ${player2Score}</span>`;
    } else {
        playerTurnElement.textContent = '';
        scoreElement.textContent = score;
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
    let resultText = '';
    
    if (gameMode === 'single') {
        resultText = `恭喜你完成了游戏！<br>用时: ${formatTime(seconds)}<br>翻牌次数: ${moves}<br>最终得分: ${score}`;
    } else {
        resultText = `游戏结束！<br>玩家1: ${player1Score} 格<br>玩家2: ${player2Score} 格<br>`;
        
        // 添加每位玩家猜对的数字列表
        resultText += `<br>玩家1猜对的数字: ${player1Numbers.sort((a, b) => a - b).join(', ')}<br>`;
        resultText += `玩家2猜对的数字: ${player2Numbers.sort((a, b) => a - b).join(', ')}<br><br>`;
        
        if (player1Score > player2Score) {
            resultText += '玩家1获胜！';
        } else if (player2Score > player1Score) {
            resultText += '玩家2获胜！';
        } else {
            resultText += '平局！';
        }
    }
    
    gameResultElement.innerHTML = resultText;
    gameOverModal.style.display = 'flex';
    
    // 检查是否需要显示生日彩蛋
    if (birthdayEggTriggered) {
        // 设置一个短暂的延迟，让玩家先看到游戏结果
        setTimeout(() => {
            window.location.href = '../birthday_surprise/index.html';
        }, 2000);
    }
}

// 格式化时间
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 洗牌算法
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 事件监听器
startButton.addEventListener('click', () => {
    initializeGame();
    startButton.disabled = true;
});

restartButton.addEventListener('click', () => {
    // 重置游戏状态但不自动开始计时
    // 重置游戏变量
    gameBoard = [];
    currentNumber = 1;
    moves = 0;
    score = 0;
    seconds = 0;
    player1Score = 0;
    player2Score = 0;
    player1Numbers = [];
    player2Numbers = [];
    currentPlayer = 1;
    gameStarted = false;
    
    // 停止计时器
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // 更新UI
    movesElement.textContent = '翻牌次数: 0';
    timerElement.textContent = '时间: 00:00';
    currentNumberElement.textContent = currentNumber;
    
    // 获取游戏模式
    gameMode = gameModeSelector.value;
    
    // 根据游戏模式设置不同的分数显示
    if (gameMode === 'double') {
        scoreElement.innerHTML = `<span class="player1-score">玩家1: 0</span> | <span class="player2-score">玩家2: 0</span>`;
    } else {
        scoreElement.textContent = '0';
    }
    
    // 更新玩家回合显示
    updatePlayerTurn();
    
    // 生成1-25的随机数字数组
    const numbers = Array.from({length: 25}, (_, i) => i + 1);
    shuffleArray(numbers);
    
    // 创建游戏板
    gameBoardElement.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.dataset.value = numbers[i];
        
        // 添加点击事件
        cell.addEventListener('click', handleCellClick);
        
        gameBoardElement.appendChild(cell);
        gameBoard.push({
            value: numbers[i],
            revealed: false,
            owner: null // 用于双人模式
        });
    }
    
    // 启用开始游戏按钮
    startButton.disabled = false;
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

gameModeSelector.addEventListener('change', () => {
    // 如果游戏已经开始，切换模式会重置游戏
    if (gameStarted) {
        if (confirm('切换游戏模式将重新开始游戏，确定要切换吗？')) {
            initializeGame();
        } else {
            // 恢复之前的选择
            gameModeSelector.value = gameMode;
        }
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

// 添加检测连续猜中6和7的变量
let consecutiveNumbers = [];
let birthdayEggTriggered = false;

// 检查是否满足生日彩蛋条件（连续猜中6和7）
function checkBirthdayEggCondition() {
    // 检查是否是小川生日（6月7日）
    const today = new Date();
    const isChauanBirthday = (today.getMonth() === 5 && today.getDate() === 7); // 月份从0开始，所以6月是5
    
    // 如果不是小川生日，不触发彩蛋
    if (!isChauanBirthday) return false;
    
    // 检查是否连续猜中6和7
    const isConsecutive67 = (consecutiveNumbers.length === 2 && 
                           consecutiveNumbers[0] === 6 && 
                           consecutiveNumbers[1] === 7);
    
    // 如果是小川生日且连续猜中6和7，标记彩蛋触发
    if (isConsecutive67 && !birthdayEggTriggered) {
        birthdayEggTriggered = true;
        // 彩蛋将在游戏结束后显示
    }
    
    return isConsecutive67;
}