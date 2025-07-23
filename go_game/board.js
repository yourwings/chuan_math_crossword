// board.js
// 负责棋盘的绘制、棋子的放置、获取邻居、计算气等核心围棋逻辑。


let board;
let BOARD_SIZE;
let CELL_SIZE;
let STONE_RADIUS;
let ctx;
let canvas;

export function initBoardState(size, canvasElement, context) {
    BOARD_SIZE = size;
    canvas = canvasElement;
    ctx = context;
    CELL_SIZE = canvas.width / (BOARD_SIZE + 1);
    STONE_RADIUS = CELL_SIZE / 2 - 2;
    board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        board.push(Array(BOARD_SIZE).fill('empty'));
    }

}

export function getBoard() {
    return board;
}

export function setBoard(newBoard) {
    board = newBoard;
}

export function getBoardSize() {
    return BOARD_SIZE;
}



export function drawStone(row, col, color) {
    ctx.beginPath();
    ctx.arc((col + 1) * CELL_SIZE, (row + 1) * CELL_SIZE, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

// 绘制带动画效果的棋子
export function drawStoneWithAnimation(row, col, color, animationProgress = 1) {
    const x = (col + 1) * CELL_SIZE;
    const y = (row + 1) * CELL_SIZE;
    const radius = STONE_RADIUS * animationProgress;
    
    ctx.save();
    ctx.globalAlpha = animationProgress;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

// 落子动画
export function animateStonePlace(row, col, color, callback) {
    const duration = 300; // 动画持续时间（毫秒）
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // 重绘棋盘
        drawBoard(board, ctx, canvas);
        
        // 绘制动画中的棋子
        drawStoneWithAnimation(row, col, color, easeProgress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 动画完成，正常绘制棋子
            board[row][col] = color;
            drawBoard(board, ctx, canvas);
            if (callback) callback();
        }
    }
    
    animate();
}

// 吃子动画效果
export function animateCapturedStones(capturedStones, callback) {
    if (capturedStones.length === 0) {
        if (callback) callback();
        return;
    }
    
    const duration = 400; // 动画持续时间
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数（淡出效果）
        const fadeProgress = 1 - progress;
        
        // 重绘棋盘（不包含被吃的棋子，因为它们已经从board中移除）
        drawBoard(board, ctx, canvas);
        
        // 绘制淡出的被吃棋子
        capturedStones.forEach(([row, col, color]) => {
            const x = (col + 1) * CELL_SIZE;
            const y = (row + 1) * CELL_SIZE;
            
            ctx.save();
            ctx.globalAlpha = fadeProgress;
            ctx.beginPath();
            ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = color === 'black' ? '#000000' : '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        });
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 动画完成，最终重绘棋盘
            drawBoard(board, ctx, canvas);
            if (callback) callback();
        }
    }
    
    animate();
}

export function getNeighbors(row, col) {
    const neighbors = [];
    if (row > 0) neighbors.push([row - 1, col]);
    if (row < BOARD_SIZE - 1) neighbors.push([row + 1, col]);
    if (col > 0) neighbors.push([row, col - 1]);
    if (col < BOARD_SIZE - 1) neighbors.push([row, col + 1]);
    return neighbors;
}

export function getGroup(row, col, color, visited, currentBoard = board) {
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

export function getLiberties(group, currentBoard = board) {
    const liberties = new Set();
    group.forEach(([r, c]) => {
        getNeighbors(r, c).forEach(([nr, nc]) => {
            if (currentBoard[nr][nc] === 'empty') {
                liberties.add(`${nr},${nc}`);
            }
        });
    });
    return liberties.size;
}

// 获取指定位置棋子所在棋组的气数
export function getStoneLibertiesAt(row, col, currentBoard = board) {
    if (currentBoard[row][col] === 'empty') {
        return 0;
    }
    
    const color = currentBoard[row][col];
    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
    const group = getGroup(row, col, color, visited, currentBoard);
    return getLiberties(group, currentBoard);
}

export function removeStones(group) {
    group.forEach(([r, c]) => {
        board[r][c] = 'empty';
    });
}



export function checkCaptures(lastMoveColor) {
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



export function getCellSize() {
    return CELL_SIZE;
}

export function getStoneRadius() {
    return STONE_RADIUS;
}

export function getContext() {
    return ctx;
}

export function getCanvas() {
    return canvas;
}

export function checkCapturesSimulation(currentBoard, lastMoveColor) {
    const opponentColor = lastMoveColor === 'black' ? 'white' : 'black';
    let capturedStones = 0;
    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (currentBoard[r][c] === opponentColor && !visited[r][c]) {
                const group = getGroup(r, c, opponentColor, visited, currentBoard);
                if (getLiberties(group, currentBoard) === 0) {
                    capturedStones += group.length;
                }
            }
        }
    }
    return capturedStones;
}



export function removeCapturedStones(board, lastMoveColor) {
    const opponentColor = lastMoveColor === 'black' ? 'white' : 'black';
    let capturedStones = 0;
    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === opponentColor && !visited[r][c]) {
                const group = getGroup(r, c, opponentColor, visited, board);
                if (getLiberties(group, board) === 0) {
                    for (const [gr, gc] of group) {
                        board[gr][gc] = 'empty';
                    }
                    capturedStones += group.length;
                }
            }
        }
    }
    return capturedStones;
}

export function isValidMove(row, col, color, currentBoard, isSimulation = false, lastMove = null) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return false; // Out of bounds
    }
    if (currentBoard[row][col] !== 'empty') {
        return false; // Position already occupied
    }

    // Simulate the move
    const testBoard = currentBoard.map(arr => [...arr]);
    testBoard[row][col] = color;

    // Check for suicide
    const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
    const group = getGroup(row, col, color, visited, testBoard);
    if (getLiberties(group, testBoard) === 0) {
        // If placing the stone results in a group with 0 liberties, check if it captures any opponent stones
        const opponentColor = color === 'black' ? 'white' : 'black';
        let captures = 0;
        const opponentVisited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
        for (const [dr, dc] of [[1,0], [-1,0], [0,1], [0,-1]]) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && 
                testBoard[nr][nc] === opponentColor && !opponentVisited[nr][nc]) {
                const opponentGroup = getGroup(nr, nc, opponentColor, opponentVisited, testBoard);
                if (getLiberties(opponentGroup, testBoard) === 0) {
                    captures += opponentGroup.length;
                }
            }
        }
        if (captures === 0) {
            return false; // It's a suicide move and no captures are made
        }
    }

    // Ko rule (simplified): Prevent immediate recapture of a single stone
    // This is a basic implementation and might need refinement for a full Ko rule.
    if (!isSimulation && lastMove && 
        testBoard[lastMove[0]][lastMove[1]] === 'empty' && 
        currentBoard[lastMove[0]][lastMove[1]] === color &&
        checkCapturesSimulation(testBoard, color) === 1) { // Assuming 1 stone was captured to create the Ko
        // This check is too simplistic for a proper Ko rule. A full Ko rule requires tracking board states.
        // For now, we'll allow it in simulation but might need a more robust solution for actual game.
        // console.log('Potential Ko rule violation detected.');
        // return false;
    }

    return true;
}

export function drawBoard(board, ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#D2B48C'; // Wood color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    const cellSize = canvas.width / (BOARD_SIZE + 1);

    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(cellSize * (i + 1), cellSize);
        ctx.lineTo(cellSize * (i + 1), canvas.height - cellSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cellSize, cellSize * (i + 1));
        ctx.lineTo(canvas.width - cellSize, cellSize * (i + 1));
        ctx.stroke();
    }

    // Draw hoshi (star points) for 9x9, 13x13, 19x19 boards
    const hoshi = [];
    if (BOARD_SIZE === 9) {
        hoshi.push([2, 2], [2, 6], [6, 2], [6, 6], [4, 4]);
    } else if (BOARD_SIZE === 13) {
        hoshi.push([3, 3], [3, 9], [9, 3], [9, 9], [6, 6]);
    } else if (BOARD_SIZE === 19) {
        hoshi.push([3, 3], [3, 9], [3, 15],
            [9, 3], [9, 9], [9, 15],
            [15, 3], [15, 9], [15, 15]);
    }

    ctx.fillStyle = '#000000';
    for (const [r, c] of hoshi) {
        ctx.beginPath();
        ctx.arc(cellSize * (c + 1), cellSize * (r + 1), 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const stone = board[r][c];
            if (stone !== 'empty') {
                ctx.beginPath();
                ctx.arc(cellSize * (c + 1), cellSize * (r + 1), cellSize / 2 - 2, 0, 2 * Math.PI);
                ctx.fillStyle = stone;
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}

export function placeStone(board, row, col, color) {
    board[row][col] = color;
}

export function initializeBoard() {
    return Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill('empty'));
}
