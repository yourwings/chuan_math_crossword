// 北京地铁漫游游戏 - 主入口文件

// 导入模块
import { metroData } from './metro_data.js';
import { initSoloExploration, useHint, startGame as startSoloGame, nextQuestion } from './solo_exploration.js';
import { initSoloExplorationCreator, useCreatorHint, startGame as startCreatorGame } from './solo_exploration_creator.js';
import { initChallengeMode } from './challenge_mode.js';
import { displayDebugInfo } from './debug-info.js';

// 将关键函数暴露给全局，以便在HTML中直接调用
// 注意：不同模式下的startGame函数需要区分处理
window.nextQuestion = nextQuestion;

// 将地铁数据暴露给全局，以便在游戏工具函数中使用
window.metroData = metroData;

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  console.log('页面加载完成，初始化游戏');
  
  // 获取游戏模式选择器
  const gameModeSelect = document.getElementById('game-mode');
  
  // 初始化默认游戏模式
  initGameMode(gameModeSelect ? gameModeSelect.value : 'solo-exploration');
  
  // 监听游戏模式变化
  if (gameModeSelect) {
    gameModeSelect.addEventListener('change', (event) => {
      initGameMode(event.target.value);
    });
  }
  
  // 绑定提示按钮事件
  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      const gameMode = gameModeSelect ? gameModeSelect.value : 'solo-exploration';
      if (gameMode === 'solo-exploration') {
        useHint();
      } else if (gameMode === 'solo-exploration-creator') {
        useCreatorHint();
      }
    });
  }
  
  // 绑定调试按钮事件
  const debugBtn = document.getElementById('debug-btn');
  const debugPanel = document.getElementById('debug-panel');
  if (debugBtn && debugPanel) {
    let isDebugMode = false;
    
    // 重写console.log方法，将输出同时显示在调试面板中
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // 重写所有控制台输出方法
    console.log = function() {
      // 调用原始的console.log
      originalConsoleLog.apply(console, arguments);
      // 添加到调试面板
      if (isDebugMode) addToDebugPanel(arguments, 'log');
    };
    
    console.error = function() {
      // 调用原始的console.error
      originalConsoleError.apply(console, arguments);
      // 添加到调试面板（红色显示）
      if (isDebugMode) addToDebugPanel(arguments, 'error');
    };
    
    console.warn = function() {
      // 调用原始的console.warn
      originalConsoleWarn.apply(console, arguments);
      // 添加到调试面板（黄色显示）
      if (isDebugMode) addToDebugPanel(arguments, 'warn');
    };
    
    // 辅助函数：添加消息到调试面板
    function addToDebugPanel(args, type) {
      if (!debugPanel) return;
      
      const pre = debugPanel.querySelector('pre');
      if (!pre) return;
      
      const timestamp = new Date().toLocaleTimeString();
      const args_array = Array.from(args);
      const message = args_array.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      // 根据消息类型设置不同的样式
      let coloredMessage = '';
      switch (type) {
        case 'error':
          coloredMessage = `<span style="color: #ff5252;">[${timestamp}] [错误] ${message}</span>`;
          break;
        case 'warn':
          coloredMessage = `<span style="color: #ffab40;">[${timestamp}] [警告] ${message}</span>`;
          break;
        default:
          coloredMessage = `<span style="color: #00ff00;">[${timestamp}] [信息] ${message}</span>`;
      }
      
      pre.innerHTML += coloredMessage + '\n';
      // 自动滚动到底部
      pre.scrollTop = pre.scrollHeight;
    }
    
    debugBtn.addEventListener('click', () => {
      isDebugMode = !isDebugMode;
      debugPanel.style.display = isDebugMode ? 'block' : 'none';
      debugBtn.textContent = isDebugMode ? '关闭调试' : '调试';
      console.log('调试按钮被点击，当前状态:', isDebugMode ? '开启' : '关闭');
      
      if (isDebugMode) {
        // 清空调试面板
        const pre = debugPanel.querySelector('pre');
        if (pre) pre.innerHTML = '';
        
        // 输出当前游戏状态信息
        console.log('调试模式已开启');
        console.log('当前游戏模式:', gameModeSelect ? gameModeSelect.value : 'solo-exploration');
        console.log('当前难度级别:', document.getElementById('difficulty') ? document.getElementById('difficulty').value : 'easy');
        
        // 输出当前路径和手牌信息
        try {
          const currentPathElement = document.querySelector('.path-horizontal');
          if (currentPathElement) {
            const stations = Array.from(currentPathElement.querySelectorAll('.path-station .station-name'))
              .map(el => el.textContent);
            console.log('当前路径:', stations);
          }
          
          const playerHandElement = document.querySelector('.cards-container');
          if (playerHandElement) {
            const cards = Array.from(playerHandElement.querySelectorAll('.metro-card'))
              .map(el => el.textContent.split('\n')[0].trim());
            console.log('玩家手牌:', cards);
          }
        } catch (e) {
          console.error('获取游戏状态时出错:', e);
        }
        
        // 显示结构化的调试信息
        displayDebugInfo();
      } else {
        console.log('调试模式已关闭');
        
        // 移除调试信息容器
        const debugInfoContainer = document.getElementById('debug-info-container');
        if (debugInfoContainer) {
          debugInfoContainer.style.display = 'none';
        }
      }
    });
  }
});

/**
 * 根据选择的游戏模式初始化游戏
 * @param {string} gameMode 游戏模式
 */
function initGameMode(gameMode) {
  console.log('初始化游戏模式:', gameMode);
  
  // 隐藏所有游戏模式UI
  hideAllGameModeUI();
  
  // 根据选择的游戏模式初始化
  switch (gameMode) {
    case 'solo-exploration':
      initSoloExploration();
      // 设置正确的startGame函数
      window.startGame = startSoloGame;
      break;
    case 'solo-exploration-creator':
      initSoloExplorationCreator();
      // 设置正确的startGame函数
      window.startGame = startCreatorGame;
      break;
    case 'challenge-mode':
      // 跳转到挑战模式页面
      window.location.href = 'challenge_mode.html';
      break;
    default:
      console.error('未知的游戏模式:', gameMode);
      initSoloExploration(); // 默认使用单人漫游模式
      // 设置默认的startGame函数
      window.startGame = startSoloGame;
      break;
  }
}

/**
 * 隐藏所有游戏模式UI
 */
function hideAllGameModeUI() {
  const standardModeUI = document.getElementById('standard-mode-ui');
  const soloExplorationUI = document.getElementById('solo-exploration-ui');
  const soloExplorationCreatorUI = document.getElementById('solo-exploration-creator-ui');
  
  if (standardModeUI) standardModeUI.style.display = 'none';
  if (soloExplorationUI) soloExplorationUI.style.display = 'none';
  if (soloExplorationCreatorUI) soloExplorationCreatorUI.style.display = 'none';
}