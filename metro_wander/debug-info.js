// 调试信息相关函数

// 收集并显示调试信息
function displayDebugInfo() {
    // 收集调试信息
    const debugInfo = collectDebugInfo();
    
    // 在控制台输出调试信息
    console.log('调试信息:', debugInfo);
    
    // 在游戏界面显示调试信息
    renderDebugInfo(debugInfo);
}

// 收集调试信息
function collectDebugInfo() {
    // 创建调试信息对象
    const debugInfo = {
        gameMode: document.getElementById('game-mode') ? document.getElementById('game-mode').value : 'solo-exploration',
        difficulty: document.getElementById('difficulty') ? document.getElementById('difficulty').value : 'easy',
        currentPath: [],
        playerCards: [],
        pathSearchInfo: {
            searchedPaths: [],
            foundPaths: [],
            transferInfo: []
        }
    };
    
    // 收集当前路径信息
    try {
        const currentPathElement = document.querySelector('.path-horizontal');
        if (currentPathElement) {
            debugInfo.currentPath = Array.from(currentPathElement.querySelectorAll('.path-station .station-name'))
                .map(el => el.textContent);
        }
        
        // 收集玩家手牌信息
        const playerHandElement = document.querySelector('.cards-container');
        if (playerHandElement) {
            debugInfo.playerCards = Array.from(playerHandElement.querySelectorAll('.metro-card'))
                .map(el => {
                    const stationName = el.textContent.split('\n')[0].trim();
                    const lines = Array.from(el.querySelectorAll('.line-tag'))
                        .map(lineTag => lineTag.textContent);
                    return { station: stationName, lines: lines };
                });
        }
        
        // 如果有全局的pathFinder对象，收集路径搜索信息
        if (window.pathFinder) {
            // 收集搜索过的路径
            if (window.pathFinder.searchedPaths) {
                debugInfo.pathSearchInfo.searchedPaths = window.pathFinder.searchedPaths.map(path => {
                    return path.map(station => station.name);
                });
            }
            
            // 收集找到的路径
            if (window.pathFinder.foundPaths) {
                debugInfo.pathSearchInfo.foundPaths = window.pathFinder.foundPaths.map(path => {
                    return path.map(station => station.name);
                });
            }
            
            // 收集换乘信息
            if (window.pathFinder.transferInfo) {
                debugInfo.pathSearchInfo.transferInfo = window.pathFinder.transferInfo;
            }
        }
    } catch (e) {
        console.error('收集调试信息时出错:', e);
    }
    
    return debugInfo;
}

// 在游戏界面渲染调试信息
function renderDebugInfo(debugInfo) {
    // 创建或获取调试信息容器
    let debugContainer = document.getElementById('debug-info-container');
    
    if (!debugContainer) {
        // 如果容器不存在，创建一个新的
        debugContainer = document.createElement('div');
        debugContainer.id = 'debug-info-container';
        debugContainer.className = 'debug-info-container';
        
        // 设置样式
        debugContainer.style.position = 'absolute';
        debugContainer.style.top = '10px';
        debugContainer.style.right = '10px';
        debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugContainer.style.color = 'white';
        debugContainer.style.padding = '10px';
        debugContainer.style.borderRadius = '5px';
        debugContainer.style.fontSize = '14px';
        debugContainer.style.maxWidth = '400px';
        debugContainer.style.maxHeight = '500px';
        debugContainer.style.overflowY = 'auto';
        debugContainer.style.zIndex = '1000';
        debugContainer.style.width = '30px';
        debugContainer.style.height = '30px';
        debugContainer.style.overflow = 'hidden';
        
        // 添加到文档
        document.body.appendChild(debugContainer);
    }
    
    // 检查容器当前状态
    if (debugContainer.style.width === '30px' && debugContainer.style.height === '30px') {
        // 如果是折叠状态，显示展开按钮
        debugContainer.innerHTML = '<button id="toggle-debug-info" style="width: 30px; height: 30px;">+</button>';
        
        // 添加展开按钮事件
        document.getElementById('toggle-debug-info').addEventListener('click', function() {
            // 展开调试信息
            debugContainer.style.width = '';
            debugContainer.style.height = '';
            debugContainer.style.maxWidth = '400px';
            debugContainer.style.maxHeight = '500px';
            debugContainer.style.overflow = 'auto';
            
            // 重新渲染完整内容
            renderDebugInfoContent(debugContainer, debugInfo);
        });
    } else {
        // 如果已经展开，直接更新内容
        renderDebugInfoContent(debugContainer, debugInfo);
    }
}

// 渲染调试信息内容
function renderDebugInfoContent(container, debugInfo) {
    let html = '<div style="display: flex; justify-content: space-between; align-items: center;">';
    html += '<h3 style="margin: 0;">调试信息</h3>';
    html += '<button id="toggle-debug-info-collapse" style="background: none; border: none; color: white; cursor: pointer;">-</button>';
    html += '</div>';
    
    // 游戏基本信息
    html += `<p>游戏模式: ${debugInfo.gameMode}</p>`;
    html += `<p>难度级别: ${debugInfo.difficulty}</p>`;
    
    // 当前路径信息
    html += '<details open>';
    html += '<summary style="cursor: pointer; margin-bottom: 5px;">当前路径</summary>';
    if (debugInfo.currentPath.length > 0) {
        html += '<ul style="margin: 0; padding-left: 20px;">';
        debugInfo.currentPath.forEach((station, index) => {
            html += `<li>${station}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p style="margin: 5px 0;">暂无路径</p>';
    }
    html += '</details>';
    
    // 玩家手牌信息
    html += '<details>';
    html += '<summary style="cursor: pointer; margin: 5px 0;">玩家手牌</summary>';
    if (debugInfo.playerCards.length > 0) {
        html += '<ul style="margin: 0; padding-left: 20px;">';
        debugInfo.playerCards.forEach((card, index) => {
            html += `<li>${card.station} (${card.lines.join(', ')})</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p style="margin: 5px 0;">暂无手牌</p>';
    }
    html += '</details>';
    
    // 路径搜索信息
    html += '<details>';
    html += '<summary style="cursor: pointer; margin: 5px 0;">路径搜索信息</summary>';
    
    // 搜索过的路径
    html += '<details>';
    html += '<summary style="cursor: pointer; margin: 5px 0; padding-left: 10px;">搜索过的路径</summary>';
    if (debugInfo.pathSearchInfo.searchedPaths.length > 0) {
        html += '<ul style="margin: 0; padding-left: 30px;">';
        debugInfo.pathSearchInfo.searchedPaths.forEach((path, index) => {
            if (index < 10) { // 限制显示数量，避免过多
                html += `<li>${path.join(' → ')}</li>`;
            }
        });
        if (debugInfo.pathSearchInfo.searchedPaths.length > 10) {
            html += `<li>... 共${debugInfo.pathSearchInfo.searchedPaths.length}条路径</li>`;
        }
        html += '</ul>';
    } else {
        html += '<p style="margin: 5px 0; padding-left: 10px;">暂无搜索路径</p>';
    }
    html += '</details>';
    
    // 找到的路径
    html += '<details>';
    html += '<summary style="cursor: pointer; margin: 5px 0; padding-left: 10px;">找到的路径</summary>';
    if (debugInfo.pathSearchInfo.foundPaths.length > 0) {
        html += '<ul style="margin: 0; padding-left: 30px;">';
        debugInfo.pathSearchInfo.foundPaths.forEach((path, index) => {
            html += `<li>${path.join(' → ')}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p style="margin: 5px 0; padding-left: 10px;">暂无找到的路径</p>';
    }
    html += '</details>';
    
    // 换乘信息
    html += '<details>';
    html += '<summary style="cursor: pointer; margin: 5px 0; padding-left: 10px;">换乘信息</summary>';
    if (debugInfo.pathSearchInfo.transferInfo.length > 0) {
        html += '<ul style="margin: 0; padding-left: 30px;">';
        debugInfo.pathSearchInfo.transferInfo.forEach((transfer, index) => {
            html += `<li>${transfer.station}: ${transfer.fromLine} → ${transfer.toLine}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p style="margin: 5px 0; padding-left: 10px;">暂无换乘信息</p>';
    }
    html += '</details>';
    
    html += '</details>';
    
    // 设置容器内容
    container.innerHTML = html;
    
    // 添加折叠按钮事件
    document.getElementById('toggle-debug-info-collapse').addEventListener('click', function() {
        // 折叠调试信息
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.overflow = 'hidden';
        container.innerHTML = '<button id="toggle-debug-info" style="width: 30px; height: 30px;">+</button>';
        
        // 添加展开按钮事件
        document.getElementById('toggle-debug-info').addEventListener('click', function() {
            // 展开调试信息
            container.style.width = '';
            container.style.height = '';
            container.style.maxWidth = '400px';
            container.style.maxHeight = '500px';
            container.style.overflow = 'auto';
            
            // 重新渲染完整内容
            renderDebugInfoContent(container, debugInfo);
        });
    });
}

// 导出函数
export { displayDebugInfo, collectDebugInfo, renderDebugInfo };