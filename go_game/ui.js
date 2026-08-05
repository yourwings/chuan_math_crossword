
import { drawBoard, initBoardState, getStoneLibertiesAt, getMoveValidation } from './board.js';
import { aiMove } from './ai.js';
import { startGame, resetGame, getBoard, getCurrentPlayer, getBlackCaptures, getWhiteCaptures, getGameEnded, calculateScore, getGameStarted, getIsAiThinking, placeStoneAndUpdate, checkGameEnd, switchPlayer, getBoardSize, setBoardSize, getBlackTime, getWhiteTime, getCurrentTurnTime, getMoveHistory, getDebugLog, getLastMove, getConsecutivePasses, getLastAction, registerPass } from './gameLogic.js';

const canvas = document.getElementById('goBoard');
const ctx = canvas.getContext('2d');
const statusDiv = document.getElementById('status');
const blackCapturesSpan = document.getElementById('blackCaptures');
const whiteCapturesSpan = document.getElementById('whiteCaptures');
const startGameBtn = document.getElementById('startGameButton');
const resetGameBtn = document.getElementById('resetButton');
const passButton = document.getElementById('passButton');
const homeBtn = document.getElementById('homeButton');
const blackTimerSpan = document.getElementById('blackTimer');
const whiteTimerSpan = document.getElementById('whiteTimer');
const boardSizeSelect = document.getElementById('boardSize');
const blackScoreSpan = document.getElementById('blackScore');
const whiteScoreSpan = document.getElementById('whiteScore');
const gameEndModal = document.getElementById('gameEndModal');
const gameEndTitle = document.getElementById('gameEndTitle');
const gameEndContent = document.getElementById('gameEndContent');
const closeModal = document.getElementById('closeModal');
const closeModalButton = document.getElementById('closeModalButton');
const debugButton = document.getElementById('debugButton');
const debugInfo = document.getElementById('debugInfo');
const debugContent = document.getElementById('debugContent');
const helperText = document.getElementById('helperText');
const lastMoveInfo = document.getElementById('lastMoveInfo');
const passInfo = document.getElementById('passInfo');

let hoverMove = null;

// 格式化时间显示
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatBoardPoint(row, col) {
    return `第 ${row + 1} 行，第 ${col + 1} 列`;
}

function renderBoard() {
    const previewAllowed =
        hoverMove &&
        getGameStarted() &&
        !getGameEnded() &&
        currentGameState === GAME_STATE.WAITING_FOR_PLAYER &&
        getCurrentPlayer() === 'black' &&
        getMoveValidation(hoverMove.row, hoverMove.col, 'black', getBoard()).valid;

    drawBoard(getBoard(), ctx, canvas, {
        lastMove: getLastMove(),
        hoverMove: previewAllowed ? hoverMove : null,
        hoverColor: 'black'
    });
}

function updateHelperPanels() {
    const lastAction = getLastAction();
    const passCount = getConsecutivePasses();

    if (helperText) {
        if (!getGameStarted()) {
            helperText.textContent = '先选择棋盘大小和 AI 难度，再点击“开始游戏”。黑棋先行。';
        } else if (getGameEnded()) {
            helperText.textContent = '对局已结束，可以查看结果后重新开始。';
        } else if (getIsAiThinking()) {
            helperText.textContent = 'AI 正在思考。你可以查看实时分数、提子和最近一步。';
        } else if (getCurrentPlayer() === 'black') {
            helperText.textContent = '轮到你落子。可直接点击棋盘，或在局面不利于继续收官时选择“停一手”。';
        } else {
            helperText.textContent = '当前是白棋（AI）回合，请稍候。';
        }
    }

    if (lastMoveInfo) {
        if (!lastAction) {
            lastMoveInfo.textContent = '暂无落子';
        } else if (lastAction.type === 'pass') {
            lastMoveInfo.textContent = `${lastAction.player === 'black' ? '黑棋' : '白棋'}刚刚选择了停一手`;
        } else {
            const captureText = lastAction.capturedStones > 0 ? `，提了 ${lastAction.capturedStones} 子` : '';
            lastMoveInfo.textContent = `${lastAction.player === 'black' ? '黑棋' : '白棋'}落在 ${formatBoardPoint(lastAction.row, lastAction.col)}${captureText}`;
        }
    }

    if (passInfo) {
        if (passCount === 0) {
            passInfo.textContent = '目前没有连续停一手。双方连续停一手 2 次会结束对局并开始计分。';
        } else {
            passInfo.textContent = `当前已连续停一手 ${passCount} 次，再出现 1 次连续停一手就会结束对局。`;
        }
    }
}



export function updateStatus() {
    // 更新状态文本
    if (!getGameStarted()) {
        statusDiv.innerHTML = `<div style="color: #2c3e50; font-weight: bold;">等待开局</div><div style="font-size: 12px; color: #7f8c8d;">黑棋先行，点击“开始游戏”后即可落子</div>`;
    } else if (getGameEnded()) {
        const score = calculateScore();
        statusDiv.innerHTML = `<div style="color: #e74c3c; font-weight: bold;">对局结束</div><div style="font-size: 14px; margin-top: 5px;">${score.black > score.white ? '黑棋胜' : '白棋胜'}，结果以终局计分为准</div>`;
    } else if (getIsAiThinking()) {
        statusDiv.innerHTML = `<div style="color: #f39c12;">白棋（AI）思考中...</div><div style="font-size: 12px; color: #7f8c8d;">请稍候，思考期间你无法落子</div>`;
    } else {
        const playerName = getCurrentPlayer() === 'black' ? '黑棋' : '白棋';
        const hint = getCurrentPlayer() === 'black' ? '请点击棋盘落子，或选择停一手' : '等待白棋（AI）行动';
        statusDiv.innerHTML = `<div style="color: #2c3e50;">${playerName}回合</div><div style="font-size: 12px; color: #7f8c8d;">${hint}</div>`;
    }
    
    // 更新实时分数
    const score = calculateScore();
    if (blackScoreSpan) blackScoreSpan.textContent = score.black.toFixed(1);
    if (whiteScoreSpan) whiteScoreSpan.textContent = score.white.toFixed(1);
    
    // 更新提子数
    blackCapturesSpan.textContent = getBlackCaptures();
    whiteCapturesSpan.textContent = getWhiteCaptures();
    
    // 更新计时器显示（总时间 + 当前回合时间）
    const currentTurnTime = getCurrentTurnTime();
    if (getCurrentPlayer() === 'black') {
        blackTimerSpan.textContent = formatTime(getBlackTime() + currentTurnTime);
        whiteTimerSpan.textContent = formatTime(getWhiteTime());
    } else {
        blackTimerSpan.textContent = formatTime(getBlackTime());
        whiteTimerSpan.textContent = formatTime(getWhiteTime() + currentTurnTime);
    }

    updateHelperPanels();
}

let lastToastMessage = '';
let lastToastTime = 0;
let toastTimeout = null;

export function showToast(message) {
    const toast = document.getElementById('toast');
    const now = Date.now();
    
    // 防抖：如果是相同消息且在2秒内，则不重复显示
    if (message === lastToastMessage && (now - lastToastTime) < 2000) {
        return;
    }
    
    // 清除之前的定时器
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    // 支持换行显示
    toast.innerHTML = message.replace(/\n/g, '<br>');
    toast.className = 'show';
    
    lastToastMessage = message;
    lastToastTime = now;
    
    toastTimeout = setTimeout(() => {
        toast.className = toast.className.replace('show', '');
        toastTimeout = null;
    }, 3000); // 减少显示时间到3秒，避免过长遮挡
}

// 清除当前显示的toast
export function clearToast() {
    const toast = document.getElementById('toast');
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
    toast.className = toast.className.replace('show', '');
    lastToastMessage = '';
    lastToastTime = 0;
}

// Debug功能
function toggleDebugInfo() {
    if (debugInfo.style.display === 'none') {
        debugInfo.style.display = 'block';
        updateDebugDisplay();
        debugButton.textContent = '隐藏调试';
    } else {
        debugInfo.style.display = 'none';
        debugButton.textContent = '调试信息';
    }
}

function updateDebugDisplay() {
    const logs = getDebugLog();
    if (logs.length === 0) {
        debugContent.textContent = '暂无调试信息';
        return;
    }
    
    let debugText = '';
    logs.forEach((log) => {
        debugText += `=== ${log.move > 0 ? `第${log.move}手` : '事件'} (${log.timestamp}) ===\n`;
        
        // 根据不同类型显示不同信息
        switch(log.type) {
            case 'valid_move':
                debugText += `类型: 有效落子\n`;
                debugText += `玩家: ${log.player === 'black' ? '黑棋' : '白棋'}\n`;
                debugText += `位置: ${log.position}\n`;
                debugText += `提子数: ${log.capturedStones}\n`;
                if (log.capturedPositions && log.capturedPositions.length > 0) {
                    debugText += `被提位置: ${log.capturedPositions.join(', ')}\n`;
                }
                debugText += `黑棋总提子: ${log.blackCaptures}\n`;
                debugText += `白棋总提子: ${log.whiteCaptures}\n`;
                break;
                
            case 'invalid_move':
                debugText += `类型: 无效落子\n`;
                debugText += `玩家: ${log.player === 'black' ? '黑棋' : '白棋'}\n`;
                debugText += `位置: ${log.position}\n`;
                debugText += `失败原因: ${log.reason}\n`;
                break;
                
            case 'player_switch':
                debugText += `类型: 回合切换\n`;
                debugText += `从: ${log.from === 'black' ? '黑棋' : '白棋'}\n`;
                debugText += `到: ${log.to === 'black' ? '黑棋' : '白棋'}\n`;
                break;
                
            case 'ai_thinking_start':
                debugText += `类型: AI开始思考\n`;
                debugText += `AI颜色: ${log.player === 'black' ? '黑棋' : '白棋'}\n`;
                debugText += `模拟次数: ${log.simulations}\n`;
                debugText += `棋盘大小: ${log.boardSize}x${log.boardSize}\n`;
                break;
                
            case 'ai_move_selected':
                debugText += `类型: AI选择移动\n`;
                debugText += `AI颜色: ${log.player === 'black' ? '黑棋' : '白棋'}\n`;
                debugText += `选择位置: ${log.position}\n`;
                debugText += `访问次数: ${log.visits}\n`;
                debugText += `胜率: ${log.winRate}\n`;
                break;
                
            case 'ai_pass':
                debugText += `类型: AI弃权\n`;
                debugText += `AI颜色: ${log.player === 'black' ? '黑棋' : '白棋'}\n`;
                debugText += `原因: ${log.reason}\n`;
                break;
                
            case 'ai_error':
                debugText += `类型: AI错误\n`;
                debugText += `AI颜色: ${log.player === 'black' ? '黑棋' : '白棋'}\n`;
                debugText += `错误信息: ${log.error}\n`;
                break;
                
            default:
                debugText += `类型: ${log.type}\n`;
                if (log.player) {
                    debugText += `玩家: ${log.player === 'black' ? '黑棋' : '白棋'}\n`;
                }
        }
        
        debugText += '\n';
    });
    
    debugContent.textContent = debugText;
}

// 处理游戏结束
function handleGameEnd(gameEndResult) {
    updateStatus();
    
    const score = gameEndResult.score;
    let endTitle = '游戏结束';
    let endReason = '';
    
    if (gameEndResult.reason === 'consecutive_passes') {
        endReason = '双方连续停一手，进入终局计分';
    } else if (gameEndResult.reason === 'no_valid_moves') {
        endReason = '棋盘上已没有合法落点';
    }
    
    // 构建弹窗内容
    const modalContent = `
        <div class="game-result">
            <h3>${endReason}</h3>
            <div class="winner-announcement">
                <strong>${score.chineseRules.result}</strong>
            </div>
        </div>
        
        <div class="score-details">
            <h4>详细计分</h4>
            <div class="score-breakdown">
                <div class="score-item">
                    <span class="score-label">黑棋总分：</span>
                    <span class="score-value">${score.chineseRules.blackTotal}</span>
                </div>
                <div class="score-item">
                    <span class="score-label">白棋总分：</span>
                    <span class="score-value">${score.chineseRules.whiteTotal}</span>
                </div>
            </div>
        </div>
        
        <div class="territory-details">
            <h4>领地统计</h4>
            <div class="territory-breakdown">
                <div class="territory-item">
                    <span class="territory-label">黑棋领地：</span>
                    <span class="territory-value">${score.blackTerritory}目</span>
                </div>
                <div class="territory-item">
                    <span class="territory-label">白棋领地：</span>
                    <span class="territory-value">${score.whiteTerritory}目</span>
                </div>
            </div>
        </div>
        
        <div class="capture-details">
            <h4>提子统计</h4>
            <div class="capture-breakdown">
                <div class="capture-item">
                    <span class="capture-label">黑棋提子：</span>
                    <span class="capture-value">${score.blackCaptures}子</span>
                </div>
                <div class="capture-item">
                    <span class="capture-label">白棋提子：</span>
                    <span class="capture-value">${score.whiteCaptures}子</span>
                </div>
            </div>
        </div>
        
        <div class="time-summary">
            <h4>用时统计</h4>
            <div class="time-breakdown">
                <div class="time-item">
                    <span class="time-label">黑棋总用时：</span>
                    <span class="time-value">${formatTime(getBlackTime())}</span>
                </div>
                <div class="time-item">
                    <span class="time-label">白棋总用时：</span>
                    <span class="time-value">${formatTime(getWhiteTime())}</span>
                </div>
            </div>
        </div>
        
        <div class="move-history">
            <h4>落子历史</h4>
            <div class="move-list">
                ${getMoveHistory().map(move => {
                    const playerName = move.player === 'black' ? '黑棋' : '白棋';
                    if (move.type === 'pass') {
                        return `<div class="move-item">
                            <span class="move-number">${move.moveNumber}.</span>
                            <span class="move-player ${move.player}">${playerName}</span>
                            <span class="move-position">停一手</span>
                            <span class="move-capture"></span>
                        </div>`;
                    }
                    const captureText = move.capturedStones > 0 ? ` (提${move.capturedStones}子)` : '';
                    return `<div class="move-item">
                        <span class="move-number">${move.moveNumber}.</span>
                        <span class="move-player ${move.player}">${playerName}</span>
                        <span class="move-position">(${move.position.row + 1}, ${move.position.col + 1})</span>
                        <span class="move-capture">${captureText}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>
        
        <div class="rules-info">
            <h4>计分规则</h4>
            <p><strong>贴目规则：</strong>${score.chineseRules.komiRule}</p>
            <p><strong>计分方法：</strong>${score.chineseRules.scoringMethod.replace(/\n/g, '<br>')}</p>
        </div>
    `;
    
    // 显示弹窗
    gameEndTitle.textContent = endTitle;
    gameEndContent.innerHTML = modalContent;
    gameEndModal.style.display = 'block';
}

// 游戏状态枚举
const GAME_STATE = {
    WAITING_FOR_PLAYER: 'waiting_for_player',
    PROCESSING_MOVE: 'processing_move',
    AI_THINKING: 'ai_thinking',
    GAME_ENDED: 'game_ended'
};

let currentGameState = GAME_STATE.WAITING_FOR_PLAYER;

function getBoardPositionFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellSize = canvas.width / (getBoardSize() + 1);

    return {
        row: Math.round((y - cellSize) / cellSize),
        col: Math.round((x - cellSize) / cellSize)
    };
}

function handleBoardHover(event) {
    if (!getGameStarted() || getGameEnded() || currentGameState !== GAME_STATE.WAITING_FOR_PLAYER) {
        if (hoverMove) {
            hoverMove = null;
            renderBoard();
        }
        return;
    }

    const { row, col } = getBoardPositionFromEvent(event);
    const nextHover =
        row >= 0 && row < getBoardSize() && col >= 0 && col < getBoardSize()
            ? { row, col }
            : null;

    if (
        (hoverMove && !nextHover) ||
        (!hoverMove && nextHover) ||
        (hoverMove && nextHover && (hoverMove.row !== nextHover.row || hoverMove.col !== nextHover.col))
    ) {
        hoverMove = nextHover;
        renderBoard();
    }
}

function clearHover() {
    if (hoverMove) {
        hoverMove = null;
        renderBoard();
    }
}

export function handleBoardClick(event) {
    // 基础游戏状态检查
    if (!getGameStarted()) {
        showToast("请先点击\"开始游戏\"按钮！");
        return;
    }
    if (getGameEnded()) {
        showToast("游戏已结束，请重新开始！");
        return;
    }
    
    // 严格的状态机检查 - 只有在等待玩家状态下才能落子
    if (currentGameState !== GAME_STATE.WAITING_FOR_PLAYER) {
        // 只在用户首次点击时显示提示，避免频繁显示
        if (currentGameState === GAME_STATE.AI_THINKING) {
            showToast("AI正在思考中...");
        } else if (currentGameState === GAME_STATE.PROCESSING_MOVE) {
            showToast("正在处理落子中...");
        }
        return;
    }
    
    // 只有黑棋（人类玩家）可以通过点击落子
    if (getCurrentPlayer() !== 'black') {
        showToast("当前不是您的回合！");
        return;
    }

    // 立即切换到处理状态，阻止后续点击
    currentGameState = GAME_STATE.PROCESSING_MOVE;
    
    // 获取点击位置
    const { row, col } = getBoardPositionFromEvent(event);

    // 验证落子位置
    if (!isValidClickPosition(row, col)) {
        currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
        return;
    }

    // 执行落子
    executePlayerMove(row, col);
}

// 验证点击位置是否有效
function isValidClickPosition(row, col) {
    // 检查是否在棋盘范围内
    if (row < 0 || row >= getBoardSize() || col < 0 || col >= getBoardSize()) {
        showToast("请点击棋盘内的有效位置！");
        return false;
    }

    // 检查位置是否已有棋子
    const currentBoard = getBoard();
    if (currentBoard[row][col] !== 'empty') {
        const liberties = getStoneLibertiesAt(row, col, currentBoard);
        const color = currentBoard[row][col] === 'black' ? '黑棋' : '白棋';
        showToast(`${color}棋子，当前气数: ${liberties}`);
        return false;
    }
    
    const validation = getMoveValidation(row, col, 'black', currentBoard);
    if (!validation.valid) {
        if (validation.reason === 'suicide') {
            showToast('这里会形成自杀手，且无法提子，不能落子。');
        } else {
            showToast('该位置不符合围棋规则，不能落子。');
        }
        return false;
    }

    return true;
}

// 执行玩家落子
function executePlayerMove(row, col) {
    const playerColor = 'black'; // 人类玩家固定为黑棋
    
    placeStoneAndUpdate(row, col, playerColor, ctx, canvas, () => {
        // 落子动画完成后的回调
        // 检查游戏是否结束
        const gameEndResult = checkGameEnd();
        if (gameEndResult.ended) {
            currentGameState = GAME_STATE.GAME_ENDED;
            renderBoard();
            handleGameEnd(gameEndResult);
            return;
        }   
        
        // 切换到AI回合
        switchPlayer();
        updateStatus(); // 更新状态显示AI回合
        
        // 开始AI思考
        startAITurn();
        
        // 更新debug显示
        if (debugInfo.style.display === 'block') {
            updateDebugDisplay();
        }

        renderBoard();
        
    }).then(success => {
        if (!success) {
            // 落子失败，恢复等待状态
            currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
            showToast("无效的落子位置！");
            renderBoard();
        }
    }).catch(error => {
        // 出错时恢复等待状态
        currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
        console.error('落子出错:', error);
        showToast("落子出错，请重试！");
        renderBoard();
    });
}

function executePlayerPass() {
    if (!getGameStarted()) {
        showToast('请先开始游戏。');
        return;
    }
    if (getGameEnded()) {
        showToast('对局已结束，请重新开始。');
        return;
    }
    if (currentGameState !== GAME_STATE.WAITING_FOR_PLAYER || getCurrentPlayer() !== 'black') {
        showToast('当前不能停一手，请等待你的回合。');
        return;
    }

    currentGameState = GAME_STATE.PROCESSING_MOVE;
    registerPass('black');
    showToast('黑棋选择停一手。');

    const gameEndResult = checkGameEnd();
    if (gameEndResult.ended) {
        currentGameState = GAME_STATE.GAME_ENDED;
        updateStatus();
        renderBoard();
        handleGameEnd(gameEndResult);
        return;
    }

    switchPlayer();
    updateStatus();
    renderBoard();
    startAITurn();
}

// 开始AI回合
function startAITurn() {
    currentGameState = GAME_STATE.AI_THINKING;
    
    // 清除之前的toast提示，避免干扰
    clearToast();
    
    setTimeout(() => {
        aiMove(ctx, canvas).then(() => {
            const lastAction = getLastAction();
            if (lastAction && lastAction.type === 'pass' && lastAction.player === 'white') {
                showToast('白棋选择停一手。');
            }

            updateStatus();
            
            const gameEndResult = checkGameEnd();
            if (gameEndResult.ended) {
                currentGameState = GAME_STATE.GAME_ENDED;
                renderBoard();
                handleGameEnd(gameEndResult);
                return;
            }
            
            // AI落子完成，切换回玩家回合
            switchPlayer();
            updateStatus();
            currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
            renderBoard();
            
            // 更新debug显示
            if (debugInfo.style.display === 'block') {
                updateDebugDisplay();
            }
            
        }).catch(error => {
            console.error('AI落子出错:', error);
            // AI出错时也要恢复玩家回合
            switchPlayer();
            updateStatus();
            currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
            renderBoard();
        });
    }, 500); // AI思考延迟
}

export function setupEventListeners() {
    canvas.addEventListener('click', handleBoardClick);
    canvas.addEventListener('mousemove', handleBoardHover);
    canvas.addEventListener('mouseleave', clearHover);
    startGameBtn.addEventListener('click', () => {
        clearToast(); // 清除之前的提示
        startGame();
        hoverMove = null;
        renderBoard();
        updateStatus();
        // 重置游戏状态为等待玩家
        currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
    });
    passButton.addEventListener('click', executePlayerPass);
    resetGameBtn.addEventListener('click', () => {
        clearToast(); // 清除之前的提示
        resetGame();
        initBoardState(getBoardSize(), canvas, ctx); // 同步重置board.js状态
        hoverMove = null;
        renderBoard();
        updateStatus();
        // 重置游戏状态为等待玩家
        currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
    });
    
    homeBtn.addEventListener('click', () => {
        // 返回主页面
        window.location.href = '../index.html';
    });
    
    // Debug按钮事件监听器
    debugButton.addEventListener('click', toggleDebugInfo);
    
    // 棋盘大小切换事件
    boardSizeSelect.addEventListener('change', (event) => {
        const newSize = parseInt(event.target.value);
        setBoardSize(newSize);
        initBoardState(newSize, canvas, ctx); // 同步更新board.js中的BOARD_SIZE
        resetGame();
        updateStatus();
        hoverMove = null;
        renderBoard();
        // 重置游戏状态为等待玩家
        currentGameState = GAME_STATE.WAITING_FOR_PLAYER;
    });
    
    // 弹窗事件监听器
    closeModal.addEventListener('click', () => {
        gameEndModal.style.display = 'none';
    });
    
    closeModalButton.addEventListener('click', () => {
        gameEndModal.style.display = 'none';
    });
    
    // 点击弹窗外部关闭弹窗
    gameEndModal.addEventListener('click', (event) => {
        if (event.target === gameEndModal) {
            gameEndModal.style.display = 'none';
        }
    });
    
    // 定期更新计时器显示
    setInterval(() => {
        if (getGameStarted() && !getGameEnded()) {
            updateStatus();
        }
    }, 1000);
}

export function initializeUI() {
    // 设置棋盘大小选择器的默认值
    boardSizeSelect.value = getBoardSize().toString();
    
    initBoardState(getBoardSize(), canvas, ctx);
    renderBoard();
    updateStatus();
    setupEventListeners();
}
