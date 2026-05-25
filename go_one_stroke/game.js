document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const levelNumEl = document.getElementById('level-num');
    const statusMsgEl = document.getElementById('status-msg');
    const resetBtn = document.getElementById('reset-btn');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const backBtn = document.getElementById('back-btn');
    const modal = document.getElementById('victory-modal');
    const modalNextBtn = document.getElementById('modal-next-btn');
    const modalHomeBtn = document.getElementById('modal-home-btn');

    // 棋盘配置
    const BOARD_SIZE = 13;
    const CANVAS_SIZE = 520;
    const PADDING = 30;
    const GRID_SPACING = (CANVAS_SIZE - PADDING * 2) / (BOARD_SIZE - 1);
    const STONE_RADIUS = GRID_SPACING * 0.45;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // 游戏状态
    let currentLevelIndex = 0;
    let allStones = []; // 包含所有棋子的数组 {x, y, color, id}
    let playerPath = []; // 存储点击过的棋子索引
    let visitedNodes = new Set(); // 存储已访问的棋子索引
    let isDragging = false;
    let lastStoneIndex = -1;

    // 关卡原始数据
    const rawLevels = [
        {
            // 等级 1: 简单的 L 形
            vertices: [
                { x: 3, y: 3 }, // 顶点 1
                { x: 3, y: 7 }, // 顶点 2
                { x: 7, y: 7 }  // 顶点 3
            ],
            paths: [
                [0, 1], [1, 2] // 顶点之间的连线
            ]
        },
        {
            // 等级 2: U 形
            vertices: [
                { x: 3, y: 3 }, { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 9, y: 3 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 3]
            ]
        },
        {
            // 等级 3: 阶梯形
            vertices: [
                { x: 2, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 5 }, { x: 8, y: 5 }, { x: 8, y: 8 }, { x: 11, y: 8 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5]
            ]
        },
        {
            // 等级 4: 螺旋回廊
            vertices: [
                { x: 1, y: 1 }, { x: 11, y: 1 }, { x: 11, y: 11 }, { x: 1, y: 11 },
                { x: 1, y: 4 }, { x: 8, y: 4 }, { x: 8, y: 8 }, { x: 4, y: 8 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]
            ]
        },
        {
            // 等级 5: 迷宫挑战
            vertices: [
                { x: 2, y: 2 }, { x: 10, y: 2 }, { x: 10, y: 4 }, { x: 4, y: 4 },
                { x: 4, y: 6 }, { x: 10, y: 6 }, { x: 10, y: 8 }, { x: 4, y: 8 },
                { x: 4, y: 10 }, { x: 10, y: 10 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]
            ]
        }
    ];

    function initLevel() {
        const raw = rawLevels[currentLevelIndex];
        levelNumEl.textContent = currentLevelIndex + 1;
        
        // 展开所有棋子
        allStones = [];
        const stoneMap = new Map(); // 用于排重

        function addStone(x, y, color) {
            const key = `${x},${y}`;
            if (!stoneMap.has(key)) {
                const stone = { x, y, color, id: allStones.length };
                allStones.push(stone);
                stoneMap.set(key, stone.id);
            }
        }

        // 1. 添加顶点 (黑子)
        raw.vertices.forEach(v => addStone(v.x, v.y, 'black'));

        // 2. 添加路径 (白子)
        raw.paths.forEach(p => {
            const v1 = raw.vertices[p[0]];
            const v2 = raw.vertices[p[1]];
            
            const dx = Math.sign(v2.x - v1.x);
            const dy = Math.sign(v2.y - v1.y);
            
            let curX = v1.x + dx;
            let curY = v1.y + dy;
            
            while (curX !== v2.x || curY !== v2.y) {
                addStone(curX, curY, 'white');
                curX += dx;
                curY += dy;
            }
        });

        playerPath = [];
        visitedNodes.clear();
        isDragging = false;
        lastStoneIndex = -1;
        statusMsgEl.textContent = "黑子为顶点，白子为路径，请一笔走完！";
        statusMsgEl.style.color = "#4a2b11";
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawBoard();
        drawStones();
        drawPlayerPath();
    }

    function drawBoard() {
        ctx.strokeStyle = '#4a2b11';
        ctx.lineWidth = 1;

        for (let i = 0; i < BOARD_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(PADDING, PADDING + i * GRID_SPACING);
            ctx.lineTo(CANVAS_SIZE - PADDING, PADDING + i * GRID_SPACING);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(PADDING + i * GRID_SPACING, PADDING);
            ctx.lineTo(PADDING + i * GRID_SPACING, CANVAS_SIZE - PADDING);
            ctx.stroke();
        }

        const starPoints = [3, 6, 9];
        ctx.fillStyle = '#4a2b11';
        starPoints.forEach(ix => {
            starPoints.forEach(iy => {
                ctx.beginPath();
                ctx.arc(PADDING + ix * GRID_SPACING, PADDING + iy * GRID_SPACING, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    function drawStones() {
        allStones.forEach((stone, index) => {
            const x = PADDING + stone.x * GRID_SPACING;
            const y = PADDING + stone.y * GRID_SPACING;
            const isVisited = visitedNodes.has(index);

            // 阴影
            ctx.beginPath();
            ctx.arc(x + 2, y + 2, STONE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();

            // 棋子
            ctx.beginPath();
            ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(x - STONE_RADIUS/3, y - STONE_RADIUS/3, STONE_RADIUS/10, x, y, STONE_RADIUS);
            if (stone.color === 'black') {
                gradient.addColorStop(0, isVisited ? '#444' : '#666');
                gradient.addColorStop(1, isVisited ? '#222' : '#000');
            } else {
                gradient.addColorStop(0, isVisited ? '#eee' : '#fff');
                gradient.addColorStop(1, isVisited ? '#bbb' : '#ccc');
            }
            
            ctx.fillStyle = gradient;
            ctx.fill();

            // 已访问标记
            if (isVisited) {
                ctx.beginPath();
                ctx.arc(x, y, STONE_RADIUS * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = stone.color === 'black' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)';
                ctx.fill();
            }

            // 当前焦点
            if (index === lastStoneIndex) {
                ctx.beginPath();
                ctx.arc(x, y, STONE_RADIUS + 4, 0, Math.PI * 2);
                ctx.strokeStyle = '#f44336';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    }

    function drawPlayerPath() {
        if (playerPath.length < 2) return;

        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        const startStone = allStones[playerPath[0]];
        ctx.moveTo(PADDING + startStone.x * GRID_SPACING, PADDING + startStone.y * GRID_SPACING);

        for (let i = 1; i < playerPath.length; i++) {
            const stone = allStones[playerPath[i]];
            ctx.lineTo(PADDING + stone.x * GRID_SPACING, PADDING + stone.y * GRID_SPACING);
        }
        ctx.stroke();
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function findStoneAt(pos) {
        for (let i = 0; i < allStones.length; i++) {
            const stone = allStones[i];
            const nx = PADDING + stone.x * GRID_SPACING;
            const ny = PADDING + stone.y * GRID_SPACING;
            const dist = Math.hypot(pos.x - nx, pos.y - ny);
            if (dist < STONE_RADIUS * 1.5) {
                return i;
            }
        }
        return -1;
    }

    function handleInputStart(e) {
        const pos = getMousePos(e);
        const stoneIndex = findStoneAt(pos);
        
        if (stoneIndex !== -1) {
            isDragging = true;
            playerPath = [stoneIndex];
            visitedNodes.clear();
            visitedNodes.add(stoneIndex);
            lastStoneIndex = stoneIndex;
            statusMsgEl.textContent = "开始连接...";
            statusMsgEl.style.color = "#4a2b11";
            draw();
        }
    }

    function handleInputMove(e) {
        if (!isDragging) return;
        
        const pos = getMousePos(e);
        const stoneIndex = findStoneAt(pos);

        if (stoneIndex !== -1 && stoneIndex !== lastStoneIndex) {
            const s1 = allStones[lastStoneIndex];
            const s2 = allStones[stoneIndex];
            
            // 检查是否相邻 (一格距离)
            const isAdjacent = (Math.abs(s1.x - s2.x) === 1 && s1.y === s2.y) || 
                              (Math.abs(s1.y - s2.y) === 1 && s1.x === s2.x);

            if (isAdjacent) {
                if (visitedNodes.has(stoneIndex)) {
                    // 回退逻辑
                    if (playerPath.length >= 2 && stoneIndex === playerPath[playerPath.length - 2]) {
                        const removed = playerPath.pop();
                        visitedNodes.delete(removed);
                        lastStoneIndex = stoneIndex;
                        statusMsgEl.textContent = "已回退";
                    } else {
                        statusMsgEl.textContent = "每个棋子只能经过一次！";
                        statusMsgEl.style.color = "#f44336";
                    }
                } else {
                    playerPath.push(stoneIndex);
                    visitedNodes.add(stoneIndex);
                    lastStoneIndex = stoneIndex;
                    statusMsgEl.textContent = "连接中...";
                    statusMsgEl.style.color = "#4a2b11";
                    checkVictory();
                }
                draw();
            }
        }
    }

    function handleInputEnd() {
        isDragging = false;
    }

    function checkVictory() {
        if (visitedNodes.size === allStones.length) {
            statusMsgEl.textContent = "恭喜过关！";
            statusMsgEl.style.color = "#2e7d32";
            isDragging = false;
            
            setTimeout(() => {
                if (currentLevelIndex < rawLevels.length - 1) {
                    modal.style.display = 'flex';
                } else {
                    alert('太厉害了！你完成了所有关卡！');
                    window.location.href = '../index.html';
                }
            }, 500);
        }
    }

    // 事件监听
    canvas.addEventListener('mousedown', handleInputStart);
    window.addEventListener('mousemove', handleInputMove);
    window.addEventListener('mouseup', handleInputEnd);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleInputStart(e);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
        handleInputMove(e);
    });
    window.addEventListener('touchend', handleInputEnd);

    resetBtn.addEventListener('click', initLevel);
    backBtn.addEventListener('click', () => window.location.href = '../index.html');
    modalNextBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentLevelIndex++;
        initLevel();
    });
    modalHomeBtn.addEventListener('click', () => window.location.href = '../index.html');

    initLevel();
});
