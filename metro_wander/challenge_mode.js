// 地铁漫游 - 挑战模式实现

import { metroData, areStationsConnected } from './metro_data.js';
import { findPath } from './path_finder.js';
import {
  showLoadingState,
  dealMetroCards,
  renderPlayerHand,
  updateStationDisplay,
  updatePathDisplay,
  formatTime,
  shuffleArray
} from './game_utils.js';

// 游戏状态变量
let playerHand = [];
let currentPath = [];
let playerScore = 0;
let remainingTime = 300; // 默认5分钟倒计时
let gameStarted = false;
let timerInterval = null;
let startStation = '';
let endStation = '';
let foundRoutes = []; // 存储已找到的有效路线
let selectedCards = []; // 存储当前选中的卡牌

/**
 * 初始化挑战模式
 */
function initChallengeMode() {
  console.log('初始化挑战模式');
  
  // 获取UI元素
  const challengeUI = document.getElementById('challenge-ui');
  const startStationElement = document.getElementById('start-station');
  const endStationElement = document.getElementById('end-station');
  const currentPathElement = document.getElementById('current-path');
  const playerHandElement = document.getElementById('player-hand');
  const scoreElement = document.getElementById('score');
  const timerElement = document.getElementById('timer');
  const startChallengeBtn = document.getElementById('start-challenge-btn');
  const resetPathBtn = document.getElementById('reset-path-btn');
  const submitPathBtn = document.getElementById('submit-path-btn');
  const foundRoutesElement = document.getElementById('found-routes');
  const foundRoutesCountElement = document.getElementById('found-routes-count');
  
  // 检查UI元素是否存在
  if (!challengeUI) {
    console.error('无法找到游戏UI元素');
    return;
  }
  
  // 隐藏挑战UI
  challengeUI.style.display = 'none';
  
  // 重置游戏状态
  playerHand = [];
  currentPath = [];
  playerScore = 0;
  foundRoutes = [];
  selectedCards = [];
  gameStarted = false;
  startStation = '';
  endStation = '';
  
  // 更新分数显示
  if (scoreElement) scoreElement.textContent = `得分: ${playerScore}`;
  
  // 更新计时器显示
  const challengeTimeSelect = document.getElementById('challenge-time');
  remainingTime = challengeTimeSelect ? parseInt(challengeTimeSelect.value) : 300;
  if (timerElement) timerElement.textContent = `时间: ${formatTime(remainingTime)}`;
  console.log('设置挑战时间:', remainingTime, '秒');
  
  // 清除之前的计时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // 添加开始挑战按钮的点击事件
  if (startChallengeBtn) {
    startChallengeBtn.onclick = startChallenge;
  }
  
  // 添加重置路径按钮的点击事件
  if (resetPathBtn) {
    resetPathBtn.onclick = resetCurrentPath;
    resetPathBtn.disabled = true;
  }
  
  // 添加提交路径按钮的点击事件
  if (submitPathBtn) {
    submitPathBtn.onclick = submitPath;
    submitPathBtn.disabled = true;
  }
  
  // 添加重新挑战按钮的点击事件
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.onclick = retryChallenge;
  }
  
  // 添加新的挑战按钮的点击事件
  const newChallengeBtn = document.getElementById('new-challenge-btn');
  if (newChallengeBtn) {
    newChallengeBtn.onclick = newChallenge;
  }
  
  // 清空已找到的路线
  if (foundRoutesElement) foundRoutesElement.innerHTML = '';
  if (foundRoutesCountElement) foundRoutesCountElement.textContent = '0';
  
  console.log('挑战模式初始化完成');
}

/**
 * 开始挑战
 */
async function startChallenge() {
  if (gameStarted) return;
  
  gameStarted = true;
  console.log('挑战开始');
  
  // 显示挑战UI
  const challengeUI = document.getElementById('challenge-ui');
  if (challengeUI) challengeUI.style.display = 'block';
  
  // 禁用开始挑战按钮和设置选项
  const startChallengeBtn = document.getElementById('start-challenge-btn');
  if (startChallengeBtn) startChallengeBtn.disabled = true;
  
  const challengeTimeSelect = document.getElementById('challenge-time');
  if (challengeTimeSelect) challengeTimeSelect.disabled = true;
  
  const cardsCountSelect = document.getElementById('cards-count');
  if (cardsCountSelect) cardsCountSelect.disabled = true;
  
  // 启用重置路径按钮
  const resetPathBtn = document.getElementById('reset-path-btn');
  if (resetPathBtn) resetPathBtn.disabled = false;
  
  // 确保metroData可用
  if (!metroData || !metroData.stations || metroData.stations.length === 0) {
    console.error('地铁数据不可用');
    showLoadingState(false);
    alert('无法加载地铁数据，请刷新页面重试');
    return;
  }
  
  // 随机选择起点站和终点站
  const stationNames = metroData.stations.map(station => station.name);
  console.log('可用站点数量:', stationNames.length);
  startStation = stationNames[Math.floor(Math.random() * stationNames.length)];
  
  // 确保终点站与起点站不同
  do {
    endStation = stationNames[Math.floor(Math.random() * stationNames.length)];
  } while (endStation === startStation);
  
  console.log('选择的起点站:', startStation);
  console.log('选择的终点站:', endStation);
  
  // 显示起点站和终点站及其线路信息
  updateStationDisplay(startStation, endStation, 'start-station', 'end-station');
  
  // 确保起点站和终点站的线路信息显示
  const startStationElement = document.getElementById('start-station');
  const endStationElement = document.getElementById('end-station');
  if (startStationElement && endStationElement) {
    // 添加起点站和终点站标识
    const startLabel = document.createElement('div');
    startLabel.className = 'station-label start-label';
    startLabel.textContent = '起点站';
    startStationElement.insertBefore(startLabel, startStationElement.firstChild);
    
    const endLabel = document.createElement('div');
    endLabel.className = 'station-label end-label';
    endLabel.textContent = '终点站';
    endStationElement.insertBefore(endLabel, endStationElement.firstChild);
    
    startStationElement.classList.add('station-with-lines');
    endStationElement.classList.add('station-with-lines');
  }
  
  // 获取用户选择的挑战时间
  //const challengeTimeSelect = document.getElementById('challenge-time');
  if (challengeTimeSelect) {
    remainingTime = parseInt(challengeTimeSelect.value);
    console.log('用户选择的挑战时间:', remainingTime, '秒');
  }
  
  // 开始计时
  startTimer();
  
  // 发放地铁牌给玩家
  showLoadingState(true, '正在生成地铁牌...');
  try {
    // 获取用户选择的地铁牌数量
    const cardsCount = cardsCountSelect ? parseInt(cardsCountSelect.value) : 15;
    console.log('用户选择的地铁牌数量:', cardsCount);
    
    // 将起点站和终点站保存到全局变量
    window.startStation = startStation;
    window.endStation = endStation;
    
    // 确保window.metroData可用
    window.metroData = metroData;
    
    // 发放地铁牌给玩家 - 确保使用用户选择的数量
    playerHand = dealMetroCards(cardsCount);
    console.log('发放的地铁牌:', playerHand);
    
    // 验证发放的地铁牌数量
    if (playerHand.length !== cardsCount) {
      console.warn(`实际发放的地铁牌数量(${playerHand.length})与请求数量(${cardsCount})不一致`);
    }
    
    // 渲染玩家手牌
    renderPlayerHand(playerHand, 'player-hand', handleCardClick);
    
  } catch (error) {
    console.error('生成地铁牌时出错:', error);
  } finally {
    showLoadingState(false);
  }
}

/**
 * 开始计时器
 */
function startTimer() {
  const timerElement = document.getElementById('timer');
  
  // 清除之前的计时器
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // 设置新的计时器
  timerInterval = setInterval(() => {
    remainingTime--;
    
    if (timerElement) {
      timerElement.textContent = `时间: ${formatTime(remainingTime)}`;
    }
    
    if (remainingTime <= 0) {
      // 时间到，挑战结束
      clearInterval(timerInterval);
      endChallenge();
    }
  }, 1000);
}

/**
 * 处理卡牌点击事件
 * @param {string} stationName 站点名称
 */
function handleCardClick(stationName) {
  if (!gameStarted) return;
  
  console.log('点击卡牌:', stationName);
  
  // 检查是否已经在当前路径中
  if (currentPath.includes(stationName)) {
    console.log('站点已在路径中');
    return;
  }
  
  // 检查是否可以添加到路径中
  if (currentPath.length === 0) {
    // 第一张牌可以直接添加
    // 先添加起点站，再添加当前选择的站点（如果不是起点站）
    if (stationName !== startStation) {
      currentPath.push(startStation);
    }
    currentPath.push(stationName);
    selectedCards.push(stationName);
  } else {
    // 检查是否与路径中最后一个站点相连
    const lastStation = currentPath[currentPath.length - 1];
    const lastStationObj = metroData.stations.find(s => s.name === lastStation);
    const currentStationObj = metroData.stations.find(s => s.name === stationName);
    
    if (!lastStationObj || !currentStationObj) {
      console.log('找不到站点信息');
      return;
    }
    
    // 检查是否有共同线路
    let hasCommonLine = false;
    for (const line of lastStationObj.lines) {
      if (currentStationObj.lines.includes(line)) {
        hasCommonLine = true;
        break;
      }
    }
    
    if (!hasCommonLine) {
      console.log('站点不相连');
      alert('该站点与路径中最后一个站点不相连！');
      return;
    }
    
    // 添加到路径中
    currentPath.push(stationName);
    selectedCards.push(stationName);
  }
  
  // 更新路径显示
  updatePathDisplay(currentPath, 'current-path');
  
  // 更新卡牌选中状态
  updateCardSelection();
  
  // 检查是否到达终点或与终点站直接相连的站点
  const lastStation = currentPath[currentPath.length - 1];
  if (lastStation === endStation || areStationsConnected(lastStation, endStation)) {
    // 启用提交按钮
    const submitPathBtn = document.getElementById('submit-path-btn');
    if (submitPathBtn) submitPathBtn.disabled = false;
  }
}

/**
 * 更新卡牌选中状态
 */
function updateCardSelection() {
  const cardElements = document.querySelectorAll('#player-hand .metro-card');
  
  cardElements.forEach(card => {
    const stationName = card.getAttribute('data-station');
    if (selectedCards.includes(stationName)) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

/**
 * 重置当前路径
 */
function resetCurrentPath() {
  currentPath = [];
  selectedCards = [];
  
  // 更新路径显示
  updatePathDisplay([], 'current-path');
  
  // 更新卡牌选中状态
  updateCardSelection();
  
  // 禁用提交按钮
  const submitPathBtn = document.getElementById('submit-path-btn');
  if (submitPathBtn) submitPathBtn.disabled = true;
}

/**
 * 提交路径
 */
function submitPath() {
  if (currentPath.length < 2) return;
  
  console.log('提交路径:', currentPath);
  
  // 检查路径是否有效
  const isValid = validatePath();
  
  if (isValid) {
    // 检查是否是重复路线
    const isDuplicate = checkDuplicateRoute();
    
    if (!isDuplicate) {
      // 添加到已找到的路线中
      foundRoutes.push([...currentPath]);
      
      // 更新得分
      playerScore++;
      const scoreElement = document.getElementById('score');
      if (scoreElement) scoreElement.textContent = `得分: ${playerScore}`;
      
      // 更新已找到的路线显示
      updateFoundRoutesDisplay();
      
      // 显示成功提示
      showSuccessMessage();
    } else {
      // 显示重复路线提示
      alert('这条路线已经找到过了！');
    }
  } else {
    // 显示无效路线提示
    alert('无效的路线！请确保路径从起点站开始，到终点站结束，且每个站点之间相连。');
  }
  
  // 重置当前路径
  resetCurrentPath();
}

/**
 * 验证路径是否有效
 * @returns {boolean} 路径是否有效
 */
function validatePath() {
  // 检查路径是否为空
  if (currentPath.length < 2) return false;
  
  // 检查起点
  if (currentPath[0] !== startStation) return false;
  
  // 检查终点或终点前一站
  const lastStation = currentPath[currentPath.length - 1];
  if (lastStation !== endStation && !areStationsConnected(lastStation, endStation)) return false;
  
  // 检查路径中的每个站点是否相连
  for (let i = 0; i < currentPath.length - 1; i++) {
    if (!areStationsConnected(currentPath[i], currentPath[i + 1])) return false;
  }
  
  return true;
}

/**
 * 检查是否是重复路线
 * @returns {boolean} 是否是重复路线
 */
function checkDuplicateRoute() {
  // 如果没有找到过路线，肯定不是重复的
  if (foundRoutes.length === 0) return false;
  
  // 检查当前路径是否与已找到的路线重复
  for (const route of foundRoutes) {
    // 如果长度不同，肯定不是重复的
    if (route.length !== currentPath.length) continue;
    
    // 检查每个站点是否相同
    let isSame = true;
    for (let i = 0; i < route.length; i++) {
      if (route[i] !== currentPath[i]) {
        isSame = false;
        break;
      }
    }
    
    if (isSame) return true;
  }
  
  return false;
}

/**
 * 更新已找到的路线显示
 */
function updateFoundRoutesDisplay() {
  const foundRoutesElement = document.getElementById('found-routes');
  const foundRoutesCountElement = document.getElementById('found-routes-count');
  
  if (!foundRoutesElement || !foundRoutesCountElement) return;
  
  // 更新计数
  foundRoutesCountElement.textContent = foundRoutes.length;
  
  // 清空现有内容
  foundRoutesElement.innerHTML = '';
  
  // 添加每条路线
  foundRoutes.forEach((route, index) => {
    const routeItem = document.createElement('div');
    routeItem.className = 'route-item';
    
    // 创建路线标题
    const routeTitle = document.createElement('div');
    routeTitle.className = 'route-title';
    routeTitle.textContent = `路线 ${index + 1}:`;
    routeItem.appendChild(routeTitle);
    
    // 创建路线路径容器（优化后的紧凑显示）
    const routePath = document.createElement('div');
    routePath.className = 'route-path compact-route';
    
    // 添加路径中的每个站点，使用更紧凑的方式显示
    route.forEach((station, stationIndex) => {
      const stationElement = document.createElement('div');
      stationElement.className = 'path-station compact-station';
      
      // 站点名称
      const nameElement = document.createElement('span');
      nameElement.className = 'station-name';
      nameElement.textContent = station;
      stationElement.appendChild(nameElement);
      
      // 添加线路信息 - 使用更紧凑的布局
      const stationInfo = metroData.stations.find(s => s.name === station);
      if (stationInfo) {
        const lineInfo = document.createElement('div');
        lineInfo.className = 'station-lines compact-lines';
        
        // 限制显示的线路数量，如果线路太多，只显示前2个并添加+N标记
        const maxLinesToShow = 2;
        const linesToShow = stationInfo.lines.slice(0, maxLinesToShow);
        const remainingLines = stationInfo.lines.length - maxLinesToShow;
        
        linesToShow.forEach(lineId => {
          const lineSpan = document.createElement('span');
          const lineClass = typeof lineId === 'string' ? lineId : lineId.toString();
          lineSpan.className = `line-tag compact-line-tag line-${lineClass}`;
          
          // 获取线路名称 - 使用简短名称
          const lineData = metroData.lines.find(l => l.id === lineId);
          lineSpan.textContent = lineData ? lineData.shortname || lineData.name : `${lineId}`;
          
          lineInfo.appendChild(lineSpan);
        });
        
        // 如果有更多线路，添加+N标记
        if (remainingLines > 0) {
          const moreLines = document.createElement('span');
          moreLines.className = 'more-lines';
          moreLines.textContent = `+${remainingLines}`;
          lineInfo.appendChild(moreLines);
        }
        
        stationElement.appendChild(lineInfo);
        
        // 添加换乘站标记 - 使用更小的图标
        if (stationInfo.istransfer === 1) {
          stationElement.classList.add('transfer-station', 'compact-transfer');
        }
      }
      
      routePath.appendChild(stationElement);
      
      // 添加箭头（除了最后一个站点）- 使用更小的箭头
      if (stationIndex < route.length - 1) {
        const arrowElement = document.createElement('div');
        arrowElement.className = 'path-arrow compact-arrow';
        arrowElement.innerHTML = '→';
        routePath.appendChild(arrowElement);
      }
    });
    
    // 添加终点站（如果路径最后一个站点不是终点站）
    if (route[route.length - 1] !== endStation) {
      // 添加箭头
      const arrowElement = document.createElement('div');
      arrowElement.className = 'path-arrow compact-arrow';
      arrowElement.innerHTML = '→';
      routePath.appendChild(arrowElement);
      
      // 添加终点站
      const endStationElement = document.createElement('div');
      endStationElement.className = 'path-station end-station compact-station';
      
      // 终点站标记
      const endLabel = document.createElement('div');
      endLabel.className = 'mini-end-label';
      endLabel.textContent = '终';
      endStationElement.appendChild(endLabel);
      
      // 站点名称
      const nameElement = document.createElement('span');
      nameElement.className = 'station-name';
      nameElement.textContent = endStation;
      endStationElement.appendChild(nameElement);
      
      // 添加线路信息 - 使用更紧凑的布局
      const stationInfo = metroData.stations.find(s => s.name === endStation);
      if (stationInfo) {
        const lineInfo = document.createElement('div');
        lineInfo.className = 'station-lines compact-lines';
        
        // 限制显示的线路数量
        const maxLinesToShow = 2;
        const linesToShow = stationInfo.lines.slice(0, maxLinesToShow);
        const remainingLines = stationInfo.lines.length - maxLinesToShow;
        
        linesToShow.forEach(lineId => {
          const lineSpan = document.createElement('span');
          const lineClass = typeof lineId === 'string' ? lineId : lineId.toString();
          lineSpan.className = `line-tag compact-line-tag line-${lineClass}`;
          
          // 获取线路名称 - 使用简短名称
          const lineData = metroData.lines.find(l => l.id === lineId);
          lineSpan.textContent = lineData ? lineData.shortname || lineData.name : `${lineId}`;
          
          lineInfo.appendChild(lineSpan);
        });
        
        // 如果有更多线路，添加+N标记
        if (remainingLines > 0) {
          const moreLines = document.createElement('span');
          moreLines.className = 'more-lines';
          moreLines.textContent = `+${remainingLines}`;
          lineInfo.appendChild(moreLines);
        }
        
        endStationElement.appendChild(lineInfo);
        
        // 添加换乘站标记
        if (stationInfo.istransfer === 1) {
          endStationElement.classList.add('transfer-station', 'compact-transfer');
        }
      }
      
      routePath.appendChild(endStationElement);
    }
    
    routeItem.appendChild(routePath);
    foundRoutesElement.appendChild(routeItem);
  });
}

/**
 * 显示成功提示
 */
function showSuccessMessage() {
  const successMessage = document.createElement('div');
  successMessage.className = 'success-message';
  successMessage.textContent = '路线有效！得分+1';
  successMessage.style.position = 'fixed';
  successMessage.style.top = '50%';
  successMessage.style.left = '50%';
  successMessage.style.transform = 'translate(-50%, -50%)';
  successMessage.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
  successMessage.style.color = 'white';
  successMessage.style.padding = '15px 30px';
  successMessage.style.borderRadius = '5px';
  successMessage.style.zIndex = '1000';
  document.body.appendChild(successMessage);
  
  // 短暂延迟后移除提示
  setTimeout(() => {
    document.body.removeChild(successMessage);
  }, 1500);
}

/**
 * 结束挑战
 */
function endChallenge() {
  gameStarted = false;
  
  // 清除计时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // 显示结果
  const gameResultElement = document.getElementById('game-result');
  const finalScoreElement = document.getElementById('final-score');
  const resultRoutesElement = document.getElementById('result-routes');
  
  if (gameResultElement && finalScoreElement && resultRoutesElement) {
    // 显示最终得分
    finalScoreElement.textContent = playerScore;
    
    // 显示找到的所有路线
    resultRoutesElement.innerHTML = '';
    foundRoutes.forEach((route, index) => {
      const routeItem = document.createElement('div');
      routeItem.className = 'route-item';
      routeItem.textContent = `路线 ${index + 1}: ${route.join(' → ')}`;
      resultRoutesElement.appendChild(routeItem);
    });
    
    // 显示结果界面
    gameResultElement.style.display = 'block';
  }
}

/**
 * 重新挑战（使用相同的起点和终点）
 */
function retryChallenge() {
  // 隐藏结果界面
  const gameResultElement = document.getElementById('game-result');
  if (gameResultElement) gameResultElement.style.display = 'none';
  
  // 重置游戏状态
  playerScore = 0;
  currentPath = [];
  foundRoutes = [];
  selectedCards = [];
  
  // 更新分数显示
  const scoreElement = document.getElementById('score');
  if (scoreElement) scoreElement.textContent = `得分: ${playerScore}`;
  
  // 更新计时器显示
  const challengeTimeSelect = document.getElementById('challenge-time');
  remainingTime = challengeTimeSelect ? parseInt(challengeTimeSelect.value) : 300;
  const timerElement = document.getElementById('timer');
  if (timerElement) timerElement.textContent = `时间: ${formatTime(remainingTime)}`;
  
  // 更新路径显示
  updatePathDisplay([], 'current-path');
  
  // 更新已找到的路线显示
  updateFoundRoutesDisplay();
  
  // 重新发放地铁牌
  const cardsCountSelect = document.getElementById('cards-count');
  const cardsCount = cardsCountSelect ? parseInt(cardsCountSelect.value) : 20;
  playerHand = dealMetroCards(cardsCount);
  renderPlayerHand(playerHand, 'player-hand', handleCardClick);
  
  // 禁用提交按钮
  const submitPathBtn = document.getElementById('submit-path-btn');
  if (submitPathBtn) submitPathBtn.disabled = true;
  
  // 启用重置路径按钮
  const resetPathBtn = document.getElementById('reset-path-btn');
  if (resetPathBtn) resetPathBtn.disabled = false;
  
  // 开始计时
  gameStarted = true;
  startTimer();
}

/**
 * 新的挑战（随机生成新的起点和终点）
 */
function newChallenge() {
  // 隐藏结果界面
  const gameResultElement = document.getElementById('game-result');
  if (gameResultElement) gameResultElement.style.display = 'none';
  
  // 重置游戏状态
  playerScore = 0;
  currentPath = [];
  foundRoutes = [];
  selectedCards = [];
  
  // 更新分数显示
  const scoreElement = document.getElementById('score');
  if (scoreElement) scoreElement.textContent = `得分: ${playerScore}`;
  
  // 更新计时器显示
  const challengeTimeSelect = document.getElementById('challenge-time');
  remainingTime = challengeTimeSelect ? parseInt(challengeTimeSelect.value) : 300;
  const timerElement = document.getElementById('timer');
  if (timerElement) timerElement.textContent = `时间: ${formatTime(remainingTime)}`;
  
  // 随机选择新的起点站和终点站
  const stationNames = metroData.stations.map(station => station.name);
  startStation = stationNames[Math.floor(Math.random() * stationNames.length)];
  
  // 确保终点站与起点站不同
  do {
    endStation = stationNames[Math.floor(Math.random() * stationNames.length)];
  } while (endStation === startStation);
  
  // 更新全局变量
  window.startStation = startStation;
  window.endStation = endStation;
  
  // 显示起点站和终点站及其线路信息
  updateStationDisplay(startStation, endStation, 'start-station', 'end-station');
  
  // 确保起点站和终点站的线路信息显示
  const startStationElement = document.getElementById('start-station');
  const endStationElement = document.getElementById('end-station');
  if (startStationElement && endStationElement) {
    // 添加起点站和终点站标识
    const startLabel = document.createElement('div');
    startLabel.className = 'station-label start-label';
    startLabel.textContent = '起点站';
    startStationElement.insertBefore(startLabel, startStationElement.firstChild);
    
    const endLabel = document.createElement('div');
    endLabel.className = 'station-label end-label';
    endLabel.textContent = '终点站';
    endStationElement.insertBefore(endLabel, endStationElement.firstChild);
    
    startStationElement.classList.add('station-with-lines');
    endStationElement.classList.add('station-with-lines');
  }
  
  // 更新路径显示
  updatePathDisplay([], 'current-path');
  
  // 更新已找到的路线显示
  updateFoundRoutesDisplay();
  
  // 重新发放地铁牌
  const cardsCountSelect = document.getElementById('cards-count');
  const cardsCount = cardsCountSelect ? parseInt(cardsCountSelect.value) : 20;
  playerHand = dealMetroCards(cardsCount);
  renderPlayerHand(playerHand, 'player-hand', handleCardClick);
  
  // 禁用提交按钮
  const submitPathBtn = document.getElementById('submit-path-btn');
  if (submitPathBtn) submitPathBtn.disabled = true;
  
  // 启用重置路径按钮
  const resetPathBtn = document.getElementById('reset-path-btn');
  if (resetPathBtn) resetPathBtn.disabled = false;
  
  // 开始计时
  gameStarted = true;
  startTimer();
}

// 页面加载完成后初始化挑战模式
document.addEventListener('DOMContentLoaded', initChallengeMode);

// 导出函数供其他模块使用
export {
  initChallengeMode
};