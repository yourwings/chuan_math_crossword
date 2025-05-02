// 游戏变量
let score = 0;
let timer = null;
let seconds = 0;
let gameMode = 'standard';
let targetNumber = 24;
let currentNumbers = [];
let gameStarted = false;
let solvedProblems = 0;

// DOM元素
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const levelElement = document.getElementById('level');
const gameModeSelector = document.getElementById('game-mode');
const numberCardsElement = document.getElementById('number-cards');
const targetNumberElement = document.getElementById('target-number');
const expressionInput = document.getElementById('expression-input');
const resultMessageElement = document.getElementById('result-message');
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const checkButton = document.getElementById('check-btn');
const clearButton = document.getElementById('clear-btn');
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
    score = 0;
    seconds = 0;
    solvedProblems = 0;
    gameStarted = true;
    
    // 更新UI
    scoreElement.textContent = '0';
    timerElement.textContent = '时间: 00:00';
    resultMessageElement.textContent = '';
    resultMessageElement.className = 'result-message';
    
    // 获取游戏模式
    gameMode = gameModeSelector.value;
    
    // 根据游戏模式设置目标数字和难度
    if (gameMode === 'standard') {
        targetNumber = 24;
        levelElement.textContent = '难度: 标准';
    } else {
        // 简单模式，随机生成20以内的目标数字
        targetNumber = Math.floor(Math.random() * 20) + 1;
        levelElement.textContent = '难度: 简单';
    }
    
    targetNumberElement.textContent = targetNumber;
    
    // 生成新的数字
    generateNumbers();
    
    // 清空输入框
    expressionInput.value = '';
    
    // 开始计时器
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    
    // 启用按钮
    startButton.disabled = true;
    nextButton.disabled = false;
    checkButton.disabled = false;
    clearButton.disabled = false;
    
    // 初始化数字键盘
    initializeNumberKeyboard();
}

// 生成随机数字
function generateNumbers() {
    // 清空当前数字
    currentNumbers = [];
    
    if (gameMode === 'standard') {
        // 标准模式：生成有解的24点题目
        generateSolvable24PointsNumbers();
    } else {
        // 简单模式：生成1-10之间的4个随机数
        for (let i = 0; i < 4; i++) {
            currentNumbers.push(Math.floor(Math.random() * 10) + 1);
        }
    }
    
    // 更新UI
    renderNumberCards();
}

// 生成有解的24点题目
function generateSolvable24PointsNumbers() {
    // 预设一些经典的24点题目
    const classicProblems = [
        [1, 2, 3, 4],     // (1+2+3)*4 = 24
        [2, 3, 4, 5],     // (5-2-3)*4 = 0
        [3, 3, 8, 8],     // (8/8+3)*8 = 32
        [1, 4, 5, 6],     // (1+5)*4 = 24
        [2, 3, 10, 10],   // (10*10-2)/3 = 32.67
        [1, 5, 5, 5],     // (5+5+5+1) = 16
        [1, 3, 4, 6],     // (1+3)*6 = 24
        [2, 4, 6, 8],     // (8-2)*4 = 24
        [3, 4, 5, 6],     // 4*6 = 24
        [1, 1, 8, 8],     // (8/1)*(8/1) = 64
        [2, 5, 5, 10],    // 10*5/5*2 = 20
        [3, 3, 7, 7],     // (7-3)*(7-3) = 16
        [4, 4, 6, 6],     // (6+6)*(4-4) = 0
        [2, 3, 3, 4],     // (3+3+2)*4 = 32
        [1, 2, 5, 10],    // (10-1)*5/2 = 22.5
        [1, 3, 3, 9],     // (9-1)*3 = 24
        [2, 2, 6, 6],     // (6+6)*2 = 24
        [3, 5, 7, 9],     // (9-5)*7/3 = 9.33
        [1, 4, 7, 8],     // (8-4)*(7-1) = 24
        [2, 2, 3, 12]     // 12*2 = 24
    ];
    
    // 随机选择一个问题
    const selectedProblem = classicProblems[Math.floor(Math.random() * classicProblems.length)];
    currentNumbers = [...selectedProblem];
    
    // 打乱数字顺序
    shuffleArray(currentNumbers);
}

// 渲染数字卡片
function renderNumberCards() {
    numberCardsElement.innerHTML = '';
    
    for (let i = 0; i < currentNumbers.length; i++) {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.textContent = currentNumbers[i];
        
        // 添加点击事件，将数字添加到表达式输入框
        card.addEventListener('click', () => {
            if (gameStarted) {
                expressionInput.value += currentNumbers[i];
            }
        });
        
        numberCardsElement.appendChild(card);
    }
}

// 检查表达式
function checkExpression() {
    const expression = expressionInput.value.trim();
    
    if (!expression) {
        showMessage('请输入算式', 'incorrect');
        return;
    }
    
    try {
        // 验证表达式是否使用了所有给定的数字，且每个数字只使用一次
        if (!validateNumbersUsage(expression)) {
            showMessage('请确保使用所有给定的数字，且每个数字只使用一次', 'incorrect');
            return;
        }
        
        // 计算表达式结果
        const result = evaluateExpression(expression);
        
        // 检查结果是否为整数
        if (!Number.isInteger(result)) {
            showMessage(`结果 ${result} 不是整数`, 'incorrect');
            return;
        }
        
        // 检查结果是否等于目标数字
        if (result === targetNumber) {
            // 答对了
            score += 10;
            solvedProblems++;
            scoreElement.textContent = score;
            showMessage('恭喜，答对了！', 'correct');
            
            // 如果是简单模式，生成新的目标数字
            if (gameMode === 'easy') {
                targetNumber = Math.floor(Math.random() * 20) + 1;
                targetNumberElement.textContent = targetNumber;
            }
        } else {
            showMessage(`结果是 ${result}，不等于目标数字 ${targetNumber}`, 'incorrect');
        }
    } catch (error) {
        showMessage('表达式无效，请检查语法', 'incorrect');
        console.error(error);
    }
}

// 验证表达式中使用的数字
function validateNumbersUsage(expression) {
    // 提取表达式中的所有数字
    const numbersInExpression = expression.match(/\d+/g) || [];
    
    // 如果数字数量不匹配，直接返回false
    if (numbersInExpression.length !== currentNumbers.length) {
        return false;
    }
    
    // 将表达式中的数字转换为数字类型
    const expressionNumbers = numbersInExpression.map(Number);
    
    // 检查每个数字是否都在当前数字列表中，且只使用一次
    const tempCurrentNumbers = [...currentNumbers];
    
    for (const num of expressionNumbers) {
        const index = tempCurrentNumbers.indexOf(num);
        if (index === -1) {
            return false; // 数字不在列表中
        }
        tempCurrentNumbers.splice(index, 1); // 移除已使用的数字
    }
    
    return tempCurrentNumbers.length === 0; // 所有数字都已使用
}

// 计算表达式结果
function evaluateExpression(expression) {
    // 安全地计算表达式
    // 注意：这种方法有安全风险，但在这个简单游戏中可以接受
    // 在实际生产环境中，应使用专门的表达式解析库
    return Function('return ' + expression)();
}

// 显示消息
function showMessage(message, type) {
    resultMessageElement.textContent = message;
    resultMessageElement.className = `result-message ${type}`;
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
        游戏结束！<br>
        用时: ${formatTime(seconds)}<br>
        解决问题数: ${solvedProblems}<br>
        最终得分: ${score}
    `;
    
    gameResultElement.innerHTML = resultText;
    gameOverModal.style.display = 'flex';
    
    // 禁用游戏按钮
    nextButton.disabled = true;
    checkButton.disabled = true;
    clearButton.disabled = true;
    startButton.disabled = false;
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
});

nextButton.addEventListener('click', () => {
    // 生成新的数字
    generateNumbers();
    
    // 清空输入框和消息
    expressionInput.value = '';
    resultMessageElement.textContent = '';
    resultMessageElement.className = 'result-message';
});

checkButton.addEventListener('click', () => {
    if (gameStarted) {
        checkExpression();
    }
});

clearButton.addEventListener('click', () => {
    expressionInput.value = '';
    resultMessageElement.textContent = '';
    resultMessageElement.className = 'result-message';
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

// 表达式输入框的键盘事件
expressionInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && gameStarted) {
        checkExpression();
    }
});

// 游戏模式选择器事件
gameModeSelector.addEventListener('change', () => {
    // 如果游戏已经开始，切换模式会重置游戏
    if (gameStarted) {
        if (confirm('切换游戏模式将重新开始游戏，确定要切换吗？')) {
            initializeGame();
        } else {
            // 恢复之前的选择
            gameModeSelector.value = gameMode;
        }
    } else {
        // 更新目标数字显示
        if (gameModeSelector.value === 'standard') {
            targetNumber = 24;
        } else {
            targetNumber = Math.floor(Math.random() * 20) + 1;
        }
        targetNumberElement.textContent = targetNumber;
    }
});

// 初始化数字键盘功能
function initializeNumberKeyboard() {
    const keyboardKeys = document.querySelectorAll('.keyboard-key');
    
    keyboardKeys.forEach(key => {
        // 移除可能存在的旧事件监听器
        key.removeEventListener('click', handleKeyboardClick);
        // 添加新的事件监听器
        key.addEventListener('click', handleKeyboardClick);
    });
}

// 处理键盘点击事件
function handleKeyboardClick() {
    const keyValue = this.textContent;
    
    // 根据按键内容执行不同操作
    if (keyValue === '删除') {
        // 删除最后一个字符
        expressionInput.value = expressionInput.value.slice(0, -1);
    } else if (keyValue === '清空') {
        // 清空输入框
        expressionInput.value = '';
        resultMessageElement.textContent = '';
        resultMessageElement.className = 'result-message';
    } else {
        // 添加数字或运算符到输入框
        expressionInput.value += keyValue;
    }
    
    // 聚焦输入框
    expressionInput.focus();
}

// 初始页面设置
document.addEventListener('DOMContentLoaded', () => {
    nextButton.disabled = true;
    checkButton.disabled = true;
    clearButton.disabled = true;
    
    // 初始化数字键盘
    initializeNumberKeyboard();
});