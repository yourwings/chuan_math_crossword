// 单人漫游出题版模式实现

import { metroData, areStationsConnected } from './metro_data.js';
import { findPath } from './path_finder.js';
import {
  showLoadingState,
  dealMetroCards,
  renderPlayerHand,
  updateStationDisplay,
  updatePathDisplay,
  formatTime
} from './game_utils.js';

// 游戏状态变量
let playerHand = [];
let currentPath = [];
let playerScore = 0;
let remainingTime = 300; // 5分钟倒计时
let hintCount = 3; // 提示次数
let gameStarted = false;
let timerInterval = null;
let startStation = '';
let endStation = '';
let correctPath = null;

/**
 * 初始化单人漫游出题版模式
 */
function initSoloExplorationCreator() {
  console.log('初始化单人漫游出题版模式');
  
  // 获取UI元素
  const soloExplorationCreatorUI = document.getElementById('solo-exploration-creator-ui');
  const startStationElement = document.getElementById('creator-start-station');
  const endStationElement = document.getElementById('creator-end-station');
  const currentPathElement = document.getElementById('creator-current-path');
  const playerHandElement = document.getElementById('creator-player-hand');
  const nextBtn = document.getElementById('next-btn');
  const hintBtn = document.getElementById('hint-btn');
  const scoreElement = document.getElementById('score');
  const timerElement = document.getElementById('timer');
  const revertBtn = document.getElementById('revert-btn');
  
  // 检查UI元素是否存在
  if (!soloExplorationCreatorUI) {
    console.error('无法找到游戏UI元素');
    return;
  }
  
  // 显示单人漫游出题版UI
  soloExplorationCreatorUI.style.display = 'block';
  
  // 确保站点选择UI可见
  const stationSelectionUI = document.querySelector('.station-selection-ui');
  if (stationSelectionUI) {
    stationSelectionUI.style.display = 'block';
  }
  
  // 重置游戏状态
  playerHand = [];
  currentPath = [];
  playerScore = 0;
  remainingTime = 300; // 5分钟倒计时
  hintCount = 3; // 重置提示次数
  gameStarted = false; // 游戏尚未开始
  correctPath = null;
  startStation = '';
  endStation = '';
  
  // 更新分数显示
  if (scoreElement) scoreElement.textContent = playerScore;
  
  // 更新计时器显示
  if (timerElement) timerElement.textContent = `时间: ${formatTime(remainingTime)}`;
  
  // 更新提示按钮文本
  if (hintBtn) {
    hintBtn.textContent = `提示 (${hintCount})`;
    hintBtn.disabled = false;
  }
  
  // 清除之前的计时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // 添加还原按钮的点击事件
  if (revertBtn) {
    revertBtn.onclick = handlePathRevert;
  }
  
  // 初始化线路和站点选择界面
  initLineAndStationSelection();
  
  // 清空当前路径
  if (currentPathElement) currentPathElement.innerHTML = '';
  updatePathDisplay([], 'creator-current-path');
  
  // 启用下一题按钮
  if (nextBtn) {
    nextBtn.disabled = true; // 在选择站点前禁用
    nextBtn.textContent = '开始路线挑战';
    nextBtn.onclick = startGame;
  }
  
  console.log('单人漫游出题版模式初始化完成');
}

/**
 * 初始化线路和站点选择界面
 */
function initLineAndStationSelection() {
  console.log('初始化线路和站点选择界面');
  
  // 获取UI元素
  const startLineFilter = document.getElementById('start-line-filter');
  const endLineFilter = document.getElementById('end-line-filter');
  const startStationSelect = document.getElementById('start-station-select');
  const endStationSelect = document.getElementById('end-station-select');
  const confirmStationsBtn = document.getElementById('confirm-stations-btn');
  
  // 清空选择器
  if (startLineFilter) startLineFilter.innerHTML = '<option value="">-- 请选择线路 --</option>';
  if (endLineFilter) endLineFilter.innerHTML = '<option value="">-- 请选择线路 --</option>';
  if (startStationSelect) {
    startStationSelect.innerHTML = '<option value="">-- 请先选择线路 --</option>';
    startStationSelect.disabled = true;
  }
  if (endStationSelect) {
    endStationSelect.innerHTML = '<option value="">-- 请先选择线路 --</option>';
    endStationSelect.disabled = true;
  }
  if (confirmStationsBtn) confirmStationsBtn.disabled = true;
  
  // 填充线路选择下拉框
  if (startLineFilter && endLineFilter) {
    // 添加所有线路选项
    const allLinesOption = document.createElement('option');
    allLinesOption.value = 'all';
    allLinesOption.textContent = '所有线路';
    startLineFilter.appendChild(allLinesOption.cloneNode(true));
    endLineFilter.appendChild(allLinesOption.cloneNode(true));
    
    // 按线路名称排序
    const sortedLines = [...metroData.lines].sort((a, b) => {
      // 尝试将线路名称转换为数字进行比较
      const aNum = parseInt(a.name.replace(/[^0-9]/g, ''));
      const bNum = parseInt(b.name.replace(/[^0-9]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    
    sortedLines.forEach(line => {
      const startOption = document.createElement('option');
      startOption.value = line.id;
      startOption.textContent = line.name;
      startOption.style.color = line.color || '#000';
      startLineFilter.appendChild(startOption);
      
      const endOption = document.createElement('option');
      endOption.value = line.id;
      endOption.textContent = line.name;
      endOption.style.color = line.color || '#000';
      endLineFilter.appendChild(endOption);
    });
  }
  
  // 添加线路筛选事件
  if (startLineFilter) {
    startLineFilter.addEventListener('change', handleStartLineFilterChange);
  }
  
  if (endLineFilter) {
    endLineFilter.addEventListener('change', handleEndLineFilterChange);
  }
  
  // 添加站点选择事件
  if (startStationSelect) {
    startStationSelect.addEventListener('change', function() {
      console.log('起点站选择变更:', this.value);
      checkSelections();
    });
  }
  
  if (endStationSelect) {
    endStationSelect.addEventListener('change', function() {
      console.log('终点站选择变更:', this.value);
      checkSelections();
    });
  }
  
  // 添加确认按钮事件
  if (confirmStationsBtn) {
    confirmStationsBtn.addEventListener('click', handleConfirmStations);
  }
}

/**
 * 处理起点站线路筛选变更
 */
function handleStartLineFilterChange() {
  const lineId = this.value;
  const startStationSelect = document.getElementById('start-station-select');
  
  console.log('起点站线路筛选变更:', lineId);
  
  if (!startStationSelect) {
    console.error('无法找到起点站选择器元素');
    return;
  }
  
  // 清空站点选择器
  startStationSelect.innerHTML = '<option value="">-- 请选择站点 --</option>';
  
  // 如果未选择线路，禁用站点选择器
  if (!lineId) {
    startStationSelect.disabled = true;
    return;
  }
  
  // 启用站点选择器
  startStationSelect.disabled = false;
  
  // 获取该线路的所有站点
  let filteredStations = [];
  
  if (lineId === 'all') {
    // 所有线路的站点
    filteredStations = [...metroData.stations];
    console.log('获取所有站点，数量:', filteredStations.length);
  } else {
    // 特定线路的站点
    filteredStations = metroData.stations.filter(station => {
      // 确保station.lines是数组且包含lineId（字符串比较）
      return Array.isArray(station.lines) && station.lines.some(line => String(line) === String(lineId));
    });
    console.log(`获取线路 ${lineId} 的站点，数量:`, filteredStations.length);
  }
  
  // 按站点名称排序
  filteredStations.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  
  // 填充站点选择器
  filteredStations.forEach(station => {
    const option = document.createElement('option');
    option.value = station.name;
    option.textContent = station.name;
    
    // 如果是换乘站，添加标记
    if (station.istransfer === 1) {
      option.textContent += ' (换乘站)';
      option.style.fontWeight = 'bold';
    }
    
    startStationSelect.appendChild(option);
  });
  
  console.log('已更新起点站选择器，选项数量:', startStationSelect.options.length - 1);
  
  // 检查选择状态
  checkSelections();
}

/**
 * 处理终点站线路筛选变更
 */
function handleEndLineFilterChange() {
  const lineId = this.value;
  const endStationSelect = document.getElementById('end-station-select');
  
  console.log('终点站线路筛选变更:', lineId);
  
  if (!endStationSelect) {
    console.error('无法找到终点站选择器元素');
    return;
  }
  
  // 清空站点选择器
  endStationSelect.innerHTML = '<option value="">-- 请选择站点 --</option>';
  
  // 如果未选择线路，禁用站点选择器
  if (!lineId) {
    endStationSelect.disabled = true;
    return;
  }
  
  // 启用站点选择器
  endStationSelect.disabled = false;
  
  // 获取该线路的所有站点
  let filteredStations = [];
  
  if (lineId === 'all') {
    // 所有线路的站点
    filteredStations = [...metroData.stations];
    console.log('获取所有站点，数量:', filteredStations.length);
  } else {
    // 特定线路的站点
    filteredStations = metroData.stations.filter(station => {
      // 确保station.lines是数组且包含lineId（字符串比较）
      return Array.isArray(station.lines) && station.lines.some(line => String(line) === String(lineId));
    });
    console.log(`获取线路 ${lineId} 的站点，数量:`, filteredStations.length);
  }
  
  // 按站点名称排序
  filteredStations.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  
  // 填充站点选择器
  filteredStations.forEach(station => {
    const option = document.createElement('option');
    option.value = station.name;
    option.textContent = station.name;
    
    // 如果是换乘站，添加标记
    if (station.istransfer === 1) {
      option.textContent += ' (换乘站)';
      option.style.fontWeight = 'bold';
    }
    
    endStationSelect.appendChild(option);
  });
  
  console.log('已更新终点站选择器，选项数量:', endStationSelect.options.length - 1);
  
  // 检查选择状态
  checkSelections();
}

/**
 * 检查站点选择状态
 */
function checkSelections() {
  const startStationSelect = document.getElementById('start-station-select');
  const endStationSelect = document.getElementById('end-station-select');
  const confirmStationsBtn = document.getElementById('confirm-stations-btn');
  
  if (!startStationSelect || !endStationSelect || !confirmStationsBtn) return;
  
  const startStation = startStationSelect.value;
  const endStation = endStationSelect.value;
  
  // 只有当起点站和终点站都已选择且不相同时，才启用确认按钮
  confirmStationsBtn.disabled = !startStation || !endStation || startStation === endStation;
  
  if (startStation && endStation && startStation === endStation) {
    alert('起点站和终点站不能相同，请重新选择！');
  }
}

/**
 * 处理确认站点选择
 */
function handleConfirmStations() {
  const startStationSelect = document.getElementById('start-station-select');
  const endStationSelect = document.getElementById('end-station-select');
  
  if (!startStationSelect || !endStationSelect) {
    console.error('无法找到站点选择器元素');
    return;
  }
  
  const selectedStartStation = startStationSelect.value;
  const selectedEndStation = endStationSelect.value;
  
  console.log('确认按钮被点击，起点站:', selectedStartStation, '终点站:', selectedEndStation);
  
  if (selectedStartStation && selectedEndStation && selectedStartStation !== selectedEndStation) {
    // 设置起点站和终点站
    startStation = selectedStartStation;
    endStation = selectedEndStation;
    
    console.log('设置起点站和终点站成功:', startStation, endStation);
    
    // 更新显示，包括线路信息
    updateStationDisplay(startStation, endStation, 'creator-start-station', 'creator-end-station');
    
    // 确保线路信息显示在正确的容器中
    if (window.metroData && window.metroData.stations) {
      const startStationInfo = window.metroData.stations.find(s => s.name === startStation);
      const endStationInfo = window.metroData.stations.find(s => s.name === endStation);
      
      // 显示起点站线路信息
      if (startStationInfo) {
        const startLinesContainer = document.getElementById('creator-start-station-lines');
        if (startLinesContainer) {
          startLinesContainer.innerHTML = '';
          
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
            
            startLinesContainer.appendChild(lineSpan);
          });
        }
      }
      
      // 显示终点站线路信息
      if (endStationInfo) {
        const endLinesContainer = document.getElementById('creator-end-station-lines');
        if (endLinesContainer) {
          endLinesContainer.innerHTML = '';
          
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
            
            endLinesContainer.appendChild(lineSpan);
          });
        }
      }
    }
    
    // 隐藏选择界面
    const stationSelectionUI = document.querySelector('.station-selection-ui');
    if (stationSelectionUI) {
      stationSelectionUI.style.display = 'none';
    }
    
    // 启用开始按钮
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = '开始路线挑战';
      nextBtn.onclick = startGame; // 确保点击按钮会调用startGame函数
    }
    
    // 显示成功消息
    alert(`已选择从${startStation}到${endStation}的路线，点击"开始路线挑战"按钮开始！`);
  } else {
    console.error('站点选择无效');
    alert('请确保已选择有效的起点站和终点站，且两者不相同！');
  }
}

async function startGame() {
  if (gameStarted || !startStation || !endStation) return;
  
  // 检查地铁数据是否已正确加载
  if (!metroData || !metroData.stations || !metroData.lines || metroData.stations.length === 0) {
    console.error('地铁数据未正确加载，无法显示线路信息');
    alert('地铁数据未正确加载，无法显示线路信息');
    gameStarted = false;
    return;
  }
  
  // 检查起点站和终点站是否存在于地铁数据中
  const startStationObj = metroData.stations.find(s => s.name === startStation);
  const endStationObj = metroData.stations.find(s => s.name === endStation);
  
  if (!startStationObj || !endStationObj) {
    console.error('无法找到起点站或终点站信息');
    alert('无法找到起点站或终点站信息，请重新选择');
    gameStarted = false;
    return;
  }
  
  gameStarted = true;
  console.log('游戏开始');
  
  // 更新按钮文本
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.textContent = '验证';
    nextBtn.onclick = checkAnswer;
  }
  
  // 开始计时
  startTimer();
  
  // 生成正确路径
  showLoadingState(true, '正在生成路线...');
  try {
    // 根据难度调整路径长度
    const difficultySelect = document.getElementById('difficulty');
    const difficulty = difficultySelect ? difficultySelect.value : 'medium';
    
    let minLength = 3;
    let maxLength = 8;
    
    switch (difficulty) {
      case 'easy':
        minLength = 2;
        maxLength = 6;
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
    
    // 确保window.metroData也可用，因为findPath可能会使用它
    window.metroData = metroData;
    
    correctPath = await findPath(startStation, endStation, maxLength, minLength, true);
    console.log('生成的正确路径:', correctPath);
    
    if (!correctPath) {
      // 如果找不到合适的路径，提示用户重新选择
      console.log('找不到合适的路径，请重新选择起点和终点');
      alert('无法找到合适的路径，请重新选择起点和终点！');
      gameStarted = false;
      initSoloExplorationCreator();
      return;
    }
    
    // 发放地铁牌给玩家，确保包含路径上的站点
    dealOptimizedMetroCards();
    
    // 确保玩家手牌区域是可见的
    const playerHandElement = document.getElementById('creator-player-hand');
    if (playerHandElement) {
      playerHandElement.style.display = 'flex';
      // 渲染玩家手牌
      renderPlayerHand(playerHand, 'creator-player-hand', handleCardClick);
    } else {
      console.error('无法找到玩家手牌容器元素: creator-player-hand');
    }
  } catch (error) {
    console.error('生成路径时出错:', error);
  } finally {
    showLoadingState(false);
  }
}

/**
 * 优化地铁牌发放，确保包含路径上的站点
 */
function dealOptimizedMetroCards() {
  // 检查地铁数据是否已正确加载
  if (!metroData || !metroData.stations || metroData.stations.length === 0) {
    console.error('地铁数据未正确加载，无法发放地铁牌');
    return [];
  }
  
  // 出题版模式给15张牌
  const totalCards = 15;
  playerHand = [];
  
  // 创建已使用站点集合，避免重复
  const usedStations = new Set([startStation, endStation]);
  
  // 确保正确路径中的关键站点被包含在手牌中
  if (correctPath && correctPath.length > 0) {
    console.log('使用预先生成的正确路径:', correctPath);
    
    // 添加路径中的站点到手牌中（除了起点和终点）
    for (const station of correctPath) {
      if (!usedStations.has(station)) {
        playerHand.push(station);
        usedStations.add(station);
      }
    }
    
    console.log('从正确路径添加的站点数量:', playerHand.length);
  }
  
  // 如果手牌数量不足，添加一些随机站点
  if (playerHand.length < totalCards) {
    const remainingCount = totalCards - playerHand.length;
    const stationNames = metroData.stations.map(station => station.name);
    
    // 过滤掉已使用的站点
    const availableStations = stationNames.filter(station => !usedStations.has(station));
    
    // 随机选择剩余的站点
    for (let i = 0; i < remainingCount && availableStations.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableStations.length);
      const station = availableStations.splice(randomIndex, 1)[0];
      playerHand.push(station);
    }
    
    console.log('添加的随机站点数量:', remainingCount);
  }
  
  // 随机打乱手牌顺序
  for (let i = playerHand.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playerHand[i], playerHand[j]] = [playerHand[j], playerHand[i]];
  }
  
  console.log('最终发放的地铁牌:', playerHand);
  return playerHand;
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
      // 时间到，游戏结束
      clearInterval(timerInterval);
      endGame(false);
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
  
  // 检查是否已经在路径中
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
    
    // 从玩家手牌中移除选择的卡牌
    const cardIndex = playerHand.indexOf(stationName);
    if (cardIndex !== -1) {
      playerHand.splice(cardIndex, 1);
      // 重新渲染玩家手牌
      renderPlayerHand(playerHand, 'creator-player-hand', handleCardClick);
    }
  }
  
  // 更新路径显示
  updatePathDisplay(currentPath, 'creator-current-path');
  
  // 检查是否到达终点或与终点站直接相连的站点
  if (stationName === endStation || areStationsConnected(stationName, endStation)) {
    checkAnswer();
  }
}

/**
 * 处理路径还原
 */
function handlePathRevert() {
  if (!gameStarted || currentPath.length === 0) return;
  
  console.log('还原最后一个站点');
  
  // 获取最后一个站点
  const lastStation = currentPath.pop();
  
  // 如果不是起点站，将其放回玩家手牌
  if (lastStation !== startStation) {
    playerHand.push(lastStation);
    // 重新渲染玩家手牌
    renderPlayerHand(playerHand, 'creator-player-hand', handleCardClick);
  }
  
  // 如果当前路径为空且起点站已被移除，重新添加起点站
  if (currentPath.length === 0 && lastStation === startStation) {
    // 不做任何操作，因为下一次添加卡牌时会自动添加起点站
  }
  
  // 更新路径显示
  updatePathDisplay(currentPath, 'creator-current-path');
}

/**
 * 检查答案
 */
function checkAnswer() {
  if (!correctPath) return;
  
  console.log('检查答案');
  console.log('玩家路径:', currentPath);
  console.log('正确路径:', correctPath);
  
  // 检查是否到达终点或终点前一站
  const lastStation = currentPath[currentPath.length - 1];
  const isAtEndStation = lastStation === endStation;
  
  // 如果不是终点站，检查是否是终点站的前一站且与终点站直接相连
  if (!isAtEndStation) {
    const isConnectedToEnd = areStationsConnected(lastStation, endStation);
    
    if (!isConnectedToEnd) {
      console.log('未到达终点站，且最后一站与终点站不相连');
      return;
    }
    
    console.log('玩家到达了终点站的前一站，且与终点站直接相连');
    // 继续执行，视为有效路径
  }
  
  // 检查路径是否有效
  // 确保玩家路径的第一个站点是起点站
  if (currentPath[0] !== startStation) {
    console.log('路径不是从起点站开始');
    alert('路径必须从起点站开始！');
    return;
  }
  
  // 确保玩家路径的最后一个站点是终点站或与终点站直接相连的前一站
  if (lastStation !== endStation) {
    const isConnectedToEnd = areStationsConnected(lastStation, endStation);
    
    if (!isConnectedToEnd) {
      console.log('路径不是在终点站或与终点站直接相连的站点结束');
      return;
    }
    
    console.log('路径在终点站的前一站结束，且该站与终点站直接相连');
    // 视为有效路径
  }
  
  // 如果玩家路径的最后一个站点与终点站直接相连，则视为有效路径
  // 不需要严格比较路径是否完全一致
  if (lastStation !== endStation && areStationsConnected(lastStation, endStation)) {
    console.log('玩家选择了与终点站直接相连的站点，视为有效路径');
    // 增加分数
    playerScore += 10;
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.textContent = playerScore;
    
    // 显示成功提示
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = '路径有效！即将重新开始...';
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
    
    // 短暂延迟后自动重新开始
    setTimeout(() => {
      document.body.removeChild(successMessage);
      // 重置游戏
      initSoloExplorationCreator();
    }, 1500);
    
    return;
  }
  
  if (isCorrect) {
    // 答案正确
    console.log('答案正确');
    alert('恭喜，答案正确！');
    
    // 增加分数
    playerScore += 10;
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.textContent = playerScore;
    
    // 进入下一题
    nextQuestion();
  } else {
    // 答案错误
    console.log('答案错误');
    alert('答案错误，请重试！');
  }
}

/**
 * 下一题
 */
function nextQuestion() {
  // 重置游戏状态
  currentPath = [];
  correctPath = null;
  gameStarted = false;
  playerHand = []; // 清空玩家手牌
  
  // 清空当前路径
  updatePathDisplay([], 'creator-current-path');
  
  // 清空玩家手牌区域
  const playerHandElement = document.getElementById('creator-player-hand');
  if (playerHandElement) {
    playerHandElement.innerHTML = '';
  }
  
  // 重新初始化线路和站点选择界面
  initLineAndStationSelection();
  
  // 更新按钮
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.textContent = '开始游戏';
    nextBtn.onclick = startGame;
  }
}

/**
 * 使用提示
 */
function useHint() {
  if (hintCount <= 0 || !correctPath) return;
  
  console.log('使用提示');
  
  // 减少提示次数
  hintCount--;
  
  // 更新提示按钮文本
  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) {
    hintBtn.textContent = `提示 (${hintCount})`;
    if (hintCount <= 0) {
      hintBtn.disabled = true;
    }
  }
  
  // 显示提示
  if (correctPath.length > 0) {
    const hintIndex = Math.floor(Math.random() * correctPath.length);
    const hintStation = correctPath[hintIndex];
    
    // 在界面上显示提示，而不是使用弹窗
    const gameInfoElement = document.querySelector('.game-info');
    
    // 检查是否已存在提示元素
    let hintElement = document.getElementById('hint-message');
    
    if (!hintElement) {
      // 创建提示元素
      hintElement = document.createElement('div');
      hintElement.id = 'hint-message';
      hintElement.style.color = '#e74c3c';
      hintElement.style.fontWeight = 'bold';
      hintElement.style.marginLeft = '15px';
      gameInfoElement.appendChild(hintElement);
    }
    
    // 更新提示内容
    hintElement.textContent = `提示：路径中包含站点「${hintStation}」`;
    
    // 5秒后淡出提示
    setTimeout(() => {
      hintElement.style.opacity = '0.7';
    }, 5000);
  }
}

/**
 * 结束游戏
 * @param {boolean} isWin 是否胜利
 */
function endGame(isWin) {
  gameStarted = false;
  
  // 清除计时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // 创建结算信息元素
  const resultElement = document.createElement('div');
  resultElement.className = 'game-result';
  resultElement.style.position = 'fixed';
  resultElement.style.top = '50%';
  resultElement.style.left = '50%';
  resultElement.style.transform = 'translate(-50%, -50%)';
  resultElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
  resultElement.style.padding = '20px 30px';
  resultElement.style.borderRadius = '10px';
  resultElement.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  resultElement.style.zIndex = '1000';
  resultElement.style.textAlign = 'center';
  resultElement.style.minWidth = '300px';
  
  // 设置结算信息内容
  let resultTitle = document.createElement('h2');
  resultTitle.style.marginBottom = '15px';
  resultTitle.style.color = isWin ? '#27ae60' : '#e74c3c';
  resultTitle.textContent = isWin ? '游戏胜利！' : '游戏结束';
  resultElement.appendChild(resultTitle);
  
  // 计算成功题目数量（每10分对应一道题）
  const completedQuestions = Math.floor(playerScore / 10);
  
  let scoreInfo = document.createElement('p');
  scoreInfo.style.fontSize = '18px';
  scoreInfo.style.marginBottom = '20px';
  scoreInfo.innerHTML = `成功完成题目：<strong>${completedQuestions}</strong> 道`;
  resultElement.appendChild(scoreInfo);
  
  let restartButton = document.createElement('button');
  restartButton.textContent = '重新开始';
  restartButton.style.padding = '8px 20px';
  restartButton.style.backgroundColor = '#3498db';
  restartButton.style.color = 'white';
  restartButton.style.border = 'none';
  restartButton.style.borderRadius = '5px';
  restartButton.style.cursor = 'pointer';
  restartButton.onclick = function() {
    document.body.removeChild(resultElement);
    initSoloExplorationCreator();
  };
  resultElement.appendChild(restartButton);
  
  // 添加到页面
  document.body.appendChild(resultElement);
}

// 导出模块
export { initSoloExplorationCreator, useHint as useCreatorHint, startGame };