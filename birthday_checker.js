/**
 * 小川生日彩蛋检测脚本
 * 用于检测是否满足彩蛋触发条件并显示彩蛋页面
 */

// 游戏开始时间
let gameStartTime = null;
// 游戏时长（毫秒）
let gamePlayTime = 0;
// 彩蛋是否已触发
let birthdayEggTriggered = false;
// 本地存储键名
const STORAGE_KEY = 'chuan_birthday_egg';

// 初始化游戏时间跟踪
function initBirthdayChecker() {
    // 如果已经有开始时间，则不重新初始化
    if (gameStartTime) return;
    
    // 从本地存储中恢复数据
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            gameStartTime = new Date(data.startTime);
            gamePlayTime = data.playTime || 0;
            birthdayEggTriggered = data.triggered || false;
        } catch (e) {
            // 如果解析失败，重新初始化
            resetBirthdayChecker();
        }
    } else {
        resetBirthdayChecker();
    }
    
    // 立即更新一次游戏时长
    updateGamePlayTime();
    
    // 每5秒更新一次游戏时长
    setInterval(updateGamePlayTime, 5000);
    
    // 页面关闭前保存数据
    window.addEventListener('beforeunload', saveGameData);
    
    // 检查是否需要显示彩蛋
    checkBirthdayEgg();
}

// 重置生日检测器
function resetBirthdayChecker() {
    gameStartTime = new Date();
    gamePlayTime = 0;
    birthdayEggTriggered = false;
    saveGameData();
}

// 更新游戏时长
function updateGamePlayTime() {
    if (!gameStartTime) return;
    
    const now = new Date();
    const elapsedTime = now - gameStartTime;
    gamePlayTime += elapsedTime;
    
    // 更新开始时间为当前时间
    gameStartTime = now;
    
    // 保存数据
    saveGameData();
    
    // 检查是否需要显示彩蛋
    checkBirthdayEgg();
}

// 保存游戏数据到本地存储
function saveGameData() {
    const data = {
        startTime: gameStartTime.toISOString(),
        playTime: gamePlayTime,
        triggered: birthdayEggTriggered
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 检查是否满足彩蛋条件
function checkBirthdayEgg() {
    // 如果彩蛋已经触发过，不再触发
    if (birthdayEggTriggered) return;
    
    // 检查是否是小川生日（6月7日）
    const today = new Date();
    const isChauanBirthday = (today.getMonth() === 5 && today.getDate() === 7); // 月份从0开始，所以6月是5
    
    // 如果不是小川生日，不触发彩蛋
    if (!isChauanBirthday) return;
    
    // 注意：在数字宝藏游戏中，我们使用得分检查而不是时长检查
    // 具体检查逻辑在game.js的checkBirthdayEggCondition函数中实现
}

// 显示生日彩蛋
function showBirthdayEgg() {
    birthdayEggTriggered = true;
    saveGameData();
    
    // 跳转到彩蛋页面
    window.location.href = 'birthday_surprise/index.html';
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initBirthdayChecker);

// 导出函数供其他脚本使用
window.birthdayChecker = {
    init: initBirthdayChecker,
    reset: resetBirthdayChecker,
    check: checkBirthdayEgg,
    showEgg: showBirthdayEgg
};