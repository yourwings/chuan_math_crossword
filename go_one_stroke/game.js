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
    let vertices = []; // 黑色棋子 {x, y, id}
    let edgeStones = []; // 白色棋子 {x, y, edgeId, id}
    let edges = []; // 逻辑边 {v1, v2, stones: [], id}
    
    let playerPath = []; // 存储点击过的棋子索引 (allStones 中的索引)
    let visitedEdges = new Set(); // 存储已完成的逻辑边 ID
    let visitedStones = new Set(); // 存储已访问的棋子索引
    let isDragging = false;
    let lastStoneIndex = -1;
    let allStones = []; // 混合数组用于渲染和碰撞检测

    // 关卡原始数据 (欧拉路径设计: 奇点数为 0 或 2)
    const rawLevels = [
        {
            // 等级 1: 信封形状 (经典的欧拉路径)
            vertices: [
                { x: 3, y: 3 }, { x: 9, y: 3 },
                { x: 3, y: 9 }, { x: 9, y: 9 },
                { x: 6, y: 6 }
            ],
            paths: [
                [0, 1], [1, 4], [4, 0], // 三角形屋顶
                [0, 2], [2, 3], [3, 1], [1, 0], // 正方形墙壁
                [2, 4], [4, 3] // 内部交叉 (可选，这里设计为信封)
            ]
        },
        {
            // 等级 2: 双三角形
            vertices: [
                { x: 2, y: 6 }, { x: 6, y: 2 }, { x: 10, y: 6 },
                { x: 6, y: 10 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 0], // 左上三角
                [0, 3], [3, 2], [2, 0]  // 右下三角 (共用底边)
            ]
        },
        {
            // 等级 3: 蝴蝶结 (两个共顶点的三角形)
            vertices: [
                { x: 2, y: 3 }, { x: 2, y: 9 }, 
                { x: 6, y: 6 }, 
                { x: 10, y: 3 }, { x: 10, y: 9 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 0],
                [2, 3], [3, 4], [4, 2]
            ]
        },
        {
            // 等级 4: 嵌套正方形 (8字形变体)
            vertices: [
                { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 9, y: 9 }, { x: 3, y: 9 },
                { x: 5, y: 5 }, { x: 7, y: 5 }, { x: 7, y: 7 }, { x: 5, y: 7 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 3], [3, 0], // 外框
                [4, 5], [5, 6], [6, 7], [7, 4], // 内框
                [0, 4] // 连接桥 (必须有2个奇点)
            ]
        },
        {
            // 等级 5: 复杂几何星
            vertices: [
                { x: 6, y: 1 }, { x: 2, y: 4 }, { x: 4, y: 10 }, 
                { x: 8, y: 10 }, { x: 10, y: 4 }, { x: 6, y: 6 }
            ],
            paths: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], // 五边形外框
                [0, 5], [1, 5], [2, 5], [3, 5], [4, 5]  // 全部连向中心
            ]
        }
    ];

    function initLevel() {
        const raw = rawLevels[currentLevelIndex];
        levelNumEl.textContent = currentLevelIndex + 1;
        
        allStones = [];
        edges = [];
        const stoneMap = new Map();

        // 1. 处理顶点 (黑子)
        vertices = raw.vertices.map((v, i) => {
            const stone = { x: v.x, y: v.y, color: 'black', type: 'vertex', vertexId: i };
            stoneMap.set(`${v.x},${v.y}`, allStones.length);
            allStones.push(stone);
            return stone;
        });

        // 2. 处理路径 (白子) 和逻辑边
        raw.paths.forEach((p, edgeIdx) => {
            const v1 = raw.vertices[p[0]];
            const v2 = raw.vertices[p[1]];
            const currentEdgeStones = [];

            const dx = Math.sign(v2.x - v1.x);
            const dy = Math.sign(v2.y - v1.y);
            
            let curX = v1.x + dx;
            let curY = v1.y + dy;
            
            while (curX !== v2.x || curY !== v2.y) {
                const stoneKey = `${curX},${curY}`;
                let stoneIdx;
                if (stoneMap.has(stoneKey)) {
                    stoneIdx = stoneMap.get(stoneKey);
                } else {
                    const stone = { x: curX, y: curY, color: 'white', type: 'edge', edgeIds: new Set() };
                    stoneIdx = allStones.length;
                    stoneMap.set(stoneKey, stoneIdx);
                    allStones.push(stone);
                }
                allStones[stoneIdx].edgeIds.add(edgeIdx);
                currentEdgeStones.push(stoneIdx);
                curX += dx;
                curY += dy;
            }

            edges.push({
                id: edgeIdx,
                v1: p[0],
                v2: p[1],
                stoneIndices: currentEdgeStones
            });
        });

        playerPath = [];
        visitedEdges.clear();
        visitedStones.clear();
        isDragging = false;
        lastStoneIndex = -1;
        
        // 计算奇点数并提示
        const degrees = new Array(raw.vertices.length).fill(0);
        raw.paths.forEach(p => { degrees[p[0]]++; degrees[p[1]]++; });
        const oddNodes = degrees.filter(d => d % 2 !== 0).length;
        
        statusMsgEl.textContent = `必须从黑子开始！(本关奇点数: ${oddNodes})`;
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
            const isVisited = visitedStones.has(index);

            ctx.beginPath();
            ctx.arc(x + 2, y + 2, STONE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();

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

            if (isVisited) {
                ctx.beginPath();
                ctx.arc(x, y, STONE_RADIUS * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = stone.color === 'black' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)';
                ctx.fill();
            }

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
        ctx.lineWidth = 5;
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
        if (e.touches) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
        else { clientX = e.clientX; clientY = e.clientY; }
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }

    function findStoneAt(pos) {
        for (let i = 0; i < allStones.length; i++) {
            const stone = allStones[i];
            const nx = PADDING + stone.x * GRID_SPACING;
            const ny = PADDING + stone.y * GRID_SPACING;
            const dist = Math.hypot(pos.x - nx, pos.y - ny);
            if (dist < STONE_RADIUS * 1.5) return i;
        }
        return -1;
    }

    function handleInputStart(e) {
        const pos = getMousePos(e);
        const stoneIndex = findStoneAt(pos);
        
        if (stoneIndex !== -1) {
            const stone = allStones[stoneIndex];
            if (stone.color !== 'black') {
                statusMsgEl.textContent = "起点必须是黑色棋子！";
                statusMsgEl.style.color = "#f44336";
                return;
            }
            isDragging = true;
            playerPath = [stoneIndex];
            visitedEdges.clear();
            visitedStones.clear();
            visitedStones.add(stoneIndex);
            lastStoneIndex = stoneIndex;
            statusMsgEl.textContent = "连接中...";
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
            const isAdjacent = (Math.abs(s1.x - s2.x) === 1 && s1.y === s2.y) || 
                              (Math.abs(s1.y - s2.y) === 1 && s1.x === s2.x);

            if (isAdjacent) {
                // 检查这条“子步”是否属于某个合法的逻辑边
                const commonEdges = [...s1.edgeIds || []].filter(id => (s2.edgeIds && s2.edgeIds.has(id)) || (s2.type === 'vertex' && edges[id] && (edges[id].v1 === s2.vertexId || edges[id].v2 === s2.vertexId)));
                // 如果是从顶点出发
                let edgeId = -1;
                if (s1.type === 'vertex') {
                    edgeId = edges.findIndex(e => (e.v1 === s1.vertexId || e.v2 === s1.vertexId) && e.stoneIndices.includes(stoneIndex));
                } else if (s2.type === 'vertex') {
                    edgeId = edges.findIndex(e => (e.v1 === s2.vertexId || e.v2 === s2.vertexId) && e.stoneIndices.includes(lastStoneIndex));
                } else {
                    edgeId = [...s1.edgeIds].find(id => s2.edgeIds.has(id));
                }

                if (edgeId !== -1) {
                    // 检查这条边是否已经走完过
                    if (visitedEdges.has(edgeId)) {
                        statusMsgEl.textContent = "每条路径只能走一次！";
                        statusMsgEl.style.color = "#f44336";
                        return;
                    }

                    // 允许在边内部移动，记录路径
                    // 注意：这里不需要限制 visitedStones，因为欧拉路径允许重复经过顶点，
                    // 但由于我们的设计是白色棋子只属于一条边，所以重复经过白色棋子意味着重复经过边。
                    // 只有黑色棋子（顶点）可以重复经过。
                    if (s2.type === 'edge' && visitedStones.has(stoneIndex)) {
                        // 如果是回退
                        if (playerPath.length >= 2 && stoneIndex === playerPath[playerPath.length - 2]) {
                            playerPath.pop();
                            visitedStones.delete(lastStoneIndex);
                            lastStoneIndex = stoneIndex;
                        }
                    } else {
                        playerPath.push(stoneIndex);
                        visitedStones.add(stoneIndex);
                        lastStoneIndex = stoneIndex;
                        
                        // 检查是否走完了一条完整的边
                        if (s2.type === 'vertex') {
                            visitedEdges.add(edgeId);
                        }
                        checkVictory();
                    }
                    draw();
                }
            }
        }
    }

    function checkVictory() {
        if (visitedEdges.size === edges.length) {
            statusMsgEl.textContent = "完美！全部一笔画出！";
            statusMsgEl.style.color = "#2e7d32";
            isDragging = false;
            setTimeout(() => {
                if (currentLevelIndex < rawLevels.length - 1) modal.style.display = 'flex';
                else { alert('恭喜！你已精通围棋一笔画！'); window.location.href = '../index.html'; }
            }, 500);
        }
    }

    canvas.addEventListener('mousedown', handleInputStart);
    window.addEventListener('mousemove', handleInputMove);
    window.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInputStart(e); }, { passive: false });
    window.addEventListener('touchmove', (e) => handleInputMove(e));
    window.addEventListener('touchend', () => isDragging = false);
    resetBtn.addEventListener('click', initLevel);
    backBtn.addEventListener('click', () => window.location.href = '../index.html');
    modalNextBtn.addEventListener('click', () => { modal.style.display = 'none'; currentLevelIndex++; initLevel(); });
    modalHomeBtn.addEventListener('click', () => window.location.href = '../index.html');

    initLevel();
});
