import { removeCapturedStones, isValidMove, drawBoard, animateStonePlace, animateCapturedStones } from './board.js';

let BOARD_SIZE = 19; // 默认19x19棋盘

export function getBoardSize() {
    return BOARD_SIZE;
}

export function setBoardSize(size) {
    BOARD_SIZE = size;
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill('empty'));
}

let board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill('empty'));
let currentPlayer = 'black';
let blackCaptures = 0;
let whiteCaptures = 0;
let gameStarted = false;
let gameEnded = false;
let isAiThinking = false;
let lastMove = null; // To store the last move for Ko rule
let playerCanMove = true; // 控制玩家是否可以落子
let blackTime = 0; // 黑棋用时（秒）
let whiteTime = 0; // 白棋用时（秒）
let gameTimer = null; // 游戏计时器
let gameStartTime = null; // 当前玩家开始思考的时间
let debugLog = []; // 调试日志
let moveCounter = 0; // 落子计数器

export function getBoard() {
    return board;
}

export function getCurrentPlayer() {
    return currentPlayer;
}

export function getGameStarted() {
    return gameStarted;
}

export function getGameEnded() {
    return gameEnded;
}

export function getIsAiThinking() {
    return isAiThinking;
}

export function getLastMove() {
    return lastMove;
}

export function setBoard(newBoard) {
    board = newBoard;
}

export function setCurrentPlayer(player) {
    currentPlayer = player;
}

export function setGameStarted(started) {
    gameStarted = started;
}

export function setGameEnded(ended) {
    gameEnded = ended;
}

export function setIsAiThinking(thinking) {
    isAiThinking = thinking;
    // AI思考时暂停计时器，AI结束思考时恢复计时器
    if (thinking) {
        stopTimer();
    } else if (gameStarted && !gameEnded) {
        startTimer();
    }
}

export function setLastMove(move) {
    lastMove = move;
}

export function getPlayerCanMove() {
    return playerCanMove;
}

export function setPlayerCanMove(canMove) {
    playerCanMove = canMove;
}

export function getBlackTime() {
    return blackTime;
}

export function getWhiteTime() {
    return whiteTime;
}

export function getDebugLog() {
    return debugLog;
}

export function clearDebugLog() {
    debugLog = [];
    moveCounter = 0;
}

export function addDebugInfo(info) {
    debugLog.push({
        timestamp: new Date().toLocaleTimeString(),
        move: moveCounter,
        ...info
    });
}

export function startTimer() {
    if (gameTimer) clearInterval(gameTimer);
    gameStartTime = Date.now();
    gameTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        if (currentPlayer === 'black') {
            blackTime = elapsed;
        } else {
            whiteTime = elapsed;
        }
    }, 1000);
}

export function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

export function resetTimer() {
    stopTimer();
    blackTime = 0;
    whiteTime = 0;
    gameStartTime = null;
}

export function startGame() {
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill('empty'));
    currentPlayer = 'black';
    blackCaptures = 0;
    whiteCaptures = 0;
    gameStarted = true;
    gameEnded = false;
    isAiThinking = false;
    lastMove = null;
    playerCanMove = true;
    resetTimer();
    startTimer();
    clearDebugLog(); // 清空调试日志
    // drawBoard(board, ctx, canvas); // This will be handled by UI
    // updateStatus(); // This will be handled by UI
}

export function resetGame() {
    // 停止当前计时器
    stopTimer();
    // 重新开始游戏
    startGame();
}

export async function placeStoneAndUpdate(row, col, color, ctx, canvas, callback) {
    if (!isValidMove(row, col, color, board, false, lastMove)) {
        addDebugInfo({
            type: 'invalid_move',
            player: color,
            position: `(${row}, ${col})`,
            reason: '不符合围棋规则'
        });
        return false;
    }

    // 增加落子计数
    moveCounter++;
    
    // 禁用玩家移动，防止快速点击
    setPlayerCanMove(false);

    const newBoard = board.map(arr => [...arr]);
    newBoard[row][col] = color;

    // 收集被吃的棋子信息（用于动画）
    const capturedStones = [];
    const opponentColor = color === 'black' ? 'white' : 'black';
    
    // 检查对手棋子是否被吃
    const neighbors = [[row-1,col], [row+1,col], [row,col-1], [row,col+1]];
    for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < getBoardSize() && nc >= 0 && nc < getBoardSize() && 
            newBoard[nr][nc] === opponentColor) {
            const group = getGroupFromBoard(nr, nc, opponentColor, newBoard);
            if (getLibertiesFromBoard(group, newBoard).length === 0) {
                group.forEach(([gr, gc]) => {
                    capturedStones.push([gr, gc, opponentColor]);
                });
            }
        }
    }

    // 更新提子数
    if (color === 'black') {
        blackCaptures += capturedStones.length;
    } else {
        whiteCaptures += capturedStones.length;
    }

    lastMove = [row, col];
    
    // 记录debug信息
    addDebugInfo({
        type: 'valid_move',
        player: color,
        position: `(${row}, ${col})`,
        capturedStones: capturedStones.length,
        capturedPositions: capturedStones.map(([r, c]) => `(${r}, ${c})`),
        boardState: board.map(row => row.slice()), // 深拷贝当前棋盘状态
        blackCaptures: blackCaptures,
        whiteCaptures: whiteCaptures,
        gameState: {
            currentPlayer: currentPlayer,
            gameStarted: gameStarted,
            gameEnded: gameEnded,
            isAiThinking: isAiThinking
        }
    });

    // 先更新棋盘状态（落子）
    board[row][col] = color;

    // 播放落子动画
    animateStonePlace(row, col, color, async () => {
        // 如果有被吃的棋子，先从棋盘移除再播放吃子动画
        if (capturedStones.length > 0) {
            // 从棋盘移除被吃的棋子
            capturedStones.forEach(([gr, gc]) => {
                board[gr][gc] = 'empty';
            });
            
            // 同步更新board.js模块的状态
            const { setBoard } = await import('./board.js');
            setBoard(board.map(arr => [...arr]));
            
            // 播放吃子动画
            animateCapturedStones(capturedStones, () => {
                // 重新启用玩家移动
                setPlayerCanMove(true);
                if (callback) callback();
            });
        } else {
            // 重新启用玩家移动
            setPlayerCanMove(true);
            if (callback) callback();
        }
    });

    return true;
}

// 辅助函数：从指定棋盘获取棋组
function getGroupFromBoard(row, col, color, boardState) {
    const group = [];
    const visited = new Set();
    const stack = [[row, col]];
    
    while (stack.length > 0) {
        const [r, c] = stack.pop();
        const key = `${r},${c}`;
        
        if (visited.has(key) || r < 0 || r >= getBoardSize() || 
            c < 0 || c >= getBoardSize() || boardState[r][c] !== color) {
            continue;
        }
        
        visited.add(key);
        group.push([r, c]);
        
        stack.push([r-1, c], [r+1, c], [r, c-1], [r, c+1]);
    }
    
    return group;
}

// 辅助函数：从指定棋盘获取气
function getLibertiesFromBoard(group, boardState) {
    const liberties = new Set();
    
    for (const [r, c] of group) {
        const neighbors = [[r-1,c], [r+1,c], [r,c-1], [r,c+1]];
        for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < getBoardSize() && nc >= 0 && nc < getBoardSize() && 
                boardState[nr][nc] === 'empty') {
                liberties.add(`${nr},${nc}`);
            }
        }
    }
    
    return Array.from(liberties).map(key => key.split(',').map(Number));
}

export function switchPlayer() {
    const previousPlayer = currentPlayer;
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    
    // 记录回合切换
    addDebugInfo({
        type: 'player_switch',
        from: previousPlayer,
        to: currentPlayer,
        gameState: {
            gameStarted: gameStarted,
            gameEnded: gameEnded,
            isAiThinking: isAiThinking
        }
    });
    
    // 重启计时器
    startTimer();
}

export function getBlackCaptures() {
    return blackCaptures;
}

export function getWhiteCaptures() {
    return whiteCaptures;
}

export function checkGameEnd() {
    // 计算已下棋子总数，判断游戏进度
    let totalStones = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== 'empty') {
                totalStones++;
            }
        }
    }
    
    // 只有在游戏进行到一定程度后才检查分差（至少下了30子）
    if (totalStones >= 30) {
        const score = calculateScore();
        const scoreDiff = Math.abs(score.black - score.white);
        
        // 根据棋盘大小调整分差阈值
        const threshold = BOARD_SIZE >= 19 ? 100 : BOARD_SIZE >= 13 ? 60 : 40;
        
        if (scoreDiff > threshold) {
            gameEnded = true;
            return { ended: true, reason: 'large_score_difference', score: score };
        }
    }
    
    // 检查是否还有有效的落子位置
    let hasValidMoves = false;
    for (let r = 0; r < BOARD_SIZE && !hasValidMoves; r++) {
        for (let c = 0; c < BOARD_SIZE && !hasValidMoves; c++) {
            if (board[r][c] === 'empty') {
                // 检查黑棋和白棋是否都有有效落子
                if (isValidMove(r, c, 'black', board, false, lastMove) || 
                    isValidMove(r, c, 'white', board, false, lastMove)) {
                    hasValidMoves = true;
                }
            }
        }
    }
    
    if (!hasValidMoves) {
        gameEnded = true;
        return { ended: true, reason: 'no_valid_moves', score: score };
    }
    
    return { ended: false };
}

export function calculateScore() {
    // 中国围棋规则：数子法计分
    // 黑棋得分 = 黑棋棋子数 + 黑棋领地数
    // 白棋得分 = 白棋棋子数 + 白棋领地数 + 贴目(7.5子)
    
    let blackStones = 0;
    let whiteStones = 0;
    let blackTerritory = 0;
    let whiteTerritory = 0;
    
    // 计算棋盘上的棋子数
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 'black') {
                blackStones++;
            } else if (board[r][c] === 'white') {
                whiteStones++;
            }
        }
    }

    // 计算领地（数子法：只计算完全被己方包围的空点）
    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 'empty' && !visited[r][c]) {
                const territory = [];
                const stack = [[r, c]];
                let hasBlackNeighbor = false;
                let hasWhiteNeighbor = false;

                // 深度优先搜索找到连通的空点区域
                while (stack.length > 0) {
                    const [currR, currC] = stack.pop();
                    if (currR < 0 || currR >= BOARD_SIZE || currC < 0 || currC >= BOARD_SIZE || visited[currR][currC]) {
                        continue;
                    }
                    
                    if (board[currR][currC] !== 'empty') {
                        continue;
                    }
                    
                    visited[currR][currC] = true;
                    territory.push([currR, currC]);

                    // 检查四个方向
                    for (const [dr, dc] of [[1,0], [-1,0], [0,1], [0,-1]]) {
                        const nr = currR + dr;
                        const nc = currC + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                            if (board[nr][nc] === 'black') {
                                hasBlackNeighbor = true;
                            } else if (board[nr][nc] === 'white') {
                                hasWhiteNeighbor = true;
                            } else if (board[nr][nc] === 'empty' && !visited[nr][nc]) {
                                stack.push([nr, nc]);
                            }
                        }
                    }
                }

                // 只有被单一颜色完全包围的领地才计分
                if (hasBlackNeighbor && !hasWhiteNeighbor) {
                    blackTerritory += territory.length;
                } else if (hasWhiteNeighbor && !hasBlackNeighbor) {
                    whiteTerritory += territory.length;
                }
            }
        }
    }
    
    // 中国规则计分 - 根据棋盘大小动态调整贴目
    const komi = getKomiByBoardSize(BOARD_SIZE);
    const blackScore = blackStones + blackTerritory;
    const whiteScore = whiteStones + whiteTerritory + komi;
    
    // 计算胜负
    const winner = blackScore > whiteScore ? 'black' : 'white';
    const margin = Math.abs(blackScore - whiteScore);
    
    return { 
        black: Math.round(blackScore * 10) / 10, 
        white: Math.round(whiteScore * 10) / 10,
        blackStones: blackStones,
        whiteStones: whiteStones,
        blackTerritory: blackTerritory,
        whiteTerritory: whiteTerritory,
        blackCaptures: blackCaptures,
        whiteCaptures: whiteCaptures,
        komi: komi,
        winner: winner,
        margin: Math.round(margin * 10) / 10,
        // 中国规则详细数据
        chineseRules: {
            description: '中国围棋规则（数子法）',
            blackTotal: `黑棋总分 = 棋子数(${blackStones}) + 领地数(${blackTerritory}) = ${Math.round(blackScore * 10) / 10}`,
            whiteTotal: `白棋总分 = 棋子数(${whiteStones}) + 领地数(${whiteTerritory}) + 贴目(${komi}) = ${Math.round(whiteScore * 10) / 10}`,
            result: `${winner === 'black' ? '黑棋' : '白棋'}胜 ${margin}子`,
            capturedStones: {
                black: blackCaptures,
                white: whiteCaptures,
                note: '被提子数（已从棋盘移除）'
            },
            territory: {
                black: blackTerritory,
                white: whiteTerritory,
                note: '完全被己方包围的空点数'
            },
            boardSize: BOARD_SIZE,
            totalPoints: BOARD_SIZE * BOARD_SIZE,
            komiRule: getKomiDescription(BOARD_SIZE),
            scoringMethod: '数子法说明：\n• 黑棋得分 = 黑棋棋子数 + 黑棋领地数\n• 白棋得分 = 白棋棋子数 + 白棋领地数 + 贴目\n• 领地：完全被己方棋子包围的空点\n• 贴目：补偿白棋后手劣势的额外分数'
        }
    };
}

// 根据棋盘大小获取贴目
function getKomiByBoardSize(boardSize) {
    switch (boardSize) {
        case 19:
            return 7.5; // 标准19路棋盘贴目
        case 13:
            return 5.5; // 13路棋盘贴目
        case 9:
            return 3.5; // 9路棋盘贴目
        default:
            return 7.5; // 默认贴目
    }
}

// 获取贴目规则说明
function getKomiDescription(boardSize) {
    switch (boardSize) {
        case 19:
            return '19路棋盘标准贴目：7.5子';
        case 13:
            return '13路棋盘贴目：5.5子（考虑棋盘较小，减少贴目）';
        case 9:
            return '9路棋盘贴目：3.5子（小棋盘快棋，贴目相应减少）';
        default:
            return `${boardSize}路棋盘贴目：7.5子`;
    }
}