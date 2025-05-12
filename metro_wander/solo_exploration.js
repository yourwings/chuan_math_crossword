// 单人漫游模式实现

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
 * 初始化单人漫游模式
 */
function initSoloExploration() {
  console.log('初始化单人漫游模式');
  
  // 获取UI元素
  const soloExplorationUI = document.getElementById('solo-exploration-ui');
  const startStationElement = document.getElementById('start-station');
  const endStationElement = document.getElementById('end-station');
  const currentPathElement = document.getElementById('current-path');
  const playerHandElement = document.getElementById('player-hand');
  const nextBtn = document.getElementById('next-btn');
  const hintBtn = document.getElementById('hint-btn');
  const scoreElement = document.getElementById('score');
  const timerElement = document.getElementById('timer');
  const revertBtn = document.getElementById('revert-btn');
  
  // 检查UI元素是否存在
  if (!soloExplorationUI) {
    console.error('无法找到游戏UI元素');
    return;
  }
  
  // 添加还原按钮的点击事件
  if (revertBtn) {
    revertBtn.onclick = handlePathRevert;
  }
  
  // 显示单人漫游UI
  soloExplorationUI.style.display = 'block';
  
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
  
  // 确保玩家手牌区域是可见的
  if (playerHandElement) {
    playerHandElement.style.display = 'flex';
  }
  
  // 清空当前路径
  if (currentPathElement) currentPathElement.innerHTML = '';
  updatePathDisplay([], 'current-path');
  
  // 启用下一题按钮
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.textContent = '开始游戏';
    nextBtn.onclick = startGame;
  }
  
  console.log('单人漫游模式初始化完成');
}

/**
 * 开始游戏
 */
async function startGame() {
  if (gameStarted) return;
  
  gameStarted = true;
  console.log('游戏开始');
  
  // 更新按钮文本
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.textContent = '下一题';
    nextBtn.onclick = nextQuestion;
  }
  
  // 获取当前选择的难度
  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect ? difficultySelect.value : 'easy';
  
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
  
  // 开始计时
  startTimer();
  
  // 生成正确路径
  showLoadingState(true, '正在生成路线...');
  try {
    // 根据难度调整路径长度
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
    
    correctPath = await findPath(startStation, endStation, maxLength, minLength, false);
    console.log('生成的正确路径:', correctPath);
    
    if (!correctPath) {
      // 如果找不到合适的路径，重新生成起点和终点
      console.log('找不到合适的路径，重新生成起点和终点');
      initSoloExploration();
      return;
    }
    
    // 将起点站、终点站和正确路径保存到全局变量，以便dealMetroCards函数使用
    window.startStation = startStation;
    window.endStation = endStation;
    window.correctPath = correctPath;
    
    // 发放地铁牌给玩家（随机选择合理数量的牌）
    playerHand = dealMetroCards(10); // 限制为最多10张牌
    console.log('发放的地铁牌:', playerHand);
    
    // 渲染玩家手牌
    renderPlayerHand(playerHand, 'player-hand', handleCardClick);
    
  } catch (error) {
    console.error('生成路径时出错:', error);
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
    // 第一张牌需要检查与起点站的连通性
    if (stationName === startStation) {
      // 如果选择的就是起点站，直接添加
      currentPath.push(stationName);
    } else {
      // 检查选择的站点是否与起点站相连
      if (!areStationsConnected(startStation, stationName)) {
        console.log('首个站点与起点站不相连');
        alert('该站点与起点站不相连！');
        return;
      }
      // 先添加起点站，再添加当前选择的站点
      currentPath.push(startStation);
      currentPath.push(stationName);
    }
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
  }
  
  // 从玩家手牌中移除选择的卡牌
  const cardIndex = playerHand.indexOf(stationName);
  if (cardIndex !== -1) {
    playerHand.splice(cardIndex, 1);
    // 重新渲染玩家手牌
    renderPlayerHand(playerHand, 'player-hand', handleCardClick);
  }
  
  // 更新路径显示
  updatePathDisplay(currentPath, 'current-path');
  
  // 检查是否到达终点或与终点站直接相连的站点
  if (stationName === endStation || areStationsConnected(stationName, endStation)) {
    checkAnswer();
  }
}

/**
 * 检查答案
 */
async function checkAnswer() {
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
    successMessage.textContent = '路径有效！即将进入下一题...';
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
    
    // 短暂延迟后自动进入下一题
    setTimeout(() => {
      document.body.removeChild(successMessage);
      // 进入下一题
      nextQuestion();
    }, 1500);
    
    return;
  }
  
  // 检查路径中的站点是否正确
  let isCorrect = true;
  
  // 创建一个临时数组，用于比较
  let pathToCompare = [...correctPath];
  
  // 如果正确路径不包含起点站，则在开头添加起点站
  if (pathToCompare[0] !== startStation) {
    pathToCompare.unshift(startStation);
  }
  
  // 比较两个路径是否相同
  if (currentPath.length !== pathToCompare.length) {
    isCorrect = false;
    console.log('路径长度不匹配');
    console.log('期望长度:', pathToCompare.length, '实际长度:', currentPath.length);
  } else {
    for (let i = 0; i < pathToCompare.length; i++) {
      if (currentPath[i] !== pathToCompare[i]) {
        isCorrect = false;
        console.log('路径不匹配，索引:', i, '期望:', pathToCompare[i], '实际:', currentPath[i]);
        break;
      }
    }
  }
  
  if (isCorrect) {
    // 答案正确
    console.log('答案正确');
    
    // 增加分数
    playerScore += 10;
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.textContent = playerScore;
    
    // 显示简短的成功提示
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = '路径正确！即将进入下一题...';
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
    
    // 短暂延迟后自动进入下一题
    setTimeout(() => {
      document.body.removeChild(successMessage);
      // 进入下一题
      nextQuestion();
    }, 1500);
  } else {
    // 答案错误
    console.log('答案错误');
    
    // 显示错误提示，但不使用alert阻塞界面
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = '路径错误，请重试！';
    errorMessage.style.position = 'fixed';
    errorMessage.style.top = '50%';
    errorMessage.style.left = '50%';
    errorMessage.style.transform = 'translate(-50%, -50%)';
    errorMessage.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
    errorMessage.style.color = 'white';
    errorMessage.style.padding = '15px 30px';
    errorMessage.style.borderRadius = '5px';
    errorMessage.style.zIndex = '1000';
    document.body.appendChild(errorMessage);
    
    // 短暂显示后自动消失
    setTimeout(() => {
      document.body.removeChild(errorMessage);
    }, 1500);
  }
}

/**
 * 下一题
 */
function nextQuestion() {
  // 重置游戏状态
  currentPath = [];
  correctPath = null;
  
  // 随机选择新的起点站和终点站
  const stationNames = metroData.stations.map(station => station.name);
  startStation = stationNames[Math.floor(Math.random() * stationNames.length)];
  
  // 确保终点站与起点站不同
  do {
    endStation = stationNames[Math.floor(Math.random() * stationNames.length)];
  } while (endStation === startStation);
  
  console.log('新的起点站:', startStation);
  console.log('新的终点站:', endStation);
  
  // 更新站点显示
  updateStationDisplay(startStation, endStation, 'start-station', 'end-station');
  
  // 清空当前路径
  updatePathDisplay([], 'current-path');
  
  // 生成新的正确路径
  generateCorrectPath();
}

/**
 * 生成正确路径
 */
async function generateCorrectPath() {
  showLoadingState(true, '正在生成路线...');
  try {
    // 根据难度调整路径长度
    const difficultySelect = document.getElementById('difficulty');
    const difficulty = difficultySelect ? difficultySelect.value : 'easy';
    
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
    
    correctPath = await findPath(startStation, endStation, maxLength, minLength, false);
    console.log('生成的新正确路径:', correctPath);
    
    if (!correctPath) {
      // 如果找不到合适的路径，重新生成起点和终点
      console.log('找不到合适的路径，重新生成起点和终点');
      nextQuestion();
      return;
    }
    
    // 更新全局变量，确保dealMetroCards函数能够访问
    window.startStation = startStation;
    window.endStation = endStation;
    window.correctPath = correctPath;
    
    // 发放新的地铁牌给玩家
    playerHand = dealMetroCards(10);
    console.log('发放的新地铁牌:', playerHand);
    
    // 渲染玩家手牌
    renderPlayerHand(playerHand, 'player-hand', handleCardClick);
  } catch (error) {
    console.error('生成路径时出错:', error);
  } finally {
    showLoadingState(false);
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
    
    alert(`提示：路径中包含站点「${hintStation}」`);
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
  
  let scoreInfo = document.createElement('p');
  scoreInfo.style.fontSize = '18px';
  scoreInfo.style.marginBottom = '20px';
  scoreInfo.innerHTML = `最终得分：<strong>${playerScore}</strong>`;
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
    initSoloExploration();
  };
  resultElement.appendChild(restartButton);
  
  // 添加到页面
  document.body.appendChild(resultElement);
}

/**
 * 处理路径还原，将最后一个站点从路径中移除并返回到玩家手牌
 */
function handlePathRevert() {
  if (!gameStarted || currentPath.length <= 1) return;
  
  console.log('还原路径');
  
  // 获取最后一个站点
  const lastStation = currentPath.pop();
  console.log('从路径中移除站点:', lastStation);
  
  // 如果最后一个站点是起点站，不需要添加到手牌中
  if (lastStation !== startStation) {
    // 将站点添加回玩家手牌
    playerHand.push(lastStation);
    console.log('将站点添加回手牌:', lastStation);
    
    // 重新渲染玩家手牌
    renderPlayerHand(playerHand, 'player-hand', handleCardClick);
  }
  
  // 更新路径显示
  updatePathDisplay(currentPath, 'current-path');
}

// 导出模块
export { initSoloExploration, useHint, startGame, nextQuestion, handlePathRevert };