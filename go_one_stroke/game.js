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

    // 基础配置
    const CANVAS_SIZE = 520;
    const NODE_RADIUS = 15;
    const LINE_WIDTH = 6;
    const HIT_RADIUS = 30;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // 游戏状态
    let currentLevelIndex = 0;
    let nodes = []; // {x, y, id}
    let edges = []; // {u, v, id, visited}
    let playerPath = []; // 存储经过的节点
    let visitedEdges = new Set(); // 存储已访问的边ID
    let isDragging = false;
    let lastNodeIndex = -1;

    // 关卡设计 (欧拉路径理论: 奇点数为 0 或 2)
    const levels = [
        {
            // 等级 1: 三角形 (0个奇点)
            nodes: [
                { x: 260, y: 100 },
                { x: 100, y: 400 },
                { x: 420, y: 400 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 0]
            ]
        },
        {
            // 等级 2: 正方形带一条对角线 (2个奇点: 0和3)
            nodes: [
                { x: 130, y: 130 },
                { x: 390, y: 130 },
                { x: 130, y: 390 },
                { x: 390, y: 390 }
            ],
            edges: [
                [0, 1], [1, 3], [3, 2], [2, 0], [0, 3]
            ]
        },
        {
            // 等级 3: 房子形状 (2个奇点)
            nodes: [
                { x: 260, y: 60 },  // 房顶
                { x: 130, y: 190 }, // 左上墙角
                { x: 390, y: 190 }, // 右上墙角
                { x: 130, y: 390 }, // 左下墙角
                { x: 390, y: 390 }  // 右下墙角
            ],
            edges: [
                [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [1, 4], [2, 3]
            ]
        },
        {
            // 等级 4: 信封 (2个奇点)
            nodes: [
                { x: 130, y: 130 },
                { x: 390, y: 130 },
                { x: 130, y: 330 },
                { x: 390, y: 330 },
                { x: 260, y: 230 }
            ],
            edges: [
                [0, 1], [0, 4], [1, 4], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4]
            ]
        },
        {
            // 等级 5: 蝴蝶结/两个三角形 (0个奇点)
            nodes: [
                { x: 100, y: 150 },
                { x: 100, y: 370 },
                { x: 260, y: 260 },
                { x: 420, y: 150 },
                { x: 420, y: 370 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 0],
                [2, 3], [3, 4], [4, 2]
            ]
        },
        {
            // 等级 6: 双正方形 (2个奇点)
            nodes: [
                { x: 100, y: 150 }, { x: 260, y: 150 }, { x: 420, y: 150 },
                { x: 100, y: 350 }, { x: 260, y: 350 }, { x: 420, y: 350 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 5], [5, 4], [4, 3], [3, 0], [1, 4]
            ]
        },
        {
            // 等级 7: 五角星 (0个奇点)
            nodes: [
                { x: 260, y: 50 },
                { x: 450, y: 190 },
                { x: 380, y: 420 },
                { x: 140, y: 420 },
                { x: 70, y: 190 }
            ],
            edges: [
                [0, 2], [2, 4], [4, 1], [1, 3], [3, 0]
            ]
        },
        {
            // 等级 8: 嵌套三角形 (0个奇点)
            nodes: [
                { x: 260, y: 40 }, { x: 60, y: 440 }, { x: 460, y: 440 },
                { x: 260, y: 180 }, { x: 160, y: 360 }, { x: 360, y: 360 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 0],
                [3, 4], [4, 5], [5, 3],
                [0, 3], [1, 4], [2, 5],
                [0, 4], [1, 3]
            ]
        },
        {
            // 等级 9: 钻石网格 (0个奇点)
            nodes: [
                { x: 260, y: 60 }, { x: 100, y: 260 }, { x: 420, y: 260 }, { x: 260, y: 460 },
                { x: 180, y: 160 }, { x: 340, y: 160 }, { x: 180, y: 360 }, { x: 340, y: 360 }
            ],
            edges: [
                [0, 4], [4, 1], [1, 6], [6, 3], [3, 7], [7, 2], [2, 5], [5, 0],
                [4, 5], [5, 7], [7, 6], [6, 4]
            ]
        },
        {
            // 等级 10: 终极迷宫 (2个奇点)
            nodes: [
                { x: 80, y: 80 }, { x: 260, y: 80 }, { x: 440, y: 80 },
                { x: 80, y: 260 }, { x: 260, y: 260 }, { x: 440, y: 260 },
                { x: 80, y: 440 }, { x: 260, y: 440 }, { x: 440, y: 440 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 5], [5, 4], [4, 1], [4, 3], [3, 0],
                [3, 6], [6, 7], [7, 4], [7, 8], [8, 5], [1, 3]
            ]
        }
    ];

    function initLevel() {
        const levelData = levels[currentLevelIndex];
        levelNumEl.textContent = currentLevelIndex + 1;
        
        nodes = levelData.nodes.map((n, i) => ({ ...n, id: i }));
        edges = levelData.edges.map((e, i) => ({ u: e[0], v: e[1], id: i }));
        
        playerPath = [];
        visitedEdges.clear();
        isDragging = false;
        lastNodeIndex = -1;
        
        statusMsgEl.textContent = "连接所有线条完成一笔画！";
        statusMsgEl.style.color = "#4a2b11";
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        // 绘制背景 (淡色纸质感)
        ctx.fillStyle = "#f0e6d2";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        drawEdges();
        drawNodes();
        drawCurrentPath();
    }

    function drawEdges() {
        edges.forEach(edge => {
            const u = nodes[edge.u];
            const v = nodes[edge.v];
            const isVisited = visitedEdges.has(edge.id);

            ctx.beginPath();
            ctx.moveTo(u.x, u.y);
            ctx.lineTo(v.x, v.y);
            
            if (isVisited) {
                ctx.strokeStyle = "#f44336";
                ctx.lineWidth = LINE_WIDTH;
                ctx.setLineDash([]);
            } else {
                ctx.strokeStyle = "rgba(74, 43, 17, 0.3)";
                ctx.lineWidth = LINE_WIDTH - 2;
                ctx.setLineDash([5, 5]);
            }
            
            ctx.stroke();
        });
        ctx.setLineDash([]);
    }

    function drawNodes() {
        nodes.forEach((node, index) => {
            const isLast = index === lastNodeIndex;
            const isVisited = playerPath.includes(index);

            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
            
            if (isLast) {
                ctx.fillStyle = "#f44336";
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 3;
                ctx.fill();
                ctx.stroke();
            } else if (isVisited) {
                ctx.fillStyle = "#8b4513";
                ctx.fill();
            } else {
                ctx.fillStyle = "#4a2b11";
                ctx.fill();
            }
        });
    }

    function drawCurrentPath() {
        if (playerPath.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = "#f44336";
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        const startNode = nodes[playerPath[0]];
        ctx.moveTo(startNode.x, startNode.y);

        for (let i = 1; i < playerPath.length; i++) {
            const node = nodes[playerPath[i]];
            ctx.lineTo(node.x, node.y);
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

    function findNodeAt(pos) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const dist = Math.hypot(pos.x - node.x, pos.y - node.y);
            if (dist < HIT_RADIUS) return i;
        }
        return -1;
    }

    function handleInputStart(e) {
        const pos = getMousePos(e);
        const nodeIndex = findNodeAt(pos);
        
        if (nodeIndex !== -1) {
            isDragging = true;
            playerPath = [nodeIndex];
            visitedEdges.clear();
            lastNodeIndex = nodeIndex;
            statusMsgEl.textContent = "正在绘图...";
            draw();
        }
    }

    function handleInputMove(e) {
        if (!isDragging) return;
        const pos = getMousePos(e);
        const nodeIndex = findNodeAt(pos);

        if (nodeIndex !== -1 && nodeIndex !== lastNodeIndex) {
            // 查找是否存在连接 lastNodeIndex 和 nodeIndex 的边
            const edgeIndex = edges.findIndex(edge => {
                const match = (edge.u === lastNodeIndex && edge.v === nodeIndex) || 
                              (edge.v === lastNodeIndex && edge.u === nodeIndex);
                return match && !visitedEdges.has(edge.id);
            });

            if (edgeIndex !== -1) {
                visitedEdges.add(edges[edgeIndex].id);
                playerPath.push(nodeIndex);
                lastNodeIndex = nodeIndex;
                checkVictory();
                draw();
            } else {
                // 如果尝试经过已访问的边，或者不相邻，检查是否是回退
                if (playerPath.length >= 2 && nodeIndex === playerPath[playerPath.length - 2]) {
                    // 回退逻辑: 找到刚刚经过的那条边并移除
                    const lastEdgeId = edges.find(edge => 
                        (edge.u === playerPath[playerPath.length-1] && edge.v === playerPath[playerPath.length-2]) ||
                        (edge.v === playerPath[playerPath.length-1] && edge.u === playerPath[playerPath.length-2])
                    ).id;
                    
                    visitedEdges.delete(lastEdgeId);
                    playerPath.pop();
                    lastNodeIndex = nodeIndex;
                    draw();
                }
            }
        }
    }

    function checkVictory() {
        if (visitedEdges.size === edges.length) {
            statusMsgEl.textContent = "完美！全部连接完成！";
            statusMsgEl.style.color = "#2e7d32";
            isDragging = false;
            setTimeout(() => {
                if (currentLevelIndex < levels.length - 1) {
                    modal.style.display = "flex";
                } else {
                    alert("恭喜！你已完成所有一笔画关卡！");
                    window.location.href = "../index.html";
                }
            }, 500);
        }
    }

    canvas.addEventListener('mousedown', handleInputStart);
    window.addEventListener('mousemove', handleInputMove);
    window.addEventListener('mouseup', () => isDragging = false);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleInputStart(e);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
        handleInputMove(e);
    });
    window.addEventListener('touchend', () => isDragging = false);

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
