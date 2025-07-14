const canvas = document.getElementById('goBoard');
 const ctx = canvas.getContext('2d');
 const passButton = document.getElementById('passButton');
const resetButton = document.getElementById('resetButton');
const currentPlayerSpan = document.getElementById('currentPlayer');
const blackScoreSpan = document.getElementById('blackScore');
const whiteScoreSpan = document.getElementById('whiteScore');
const toastElement = document.getElementById('toast');

const boardSizeSelect = document.getElementById('boardSize');
const startGameButton = document.getElementById('startGameButton');
let BOARD_SIZE = parseInt(boardSizeSelect.value); // 围棋棋盘大小，例如 9, 13, 19


 let board = [];
 let currentPlayer = 'black'; // 'black' or 'white'
 let blackScore = 0;
 let whiteScore = 0;
 let passCount = 0; // Track consecutive passes
 let gameStarted = false; // Track if the game has started
 let blackTime = 0;
 let whiteTime = 0;
 let CELL_SIZE;
 let STONE_RADIUS;
 let timerInterval;
 let gameEnded = false;
let isAiThinking = false; // Add this line to track AI's turn

 const blackTimerSpan = document.getElementById('blackTimer');
 const whiteTimerSpan = document.getElementById('whiteTimer');

 function initBoard() {
     BOARD_SIZE = parseInt(boardSizeSelect.value);
     const canvas = document.getElementById('goBoard');
     const ctx = canvas.getContext('2d');

     // Adjust canvas size based on BOARD_SIZE
     const newCanvasSize = (BOARD_SIZE + 1) * 30; // Assuming a base cell size of 30px
     canvas.width = newCanvasSize;
     canvas.height = newCanvasSize;

     CELL_SIZE = canvas.width / (BOARD_SIZE + 1);
     STONE_RADIUS = CELL_SIZE / 2 - 2;
     board = [];
     for (let r = 0; r < BOARD_SIZE; r++) {
         board.push(Array(BOARD_SIZE).fill(0));
     }
     currentPlayer = 'black';
     blackScore = 0;
     whiteScore = 0;
     passCount = 0;
     gameStarted = true; // Game starts when board is initialized
     blackTime = 0;
     whiteTime = 0;
     clearInterval(timerInterval);
     updateStatus();
     drawBoard();
     // startTimer(); // 移除自动开始计时器

     showToast('游戏开始！黑棋先行。');
 }

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE, (i + 1) * CELL_SIZE);
        ctx.lineTo(BOARD_SIZE * CELL_SIZE, (i + 1) * CELL_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo((i + 1) * CELL_SIZE, CELL_SIZE);
        ctx.lineTo((i + 1) * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
        ctx.stroke();
    }

    // Draw star points dynamically based on BOARD_SIZE
    const starPointPositions = {
        9: [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]],
        13: [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]],
        19: [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]]
    };

    const currentStarPoints = starPointPositions[BOARD_SIZE];
    if (currentStarPoints) {
        currentStarPoints.forEach(([row, col]) => {
            ctx.beginPath();
            ctx.arc((col + 1) * CELL_SIZE, (row + 1) * CELL_SIZE, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Draw stones
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== 0) {
                drawStone(r, c, board[r][c]);
            }
        }
    }
}

function drawStone(row, col, color) {
    ctx.beginPath();
    ctx.arc((col + 1) * CELL_SIZE, (row + 1) * CELL_SIZE, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function updateStatus() {
    currentPlayerSpan.textContent = currentPlayer === 'black' ? '黑棋' : '白棋';
    blackScoreSpan.textContent = blackScore;
    whiteScoreSpan.textContent = whiteScore;
}

function getNeighbors(row, col) {
    const neighbors = [];
    if (row > 0) neighbors.push([row - 1, col]);
    if (row < BOARD_SIZE - 1) neighbors.push([row + 1, col]);
    if (col > 0) neighbors.push([row, col - 1]);
    if (col < BOARD_SIZE - 1) neighbors.push([row, col + 1]);
    return neighbors;
}

function getGroup(row, col, color, visited) {
    const group = [];
    const queue = [[row, col]];
    visited[row][col] = true;

    while (queue.length > 0) {
        const [r, c] = queue.shift();
        group.push([r, c]);

        getNeighbors(r, c).forEach(([nr, nc]) => {
            if (!visited[nr][nc] && board[nr][nc] === color) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
            }
        });
    }
    return group;
}

function getLiberties(group) {
    const liberties = new Set();
    group.forEach(([r, c]) => {
        getNeighbors(r, c).forEach(([nr, nc]) => {
            if (board[nr][nc] === 0) {
                liberties.add(`${nr},${nc}`);
            }
        });
    });
    return liberties.size;
}

function removeStones(group) {
    group.forEach(([r, c]) => {
        board[r][c] = 0;
    });
}

function checkCaptures(lastMoveColor) {
    const opponentColor = lastMoveColor === 'black' ? 'white' : 'black';
    let capturedStones = 0;
    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === opponentColor && !visited[r][c]) {
                const group = getGroup(r, c, opponentColor, visited);
                if (getLiberties(group) === 0) {
                    removeStones(group);
                    capturedStones += group.length;
                }
            }
        }
    }
    return capturedStones;
}

function aiMove() {
    // 简单的AI：随机选择一个有效位置落子
    const availableMoves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0 && isValidMove(r, c)) {
                availableMoves.push([r, c]);
            }
        }
    }

    if (availableMoves.length > 0) {
        const [row, col] = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        placeStone(row, col);
    } else {
        // 如果没有有效位置，则AI选择“跳过”
        showToast('AI跳过。');
        passCount++;
        if (passCount >= 2) {
            endGame();
        } else {
            currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
            updateStatus();
            // 如果AI跳过，且下一个玩家是AI，则再次调用AI移动
            if (currentPlayer === 'white') {
                isAiThinking = true; // AI开始思考，禁用玩家操作
                setTimeout(() => {
                    aiMove();
                    isAiThinking = false; // AI思考结束，启用玩家操作
                }, 1000);
            }
        }
    }
}

function endGame() {
    gameEnded = true;
    showToast('游戏结束！');
    // 这里可以添加计算胜负的逻辑
}

function isValidMove(row, col) {
    if (board[row][col] !== 0) return false; // Already occupied

    // Create a deep copy of the board to simulate the move
    const tempBoard = board.map(arr => arr.slice());
    tempBoard[row][col] = currentPlayer;

    // Check for suicide
    const tempVisited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
    const group = getGroup(row, col, currentPlayer, tempVisited, tempBoard);
    const liberties = getLiberties(group, tempBoard);

    let isSuicide = false;
    if (liberties === 0) {
        // Check if placing this stone captures any opponent stones on the temporary board
        const opponentColor = currentPlayer === 'black' ? 'white' : 'black';
        let capturesOpponent = false;
        getNeighbors(row, col).forEach(([nr, nc]) => {
            if (tempBoard[nr][nc] === opponentColor) {
                const opponentVisited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
                const opponentGroup = getGroup(nr, nc, opponentColor, opponentVisited, tempBoard);
                if (getLiberties(opponentGroup, tempBoard) === 1) { // If opponent group has only one liberty (this new stone's position)
                    capturesOpponent = true;
                }
            }
        });
        if (!capturesOpponent) {
            isSuicide = true;
        }
    }

    return !isSuicide;
}

// Helper functions for group and liberties calculation that can take a board as argument
function getGroup(row, col, color, visited, currentBoard = board) {
    const group = [];
    const queue = [[row, col]];
    visited[row][col] = true;

    while (queue.length > 0) {
        const [r, c] = queue.shift();
        group.push([r, c]);

        getNeighbors(r, c).forEach(([nr, nc]) => {
            if (!visited[nr][nc] && currentBoard[nr][nc] === color) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
            }
        });
    }
    return group;
}

function getLiberties(group, currentBoard = board) {
    const liberties = new Set();
    group.forEach(([r, c]) => {
        getNeighbors(r, c).forEach(([nr, nc]) => {
            if (currentBoard[nr][nc] === 0) {
                liberties.add(`${nr},${nc}`);
            }
        });
    });
    return liberties.size;
}

function checkCaptures(lastMoveColor) {
    const opponentColor = lastMoveColor === 'black' ? 'white' : 'black';
    let capturedStones = 0;
    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === opponentColor && !visited[r][c]) {
                const group = getGroup(r, c, opponentColor, visited);
                if (getLiberties(group) === 0) {
                    removeStones(group);
                    capturedStones += group.length;
                }
            }
        }
    }
    return capturedStones;
}

 canvas.addEventListener('click', (event) => {
     if (!gameStarted) {
         showToast('请先点击“开始游戏”按钮！');
         return;
     }
     if (gameEnded) {
         showToast('游戏已结束，请重新开始！');
         return;
     }
     if (isAiThinking) {
         showToast('AI正在思考，请稍候。');
         return;
     }
     const rect = canvas.getBoundingClientRect();
     const x = event.clientX - rect.left;
     const y = event.clientY - rect.top;
 
     const col = Math.round((x - CELL_SIZE) / CELL_SIZE);
     const row = Math.round((y - CELL_SIZE) / CELL_SIZE);
 
     if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
         if (board[row][col] === 0) { // Only allow placing stone on empty spot
             if (isValidMove(row, col)) {
                 placeStone(row, col);
             } else {
                 showToast('无效落子！');
             }
         } else {
             // If clicking on an existing stone, show its liberties
             const stoneColor = board[row][col];
             const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
             const group = getGroup(row, col, stoneColor, visited);
             const liberties = getLiberties(group);
             showToast(`该棋子还有 ${liberties} 气。`);
         }
     }
 });

function placeStone(row, col) {
    if (gameEnded) return;



    board[row][col] = currentPlayer;
    drawBoard();

    const captured = checkCaptures(currentPlayer);
    if (currentPlayer === 'black') {
        blackScore += captured;
    } else {
        whiteScore += captured;
    }

    lastMovePassed = false; // Reset pass flag on a valid move
    updateStatus();

    checkGameEnd();

    switchPlayer(); // 统一切换玩家逻辑


}

 function switchPlayer() {
     currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
     passCount = 0; // Reset pass count on a valid move
     clearInterval(timerInterval);
     startTimer();
     updateStatus();
     // AI 逻辑已在 placeStone 内部处理，此处不再触发 AI 移动
     // 如果当前玩家是AI，则AI自动下棋
     if (currentPlayer === 'white') {
         isAiThinking = true; // AI开始思考，禁用玩家操作
         setTimeout(() => {
             aiMove();
             isAiThinking = false; // AI思考结束，启用玩家操作
         }, 1000); // 延迟1秒执行AI落子
     }
 }

 function startTimer() {
     timerInterval = setInterval(() => {
         if (currentPlayer === 'black') {
             blackTime++;
             blackTimerSpan.textContent = formatTime(blackTime);
         } else {
             whiteTime++;
             whiteTimerSpan.textContent = formatTime(whiteTime);
         }
     }, 1000);
 }

 function formatTime(seconds) {
     const minutes = Math.floor(seconds / 60);
     const remainingSeconds = seconds % 60;
     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
 }

passButton.addEventListener('click', () => {
    if (gameEnded) return;

    showToast(`${currentPlayer === 'black' ? '黑棋' : '白棋'} 弃权。`);

    if (lastMovePassed) {
        // Both players passed consecutively, end game
        gameEnded = true;
        showResult();
    } else {
        lastMovePassed = true;
        switchPlayer();
        updateStatus();
        checkGameEnd();
        if (!gameEnded && currentPlayer === 'white') {
            setTimeout(aiMove, 500);
        }
    }
});

resetButton.addEventListener('click', () => {
    initBoard();
});

function showToast(message) {
    toastElement.textContent = message;
    toastElement.className = 'toast show';
    setTimeout(() => {
        toastElement.className = toastElement.className.replace('show', '');
    }, 2000);
}

function checkGameEnd() {
    // Check if board is full
    let boardFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0) {
                boardFull = false;
                break;
            }
        }
        if (!boardFull) break;
    }

    if (boardFull) {
        gameEnded = true;
        showToast('棋盘已满，游戏结束！');
        showResult();
    }
}

function calculateScore() {
    // Simple territory scoring (needs refinement for real Go rules)
    let finalBlackScore = blackScore;
    let finalWhiteScore = whiteScore;

    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0 && !visited[r][c]) {
                const territory = [];
                const queue = [[r, c]];
                visited[r][c] = true;
                let hasBlackNeighbor = false;
                let hasWhiteNeighbor = false;

                while (queue.length > 0) {
                    const [currR, currC] = queue.shift();
                    territory.push([currR, currC]);

                    getNeighbors(currR, currC).forEach(([nr, nc]) => {
                        if (board[nr][nc] === 'black') {
                            hasBlackNeighbor = true;
                        } else if (board[nr][nc] === 'white') {
                            hasWhiteNeighbor = true;
                        } else if (board[nr][nc] === 0 && !visited[nr][nc]) {
                            visited[nr][nc] = true;
                            queue.push([nr, nc]);
                        }
                    });
                }

                if (hasBlackNeighbor && !hasWhiteNeighbor) {
                    finalBlackScore += territory.length;
                } else if (hasWhiteNeighbor && !hasBlackNeighbor) {
                    finalWhiteScore += territory.length;
                }
            }
        }
    }
    return { black: finalBlackScore, white: finalWhiteScore };
}

function showResult() {
    const finalScores = calculateScore();
    let message = `游戏结束！\n黑棋最终得分: ${finalScores.black}\n白棋最终得分: ${finalScores.white}\n`;

    if (finalScores.black > finalScores.white) {
        message += '黑棋获胜！';
    } else if (finalScores.white > finalScores.black) {
        message += '白棋获胜！';
    } else {
        message += '平局！';
    }
    alert(message);
}

// Simple AI Logic (Random valid move)
document.addEventListener('DOMContentLoaded', () => {
     // Initial setup without starting the game immediately
     updateStatus();
     drawBoard();
     showToast('选择棋盘大小，点击“开始游戏”开始对局。');
 });
 
 startGameButton.addEventListener('click', () => {
     initBoard();
 });
 
 function aiMove() {
     const possibleMoves = [];
     for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0 && isValidMove(r, c)) {
                possibleMoves.push([r, c]);
            }
        }
    }

    if (possibleMoves.length > 0) {
        const [row, col] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        placeStone(row, col);
    } else {
        // If no valid moves, AI passes
        showToast('AI 弃权。');
        if (lastMovePassed) {
            gameEnded = true;
            showResult();
        } else {
            lastMovePassed = true;
            switchPlayer();
            updateStatus();
            checkGameEnd();
        }
    }
}
