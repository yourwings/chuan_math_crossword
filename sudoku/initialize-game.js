// 初始化游戏模块

// 初始化游戏函数
function initializeGame() {
    console.log('初始化数独游戏模块');
    
    // 获取当前棋盘大小
    const boardSizeSelector = document.getElementById('board-size');
    const boardSize = parseInt(boardSizeSelector.value);
    
    // 根据棋盘大小设置宫格大小
    let boxWidth, boxHeight;
    if (boardSize === 4) {
        // 4x4数独：2x2宫格
        boxWidth = 2;
        boxHeight = 2;
    } else if (boardSize === 6) {
        // 6x6数独：2x3宫格
        boxWidth = 2;
        boxHeight = 3;
    } else {
        // 9x9数独：3x3宫格
        boxWidth = 3;
        boxHeight = 3;
    }
    
    // 更新全局变量
    BOARD_SIZE = boardSize;
    BOX_WIDTH = boxWidth;
    BOX_HEIGHT = boxHeight;
    
    // 重置游戏状态
    sudokuBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    solution = [];
    originalBoard = [];
    cellStatus = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    
    // 获取当前难度
    const difficulty = difficultySelector.value;
    
    // 禁用开始按钮，防止重复点击
    startButton.disabled = true;
    
    // 显示加载提示
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.textContent = '正在生成数独...';
    document.querySelector('.game-container').appendChild(loadingMessage);
    
    // 使用setTimeout让UI有时间更新
    setTimeout(() => {
        try {
            // 生成数独
            const puzzle = generateSudoku(difficulty, boardSize);
            sudokuBoard = puzzle.board;
            solution = puzzle.solution;
            originalBoard = JSON.parse(JSON.stringify(sudokuBoard)); // 深拷贝初始棋盘
            
            // 移除加载提示
            document.querySelector('.game-container').removeChild(loadingMessage);
            
            // 启用开始按钮
            startButton.disabled = false;
            
            // 渲染棋盘
            renderBoard();
            
            console.log(`${boardSize}x${boardSize}数独生成完成`);
        } catch (error) {
            console.error('生成数独时出错:', error);
            
            // 移除加载提示
            document.querySelector('.game-container').removeChild(loadingMessage);
            
            // 启用开始按钮
            startButton.disabled = false;
            
            // 显示错误信息
            alert('生成数独时出错，请重试');
        }
    }, 100);
}

// 更新主页面，添加数独游戏
function updateMainPage() {
    // 检查是否在主页面
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        // 查找游戏网格
        const gamesGrid = document.querySelector('.games-grid');
        if (!gamesGrid) return;
        
        // 检查是否已经添加了数独游戏
        if (document.querySelector('.game-card[data-game="sudoku"]')) return;
        
        // 创建数独游戏卡片
        const sudokuCard = document.createElement('div');
        sudokuCard.className = 'game-card';
        sudokuCard.dataset.game = 'sudoku';
        
        sudokuCard.innerHTML = `
            <h3>小川数独</h3>
            <p>经典九宫格数独游戏，锻炼逻辑思维能力</p>
            <button class="play-button">开始游戏</button>
        `;
        
        // 添加点击事件
        sudokuCard.querySelector('.play-button').addEventListener('click', () => {
            window.location.href = 'sudoku/index.html';
        });
        
        // 添加到游戏网格
        gamesGrid.appendChild(sudokuCard);
    }
}

// 导出初始化游戏函数
window.initializeGame = initializeGame;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 如果在数独游戏页面，初始化游戏
    if (window.location.pathname.includes('sudoku')) {
        // 调用game.js中的init函数初始化游戏
        if (typeof init === 'function') {
            init();
            // 自动生成一个默认数独棋盘
            initializeGame();
        }
    } else {
        // 如果在主页面，更新主页面
        updateMainPage();
    }
});