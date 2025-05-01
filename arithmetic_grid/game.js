// 游戏常量
const CANVAS_BORDER_COLOR = '#000';
const CANVAS_BACKGROUND_COLOR = '#fff';
const GRID_COLOR = '#ccc';
const TEXT_COLOR = '#000';
const HIGHLIGHT_COLOR = '#4CAF50';
let GRID_SIZE = 50; // 网格大小（可变）
const GRID_COUNT = 10; // 10x10网格

// 表达式边框颜色数组
const EXPRESSION_COLORS = [
    '#FF5733', // 红色
    '#33A8FF', // 蓝色
    '#33FF57', // 绿色
    '#FF33A8', // 粉色
    '#A833FF', // 紫色
    '#FFD700', // 金色
    '#00CED1', // 青色
    '#FF8C00', // 橙色
    '#9ACD32', // 黄绿色
    '#FF6347'  // 番茄色
];


// 声明Canvas元素和上下文变量
let gameCanvas;
let ctx;

// 调整画布大小以适应网格和设备屏幕
function resizeCanvas() {
    // 获取设备宽度和容器宽度
    const deviceWidth = window.innerWidth;
    const containerWidth = document.querySelector('.game-container').clientWidth - 30; // 减去内边距
    
    // 根据设备宽度调整网格大小
    if (deviceWidth < 480) {
        GRID_SIZE = Math.floor(containerWidth / GRID_COUNT);
    } else if (deviceWidth < 768) {
        GRID_SIZE = Math.floor(containerWidth / GRID_COUNT);
    } else {
        GRID_SIZE = 50; // 默认大小
    }
    
    // 设置画布大小
    gameCanvas.width = GRID_SIZE * GRID_COUNT;
    gameCanvas.height = GRID_SIZE * GRID_COUNT;
    
    // 重新绘制游戏
    if (gameStarted) {
        renderGame();
    } else {
        init();
    }
}

// 监听窗口大小变化
window.addEventListener('resize', resizeCanvas);

// 注意：初始调整画布大小将在DOMContentLoaded事件中进行

// 游戏状态变量
let gameStarted = false;
let gameOver = false;
let score = 0;
let selectedCell = null;
let puzzleGrid = [];
let expressions = [];
// 用于记录格子状态的数组：null=未填写，true=填写正确，false=填写错误
let cellStatus = [];
// 倒计时相关变量
let timeRemaining = 300; // 5分钟倒计时
let timeUsed = 0; // 用时计时器
let timerInterval = null;

// 获取DOM元素
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const levelSelector = document.getElementById('game-speed'); // 复用speed选择器作为难度选择器
const timerElement = document.createElement('div');
timerElement.id = 'timer';
timerElement.className = 'timer';
timerElement.innerHTML = '时间: 5:00';
document.querySelector('.score-container').appendChild(timerElement);

// 游戏难度设置
const GAME_LEVELS = {
    easy: { operations: ['+', '-'] },
    medium: { operations: ['+', '-', '*'] },
    hard: { operations: ['+', '-', '*', '/'] }
};

// 获取数字按钮元素
const numberPad = document.getElementById('number-pad');
const numberButtons = document.querySelectorAll('.number-btn');

// 添加事件监听器
function initializeEventListeners() {
    console.log('初始化事件监听器');
    
    // 初始化游戏
    init();
    
    // 直接获取按钮元素并绑定事件
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backBtn = document.getElementById('back-btn');
    const toggleRulesButton = document.getElementById('toggle-rules');
    
    // 绑定开始游戏按钮事件
    if (startBtn) {
        console.log('找到开始游戏按钮，绑定事件');
        // 直接绑定事件，不使用cloneNode
        startBtn.addEventListener('click', function(e) {
            console.log('开始游戏按钮被点击');
            startGame();
        });
    } else {
        console.error('开始游戏按钮未找到');
    }
    
    // 绑定重新开始按钮事件
    if (restartBtn) {
        restartBtn.addEventListener('click', function(e) {
            console.log('重新开始按钮被点击');
            restartGame();
        });
    } else {
        console.error('重新开始按钮未找到');
    }
    
    // 绑定返回按钮事件
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            console.log('返回按钮被点击');
            window.location.href = '../index.html';
        });
    } else {
        console.error('返回按钮未找到');
    }
    
    // 绑定规则切换按钮事件
    if (toggleRulesButton) {
        console.log('找到规则切换按钮，绑定事件');
        toggleRulesButton.addEventListener('click', function(e) {
            console.log('规则切换按钮被点击');
            toggleRules();
        });
    } else {
        console.error('规则切换按钮未找到');
    }
    
    // 添加画布点击事件
    gameCanvas.addEventListener('click', handleCanvasClick);
    
    // 添加触摸事件支持
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        gameCanvas.addEventListener('touchstart', handleCanvasClick);
    }
    
    // 添加数字按钮事件监听
    numberButtons.forEach(button => {
        button.addEventListener('click', handleNumberButtonClick);
    });
    
    // 初始隐藏数字选择区域
    numberPad.style.display = 'none';
    
    // 初始化倒计时显示
    updateTimerDisplay();
    
    console.log('所有事件监听器初始化完成');
}

// 规则切换函数
function toggleRules() {
    const rulesContent = document.getElementById('rules-content');
    const toggleRulesButton = document.getElementById('toggle-rules');
    
    console.log('切换规则显示状态');
    
    // 获取当前计算样式，这样更可靠
    const computedStyle = window.getComputedStyle(rulesContent);
    const isVisible = computedStyle.display !== 'none';
    
    console.log('当前规则显示状态:', isVisible ? '显示' : '隐藏');
    
    if (isVisible) {
        // 当前可见，需要隐藏
        rulesContent.style.display = 'none';
        toggleRulesButton.textContent = '显示规则';
        console.log('规则已隐藏');
    } else {
        // 当前隐藏，需要显示
        rulesContent.style.display = 'block';
        toggleRulesButton.textContent = '隐藏规则';
        console.log('规则已显示');
    }
}

// 在文档加载完成后初始化事件监听器
document.addEventListener('DOMContentLoaded', function() {
    console.log('文档加载完成，准备初始化事件监听器');
    
    // 获取Canvas元素和上下文
    gameCanvas = document.getElementById('game-canvas');
    if (gameCanvas) {
        console.log('成功获取Canvas元素');
        ctx = gameCanvas.getContext('2d');
    } else {
        console.error('无法获取Canvas元素，游戏无法初始化');
        return;
    }
    
    // 确保其他DOM元素已加载
    if (!startButton) {
        console.log('开始按钮未找到，尝试重新获取');
        window.startButton = document.getElementById('start-btn');
    }
    
    if (!restartButton) {
        console.log('重新开始按钮未找到，尝试重新获取');
        window.restartButton = document.getElementById('restart-btn');
    }
    
    if (!scoreElement) {
        console.log('分数元素未找到，尝试重新获取');
        window.scoreElement = document.getElementById('score');
    }
    
    if (!levelSelector) {
        console.log('难度选择器未找到，尝试重新获取');
        window.levelSelector = document.getElementById('game-speed');
    }
    
    // 初始调整画布大小
    console.log('调整画布大小');
    resizeCanvas();
    
    // 初始化事件监听器
    console.log('开始初始化事件监听器');
    initializeEventListeners();
    console.log('事件监听器初始化完成');
});

// 确保页面完全加载后也执行初始化
window.onload = function() {
    console.log('页面完全加载完成，确保游戏已初始化');
    // 如果游戏尚未初始化，则初始化
    if (!gameStarted && !document.querySelector('.game-container').classList.contains('initialized')) {
        console.log('游戏尚未初始化，执行初始化');
        document.querySelector('.game-container').classList.add('initialized');
        initializeEventListeners();
    }
};


// 初始化游戏
function init() {
    console.log('初始化游戏界面...');
    
    // 确保Canvas元素和上下文存在
    if (!gameCanvas || !ctx) {
        console.error('Canvas元素或上下文未找到，尝试重新获取');
        gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            ctx = gameCanvas.getContext('2d');
            console.log('成功重新获取Canvas元素和上下文');
        } else {
            console.error('无法获取Canvas元素，游戏无法初始化');
            return;
        }
    }
    
    // 清空画布并绘制网格
    clearCanvas();
    drawGrid();
    
    // 确保文本在网格上方正确显示
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = Math.max(16, Math.floor(gameCanvas.width / 15)) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 在画布中央绘制文本
    ctx.fillText('点击开始游戏', gameCanvas.width / 2, gameCanvas.height / 2);
    console.log('已在画布中央绘制文本');
    
    // 显示游戏规则（仅在游戏开始前显示）
    const gameInstructions = document.querySelector('.game-instructions');
    if (gameInstructions) {
        gameInstructions.style.display = 'block';
        console.log('游戏规则已显示');
    } else {
        console.error('找不到游戏规则元素');
    }
    
    // 确保规则内容初始显示
    const rulesContent = document.getElementById('rules-content');
    if (rulesContent) {
        // 明确设置为block而不是依赖默认值
        rulesContent.style.display = 'block';
        // 更新按钮文本以匹配当前状态
        const toggleRulesButton = document.getElementById('toggle-rules');
        if (toggleRulesButton) {
            toggleRulesButton.textContent = '隐藏规则';
        }
        console.log('规则内容已设置为显示');
    } else {
        console.error('找不到规则内容元素');
    }
    
    // 确保重新绘制后立即显示
    console.log('游戏初始化完成，画布大小:', gameCanvas.width, 'x', gameCanvas.height);
}

// 清空画布并绘制网格
function clearCanvas() {
    ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.strokeStyle = CANVAS_BORDER_COLOR;
    ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    
    // 获取当前网格大小（基于画布大小和网格数量）
    const currentGridSize = gameCanvas.width / GRID_COUNT;

    // 绘制垂直线
    for (let x = currentGridSize; x < gameCanvas.width; x += currentGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameCanvas.height);
        ctx.stroke();
    }

    // 绘制水平线
    for (let y = currentGridSize; y < gameCanvas.height; y += currentGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameCanvas.width, y);
        ctx.stroke();
    }
}

// 生成随机数字（1-9）
function generateRandomNumber() {
    return Math.floor(Math.random() * 9) + 1;
}

// 生成随机运算符
function generateRandomOperator(level) {
    const operators = GAME_LEVELS[level].operations;
    return operators[Math.floor(Math.random() * operators.length)];
}

// 计算表达式结果
function calculateExpression(num1, operator, num2) {
    switch (operator) {
        case '+':
            return num1 + num2;
        case '-':
            // 确保减法结果为正数
            return num1 >= num2 ? num1 - num2 : num2 - num1;
        case '*':
            return num1 * num2;
        case '/':
            // 确保除法结果为正整数
            return num1 >= num2 && num1 % num2 === 0 ? num1 / num2 : num2;
        default:
            return 0;
    }
}

// 开始游戏
function startGame() {
    if (gameStarted) return;
    
    console.log('开始游戏函数被调用');
    
    gameStarted = true;
    gameOver = false;
    score = 0;
    scoreElement.innerHTML = score;
    
    // 重置倒计时
    timeRemaining = 300; // 5分钟
    timeUsed = 0; // 初始化用时为0
    updateTimerDisplay();
    
    // 启动倒计时
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(updateTimer, 1000);
    
    // 禁用难度选择器
    levelSelector.disabled = true;
    
    // 隐藏数字选择区域
    numberPad.style.display = 'none';
    
    // 隐藏游戏规则
    const gameInstructions = document.querySelector('.game-instructions');
    if (gameInstructions) {
        gameInstructions.style.display = 'none';
    }
    
    console.log('正在初始化游戏网格...');
    // 检查initializeGameModule函数是否存在
    console.log('initializeGameModule函数是否存在:', typeof initializeGameModule);
    
    // 初始化游戏网格
    try {
        if (typeof window.initializeGameModule === 'function') {
            console.log('使用window.initializeGameModule初始化游戏');
            window.initializeGameModule();
        } else if (typeof initializeGameModule === 'function') {
            console.log('使用initializeGameModule初始化游戏');
            initializeGameModule();
        } else {
            console.log('使用本地initializeGame函数初始化游戏');
            initializeGame();
        }
    } catch (error) {
        console.error('初始化游戏时出错:', error);
        // 尝试使用本地函数作为备选
        try {
            console.log('尝试使用本地initializeGame函数');
            initializeGame();
        } catch (backupError) {
            console.error('备选初始化也失败:', backupError);
        }
    }
    
    // 渲染游戏
    console.log('渲染游戏...');
    renderGame();
    
    // 确保调试信息初始化
    if (typeof displayDebugInfo === 'function') {
        console.log('显示调试信息...');
        displayDebugInfo();
    }
    
    console.log('游戏已成功启动!');
}

// 初始化游戏
function initializeGame() {
    console.log('本地initializeGame函数被调用');
    
    // 重置游戏状态
    puzzleGrid = Array(GRID_COUNT).fill().map(() => Array(GRID_COUNT).fill(null));
    expressions = [];
    cellStatus = Array(GRID_COUNT).fill().map(() => Array(GRID_COUNT).fill(null));
    
    // 获取当前难度
    const level = levelSelector.value;
    
    // 根据难度设置表达式数量
    let horizontalCount, verticalCount;
    switch(level) {
        case 'easy':
            horizontalCount = 4;
            verticalCount = 4;
            break;
        case 'medium':
            horizontalCount = 6;
            verticalCount = 6;
            break;
        case 'hard':
            horizontalCount = 8;
            verticalCount = 8;
            break;
        default:
            horizontalCount = 4;
            verticalCount = 4;
    }
    
    // 创建横向表达式（不设置空白格）
    createHorizontalExpressions(horizontalCount);
    
    // 创建纵向表达式（不设置空白格）
    createVerticalExpressions(verticalCount);
    
    // 处理交叉点
    processIntersections();
    
    // 根据表达式数量动态计算空白格数量，确保为表达式数量的2倍
    const totalExpressions = expressions.length;
    // 空白格数量为表达式数量的2倍
    const targetBlanks = totalExpressions * 2;
    
    // 统一选择空白格，并获取实际的空白格数量
    const actualBlanks = selectBlanks(targetBlanks);
    console.log(`目标空白格数量: ${targetBlanks}，实际空白格数量: ${actualBlanks}`);
    
    // 收集并显示调试信息
    if (typeof displayDebugInfo === 'function') {
        displayDebugInfo();
    }
}

// 确保initializeGame函数可以全局访问
window.initializeGame = initializeGame;

// 创建横向表达式
function createHorizontalExpressions(count) {
    // 获取已有的横向表达式的位置，用于避免连续的横向表达式
    const horizontalPositions = expressions
        .filter(expr => expr.type === 'horizontal')
        .map(expr => ({ row: expr.row, col: expr.col }));
    
    // 获取已有的纵向表达式的位置，用于增加交叉点概率
    const verticalPositions = expressions
        .filter(expr => expr.type === 'vertical')
        .map(expr => ({ row: expr.row, col: expr.col }));
    
    for (let i = 0; i < count; i++) {
        // 为横向表达式选择一个随机行和列
        let row, col;
        let positionValid = false;
        let attempts = 0;
        const maxAttempts = 50; // 最大尝试次数
        let hasIntersection = false; // 标记是否找到了与纵向表达式相交的位置
        let bestPosition = null; // 存储最佳位置（有最多交叉点的位置）
        let maxIntersections = 0; // 最大交叉点数量
        
        // 尝试找到一个有效的位置
        while (!positionValid && attempts < maxAttempts) {
            // 修复问题2：增加与纵向表达式交叉的概率
            // 70%的概率尝试创建与纵向表达式交叉的横向表达式
            if (verticalPositions.length > 0 && Math.random() < 0.7) {
                // 随机选择一个纵向表达式
                const verticalExpr = verticalPositions[Math.floor(Math.random() * verticalPositions.length)];
                
                // 选择该纵向表达式的某一行作为横向表达式的行
                // 随机选择纵向表达式的num1、num2或result位置
                const positions = [0, 2, 4]; // 对应num1、num2和result的相对位置
                const offset = positions[Math.floor(Math.random() * positions.length)];
                row = verticalExpr.row + offset;
                
                // 为横向表达式选择一个随机起始列，确保与纵向表达式交叉
                // 计算可能的起始列范围，使得横向表达式的某个数字位置与纵向表达式交叉
                const possibleCols = [
                    verticalExpr.col - 4, // 使result与纵向表达式交叉
                    verticalExpr.col - 2, // 使num2与纵向表达式交叉
                    verticalExpr.col      // 使num1与纵向表达式交叉
                ].filter(c => c >= 1 && c <= GRID_COUNT - 5);
                
                if (possibleCols.length > 0) {
                    col = possibleCols[Math.floor(Math.random() * possibleCols.length)];
                } else {
                    // 如果没有合适的位置，随机选择
                    col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                }
            } else {
                // 随机选择位置
                row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            }
            
            positionValid = true;
            let currentIntersections = 0; // 当前位置的交叉点数量
            
            // 检查这个位置是否与现有表达式重叠或太接近
            for (const expr of expressions) {
                if (expr.type === 'horizontal') {
                    // 检查是否与其他横向表达式在同一行且有重叠
                    if (expr.row === row && 
                        !(col + 4 < expr.col || col > expr.col + 4)) {
                        positionValid = false;
                        break;
                    }
                    
                    // 修复问题2：避免连续的横向表达式
                    // 检查是否与其他横向表达式在相邻行且没有交叉
                    if (Math.abs(expr.row - row) === 1 && 
                        !((col >= expr.col && col <= expr.col + 4) || 
                          (col + 4 >= expr.col && col + 4 <= expr.col + 4))) {
                        // 降低接受概率，除非有其他交叉点
                        if (Math.random() < 0.7 && currentIntersections === 0) {
                            positionValid = false;
                            break;
                        }
                    }
                } else if (expr.type === 'vertical') {
                    // 对于纵向表达式，我们希望有交叉点，但要避免运算符与数字的交叉
                    // 检查横向表达式的每个位置
                    for (let i = 0; i <= 4; i++) {
                        const currentCol = col + i;
                        // 检查是否与纵向表达式的任何部分重叠
                        if (currentCol === expr.col) {
                            // 检查是否与纵向表达式的任何部分重叠
                            if (row >= expr.row && row <= expr.row + 4) {
                                // 允许数字位置与数字位置交叉
                                // 横向表达式的数字位置是col+0, col+2, col+4
                                // 纵向表达式的数字位置是row+0, row+2, row+4
                                const isHorizNumberPos = (i === 0 || i === 2 || i === 4);
                                const isVertNumberPos = (row === expr.row || row === expr.row + 2 || row === expr.row + 4);
                                
                                // 如果两者都是数字位置，允许交叉并增加交叉点计数
                                if (isHorizNumberPos && isVertNumberPos) {
                                    // 允许交叉，并记录找到了交叉点
                                    hasIntersection = true;
                                    currentIntersections++;
                                } else {
                                    // 其他情况不允许交叉
                                    positionValid = false;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (!positionValid) break;
                }
            }

            // 如果当前位置有效且有更多的交叉点，更新最佳位置
            if (positionValid && currentIntersections > maxIntersections) {
                maxIntersections = currentIntersections;
                bestPosition = { row, col };
            }
            
            attempts++;
        }

        // 如果找到了最佳位置（有交叉点的位置），使用它
        if (bestPosition && maxIntersections > 0) {
            row = bestPosition.row;
            col = bestPosition.col;
            positionValid = true;
        }

        // 如果无法找到有效位置，跳过这个表达式
        if (!positionValid) {
            console.log('无法找到有效的横向表达式位置');
            continue;
        }
        
        // 尝试查找可以共享的数字
        let sharedNum1 = null;
        let sharedNum2 = null;
        let sharedResult = null;
        
        // 查找可能的共享数字位置
        for (const expr of expressions) {
            if (expr.type === 'vertical') {
                // 检查是否有垂直表达式的数字可以与当前横向表达式共享
                // 只在数字位置（而不是运算符位置）进行共享
                if (expr.col === col && expr.row <= row && expr.row + 4 >= row) {
                    // 只在数字位置共享
                    if (expr.row === row) sharedNum1 = expr.num1;
                    else if (expr.row + 2 === row) sharedNum1 = expr.num2;
                    else if (expr.row + 4 === row) sharedNum1 = expr.result;
                }
                else if (expr.col === col + 2 && expr.row <= row && expr.row + 4 >= row) {
                    // 只在数字位置共享
                    if (expr.row === row) sharedNum2 = expr.num1;
                    else if (expr.row + 2 === row) sharedNum2 = expr.num2;
                    else if (expr.row + 4 === row) sharedNum2 = expr.result;
                }
                else if (expr.col === col + 4 && expr.row <= row && expr.row + 4 >= row) {
                    // 只在数字位置共享
                    if (expr.row === row) sharedResult = expr.num1;
                    else if (expr.row + 2 === row) sharedResult = expr.num2;
                    else if (expr.row + 4 === row) sharedResult = expr.result;
                }
            }
        }
        
        // 生成随机数字和运算符，优先使用共享数字
        const num1 = sharedNum1 !== null ? sharedNum1 : generateRandomNumber();
        const num2 = sharedNum2 !== null ? sharedNum2 : generateRandomNumber();
        const operator = generateRandomOperator(levelSelector.value);
        
        // 计算结果
        const result = calculateExpression(num1, operator, num2);
        
        // 如果有共享结果，但计算出的结果与共享结果不匹配，则重新尝试
        if (sharedResult !== null && sharedResult !== result) {
            i--;
            continue;
        }
        
        // 确保结果是整数（对于除法）
        if (operator === '/' && (num1 < num2 || num1 % num2 !== 0)) {
            // 如果结果不是整数或者会导致负数，重新尝试
            i--;
            continue;
        }
        
        // 确保减法不会产生负数
        if (operator === '-' && num1 < num2) {
            // 如果减法会导致负数，重新尝试
            i--;
            continue;
        }
        
        // 添加表达式（不设置空白格）
        expressions.push({
            type: 'horizontal',
            row,
            col,
            num1,
            operator,
            num2,
            result,
            blank: null, // 初始不设置空白格
            sharedPositions: {
                num1: sharedNum1 !== null,
                num2: sharedNum2 !== null,
                result: sharedResult !== null
            }
        });
    }
}

// 创建纵向表达式
function createVerticalExpressions(count) {
    // 获取已有的纵向表达式的位置，用于避免连续的纵向表达式
    const verticalPositions = expressions
        .filter(expr => expr.type === 'vertical')
        .map(expr => ({ row: expr.row, col: expr.col }));
    
    // 获取已有的横向表达式的位置，用于增加交叉点概率
    const horizontalPositions = expressions
        .filter(expr => expr.type === 'horizontal')
        .map(expr => ({ row: expr.row, col: expr.col }));
    
    for (let i = 0; i < count; i++) {
        // 为纵向表达式选择一个随机行和列
        let row, col;
        let positionValid = false;
        let attempts = 0;
        const maxAttempts = 50; // 最大尝试次数
        let hasIntersection = false; // 标记是否找到了与横向表达式相交的位置
        let bestPosition = null; // 存储最佳位置（有最多交叉点的位置）
        let maxIntersections = 0; // 最大交叉点数量

        // 尝试找到一个有效的位置
        while (!positionValid && attempts < maxAttempts) {
            // 修复问题2：增加与横向表达式交叉的概率
            // 70%的概率尝试创建与横向表达式交叉的纵向表达式
            if (horizontalPositions.length > 0 && Math.random() < 0.7) {
                // 随机选择一个横向表达式
                const horizontalExpr = horizontalPositions[Math.floor(Math.random() * horizontalPositions.length)];
                
                // 选择该横向表达式的某一列作为纵向表达式的列
                // 随机选择横向表达式的num1、num2或result位置
                const positions = [0, 2, 4]; // 对应num1、num2和result的相对位置
                const offset = positions[Math.floor(Math.random() * positions.length)];
                col = horizontalExpr.col + offset;
                
                // 为纵向表达式选择一个随机起始行，确保与横向表达式交叉
                // 计算可能的起始行范围，使得纵向表达式的某个数字位置与横向表达式交叉
                const possibleRows = [
                    horizontalExpr.row - 4, // 使result与横向表达式交叉
                    horizontalExpr.row - 2, // 使num2与横向表达式交叉
                    horizontalExpr.row      // 使num1与横向表达式交叉
                ].filter(r => r >= 1 && r <= GRID_COUNT - 5);
                
                if (possibleRows.length > 0) {
                    row = possibleRows[Math.floor(Math.random() * possibleRows.length)];
                } else {
                    // 如果没有合适的位置，随机选择
                    row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                }
            } else {
                // 随机选择位置
                row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            }
            
            positionValid = true;
            let currentIntersections = 0; // 当前位置的交叉点数量

            // 检查这个位置是否与现有表达式重叠或太接近
            for (const expr of expressions) {
                if (expr.type === 'vertical') {
                    // 检查是否与其他纵向表达式在同一列且有重叠
                    if (expr.col === col && 
                        !(row + 4 < expr.row || row > expr.row + 4)) {
                        positionValid = false;
                        break;
                    }
                    
                    // 修复问题2：避免连续的纵向表达式
                    // 检查是否与其他纵向表达式在相邻列且没有交叉
                    if (Math.abs(expr.col - col) === 1 && 
                        !((row >= expr.row && row <= expr.row + 4) || 
                          (row + 4 >= expr.row && row + 4 <= expr.row + 4))) {
                        // 降低接受概率，除非有其他交叉点
                        if (Math.random() < 0.7 && currentIntersections === 0) {
                            positionValid = false;
                            break;
                        }
                    }
                } else if (expr.type === 'horizontal') {
                    // 对于横向表达式，我们希望有交叉点，但要避免运算符与数字的交叉
                    
                    // 检查纵向表达式的每个位置
                    for (let i = 0; i <= 4; i++) {
                        const currentRow = row + i;
                        // 检查是否与横向表达式的任何部分重叠
                        if (currentRow === expr.row) {
                            // 检查是否与横向表达式的任何部分重叠
                            if (col >= expr.col && col <= expr.col + 4) {
                                // 允许数字位置与数字位置交叉
                                // 纵向表达式的数字位置是row+0, row+2, row+4
                                // 横向表达式的数字位置是col+0, col+2, col+4
                                const isVertNumberPos = (i === 0 || i === 2 || i === 4);
                                const isHorizNumberPos = (col === expr.col || col === expr.col + 2 || col === expr.col + 4);
                                
                                // 如果两者都是数字位置，允许交叉并增加交叉点计数
                                if (isVertNumberPos && isHorizNumberPos) {
                                    // 允许交叉，并记录找到了交叉点
                                    hasIntersection = true;
                                    currentIntersections++;
                                } else {
                                    // 其他情况不允许交叉
                                    positionValid = false;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (!positionValid) break;
                }
            }

            // 如果当前位置有效且有更多的交叉点，更新最佳位置
            if (positionValid && currentIntersections > maxIntersections) {
                maxIntersections = currentIntersections;
                bestPosition = { row, col };
            }
            
            attempts++;
        }

        // 如果找到了最佳位置（有交叉点的位置），使用它
        if (bestPosition && maxIntersections > 0) {
            row = bestPosition.row;
            col = bestPosition.col;
            positionValid = true;
        }

        // 如果无法找到有效位置，跳过这个表达式
        if (!positionValid) {
            console.log('无法找到有效的纵向表达式位置');
            continue;
        }
        
        // 尝试查找可以共享的数字
        let sharedNum1 = null;
        let sharedNum2 = null;
        let sharedResult = null;
        
        // 查找可能的共享数字位置
        for (const expr of expressions) {
            if (expr.type === 'horizontal') {
                // 检查是否有横向表达式的数字可以与当前纵向表达式共享
                // 只在数字位置（而不是运算符位置）进行共享
                if (expr.row === row && expr.col <= col && expr.col + 4 >= col) {
                    // 只在数字位置共享
                    if (expr.col === col) sharedNum1 = expr.num1;
                    else if (expr.col + 2 === col) sharedNum1 = expr.num2;
                    else if (expr.col + 4 === col) sharedNum1 = expr.result;
                }
                else if (expr.row === row + 2 && expr.col <= col && expr.col + 4 >= col) {
                    // 只在数字位置共享
                    if (expr.col === col) sharedNum2 = expr.num1;
                    else if (expr.col + 2 === col) sharedNum2 = expr.num2;
                    else if (expr.col + 4 === col) sharedNum2 = expr.result;
                }
                else if (expr.row === row + 4 && expr.col <= col && expr.col + 4 >= col) {
                    // 只在数字位置共享
                    if (expr.col === col) sharedResult = expr.num1;
                    else if (expr.col + 2 === col) sharedResult = expr.num2;
                    else if (expr.col + 4 === col) sharedResult = expr.result;
                }
            }
        }
        
        // 生成随机数字和运算符，优先使用共享数字
        const num1 = sharedNum1 !== null ? sharedNum1 : generateRandomNumber();
        const num2 = sharedNum2 !== null ? sharedNum2 : generateRandomNumber();
        const operator = generateRandomOperator(levelSelector.value);
        
        // 计算结果
        const result = calculateExpression(num1, operator, num2);
        
        // 如果有共享结果，但计算出的结果与共享结果不匹配，则重新尝试
        if (sharedResult !== null && sharedResult !== result) {
            i--;
            continue;
        }
        
        // 确保结果是整数（对于除法）
        if (operator === '/' && (num1 < num2 || num1 % num2 !== 0)) {
            // 如果结果不是整数或者会导致负数，重新尝试
            i--;
            continue;
        }
        
        // 确保减法不会产生负数
        if (operator === '-' && num1 < num2) {
            // 如果减法会导致负数，重新尝试
            i--;
            continue;
        }
        
        // 添加表达式（不设置空白格）
        expressions.push({
            type: 'vertical',
            row,
            col,
            num1,
            operator,
            num2,
            result,
            blank: null, // 初始不设置空白格
            sharedPositions: {
                num1: sharedNum1 !== null,
                num2: sharedNum2 !== null,
                result: sharedResult !== null
            }
        });
    }
}

// 统一选择空白格
function selectBlanks(numBlanks) {
    console.log(`开始选择空白格，目标数量: ${numBlanks}，表达式数量: ${expressions.length}`);
    
    // 创建一个映射来跟踪交叉点
    const crossPointMap = new Map(); // 格式: "row,col" -> [{exprIndex, position}, ...]
    
    // 首先收集所有交叉点信息
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        if (expr.crossPoints) {
            for (const cp of expr.crossPoints) {
                const key = `${cp.row},${cp.col}`;
                if (!crossPointMap.has(key)) {
                    crossPointMap.set(key, []);
                }
                crossPointMap.get(key).push({
                    exprIndex: i,
                    position: cp.position
                });
            }
        }
    }
    
    // 创建一个可选空白格的列表
    const availableBlanks = [];
    
    // 遍历所有表达式，找出可以作为空白格的位置
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        const { type, row, col, sharedPositions } = expr;
        
        // 检查每个位置是否可以作为空白格
        // 如果是共享数字，我们降低其被选为空白格的概率，以保留更多共享数字
        if (sharedPositions && sharedPositions.num1) {
            // 共享数字有较低的权重被选为空白格（添加一次，相对减少被选中的概率）
            availableBlanks.push({ exprIndex: i, position: 'num1', isShared: true });
        } else {
            // 非共享数字添加多次，增加其被选中的概率
            availableBlanks.push({ exprIndex: i, position: 'num1', isShared: false });
            availableBlanks.push({ exprIndex: i, position: 'num1', isShared: false }); // 添加两次增加权重
        }
        
        if (sharedPositions && sharedPositions.num2) {
            availableBlanks.push({ exprIndex: i, position: 'num2', isShared: true });
        } else {
            availableBlanks.push({ exprIndex: i, position: 'num2', isShared: false });
            availableBlanks.push({ exprIndex: i, position: 'num2', isShared: false });
        }
        
        if (sharedPositions && sharedPositions.result) {
            availableBlanks.push({ exprIndex: i, position: 'result', isShared: true });
        } else {
            availableBlanks.push({ exprIndex: i, position: 'result', isShared: false });
            availableBlanks.push({ exprIndex: i, position: 'result', isShared: false });
        }
        
        // 运算符总是可以作为空白格，并且增加其权重
        availableBlanks.push({ exprIndex: i, position: 'operator', isShared: false });
        availableBlanks.push({ exprIndex: i, position: 'operator', isShared: false });
    }
    
    // 确保每个表达式至少有一个空白格
    const expressionHasBlank = new Array(expressions.length).fill(false);
    const selectedBlanks = [];
    const availableByExpr = new Map();
    
    // 为每个表达式准备可用的空白格
    for (let i = 0; i < expressions.length; i++) {
        // 获取当前表达式的所有可选空白格
        const exprBlanks = availableBlanks.filter(blank => blank.exprIndex === i);
        if (exprBlanks.length > 0) {
            availableByExpr.set(i, [...exprBlanks]);
        }
    }
    
    // 第一步：确保每个表达式至少有一个空白格
    for (let i = 0; i < expressions.length; i++) {
        if (availableByExpr.has(i)) {
            const exprBlanks = availableByExpr.get(i);
            if (exprBlanks.length > 0) {
                // 优先选择非共享位置作为第一个空白格
                const nonSharedBlanks = exprBlanks.filter(blank => !blank.isShared);
                const blankToSelect = nonSharedBlanks.length > 0 ? 
                    nonSharedBlanks[Math.floor(Math.random() * nonSharedBlanks.length)] : 
                    exprBlanks[Math.floor(Math.random() * exprBlanks.length)];
                
                // 添加到已选列表
                selectedBlanks.push(blankToSelect);
                expressionHasBlank[i] = true;
                
                // 从所有可用空白格中移除已选的空白格
                for (const [exprIdx, blanks] of availableByExpr.entries()) {
                    const blankIndex = blanks.findIndex(blank => 
                        blank.exprIndex === blankToSelect.exprIndex && 
                        blank.position === blankToSelect.position);
                    
                    if (blankIndex !== -1) {
                        blanks.splice(blankIndex, 1);
                    }
                }
            }
        }
    }
    
    // 计算已选择的空白格对应的实际单元格数量（考虑交叉点）
    const getActualBlankCellCount = (blanks) => {
        const cellSet = new Set();
        for (const { exprIndex, position } of blanks) {
            const expr = expressions[exprIndex];
            let row, col;
            if (expr.type === 'horizontal') {
                row = expr.row;
                col = expr.col + (position === 'num1' ? 0 : 
                                 position === 'operator' ? 1 : 
                                 position === 'num2' ? 2 : 
                                 position === 'equals' ? 3 : 4);
            } else { // vertical
                row = expr.row + (position === 'num1' ? 0 : 
                                 position === 'operator' ? 1 : 
                                 position === 'num2' ? 2 : 
                                 position === 'equals' ? 3 : 4);
                col = expr.col;
            }
            
            // 检查该位置是否是交叉点，以及是否是运算符或等号
            const cellKey = `${row},${col}`;
            const isOperatorOrEquals = position === 'operator' || position === 'equals';
            
            // 如果是运算符或等号，检查是否与其他表达式交叉
            if (isOperatorOrEquals && crossPointMap.has(cellKey)) {
                // 如果是运算符或等号且是交叉点，跳过添加这个位置
                console.warn(`跳过添加运算符或等号作为空白格，位置: ${cellKey}`);
                continue;
            }
            
            cellSet.add(cellKey);
        }
        return cellSet.size;
    };
    
    // 第二步：如果可能，为每个表达式添加第二个空白格
    // 但要确保不超过目标空白格数量
    const targetBlankCells = numBlanks;
    let currentBlankCells = getActualBlankCellCount(selectedBlanks);
    
    if (levelSelector.value === 'medium' || levelSelector.value === 'hard') {
        // 随机打乱表达式顺序，以便随机选择添加第二个空白格
        const exprIndices = Array.from(availableByExpr.keys());
        shuffleArray(exprIndices);
        
        for (const i of exprIndices) {
            if (currentBlankCells >= targetBlankCells) break;
            
            if (availableByExpr.has(i) && expressionHasBlank[i]) {
                const exprBlanks = availableByExpr.get(i);
                if (exprBlanks.length > 0) {
                    // 随机选择一个位置作为第二个空白格
                    const randomIndex = Math.floor(Math.random() * exprBlanks.length);
                    const selectedBlank = exprBlanks[randomIndex];
                    
                    // 临时添加这个空白格，检查是否会超过目标数量
                    const tempBlanks = [...selectedBlanks, selectedBlank];
                    const tempCount = getActualBlankCellCount(tempBlanks);
                    
                    if (tempCount <= targetBlankCells) {
                        // 添加到已选列表
                        selectedBlanks.push(selectedBlank);
                        currentBlankCells = tempCount;
                        
                        // 从所有可用空白格中移除已选的空白格
                        for (const [exprIdx, blanks] of availableByExpr.entries()) {
                            const blankIndex = blanks.findIndex(blank => 
                                blank.exprIndex === selectedBlank.exprIndex && 
                                blank.position === selectedBlank.position);
                            
                            if (blankIndex !== -1) {
                                blanks.splice(blankIndex, 1);
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 第三步：分配剩余的空白格，直到达到目标数量
    // 将所有剩余的可用空白格合并到一个列表中
    const remainingAvailable = [];
    for (const blanks of availableByExpr.values()) {
        remainingAvailable.push(...blanks);
    }
    
    // 打乱剩余可用空白格的顺序
    shuffleArray(remainingAvailable);
    
    // 逐个添加空白格，直到达到目标数量
    for (let i = 0; i < remainingAvailable.length; i++) {
        if (currentBlankCells >= targetBlankCells) break;
        
        const selectedBlank = remainingAvailable[i];
        
        // 临时添加这个空白格，检查是否会超过目标数量
        const tempBlanks = [...selectedBlanks, selectedBlank];
        const tempCount = getActualBlankCellCount(tempBlanks);
        
        if (tempCount <= targetBlankCells) {
            // 添加到已选列表
            selectedBlanks.push(selectedBlank);
            currentBlankCells = tempCount;
        }
    }
    
    // 将选中的位置设置为空白格
    const blankCells = new Set(); // 用于跟踪已经设置为空白的单元格
    const assignedExpressions = new Set(); // 用于跟踪已分配空白格的表达式
    
    for (const { exprIndex, position } of selectedBlanks) {
        const expr = expressions[exprIndex];
        
        // 获取此空白格的坐标
        let row, col;
        if (expr.type === 'horizontal') {
            row = expr.row;
            col = expr.col + (position === 'num1' ? 0 : 
                             position === 'operator' ? 1 : 
                             position === 'num2' ? 2 : 
                             position === 'equals' ? 3 : 4);
        } else { // vertical
            row = expr.row + (position === 'num1' ? 0 : 
                             position === 'operator' ? 1 : 
                             position === 'num2' ? 2 : 
                             position === 'equals' ? 3 : 4);
            col = expr.col;
        }
        
        // 检查该位置是否是交叉点，以及是否是运算符或等号
        const cellKey = `${row},${col}`;
        const isOperatorOrEquals = position === 'operator' || position === 'equals';
        
        // 如果是运算符或等号，检查是否与其他表达式交叉
        if (isOperatorOrEquals && crossPointMap.has(cellKey)) {
            // 如果是运算符或等号且是交叉点，跳过设置这个位置为空白格
            console.warn(`跳过设置运算符或等号作为空白格，位置: ${cellKey}`);
            continue;
        }
        
        // 设置为空白格
        expr.blank = position;
        assignedExpressions.add(exprIndex);
        
        // 记录这个单元格
        blankCells.add(cellKey);
        
        // 如果是交叉点，检查另一个表达式是否也需要设置为空白格
        if (crossPointMap.has(cellKey)) {
            const crossingExprs = crossPointMap.get(cellKey);
            for (const { exprIndex: crossExprIndex, position: crossPosition } of crossingExprs) {
                if (crossExprIndex !== exprIndex) {
                    // 确保交叉位置不是运算符或等号
                    const isOperatorOrEquals = crossPosition === 'operator' || crossPosition === 'equals';
                    if (!isOperatorOrEquals) {
                        // 将交叉的表达式对应位置也设置为空白格
                        expressions[crossExprIndex].blank = crossPosition;
                        assignedExpressions.add(crossExprIndex);
                    }
                }
            }
        }
    }
    
    // 计算实际的空白格数量（考虑交叉点）
    const actualBlankCount = blankCells.size;
    
    // 检查是否每个表达式都至少有一个空白格
    let allHaveBlank = true;
    for (let i = 0; i < expressions.length; i++) {
        if (!assignedExpressions.has(i)) {
            allHaveBlank = false;
            console.warn(`表达式 ${i} 没有空白格！尝试为其分配一个空白格`);
            
            // 为没有空白格的表达式强制分配一个空白格
            const positions = ['num1', 'num2', 'result', 'operator'];
            const randomPosition = positions[Math.floor(Math.random() * positions.length)];
            expressions[i].blank = randomPosition;
            assignedExpressions.add(i);
            
            // 更新空白格单元格集合
            let row, col;
            const expr = expressions[i];
            if (expr.type === 'horizontal') {
                row = expr.row;
                col = expr.col + (randomPosition === 'num1' ? 0 : 
                                 randomPosition === 'operator' ? 1 : 
                                 randomPosition === 'num2' ? 2 : 
                                 randomPosition === 'equals' ? 3 : 4);
            } else { // vertical
                row = expr.row + (randomPosition === 'num1' ? 0 : 
                                 randomPosition === 'operator' ? 1 : 
                                 randomPosition === 'num2' ? 2 : 
                                 randomPosition === 'equals' ? 3 : 4);
                col = expr.col;
            }
            blankCells.add(`${row},${col}`);
        }
    }
    
    // 最终验证步骤：确保所有交叉点都被正确标记为空白格
    for (const [key, crossingExprs] of crossPointMap.entries()) {
        // 检查是否有任何一个表达式在这个交叉点位置被标记为空白格
        const hasBlank = crossingExprs.some(({ exprIndex, position }) => {
            return expressions[exprIndex].blank === position;
        });
        
        if (hasBlank) {
            // 如果有任何一个表达式在这个交叉点位置被标记为空白格，
            // 确保所有相关表达式在这个位置都被标记为空白格
            const [row, col] = key.split(',').map(Number);
            console.log(`交叉点验证: (${row}, ${col}) 应该是空白格`);
            
            // 将所有相关表达式在这个位置都标记为空白格
            for (const { exprIndex, position } of crossingExprs) {
                // 确保不是运算符或等号
                const isOperatorOrEquals = position === 'operator' || position === 'equals';
                if (!isOperatorOrEquals) {
                    expressions[exprIndex].blank = position;
                    assignedExpressions.add(exprIndex);
                    blankCells.add(key);
                    
                    // 同步交叉点信息到相关表达式
                    const expr = expressions[exprIndex];
                    if (expr.crossPoints) {
                        for (const cp of expr.crossPoints) {
                            if (cp.row === row && cp.col === col) {
                                // 确保交叉的表达式也将此位置标记为空白格
                                const crossExpr = expressions[cp.withExpr];
                                if (crossExpr && !isOperatorOrEquals) {
                                    crossExpr.blank = cp.atPosition;
                                    assignedExpressions.add(cp.withExpr);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 全面验证：检查所有表达式中标记为空白格的单元格
    console.log('开始全面验证所有空白格...');
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        if (!expr.blank) continue; // 跳过没有空白格的表达式
        
        // 获取空白格的坐标
        let row, col;
        if (expr.type === 'horizontal') {
            row = expr.row;
            col = expr.col + (expr.blank === 'num1' ? 0 : 
                             expr.blank === 'operator' ? 1 : 
                             expr.blank === 'num2' ? 2 : 
                             expr.blank === 'equals' ? 3 : 4);
        } else { // vertical
            row = expr.row + (expr.blank === 'num1' ? 0 : 
                             expr.blank === 'operator' ? 1 : 
                             expr.blank === 'num2' ? 2 : 
                             expr.blank === 'equals' ? 3 : 4);
            col = expr.col;
        }
        
        const cellKey = `${row},${col}`;
        console.log(`验证空白格: (${row}, ${col})，表达式索引: ${i}, 位置: ${expr.blank}`);
        
        // 确保这个单元格被添加到空白格集合中
        blankCells.add(cellKey);
        
        // 如果是交叉点，确保所有相关表达式都被正确标记
        if (crossPointMap.has(cellKey)) {
            const crossingExprs = crossPointMap.get(cellKey);
            for (const { exprIndex, position } of crossingExprs) {
                // 确保不是运算符或等号
                const isOperatorOrEquals = position === 'operator' || position === 'equals';
                if (!isOperatorOrEquals) {
                    expressions[exprIndex].blank = position;
                    assignedExpressions.add(exprIndex);
                }
            }
        }
    }
    
    // 检查所有网格单元格，确保所有应该是空白格的单元格都被正确标记
    for (let row = 0; row < GRID_COUNT; row++) {
        for (let col = 0; col < GRID_COUNT; col++) {
            const cellKey = `${row},${col}`;
            
            // 检查这个单元格是否是任何表达式的一部分
            let isPartOfExpression = false;
            let exprIndex = -1;
            let position = null;
            
            for (let i = 0; i < expressions.length; i++) {
                const expr = expressions[i];
                
                if (expr.type === 'horizontal' && row === expr.row) {
                    if (col === expr.col) { position = 'num1'; exprIndex = i; isPartOfExpression = true; }
                    else if (col === expr.col + 1) { position = 'operator'; exprIndex = i; isPartOfExpression = true; }
                    else if (col === expr.col + 2) { position = 'num2'; exprIndex = i; isPartOfExpression = true; }
                    else if (col === expr.col + 3) { position = 'equals'; exprIndex = i; isPartOfExpression = true; }
                    else if (col === expr.col + 4) { position = 'result'; exprIndex = i; isPartOfExpression = true; }
                } else if (expr.type === 'vertical' && col === expr.col) {
                    if (row === expr.row) { position = 'num1'; exprIndex = i; isPartOfExpression = true; }
                    else if (row === expr.row + 1) { position = 'operator'; exprIndex = i; isPartOfExpression = true; }
                    else if (row === expr.row + 2) { position = 'num2'; exprIndex = i; isPartOfExpression = true; }
                    else if (row === expr.row + 3) { position = 'equals'; exprIndex = i; isPartOfExpression = true; }
                    else if (row === expr.row + 4) { position = 'result'; exprIndex = i; isPartOfExpression = true; }
                }
                
                // 如果找到了表达式，并且这个位置被标记为空白格，确保它在空白格集合中
                if (isPartOfExpression && expr.blank === position) {
                    blankCells.add(cellKey);
                    break;
                }
            }
        }
    }
    
    // 重新计算实际的空白格数量
    const finalBlankCount = blankCells.size;
    
    console.log(`总共选择了 ${selectedBlanks.length} 个空白格位置，实际空白格数量: ${finalBlankCount}，目标是 ${numBlanks} 个`);
    console.log(`所有表达式都有空白格: ${assignedExpressions.size === expressions.length}`);
    
    return finalBlankCount;
}

// 辅助函数：打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 处理交叉点
function processIntersections() {
    // 为每个表达式初始化交叉点信息和共享位置信息
    for (let expr of expressions) {
        if (!expr.intersections) {
            expr.intersections = {};
        }
        if (!expr.sharedPositions) {
            expr.sharedPositions = {
                num1: false,
                num2: false,
                result: false
            };
        }
        // 确保crossPoints属性初始化
        if (!expr.crossPoints) {
            expr.crossPoints = [];
        }
    }
    
    // 创建一个映射来跟踪每个单元格的使用情况
    const cellUsage = new Map();
    
    // 首先标记所有表达式占用的单元格
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        
        if (expr.type === 'horizontal') {
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row},${expr.col + offset}`;
                if (!cellUsage.has(key)) {
                    cellUsage.set(key, []);
                }
                cellUsage.get(key).push({
                    exprIndex: i,
                    position: offset === 0 ? 'num1' : 
                              offset === 1 ? 'operator' : 
                              offset === 2 ? 'num2' : 
                              offset === 3 ? 'equals' : 'result'
                });
            }
        } else { // vertical
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row + offset},${expr.col}`;
                if (!cellUsage.has(key)) {
                    cellUsage.set(key, []);
                }
                cellUsage.get(key).push({
                    exprIndex: i,
                    position: offset === 0 ? 'num1' : 
                              offset === 1 ? 'operator' : 
                              offset === 2 ? 'num2' : 
                              offset === 3 ? 'equals' : 'result'
                });
            }
        }
    }
    
    // 检查是否有表达式重叠（同类型表达式在同一位置）
    // 在处理交叉点之前先检查重叠，如果有重叠则移除重叠的表达式
    const horizontalExprPositions = new Map();
    const verticalExprPositions = new Map();
    const expressionsToRemove = new Set();
    
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        
        if (expressionsToRemove.has(i)) continue; // 跳过已标记为移除的表达式
        
        if (expr.type === 'horizontal') {
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row},${expr.col + offset}`;
                if (horizontalExprPositions.has(key)) {
                    // 找到重叠的表达式索引
                    const overlapExprIndex = horizontalExprPositions.get(key);
                    // 标记较新的表达式为移除
                    expressionsToRemove.add(i);
                    console.warn(`检测到横向表达式重叠在位置: ${key}，移除表达式索引 ${i}`);
                    break; // 一旦发现重叠，不需要继续检查此表达式
                }
                horizontalExprPositions.set(key, i);
            }
        } else { // vertical
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row + offset},${expr.col}`;
                if (verticalExprPositions.has(key)) {
                    // 找到重叠的表达式索引
                    const overlapExprIndex = verticalExprPositions.get(key);
                    // 标记较新的表达式为移除
                    expressionsToRemove.add(i);
                    console.warn(`检测到纵向表达式重叠在位置: ${key}，移除表达式索引 ${i}`);
                    break; // 一旦发现重叠，不需要继续检查此表达式
                }
                verticalExprPositions.set(key, i);
            }
        }
    }
    
    // 移除重叠的表达式
    if (expressionsToRemove.size > 0) {
        console.warn(`移除 ${expressionsToRemove.size} 个重叠的表达式`);
        // 从大到小排序，以便正确移除
        const indicesToRemove = Array.from(expressionsToRemove).sort((a, b) => b - a);
        for (const index of indicesToRemove) {
            expressions.splice(index, 1);
        }
        
        // 重新构建cellUsage映射
        cellUsage.clear();
        for (let i = 0; i < expressions.length; i++) {
            const expr = expressions[i];
            
            if (expr.type === 'horizontal') {
                for (let offset = 0; offset < 5; offset++) {
                    const key = `${expr.row},${expr.col + offset}`;
                    if (!cellUsage.has(key)) {
                        cellUsage.set(key, []);
                    }
                    cellUsage.get(key).push({
                        exprIndex: i,
                        position: offset === 0 ? 'num1' : 
                                  offset === 1 ? 'operator' : 
                                  offset === 2 ? 'num2' : 
                                  offset === 3 ? 'equals' : 'result'
                    });
                }
            } else { // vertical
                for (let offset = 0; offset < 5; offset++) {
                    const key = `${expr.row + offset},${expr.col}`;
                    if (!cellUsage.has(key)) {
                        cellUsage.set(key, []);
                    }
                    cellUsage.get(key).push({
                        exprIndex: i,
                        position: offset === 0 ? 'num1' : 
                                  offset === 1 ? 'operator' : 
                                  offset === 2 ? 'num2' : 
                                  offset === 3 ? 'equals' : 'result'
                    });
                }
            }
        }
    }
    
    // 检查并处理交叉点
    for (const [cellKey, usages] of cellUsage.entries()) {
        // 只处理有多个表达式使用的单元格（交叉点）
        if (usages.length > 1) {
            // 确保只处理横向和纵向表达式的交叉
            const horizontalUsages = usages.filter(u => expressions[u.exprIndex].type === 'horizontal');
            const verticalUsages = usages.filter(u => expressions[u.exprIndex].type === 'vertical');
            
            if (horizontalUsages.length > 0 && verticalUsages.length > 0) {
                // 获取交叉的表达式
                const horizontalUsage = horizontalUsages[0];
                const verticalUsage = verticalUsages[0];
                const horizontal = expressions[horizontalUsage.exprIndex];
                const vertical = expressions[verticalUsage.exprIndex];
                const horizontalPos = horizontalUsage.position;
                const verticalPos = verticalUsage.position;
                
                // 只处理数字位置的交叉（不处理运算符和等号）
                // 确保交叉点不是运算符或等号位置
                if ((horizontalPos === 'num1' || horizontalPos === 'num2' || horizontalPos === 'result') &&
                    (verticalPos === 'num1' || verticalPos === 'num2' || verticalPos === 'result')) {
                    
                    // 记录交叉点信息
                    horizontal.intersections[horizontalPos] = { with: verticalUsage.exprIndex, at: verticalPos };
                    vertical.intersections[verticalPos] = { with: horizontalUsage.exprIndex, at: horizontalPos };
                    
                    // 标记为共享位置
                    horizontal.sharedPositions[horizontalPos] = true;
                    vertical.sharedPositions[verticalPos] = true;
                    
                    // 确保两个表达式在交叉点处的值相同
                    let sharedValue;
                    if (horizontal[horizontalPos] !== undefined && horizontal[horizontalPos] !== null) {
                        sharedValue = horizontal[horizontalPos];
                        vertical[verticalPos] = sharedValue;
                    } else if (vertical[verticalPos] !== undefined && vertical[verticalPos] !== null) {
                        sharedValue = vertical[verticalPos];
                        horizontal[horizontalPos] = sharedValue;
                    } else {
                        // 如果都没有值，生成一个新的随机值
                        sharedValue = generateRandomNumber();
                        horizontal[horizontalPos] = sharedValue;
                        vertical[verticalPos] = sharedValue;
                    }
                    
                    // 解决空白格问题：在交叉点处，确保空白格状态同步
                    // 如果任一表达式将此位置标记为空白格，则另一个表达式也应将其视为空白格
                    if (horizontal.blank === horizontalPos) {
                        // 如果横向表达式将此位置标记为空白格，纵向表达式也应该将其标记为空白格
                        vertical.blank = verticalPos;
                    } else if (vertical.blank === verticalPos) {
                        // 如果纵向表达式将此位置标记为空白格，横向表达式也应该将其标记为空白格
                        horizontal.blank = horizontalPos;
                    }
                    
                    const [row, col] = cellKey.split(',').map(Number);
                    
                    // 添加交叉点信息到两个表达式中
                    horizontal.crossPoints.push({
                        row, col, position: horizontalPos,
                        withExpr: verticalUsage.exprIndex, atPosition: verticalPos
                    });
                    
                    vertical.crossPoints.push({
                        row, col, position: verticalPos,
                        withExpr: horizontalUsage.exprIndex, atPosition: horizontalPos
                    });
                }
            }
        }
    }
    
    console.log('表达式处理完成，总共有 ' + expressions.length + ' 个表达式');
}

// 重新开始游戏
function restartGame() {
    gameStarted = false;
    gameOver = false;
    score = 0;
    scoreElement.innerHTML = score;
    selectedCell = null;
    currentNumberInput = ''; // 重置多位数输入
    
    // 停止倒计时
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 重置倒计时显示
    timeRemaining = 300;
    timeUsed = 0; // 重置用时
    updateTimerDisplay();
    
    // 隐藏数字选择区域
    numberPad.style.display = 'none';
    
    // 显示游戏规则
    document.querySelector('.game-instructions').style.display = 'block';
    
    // 重置游戏状态变量
    puzzleGrid = [];
    expressions = [];
    cellStatus = [];
    
    // 重新初始化游戏
    init();
    levelSelector.disabled = false;
}

// 处理数字按钮点击
// 定位数字输入面板到选中格子附近
// 创建一个显示当前输入的元素
let currentInputDisplay = document.createElement('div');
currentInputDisplay.className = 'current-input-display';

// 添加标题提示当前输入
let inputLabel = document.createElement('div');
inputLabel.textContent = '当前输入:';
inputLabel.style.fontSize = '14px';
inputLabel.style.color = '#555';
inputLabel.style.marginBottom = '3px';
inputLabel.style.fontWeight = 'normal';
currentInputDisplay.appendChild(inputLabel);

// 创建内容容器
let inputContent = document.createElement('div');
inputContent.className = 'input-content';
inputContent.style.minHeight = '30px';
inputContent.style.display = 'flex';
inputContent.style.alignItems = 'center';
inputContent.style.justifyContent = 'center';
inputContent.style.fontSize = '22px';
inputContent.style.fontWeight = 'bold';
inputContent.style.color = '#333';
currentInputDisplay.appendChild(inputContent);

// 设置整体样式
currentInputDisplay.style.textAlign = 'center';
currentInputDisplay.style.padding = '8px 12px';
currentInputDisplay.style.margin = '8px 0 12px 0';
currentInputDisplay.style.backgroundColor = '#e8f4ff';
currentInputDisplay.style.border = '2px solid #2196F3';
currentInputDisplay.style.borderRadius = '6px';
currentInputDisplay.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

// 将显示元素添加到数字输入面板中
if (!numberPad.querySelector('.current-input-display')) {
    numberPad.insertBefore(currentInputDisplay, numberPad.querySelector('.number-buttons'));
}

function positionNumberPad(row, col) {
    // 动态定位数字输入面板，根据点击位置显示
    const canvas = gameCanvas;
    const canvasRect = canvas.getBoundingClientRect();
    const gameContainer = document.querySelector('.game-container');
    const gameContainerRect = gameContainer.getBoundingClientRect();
    
    // 计算选中格子的中心位置
    const cellCenterX = (col + 0.5) * GRID_SIZE + canvasRect.left;
    const cellCenterY = (row + 0.5) * GRID_SIZE + canvasRect.top;
    
    // 获取数字面板的尺寸
    const numberPadWidth = numberPad.offsetWidth || 300; // 默认宽度
    const numberPadHeight = numberPad.offsetHeight || 200; // 默认高度
    
    // 计算数字面板的位置，优先显示在格子的下方
    let left = cellCenterX - numberPadWidth / 2;
    let top = cellCenterY + GRID_SIZE / 2;
    
    // 检查是否超出窗口右边界
    if (left + numberPadWidth > window.innerWidth) {
        left = window.innerWidth - numberPadWidth - 10;
    }
    
    // 检查是否超出窗口左边界
    if (left < 10) {
        left = 10;
    }
    
    // 如果下方空间不足，则显示在格子上方
    if (top + numberPadHeight > window.innerHeight - 10) {
        top = cellCenterY - numberPadHeight - GRID_SIZE / 2;
    }
    
    // 如果上方也没有足够空间，则尽量居中显示
    if (top < 10) {
        top = Math.max(10, (window.innerHeight - numberPadHeight) / 2);
    }
    
    // 确保数字面板不会被游戏容器的其他元素遮挡
    // 检查是否会遮挡控制按钮区域
    const controlsElement = document.querySelector('.controls');
    if (controlsElement) {
        const controlsRect = controlsElement.getBoundingClientRect();
        // 如果数字面板会遮挡控制按钮，则调整位置
        if (top + numberPadHeight > controlsRect.top && top < controlsRect.bottom) {
            // 尝试将数字面板放在格子上方
            top = cellCenterY - numberPadHeight - GRID_SIZE / 2;
            // 如果上方空间不足，则尝试放在一侧
            if (top < 10) {
                // 尝试放在右侧
                if (cellCenterX + numberPadWidth + 10 < window.innerWidth) {
                    left = cellCenterX + GRID_SIZE / 2;
                    top = cellCenterY - numberPadHeight / 2;
                }
                // 否则放在左侧
                else if (cellCenterX - numberPadWidth - 10 > 0) {
                    left = cellCenterX - numberPadWidth - GRID_SIZE / 2;
                    top = cellCenterY - numberPadHeight / 2;
                }
                // 如果侧面也没有足够空间，则尽量避开控制按钮
                else {
                    top = Math.min(controlsRect.top - numberPadHeight - 10, (window.innerHeight - numberPadHeight) / 2);
                }
            }
        }
    }
    
    // 设置数字面板的位置
    numberPad.style.position = 'fixed';
    numberPad.style.left = left + 'px';
    numberPad.style.top = top + 'px';
    numberPad.style.zIndex = '1000';
    numberPad.style.transform = 'none'; // 移除可能的transform
    
    // 重置当前输入显示
    inputContent.textContent = '';
    tempInput = '';
}

// 用于存储多位数字输入的临时变量
let tempInput = '';

function handleNumberButtonClick(event) {
    if (!gameStarted || !selectedCell || gameOver) return;
    
    const input = event.target.getAttribute('data-number');
    const { row, col } = selectedCell;
    
    // 如果该格子已经填写正确，不允许再次修改
    if (cellStatus[row][col] === true) {
        return;
    }
    
    // 处理清除按钮
    if (input === 'clear') {
        tempInput = '';
        inputContent.textContent = '';
        return;
    }
    
    // 处理确认按钮
    if (input === 'enter') {
        if (tempInput !== '') {
            const { row, col } = selectedCell;
            const exprInfo = getExpressionAtCell(row, col);
            if (!exprInfo) return;
            
            // 处理数字空白格
            if (exprInfo.blankType !== 'operator') {
                const number = parseInt(tempInput);
                puzzleGrid[row][col] = number;
                
                // 验证输入是否正确
                const isCorrect = validateCellInput(row, col, number, exprInfo);
                cellStatus[row][col] = isCorrect;
                
                // 如果正确，增加分数和时间奖励
                if (isCorrect) {
                    // 修改：每填对一个空格计20分
                    score += 20;
                    scoreElement.innerHTML = score;
                    // 增加时间奖励，但不超过初始时间300秒
                    const initialTime = 300;
                    timeRemaining = Math.min(timeRemaining + 10, initialTime);
                    updateTimerDisplay();
                }
                
                // 检查是否完成所有空格且全部正确
                if (checkPuzzleComplete() && checkAllCellsCorrect()) {
                    gameOver = true;
                    displayGameOver(true);
                }
                
                // 重置临时输入
                tempInput = '';
                
                // 取消选中并隐藏数字选择区域
                selectedCell = null;
                numberPad.style.display = 'none';
                
                renderGame();
            }
            // 处理运算符空白格
            else if (exprInfo.blankType === 'operator') {
                // 确保输入是运算符
                if (['+', '-', '*', '/'].includes(tempInput)) {
                    puzzleGrid[row][col] = tempInput;
                    
                    // 验证输入是否正确
                    const isCorrect = validateCellInput(row, col, tempInput, exprInfo);
                    cellStatus[row][col] = isCorrect;
                    
                    // 如果正确，增加分数和时间奖励
                    if (isCorrect) {
                        // 修改：每填对一个空格计20分
                        score += 20;
                        scoreElement.innerHTML = score;
                        // 增加时间奖励，但不超过初始时间300秒
                        const initialTime = 300;
                        timeRemaining = Math.min(timeRemaining + 10, initialTime);
                        updateTimerDisplay();
                    }
                    
                    // 检查是否完成所有空格且全部正确
                    if (checkPuzzleComplete() && checkAllCellsCorrect()) {
                        gameOver = true;
                        displayGameOver(true);
                    }
                    
                    // 重置临时输入
                    tempInput = '';
                    
                    // 取消选中并隐藏数字选择区域
                    selectedCell = null;
                    numberPad.style.display = 'none';
                    
                    renderGame();
                }
            }
        }
        return;
    }
    
    // 检查是否是运算符
    const isOperator = ['+', '-', '*', '/'].includes(input);
    
    // 获取当前单元格对应的表达式信息
    const exprInfo = getExpressionAtCell(row, col);
    if (!exprInfo) return;
    
    // 对于所有输入（数字和运算符），都添加到临时输入中，等待确认
    // 如果是运算符空白格，只允许输入运算符
    if (exprInfo.blankType === 'operator' && isOperator) {
        tempInput = input; // 运算符只保留最后一个
        inputContent.textContent = tempInput;
        // 移除直接应用运算符的逻辑，改为等待确认按钮点击
    } 
    // 如果是数字空白格，只允许输入数字
    else if (exprInfo.blankType !== 'operator' && !isOperator) {
        tempInput += input;
        inputContent.textContent = tempInput;
    }
    // 不匹配的输入类型不处理
}

// 显示游戏结束
function displayGameOver(success) {
    // 停止倒计时
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 确保输入框自动关闭
    numberPad.style.display = 'none';
    
    // 创建结算画面
    const gameContainer = document.querySelector('.game-container');
    
    // 检查是否已存在结算画面，如果存在则移除
    const existingSettlement = document.querySelector('.settlement-screen');
    if (existingSettlement) {
        existingSettlement.remove();
    }
    
    // 直接使用全局timeUsed变量记录用时
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    const timeString = `${minutes}分${seconds}秒`;
    
    // 创建结算内容
    const settlementDiv = document.createElement('div');
    settlementDiv.className = 'settlement-screen';
    
    if (success) {
        // 计算完成时间奖励（每秒剩余时间计10分）
        const timeBonus = timeRemaining * 10;
        // 计算总分数
        const totalScore = score + timeBonus;
        
        // 根据用时和是否有错误给出不同的鼓励文字
        let encourageText = '';
        const hasErrors = !checkAllCellsCorrect();
        
        if (!hasErrors && timeRemaining > 180) { // 2分钟内完成且全对
            encourageText = '你真是太厉害了！又快又准！';
        } else if (!hasErrors && timeRemaining > 120) { // 3分钟内完成且全对
            encourageText = '你真棒，全部做对了！';
        } else if (!hasErrors) { // 全对但用时较长
            encourageText = '恭喜你，答对了所有题目！';
        } else if (timeRemaining > 150) { // 有错但速度快
            encourageText = '速度真快！再接再厉！';
        } else { // 其他情况
            encourageText = '做得不错，继续加油！';
        }
        
        settlementDiv.innerHTML = `
            <h2>恭喜完成!</h2>
            <div class="settlement-details">
                <div class="settlement-item">
                    <span>基础分数：</span>
                    <span>${score} 分</span>
                </div>
                <div class="settlement-item">
                    <span>剩余时间：</span>
                    <span>${Math.floor(timeRemaining / 60)}分${timeRemaining % 60}秒</span>
                    <span>+${timeBonus} 分</span>
                </div>
                <div class="settlement-item total-score">
                    <span>最终得分：</span>
                    <span>${totalScore} 分</span>
                </div>
                <div class="settlement-item">
                    <span>用时：</span>
                    <span>${timeString}</span>
                </div>
                <div class="settlement-item">
                    <span>评价：</span>
                    <span>${encourageText}</span>
                </div>
            </div>
            <button id="close-settlement" class="btn">确定</button>
            <p class="restart-tip">按空格键重新开始</p>
        `;
        
        // 更新总分数
        score = totalScore;
        scoreElement.innerHTML = score;
    } else {
        settlementDiv.innerHTML = `
            <h2>游戏结束!</h2>
            <div class="settlement-details">
                <div class="settlement-item">
                    <span>最终得分：</span>
                    <span>${score} 分</span>
                </div>
                <div class="settlement-item">
                    <span>用时：</span>
                    <span>${timeString}</span>
                </div>
                <div class="settlement-item">
                    <span>评价：</span>
                    <span>别灰心，再试一次吧！</span>
                </div>
            </div>
            <button id="close-settlement" class="btn">确定</button>
            <p class="restart-tip">按空格键重新开始</p>
        `;
    
    
    gameContainer.appendChild(settlementDiv);
    
    // 添加关闭结算画面的事件
    document.getElementById('close-settlement').addEventListener('click', function() {
        settlementDiv.remove();
    });}
}

// 渲染游戏
function renderGame() {
    clearCanvas();
    drawGrid();
    
    // 首先绘制所有单元格的背景
    for (let row = 0; row < GRID_COUNT; row++) {
        for (let col = 0; col < GRID_COUNT; col++) {
            // 检查这个单元格是否是任何表达式的一部分
            let isPartOfExpression = false;
            let isOperatorOrEquals = false;
            
            for (const expr of expressions) {
                if (expr.type === 'horizontal' && row === expr.row) {
                    if (col >= expr.col && col <= expr.col + 4) {
                        isPartOfExpression = true;
                        // 检查是否是运算符或等号
                        if (col === expr.col + 1 || col === expr.col + 3) {
                            isOperatorOrEquals = true;
                        }
                    }
                } else if (expr.type === 'vertical' && col === expr.col) {
                    if (row >= expr.row && row <= expr.row + 4) {
                        isPartOfExpression = true;
                        // 检查是否是运算符或等号
                        if (row === expr.row + 1 || row === expr.row + 3) {
                            isOperatorOrEquals = true;
                        }
                    }
                }
            }
            
            // 如果是表达式的一部分，绘制背景
            if (isPartOfExpression) {
                if (isOperatorOrEquals) {
                    // 运算符和等号使用浅黄色背景
                    ctx.fillStyle = '#fff9c4';
                } else {
                    // 数字位置使用白色背景
                    ctx.fillStyle = '#ffffff';
                }
                ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                
                // 绘制单元格边框
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                ctx.strokeRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }
    }
    
    // 然后绘制表达式
    expressions.forEach((expr, index) => {
        // 为每个表达式分配一个颜色索引
        const colorIndex = index % EXPRESSION_COLORS.length;
        const exprColor = EXPRESSION_COLORS[colorIndex];
        
        const { type, row, col, num1, operator, num2, result, blank, intersections, sharedPositions } = expr;
        
        if (type === 'horizontal') {
            // 绘制横向表达式
            drawCell(row, col, num1, blank === 'num1', sharedPositions.num1, exprColor, 'horizontal', 0);
            drawCell(row, col + 1, operator, blank === 'operator', false, exprColor, 'horizontal', 1);
            drawCell(row, col + 2, num2, blank === 'num2', sharedPositions.num2, exprColor, 'horizontal', 2);
            drawCell(row, col + 3, '=', false, false, exprColor, 'horizontal', 3);
            drawCell(row, col + 4, result, blank === 'result', sharedPositions.result, exprColor, 'horizontal', 4);
        } else {
            // 绘制纵向表达式
            drawCell(row, col, num1, blank === 'num1', sharedPositions.num1, exprColor, 'vertical', 0);
            drawCell(row + 1, col, operator, blank === 'operator', false, exprColor, 'vertical', 1);
            drawCell(row + 2, col, num2, blank === 'num2', sharedPositions.num2, exprColor, 'vertical', 2);
            drawCell(row + 3, col, '=', false, false, exprColor, 'vertical', 3);
            drawCell(row + 4, col, result, blank === 'result', sharedPositions.result, exprColor, 'vertical', 4);
        }
    });
    
    // 高亮选中的单元格
    if (selectedCell) {
        const { row, col } = selectedCell;
        highlightCell(row, col);
    }
}

// 绘制单元格内容
function drawCell(row, col, content, isBlank = false, isShared = false, exprColor = null, exprType = null, cellPosition = null) {
    const x = col * GRID_SIZE + GRID_SIZE / 2;
    const y = row * GRID_SIZE + GRID_SIZE / 2;
    
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 首先检查这个单元格是否是空白格，无论传入的isBlank参数是什么
    // 这样可以确保交叉点空白格的优先级高于普通数字显示
    const isCellEmpty = isEmptyCell(row, col);
    
    // 如果是空白格子（通过isEmptyCell函数判断或传入的isBlank参数为true）
    if (isCellEmpty || isBlank) {
        // 根据格子状态设置不同的背景色
        if (cellStatus[row] && cellStatus[row][col] === true) {
            // 正确答案 - 绿色背景
            ctx.fillStyle = '#b8f0b8';
        } else if (cellStatus[row] && cellStatus[row][col] === false) {
            // 错误答案 - 红色背景
            ctx.fillStyle = '#ffb3b3';
        } else if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
            // 选中状态 - 高亮背景
            ctx.fillStyle = '#ffffb3';
        } else {
            // 未填写 - 浅蓝色背景，使空白格更加明显
            ctx.fillStyle = '#e3f2fd';
        }
        ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        
        // 为空白格添加虚线边框，使其更加明显
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(col * GRID_SIZE + 2, row * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        ctx.setLineDash([]);
        
        // 如果有玩家输入的值，则显示
        if (puzzleGrid[row][col] !== null && puzzleGrid[row][col] !== undefined) {
            // 根据答案正确与否设置文字颜色
            if (cellStatus[row] && cellStatus[row][col] === true) {
                ctx.fillStyle = '#006600'; // 深绿色文字
            } else if (cellStatus[row] && cellStatus[row][col] === false) {
                ctx.fillStyle = '#cc0000'; // 深红色文字
            } else {
                ctx.fillStyle = '#1a237e'; // 深蓝色文字，更接近参考图片
            }
            ctx.fillText(puzzleGrid[row][col], x, y);
            
            // 如果是多位数，显示一个小提示
            if (puzzleGrid[row][col] >= 10 && selectedCell && selectedCell.row === row && selectedCell.col === col) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.font = '12px Arial';
                ctx.fillText('按确认完成输入', x, y + 20);
                ctx.font = 'bold 24px Arial';
            }
        }
    } else {
        // 非空白格子的背景色
        if (content === '+' || content === '-' || content === '*' || content === '/' || content === '=') {
            // 运算符和等号使用浅黄色背景，类似参考图片
            ctx.fillStyle = '#fff9c4';
            ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.fillStyle = '#1a237e'; // 深蓝色文字
        } else if (isShared) {
            // 共享数字使用浅黄色背景
            ctx.fillStyle = '#fff9c4';
            ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.fillStyle = '#1a237e'; // 深蓝色文字
        } else {
            // 普通数字使用白色背景
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.fillStyle = '#1a237e'; // 深蓝色文字
        }
        ctx.fillText(content, x, y);
    }
    
    // 绘制单元格边框
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // 如果提供了表达式颜色，绘制表达式边框
    if (exprColor && exprType && cellPosition !== null) {
        ctx.strokeStyle = '#ffc107'; // 统一使用金黄色边框，更接近参考图片
        ctx.lineWidth = 2;
        
        // 根据表达式类型和单元格位置绘制不同的边框部分
        if (exprType === 'horizontal') {
            // 横向表达式的边框
            if (cellPosition === 0) { // 第一个数字
                // 左上角、上边、左边
                ctx.beginPath();
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE); // 上边
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 左边
                ctx.stroke();
            } else if (cellPosition === 4) { // 结果
                // 右上角、上边、右边
                ctx.beginPath();
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE); // 上边
                ctx.moveTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 右边
                ctx.stroke();
            } else if (cellPosition === 1 || cellPosition === 2 || cellPosition === 3) { // 中间部分
                // 只有上边
                ctx.beginPath();
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE); // 上边
                ctx.stroke();
            }
            
            // 所有单元格都有下边框
            ctx.beginPath();
            ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE + GRID_SIZE);
            ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 下边
            ctx.stroke();
        } else if (exprType === 'vertical') {
            // 纵向表达式的边框
            if (cellPosition === 0) { // 第一个数字
                // 左上角、上边、左边
                ctx.beginPath();
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE); // 上边
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 左边
                ctx.stroke();
            } else if (cellPosition === 4) { // 结果
                // 左下角、下边、左边
                ctx.beginPath();
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE + GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 下边
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 左边
                ctx.stroke();
            } else if (cellPosition === 1 || cellPosition === 2 || cellPosition === 3) { // 中间部分
                // 只有左边
                ctx.beginPath();
                ctx.moveTo(col * GRID_SIZE, row * GRID_SIZE);
                ctx.lineTo(col * GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 左边
                ctx.stroke();
            }
            
            // 所有单元格都有右边框
            ctx.beginPath();
            ctx.moveTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE);
            ctx.lineTo(col * GRID_SIZE + GRID_SIZE, row * GRID_SIZE + GRID_SIZE); // 右边
            ctx.stroke();
        }
    }
}

// 高亮单元格
function highlightCell(row, col) {
    ctx.fillStyle = HIGHLIGHT_COLOR + '40';
    ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

// 处理画布点击
function handleCanvasClick(event) {
    if (!gameStarted || gameOver) return;
    
    // 防止触摸事件的默认行为（如滚动）
    if (event.type === 'touchstart') {
        event.preventDefault();
    }
    
    const rect = gameCanvas.getBoundingClientRect();
    let x, y;
    
    // 处理触摸事件和鼠标事件
    if (event.type === 'touchstart' || event.type === 'touchmove' || event.touches) {
        const touch = event.touches ? event.touches[0] : event;
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    } else {
        // 鼠标事件
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    
    const col = Math.floor(x / GRID_SIZE);
    const row = Math.floor(y / GRID_SIZE);
    
    // 检查是否点击了空白格子
    if (isEmptyCell(row, col)) {
        // 如果该格子已经填写正确，不允许再次修改
        if (cellStatus[row] && cellStatus[row][col] === true) {
            return;
        }
        
        // 设置选中的单元格
        selectedCell = { row, col };
        // 高亮显示选中的单元格
        renderGame();
        
        // 显示数字选择区域并定位在选中格子附近
        positionNumberPad(row, col);
        numberPad.style.display = 'block';
        
        // 确保数字按钮事件监听器已绑定
        const numberButtons = document.querySelectorAll('.number-btn');
        numberButtons.forEach(button => {
            // 移除旧的事件监听器以避免重复
            button.removeEventListener('click', handleNumberButtonClick);
            // 添加新的事件监听器
            button.addEventListener('click', handleNumberButtonClick);
        });
    } else {
        // 如果点击了非空白格子，取消选择
        selectedCell = null;
        // 隐藏数字选择区域
        numberPad.style.display = 'none';
        renderGame();
    }
}

function isEmptyCell(row, col) {
    // 检查是否在网格范围内
    if (row < 0 || row >= GRID_COUNT || col < 0 || col >= GRID_COUNT) {
        return false;
    }
    
    // 如果格子已填写且答案正确，不允许重新填写
    if (cellStatus[row] && cellStatus[row][col] === true) {
        return false;
    }
    
    // 创建一个变量来跟踪当前位置是否是空白格
    let isBlank = false;
    
    // 首先检查这个位置是否是交叉点，并且是否有任何表达式将其标记为空白格
    // 这样可以确保交叉点的空白格优先级高于普通数字显示
    const cellKey = `${row},${col}`;
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        if (expr.crossPoints) {
            for (const cp of expr.crossPoints) {
                if (cp.row === row && cp.col === col) {
                    // 检查当前表达式是否将此位置标记为空白格
                    if (expr.blank === cp.position) {
                        return true; // 如果是交叉点且被标记为空白格，立即返回true
                    }
                    
                    // 检查交叉的另一个表达式是否将此位置标记为空白格
                    const crossExpr = expressions[cp.withExpr];
                    if (crossExpr && crossExpr.blank === cp.atPosition) {
                        return true; // 如果交叉的表达式将此位置标记为空白格，立即返回true
                    }
                }
            }
        }
    }
    
    // 如果不是交叉点空白格，再检查是否是普通表达式中的空白格子
    for (let expr of expressions) {
        // 检查横向表达式
        if (expr.type === 'horizontal' && row === expr.row) {
            if ((expr.blank === 'num1' && col === expr.col) || 
                (expr.blank === 'num2' && col === expr.col + 2) ||
                (expr.blank === 'result' && col === expr.col + 4) ||
                (expr.blank === 'operator' && col === expr.col + 1) ||
                (expr.blank === 'equals' && col === expr.col + 3)) {
                isBlank = true;
                break; // 一旦确认是空白格，就可以退出循环
            }
        } 
        // 检查纵向表达式
        else if (expr.type === 'vertical' && col === expr.col) {
            if ((expr.blank === 'num1' && row === expr.row) || 
                (expr.blank === 'num2' && row === expr.row + 2) ||
                (expr.blank === 'result' && row === expr.row + 4) ||
                (expr.blank === 'operator' && row === expr.row + 1) ||
                (expr.blank === 'equals' && row === expr.row + 3)) {
                isBlank = true;
                break; // 一旦确认是空白格，就可以退出循环
            }
        }
    }
    
    return isBlank;
}

// 获取指定位置的表达式和空白位置
function getExpressionAtCell(row, col) {
    // 检查是否是空白格子
    if (!isEmptyCell(row, col)) {
        return null;
    }
    
    
    // 查找所有匹配的表达式
    const matchingExpressions = [];
    
    for (let expr of expressions) {
        if (expr.type === 'horizontal' && row === expr.row) {
            if ((expr.blank === 'num1' && col === expr.col) || 
                (expr.blank === 'num2' && col === expr.col + 2) ||
                (expr.blank === 'result' && col === expr.col + 4) ||
                (expr.blank === 'operator' && col === expr.col + 1) ||
                (expr.blank === 'equals' && col === expr.col + 3)) {
                let blankType = '';
                if (expr.blank === 'num1' && col === expr.col) blankType = 'num1';
                else if (expr.blank === 'num2' && col === expr.col + 2) blankType = 'num2';
                else if (expr.blank === 'result' && col === expr.col + 4) blankType = 'result';
                else if (expr.blank === 'operator' && col === expr.col + 1) blankType = 'operator';
                else if (expr.blank === 'equals' && col === expr.col + 3) blankType = 'equals';
                
                matchingExpressions.push({
                    expression: expr,
                    blankType: blankType
                });
            }
        } else if (expr.type === 'vertical' && col === expr.col) {
            if ((expr.blank === 'num1' && row === expr.row) || 
                (expr.blank === 'num2' && row === expr.row + 2) ||
                (expr.blank === 'result' && row === expr.row + 4) ||
                (expr.blank === 'operator' && row === expr.row + 1) ||
                (expr.blank === 'equals' && row === expr.row + 3)) {
                let blankType = '';
                if (expr.blank === 'num1' && row === expr.row) blankType = 'num1';
                else if (expr.blank === 'num2' && row === expr.row + 2) blankType = 'num2';
                else if (expr.blank === 'result' && row === expr.row + 4) blankType = 'result';
                else if (expr.blank === 'operator' && row === expr.row + 1) blankType = 'operator';
                else if (expr.blank === 'equals' && row === expr.row + 3) blankType = 'equals';
                
                matchingExpressions.push({
                    expression: expr,
                    blankType: blankType
                });
            }
        }
        
        // 检查交叉点
        if (expr.crossPoints) {
            for (const cp of expr.crossPoints) {
                if (cp.row === row && cp.col === col && expr.blank === cp.position) {
                    matchingExpressions.push({
                        expression: expr,
                        blankType: cp.position
                    });
                }
            }
        }
    }
    
    // 如果没有匹配的表达式，返回null
    if (matchingExpressions.length === 0) {
        return null;
    }
    
    // 如果只有一个匹配的表达式，直接返回
    if (matchingExpressions.length === 1) {
        return matchingExpressions[0];
    }
    
    // 如果有多个匹配的表达式，返回第一个空白格的表达式
    // 这样可以确保重叠的单元格可以被正确处理
    return matchingExpressions[0];
}

// 处理数字按钮点击
// 用于存储多位数输入的临时变量
let currentNumberInput = '';

function handleNumberButtonClick(event) {
    if (!gameStarted || !selectedCell || gameOver) return;
    
    const input = event.target.getAttribute('data-number');
    const { row, col } = selectedCell;
    
    // 如果该格子已经填写正确，不允许再次修改
    if (cellStatus[row][col] === true) {
        return;
    }
    
    // 检查是否是运算符
    const isOperator = ['+', '-', '*', '/'].includes(input);
    
    // 获取当前单元格对应的表达式信息
    const exprInfo = getExpressionAtCell(row, col);
    if (!exprInfo) return;
    
    // 如果是运算符空白格，更新临时输入
    if (exprInfo.blankType === 'operator' && isOperator) {
        // 更新临时输入（运算符只保留最后一次输入，不累积）
        tempInput = input;
        inputContent.textContent = tempInput;
        // 不立即应用到格子中，等待确认按钮点击
    
    } 
    // 如果是数字空白格，确保输入是数字
    else if (!isOperator) {
        // 处理多位数输入
        if (input === 'clear') {
            // 清除当前输入
            tempInput = '';
            inputContent.textContent = '';
            return;
        } else if (input === 'enter') {
            // 确认当前输入
            if (tempInput === '') return;
            
            // 根据空白格类型处理输入
            if (exprInfo.blankType === 'operator' && ['+', '-', '*', '/'].includes(tempInput)) {
                // 如果是运算符空白格，直接使用运算符值
                puzzleGrid[row][col] = tempInput;
            } else {
                // 如果是数字空白格，转换为数字
                const number = parseInt(tempInput);
                puzzleGrid[row][col] = number;
            }
            
            // 验证输入是否正确
            const isCorrect = validateCellInput(row, col, puzzleGrid[row][col], exprInfo);
            cellStatus[row][col] = isCorrect;
            
            // 如果正确，增加分数
            if (isCorrect) {
                score += 20;
                scoreElement.innerHTML = score;
                // 增加时间奖励
                timeRemaining += 10;
                updateTimerDisplay();
            }
            
            // 重置多位数输入
            tempInput = '';
            inputContent.textContent = '';
            
            // 无论填写是否正确，都取消选中并隐藏数字选择区域
            selectedCell = null;
            numberPad.style.display = 'none';
            renderGame();
        } else {
            // 添加数字到当前输入
            tempInput += input;
            // 更新当前输入显示
            inputContent.textContent = tempInput;
            // 不立即应用到格子中，等待确认按钮点击
        }
    }
    // 如果是数字空白格但输入了运算符，不做任何处理
    else {
        // 不处理不匹配的输入类型
        return;
    }
    
    // 检查是否完成所有空格且全部正确
    if (checkPuzzleComplete() && checkAllCellsCorrect()) {
        gameOver = true;
        displayGameOver(true);
    }
}

// 检查谜题是否完成
function checkPuzzleComplete() {
    // 检查所有空白格子是否都已填写
    return expressions.every(expr => {
        const { type, row, col, blank } = expr;
        let cellValue = null;
        
        // 根据表达式类型和空白位置获取对应单元格的值
        if (type === 'horizontal') {
            if (blank === 'num1') cellValue = puzzleGrid[row][col];
            else if (blank === 'num2') cellValue = puzzleGrid[row][col + 2];
            else if (blank === 'result') cellValue = puzzleGrid[row][col + 4];
            else if (blank === 'operator') cellValue = puzzleGrid[row][col + 1];
            else return true; // 如果没有空白，则认为已完成
        } else { // vertical
            if (blank === 'num1') cellValue = puzzleGrid[row][col];
            else if (blank === 'num2') cellValue = puzzleGrid[row + 2][col];
            else if (blank === 'result') cellValue = puzzleGrid[row + 4][col];
            else if (blank === 'operator') cellValue = puzzleGrid[row + 1][col];
            else return true; // 如果没有空白，则认为已完成
        }
        
        // 检查单元格是否已填写且值不为null或undefined
        return cellValue !== null && cellValue !== undefined;
    });
}

// 检查所有填写的格子是否都正确
function checkAllCellsCorrect() {
    return expressions.every(expr => {
        const { type, row, col, blank } = expr;
        if (type === 'horizontal') {
            if (blank === 'num1') return cellStatus[row][col] === true;
            else if (blank === 'num2') return cellStatus[row][col + 2] === true;
            else if (blank === 'result') return cellStatus[row][col + 4] === true;
            else if (blank === 'operator') return cellStatus[row][col + 1] === true;
            return true;
        } else {
            if (blank === 'num1') return cellStatus[row][col] === true;
            else if (blank === 'num2') return cellStatus[row + 2][col] === true;
            else if (blank === 'result') return cellStatus[row + 4][col] === true;
            else if (blank === 'operator') return cellStatus[row + 1][col] === true;
            return true;
        }
    });
}

// 验证谜题是否正确
function validatePuzzle() {
    // 验证所有表达式
    return expressions.every(expr => {
        const { type, row, col, num1, operator, num2, result, blank } = expr;
        let actualNum1 = num1;
        let actualNum2 = num2;
        let actualOperator = operator;
        let actualResult = result;
        
        if (type === 'horizontal') {
            if (blank === 'num1') {
                actualNum1 = puzzleGrid[row][col];
            } else if (blank === 'num2') {
                actualNum2 = puzzleGrid[row][col + 2];
            } else if (blank === 'result') {
                actualResult = puzzleGrid[row][col + 4];
                // 验证玩家输入的结果是否与计算结果匹配
                return calculateExpression(actualNum1, actualOperator, actualNum2) === actualResult;
            } else if (blank === 'operator') {
                actualOperator = puzzleGrid[row][col + 1];
            }
        } else {
            if (blank === 'num1') {
                actualNum1 = puzzleGrid[row][col];
            } else if (blank === 'num2') {
                actualNum2 = puzzleGrid[row + 2][col];
            } else if (blank === 'result') {
                actualResult = puzzleGrid[row + 4][col];
                // 验证玩家输入的结果是否与计算结果匹配
                return calculateExpression(actualNum1, actualOperator, actualNum2) === actualResult;
            } else if (blank === 'operator') {
                actualOperator = puzzleGrid[row + 1][col];
            }
        }
        
        // 如果空白不是结果，则验证计算结果是否正确
        if (blank !== 'result') {
            // 对于减法和除法，需要特殊处理
            if (actualOperator === '-') {
                // 确保减法结果为正数
                return (actualNum1 >= actualNum2 ? actualNum1 - actualNum2 : actualNum2 - actualNum1) === actualResult;
            } else if (actualOperator === '/') {
                // 确保除法结果为正整数
                return (actualNum1 >= actualNum2 && actualNum1 % actualNum2 === 0 ? actualNum1 / actualNum2 : actualNum2) === actualResult;
            } else {
                return calculateExpression(actualNum1, actualOperator, actualNum2) === actualResult;
            }
        }
        return true;
    });
}

// 验证单元格输入是否正确
function validateCellInput(row, col, input, exprInfo) {
    const { expression, blankType } = exprInfo;
    const { type, num1, operator, num2, result } = expression;
    
    // 根据空白类型验证输入
    if (blankType === 'num1') {
        // 如果是数字1，验证表达式是否成立
        if (operator === '-') {
            // 确保减法结果为正数
            return (input >= num2 ? input - num2 : num2 - input) === result;
        } else if (operator === '/') {
            // 确保除法结果为正整数
            return (input >= num2 && input % num2 === 0 ? input / num2 : num2) === result;
        } else {
            const calculatedResult = calculateExpression(input, operator, num2);
            return calculatedResult === result;
        }
    } else if (blankType === 'num2') {
        // 如果是数字2，验证表达式是否成立
        if (operator === '-') {
            // 确保减法结果为正数
            return (num1 >= input ? num1 - input : input - num1) === result;
        } else if (operator === '/') {
            // 确保除法结果为正整数
            return (num1 >= input && num1 % input === 0 ? num1 / input : input) === result;
        } else {
            const calculatedResult = calculateExpression(num1, operator, input);
            return calculatedResult === result;
        }
    } else if (blankType === 'result') {
        // 如果是结果，验证输入是否等于计算结果
        const calculatedResult = calculateExpression(num1, operator, num2);
        return input === calculatedResult;
    } else if (blankType === 'operator') {
        // 如果是运算符，验证使用该运算符计算是否得到正确结果
        if (input === '-') {
            // 确保减法结果为正数
            return (num1 >= num2 ? num1 - num2 : num2 - num1) === result;
        } else if (input === '/') {
            // 确保除法结果为正整数
            return (num1 >= num2 && num1 % num2 === 0 ? num1 / num2 : num2) === result;
        } else {
            const calculatedResult = calculateExpression(num1, input, num2);
            return calculatedResult === result;
        }
    }
    
    return false;
}

// 显示游戏结束
function displayGameOver(success) {
    // 停止倒计时
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 确保输入框自动关闭
    numberPad.style.display = 'none';
    
    // 创建游戏状态元素（如果不存在）
    let gameStatusElement = document.getElementById('game-status');
    if (!gameStatusElement) {
        gameStatusElement = document.createElement('div');
        gameStatusElement.id = 'game-status';
        gameStatusElement.className = 'game-status';
        document.querySelector('.game-container').appendChild(gameStatusElement);
    }
    
    // 清空并显示游戏状态元素
    gameStatusElement.innerHTML = '';
    gameStatusElement.style.display = 'block';
    
    // 直接使用全局timeUsed变量记录用时
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    const timeString = `${minutes}分${seconds}秒`;
    
    // 创建结算画面容器
    const settlementDiv = document.createElement('div');
    settlementDiv.className = 'settlement-screen';
    gameStatusElement.appendChild(settlementDiv);
    
    // 设置结算画面样式
    settlementDiv.style.position = 'fixed';
    settlementDiv.style.top = '50%';
    settlementDiv.style.left = '50%';
    settlementDiv.style.transform = 'translate(-50%, -50%)';
    settlementDiv.style.zIndex = '1000';
    settlementDiv.style.backgroundColor = '#fff';
    settlementDiv.style.borderRadius = '10px';
    settlementDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    settlementDiv.style.padding = '20px';
    settlementDiv.style.textAlign = 'center';
    settlementDiv.style.maxWidth = '500px';
    settlementDiv.style.width = '90%';
    settlementDiv.style.border = success ? '3px solid #4CAF50' : '3px solid #FF5733';
    settlementDiv.style.maxHeight = '90vh';
    settlementDiv.style.overflowY = 'auto';

    
    if (success) {
        // 计算完成时间奖励（每秒剩余时间计10分）
        const timeBonus = timeRemaining * 10;
        // 计算总分数
        const totalScore = score + timeBonus;
        
        // 创建结算内容
        settlementDiv.innerHTML = `
            <h2 style="color: #4CAF50; margin-top: 0; margin-bottom: 20px; font-size: 1.5em;">恭喜完成!</h2>
            <div class="settlement-details" style="margin-bottom: 20px;">
                <div class="settlement-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span>用时：</span>
                    <span>${timeString}</span>
                </div>
                <div class="settlement-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span>基础分数：</span>
                    <span>${score} 分</span>
                </div>
                <div class="settlement-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span>时间奖励：</span>
                    <span style="color: #2196F3;">+${timeBonus} 分</span>
                </div>
                <div class="settlement-item total-score" style="font-weight: bold; font-size: 1.2em; color: #4CAF50; margin-top: 10px; padding-top: 10px; border-top: 2px solid #eee; display: flex; justify-content: space-between;">
                    <span>最终得分：</span>
                    <span>${totalScore} 分</span>
                </div>
            </div>
        `;
        
        // 根据分数和用时给出鼓励性文字
        let encouragement = '';
        if (timeUsed < 120) { // 2分钟内完成
            encouragement = '太厉害了！你是数学天才！';
        } else if (timeUsed < 180) { // 3分钟内完成
            encouragement = '非常棒！你的计算能力很强！';
        } else if (timeUsed < 240) { // 4分钟内完成
            encouragement = '做得好！继续练习会更快！';
        } else { // 4-5分钟完成
            encouragement = '恭喜完成！坚持就是胜利！';
        }
        
        // 添加鼓励文字
        const encouragementDiv = document.createElement('p');
        encouragementDiv.textContent = encouragement;
        encouragementDiv.style.color = '#333333';
        encouragementDiv.style.fontSize = '1.1em';
        encouragementDiv.style.margin = '15px 0';
        settlementDiv.appendChild(encouragementDiv);
        
        // 更新总分数
        score = totalScore;
        scoreElement.innerHTML = score;
    } else {
        // 游戏失败结算
        settlementDiv.innerHTML = `
            <h2 style="color: #FF5733; margin-top: 0; margin-bottom: 20px; font-size: 1.5em;">游戏结束!</h2>
            <div class="settlement-details" style="margin-bottom: 20px;">
                <div class="settlement-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span>最终得分：</span>
                    <span>${score} 分</span>
                </div>
                <div class="settlement-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span>用时：</span>
                    <span>${timeString}</span>
                </div>
            </div>
            <p style="color: #333333; font-size: 1.1em; margin: 15px 0;">别灰心！下次一定能做得更好！</p>
        `;
    }
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '确定';
    closeButton.className = 'btn';
    closeButton.style.backgroundColor = '#2196F3';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.margin = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '1em';
    settlementDiv.appendChild(closeButton);
    
    // 添加关闭结算画面的事件
    closeButton.addEventListener('click', function() {
        gameStatusElement.style.display = 'none';
    });
}


// 更新倒计时显示
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    // 计算用时的分钟和秒数
    const usedMinutes = Math.floor(timeUsed / 60);
    const usedSeconds = timeUsed % 60;
    
    timerElement.innerHTML = `时间: ${minutes}:${seconds < 10 ? '0' : ''}${seconds} | 用时: ${usedMinutes}:${usedSeconds < 10 ? '0' : ''}${usedSeconds}`;
}

// 更新倒计时
function updateTimer() {
    if (!gameStarted || gameOver) return;
    
    timeRemaining--;
    timeUsed++; // 增加用时计数
    updateTimerDisplay();
    
    // 如果时间用完，游戏结束
    if (timeRemaining <= 0) {
        gameOver = true;
        displayGameOver(false);
    }
}