// 游戏变量
let BOARD_SIZE = 9; // 默认9x9数独棋盘
let BOX_WIDTH = 3; // 默认3x3宫格宽度
let BOX_HEIGHT = 3; // 默认3x3宫格高度

// 游戏状态变量
let gameStarted = false;
let gameOver = false;
let score = 0;
let selectedCell = null;
let notesMode = false;
let sudokuBoard = []; // 当前棋盘状态
let solution = []; // 完整解答
let originalBoard = []; // 初始棋盘（固定数字）
let cellStatus = []; // 单元格状态：null=未填写，true=填写正确，false=填写错误
let highlightEnabled = true; // 数字高亮提示开关

// 计时相关变量
let timeRemaining = 600; // 10分钟倒计时
let timeUsed = 0; // 用时计时器
let timerInterval = null;

// 获取DOM元素
let boardElement;
let scoreElement;
let timerElement;
let startButton;
let restartButton;
let checkButton;
let solveButton;
let backButton;
let difficultySelector;
let boardSizeSelector;
let numberPad;
let numberButtons;
let toggleRulesButton;
let rulesContent;
let notesButton;

// 初始化函数
function init() {
    console.log('初始化数独游戏');
    
    // 获取DOM元素
    boardElement = document.getElementById('sudoku-board');
    scoreElement = document.getElementById('score');
    timerElement = document.getElementById('timer');
    startButton = document.getElementById('start-btn');
    restartButton = document.getElementById('restart-btn');
    solveButton = document.getElementById('solve-btn');
    backButton = document.getElementById('back-btn');
    difficultySelector = document.getElementById('difficulty');
    boardSizeSelector = document.getElementById('board-size');
    numberPad = document.getElementById('number-pad');
    numberButtons = document.querySelectorAll('.number-btn');
    toggleRulesButton = document.getElementById('toggle-rules');
    rulesContent = document.getElementById('rules-content');
    notesButton = document.querySelector('.number-btn[data-number="notes"]');
    
    // 初始化事件监听器
    initializeEventListeners();
    
    // 设置棋盘大小变化监听
    boardSizeSelector.addEventListener('change', updateBoardSize);
    
    // 初始化棋盘大小
    updateBoardSize();
    
    // 创建空棋盘
    createEmptyBoard();
    
    // 默认渲染9x9棋盘
    renderBoard();
    
    // 调用初始化游戏函数，确保棋盘正确显示
    if (typeof initializeGame === 'function') {
        initializeGame();
    } else {
        console.error('initializeGame函数未定义');
    }
}

// 更新棋盘大小
function updateBoardSize() {
    const size = parseInt(boardSizeSelector.value);
    BOARD_SIZE = size;
    
    // 根据棋盘大小设置宫格大小
    if (size === 4) {
        // 4x4数独：2x2宫格
        BOX_WIDTH = 2;
        BOX_HEIGHT = 2;
    } else if (size === 6) {
        // 6x6数独：2x3宫格
        BOX_WIDTH = 2;
        BOX_HEIGHT = 3;
    } else {
        // 9x9数独：3x3宫格
        BOX_WIDTH = 3;
        BOX_HEIGHT = 3;
    }
    
    // 更新数字输入面板
    updateNumberPad();
    
    // 重新绑定数字按钮事件
    bindNumberButtonEvents();
    
    // 重新创建空棋盘
    createEmptyBoard();
}

// 更新数字输入面板
function updateNumberPad() {
    // 获取数字输入面板
    const numberPadContainer = document.getElementById('number-pad');
    if (!numberPadContainer) return;
    
    // 清空现有按钮
    const numberButtonsContainer = numberPadContainer.querySelector('.number-buttons');
    if (numberButtonsContainer) {
        numberButtonsContainer.innerHTML = '';
        
        // 添加数字按钮
        for (let i = 1; i <= BOARD_SIZE; i++) {
            const button = document.createElement('button');
            button.className = 'number-btn';
            button.dataset.number = i;
            button.textContent = i;
            numberButtonsContainer.appendChild(button);
        }
        
        // 添加特殊按钮
        const clearButton = document.createElement('button');
        clearButton.className = 'number-btn special';
        clearButton.dataset.number = 'clear';
        clearButton.textContent = '清除';
        numberButtonsContainer.appendChild(clearButton);
        
        const notesBtn = document.createElement('button');
        notesBtn.className = 'number-btn special';
        notesBtn.dataset.number = 'notes';
        notesBtn.textContent = '笔记';
        numberButtonsContainer.appendChild(notesBtn);
        
        // 更新按钮引用 - 使用let而不是const来允许重新赋值
        numberButtons = document.querySelectorAll('.number-btn');
        notesButton = document.querySelector('.number-btn[data-number="notes"]');
        
        // 重新绑定事件 - 移除此处的事件绑定，避免重复绑定
        // 事件绑定将在bindNumberButtonEvents中统一处理
    }
}

// 创建空棋盘
function createEmptyBoard() {
    boardElement.innerHTML = '';
    
    // 设置棋盘CSS变量
    boardElement.style.setProperty('--board-size', BOARD_SIZE);
    boardElement.style.setProperty('--box-width', BOX_WIDTH);
    boardElement.style.setProperty('--box-height', BOX_HEIGHT);
    
    // 根据棋盘大小添加类名
    boardElement.className = 'sudoku-board';
    boardElement.classList.add(`board-size-${BOARD_SIZE}`);
    
    // 创建数独棋盘
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 创建笔记容器
            const notesContainer = document.createElement('div');
            notesContainer.className = 'notes';
            
            // 创建笔记数字位置
            for (let i = 1; i <= BOARD_SIZE; i++) {
                const noteNumber = document.createElement('div');
                noteNumber.className = 'note-number';
                noteNumber.dataset.number = i;
                notesContainer.appendChild(noteNumber);
            }
            
            cell.appendChild(notesContainer);
            boardElement.appendChild(cell);
        }
    }
}

// 数字按钮点击处理函数
function handleNumberButtonClick(event) {
    if (!selectedCell || !gameStarted) return;
    
    const button = event.currentTarget;
    const number = button.dataset.number;
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    
    // 处理特殊按钮
    if (number === 'clear') {
        clearCell(row, col);
        return;
    }
    
    if (number === 'notes') {
        notesMode = !notesMode;
        button.classList.toggle('active');
        
        // 更新模式指示器
        const modeIndicator = document.querySelector('.mode-indicator');
        if (modeIndicator) {
            if (notesMode) {
                modeIndicator.textContent = '笔记模式';
                modeIndicator.classList.add('notes-active');
            } else {
                modeIndicator.textContent = '普通模式';
                modeIndicator.classList.remove('notes-active');
            }
        }
        return;
    }
    
    // 确保单元格不是固定的
    if (selectedCell.classList.contains('fixed')) {
        return; // 不能修改固定单元格
    }
    
    // 填入数字或笔记
    if (notesMode) {
        toggleNote(row, col, parseInt(number));
    } else {
        fillCell(row, col, parseInt(number));
    }
    
    // 确保数字输入后更新高亮
    if (highlightEnabled && !notesMode) {
        clearAllHighlights();
        highlightMatchingNumbers(parseInt(number));
    }
}

// 数字按钮容器点击事件处理函数（事件委托）
function handleNumberButtonContainerClick(event) {
    const button = event.target.closest('.number-btn');
    if (!button) return; // 如果点击的不是按钮，直接返回
    
    // 调用原有的按钮点击处理函数
    handleNumberButtonClick({
        currentTarget: button,
        target: button
    });
}

// 绑定数字按钮事件的函数
function bindNumberButtonEvents() {
    // 获取最新的数字按钮
    numberButtons = document.querySelectorAll('.number-btn');
    notesButton = document.querySelector('.number-btn[data-number="notes"]');
    
    // 先移除所有按钮的旧事件监听器
    numberButtons.forEach(button => {
        // 移除旧的事件监听器
        button.removeEventListener('click', handleNumberButtonClick);
    });
    
    // 使用事件委托，为数字按钮容器添加事件监听
    const numberButtonsContainer = document.querySelector('.number-buttons');
    if (numberButtonsContainer) {
        // 移除旧的事件监听器
        numberButtonsContainer.removeEventListener('click', handleNumberButtonContainerClick);
        // 添加新的事件监听器
        numberButtonsContainer.addEventListener('click', handleNumberButtonContainerClick);
    }
    
    // 为每个按钮单独添加事件 - 不再重复添加事件，避免事件重复触发
    // 改为完全依赖事件委托
    
    // 确保笔记按钮正确初始化
    if (notesButton) {
        notesButton.classList.remove('active');
        notesMode = false;
        
        // 更新模式指示器
        const modeIndicator = document.querySelector('.mode-indicator');
        if (modeIndicator) {
            modeIndicator.textContent = '普通模式';
            modeIndicator.classList.remove('notes-active');
        }
    }
    
    console.log('数字按钮事件已重新绑定');
}

// 初始化事件监听器
function initializeEventListeners() {
    // 点击页面其他区域隐藏数字输入面板
    document.addEventListener('click', (e) => {
        // 如果点击的不是棋盘单元格且不是数字输入面板内的元素，则隐藏数字输入面板
        if (!e.target.closest('.sudoku-cell') && !e.target.closest('#number-pad')) {
            numberPad.style.display = 'none';
        }
    });
    
    // 绑定数字按钮事件 - 添加一个单独的函数来处理数字按钮事件绑定
    bindNumberButtonEvents();
    
    // 创建模式指示器
    const numberPadTitle = document.querySelector('.number-pad-title');
    if (numberPadTitle) {
        // 检查是否已存在模式指示器
        let modeIndicator = numberPadTitle.querySelector('.mode-indicator');
        if (!modeIndicator) {
            modeIndicator = document.createElement('span');
            modeIndicator.className = 'mode-indicator';
            modeIndicator.textContent = '普通模式';
            numberPadTitle.appendChild(modeIndicator);
        }
    }
    
    // 使用HTML中已有的数字高亮开关，不再动态创建
    const highlightCheckbox = document.getElementById('highlight-toggle');
    if (!highlightCheckbox) {
        console.log('未找到数字高亮开关，将创建一个');
        // 如果HTML中没有高亮开关，才创建一个
        const highlightToggle = document.createElement('div');
        highlightToggle.className = 'highlight-toggle';
        highlightToggle.innerHTML = `
            <label class="toggle-switch">
                <input type="checkbox" id="highlight-toggle" checked>
                <span class="toggle-slider"></span>
            </label>
            <span>数字高亮</span>
        `;
        document.querySelector('.settings').appendChild(highlightToggle);
    }
    
    // 添加高亮开关事件监听
    if (highlightCheckbox) {
        highlightCheckbox.addEventListener('change', function() {
            highlightEnabled = this.checked;
            if (!highlightEnabled) {
                clearAllHighlights();
            } else if (selectedCell) {
                const row = parseInt(selectedCell.dataset.row);
                const col = parseInt(selectedCell.dataset.col);
                const number = sudokuBoard[row][col];
                if (number !== 0) {
                    highlightMatchingNumbers(number);
                }
            }
        });
    }

    
    // 棋盘单元格点击事件
    boardElement.addEventListener('click', (e) => {
        const cell = e.target.closest('.sudoku-cell');
        if (!cell || !gameStarted) return;
        
        // 取消之前选中的单元格
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
        
        // 选中当前单元格
        selectedCell = cell;
        selectedCell.classList.add('selected');
        
        // 获取单元格位置和数字
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const number = sudokuBoard[row][col];
        
        // 清除之前的高亮
        clearAllHighlights();
        
        // 如果单元格有数字且启用了高亮，高亮所有相同数字
        if (number !== 0 && highlightEnabled) {
            highlightMatchingNumbers(number);
        }
        
        // 如果不是固定数字且游戏未结束，显示数字输入面板
        if (!cell.classList.contains('fixed') && !gameOver) {
            numberPad.style.display = 'block';
            positionNumberPad(row, col);
        }
    });

    
    // 开始游戏按钮
    startButton.addEventListener('click', startGame);
    
    // 重新开始按钮
    restartButton.addEventListener('click', restartGame);
    
    // 检查答案功能已移除，因为游戏已实现实时检查
    
    // 显示答案按钮
    solveButton.addEventListener('click', function() {
        console.log('显示答案按钮被点击');
        showSolution();
    });
    
    // 返回按钮
    backButton.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    // 规则切换按钮
    toggleRulesButton.addEventListener('click', () => {
        if (rulesContent.style.display === 'none') {
            rulesContent.style.display = 'block';
            toggleRulesButton.textContent = '隐藏规则';
        } else {
            rulesContent.style.display = 'none';
            toggleRulesButton.textContent = '显示规则';
        }
    });
    
    // 键盘输入事件
    document.addEventListener('keydown', (e) => {
        if (!selectedCell || !gameStarted) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // 数字键1-9
        if (e.key >= '1' && e.key <= '9') {
            const number = parseInt(e.key);
            if (notesMode) {
                toggleNote(row, col, number);
            } else {
                fillCell(row, col, number);
                // 确保键盘输入也能触发高亮
                if (highlightEnabled && number !== 0) {
                    setTimeout(() => {
                        highlightMatchingNumbers(number);
                    }, 10);
                }
            }
        }
        
        // 删除键或退格键
        if (e.key === 'Delete' || e.key === 'Backspace') {
            clearCell(row, col);
            // 清除高亮
            clearAllHighlights();
        }
        
        // 方向键移动选择
        if (e.key.startsWith('Arrow')) {
            moveSelection(e.key);
            // 如果数字面板已显示，重新定位到新选中的单元格
            if (numberPad.style.display === 'block' && selectedCell) {
                positionNumberPad(parseInt(selectedCell.dataset.row), parseInt(selectedCell.dataset.col));
            }
            
            // 当选择移动到新单元格时，高亮相同数字
            if (selectedCell && highlightEnabled) {
                const newRow = parseInt(selectedCell.dataset.row);
                const newCol = parseInt(selectedCell.dataset.col);
                const number = sudokuBoard[newRow][newCol];
                if (number !== 0) {
                    clearAllHighlights();
                    highlightMatchingNumbers(number);
                }
            }
        }
    });   
}
// 开始游戏
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    scoreElement.textContent = score;
    
    // 获取难度和棋盘大小
    const difficulty = difficultySelector.value;
    const boardSize = parseInt(boardSizeSelector.value);
    
    // 生成数独
    const puzzle = generateSudoku(difficulty, boardSize);
    sudokuBoard = puzzle.board;
    solution = puzzle.solution;
    originalBoard = JSON.parse(JSON.stringify(sudokuBoard)); // 深拷贝初始棋盘
    
    // 初始化单元格状态
    cellStatus = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    
    // 渲染棋盘
    renderBoard();
    
    // 确保数字按钮事件正确绑定
    bindNumberButtonEvents();
    
    // 重置笔记模式
    notesMode = false;
    const notesBtn = document.querySelector('.number-btn[data-number="notes"]');
    if (notesBtn) {
        notesBtn.classList.remove('active');
    }
    
    // 更新模式指示器
    const modeIndicator = document.querySelector('.mode-indicator');
    if (modeIndicator) {
        modeIndicator.textContent = '普通模式';
        modeIndicator.classList.remove('notes-active');
    }
    
    // 开始计时
    startTimer();
    
    // 更新按钮状态
    startButton.disabled = true;
    restartButton.disabled = false;
    solveButton.disabled = false;
    
    // 禁用难度选择器和棋盘大小选择器
    difficultySelector.disabled = true;
    boardSizeSelector.disabled = true;
    
    // 隐藏任何可能显示的游戏状态信息
    const gameStatusElement = document.getElementById('game-status');
    if (gameStatusElement) {
        gameStatusElement.style.display = 'none';
    }
    
    console.log('游戏已开始，事件绑定完成');
}

// 重新开始游戏
function restartGame() {
    console.log('重新开始游戏');
    
    // 停止计时器
    clearInterval(timerInterval);
    
    // 重置游戏状态
    gameStarted = false;
    gameOver = false;
    score = 0;
    scoreElement.textContent = score;
    selectedCell = null;
    notesMode = false;
    
    // 重置计时器
    timeRemaining = 600;
    timeUsed = 0;
    updateTimerDisplay();
    
    // 重置棋盘
    createEmptyBoard();
    
    // 重置按钮状态
    startButton.disabled = false;
    restartButton.disabled = true;
    solveButton.disabled = true;
    
    // 启用难度选择器和棋盘大小选择器
    difficultySelector.disabled = false;
    boardSizeSelector.disabled = false;
    
    // 取消笔记模式
    notesMode = false;
    const notesBtn = document.querySelector('.number-btn[data-number="notes"]');
    if (notesBtn) {
        notesBtn.classList.remove('active');
    }
    
    // 更新模式指示器
    const modeIndicator = document.querySelector('.mode-indicator');
    if (modeIndicator) {
        modeIndicator.textContent = '普通模式';
        modeIndicator.classList.remove('notes-active');
    }
    
    // 隐藏游戏状态区域
    const gameStatusElement = document.getElementById('game-status');
    if (gameStatusElement) {
        gameStatusElement.style.display = 'none';
    }
    
    // 隐藏数字输入面板
    numberPad.style.display = 'none';
    
    // 清除所有高亮
    clearAllHighlights();
}

// 渲染棋盘
function renderBoard() {
    // 保存当前选中单元格的数字，用于后续重新高亮
    let selectedNumber = null;
    if (selectedCell && highlightEnabled) {
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        selectedNumber = sudokuBoard[row][col];
    }
    
    // 清除所有高亮，避免高亮状态混乱
    clearAllHighlights();
    
    const cells = document.querySelectorAll('.sudoku-cell');
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const index = row * BOARD_SIZE + col;
            const cell = cells[index];
            const value = sudokuBoard[row][col];
            
            // 清除之前的内容和类，但保留selected类
            const wasSelected = cell.classList.contains('selected');
            cell.textContent = '';
            cell.classList.remove('fixed', 'error', 'correct', 'conflict');
            if (wasSelected) {
                cell.classList.add('selected');
            }
            
            // 恢复笔记容器
            const notesContainer = cell.querySelector('.notes');
            if (!notesContainer) {
                const newNotesContainer = document.createElement('div');
                newNotesContainer.className = 'notes';
                
                for (let i = 1; i <= BOARD_SIZE; i++) {
                    const noteNumber = document.createElement('div');
                    noteNumber.className = 'note-number';
                    noteNumber.dataset.number = i;
                    newNotesContainer.appendChild(noteNumber);
                }
                
                cell.appendChild(newNotesContainer);
            } else {
                notesContainer.style.display = 'none';
                // 清除所有笔记
                const noteNumbers = notesContainer.querySelectorAll('.note-number');
                noteNumbers.forEach(note => note.textContent = '');
            }
            
            // 如果有数字，显示数字
            if (value !== 0) {
                cell.textContent = value;
                
                // 如果是原始数字，标记为固定
                if (originalBoard[row][col] !== 0) {
                    cell.classList.add('fixed');
                }
                
                // 根据状态添加样式
                if (cellStatus[row][col] === true) {
                    cell.classList.add('correct');
                } else if (cellStatus[row][col] === false) {
                    cell.classList.add('error');
                } else if (cellStatus[row][col] === 'solution') {
                    // 这是显示答案时填充的空白格
                    cell.classList.add('filled-solution');
                }
            }
        }
    }
    
    // 如果之前有选中的数字且高亮功能开启，重新应用高亮
    if (selectedNumber && selectedNumber !== 0 && highlightEnabled) {
        // 使用setTimeout确保DOM更新后再应用高亮
        setTimeout(() => {
            highlightMatchingNumbers(selectedNumber);
        }, 10);
    }
}

// 填入数字
function fillCell(row, col, number) {
    if (originalBoard[row][col] !== 0) return; // 不能修改固定数字
    
    // 更新棋盘数据
    sudokuBoard[row][col] = number;
    
    // 检查是否正确
    const isCorrect = number === solution[row][col];
    cellStatus[row][col] = isCorrect;
    
    // 如果不正确，检测冲突
    let conflictCells = [];
    if (!isCorrect && number !== 0) {
        // 检查同行冲突
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (c !== col && sudokuBoard[row][c] === number) {
                conflictCells.push({row: row, col: c});
            }
        }
        
        // 检查同列冲突
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (r !== row && sudokuBoard[r][col] === number) {
                conflictCells.push({row: r, col: col});
            }
        }
        
        // 检查同宫格冲突
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && sudokuBoard[r][c] === number) {
                    conflictCells.push({row: r, col: c});
                }
            }
        }
    }
    
    // 更新分数
    if (isCorrect) {
        score += 10;
    } else {
        score = Math.max(0, score - 5);
    }
    scoreElement.textContent = score;
    
    // 渲染棋盘
    renderBoard();
    
    // 重新选中单元格
    const cells = document.querySelectorAll('.sudoku-cell');
    const index = row * BOARD_SIZE + col;
    selectedCell = cells[index];
    selectedCell.classList.add('selected');
    
    // 隐藏数字输入面板
    numberPad.style.display = 'none';
    
    // 高亮相同数字 - 确保在渲染棋盘后执行
    if (highlightEnabled && number !== 0) {
        clearAllHighlights();
        // 确保延迟一下执行高亮，让渲染完成
        setTimeout(() => {
            highlightMatchingNumbers(number);
        }, 10);
    }
    
    // 如果有冲突，标记冲突单元格
    if (conflictCells.length > 0) {
        setTimeout(() => {
            // 标记当前单元格为冲突
            cells[index].classList.add('conflict');
            
            // 标记所有冲突的单元格
            conflictCells.forEach(cell => {
                const conflictIndex = cell.row * BOARD_SIZE + cell.col;
                cells[conflictIndex].classList.add('conflict');
            });
        }, 20);
    }
    
    // 检查是否完成
    checkCompletion();
}

// 清除单元格
function clearCell(row, col) {
    if (originalBoard[row][col] !== 0) return; // 不能修改固定数字
    
    // 更新棋盘数据
    sudokuBoard[row][col] = 0;
    cellStatus[row][col] = null;
    
    // 渲染棋盘
    renderBoard();
    
    // 重新选中单元格
    const cells = document.querySelectorAll('.sudoku-cell');
    const index = row * BOARD_SIZE + col;
    selectedCell = cells[index];
    selectedCell.classList.add('selected');
    
    // 显示笔记容器
    const notesContainer = selectedCell.querySelector('.notes');
    if (notesContainer) {
        notesContainer.style.display = 'grid';
    }
    
    // 清除所有高亮
    clearAllHighlights();
    
    // 隐藏数字输入面板
    numberPad.style.display = 'none';
}

// 切换笔记
function toggleNote(row, col, number) {
    if (sudokuBoard[row][col] !== 0) return; // 如果已经填入数字，不能添加笔记
    
    const cells = document.querySelectorAll('.sudoku-cell');
    const index = row * BOARD_SIZE + col;
    const cell = cells[index];
    
    const notesContainer = cell.querySelector('.notes');
    if (!notesContainer) return;
    
    // 显示笔记容器并添加高亮效果
    notesContainer.style.display = 'grid';
    cell.classList.add('notes-active');
    
    // 找到对应数字的笔记
    const noteNumber = notesContainer.querySelector(`.note-number[data-number="${number}"]`);
    if (!noteNumber) return;
    
    // 切换笔记
    if (noteNumber.textContent === '') {
        noteNumber.textContent = number;
        // 添加动画效果
        noteNumber.classList.add('note-added');
        setTimeout(() => {
            noteNumber.classList.remove('note-added');
        }, 300);
    } else {
        noteNumber.textContent = '';
    }
    
    // 检查是否所有笔记都为空，如果是则移除高亮效果
    const hasNotes = Array.from(notesContainer.querySelectorAll('.note-number')).some(note => note.textContent !== '');
    if (!hasNotes) {
        cell.classList.remove('notes-active');
    }
}

// 移动选择
function moveSelection(direction) {
    if (!selectedCell) return;
    
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    let newRow = row;
    let newCol = col;
    
    switch (direction) {
        case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
        case 'ArrowDown':
            newRow = Math.min(BOARD_SIZE - 1, row + 1);
            break;
        case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
        case 'ArrowRight':
            newCol = Math.min(BOARD_SIZE - 1, col + 1);
            break;
    }
    
    // 如果位置变化，选择新单元格
    if (newRow !== row || newCol !== col) {
        selectedCell.classList.remove('selected');
        const cells = document.querySelectorAll('.sudoku-cell');
        const index = newRow * BOARD_SIZE + newCol;
        selectedCell = cells[index];
        selectedCell.classList.add('selected');
    }
}

// 显示游戏状态信息
function showGameStatus(type, message, showButtons = true) {
    console.log('更新游戏状态区域');
    
    const gameStatusElement = document.getElementById('game-status');
    
    // 设置内容
    let content = `<div><p>${message}</p>`;
    
    // 添加按钮（如果需要）
    if (showButtons) {
        content += `
            <div class="game-status-buttons">
                <button id="play-again-status-btn">再玩一次</button>
                <button id="back-to-menu-status-btn">返回菜单</button>
            </div>
        `;
    }
    
    content += '</div>';
    gameStatusElement.innerHTML = content;
    
    // 显示游戏状态区域并设置样式
    gameStatusElement.style.display = 'block';
    gameStatusElement.className = `game-status ${type}`; // type可以是success, error, info
    
    // 如果有按钮，添加事件监听器
    if (showButtons) {
        const playAgainBtn = document.getElementById('play-again-status-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-status-btn');
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                gameStatusElement.style.display = 'none';
                restartGame();
                startGame();
            });
        }
        
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                window.location.href = '../index.html';
            });
        }
    }
    
    console.log('游戏状态区域已更新');
}

// 检查答案
function checkSolution() {
    if (!gameStarted) return;
    
    let allCorrect = true;
    let emptyCount = 0;
    let wrongCount = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (sudokuBoard[row][col] !== 0) {
                const isCorrect = sudokuBoard[row][col] === solution[row][col];
                cellStatus[row][col] = isCorrect;
                
                if (!isCorrect) {
                    allCorrect = false;
                    wrongCount++;
                }
            } else if (sudokuBoard[row][col] === 0) {
                allCorrect = false;
                emptyCount++;
            }
        }
    }
    
    // 渲染棋盘
    renderBoard();
    
    // 显示检查结果
    if (allCorrect) {
        gameVictory();
    } else {
        let message = '';
        if (emptyCount > 0) {
            message = `还有 ${emptyCount} 个空格未填写。`;
        }
        if (wrongCount > 0) {
            message += `有 ${wrongCount} 个数字填写错误。`;
        }
        // 使用游戏状态区域显示消息，而不是弹窗
        showGameStatus('error', message, false);
        
        // 3秒后自动隐藏状态消息
        setTimeout(() => {
            const gameStatusElement = document.getElementById('game-status');
            if (gameStatusElement) {
                gameStatusElement.style.display = 'none';
            }
        }, 3000);
    }
}

// 显示答案
function showSolution() {
    console.log('showSolution函数被调用');
    
    if (!gameStarted && !gameOver) {
        console.log('游戏未开始，无法显示答案');
        showGameStatus('info', '请先开始游戏，然后才能显示答案', false);
        setTimeout(() => {
            const gameStatusElement = document.getElementById('game-status');
            if (gameStatusElement) {
                gameStatusElement.style.display = 'none';
            }
        }, 3000);
        return;
    }
    
    // 不再使用confirm弹窗，直接显示答案
    console.log('开始处理显示答案逻辑');
    console.log('当前解答状态:', solution);
    
    // 首先确保停止计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log('计时器已停止');
    }
    
    // 游戏结束
    gameOver = true;
    
    // 初始化计数变量
    let wrongCount = 0;
    let correctCount = 0;
    let cellScore = 0;
    let timeBonus = 0;
    let finalScore = 0;
    
    // 标记错误的单元格并填入正确答案
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // 如果单元格已填写但不正确，标记为错误
            if (sudokuBoard[row][col] !== 0 && sudokuBoard[row][col] !== solution[row][col]) {
                cellStatus[row][col] = false;
                wrongCount++;
            } else if (sudokuBoard[row][col] !== 0 && sudokuBoard[row][col] === solution[row][col] && originalBoard[row][col] === 0) {
                // 用户填写的正确数字
                correctCount++;
                cellStatus[row][col] = true;
            } else if (originalBoard[row][col] === 0) {
                // 这是一个需要填充的空白格，标记为solution
                cellStatus[row][col] = 'solution';
            }
            // 对于原始数字（fixed cells），保持cellStatus为null，以保持原有样式
            // 填入正确答案
            sudokuBoard[row][col] = solution[row][col];
        }
    }
    
    console.log(`找到 ${wrongCount} 个错误填写的单元格，${correctCount} 个正确填写的单元格`);
    
    // 游戏结束
    gameOver = true;
    gameStarted = false; // 确保游戏状态为未开始，防止其他操作
    
    // 渲染棋盘显示答案
    renderBoard();
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 显示游戏结束状态
    showGameStatus('info', '游戏结束，已显示完整答案。点击"开始游戏"重新开始。', true);
    
    // 更新按钮状态
    startButton.disabled = false;
    restartButton.disabled = false;
    solveButton.disabled = true;
    
    // 启用难度选择器和棋盘大小选择器
    difficultySelector.disabled = false;
    boardSizeSelector.disabled = false;
    
    // 立即渲染棋盘显示答案
    console.log('开始渲染棋盘显示答案');
    renderBoard();
    
    // 更新计时器显示
    updateTimerDisplay();
    
    // 禁用所有交互
    disableInteraction(wrongCount, correctCount, cellScore, timeBonus, finalScore);
    
    console.log('答案显示完成');
}

// 禁用游戏交互
function disableInteraction(wrongCount, correctCount, cellScore, timeBonus, finalScore) {
    // 隐藏数字输入面板
    if (numberPad) {
        numberPad.style.display = 'none';
    }
    
    // 禁用棋盘单元格点击
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => {
        cell.classList.add('disabled');
    });
    
    // 禁用相关按钮
    if (solveButton) solveButton.disabled = true;
    
    // 启用重新开始按钮
    if (restartButton) restartButton.disabled = false;
    
    // 创建结算画面
    const gameStatusElement = document.getElementById('game-status');
    if (!gameStatusElement) return;
    
    gameStatusElement.innerHTML = '';
    gameStatusElement.style.display = 'block';
    
    // 使用传入的参数，如果未传入则使用默认值
    wrongCount = wrongCount || 0;
    correctCount = correctCount || 0;
    cellScore = cellScore || 0;
    timeBonus = timeBonus || 0;
    finalScore = finalScore || 0;
    
    // 创建结算内容
    const settlementDiv = document.createElement('div');
    settlementDiv.className = 'settlement-screen';
    settlementDiv.innerHTML = `
        <h2>游戏结束 - 查看答案</h2>
        <div class="settlement-details">
            <div class="settlement-item">
                <span>正确填写格子：</span>
                <span>${correctCount} 个</span>
                <span>+${cellScore} 分</span>
            </div>
            <div class="settlement-item">
                <span>错误填写格子：</span>
                <span>${wrongCount} 个</span>
            </div>
            <div class="settlement-item">
                <span>剩余时间：</span>
                <span>${formatTime(timeRemaining)}</span>
                <span>+${timeBonus} 分</span>
            </div>
            <div class="settlement-item total-score">
                <span>最终得分：</span>
                <span>${finalScore} 分</span>
            </div>
            <div class="settlement-item">
                <span>用时：</span>
                <span>${formatTime(timeUsed)}</span>
            </div>
        </div>
        <button id="close-settlement" class="btn">确定</button>
    `;
    
    gameStatusElement.appendChild(settlementDiv);
    
    // 添加关闭结算画面的事件
    document.getElementById('close-settlement').addEventListener('click', function() {
        gameStatusElement.style.display = 'none';
    });
    
    // 在游戏状态区域显示简短结果
    let message = '已显示完整答案';
    if (wrongCount > 0) {
        message += `，您有 ${wrongCount} 个数字填写错误（标记为红色）。`;
    }
    
    // 使用通用的游戏状态显示函数
    showGameStatus('info', message, false);
    
    console.log('游戏状态区域已更新');
}

// 检查是否完成
function checkCompletion() {
    let complete = true;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // 检查是否有空格或填写错误的格子
            if (sudokuBoard[row][col] === 0 || sudokuBoard[row][col] !== solution[row][col]) {
                complete = false;
                break;
            }
        }
        if (!complete) break;
    }
    
    if (complete) {
        // 所有格子都填写正确，触发胜利
        gameVictory();
    }
}

// 高亮所有匹配的数字
function highlightMatchingNumbers(number) {
    if (!number || number === 0) {
        console.log('高亮函数收到无效数字，取消高亮');
        return;
    }
    
    // 先清除所有高亮，确保没有残留的高亮效果
    clearAllHighlights();
    
    const cells = document.querySelectorAll('.sudoku-cell');
    let highlightCount = 0;
    
    // 遍历所有单元格，找到匹配的数字并添加高亮样式
    // 无论是固定数字还是用户输入的数字，只要值相同就高亮
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (sudokuBoard[row][col] === number) {
                const index = row * BOARD_SIZE + col;
                cells[index].classList.add('highlight-same');
                highlightCount++;
            }
        }
    }
    
    // 确保高亮样式被应用
    console.log(`高亮数字 ${number}，找到 ${highlightCount} 个匹配，DOM中有 ${document.querySelectorAll('.highlight-same').length} 个高亮元素`);
    
    // 如果没有找到匹配的单元格，可能是数据与DOM不同步
    if (highlightCount === 0) {
        console.warn('没有找到匹配的数字，可能是数据与DOM不同步');
    }
}

// 清除所有高亮
function clearAllHighlights() {
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => {
        cell.classList.remove('highlight-same');
    });
}

// 游戏胜利
function gameVictory() {
    gameOver = true;
    clearInterval(timerInterval);
    
    // 计算格子正确数得分
    let correctCellCount = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (sudokuBoard[row][col] === solution[row][col] && originalBoard[row][col] === 0) {
                correctCellCount++;
            }
        }
    }
    
    // 计算最终得分：格子正确数得分 + 时间奖励分
    const cellScore = correctCellCount * 10; // 每个正确格子10分
    const timeBonus = timeRemaining * 5; // 每剩余1秒得5分
    const finalScore = cellScore + timeBonus;
    score = finalScore;
    scoreElement.textContent = score;
    
    // 添加胜利动画
    boardElement.classList.add('victory-animation');
    
    // 创建结算画面
    const gameStatusElement = document.getElementById('game-status');
    gameStatusElement.innerHTML = '';
    gameStatusElement.style.display = 'block';
    
    // 创建结算内容
    const settlementDiv = document.createElement('div');
    settlementDiv.className = 'settlement-screen';
    settlementDiv.innerHTML = `
        <h2>恭喜你！成功完成了数独！</h2>
        <div class="settlement-details">
            <div class="settlement-item">
                <span>正确填写格子：</span>
                <span>${correctCellCount} 个</span>
                <span>+${cellScore} 分</span>
            </div>
            <div class="settlement-item">
                <span>剩余时间：</span>
                <span>${formatTime(timeRemaining)}</span>
                <span>+${timeBonus} 分</span>
            </div>
            <div class="settlement-item total-score">
                <span>最终得分：</span>
                <span>${finalScore} 分</span>
            </div>
            <div class="settlement-item">
                <span>用时：</span>
                <span>${formatTime(timeUsed)}</span>
            </div>
        </div>
        <button id="close-settlement" class="btn">确定</button>
    `;
    
    gameStatusElement.appendChild(settlementDiv);
    
    // 添加关闭结算画面的事件
    document.getElementById('close-settlement').addEventListener('click', function() {
        gameStatusElement.style.display = 'none';
    });
    
    // 使用通用的游戏状态显示函数也保留一个简单提示
    showGameStatus('success', `恭喜你！成功完成了数独！最终得分：${finalScore}分`, false);
}

// 显示游戏结束弹窗
function showGameOverModal(title, message) {
    console.log('创建游戏结束模态框');
    
    // 检查是否已存在模态框，如果存在则先移除
    const existingModal = document.querySelector('.game-over-modal');
    if (existingModal) {
        console.log('移除已存在的模态框');
        document.body.removeChild(existingModal);
    }
    
    const modal = document.createElement('div');
    modal.className = 'game-over-modal';
    modal.style.display = 'flex'; // 确保模态框可见
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    
    content.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
        <button id="play-again-btn">再玩一次</button>
        <button id="back-to-menu-btn">返回菜单</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    console.log('模态框已添加到DOM');
    
    // 确保事件监听器绑定在正确的位置
    setTimeout(() => {
        const playAgainBtn = document.getElementById('play-again-btn');
        const backToMenuBtn = document.getElementById('back-to-menu-btn');
        
        if (playAgainBtn) {
            console.log('绑定再玩一次按钮事件');
            playAgainBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                restartGame();
                startGame();
            });
        }
        
        if (backToMenuBtn) {
            console.log('绑定返回菜单按钮事件');
            backToMenuBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                window.location.href = '../index.html';
            });
        }
    }, 100);
    
    // 添加按钮事件
    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        restartGame();
        startGame();
    });
    
    document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}

// 开始计时
function startTimer() {
    // 重置计时器
    timeRemaining = 600; // 10分钟
    timeUsed = 0;
    updateTimerDisplay();
    
    // 清除之前的计时器
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // 设置新计时器
    timerInterval = setInterval(() => {
        timeRemaining--;
        timeUsed++;
        updateTimerDisplay();
        
        // 时间到
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            gameOver = true;
            showGameOverModal('时间到！', `游戏结束<br>得分：${score}`);
        }
    }, 1000);
}

// 更新计时器显示
function updateTimerDisplay() {
    timerElement.textContent = `时间: ${formatTime(timeRemaining)}`;
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// 定位数字输入面板
function positionNumberPad(row, col) {
    // 获取棋盘和单元格的位置信息
    const boardRect = boardElement.getBoundingClientRect();
    
    // 计算单元格的大小和位置
    const cellWidth = boardRect.width / BOARD_SIZE;
    const cellHeight = boardRect.height / BOARD_SIZE;
    
    // 计算选中单元格的中心位置
    const cellCenterX = boardRect.left + (col + 0.5) * cellWidth;
    const cellCenterY = boardRect.top + (row + 0.5) * cellHeight;
    
    // 获取数字面板的尺寸
    const numberPadWidth = numberPad.offsetWidth || 300; // 默认宽度
    const numberPadHeight = numberPad.offsetHeight || 200; // 默认高度
    
    // 计算数字面板的位置，优先显示在单元格的下方
    let left = cellCenterX - numberPadWidth / 2;
    let top = cellCenterY + cellHeight / 2;
    
    // 检查是否超出窗口右边界
    if (left + numberPadWidth > window.innerWidth) {
        left = window.innerWidth - numberPadWidth - 10;
    }
    
    // 检查是否超出窗口左边界
    if (left < 10) {
        left = 10;
    }
    
    // 如果下方空间不足，则显示在单元格上方
    if (top + numberPadHeight > window.innerHeight - 10) {
        top = cellCenterY - numberPadHeight - cellHeight / 2;
    }
    
    // 如果上方也没有足够空间，则尽量居中显示
    if (top < 10) {
        top = Math.max(10, (window.innerHeight - numberPadHeight) / 2);
    }
    
    // 确保数字面板不会被游戏容器的其他元素遮挡
    const controlsElement = document.querySelector('.controls');
    if (controlsElement) {
        const controlsRect = controlsElement.getBoundingClientRect();
        // 如果数字面板会遮挡控制按钮，则调整位置
        if (top + numberPadHeight > controlsRect.top && top < controlsRect.bottom) {
            // 尝试将数字面板放在单元格上方
            top = cellCenterY - numberPadHeight - cellHeight / 2;
            // 如果上方空间不足，则尝试放在一侧
            if (top < 10) {
                // 尝试放在右侧
                if (cellCenterX + numberPadWidth + 10 < window.innerWidth) {
                    left = cellCenterX + cellWidth / 2;
                    top = cellCenterY - numberPadHeight / 2;
                }
                // 否则放在左侧
                else if (cellCenterX - numberPadWidth - 10 > 0) {
                    left = cellCenterX - numberPadWidth - cellWidth / 2;
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);