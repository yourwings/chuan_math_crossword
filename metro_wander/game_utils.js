// 游戏公共工具函数

/**
 * 显示加载状态
 * @param {boolean} isLoading 是否显示加载状态
 * @param {string} message 加载消息
 */
function showLoadingState(isLoading, message = '加载中...') {
  const loadingElement = document.getElementById('loading-indicator');
  if (!loadingElement) return;
  
  if (isLoading) {
    loadingElement.textContent = message;
    loadingElement.style.display = 'block';
  } else {
    loadingElement.style.display = 'none';
  }
}

/**
 * 随机发放地铁牌
 * @param {number} count 发放数量
 * @returns {string[]} 地铁牌数组
 */
function dealMetroCards(count) {
  // 使用用户选择的发牌数量
  const maxCardCount = count;
  console.log('开始发放地铁牌，请求数量:', count, '实际数量:', maxCardCount);
  
  const stationNames = window.metroData.stations.map(station => station.name);
  const playerHand = [];
  
  // 获取起点站和终点站
  const startStation = window.startStation;
  const endStation = window.endStation;
  
  // 检查起点站和终点站是否已设置
  if (!startStation || !endStation) {
    console.error('起点站或终点站未设置，无法生成路径');
    return randomSelectStations(count, []);
  }
  
  // 获取起点站和终点站的线路信息
  const startStationObj = window.metroData.stations.find(s => s.name === startStation);
  const endStationObj = window.metroData.stations.find(s => s.name === endStation);
  
  if (!startStationObj || !endStationObj) {
    console.error('无法找到起点站或终点站信息');
    return randomSelectStations(count, [startStation, endStation]);
  }
  
  // 创建已使用站点集合，避免重复
  const usedStations = new Set([startStation, endStation]);
  console.log('正在为起点站', startStation, '和终点站', endStation, '生成路径...');
  
  // 检查是否有预先生成的正确路径
  if (window.correctPath && window.correctPath.length > 0) {
    console.log('使用预先生成的正确路径:', window.correctPath);
    // 确保正确路径中的关键站点被包含在手牌中
    return includePathStationsInHand(window.correctPath, maxCardCount, usedStations);
  }
  
  // 获取当前难度
  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect ? difficultySelect.value : 'easy';
  
  // 根据难度设置路径长度限制
  let minLength = 1;
  let maxLength = 5;
  
  switch (difficulty) {
    case 'easy':
      minLength = 1;
      maxLength = 5;
      break;
    case 'medium':
      minLength = 3;
      maxLength = 8;
      break;
    case 'hard':
      minLength = 5;
      maxLength = 12;
      break;
  }
  
  // 检查起点和终点是否有共同线路
  const startLines = startStationObj.lines;
  const endLines = endStationObj.lines;
  let commonLine = null;
  
  for (const line of startLines) {
    if (endLines.includes(line)) {
      commonLine = line;
      break;
    }
  }
  
  // 尝试找到从起点到终点的路径
  let pathStations = [];
  
  // 如果有共同线路，找出该线路上的所有站点
  if (commonLine) {
    console.log('起点和终点在同一条线路上:', commonLine);
    // 找出该线路上的所有站点
    const lineStations = window.metroData.stations.filter(station => {
      return station.lines.includes(commonLine) && 
             station.name !== startStation && 
             station.name !== endStation;
    });
    
    // 随机选择一些站点添加到路径中
    const pathLength = Math.min(Math.floor(Math.random() * 3) + 1, lineStations.length);
    for (let i = 0; i < pathLength && lineStations.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * lineStations.length);
      const station = lineStations.splice(randomIndex, 1)[0];
      pathStations.push(station.name);
    }
  } else {
    console.log('起点和终点不在同一条线路上，需要换乘');
    // 需要换乘，找出可能的换乘站
    const startLineStations = window.metroData.stations.filter(station => {
      if (station.name === startStation || station.name === endStation) return false;
      return station.lines.some(line => startLines.includes(line));
    });
    
    const endLineStations = window.metroData.stations.filter(station => {
      if (station.name === startStation || station.name === endStation) return false;
      return station.lines.some(line => endLines.includes(line));
    });
    
    // 找出换乘站（同时在起点线路和终点线路上的站点）
    const transferStations = [];
    for (const startLineStation of startLineStations) {
      for (const endLineStation of endLineStations) {
        if (startLineStation.name === endLineStation.name) {
          transferStations.push(startLineStation);
          break;
        }
      }
    }
    
    // 如果找到换乘站，添加到路径中
    if (transferStations.length > 0) {
      console.log('找到可能的换乘站:', transferStations.map(s => s.name));
      // 随机选择一个换乘站
      const transferStation = transferStations[Math.floor(Math.random() * transferStations.length)];
      pathStations.push(transferStation.name);
      
      // 可能还需要添加一些中间站点
      const startToTransferStations = startLineStations.filter(station => 
        station.name !== transferStation.name && 
        station.lines.some(line => transferStation.lines.includes(line)));
      
      const transferToEndStations = endLineStations.filter(station => 
        station.name !== transferStation.name && 
        station.lines.some(line => transferStation.lines.includes(line)));
      
      // 随机添加一些中间站点
      if (startToTransferStations.length > 0) {
        const station = startToTransferStations[Math.floor(Math.random() * startToTransferStations.length)];
        pathStations.push(station.name);
      }
      
      if (transferToEndStations.length > 0) {
        const station = transferToEndStations[Math.floor(Math.random() * transferToEndStations.length)];
        pathStations.push(station.name);
      }
    }
  }
  
  console.log('生成的路径站点:', pathStations);
  
  // 将路径站点添加到玩家手牌中
  for (const station of pathStations) {
    if (!usedStations.has(station)) {
      playerHand.push(station);
      usedStations.add(station);
    }
  }
  
  // 如果路径站点不足，添加一些与起点站和终点站同线路的站点
  if (playerHand.length < maxCardCount) {
    // 找出所有与起点站同线路的站点
    const startLineStations = window.metroData.stations.filter(station => {
      if (usedStations.has(station.name)) return false;
      return station.lines.some(line => startLines.includes(line));
    });
    
    // 找出所有与终点站同线路的站点
    const endLineStations = window.metroData.stations.filter(station => {
      if (usedStations.has(station.name)) return false;
      return station.lines.some(line => endLines.includes(line));
    });
    
    // 优先添加换乘站
    const transferStations = [...startLineStations, ...endLineStations].filter(station => station.istransfer === 1);
    
    // 随机选择一些换乘站
    while (playerHand.length < Math.min(maxCardCount / 2, transferStations.length + playerHand.length)) {
      if (transferStations.length === 0) break;
      const randomIndex = Math.floor(Math.random() * transferStations.length);
      const station = transferStations.splice(randomIndex, 1)[0];
      if (!usedStations.has(station.name)) {
        playerHand.push(station.name);
        usedStations.add(station.name);
      }
    }
    
    // 随机选择一些普通站点（与起点站或终点站同线路）
    const regularStations = [...startLineStations, ...endLineStations].filter(station => !usedStations.has(station.name));
    while (playerHand.length < Math.min(maxCardCount * 3/4, regularStations.length + playerHand.length)) {
      if (regularStations.length === 0) break;
      const randomIndex = Math.floor(Math.random() * regularStations.length);
      const station = regularStations.splice(randomIndex, 1)[0];
      if (!usedStations.has(station.name)) {
        playerHand.push(station.name);
        usedStations.add(station.name);
      }
    }
  }
  
  // 如果手牌数量仍然不足，随机添加其他站点
  const remainingStations = stationNames.filter(name => !usedStations.has(name));
  while (playerHand.length < maxCardCount && remainingStations.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingStations.length);
    const station = remainingStations.splice(randomIndex, 1)[0];
    playerHand.push(station);
    usedStations.add(station);
  }
  
  // 随机打乱手牌顺序
  shuffleArray(playerHand);
  
  console.log('最终发放的地铁牌:', playerHand);
  return playerHand;
}

/**
 * 确保正确路径中的站点被包含在手牌中
 * @param {string[]} path 正确路径
 * @param {number} maxCount 最大手牌数量
 * @param {Set} usedStations 已使用的站点
 * @returns {string[]} 玩家手牌
 */
function includePathStationsInHand(path, maxCount, usedStations) {
  const playerHand = [];
  const stationNames = window.metroData.stations.map(station => station.name);
  
  // 检查路径是否有效
  if (!path || path.length === 0) {
    console.error('路径无效，无法添加路径站点到手牌');
    return randomSelectStations(maxCount, Array.from(usedStations));
  }
  
  console.log('正在将路径站点添加到手牌中，路径长度:', path.length);
  
  // 确保将所有路径站点添加到手牌中
  console.log('确保将所有路径站点添加到手牌中');
  
  // 首先添加所有路径站点（确保路径完整）
  for (const station of path) {
    if (!usedStations.has(station) && playerHand.length < maxCount) {
      playerHand.push(station);
      usedStations.add(station);
      console.log('添加路径站点到手牌:', station);
    }
  }
  
  // 记录已添加的路径站点数量
  const pathStationsAdded = playerHand.length;
  console.log('已添加的路径站点数量:', pathStationsAdded);
  
  // 检查是否所有路径站点都已添加
  const allPathStationsAdded = path.every(station => usedStations.has(station));
  console.log('是否所有路径站点都已添加:', allPathStationsAdded ? '是' : '否');
  
  // 如果没有添加所有路径站点，记录哪些站点未被添加
  if (!allPathStationsAdded) {
    const missingStations = path.filter(station => !usedStations.has(station));
    console.log('未添加到手牌的路径站点:', missingStations);
  }
  
  console.log('已添加的路径站点数量:', playerHand.length);
  
  // 如果手牌数量仍然不足，随机添加其他站点
  const remainingStations = stationNames.filter(name => !usedStations.has(name));
  while (playerHand.length < maxCount && remainingStations.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingStations.length);
    const station = remainingStations.splice(randomIndex, 1)[0];
    playerHand.push(station);
    usedStations.add(station);
  }
  
  // 随机打乱手牌顺序
  shuffleArray(playerHand);
  
  console.log('包含正确路径的手牌:', playerHand);
  return playerHand;
}

/**
 * 随机选择站点作为手牌
 * @param {number} count 手牌数量
 * @param {string[]} excludeStations 排除的站点
 * @returns {string[]} 玩家手牌
 */
function randomSelectStations(count, excludeStations = []) {
  const stationNames = window.metroData.stations.map(station => station.name);
  const usedStations = new Set(excludeStations);
  const playerHand = [];
  
  // 随机选择站点
  while (playerHand.length < count && stationNames.length > usedStations.size) {
    const availableStations = stationNames.filter(name => !usedStations.has(name));
    const randomIndex = Math.floor(Math.random() * availableStations.length);
    const station = availableStations[randomIndex];
    playerHand.push(station);
    usedStations.add(station);
  }
  
  // 随机打乱手牌顺序
  shuffleArray(playerHand);
  
  return playerHand;
}

/**
 * 随机打乱数组
 * @param {Array} array 要打乱的数组
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
  

/**
 * 渲染玩家手牌
 * @param {string[]} playerHand 玩家手牌
 * @param {string} containerId 容器ID
 * @param {Function} onCardClick 点击卡牌的回调函数
 */
function renderPlayerHand(playerHand, containerId, onCardClick) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // 清空容器
  container.innerHTML = '';
  
  // 为每张牌创建元素
  playerHand.forEach(stationName => {
    const card = document.createElement('div');
    card.className = 'metro-card';
    
    // 创建站名元素
    const stationNameElement = document.createElement('div');
    stationNameElement.className = 'station-name';
    stationNameElement.textContent = stationName;
    card.appendChild(stationNameElement);
    
    // 获取站点信息
    const stationInfo = window.metroData.stations.find(s => s.name === stationName);
    if (stationInfo) {
      // 添加线路信息
      const lineInfo = document.createElement('div');
      lineInfo.className = 'line-info';
      
      stationInfo.lines.forEach(lineId => {
        const lineSpan = document.createElement('span');
        lineSpan.className = 'line-tag';
        
        // 添加特定线路的CSS类
        const lineClass = typeof lineId === 'string' ? lineId : lineId.toString();
        lineSpan.classList.add(`line-${lineClass}`);
        
        // 查找线路名称
        const lineData = window.metroData.lines.find(l => l.id === lineId);
        if (lineData) {
          lineSpan.textContent = lineData.name;
        } else {
          lineSpan.textContent = `线路${lineId}`;
        }
        
        lineInfo.appendChild(lineSpan);
      });
      
      card.appendChild(lineInfo);
      
      // 添加换乘站标记
      if (stationInfo.istransfer === 1) {
        card.classList.add('transfer-station');
        
        // 添加换乘站徽章
        const transferBadge = document.createElement('div');
        transferBadge.className = 'transfer-station-badge';
        transferBadge.textContent = '换乘站';
        card.appendChild(transferBadge);
      }
    }
    
    // 添加点击事件
    if (onCardClick) {
      card.addEventListener('click', () => onCardClick(stationName));
    }
    
    container.appendChild(card);
  });
}

/**
 * 更新站点显示
 * @param {string} startStation 起点站
 * @param {string} endStation 终点站
 * @param {string} startElementId 起点站元素ID
 * @param {string} endElementId 终点站元素ID
 */
function updateStationDisplay(startStation, endStation, startElementId, endElementId) {
  const startElement = document.getElementById(startElementId);
  const endElement = document.getElementById(endElementId);
  
  if (startElement) {
    // 清除之前的内容
    startElement.innerHTML = '';
    
    // 创建站名元素
    const nameElement = document.createElement('div');
    nameElement.className = 'station-name-large';
    nameElement.textContent = startStation;
    startElement.appendChild(nameElement);
    
    // 创建线路信息容器
    const linesContainer = document.createElement('div');
    linesContainer.id = `${startElementId}-lines`;
    linesContainer.className = 'station-lines';
    startElement.appendChild(linesContainer);
    
    // 添加线路信息
    // 检查metroData是否已加载以及站点是否存在
    if (window.metroData && window.metroData.stations) {
      const startStationInfo = window.metroData.stations.find(s => s.name === startStation);
      if (startStationInfo) {
        startStationInfo.lines.forEach(lineId => {
          const lineSpan = document.createElement('span');
          lineSpan.className = 'line-tag line-tag-large';
          
          // 添加特定线路的CSS类
          const lineClass = typeof lineId === 'string' ? lineId : lineId.toString();
          lineSpan.classList.add(`line-${lineClass}`);
          
          // 查找线路名称
          const lineData = window.metroData.lines.find(l => l.id === lineId);
          if (lineData) {
            lineSpan.textContent = lineData.name;
          } else {
            lineSpan.textContent = `线路${lineId}`;
          }
          
          linesContainer.appendChild(lineSpan);
        });
      } else {
        console.warn(`无法找到起点站信息: ${startStation}`);
      }
    } else {
      console.error('地铁数据未正确加载，无法显示线路信息');
    }
  }
  
  if (endElement) {
    // 清除之前的内容
    endElement.innerHTML = '';
    
    // 创建站名元素
    const nameElement = document.createElement('div');
    nameElement.className = 'station-name-large';
    nameElement.textContent = endStation;
    endElement.appendChild(nameElement);
    
    // 创建线路信息容器
    const linesContainer = document.createElement('div');
    linesContainer.id = `${endElementId}-lines`;
    linesContainer.className = 'station-lines';
    endElement.appendChild(linesContainer);
    
    // 添加线路信息
    // 检查metroData是否已加载以及站点是否存在
    if (window.metroData && window.metroData.stations) {
      const endStationInfo = window.metroData.stations.find(s => s.name === endStation);
      if (endStationInfo) {
        endStationInfo.lines.forEach(lineId => {
          const lineSpan = document.createElement('span');
          lineSpan.className = 'line-tag line-tag-large';
          
          // 添加特定线路的CSS类
          const lineClass = typeof lineId === 'string' ? lineId : lineId.toString();
          lineSpan.classList.add(`line-${lineClass}`);
          
          // 查找线路名称
          const lineData = window.metroData.lines.find(l => l.id === lineId);
          if (lineData) {
            lineSpan.textContent = lineData.name;
          } else {
            lineSpan.textContent = `线路${lineId}`;
          }
          
          linesContainer.appendChild(lineSpan);
        });
      } else {
        console.warn(`无法找到终点站信息: ${endStation}`);
      }
    } else {
      console.error('地铁数据未正确加载，无法显示线路信息');
    }
  }
}

/**
 * 更新路径显示
 * @param {string[]} path 路径数组
 * @param {string} elementId 显示元素ID
 */
function updatePathDisplay(path, elementId) {
  const pathElement = document.getElementById(elementId);
  if (!pathElement) return;
  
  // 清空路径显示
  pathElement.innerHTML = '';
  
  // 如果路径为空，显示提示信息
  if (!path || path.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-path';
    emptyMessage.textContent = '当前路径为空';
    pathElement.appendChild(emptyMessage);
    return;
  }
  
  // 创建横向路径容器
  const horizontalPath = document.createElement('div');
  horizontalPath.className = 'path-horizontal';
  
  // 创建路径元素
  path.forEach((station, index) => {
    const stationElement = document.createElement('div');
    stationElement.className = 'path-station';
    
    // 站点名称
    const nameElement = document.createElement('span');
    nameElement.className = 'station-name';
    nameElement.textContent = station;
    stationElement.appendChild(nameElement);
    
    // 添加线路信息
    const stationInfo = window.metroData.stations.find(s => s.name === station);
    if (stationInfo) {
      const lineInfo = document.createElement('div');
      lineInfo.className = 'station-lines';
      
      stationInfo.lines.forEach(lineId => {
        const lineSpan = document.createElement('span');
        // 使用CSS类来设置线路颜色
        const lineClass = getLineClassName(lineId);
        lineSpan.className = `line-tag line-${lineClass}`;
        
        // 获取线路名称
        const lineData = window.metroData.lines.find(l => l.id === lineId);
        lineSpan.textContent = lineData ? lineData.name : `线路${lineId}`;
        
        lineInfo.appendChild(lineSpan);
      });
      
      stationElement.appendChild(lineInfo);
      
      // 添加换乘站标记
      if (stationInfo.istransfer === 1) {
        stationElement.classList.add('transfer-station');
      }
    }
    
    horizontalPath.appendChild(stationElement);
    
    // 添加箭头（除了最后一个站点）
    if (index < path.length - 1) {
      const arrowElement = document.createElement('div');
      arrowElement.className = 'path-arrow';
      arrowElement.innerHTML = '&rarr;'; // 改为向右箭头
      
      // 检查下一个站点是否是换乘站
      const nextStation = path[index + 1];
      const nextStationInfo = window.metroData.stations.find(s => s.name === nextStation);
      if (nextStationInfo && nextStationInfo.istransfer === 1) {
        const transferInfo = document.createElement('div');
        transferInfo.className = 'transfer-info';
        transferInfo.textContent = '换乘站';
        arrowElement.appendChild(transferInfo);
      }
      
      // 查找两站之间的共同线路
      if (stationInfo && nextStationInfo) {
        const commonLines = stationInfo.lines.filter(line => nextStationInfo.lines.includes(line));
        
        if (commonLines.length > 0) {
          const lineContainer = document.createElement('div');
          lineContainer.className = 'common-lines';
          
          commonLines.forEach(lineId => {
            const lineSpan = document.createElement('span');
            const lineClass = getLineClassName(lineId);
            lineSpan.className = `line-tag line-${lineClass}`;
            
            const lineData = window.metroData.lines.find(l => l.id === lineId);
            lineSpan.textContent = lineData ? lineData.name : `线路${lineId}`;
            
            lineContainer.appendChild(lineSpan);
          });
          
          arrowElement.appendChild(lineContainer);
        }
      }
      
      horizontalPath.appendChild(arrowElement);
    }
  });
  
  // 将横向路径容器添加到路径元素
  pathElement.appendChild(horizontalPath);
}

// 获取线路的CSS类名
function getLineClassName(lineId) {
  // 将线路ID转换为CSS类名
  if (typeof lineId === 'number') {
    return lineId;
  } else if (typeof lineId === 'string') {
    // 处理特殊线路名称
    return lineId.toLowerCase();
  }
  return 'unknown';
}

/**
 * 可视化完整路径图，显示起点、终点和所有中间站点，以及它们所属的线路
 * @param {string} start 起点站名
 * @param {string} end 终点站名
 * @param {string[]} path 路径（不包括起点站）
 * @param {string} elementId 显示路径图的元素ID
 */
function visualizeCompletePathGraph(start, end, path, elementId = 'debug-path-graph') {
  // 确保有一个显示路径图的元素
  let graphElement = document.getElementById(elementId);
  
  // 如果元素不存在，创建一个
  if (!graphElement) {
    graphElement = document.createElement('div');
    graphElement.id = elementId;
    graphElement.className = 'debug-path-graph';
    
    // 添加标题
    const titleElement = document.createElement('h3');
    titleElement.textContent = '完整路径图分析';
    graphElement.appendChild(titleElement);
    
    // 添加到页面中
    const gameContainer = document.querySelector('.game-container') || document.body;
    gameContainer.appendChild(graphElement);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .debug-path-graph {
        margin-top: 20px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
        max-width: 100%;
        overflow-x: auto;
      }
      .debug-path-graph h3 {
        margin-top: 0;
        color: #333;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
      }
      .path-graph-section {
        margin-bottom: 15px;
      }
      .path-graph-section h4 {
        margin: 10px 0 5px;
        color: #555;
      }
      .station-info {
        display: flex;
        align-items: center;
        margin: 5px 0;
        padding: 8px;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .station-info.start-station {
        background-color: #e6f7e6;
        border-left: 4px solid #4CAF50;
      }
      .station-info.end-station {
        background-color: #ffebee;
        border-left: 4px solid #F44336;
      }
      .station-info.transfer-station {
        background-color: #fff8e1;
        border-left: 4px solid #FFC107;
      }
      .station-name-debug {
        font-weight: bold;
        margin-right: 10px;
        min-width: 80px;
      }
      .station-type {
        font-size: 0.8em;
        padding: 2px 6px;
        border-radius: 10px;
        margin-right: 10px;
        color: white;
      }
      .station-type.start {
        background-color: #4CAF50;
      }
      .station-type.end {
        background-color: #F44336;
      }
      .station-type.middle {
        background-color: #2196F3;
      }
      .station-type.transfer {
        background-color: #FF9800;
      }
      .station-lines-debug {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .connection-info {
        display: flex;
        align-items: center;
        margin: 5px 0;
        padding: 8px;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .connection-arrow {
        margin: 0 10px;
        font-size: 1.2em;
        color: #555;
      }
      .connection-lines {
        flex-grow: 1;
      }
      .no-common-line {
        color: #F44336;
        font-weight: bold;
      }
      .summary-info {
        margin-top: 15px;
        padding: 10px;
        background-color: #e8eaf6;
        border-radius: 4px;
        font-weight: bold;
      }
      .transfer-count {
        color: #FF9800;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 清空内容
  graphElement.innerHTML = '';
  
  // 添加标题
  const titleElement = document.createElement('h3');
  titleElement.textContent = '完整路径图分析';
  graphElement.appendChild(titleElement);
  
  // 如果路径为空，显示提示信息
  if (!path || path.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-path';
    emptyMessage.textContent = '未找到有效路径';
    graphElement.appendChild(emptyMessage);
    return;
  }
  
  // 完整路径（包括起点站）
  const fullPath = [start, ...path];
  
  // 创建站点信息部分
  const stationsSection = document.createElement('div');
  stationsSection.className = 'path-graph-section';
  
  const stationsTitle = document.createElement('h4');
  stationsTitle.textContent = '站点信息';
  stationsSection.appendChild(stationsTitle);
  
  // 添加站点信息
  fullPath.forEach((stationName, index) => {
    const stationObj = window.metroData.stations.find(s => s.name === stationName);
    if (!stationObj) return;
    
    const stationElement = document.createElement('div');
    stationElement.className = 'station-info';
    
    // 设置站点类型样式
    if (index === 0) {
      stationElement.classList.add('start-station');
    } else if (index === fullPath.length - 1) {
      stationElement.classList.add('end-station');
    } else if (stationObj.istransfer === 1) {
      stationElement.classList.add('transfer-station');
    }
    
    // 站点名称
    const nameElement = document.createElement('div');
    nameElement.className = 'station-name-debug';
    nameElement.textContent = stationName;
    stationElement.appendChild(nameElement);
    
    // 站点类型标签
    const typeElement = document.createElement('span');
    typeElement.className = 'station-type';
    if (index === 0) {
      typeElement.textContent = '起点';
      typeElement.classList.add('start');
    } else if (index === fullPath.length - 1) {
      typeElement.textContent = '终点';
      typeElement.classList.add('end');
    } else {
      typeElement.textContent = '中间站';
      typeElement.classList.add('middle');
    }
    stationElement.appendChild(typeElement);
    
    // 如果是换乘站，添加换乘标签
    if (stationObj.istransfer === 1) {
      const transferElement = document.createElement('span');
      transferElement.className = 'station-type transfer';
      transferElement.textContent = '换乘站';
      stationElement.appendChild(transferElement);
    }
    
    // 添加线路信息
    const linesElement = document.createElement('div');
    linesElement.className = 'station-lines-debug';
    
    stationObj.lines.forEach(lineId => {
      const lineSpan = document.createElement('span');
      lineSpan.className = 'line-tag';
      
      // 查找线路颜色
      const lineData = window.metroData.lines.find(l => l.id === lineId);
      if (lineData) {
        lineSpan.style.backgroundColor = lineData.color;
        lineSpan.textContent = lineData.name;
      } else {
        lineSpan.textContent = `线路${lineId}`;
      }
      
      linesElement.appendChild(lineSpan);
    });
    
    stationElement.appendChild(linesElement);
    stationsSection.appendChild(stationElement);
  });
  
  graphElement.appendChild(stationsSection);
  
  // 创建连接信息部分
  const connectionsSection = document.createElement('div');
  connectionsSection.className = 'path-graph-section';
  
  const connectionsTitle = document.createElement('h4');
  connectionsTitle.textContent = '连接信息';
  connectionsSection.appendChild(connectionsTitle);
  
  // 添加连接信息
  let transferCount = 0;
  
  for (let i = 1; i < fullPath.length; i++) {
    const fromStation = fullPath[i-1];
    const toStation = fullPath[i];
    
    const fromStationObj = window.metroData.stations.find(s => s.name === fromStation);
    const toStationObj = window.metroData.stations.find(s => s.name === toStation);
    
    if (!fromStationObj || !toStationObj) continue;
    
    const connectionElement = document.createElement('div');
    connectionElement.className = 'connection-info';
    
    // 起始站点
    const fromElement = document.createElement('div');
    fromElement.className = 'station-name-debug';
    fromElement.textContent = fromStation;
    connectionElement.appendChild(fromElement);
    
    // 箭头
    const arrowElement = document.createElement('div');
    arrowElement.className = 'connection-arrow';
    arrowElement.innerHTML = '&rarr;';
    connectionElement.appendChild(arrowElement);
    
    // 目标站点
    const toElement = document.createElement('div');
    toElement.className = 'station-name-debug';
    toElement.textContent = toStation;
    connectionElement.appendChild(toElement);
    
    // 共同线路信息
    const commonLines = fromStationObj.lines.filter(line => toStationObj.lines.includes(line));
    
    const linesElement = document.createElement('div');
    linesElement.className = 'connection-lines';
    
    if (commonLines.length > 0) {
      linesElement.textContent = '共同线路: ';
      
      commonLines.forEach((lineId, idx) => {
        const lineSpan = document.createElement('span');
        lineSpan.className = 'line-tag';
        
        // 查找线路颜色
        const lineData = window.metroData.lines.find(l => l.id === lineId);
        if (lineData) {
          lineSpan.style.backgroundColor = lineData.color;
          lineSpan.textContent = lineData.name;
        } else {
          lineSpan.textContent = `线路${lineId}`;
        }
        
        linesElement.appendChild(lineSpan);
        
        // 添加分隔符
        if (idx < commonLines.length - 1) {
          const separator = document.createTextNode(' ');
          linesElement.appendChild(separator);
        }
      });
    } else {
      // 如果没有共同线路，需要换乘
      const noCommonLineElement = document.createElement('span');
      noCommonLineElement.className = 'no-common-line';
      noCommonLineElement.textContent = '需要换乘';
      linesElement.appendChild(noCommonLineElement);
      
      transferCount++;
    }
    
    connectionElement.appendChild(linesElement);
    connectionsSection.appendChild(connectionElement);
  }
  
  graphElement.appendChild(connectionsSection);
  
  // 添加摘要信息
  const summaryElement = document.createElement('div');
  summaryElement.className = 'summary-info';
  summaryElement.innerHTML = `总站点数: <strong>${fullPath.length}</strong> | 
                             换乘次数: <span class="transfer-count">${transferCount}</span> | 
                             路径长度: <strong>${path.length}</strong>站`;
  graphElement.appendChild(summaryElement);
  
  // 显示元素
  graphElement.style.display = 'block';
}

/**
 * 格式化时间为分:秒格式
 * @param {number} seconds 总秒数
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 显示站点选择界面
 * @param {Function} onStartStationSelect 选择起点站的回调函数
 * @param {Function} onEndStationSelect 选择终点站的回调函数
 * @returns {HTMLElement} 对话框元素
 */
function showStationSelectionUI(onStartStationSelect, onEndStationSelect) {
  // 创建对话框
  const dialog = document.createElement('div');
  dialog.className = 'station-selection-dialog';
  
  // 创建标题
  const title = document.createElement('h3');
  title.textContent = '选择站点';
  dialog.appendChild(title);
  
  // 创建站点列表
  const stationList = document.createElement('div');
  stationList.className = 'station-list';
  
  // 获取所有站点并按线路分组
  const stationsByLine = {};
  window.metroData.stations.forEach(station => {
    station.lines.forEach(lineId => {
      if (!stationsByLine[lineId]) {
        stationsByLine[lineId] = [];
      }
      if (!stationsByLine[lineId].includes(station)) {
        stationsByLine[lineId].push(station);
      }
    });
  });
  
  // 为每条线路创建一个分组
  window.metroData.lines.forEach(line => {
    const lineGroup = document.createElement('div');
    lineGroup.className = 'line-group';
    
    // 线路标题
    const lineTitle = document.createElement('div');
    lineTitle.className = 'line-title';
    lineTitle.textContent = line.name;
    lineTitle.style.backgroundColor = line.color;
    lineGroup.appendChild(lineTitle);
    
    // 线路站点
    const stations = stationsByLine[line.id] || [];
    stations.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    
    stations.forEach(station => {
      const stationItem = document.createElement('div');
      stationItem.className = 'station-item';
      stationItem.textContent = station.name;
      
      // 添加换乘站标记
      if (station.istransfer === 1) {
        stationItem.classList.add('transfer-station');
      }
      
      // 添加点击事件
      stationItem.addEventListener('click', () => {
        // 根据当前操作调用不同的回调
        if (onStartStationSelect) {
          onStartStationSelect(station.name);
        } else if (onEndStationSelect) {
          onEndStationSelect(station.name);
        }
        
        // 关闭对话框
        document.body.removeChild(dialog);
      });
      
      lineGroup.appendChild(stationItem);
    });
    
    stationList.appendChild(lineGroup);
  });
  
  dialog.appendChild(stationList);
  
  // 添加关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.textContent = '关闭';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(dialog);
  });
  dialog.appendChild(closeButton);
  
  // 将对话框添加到页面
  document.body.appendChild(dialog);
  
  return dialog;
}

// 导出函数
export {
  showLoadingState,
  dealMetroCards,
  renderPlayerHand,
  updateStationDisplay,
  updatePathDisplay,
  formatTime,
  showStationSelectionUI,
  shuffleArray
};