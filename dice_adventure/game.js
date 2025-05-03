// 骰子冒险游戏 - 游戏逻辑

// 游戏变量
let gameBoard = [];
let players = [];
let currentPlayerIndex = 0;
let gameStarted = false;
let diceValue = 6;
let specialCells = {}; // 特殊格子的位置和类型
let eventInProgress = false; // 是否有事件正在进行

// DOM元素
let gameBoardElement;
let diceElement;
let rollDiceButton;
let startButton;
let restartButton;
let backButton;
let playerCountSelector;
let currentPlayerElement;
let gameStatusElement;
let playerContainerElement;
let eventMessageElement;
let eventActionElement;
let toggleRulesButton;
let rulesContent;

// 特殊格子类型
const SPECIAL_TYPES = {
    FORWARD: 'forward',   // 前进N格
    BACKWARD: 'backward', // 后退N格
    MATH: 'math',         // 数学计算题
    COMPARE: 'compare'    // 比较大小
};

// 初始化函数
function init() {
    console.log('初始化骰子冒险游戏');
    
    // 获取DOM元素
    gameBoardElement = document.getElementById('game-board');
    diceElement = document.getElementById('dice');
    rollDiceButton = document.getElementById('roll-dice');
    startButton = document.getElementById('start-btn');
    restartButton = document.getElementById('restart-btn');
    backButton = document.getElementById('back-btn');
    playerCountSelector = document.getElementById('player-count');
    currentPlayerElement = document.getElementById('current-player');
    gameStatusElement = document.getElementById('game-status');
    playerContainerElement = document.getElementById('player-container');
    eventMessageElement = document.getElementById('event-message');
    eventActionElement = document.getElementById('event-action');
    toggleRulesButton = document.getElementById('toggle-rules');
    rulesContent = document.getElementById('rules-content');
    
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    backButton.addEventListener('click', () => window.location.href = '../index.html');
    rollDiceButton.addEventListener('click', rollDice);
    toggleRulesButton.addEventListener('click', toggleRules);
    
    // 初始状态设置
    restartButton.disabled = true;
    rollDiceButton.disabled = true;
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

// 开始游戏
function startGame() {
    const playerCount = parseInt(playerCountSelector.value);
    
    // 初始化玩家
    players = [];
    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: i + 1,
            name: `玩家${i + 1}`,
            position: 0, // 起点位置
            color: getPlayerColor(i + 1)
        });
    }
    
    // 创建游戏棋盘
    createGameBoard();
    
    // 生成特殊格子
    generateSpecialCells();
    
    // 更新UI
    updatePlayerInfo();
    updateGameStatus('游戏开始！');
    updateCurrentPlayer();
    
    // 更新按钮状态
    startButton.disabled = true;
    restartButton.disabled = false;
    rollDiceButton.disabled = false;
    playerCountSelector.disabled = true;
    
    // 设置游戏状态
    gameStarted = true;
    currentPlayerIndex = 0;
    
    // 渲染玩家位置
    renderPlayers();
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameStarted = false;
    currentPlayerIndex = 0;
    eventInProgress = false;
    
    // 清空事件区域
    eventMessageElement.textContent = '';
    eventActionElement.innerHTML = '';
    
    // 更新按钮状态
    startButton.disabled = false;
    restartButton.disabled = true;
    rollDiceButton.disabled = true;
    playerCountSelector.disabled = false;
    
    // 更新游戏状态
    updateGameStatus('准备开始');
    currentPlayerElement.textContent = '当前玩家: -';
    
    // 清空玩家信息区域
    playerContainerElement.innerHTML = '';
    
    // 清空棋盘
    gameBoardElement.innerHTML = '';
}

// 创建游戏棋盘
function createGameBoard() {
    gameBoard = [];
    gameBoardElement.innerHTML = '';
    
    // 创建10x10的棋盘
    const totalCells = 100;
    const rows = 10;
    const cols = 10;
    
    // 创建蛇形路径的棋盘索引映射
    let cellIndex = 0;
    for (let row = rows - 1; row >= 0; row--) {
        const rowData = [];
        // 偶数行从左到右，奇数行从右到左
        if (row % 2 === 1) {
            // 从左到右
            for (let col = 0; col < cols; col++) {
                rowData.push(cellIndex++);
            }
        } else {
            // 从右到左
            for (let col = cols - 1; col >= 0; col--) {
                rowData.push(cellIndex++);
            }
        }
        gameBoard.push(rowData);
    }
    
    // 创建棋盘UI
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // 获取单元格的实际索引
            const cellIndex = gameBoard[row][col];
            cell.dataset.index = cellIndex;
            
            // 添加单元格编号
            cell.textContent = cellIndex;
            
            // 设置起点和终点
            if (cellIndex === 0) {
                cell.classList.add('start');
                cell.textContent = '起点';
            } else if (cellIndex === totalCells - 1) {
                cell.classList.add('end');
                cell.textContent = '终点';
            }
            
            gameBoardElement.appendChild(cell);
        }
    }
}

// 生成特殊格子
function generateSpecialCells() {
    specialCells = {};
    const totalCells = 100;
    const specialCellCount = Math.floor(totalCells * 0.3); // 约30%的格子是特殊格子
    
    // 排除起点和终点
    const availableCells = [];
    for (let i = 1; i < totalCells - 1; i++) {
        availableCells.push(i);
    }
    
    // 随机选择特殊格子
    for (let i = 0; i < specialCellCount; i++) {
        if (availableCells.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const cellIndex = availableCells[randomIndex];
        availableCells.splice(randomIndex, 1);
        
        // 随机选择特殊格子类型
        const typeKeys = Object.keys(SPECIAL_TYPES);
        const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const type = SPECIAL_TYPES[randomType];
        
        // 根据类型设置特殊格子的参数
        let params = {};
        if (type === SPECIAL_TYPES.FORWARD) {
            params.steps = Math.floor(Math.random() * 3) + 1; // 前进1-3步
        } else if (type === SPECIAL_TYPES.BACKWARD) {
            params.steps = Math.floor(Math.random() * 3) + 1; // 后退1-3步
        } else if (type === SPECIAL_TYPES.MATH) {
            params = generateMathProblem();
        } else if (type === SPECIAL_TYPES.COMPARE) {
            params = generateComparisonProblem();
        }
        
        specialCells[cellIndex] = { type, params };
        
        // 更新UI
        const cell = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        if (cell) {
            cell.classList.add(`special-${type}`);
            
            // 更新格子显示的文本
            if (type === SPECIAL_TYPES.FORWARD) {
                cell.textContent = `前进${params.steps}`;
            } else if (type === SPECIAL_TYPES.BACKWARD) {
                cell.textContent = `后退${params.steps}`;
            } else if (type === SPECIAL_TYPES.MATH) {
                cell.textContent = '计算题';
            } else if (type === SPECIAL_TYPES.COMPARE) {
                cell.textContent = '比较大小';
            }
        }
    }
}

// 生成数学计算问题
function generateMathProblem() {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    if (operation === '+') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
    } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 50) + 50; // 确保结果为正
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 - num2;
    } else { // 乘法
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
    }
    
    return {
        question: `${num1} ${operation} ${num2} = ?`,
        answer: answer
    };
}

// 生成比较大小问题
function generateComparisonProblem() {
    const num1 = Math.floor(Math.random() * 100) + 1;
    const num2 = Math.floor(Math.random() * 100) + 1;
    
    return {
        num1: num1,
        num2: num2,
        answer: num1 > num2 ? '>' : (num1 < num2 ? '<' : '=')
    };
}

// 掷骰子
function rollDice() {
    if (!gameStarted || eventInProgress) return;
    
    // 禁用掷骰子按钮
    rollDiceButton.disabled = true;
    
    // 动画效果：快速变换骰子点数
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
        diceValue = Math.floor(Math.random() * 6) + 1;
        diceElement.textContent = diceValue;
        
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            movePlayer();
        }
    }, 100);
}

// 移动玩家
function movePlayer() {
    const currentPlayer = players[currentPlayerIndex];
    const oldPosition = currentPlayer.position;
    let newPosition = oldPosition + diceValue;
    
    // 确保不超过终点
    const totalCells = 100;
    if (newPosition >= totalCells - 1) {
        newPosition = totalCells - 1;
    }
    
    // 使用动画逐格移动玩家
    animatePlayerMovement(currentPlayer, oldPosition, newPosition);
}

// 逐格移动动画
function animatePlayerMovement(player, startPos, endPos) {
    // 禁用掷骰子按钮，防止动画过程中再次点击
    rollDiceButton.disabled = true;
    
    // 当前动画位置
    let currentPos = startPos;
    
    // 更新游戏状态
    updateGameStatus(`${player.name}掷出了${diceValue}点，正在移动...`);
    
    // 设置动画间隔
    const moveInterval = setInterval(() => {
        // 移动一格
        currentPos++;
        
        // 临时更新玩家位置以显示动画
        player.position = currentPos;
        renderPlayers();
        
        // 检查是否到达目标位置
        if (currentPos >= endPos) {
            clearInterval(moveInterval);
            
            // 更新游戏状态
            updateGameStatus(`${player.name}掷出了${diceValue}点，从${startPos}移动到${endPos}`);
            
            // 检查是否到达终点
            const totalCells = 100;
            if (currentPos >= totalCells - 1) {
                // 玩家到达终点，游戏结束
                gameOver(player);
                return;
            }
            
            // 检查是否有特殊格子事件
            if (specialCells[currentPos] && currentPos < totalCells - 1) {
                handleSpecialCell(currentPos);
            } else {
                // 没有特殊格子，切换到下一个玩家
                setTimeout(() => {
                    nextPlayer();
                }, 1000);
            }
        }
    }, 300); // 每300毫秒移动一格
}

// 处理特殊格子事件
function handleSpecialCell(position) {
    const specialCell = specialCells[position];
    const currentPlayer = players[currentPlayerIndex];
    
    eventInProgress = true;
    
    // 如果是数学计算题或比较大小题，每次触发时重新生成题目
    if (specialCell.type === SPECIAL_TYPES.MATH) {
        specialCell.params = generateMathProblem();
    } else if (specialCell.type === SPECIAL_TYPES.COMPARE) {
        specialCell.params = generateComparisonProblem();
    }
    
    if (specialCell.type === SPECIAL_TYPES.FORWARD) {
        // 前进N格
        const steps = specialCell.params.steps;
        eventMessageElement.textContent = `${currentPlayer.name}踩到了前进${steps}格的特殊格子！`;
        
        setTimeout(() => {
            const oldPosition = currentPlayer.position;
            let newPosition = oldPosition + steps;
            
            // 确保不超过终点
            const totalCells = 100;
            if (newPosition >= totalCells - 1) {
                newPosition = totalCells - 1;
                // 玩家到达终点，游戏结束
                gameOver(currentPlayer);
            }
            
            // 更新玩家位置
            currentPlayer.position = newPosition;
            
            // 更新游戏状态
            updateGameStatus(`${currentPlayer.name}前进了${steps}格，从${oldPosition}移动到${newPosition}`);
            
            // 渲染玩家位置
            renderPlayers();
            
            // 事件结束，切换到下一个玩家
            eventInProgress = false;
            eventMessageElement.textContent = '';
            
            // 检查是否有连锁特殊格子事件
            if (specialCells[newPosition] && newPosition < totalCells - 1) {
                handleSpecialCell(newPosition);
            } else {
                setTimeout(() => {
                    nextPlayer();
                }, 1000);
            }
        }, 1500);
    } else if (specialCell.type === SPECIAL_TYPES.BACKWARD) {
        // 后退N格
        const steps = specialCell.params.steps;
        eventMessageElement.textContent = `${currentPlayer.name}踩到了后退${steps}格的特殊格子！`;
        
        setTimeout(() => {
            const oldPosition = currentPlayer.position;
            let newPosition = oldPosition - steps;
            
            // 确保不小于起点
            if (newPosition < 0) {
                newPosition = 0;
            }
            
            // 更新玩家位置
            currentPlayer.position = newPosition;
            
            // 更新游戏状态
            updateGameStatus(`${currentPlayer.name}后退了${steps}格，从${oldPosition}移动到${newPosition}`);
            
            // 渲染玩家位置
            renderPlayers();
            
            // 事件结束，切换到下一个玩家
            eventInProgress = false;
            eventMessageElement.textContent = '';
            
            // 检查是否有连锁特殊格子事件
            if (specialCells[newPosition] && newPosition > 0) {
                handleSpecialCell(newPosition);
            } else {
                setTimeout(() => {
                    nextPlayer();
                }, 1000);
            }
        }, 1500);
    } else if (specialCell.type === SPECIAL_TYPES.MATH) {
        // 数学计算题
        const problem = specialCell.params;
        eventMessageElement.textContent = `${currentPlayer.name}踩到了计算题格子！请计算: ${problem.question}`;
        
        // 创建输入框和提交按钮
        eventActionElement.innerHTML = `
            <input type="number" id="math-answer" class="event-input" placeholder="输入答案">
            <button id="submit-math" class="event-btn">提交</button>
        `;
        
        // 添加提交事件
        document.getElementById('submit-math').addEventListener('click', () => {
            const userAnswer = parseInt(document.getElementById('math-answer').value);
            
            if (userAnswer === problem.answer) {
                // 答对了
                eventMessageElement.textContent = `回答正确！${currentPlayer.name}额外前进1格。`;
                eventActionElement.innerHTML = '';
                
                setTimeout(() => {
                    // 额外前进一格
                    const oldPosition = currentPlayer.position;
                    let newPosition = oldPosition + 1;
                    
                    // 确保不超过终点
                    const totalCells = 100;
                    if (newPosition >= totalCells - 1) {
                        newPosition = totalCells - 1;
                        // 玩家到达终点，游戏结束
                        gameOver(currentPlayer);
                        return;
                    }
                    
                    // 更新玩家位置
                    currentPlayer.position = newPosition;
                    
                    // 更新游戏状态
                    updateGameStatus(`${currentPlayer.name}答对了问题，额外前进1格，从${oldPosition}移动到${newPosition}`);
                    
                    // 渲染玩家位置
                    renderPlayers();
                    
                    // 事件结束，切换到下一个玩家
                    eventInProgress = false;
                    eventMessageElement.textContent = '';
                    nextPlayer();
                }, 1500);
            } else {
                // 答错了
                eventMessageElement.textContent = `回答错误！正确答案是${problem.answer}。${currentPlayer.name}后退1格。`;
                eventActionElement.innerHTML = '';
                
                setTimeout(() => {
                    // 后退一格
                    const oldPosition = currentPlayer.position;
                    let newPosition = oldPosition - 1;
                    
                    // 确保不小于起点
                    if (newPosition < 0) {
                        newPosition = 0;
                    }
                    
                    // 更新玩家位置
                    currentPlayer.position = newPosition;
                    
                    // 更新游戏状态
                    updateGameStatus(`${currentPlayer.name}答错了问题，后退1格，从${oldPosition}移动到${newPosition}`);
                    
                    // 渲染玩家位置
                    renderPlayers();
                    
                    // 事件结束，切换到下一个玩家
                    eventInProgress = false;
                    eventMessageElement.textContent = '';
                    nextPlayer();
                }, 2000);
            }
        });
    } else if (specialCell.type === SPECIAL_TYPES.COMPARE) {
        // 比较大小
        const problem = specialCell.params;
        eventMessageElement.textContent = `${currentPlayer.name}踩到了比较大小格子！请选择: ${problem.num1} ? ${problem.num2}`;
        
        // 创建选择按钮
        eventActionElement.innerHTML = `
            <button id="compare-less" class="event-btn"><</button>
            <button id="compare-equal" class="event-btn">=</button>
            <button id="compare-greater" class="event-btn">></button>
        `;
        
        // 添加选择事件
        document.getElementById('compare-less').addEventListener('click', () => handleComparisonAnswer('<', problem.answer));
        document.getElementById('compare-equal').addEventListener('click', () => handleComparisonAnswer('=', problem.answer));
        document.getElementById('compare-greater').addEventListener('click', () => handleComparisonAnswer('>', problem.answer));
    }
}

// 处理比较大小问题的答案
function handleComparisonAnswer(userAnswer, correctAnswer) {
    const currentPlayer = players[currentPlayerIndex];
    
    if (userAnswer === correctAnswer) {
        // 答对了
        eventMessageElement.textContent = `回答正确！${currentPlayer.name}额外前进1格。`;
        eventActionElement.innerHTML = '';
        
        setTimeout(() => {
            // 额外前进一格
            const oldPosition = currentPlayer.position;
            let newPosition = oldPosition + 1;
            
            // 确保不超过终点
            const totalCells = 100;
            if (newPosition >= totalCells - 1) {
                newPosition = totalCells - 1;
                // 玩家到达终点，游戏结束
                gameOver(currentPlayer);
                return;
            }
            
            // 更新玩家位置
            currentPlayer.position = newPosition;
            
            // 更新游戏状态
            updateGameStatus(`${currentPlayer.name}答对了问题，额外前进1格，从${oldPosition}移动到${newPosition}`);
            
            // 渲染玩家位置
            renderPlayers();
            
            // 事件结束，切换到下一个玩家
            eventInProgress = false;
            eventMessageElement.textContent = '';
            nextPlayer();
        }, 1500);
    } else {
        // 答错了
        eventMessageElement.textContent = `回答错误！正确答案是${correctAnswer}。${currentPlayer.name}后退1格。`;
        eventActionElement.innerHTML = '';
        
        setTimeout(() => {
            // 后退一格
            const oldPosition = currentPlayer.position;
            let newPosition = oldPosition - 1;
            
            // 确保不小于起点
            if (newPosition < 0) {
                newPosition = 0;
            }
            
            // 更新玩家位置
            currentPlayer.position = newPosition;
            
            // 更新游戏状态
            updateGameStatus(`${currentPlayer.name}答错了问题，后退1格，从${oldPosition}移动到${newPosition}`);
            
            // 渲染玩家位置
            renderPlayers();
            
            // 事件结束，切换到下一个玩家
            eventInProgress = false;
            eventMessageElement.textContent = '';
            nextPlayer();
        }, 2000);
    }
}

// 游戏结束
function gameOver(winner) {
    gameStarted = false;
    rollDiceButton.disabled = true;
    
    updateGameStatus(`游戏结束！${winner.name}获胜！`);
    
    // 显示重新开始按钮
    restartButton.disabled = false;
}

// 切换到下一个玩家
function nextPlayer() {
    if (!gameStarted) return;
    
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
    
    // 启用掷骰子按钮
    rollDiceButton.disabled = false;
}

// 更新当前玩家显示
function updateCurrentPlayer() {
    if (players.length > 0) {
        const currentPlayer = players[currentPlayerIndex];
        currentPlayerElement.textContent = `当前玩家: ${currentPlayer.name}`;
        
        // 更新玩家信息区域的活跃状态
        const playerInfoElements = document.querySelectorAll('.player-info');
        playerInfoElements.forEach((element, index) => {
            if (index === currentPlayerIndex) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        });
    }
}

// 更新游戏状态显示
function updateGameStatus(status) {
    gameStatusElement.textContent = status;
}

// 更新玩家信息显示
function updatePlayerInfo() {
    playerContainerElement.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerInfo = document.createElement('div');
        playerInfo.className = `player-info player-${player.id}`;
        playerInfo.style.backgroundColor = player.color;
        playerInfo.textContent = `${player.name}: 位置 ${player.position}`;
        
        if (index === currentPlayerIndex) {
            playerInfo.classList.add('active');
        }
        
        playerContainerElement.appendChild(playerInfo);
    });
}

// 渲染玩家位置
function renderPlayers() {
    // 清除所有玩家标记
    const playerTokens = document.querySelectorAll('.player-token');
    playerTokens.forEach(token => token.remove());
    
    // 更新玩家信息
    updatePlayerInfo();
    
    // 添加玩家标记到棋盘上
    players.forEach(player => {
        const cell = document.querySelector(`.cell[data-index="${player.position}"]`);
        if (cell) {
            const playerToken = document.createElement('div');
            playerToken.className = `player-token player-${player.id}`;
            playerToken.style.backgroundColor = player.color;
            
            // 如果有多个玩家在同一格，调整位置
            const existingTokens = cell.querySelectorAll('.player-token').length;
            if (existingTokens > 0) {
                const offset = existingTokens * 10;
                playerToken.style.transform = `translate(${offset}%, ${offset}%)`;
            }
            
            cell.appendChild(playerToken);
        }
    });
}

// 获取玩家颜色
function getPlayerColor(playerId) {
    const colors = {
        1: '#2196F3', // 蓝色
        2: '#F44336', // 红色
        3: '#4CAF50', // 绿色
        4: '#FFC107'  // 黄色
    };
    
    return colors[playerId] || '#9E9E9E';
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', init);