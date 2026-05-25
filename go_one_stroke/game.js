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
    const STONE_RADIUS = GRID_SPACING * 0.42;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // 游戏状态
    let currentLevelIndex = 0;
    let playerPath = []; // 存储点击过的节点索引
    let isDragging = false;
    let lastNodeIndex = -1;
    let completedEdges = new Set(); // 存储已完成的边 (格式: "min-max")

    // 关卡数据
    const levels = [
        {
            // 等级 1: 简单的三角形
            nodes: [
                { x: 3, y: 3, color: 'black' },
                { x: 9, y: 3, color: 'black' },
                { x: 6, y: 9, color: 'black' }
            ],
            edges: [[0, 1], [1, 2], [2, 0]]
        },
        {
            // 等级 2: 正方形带对角线 (一笔画经典)
            nodes: [
                { x: 3, y: 3, color: 'white' },
                { x: 9, y: 3, color: 'white' },
                { x: 3, y: 9, color: 'white' },
                { x: 9, y: 9, color: 'white' },
                { x: 6, y: 6, color: 'black' }
            ],
            edges: [
                [0, 1], [1, 3], [3, 2], [2, 0],
                [0, 4], [1, 4], [2, 4], [3, 4]
            ]
        },
        {
            // 等级 3: 房子形状
            nodes: [
                { x: 3, y: 6, color: 'black' },
                { x: 9, y: 6, color: 'black' },
                { x: 3, y: 10, color: 'black' },
                { x: 9, y: 10, color: 'black' },
                { x: 6, y: 2, color: 'white' }
            ],
            edges: [
                [0, 1], [1, 3], [3, 2], [2, 0],
                [0, 4], [1, 4], [0, 3] // 故意少一条对角线使其可一笔画
            ]
        },
        {
            // 等级 4: 星形
            nodes: [
                { x: 6, y: 2, color: 'white' },
                { x: 3, y: 10, color: 'black' },
                { x: 10, y: 5, color: 'black' },
                { x: 2, y: 5, color: 'black' },
                { x: 9, y: 10, color: 'black' }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]
            ]
        },
        {
            // 等级 5: 复杂几何
            nodes: [
                { x: 2, y: 2, color: 'black' },
                { x: 6, y: 2, color: 'white' },
                { x: 10, y: 2, color: 'black' },
                { x: 2, y: 6, color: 'white' },
                { x: 10, y: 6, color: 'white' },
                { x: 2, y: 10, color: 'black' },
                { x: 6, y: 10, color: 'white' },
                { x: 10, y: 10, color: 'black' }
            ],
            edges: [
                [0, 1], [1, 2], [2, 4], [4, 7], [7, 6], [6, 5], [5, 3], [3, 0],
                [1, 6], [3, 4]
            ]
        }
    ];

    function getLevel() {
        return levels[currentLevelIndex];
    }

    function initLevel() {
        const level = getLevel();
        levelNumEl.textContent = currentLevelIndex + 1;
        playerPath = [];
        completedEdges.clear();
        isDragging = false;
        lastNodeIndex = -1;
        statusMsgEl.textContent = "连接所有棋子完成一笔画！";
        statusMsgEl.style.color = "#4a2b11";
        nextLevelBtn.style.display = 'none';
        draw();
    }

    // 绘图逻辑
    function draw() {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawBoard();
        drawEdges();
        drawPlayerPath();
        drawNodes();
    }

    function drawBoard() {
        ctx.strokeStyle = '#4a2b11';
        ctx.lineWidth = 1;

        // 画网格线
        for (let i = 0; i < BOARD_SIZE; i++) {
            // 横线
            ctx.beginPath();
            ctx.moveTo(PADDING, PADDING + i * GRID_SPACING);
            ctx.lineTo(CANVAS_SIZE - PADDING, PADDING + i * GRID_SPACING);
            ctx.stroke();

            // 纵线
            ctx.beginPath();
            ctx.moveTo(PADDING + i * GRID_SPACING, PADDING);
            ctx.lineTo(PADDING + i * GRID_SPACING, CANVAS_SIZE - PADDING);
            ctx.stroke();
        }

        // 画星位 (13x13 棋盘通常在 4,4, 4,10, 10,4, 10,10, 7,7)
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

    function drawNodes() {
        const level = getLevel();
        level.nodes.forEach((node, index) => {
            const x = PADDING + node.x * GRID_SPACING;
            const y = PADDING + node.y * GRID_SPACING;

            // 阴影
            ctx.beginPath();
            ctx.arc(x + 2, y + 2, STONE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();

            // 棋子
            ctx.beginPath();
            ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
            
            const gradient = ctx.createRadialGradient(x - STONE_RADIUS/3, y - STONE_RADIUS/3, STONE_RADIUS/10, x, y, STONE_RADIUS);
            if (node.color === 'black') {
                gradient.addColorStop(0, '#666');
                gradient.addColorStop(1, '#000');
            } else {
                gradient.addColorStop(0, '#fff');
                gradient.addColorStop(1, '#ccc');
            }
            
            ctx.fillStyle = gradient;
            ctx.fill();

            // 如果是当前路径的最后一个节点，加一个高亮圈
            if (index === lastNodeIndex) {
                ctx.beginPath();
                ctx.arc(x, y, STONE_RADIUS + 4, 0, Math.PI * 2);
                ctx.strokeStyle = '#f44336';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    }

    function drawEdges() {
        const level = getLevel();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(74, 43, 17, 0.4)';
        ctx.lineWidth = 4;

        level.edges.forEach(edge => {
            const n1 = level.nodes[edge[0]];
            const n2 = level.nodes[edge[1]];
            
            ctx.beginPath();
            ctx.moveTo(PADDING + n1.x * GRID_SPACING, PADDING + n1.y * GRID_SPACING);
            ctx.lineTo(PADDING + n2.x * GRID_SPACING, PADDING + n2.y * GRID_SPACING);
            ctx.stroke();
        });
        ctx.setLineDash([]);
    }

    function drawPlayerPath() {
        if (playerPath.length < 2) return;

        const level = getLevel();
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        const startNode = level.nodes[playerPath[0]];
        ctx.moveTo(PADDING + startNode.x * GRID_SPACING, PADDING + startNode.y * GRID_SPACING);

        for (let i = 1; i < playerPath.length; i++) {
            const node = level.nodes[playerPath[i]];
            ctx.lineTo(PADDING + node.x * GRID_SPACING, PADDING + node.y * GRID_SPACING);
        }
        ctx.stroke();
    }

    // 交互逻辑
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
        const level = getLevel();
        for (let i = 0; i < level.nodes.length; i++) {
            const node = level.nodes[i];
            const nx = PADDING + node.x * GRID_SPACING;
            const ny = PADDING + node.y * GRID_SPACING;
            const dist = Math.hypot(pos.x - nx, pos.y - ny);
            if (dist < STONE_RADIUS * 1.5) {
                return i;
            }
        }
        return -1;
    }

    function handleInputStart(e) {
        const pos = getMousePos(e);
        const nodeIndex = findNodeAt(pos);
        
        if (nodeIndex !== -1) {
            isDragging = true;
            playerPath = [nodeIndex];
            lastNodeIndex = nodeIndex;
            completedEdges.clear();
            draw();
        }
    }

    function handleInputMove(e) {
        if (!isDragging) return;
        
        const pos = getMousePos(e);
        const nodeIndex = findNodeAt(pos);

        if (nodeIndex !== -1 && nodeIndex !== lastNodeIndex) {
            const level = getLevel();
            // 检查这两个点之间是否有合法的边
            const edgeKey = [lastNodeIndex, nodeIndex].sort((a, b) => a - b).join('-');
            const isValidEdge = level.edges.some(edge => {
                const eKey = [...edge].sort((a, b) => a - b).join('-');
                return eKey === edgeKey;
            });

            if (isValidEdge) {
                // 检查这条边是否已经走过
                if (completedEdges.has(edgeKey)) {
                    // 如果走过，且正好是回退到上一个点，则允许回退（可选逻辑，这里简单化处理：不允许重复走）
                    statusMsgEl.textContent = "不能重复经过同一条边！";
                    statusMsgEl.style.color = "#f44336";
                } else {
                    playerPath.push(nodeIndex);
                    completedEdges.add(edgeKey);
                    lastNodeIndex = nodeIndex;
                    statusMsgEl.textContent = "继续连接...";
                    statusMsgEl.style.color = "#4a2b11";
                    
                    checkVictory();
                }
                draw();
            }
        }
    }

    function handleInputEnd() {
        isDragging = false;
        // 如果没赢，则不做处理，保持当前路径，或者可以设置成松开就重置
    }

    function checkVictory() {
        const level = getLevel();
        if (completedEdges.size === level.edges.length) {
            statusMsgEl.textContent = "恭喜过关！";
            statusMsgEl.style.color = "#2e7d32";
            isDragging = false;
            
            setTimeout(() => {
                if (currentLevelIndex < levels.length - 1) {
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
    });
    window.addEventListener('touchmove', (e) => {
        handleInputMove(e);
    });
    window.addEventListener('touchend', handleInputEnd);

    resetBtn.addEventListener('click', initLevel);
    
    backBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    modalNextBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentLevelIndex++;
        initLevel();
    });

    modalHomeBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // 初始化第一关
    initLevel();
});
