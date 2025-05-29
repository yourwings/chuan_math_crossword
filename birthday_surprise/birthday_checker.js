/**
 * 小川生日彩蛋检测器
 * 用于检测是否满足彩蛋触发条件并显示彩蛋页面
 */

// 游戏开始时间记录
let gameStartTime = null;

// 初始化彩蛋检测器
function initBirthdayChecker() {
    // 记录游戏开始时间
    gameStartTime = new Date();
    
    // 检查是否是小川生日（6月7日）
    checkBirthdayDate();
}

// 检查当前日期是否是小川生日
function checkBirthdayDate() {
    const today = new Date();
    return (today.getMonth() === 5 && today.getDate() === 7); // 月份从0开始，所以6月是5
}

// 检查游戏时长是否达到要求（3分钟）
function checkGameDuration() {
    return gamePlayTime >= 180000; // 3分钟 = 180000毫秒
}

// 检查是否满足彩蛋触发条件（游戏时间超过10分钟且是小川生日）
function checkBirthdayEggCondition() {
    return checkBirthdayDate() && checkGameDuration();
}

// 检查是否满足特殊触发条件（小川猜数字游戏中连续猜到6和7）
function checkSpecialCondition(guessedNumbers) {
    if (!checkBirthdayDate()) return false;
    
    // 检查最后两个猜对的数字是否是6和7
    if (guessedNumbers.length >= 2) {
        const lastTwo = guessedNumbers.slice(-2);
        return lastTwo[0] === 6 && lastTwo[1] === 7;
    }
    
    return false;
}

// 显示彩蛋页面
function showBirthdayEgg() {
    window.location.href = '/birthday_surprise/index.html';
}

// 导出函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initBirthdayChecker,
        checkBirthdayDate,
        checkGameDuration,
        checkBirthdayEggCondition,
        checkSpecialCondition,
        showBirthdayEgg
    };
}