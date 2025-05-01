// 数独生成器

// 生成数独函数
function generateSudoku(difficulty, boardSize = 9) {
    console.log(`生成${difficulty}难度的${boardSize}x${boardSize}数独`);
    
    // 生成完整解答
    const solution = generateSolution(boardSize);
    
    // 根据难度移除数字
    const board = removeNumbers(solution, difficulty, boardSize);
    
    return {
        board: board,
        solution: solution,
        boardSize: boardSize
    };
}

// 生成完整解答
function generateSolution(boardSize = 9) {
    // 创建空棋盘
    const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    // 填充棋盘
    solveSudoku(board, boardSize);
    
    return board;
}

// 解决数独（回溯算法）
function solveSudoku(board, boardSize = 9) {
    // 找到一个空位置
    const emptyCell = findEmptyCell(board, boardSize);
    
    // 如果没有空位置，说明已经解决
    if (!emptyCell) {
        return true;
    }
    
    const [row, col] = emptyCell;
    
    // 根据棋盘大小创建数字数组
    const numbers = [];
    for (let i = 1; i <= boardSize; i++) {
        numbers.push(i);
    }
    
    // 打乱数字顺序
    const shuffledNumbers = shuffleArray(numbers);
    
    for (const num of shuffledNumbers) {
        // 检查是否可以放置
        if (isValid(board, row, col, num, boardSize)) {
            // 放置数字
            board[row][col] = num;
            
            // 递归解决剩余部分
            if (solveSudoku(board, boardSize)) {
                return true;
            }
            
            // 如果无法解决，回溯
            board[row][col] = 0;
        }
    }
    
    // 无解
    return false;
}

// 找到一个空位置
function findEmptyCell(board, boardSize = 9) {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

// 检查数字是否可以放置在指定位置
function isValid(board, row, col, num, boardSize = 9) {
    // 检查行
    for (let x = 0; x < boardSize; x++) {
        if (board[row][x] === num) {
            return false;
        }
    }
    
    // 检查列
    for (let y = 0; y < boardSize; y++) {
        if (board[y][col] === num) {
            return false;
        }
    }
    
    // 根据棋盘大小确定宫格大小
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
    
    // 计算当前单元格所在宫格的左上角坐标
    const boxRow = Math.floor(row / boxHeight) * boxHeight;
    const boxCol = Math.floor(col / boxWidth) * boxWidth;
    
    // 检查宫格
    for (let y = boxRow; y < boxRow + boxHeight; y++) {
        for (let x = boxCol; x < boxCol + boxWidth; x++) {
            if (board[y][x] === num) {
                return false;
            }
        }
    }
    
    return true;
}

// 根据难度移除数字
function removeNumbers(solution, difficulty, boardSize = 9) {
    // 创建完整棋盘的副本
    const board = JSON.parse(JSON.stringify(solution));
    
    // 根据棋盘大小和难度确定要移除的数字数量
    let numbersToRemove;
    
    if (boardSize === 4) {
        // 4x4数独的难度设置
        switch (difficulty) {
            case 'easy':
                // 简单难度：保留约10-11个数字（移除5-6个）
                numbersToRemove = 5 + Math.floor(Math.random() * 2);
                break;
            case 'medium':
                // 中等难度：保留约8-9个数字（移除7-8个）
                numbersToRemove = 7 + Math.floor(Math.random() * 2);
                break;
            case 'hard':
                // 困难难度：保留约6-7个数字（移除9-10个）
                numbersToRemove = 9 + Math.floor(Math.random() * 2);
                break;
            default:
                numbersToRemove = 6;
        }
    } else if (boardSize === 6) {
        // 6x6数独的难度设置
        switch (difficulty) {
            case 'easy':
                // 简单难度：保留约25-27个数字（移除9-11个）
                numbersToRemove = 9 + Math.floor(Math.random() * 3);
                break;
            case 'medium':
                // 中等难度：保留约20-22个数字（移除14-16个）
                numbersToRemove = 14 + Math.floor(Math.random() * 3);
                break;
            case 'hard':
                // 困难难度：保留约16-18个数字（移除18-20个）
                numbersToRemove = 18 + Math.floor(Math.random() * 3);
                break;
            default:
                numbersToRemove = 12;
        }
    } else {
        // 9x9数独的难度设置（原有逻辑）
        switch (difficulty) {
            case 'easy':
                // 简单难度：保留约50-55个数字（移除26-31个）
                numbersToRemove = 26 + Math.floor(Math.random() * 6);
                break;
            case 'medium':
                // 中等难度：保留约40-45个数字（移除36-41个）
                numbersToRemove = 36 + Math.floor(Math.random() * 6);
                break;
            case 'hard':
                // 困难难度：保留约35-40个数字（移除41-46个）
                numbersToRemove = 41 + Math.floor(Math.random() * 6);
                break;
            default:
                numbersToRemove = 30;
        }
    }
    
    // 创建所有单元格的列表
    const cells = [];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            cells.push([row, col]);
        }
    }
    
    // 随机打乱单元格顺序
    shuffleArray(cells);
    
    // 移除数字，确保仍有唯一解
    let count = 0;
    for (const [row, col] of cells) {
        if (count >= numbersToRemove) {
            break;
        }
        
        const temp = board[row][col];
        board[row][col] = 0;
        
        // 检查是否仍有唯一解
        const tempBoard = JSON.parse(JSON.stringify(board));
        const solutions = countSolutions(tempBoard, boardSize);
        
        if (solutions !== 1) {
            // 如果没有唯一解，恢复数字
            board[row][col] = temp;
        } else {
            count++;
        }
    }
    
    return board;
}

// 计算解的数量（最多2个，用于检查唯一性）
function countSolutions(board, boardSize = 9) {
    let count = 0;
    
    // 找到一个空位置
    const emptyCell = findEmptyCell(board, boardSize);
    
    // 如果没有空位置，说明找到一个解
    if (!emptyCell) {
        return 1;
    }
    
    const [row, col] = emptyCell;
    
    // 尝试填入1到boardSize的数字
    for (let num = 1; num <= boardSize; num++) {
        // 检查是否可以放置
        if (isValid(board, row, col, num, boardSize)) {
            // 放置数字
            board[row][col] = num;
            
            // 递归计算解的数量
            count += countSolutions(board, boardSize);
            
            // 如果已经找到多个解，可以提前返回
            if (count >= 2) {
                return count;
            }
            
            // 回溯
            board[row][col] = 0;
        }
    }
    
    return count;
}

// 随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 导出函数
window.generateSudoku = generateSudoku;