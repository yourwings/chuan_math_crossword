// 游戏变量
let questionContainer;
let currentQuestionElement;
let answerInput;
let submitButton;
let scoreElement;
let timerElement;
let progressElement;
let gameStatusElement;
let startButton;
let restartButton;
let backButton;
let questionTypeSelector;
let questionCountSelector;
let timeLimitSelector;
let toggleRulesButton;
let rulesContent;

// 游戏状态变量
let gameStarted = false;
let gameOver = false;
let score = 0;
let timeUsed = 0;
let timeLimit = 300; // 默认5分钟
let timerInterval = null;
let currentQuestionIndex = 0;
let totalQuestions = 20; // 默认20题
let questions = [];
let correctAnswers = 0;

// 初始化函数
function init() {
    console.log('初始化口算练习游戏');
    
    // 获取DOM元素
    questionContainer = document.getElementById('question-container');
    currentQuestionElement = document.getElementById('current-question');
    answerInput = document.getElementById('answer-input');
    submitButton = document.getElementById('submit-btn');
    scoreElement = document.getElementById('score');
    timerElement = document.getElementById('timer');
    progressElement = document.getElementById('progress');
    gameStatusElement = document.getElementById('game-status');
    startButton = document.getElementById('start-btn');
    restartButton = document.getElementById('restart-btn');
    backButton = document.getElementById('back-btn');
    questionTypeSelector = document.getElementById('question-type');
    questionCountSelector = document.getElementById('question-count');
    timeLimitSelector = document.getElementById('time-limit');
    toggleRulesButton = document.getElementById('toggle-rules');
    rulesContent = document.getElementById('rules-content');
    
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    backButton.addEventListener('click', () => window.location.href = '../index.html');
    submitButton.addEventListener('click', submitAnswer);
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    toggleRulesButton.addEventListener('click', toggleRules);
    
    // 初始化游戏设置
    updateGameSettings();
    
    // 初始状态设置
    restartButton.disabled = true;
    submitButton.disabled = true;
    answerInput.disabled = true;
}

// 更新游戏设置
function updateGameSettings() {
    totalQuestions = parseInt(questionCountSelector.value);
    timeLimit = parseInt(timeLimitSelector.value);
    console.log(`设置题目数量: ${totalQuestions}, 时间限制: ${timeLimit}秒`);
}

// 开始游戏
function startGame() {
    if (gameStarted) return;
    
    console.log('开始口算练习游戏');
    updateGameSettings();
    
    gameStarted = true;
    gameOver = false;
    score = 0;
    timeUsed = 0;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    
    // 更新UI
    scoreElement.textContent = '0';
    startButton.disabled = true;
    restartButton.disabled = false;
    submitButton.disabled = false;
    answerInput.disabled = false;
    questionTypeSelector.disabled = true;
    questionCountSelector.disabled = true;
    timeLimitSelector.disabled = true;
    gameStatusElement.textContent = '';
    progressElement.textContent = `进度: 0/${totalQuestions}`;
    
    // 生成题目
    generateQuestions();
    
    // 显示第一题
    showNextQuestion();
    
    // 开始计时
    startTimer();
    
    // 聚焦到输入框
    answerInput.focus();
}

// 生成题目
function generateQuestions() {
    questions = [];
    const questionType = questionTypeSelector.value;
    
    for (let i = 0; i < totalQuestions; i++) {
        let question;
        switch (questionType) {
            case 'add_sub_20':
                question = generateAddSubQuestion(20);
                break;
            case 'add_sub_100':
                question = generateAddSubQuestion(100);
                break;
            case 'add_sub_mul_div_20':
                question = generateMixedQuestion(20);
                break;
            case 'mul_single':
                question = generateMultiplicationQuestion(9);
                break;
            case 'all_100':
                question = generateMixedQuestion(100);
                break;
            default:
                question = generateAddSubQuestion(20);
        }
        questions.push(question);
    }
    
    console.log(`已生成 ${questions.length} 道题目`);
}

// 生成加减法题目
function generateAddSubQuestion(max) {
    const operation = Math.random() < 0.5 ? '+' : '-';
    let num1, num2, answer;
    
    if (operation === '+') {
        // 加法：确保结果不超过max
        num1 = Math.floor(Math.random() * (max / 2)) + 1;
        num2 = Math.floor(Math.random() * (max - num1)) + 1;
        answer = num1 + num2;
    } else {
        // 减法：确保结果为正数
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
    }
    
    return {
        expression: `${num1} ${operation} ${num2}`,
        answer: answer
    };
}

// 生成乘法题目
function generateMultiplicationQuestion(max) {
    const num1 = Math.floor(Math.random() * max) + 1;
    const num2 = Math.floor(Math.random() * max) + 1;
    const answer = num1 * num2;
    
    return {
        expression: `${num1} × ${num2}`,
        answer: answer
    };
}

// 生成除法题目
function generateDivisionQuestion(max) {
    // 确保除法结果为整数
    const num2 = Math.floor(Math.random() * max) + 1;
    const answer = Math.floor(Math.random() * max) + 1;
    const num1 = num2 * answer;
    
    return {
        expression: `${num1} ÷ ${num2}`,
        answer: answer
    };
}

// 生成混合运算题目
function generateMixedQuestion(max) {
    const operationType = Math.random();
    
    if (operationType < 0.3) {
        return generateAddSubQuestion(max);
    } else if (operationType < 0.6) {
        return generateMultiplicationQuestion(Math.min(max, 10));
    } else if (operationType < 0.9) {
        return generateDivisionQuestion(Math.min(max, 10));
    } else {
        // 复合运算
        return generateComplexQuestion(max);
    }
}

// 生成复合运算题目
function generateComplexQuestion(max) {
    // 简单的两步运算，如 (a + b) * c 或 (a * b) - c
    const operations = ['+', '-', '×', '÷'];
    const op1 = operations[Math.floor(Math.random() * 2)]; // 加或减
    const op2 = operations[Math.floor(Math.random() * 2) + 2]; // 乘或除
    
    let num1, num2, num3, intermediateResult, answer;
    
    // 确保所有数字和结果在合理范围内
    if (Math.random() < 0.5) {
        // (a op1 b) op2 c
        if (op1 === '+') {
            num1 = Math.floor(Math.random() * (max / 3)) + 1;
            num2 = Math.floor(Math.random() * (max / 3)) + 1;
            intermediateResult = num1 + num2;
        } else { // op1 === '-'
            num1 = Math.floor(Math.random() * max) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            intermediateResult = num1 - num2;
        }
        
        if (op2 === '×') {
            num3 = Math.floor(Math.random() * Math.min(max / intermediateResult, 5)) + 1;
            answer = intermediateResult * num3;
        } else { // op2 === '÷'
            // 确保能整除
            num3 = Math.floor(Math.random() * Math.min(5, intermediateResult)) + 1;
            if (num3 > 0 && intermediateResult % num3 === 0) {
                answer = intermediateResult / num3;
            } else {
                num3 = 1;
                answer = intermediateResult;
            }
        }
        
        return {
            expression: `(${num1} ${op1} ${num2}) ${op2} ${num3}`,
            answer: answer
        };
    } else {
        // a op2 (b op1 c)
        if (op1 === '+') {
            num2 = Math.floor(Math.random() * (max / 3)) + 1;
            num3 = Math.floor(Math.random() * (max / 3)) + 1;
            intermediateResult = num2 + num3;
        } else { // op1 === '-'
            num2 = Math.floor(Math.random() * max) + 1;
            num3 = Math.floor(Math.random() * num2) + 1;
            intermediateResult = num2 - num3;
        }
        
        if (op2 === '×') {
            num1 = Math.floor(Math.random() * Math.min(max / intermediateResult, 5)) + 1;
            answer = num1 * intermediateResult;
        } else { // op2 === '÷'
            // 确保结果为整数
            num1 = intermediateResult * (Math.floor(Math.random() * 5) + 1);
            answer = num1 / intermediateResult;
        }
        
        return {
            expression: `${num1} ${op2} (${num2} ${op1} ${num3})`,
            answer: answer
        };
    }
}

// 显示下一题
function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    currentQuestionElement.textContent = `${question.expression} = ?`;
    answerInput.value = '';
    progressElement.textContent = `进度: ${currentQuestionIndex + 1}/${totalQuestions}`;
    
    // 聚焦到输入框
    answerInput.focus();
}

// 提交答案
function submitAnswer() {
    if (!gameStarted || gameOver) return;
    
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
        // 输入无效
        answerInput.classList.add('wrong-answer');
        setTimeout(() => {
            answerInput.classList.remove('wrong-answer');
        }, 500);
        return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = userAnswer === currentQuestion.answer;
    
    if (isCorrect) {
        // 答案正确
        correctAnswers++;
        currentQuestionElement.classList.add('correct-answer');
        setTimeout(() => {
            currentQuestionElement.classList.remove('correct-answer');
            currentQuestionIndex++;
            showNextQuestion();
        }, 500);
    } else {
        // 答案错误
        currentQuestionElement.classList.add('wrong-answer');
        setTimeout(() => {
            currentQuestionElement.classList.remove('wrong-answer');
            currentQuestionIndex++;
            showNextQuestion();
        }, 500);
    }
    
    // 更新分数
    updateScore();
}

// 更新分数
function updateScore() {
    // 基础分数：每道正确题目10分
    score = correctAnswers * 10;
    
    // 时间奖励：如果有时间限制，根据剩余时间比例给予额外奖励
    if (timeLimit > 0 && timeUsed < timeLimit) {
        const timeRatio = 1 - (timeUsed / timeLimit);
        const timeBonus = Math.floor(correctAnswers * 5 * timeRatio);
        score += timeBonus;
    }
    
    scoreElement.textContent = score;
}

// 开始计时器
function startTimer() {
    timeUsed = 0;
    timerElement.textContent = '时间: 00:00';
    
    timerInterval = setInterval(() => {
        timeUsed++;
        timerElement.textContent = `时间: ${formatTime(timeUsed)}`;
        
        // 如果设置了时间限制，检查是否超时
        if (timeLimit > 0 && timeUsed >= timeLimit) {
            endGame();
        }
    }, 1000);
}

// 停止计时器
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 结束游戏
function endGame() {
    if (!gameStarted || gameOver) return;
    
    gameOver = true;
    stopTimer();
    
    // 禁用输入和提交
    answerInput.disabled = true;
    submitButton.disabled = true;
    
    // 启用设置选项
    questionTypeSelector.disabled = false;
    questionCountSelector.disabled = false;
    timeLimitSelector.disabled = false;
    
    // 更新最终分数
    updateScore();
    
    // 显示游戏结果
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    gameStatusElement.textContent = `练习完成！正确率: ${accuracy}%，得分: ${score}，用时: ${formatTime(timeUsed)}`;
    gameStatusElement.style.color = '#4CAF50';
}

// 重新开始游戏
function restartGame() {
    console.log('重新开始口算练习游戏');
    
    // 停止当前计时器
    stopTimer();
    
    // 重置游戏状态
    gameStarted = false;
    gameOver = false;
    score = 0;
    timeUsed = 0;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    questions = [];
    
    // 更新UI
    scoreElement.textContent = '0';
    gameStatusElement.textContent = '';
    currentQuestionElement.textContent = '准备开始';
    progressElement.textContent = `进度: 0/${totalQuestions}`;
    timerElement.textContent = '时间: 00:00';
    answerInput.value = '';
    
    // 重新启用设置选项
    questionTypeSelector.disabled = false;
    questionCountSelector.disabled = false;
    timeLimitSelector.disabled = false;
    
    // 重新启用开始按钮
    startButton.disabled = false;
    
    // 禁用重新开始按钮、提交按钮和答案输入框
    restartButton.disabled = true;
    submitButton.disabled = true;
    answerInput.disabled = true;
    
    console.log('游戏已重置，准备重新开始');
}

// 切换规则显示/隐藏
function toggleRules() {
    if (rulesContent.style.display === 'none') {
        rulesContent.style.display = 'block';
        toggleRulesButton.textContent = '隐藏规则';
    } else {
        rulesContent.style.display = 'none';
        toggleRulesButton.textContent = '显示规则';
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', init);