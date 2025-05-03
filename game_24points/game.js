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

// 确保游戏模式选择器包含所有难度选项
function updateGameModeOptions() {
    // 清空现有选项
    gameModeSelector.innerHTML = '';
    
    // 添加难度选项
    const options = [
        {value: 'standard', text: '标准模式 (随机难度)'},
        {value: 'easy', text: '简单模式'},
        {value: 'medium', text: '中等模式'},
        {value: 'hard', text: '困难模式'}
    ];
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        gameModeSelector.appendChild(optionElement);
    });
}
const numberCardsElement = document.getElementById('number-cards');
const targetNumberElement = document.getElementById('target-number');
const expressionInput = document.getElementById('expression-input');
const resultMessageElement = document.getElementById('result-message');
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const checkButton = document.getElementById('check-btn');
const clearButton = document.getElementById('clear-btn');
const hintButton = document.getElementById('hint-btn');
const backButton = document.getElementById('back-btn');
const toggleRulesButton = document.getElementById('toggle-rules');
const rulesContent = document.getElementById('rules-content');
const gameOverModal = document.getElementById('game-over-modal');
const gameResultElement = document.getElementById('game-result');
const playAgainButton = document.getElementById('play-again-btn');
const returnHomeButton = document.getElementById('return-home-btn');

// 存储当前问题的答案
let currentSolution = '';

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
    // 根据游戏模式选择难度
    let difficulty;
    if (gameMode === 'easy') {
        difficulty = 'easy';
    } else if (gameMode === 'medium') {
        difficulty = 'medium';
    } else if (gameMode === 'hard') {
        difficulty = 'hard';
    } else {
        // 在标准模式下，随机选择难度
        const difficulties = ['easy', 'medium', 'hard'];
        difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    }
    
    // 更新难度显示
    if (difficulty === 'easy') {
        levelElement.textContent = '难度: 简单';
        // 简单难度：生成1-10之间的数字
        generateRandomNumbersWithSolution(1, 10, difficulty);
    } else if (difficulty === 'medium') {
        levelElement.textContent = '难度: 中等';
        // 中等难度：生成1-13之间的数字
        generateRandomNumbersWithSolution(1, 13, difficulty);
    } else {
        levelElement.textContent = '难度: 困难';
        // 困难难度：生成1-13之间的数字，但更倾向于生成需要除法的题目
        generateRandomNumbersWithSolution(1, 13, difficulty);
    }
    
    // 确保目标数字正确设置
    targetNumber = gameMode === 'standard' ? 24 : targetNumber;
    
    // 打乱数字顺序
    shuffleArray(currentNumbers);
}

// 生成有解的24点数字组合
function generateRandomNumbersWithSolution(min, max, difficulty) {
    // 最大尝试次数，防止无限循环
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        // 生成4个随机数
        const numbers = [];
        for (let i = 0; i < 4; i++) {
            numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        
        // 尝试求解24点
        const result = solve24Points(numbers);
        
        // 如果找到解，则使用这组数字
        if (result.found) {
            currentNumbers = [...numbers];
            currentSolution = result.solution;
            return;
        }
        
        attempts++;
    }
    
    // 如果尝试多次仍未找到解，使用一些确定有解的数字组合
    const fallbackNumbers = [
        [1, 2, 3, 4],  // (1+3)*2*4 = 24
        [2, 3, 4, 5],  // (5+3-2)*4 = 24
        [3, 4, 5, 6],  // (5+3-4)*6 = 24
        [4, 6, 7, 8],  // 4*6*(8-7) = 24
        [5, 5, 9, 9],  // 5*5-9/9 = 24
        [1, 4, 7, 8],  // (8-4)*(7-1) = 24
        [2, 5, 7, 10], // (7-5)*(10+2) = 24
        [3, 8, 8, 8]   // (8/8+3)*8 = 24
    ];
    
    const selectedFallback = fallbackNumbers[Math.floor(Math.random() * fallbackNumbers.length)];
    currentNumbers = [...selectedFallback];
    
    // 重新计算解法
    const fallbackResult = solve24Points(selectedFallback);
    if (fallbackResult.found) {
        currentSolution = fallbackResult.solution;
    } else {
        // 这种情况不应该发生，因为我们选择的是已知有解的组合
        currentSolution = "有解，但未能自动生成解法";
    }
}

// 24点求解算法
function solve24Points(numbers) {
    const EPSILON = 1e-6; // 浮点数比较的精度阈值
    const TARGET = targetNumber; // 使用当前目标数字
    
    // 检查两个浮点数是否相等
    function isEqual(a, b) {
        return Math.abs(a - b) < EPSILON;
    }
    
    // 递归求解函数
    function search(nums, expressions) {
        // 如果只剩一个数，检查是否等于目标值
        if (nums.length === 1) {
            if (isEqual(nums[0], TARGET)) {
                return { found: true, solution: expressions[0] + " = " + TARGET };
            }
            return { found: false };
        }
        
        // 尝试所有可能的数字对组合
        for (let i = 0; i < nums.length; i++) {
            for (let j = i + 1; j < nums.length; j++) {
                const a = nums[i];
                const b = nums[j];
                const exprA = expressions[i];
                const exprB = expressions[j];
                
                // 创建新的数组，移除已使用的两个数
                const newNums = nums.filter((_, idx) => idx !== i && idx !== j);
                
                // 尝试加法
                newNums.push(a + b);
                const newExprsAdd = expressions.filter((_, idx) => idx !== i && idx !== j);
                // 判断是否需要括号
                const addExpr = needParentheses(exprA, exprB, '+') ? `(${exprA}+${exprB})` : `${exprA}+${exprB}`;
                newExprsAdd.push(addExpr);
                const resultAdd = search(newNums, newExprsAdd);
                if (resultAdd.found) return resultAdd;
                newNums.pop();
                
                // 尝试减法 (a-b)
                newNums.push(a - b);
                const newExprsSub1 = expressions.filter((_, idx) => idx !== i && idx !== j);
                // 判断是否需要括号
                const sub1Expr = needParentheses(exprA, exprB, '-') ? `(${exprA}-${exprB})` : `${exprA}-${exprB}`;
                newExprsSub1.push(sub1Expr);
                const resultSub1 = search(newNums, newExprsSub1);
                if (resultSub1.found) return resultSub1;
                newNums.pop();
                
                // 尝试减法 (b-a)
                newNums.push(b - a);
                const newExprsSub2 = expressions.filter((_, idx) => idx !== i && idx !== j);
                // 判断是否需要括号
                const sub2Expr = needParentheses(exprB, exprA, '-') ? `(${exprB}-${exprA})` : `${exprB}-${exprA}`;
                newExprsSub2.push(sub2Expr);
                const resultSub2 = search(newNums, newExprsSub2);
                if (resultSub2.found) return resultSub2;
                newNums.pop();
                
                // 尝试乘法
                newNums.push(a * b);
                const newExprsMul = expressions.filter((_, idx) => idx !== i && idx !== j);
                // 判断是否需要括号
                const mulExpr = needParentheses(exprA, exprB, '*') ? `(${exprA}*${exprB})` : `${exprA}*${exprB}`;
                newExprsMul.push(mulExpr);
                const resultMul = search(newNums, newExprsMul);
                if (resultMul.found) return resultMul;
                newNums.pop();
                
                // 尝试除法 (a/b)，注意除数不能为0
                if (!isEqual(b, 0)) {
                    newNums.push(a / b);
                    const newExprsDiv1 = expressions.filter((_, idx) => idx !== i && idx !== j);
                    // 判断是否需要括号
                    const div1Expr = needParentheses(exprA, exprB, '/') ? `(${exprA}/${exprB})` : `${exprA}/${exprB}`;
                    newExprsDiv1.push(div1Expr);
                    const resultDiv1 = search(newNums, newExprsDiv1);
                    if (resultDiv1.found) return resultDiv1;
                    newNums.pop();
                }
                
                // 尝试除法 (b/a)，注意除数不能为0
                if (!isEqual(a, 0)) {
                    newNums.push(b / a);
                    const newExprsDiv2 = expressions.filter((_, idx) => idx !== i && idx !== j);
                    // 判断是否需要括号
                    const div2Expr = needParentheses(exprB, exprA, '/') ? `(${exprB}/${exprA})` : `${exprB}/${exprA}`;
                    newExprsDiv2.push(div2Expr);
                    const resultDiv2 = search(newNums, newExprsDiv2);
                    if (resultDiv2.found) return resultDiv2;
                    newNums.pop();
                }
            }
        }
        
        // 如果所有组合都尝试过了，仍然没有找到解
        return { found: false };
    }
    
    // 判断表达式是否需要括号
    function needParentheses(expr1, expr2, operator) {
        // 如果表达式只是单个数字，不需要括号
        if (!isNaN(expr1) && !isNaN(expr2)) {
            return false;
        }
        
        // 如果是最外层表达式，不需要括号
        if (nums.length === 4) {
            return false;
        }
        
        // 根据运算符优先级判断是否需要括号
        // 乘除法优先级高于加减法
        if ((operator === '+' || operator === '-') && 
            (expr1.includes('*') || expr1.includes('/') || 
             expr2.includes('*') || expr2.includes('/'))) {
            return true;
        }
        
        return false;
    }
    
    // 初始化表达式数组，每个数字对应一个表达式
    const expressions = numbers.map(num => num.toString());
    
    // 开始搜索
    return search([...numbers], expressions);
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

hintButton.addEventListener('click', () => {
    if (gameStarted) {
        // 如果当前没有解决方案，重新计算一次
        if (!currentSolution) {
            const result = solve24Points(currentNumbers);
            if (result.found) {
                currentSolution = result.solution;
            } else {
                currentSolution = "无解";
            }
        }
        
        // 显示当前问题的答案提示
        showMessage(`提示答案: ${currentSolution}`, 'hint');
        // 扣除一些分数作为使用提示的代价
        score = Math.max(0, score - 5);
        scoreElement.textContent = score;
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

// 表达式输入框的键盘事件
expressionInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && gameStarted) {
        checkExpression();
    }
});

// 游戏模式选择器事件
gameModeSelector.addEventListener('change', () => {
    // 如果游戏已经开始，不允许切换模式
    if (gameStarted) {
        // 恢复之前的选择，不提示确认
        gameModeSelector.value = gameMode;
        showMessage('游戏已开始，不能切换游戏模式', 'incorrect');
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
    
    // 初始化游戏模式选择器
    updateGameModeOptions();
    
    // 初始化数字键盘
    initializeNumberKeyboard();
});