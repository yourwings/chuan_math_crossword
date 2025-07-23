import { getBoard, getCurrentPlayer, setBoard, setLastMove, setIsAiThinking, switchPlayer, getGameEnded, getGameStarted, getIsAiThinking, placeStoneAndUpdate, getLastMove, getBoardSize, setPlayerCanMove } from './gameLogic.js';
import { isValidMove, checkCapturesSimulation, removeCapturedStones } from './board.js';

// 位置价值表 - 基于围棋理论的位置重要性
const POSITION_VALUES = {
    9: [
        [3, 4, 4, 5, 4, 4, 3],
        [4, 6, 6, 7, 6, 6, 4],
        [4, 6, 8, 8, 8, 6, 4],
        [5, 7, 8, 9, 8, 7, 5],
        [4, 6, 8, 8, 8, 6, 4],
        [4, 6, 6, 7, 6, 6, 4],
        [3, 4, 4, 5, 4, 4, 3]
    ],
    13: null, // 将在运行时生成
    19: null  // 将在运行时生成
};

// 开局定式库 - 常见的开局模式
const OPENING_PATTERNS = {
    9: [
        {r: 2, c: 2}, {r: 2, c: 6}, {r: 6, c: 2}, {r: 6, c: 6}, // 星位
        {r: 2, c: 4}, {r: 4, c: 2}, {r: 4, c: 6}, {r: 6, c: 4}  // 小目
    ],
    13: [
        {r: 3, c: 3}, {r: 3, c: 9}, {r: 9, c: 3}, {r: 9, c: 9}, // 星位
        {r: 3, c: 6}, {r: 6, c: 3}, {r: 6, c: 9}, {r: 9, c: 6}  // 小目
    ],
    19: [
        {r: 3, c: 3}, {r: 3, c: 15}, {r: 15, c: 3}, {r: 15, c: 15}, // 星位
        {r: 3, c: 9}, {r: 9, c: 3}, {r: 9, c: 15}, {r: 15, c: 9}   // 小目
    ]
};

// 初始化位置价值表
function initializePositionValues() {
    // 为13路棋盘生成位置价值表
    POSITION_VALUES[13] = Array(13).fill().map((_, r) => 
        Array(13).fill().map((_, c) => {
            const centerR = 6, centerC = 6;
            const distFromCenter = Math.max(Math.abs(r - centerR), Math.abs(c - centerC));
            const edgeDistance = Math.min(r, c, 12 - r, 12 - c);
            return Math.max(3, 8 - distFromCenter + edgeDistance);
        })
    );
    
    // 为19路棋盘生成位置价值表
    POSITION_VALUES[19] = Array(19).fill().map((_, r) => 
        Array(19).fill().map((_, c) => {
            const centerR = 9, centerC = 9;
            const distFromCenter = Math.max(Math.abs(r - centerR), Math.abs(c - centerC));
            const edgeDistance = Math.min(r, c, 18 - r, 18 - c);
            return Math.max(2, 10 - Math.floor(distFromCenter / 2) + Math.floor(edgeDistance / 2));
        })
    );
}

// 初始化
initializePositionValues();

// 蒙特卡洛树搜索节点
class MCTSNode {
    constructor(board, color, move = null, parent = null) {
        this.board = board.map(row => [...row]); // 深拷贝棋盘状态
        this.color = color; // 当前玩家颜色
        this.move = move; // 导致此状态的移动
        this.parent = parent;
        this.children = [];
        this.visits = 0;
        this.wins = 0;
        this.untriedMoves = this.getValidMoves();
        
        // RAVE (Rapid Action Value Estimation) 相关
        this.raveVisits = new Map(); // 记录每个移动的RAVE访问次数
        this.raveWins = new Map();   // 记录每个移动的RAVE胜利次数
        
        // 先验知识
        this.priorValue = this.calculatePriorValue();
    }

    // 计算先验价值 - 基于位置和开局定式
    calculatePriorValue() {
        if (!this.move) return 0;
        
        const BOARD_SIZE = getBoardSize();
        const positionValues = POSITION_VALUES[BOARD_SIZE];
        
        if (!positionValues) return 0;
        
        // 位置价值
        const posValue = positionValues[this.move.r] ? positionValues[this.move.r][this.move.c] || 0 : 0;
        
        // 开局定式加成
        const openingPatterns = OPENING_PATTERNS[BOARD_SIZE] || [];
        const isOpeningMove = openingPatterns.some(pattern => 
            pattern.r === this.move.r && pattern.c === this.move.c
        );
        
        return posValue + (isOpeningMove ? 5 : 0);
    }
    
    getValidMoves() {
        const moves = [];
        const BOARD_SIZE = getBoardSize();
        const totalStones = this.board.flat().filter(cell => cell !== null).length;
        
        // 开局阶段优先考虑定式
        if (totalStones < 8) {
            const openingMoves = this.getOpeningMoves();
            if (openingMoves.length > 0) {
                return openingMoves;
            }
        }
        
        // 获取所有有效移动并按价值排序
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (isValidMove(r, c, this.color, this.board, false, getLastMove())) {
                    const move = { r, c };
                    move.value = this.evaluateMoveValue(r, c);
                    moves.push(move);
                }
            }
        }
        
        // 按价值排序，保留前70%的移动以减少搜索空间
        moves.sort((a, b) => b.value - a.value);
        const keepCount = Math.max(Math.min(moves.length, 20), Math.ceil(moves.length * 0.7));
        return moves.slice(0, keepCount);
    }
    
    // 获取开局移动
    getOpeningMoves() {
        const BOARD_SIZE = getBoardSize();
        const openingPatterns = OPENING_PATTERNS[BOARD_SIZE] || [];
        const validOpeningMoves = [];
        
        for (const pattern of openingPatterns) {
            if (isValidMove(pattern.r, pattern.c, this.color, this.board, false, getLastMove())) {
                validOpeningMoves.push({ r: pattern.r, c: pattern.c, value: 10 });
            }
        }
        
        return validOpeningMoves;
    }
    
    // 评估移动价值
    evaluateMoveValue(r, c) {
        const BOARD_SIZE = getBoardSize();
        const positionValues = POSITION_VALUES[BOARD_SIZE];
        
        let value = 0;
        
        // 位置价值
        if (positionValues && positionValues[r] && positionValues[r][c]) {
            value += positionValues[r][c];
        }
        
        // 局部模式价值
        value += this.evaluateLocalPattern(r, c);
        
        // 战术价值（吃子、逃跑等）
        value += this.evaluateTacticalValue(r, c);
        
        return value;
    }
    
    // 评估局部模式
    evaluateLocalPattern(r, c) {
        let value = 0;
        const BOARD_SIZE = getBoardSize();
        
        // 检查周围的棋子分布
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (this.board[nr][nc] === this.color) {
                        value += Math.max(0, 3 - Math.abs(dr) - Math.abs(dc)); // 靠近己方棋子
                    } else if (this.board[nr][nc] !== null) {
                        value += Math.max(0, 2 - Math.abs(dr) - Math.abs(dc)); // 靠近对方棋子
                    }
                }
            }
        }
        
        return value;
    }
    
    // 评估战术价值
    evaluateTacticalValue(r, c) {
        let value = 0;
        
        // 模拟落子后的提子情况
        const testBoard = this.board.map(row => [...row]);
        testBoard[r][c] = this.color;
        
        const captures = checkCapturesSimulation(testBoard, this.color);
        if (captures && captures.length > 0) {
            value += captures.length * 10; // 提子价值很高
        }
        
        // 检查是否能逃脱被提
        const opponentColor = this.color === 'black' ? 'white' : 'black';
        testBoard[r][c] = opponentColor;
        const wouldBeCaptured = checkCapturesSimulation(testBoard, opponentColor);
        if (wouldBeCaptured && wouldBeCaptured.some(pos => pos.r === r && pos.c === c)) {
            value -= 5; // 避免被提
        }
        
        return value;
    }

    isFullyExpanded() {
        return this.untriedMoves.length === 0;
    }

    isTerminal() {
        return this.getValidMoves().length === 0;
    }

    // 改进的UCB公式，结合RAVE和先验知识
    selectChild() {
        const c = 1.4; // 调整后的探索参数
        const raveWeight = 0.3; // RAVE权重
        
        return this.children.reduce((best, child) => {
            // 标准UCB1值
            const ucb1 = child.visits > 0 ? 
                child.wins / child.visits + c * Math.sqrt(Math.log(this.visits) / child.visits) : 
                Infinity;
            
            // RAVE值
            const moveKey = `${child.move.r},${child.move.c}`;
            const raveVisits = this.raveVisits.get(moveKey) || 0;
            const raveWins = this.raveWins.get(moveKey) || 0;
            const raveValue = raveVisits > 0 ? raveWins / raveVisits : 0.5;
            
            // 先验知识加成
            const priorBonus = child.priorValue / (child.visits + 1) * 0.1;
            
            // 组合UCB-RAVE值
            const beta = raveVisits / (raveVisits + child.visits + 4 * raveVisits * child.visits * 0.0001);
            const combinedValue = (1 - beta) * ucb1 + beta * (raveValue + c * Math.sqrt(Math.log(this.visits) / Math.max(1, raveVisits))) + priorBonus;
            
            if (!best) return child;
            
            const bestMoveKey = `${best.move.r},${best.move.c}`;
            const bestRaveVisits = this.raveVisits.get(bestMoveKey) || 0;
            const bestRaveWins = this.raveWins.get(bestMoveKey) || 0;
            const bestRaveValue = bestRaveVisits > 0 ? bestRaveWins / bestRaveVisits : 0.5;
            const bestPriorBonus = best.priorValue / (best.visits + 1) * 0.1;
            
            const bestUcb1 = best.visits > 0 ? 
                best.wins / best.visits + c * Math.sqrt(Math.log(this.visits) / best.visits) : 
                Infinity;
            const bestBeta = bestRaveVisits / (bestRaveVisits + best.visits + 4 * bestRaveVisits * best.visits * 0.0001);
            const bestCombinedValue = (1 - bestBeta) * bestUcb1 + bestBeta * (bestRaveValue + c * Math.sqrt(Math.log(this.visits) / Math.max(1, bestRaveVisits))) + bestPriorBonus;
            
            return combinedValue > bestCombinedValue ? child : best;
        });
    }

    // 扩展节点
    expand() {
        if (this.untriedMoves.length === 0) return null;
        
        const moveIndex = Math.floor(Math.random() * this.untriedMoves.length);
        const move = this.untriedMoves.splice(moveIndex, 1)[0];
        
        const newBoard = this.board.map(row => [...row]);
        newBoard[move.r][move.c] = this.color;
        
        // 移除被提取的棋子
        removeCapturedStones(newBoard, this.color);
        
        const nextColor = this.color === 'black' ? 'white' : 'black';
        const child = new MCTSNode(newBoard, nextColor, move, this);
        this.children.push(child);
        return child;
    }

    // 智能模拟游戏 - 使用启发式策略而非完全随机
    simulate() {
        let currentBoard = this.board.map(row => [...row]);
        let currentColor = this.color;
        let moveCount = 0;
        const maxMoves = Math.min(25, getBoardSize()); // 根据棋盘大小动态调整模拟深度
        const playedMoves = []; // 记录模拟中的移动用于RAVE
        
        while (moveCount < maxMoves) {
            const validMoves = this.getValidMovesForBoard(currentBoard, currentColor);
            
            if (validMoves.length === 0) break;
            
            // 使用启发式选择而非完全随机
            const selectedMove = this.selectSimulationMove(validMoves, currentBoard, currentColor);
            currentBoard[selectedMove.r][selectedMove.c] = currentColor;
            playedMoves.push({move: selectedMove, color: currentColor});
            
            // 执行提子
            removeCapturedStones(currentBoard, currentColor);
            
            currentColor = currentColor === 'black' ? 'white' : 'black';
            moveCount++;
        }
        
        // 改进的评估函数
        const result = this.improvedEvaluate(currentBoard);
        
        // 更新RAVE统计
        this.updateRaveStatistics(playedMoves, result);
        
        return result;
    }
    
    // 模拟中的移动选择 - 结合随机性和启发式
    selectSimulationMove(validMoves, board, color) {
        // 80%概率使用启发式，20%概率随机
        if (Math.random() < 0.8) {
            // 评估每个移动的即时价值
            const scoredMoves = validMoves.map(move => ({
                ...move,
                score: this.evaluateSimulationMove(move, board, color)
            }));
            
            // 按分数排序，从前30%中随机选择
            scoredMoves.sort((a, b) => b.score - a.score);
            const topCount = Math.max(1, Math.ceil(scoredMoves.length * 0.3));
            const topMoves = scoredMoves.slice(0, topCount);
            
            return topMoves[Math.floor(Math.random() * topMoves.length)];
        } else {
            // 完全随机选择
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
    }
    
    // 评估模拟中移动的价值
    evaluateSimulationMove(move, board, color) {
        let score = 0;
        
        // 检查是否能提子
        const testBoard = board.map(row => [...row]);
        testBoard[move.r][move.c] = color;
        const captures = checkCapturesSimulation(testBoard, color);
        if (captures && captures.length > 0) {
            score += captures.length * 20; // 提子价值很高
        }
        
        // 位置价值
        const BOARD_SIZE = getBoardSize();
        const positionValues = POSITION_VALUES[BOARD_SIZE];
        if (positionValues && positionValues[move.r] && positionValues[move.r][move.c]) {
            score += positionValues[move.r][move.c];
        }
        
        // 连接性价值 - 靠近己方棋子
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = move.r + dr, nc = move.c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (board[nr][nc] === color) {
                        score += 3;
                    }
                }
            }
        }
        
        return score;
    }
    
    // 更新RAVE统计
    updateRaveStatistics(playedMoves, result) {
        for (const {move, color} of playedMoves) {
            const moveKey = `${move.r},${move.c}`;
            
            // 只更新与当前节点颜色相同的移动
            if (color === this.color) {
                const currentVisits = this.raveVisits.get(moveKey) || 0;
                const currentWins = this.raveWins.get(moveKey) || 0;
                
                this.raveVisits.set(moveKey, currentVisits + 1);
                this.raveWins.set(moveKey, currentWins + result);
            }
        }
    }
    
    // 快速获取有效移动（优化版）
    getValidMovesForBoard(board, color) {
        const moves = [];
        const BOARD_SIZE = getBoardSize();
        
        // 智能采样：在模拟中减少搜索空间
        const step = BOARD_SIZE > 13 ? 2 : 1;
        
        for (let r = 0; r < BOARD_SIZE; r += step) {
            for (let c = 0; c < BOARD_SIZE; c += step) {
                if (board[r][c] === null) {
                    // 简单的有效性检查，避免明显的自杀手
                    if (this.isReasonableMove(r, c, board, color)) {
                        moves.push({ r, c });
                    }
                }
            }
        }
        
        // 如果移动太少，放宽限制
        if (moves.length < 5 && step > 1) {
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (board[r][c] === null && this.isReasonableMove(r, c, board, color)) {
                        moves.push({ r, c });
                    }
                }
            }
        }
        
        return moves;
    }
    
    // 合理移动检查
    isReasonableMove(r, c, board, color) {
        const BOARD_SIZE = getBoardSize();
        
        // 检查是否有相邻的己方棋子或空位
        let hasLiberty = false;
        let hasConnection = false;
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (board[nr][nc] === null) {
                        hasLiberty = true;
                    } else if (board[nr][nc] === color) {
                        hasConnection = true;
                    }
                }
            }
        }
        
        // 避免明显的自杀手（除非能提子）
        return hasLiberty || hasConnection;
    }
    
    // 改进的评估函数
    improvedEvaluate(board) {
        const BOARD_SIZE = getBoardSize();
        let blackScore = 0, whiteScore = 0;
        
        // 计算棋子数量和位置价值
        const positionValues = POSITION_VALUES[BOARD_SIZE];
        
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] === 'black') {
                    blackScore += 1;
                    if (positionValues && positionValues[r] && positionValues[r][c]) {
                        blackScore += positionValues[r][c] * 0.1;
                    }
                } else if (board[r][c] === 'white') {
                    whiteScore += 1;
                    if (positionValues && positionValues[r] && positionValues[r][c]) {
                        whiteScore += positionValues[r][c] * 0.1;
                    }
                }
            }
        }
        
        // 计算连接性和形状
        blackScore += this.evaluateConnectivity(board, 'black') * 0.5;
        whiteScore += this.evaluateConnectivity(board, 'white') * 0.5;
        
        // 返回当前玩家的胜负概率
        const aiColor = this.color;
        if (aiColor === 'black') {
            return blackScore > whiteScore ? 0.7 : (blackScore === whiteScore ? 0.5 : 0.3);
        } else {
            return whiteScore > blackScore ? 0.7 : (whiteScore === blackScore ? 0.5 : 0.3);
        }
    }
    
    // 评估连接性
    evaluateConnectivity(board, color) {
        const BOARD_SIZE = getBoardSize();
        let connectivity = 0;
        
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] === color) {
                    // 计算相邻的同色棋子数量
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                                if (board[nr][nc] === color) {
                                    connectivity += 0.5;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return connectivity;
    }

    // 反向传播结果（包含RAVE更新）
    backpropagate(result) {
        this.visits++;
        this.wins += result;
        
        // 传播RAVE统计到父节点
        if (this.parent) {
            for (const [moveKey, visits] of this.raveVisits.entries()) {
                const wins = this.raveWins.get(moveKey) || 0;
                const parentVisits = this.parent.raveVisits.get(moveKey) || 0;
                const parentWins = this.parent.raveWins.get(moveKey) || 0;
                
                this.parent.raveVisits.set(moveKey, parentVisits + visits);
                this.parent.raveWins.set(moveKey, parentWins + wins);
            }
            
            this.parent.backpropagate(1 - result); // 对手的结果相反
        }
    }

    // 获取最佳移动（结合访问次数和胜率）
    getBestMove() {
        if (this.children.length === 0) return null;
        
        // 使用更稳健的选择策略
        return this.children.reduce((best, child) => {
            const childScore = child.visits > 0 ? child.wins / child.visits : 0;
            const bestScore = best.visits > 0 ? best.wins / best.visits : 0;
            
            // 优先选择访问次数多且胜率高的移动
            const childValue = childScore + Math.log(child.visits + 1) * 0.1;
            const bestValue = bestScore + Math.log(best.visits + 1) * 0.1;
            
            return childValue > bestValue ? child : best;
        }).move;
    }
}

// 蒙特卡洛树搜索主函数
// 异步MCTS算法，分批执行避免阻塞UI
async function mcts(board, color, simulations) {
    const root = new MCTSNode(board, color);
    const batchSize = Math.min(30, Math.max(15, Math.floor(simulations / 15))); // 优化批大小
    let completed = 0;
    
    // 早期终止条件：如果找到明显的好手
    let bestMoveStable = 0;
    let lastBestMove = null;
    
    while (completed < simulations) {
        const currentBatch = Math.min(batchSize, simulations - completed);
        
        // 执行一批模拟
        for (let i = 0; i < currentBatch; i++) {
            let node = root;
            const path = []; // 记录路径用于RAVE
            
            // 选择阶段
            while (!node.isTerminal() && node.isFullyExpanded()) {
                node = node.selectChild();
                if (node && node.move) {
                    path.push({move: node.move, color: node.color});
                }
            }
            
            // 扩展阶段
            if (!node.isTerminal() && !node.isFullyExpanded()) {
                const expandedNode = node.expand();
                if (expandedNode) {
                    node = expandedNode;
                    if (node.move) {
                        path.push({move: node.move, color: node.color});
                    }
                }
            }
            
            // 模拟阶段
            const result = node ? node.simulate() : 0.5;
            
            // 反向传播阶段
            if (node) {
                node.backpropagate(result);
                
                // 更新路径上所有节点的RAVE统计
                updatePathRave(path, result, root);
            }
        }
        
        completed += currentBatch;
        
        // 早期终止检查
        if (completed >= simulations * 0.3) {
            const currentBestMove = root.getBestMove();
            if (currentBestMove && lastBestMove && 
                currentBestMove.r === lastBestMove.r && currentBestMove.c === lastBestMove.c) {
                bestMoveStable++;
                if (bestMoveStable >= 3 && completed >= simulations * 0.6) {
                    break; // 最佳移动已稳定，可以提前结束
                }
            } else {
                bestMoveStable = 0;
            }
            lastBestMove = currentBestMove;
        }
        
        // 让出控制权给浏览器，避免阻塞UI
        if (completed < simulations) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }
    
    return root.getBestMove();
}

// 更新路径RAVE统计
function updatePathRave(path, result, root) {
    for (const {move, color} of path) {
        const moveKey = `${move.r},${move.c}`;
        
        // 更新根节点的RAVE统计
        if (color === root.color) {
            const currentVisits = root.raveVisits.get(moveKey) || 0;
            const currentWins = root.raveWins.get(moveKey) || 0;
            
            root.raveVisits.set(moveKey, currentVisits + 1);
            root.raveWins.set(moveKey, currentWins + result);
        }
    }
}

// 获取AI难度设置
function getAIDifficulty() {
    const difficultySelect = document.getElementById('aiDifficulty');
    if (!difficultySelect) return 2; // 默认中等难度
    
    const difficulty = parseInt(difficultySelect.value);
    const BOARD_SIZE = getBoardSize();
    
    // 根据棋盘大小和难度动态调整模拟次数
    const baseSimulations = {
        1: 150,   // 简单 - 提升基础智能
        2: 600,   // 中等 - 平衡性能和智能
        3: 1200,  // 困难 - 更深入的搜索
        4: 2500   // 专家 - 接近专业水平
    };
    
    const base = baseSimulations[difficulty] || 600;
    
    // 小棋盘可以承受更多模拟
    const sizeMultiplier = BOARD_SIZE <= 9 ? 1.5 : (BOARD_SIZE <= 13 ? 1.2 : 1.0);
    
    return Math.floor(base * sizeMultiplier);
}

export async function aiMove(ctx, canvas) {
    setIsAiThinking(true);
    setPlayerCanMove(false);
    
    const currentBoard = getBoard();
    const aiColor = getCurrentPlayer();
    const simulations = getAIDifficulty();
    
    try {
        // 使用异步MCTS算法选择最佳移动
        const bestMove = await mcts(currentBoard, aiColor, simulations);
        
        if (bestMove) {
            await placeStoneAndUpdate(bestMove.r, bestMove.c, aiColor, ctx, canvas, () => {
                setIsAiThinking(false);
                setPlayerCanMove(true);
            });
        } else {
            // AI无法找到有效移动，弃权
            console.log("AI passes");
            setIsAiThinking(false);
            setPlayerCanMove(true);
        }
    } catch (error) {
        console.error('AI思考或落子出错:', error);
        setIsAiThinking(false);
        setPlayerCanMove(true);
    }
}