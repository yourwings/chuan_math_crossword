// 游戏变量
let BOARD_SIZE = 4; // 默认4x4华容道棋盘
let boardElement;
let movesElement;
let timerElement;
let gameStatusElement;
let startButton;
let restartButton;
let hintButton;
let backButton;
let boardSizeSelector;
let toggleRulesButton;
let rulesContent;

// 游戏状态变量
let gameStarted = false;
let gameOver = false;
let moves = 0;
let timeUsed = 0;
let timerInterval = null;
let puzzleBoard = [];
let solution = [];
let solutionIndex = 0;
let emptyCell = { row: 0, col: 0 };
let hintsRemaining = 10; // 每局游戏的提示次数限制

// 初始化函数
function init() {
    console.log('初始化数字华容道游戏');
    
    // 获取DOM元素
    boardElement = document.getElementById('puzzle-board');
    movesElement = document.getElementById('moves');
    timerElement = document.getElementById('timer');
    gameStatusElement = document.getElementById('game-status');
    startButton = document.getElementById('start-btn');
    restartButton = document.getElementById('restart-btn');
    hintButton = document.getElementById('hint-btn');
    backButton = document.getElementById('back-btn');
    boardSizeSelector = document.getElementById('board-size');
    toggleRulesButton = document.getElementById('toggle-rules');
    rulesContent = document.getElementById('rules-content');
    
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    hintButton.addEventListener('click', showHint);
    backButton.addEventListener('click', () => window.location.href = '../index.html');
    boardSizeSelector.addEventListener('change', updateBoardSize);
    toggleRulesButton.addEventListener('click', toggleRules);
    
    // 初始化游戏设置
    updateBoardSize();
    
    // 初始状态设置
    restartButton.disabled = true;
    hintButton.classList.add('hidden');
}

// 更新棋盘大小
function updateBoardSize() {
    BOARD_SIZE = parseInt(boardSizeSelector.value);
    console.log(`设置棋盘大小为 ${BOARD_SIZE}x${BOARD_SIZE}`);
    
    // 重置游戏状态
    if (gameStarted) {
        stopTimer();
        gameStarted = false;
    }
    
    // 更新UI
    startButton.disabled = false;
    restartButton.disabled = true;
    hintButton.classList.add('hidden');
    movesElement.textContent = '0';
    timerElement.textContent = '时间: 00:00';
    gameStatusElement.textContent = '';
    
    // 创建空棋盘
    createEmptyBoard();
}

// 创建空棋盘 - 优化版本，减少DOM操作
function createEmptyBoard() {
    console.time('createEmptyBoard'); // 性能监控开始
    
    // 清空棋盘
    boardElement.innerHTML = '';
    
    // 设置棋盘网格
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
    
    // 计算单元格大小
    const cellSize = Math.min(350, window.innerWidth - 40) / BOARD_SIZE;
    
    // 使用DocumentFragment减少DOM重排
    const fragment = document.createDocumentFragment();
    
    // 创建单元格
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'puzzle-cell empty';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${cellSize / 2}px`;
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // 设置单元格内容为空
            cell.textContent = '';
            
            fragment.appendChild(cell);
        }
    }
    
    // 一次性将所有单元格添加到DOM
    boardElement.appendChild(fragment);
    
    console.timeEnd('createEmptyBoard'); // 性能监控结束
}

// 开始游戏 - 优化版本，使用性能监控和延迟加载
function startGame() {
    console.time('startGame'); // 性能监控开始
    console.log('开始游戏');
    gameStarted = true;
    gameOver = false;
    moves = 0;
    timeUsed = 0;
    solutionIndex = 0;
    solution = [];
    hintsRemaining = 3; // 重置提示次数
    
    // 更新UI
    movesElement.textContent = moves;
    gameStatusElement.textContent = '';
    startButton.disabled = true;
    restartButton.disabled = false;
    hintButton.classList.remove('hidden');
    
    // 显示加载提示
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.textContent = '正在生成拼图...';
    loadingMessage.style.position = 'absolute';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    loadingMessage.style.padding = '10px 20px';
    loadingMessage.style.borderRadius = '5px';
    loadingMessage.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    loadingMessage.style.zIndex = '100';
    document.querySelector('.game-container').appendChild(loadingMessage);
    
    // 使用requestAnimationFrame确保UI更新
    requestAnimationFrame(() => {
        // 使用setTimeout让UI有时间更新
        setTimeout(() => {
            // 生成随机拼图
            generatePuzzle();
            
            // 开始计时
            startTimer();
            
            // 添加单元格点击事件
            addCellClickEvents();
            
            // 移除加载提示
            document.querySelector('.game-container').removeChild(loadingMessage);
            
            console.timeEnd('startGame'); // 性能监控结束
        }, 10); // 短暂延迟，让UI有时间更新
    });
}

// 重新开始游戏
function restartGame() {
    stopTimer();
    startGame();
}

// 生成随机拼图
function generatePuzzle() {
    // 创建有序数组
    puzzleBoard = [];
    let numbers = [];
    
    for (let i = 1; i < BOARD_SIZE * BOARD_SIZE; i++) {
        numbers.push(i);
    }
    numbers.push(0); // 0 表示空白格
    
    // 随机打乱数组 - 使用更高效的方法
    // 避免重复检查可解性，而是生成一个保证可解的拼图
    let flatBoard = generateSolvablePuzzle(numbers);
    
    // 将一维数组转换为二维数组 - 只做一次转换
    puzzleBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        let row = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            const value = flatBoard[i * BOARD_SIZE + j];
            row.push(value);
            if (value === 0) {
                emptyCell = { row: i, col: j };
            }
        }
        puzzleBoard.push(row);
    }
    
    // 更新UI
    updateBoardUI();
    
    // 计算解决方案
    calculateSolution();
}

// 检查拼图是否可解
function isSolvable(board) {
    // 将二维数组转换为一维数组
    let flatBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            flatBoard.push(board[i][j]);
        }
    }
    
    // 计算逆序数
    let inversions = 0;
    for (let i = 0; i < flatBoard.length - 1; i++) {
        if (flatBoard[i] === 0) continue;
        
        for (let j = i + 1; j < flatBoard.length; j++) {
            if (flatBoard[j] === 0) continue;
            
            if (flatBoard[i] > flatBoard[j]) {
                inversions++;
            }
        }
    }
    
    // 根据棋盘大小和空格位置判断是否可解
    if (BOARD_SIZE % 2 === 1) {
        // 奇数大小的棋盘，逆序数为偶数时可解
        return inversions % 2 === 0;
    } else {
        // 偶数大小的棋盘，逆序数加上空格所在行数（从下往上数）的奇偶性决定是否可解
        const emptyRowFromBottom = BOARD_SIZE - emptyCell.row;
        return (inversions + emptyRowFromBottom) % 2 === 1;
    }
}

// 随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 更新棋盘UI - 优化版本，减少DOM操作
function updateBoardUI() {
    // 使用DocumentFragment减少DOM重排次数
    const fragment = document.createDocumentFragment();
    const cells = boardElement.querySelectorAll('.puzzle-cell');
    
    // 批量更新前先清空棋盘
    while (boardElement.firstChild) {
        boardElement.removeChild(boardElement.firstChild);
    }
    
    // 一次性创建所有单元格
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const index = i * BOARD_SIZE + j;
            const cell = cells[index] || document.createElement('div');
            const value = puzzleBoard[i][j];
            
            // 设置单元格属性
            cell.className = 'puzzle-cell';
            if (value === 0) cell.classList.add('empty');
            
            // 检查是否在正确位置
            const correctValue = (i * BOARD_SIZE + j + 1) % (BOARD_SIZE * BOARD_SIZE);
            if (value === correctValue && value !== 0) {
                cell.classList.add('correct');
            }
            
            // 设置内容和数据属性
            cell.textContent = value === 0 ? '' : value;
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // 添加到文档片段
            fragment.appendChild(cell);
        }
    }
    
    // 一次性将所有单元格添加到DOM
    boardElement.appendChild(fragment);
    
    // 添加单元格点击事件
    if (gameStarted && !gameOver) {
        addCellClickEvents();
    }
}

// 添加单元格点击事件
function addCellClickEvents() {
    const cells = boardElement.querySelectorAll('.puzzle-cell');
    
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (!gameStarted || gameOver) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // 检查是否可以移动
            if (isAdjacent(row, col, emptyCell.row, emptyCell.col)) {
                moveCell(row, col);
                
                // 检查是否完成
                if (checkWin()) {
                    gameOver = true;
                    stopTimer();
                    gameStatusElement.textContent = '恭喜！你完成了拼图！';
                    hintButton.classList.add('hidden');
                }
            }
        });
    });
}

// 检查两个单元格是否相邻
function isAdjacent(row1, col1, row2, col2) {
    return (
        (Math.abs(row1 - row2) === 1 && col1 === col2) ||
        (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
}

// 移动单元格
function moveCell(row, col) {
    // 交换单元格值
    puzzleBoard[emptyCell.row][emptyCell.col] = puzzleBoard[row][col];
    puzzleBoard[row][col] = 0;
    
    // 更新空格位置
    emptyCell.row = row;
    emptyCell.col = col;
    
    // 更新移动次数
    moves++;
    movesElement.textContent = moves;
    
    // 更新UI
    updateBoardUI();
    
    // 重置提示
    solutionIndex = 0;
    solution = [];
    
    // 移除所有提示高亮
    const cells = boardElement.querySelectorAll('.puzzle-cell');
    cells.forEach(cell => cell.classList.remove('hint'));
}

// 检查是否完成
function checkWin() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const expectedValue = (i * BOARD_SIZE + j + 1) % (BOARD_SIZE * BOARD_SIZE);
            if (puzzleBoard[i][j] !== expectedValue) {
                return false;
            }
        }
    }
    return true;
}

// 开始计时器
function startTimer() {
    stopTimer();
    const startTime = Date.now() - timeUsed * 1000;
    
    timerInterval = setInterval(() => {
        timeUsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(timeUsed / 60);
        const seconds = timeUsed % 60;
        timerElement.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 停止计时器
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 切换规则显示
function toggleRules() {
    const isHidden = rulesContent.style.display === 'none';
    rulesContent.style.display = isHidden ? 'block' : 'none';
    toggleRulesButton.textContent = isHidden ? '隐藏规则' : '显示规则';
}

// 生成保证可解的拼图
function generateSolvablePuzzle(numbers) {
    // 复制数组以避免修改原始数组
    const result = [...numbers];
    
    // 随机打乱数组
    shuffleArray(result);
    
    // 计算逆序数
    let inversions = 0;
    for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === 0) continue;
        
        for (let j = i + 1; j < result.length; j++) {
            if (result[j] === 0) continue;
            
            if (result[i] > result[j]) {
                inversions++;
            }
        }
    }
    
    // 找到空格的位置
    const emptyIndex = result.indexOf(0);
    const emptyRowFromBottom = BOARD_SIZE - Math.floor(emptyIndex / BOARD_SIZE);
    
    // 检查是否可解
    let isSolvable;
    if (BOARD_SIZE % 2 === 1) {
        // 奇数大小的棋盘，逆序数为偶数时可解
        isSolvable = inversions % 2 === 0;
    } else {
        // 偶数大小的棋盘，逆序数加上空格所在行数（从下往上数）的奇偶性决定是否可解
        isSolvable = (inversions + emptyRowFromBottom) % 2 === 1;
    }
    
    // 如果不可解，交换两个数字使其可解
    if (!isSolvable) {
        // 找到两个不是空格的相邻数字进行交换
        for (let i = 0; i < result.length - 1; i++) {
            if (result[i] !== 0 && result[i+1] !== 0) {
                [result[i], result[i+1]] = [result[i+1], result[i]];
                break;
            }
        }
    }
    
    return result;
}

// A*算法计算最优解 - 延迟执行版本
function calculateSolution() {
    solution = []; // 重置解决方案
    
    // 如果已经解决，不需要计算
    if (checkWin()) return;
    
    // 使用requestIdleCallback或setTimeout延迟执行A*算法，避免阻塞UI
    setTimeout(() => {
        // 设置计算超时时间（毫秒）
        const timeoutDuration = 2000;
        const startTime = Date.now();
        
        // 创建优先队列
        let openSet = new PriorityQueue();
        let closedSet = new Map(); // 使用Map而不是Set以提高性能
        
        // 初始状态 - 使用更高效的状态表示
        const initialBoard = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            initialBoard.push(...puzzleBoard[i]);
        }
        
        const initialState = {
            board: initialBoard,
            emptyPos: emptyCell.row * BOARD_SIZE + emptyCell.col,
            moves: [],
            cost: 0
        };
        
        // 将初始状态加入开放集
        const initialHeuristic = heuristicOptimized(initialState.board);
        openSet.enqueue(initialState, initialState.cost + initialHeuristic);
        
        // 迭代加深搜索的最大深度 - 根据棋盘大小调整
        const maxDepth = Math.min(BOARD_SIZE * 5, 25); // 限制最大深度以提高性能
        let currentMaxDepth = Math.min(15, maxDepth);
        
        // A*搜索 - 迭代加深版本
        while (!openSet.isEmpty()) {
            // 检查是否超时
            if (Date.now() - startTime > timeoutDuration) {
                console.log('计算超时，返回部分解决方案');
                if (solution.length === 0 && !openSet.isEmpty()) {
                    // 如果没有找到完整解决方案，使用当前最佳状态的移动序列
                    const bestState = openSet.getBest();
                    if (bestState && bestState.moves.length > 0) {
                        solution = bestState.moves.slice(0, 5); // 只取前几步作为提示
                    }
                }
                return;
            }
        
        // 获取当前状态
        const current = openSet.dequeue();
        
        // 如果超过当前深度限制，跳过
        if (current.cost > currentMaxDepth) continue;
        
        // 检查是否达到目标
        if (isGoalStateOptimized(current.board)) {
            // 将一维数组移动转换为二维坐标
            solution = current.moves.map(pos => {
                return {
                    row: Math.floor(pos / BOARD_SIZE),
                    col: pos % BOARD_SIZE
                };
            });
            console.log(`找到解决方案，步骤数: ${solution.length}`);
            return;
        }
        
        // 将当前状态加入关闭集 - 使用更高效的键值存储
        const stateKey = current.board.join('');
        if (closedSet.has(stateKey)) continue;
        closedSet.set(stateKey, true);
        
        // 生成可能的移动 - 使用预计算的移动方向
        const possibleMoves = getPossibleMovesOptimized(current.emptyPos);
        
        // 限制每个状态的分支数，优先考虑更有希望的移动
        // 对于较大的棋盘，可以减少分支因子
        const maxBranches = BOARD_SIZE <= 3 ? 4 : 3;
        let processedMoves = 0;
        
        for (const newEmptyPos of possibleMoves) {
            // 限制分支数量以提高性能
            if (processedMoves >= maxBranches) break;
            processedMoves++;
            
            // 创建新状态 - 使用数组复用而不是创建新数组
            const newBoard = [...current.board];
            const valueToMove = newBoard[newEmptyPos];
            
            // 交换空格和移动的数字
            newBoard[current.emptyPos] = valueToMove;
            newBoard[newEmptyPos] = 0;
            
            // 检查是否已经访问过 - 使用更高效的键值存储
            const newStateKey = newBoard.join('');
            if (closedSet.has(newStateKey)) continue;
            
            // 创建新状态对象 - 避免不必要的数组复制
            const newState = {
                board: newBoard,
                emptyPos: newEmptyPos,
                moves: [...current.moves, newEmptyPos],
                cost: current.cost + 1
            };
            
            // 计算启发式值并加入开放集
            const h = heuristicOptimized(newBoard);
            openSet.enqueue(newState, newState.cost + h);
        }
        
        // 限制搜索状态数量，防止内存占用过大
        // 使用更小的阈值以提高响应性
        if (closedSet.size > 5000) {
            // 如果达到限制但深度较小，增加深度限制并重新开始
            if (currentMaxDepth < maxDepth) {
                currentMaxDepth = Math.min(currentMaxDepth + 5, maxDepth);
                console.log(`增加搜索深度至 ${currentMaxDepth}`);
                // 保留当前最佳状态
                if (!openSet.isEmpty()) {
                    const bestState = openSet.getBest();
                    openSet = new PriorityQueue();
                    openSet.enqueue(bestState, bestState.cost + heuristicOptimized(bestState.board));
                    closedSet = new Map(); // 使用Map而不是Set
                }
            } else {
                console.log('搜索状态数量过大，停止搜索');
                break;
            }
        }
    }
    
    console.log('未找到完整解决方案');
    // 如果没有找到解决方案但有部分探索，提供部分提示
    if (solution.length === 0 && !openSet.isEmpty()) {
        const bestState = openSet.getBest();
        if (bestState && bestState.moves.length > 0) {
            // 将一维数组移动转换为二维坐标
            solution = bestState.moves.slice(0, 3).map(pos => {
                return {
                    row: Math.floor(pos / BOARD_SIZE),
                    col: pos % BOARD_SIZE
                };
            });
        }
    }
}, 0); // 使用0延迟，让UI先渲染完成
}


// 获取可能的移动 - 优化版本，直接返回一维索引
function getPossibleMovesOptimized(emptyPos) {
    const row = Math.floor(emptyPos / BOARD_SIZE);
    const col = emptyPos % BOARD_SIZE;
    const moves = [];
    
    // 预先计算可能的移动方向，避免重复计算
    // 上
    if (row > 0) moves.push(emptyPos - BOARD_SIZE);
    // 下
    if (row < BOARD_SIZE - 1) moves.push(emptyPos + BOARD_SIZE);
    // 左
    if (col > 0) moves.push(emptyPos - 1);
    // 右
    if (col < BOARD_SIZE - 1) moves.push(emptyPos + 1);
    
    return moves;
}

// 启发式函数 - 曼哈顿距离（原始版本）
function heuristic(board) {
    let distance = 0;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const value = board[i][j];
            if (value !== 0) {
                // 计算当前位置与目标位置的曼哈顿距离
                const targetRow = Math.floor((value - 1) / BOARD_SIZE);
                const targetCol = (value - 1) % BOARD_SIZE;
                distance += Math.abs(i - targetRow) + Math.abs(j - targetCol);
            }
        }
    }
    
    return distance;
}

// 性能监控函数
function monitorPerformance(functionName, callback) {
    console.time(functionName);
    const result = callback();
    console.timeEnd(functionName);
    return result;
}

// 目标位置查找表 - 预计算以避免重复计算
const targetPositionsCache = new Map();

function getTargetPositions(size) {
    const cacheKey = `size_${size}`;
    if (targetPositionsCache.has(cacheKey)) {
        return targetPositionsCache.get(cacheKey);
    }
    
    const targetPositions = [];
    for (let i = 0; i < size * size; i++) {
        if (i === 0) {
            targetPositions.push(size * size - 1); // 空格的目标位置
        } else {
            targetPositions.push(i - 1); // 其他数字的目标位置
        }
    }
    
    targetPositionsCache.set(cacheKey, targetPositions);
    return targetPositions;
}

// 启发式函数 - 曼哈顿距离（高度优化版本 - 一维数组）
function heuristicOptimized(board) {
    let distance = 0;
    const size = BOARD_SIZE;
    
    // 使用缓存的查找表
    const targetPositions = getTargetPositions(size);
    
    // 使用更高效的循环和计算方式
    for (let i = 0; i < board.length; i++) {
        const value = board[i];
        if (value === 0) continue; // 跳过空格，提高效率
        
        // 计算当前位置与目标位置的曼哈顿距离
        const targetPos = targetPositions[value];
        const currentRow = Math.floor(i / size);
        const currentCol = i % size;
        const targetRow = Math.floor(targetPos / size);
        const targetCol = targetPos % size;
        
        // 曼哈顿距离
        distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
        
        // 线性冲突检测 - 仅在棋盘较小时使用，以提高性能
        if (size <= 4 && currentRow === targetRow) {
            // 检查同一行中的线性冲突 - 优化循环范围
            const rowStart = currentRow * size;
            const rowEnd = rowStart + size;
            
            for (let j = rowStart; j < rowEnd; j++) {
                if (j === i) continue; // 跳过自身
                
                const otherValue = board[j];
                if (otherValue === 0) continue; // 跳过空格
                
                const otherTargetPos = targetPositions[otherValue];
                const otherTargetRow = Math.floor(otherTargetPos / size);
                
                // 如果两个数字的目标行相同，且它们的相对顺序在当前状态和目标状态中相反
                if (otherTargetRow === targetRow && 
                    ((j > i && otherTargetPos < targetPos) || 
                     (j < i && otherTargetPos > targetPos))) {
                    distance += 2; // 增加冲突惩罚
                }
            }
        }
    }
    
    return distance;
}

// 检查是否达到目标状态（二维数组版本）
function isGoalState(board) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const expectedValue = (i * BOARD_SIZE + j + 1) % (BOARD_SIZE * BOARD_SIZE);
            if (board[i][j] !== expectedValue) {
                return false;
            }
        }
    }
    return true;
}

// 检查是否达到目标状态（一维数组优化版本）
function isGoalStateOptimized(board) {
    const size = BOARD_SIZE * BOARD_SIZE;
    for (let i = 0; i < size - 1; i++) {
        if (board[i] !== i + 1) {
            return false;
        }
    }
    return board[size - 1] === 0;
}

// 获取可能的移动（一维数组优化版本）
function getPossibleMovesOptimized(emptyPos) {
    const size = BOARD_SIZE;
    const row = Math.floor(emptyPos / size);
    const col = emptyPos % size;
    const moves = [];
    
    // 上
    if (row > 0) moves.push(emptyPos - size);
    // 下
    if (row < size - 1) moves.push(emptyPos + size);
    // 左
    if (col > 0) moves.push(emptyPos - 1);
    // 右
    if (col < size - 1) moves.push(emptyPos + 1);
    
    return moves;
}

// 将棋盘转换为字符串，用于状态比较
function boardToString(board) {
    return board.map(row => row.join(',')).join(';');
}

// 显示提示
function showHint() {
    // 检查游戏状态和提示次数
    if (!gameStarted || gameOver) {
        gameStatusElement.innerHTML = '<div style="width:100%;">游戏未开始或已结束</div>';
        return;
    }
    
    if (hintsRemaining <= 0) {
        gameStatusElement.innerHTML = '<div style="width:100%;">提示次数已用完</div>';
        return;
    }
    
    if (solution.length === 0) {
        // 如果没有计算解决方案，重新计算
        calculateSolution();
        if (solution.length === 0) {
            gameStatusElement.innerHTML = '<div style="width:100%;">无法提供提示</div>';
            return;
        }
    }
    
    // 减少提示次数
    hintsRemaining--;
    
    // 获取下一步移动
    const nextMove = solution[0];
    
    // 确保nextMove存在
    if (!nextMove) {
        gameStatusElement.innerHTML = '<div style="width:100%;">无法提供提示，请尝试移动几步后再使用提示</div>';
        return;
    }
    
    // 高亮提示单元格
    const cells = boardElement.querySelectorAll('.puzzle-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (row === nextMove.row && col === nextMove.col) {
            cell.classList.add('hint');
            console.log(`添加提示高亮到单元格 [${row}, ${col}]`);
        } else {
            cell.classList.remove('hint');
        }
    });
    
    // 确保提示可见
    setTimeout(() => {
        const hintCell = document.querySelector('.puzzle-cell.hint');
        if (hintCell) {
            console.log('提示单元格样式:', window.getComputedStyle(hintCell).backgroundColor);
        }
    }, 100);
    
    gameStatusElement.innerHTML = `<div style="width:100%;">提示: 点击高亮的方块 (剩余提示: ${hintsRemaining})</div>`;
}

// 优先队列实现（优化版本）
class PriorityQueue {
    constructor() {
        this.elements = [];
    }
    
    enqueue(element, priority) {
        this.elements.push({ element, priority });
        // 使用二分插入排序而不是完全排序，提高性能
        this._sortInsert(this.elements.length - 1);
    }
    
    // 二分插入排序辅助函数
    _sortInsert(index) {
        if (index === 0) return;
        
        const item = this.elements[index];
        let low = 0;
        let high = index - 1;
        
        // 二分查找插入位置
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (this.elements[mid].priority > item.priority) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        
        // 移动元素并插入
        if (low < index) {
            const itemToInsert = this.elements[index];
            this.elements.splice(index, 1);
            this.elements.splice(low, 0, itemToInsert);
        }
    }
    
    dequeue() {
        if (this.isEmpty()) return null;
        return this.elements.shift().element;
    }
    
    // 获取最佳状态但不移除它
    getBest() {
        if (this.isEmpty()) return null;
        return this.elements[0].element;
    }
    
    isEmpty() {
        return this.elements.length === 0;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', init);