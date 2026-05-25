document.addEventListener('DOMContentLoaded', () => {
    let targetNumber = '';
    let digitCount = 4;
    let attempts = 0;
    let isGameOver = false;

    const digitCountSelect = document.getElementById('digit-count');
    const newGameBtn = document.getElementById('new-game-btn');
    const backBtn = document.getElementById('back-btn');
    const digitInputsContainer = document.getElementById('digit-inputs-container');
    const guessBtn = document.getElementById('guess-btn');
    const gamePlayArea = document.getElementById('game-play');
    const messageEl = document.getElementById('message');
    const historyList = document.getElementById('history-list');
    
    const modal = document.getElementById('game-over-modal');
    const modalMessage = document.getElementById('modal-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const returnHomeBtn = document.getElementById('return-home-btn');

    // 初始化游戏
    function initGame() {
        digitCount = parseInt(digitCountSelect.value);
        targetNumber = generateTargetNumber(digitCount);
        attempts = 0;
        isGameOver = false;
        
        createDigitInputs();
        
        messageEl.textContent = '';
        historyList.innerHTML = '';
        gamePlayArea.style.display = 'block';
        
        console.log('Target:', targetNumber); // 调试用
    }

    // 创建数字输入框
    function createDigitInputs() {
        digitInputsContainer.innerHTML = '';
        for (let i = 0; i < digitCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.inputMode = 'numeric';
            input.className = 'digit-input';
            input.maxLength = 1;
            input.dataset.index = i;
            
            // 自动跳到下一个输入框
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value && i < digitCount - 1) {
                    digitInputsContainer.children[i + 1].focus();
                }
            });

            // 处理退格键回到上一个输入框
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && i > 0) {
                    digitInputsContainer.children[i - 1].focus();
                } else if (e.key === 'Enter') {
                    handleGuess();
                }
            });

            digitInputsContainer.appendChild(input);
        }
        // 默认聚焦第一个
        digitInputsContainer.firstChild.focus();
    }

    // 生成不重复的随机数
    function generateTargetNumber(length) {
        const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * digits.length);
            result += digits.splice(randomIndex, 1)[0];
        }
        return result;
    }

    // 获取当前猜测值
    function getGuessValue() {
        let guess = '';
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        inputs.forEach(input => {
            guess += input.value;
        });
        return guess;
    }

    // 清空输入框
    function clearInputs() {
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        inputs.forEach(input => {
            input.value = '';
        });
        inputs[0].focus();
    }

    // 处理猜测
    function handleGuess() {
        if (isGameOver) return;

        const guess = getGuessValue();
        
        // 验证输入
        if (guess.length !== digitCount) {
            showMessage(`请输入完整的${digitCount}位数字`);
            return;
        }
        
        if (!/^\d+$/.test(guess)) {
            showMessage('请输入有效的数字');
            return;
        }

        const guessDigits = guess.split('');
        const uniqueDigits = new Set(guessDigits);
        if (uniqueDigits.size !== digitCount) {
            showMessage('数字不能重复');
            return;
        }

        // 计算 A 和 B
        let aCount = 0;
        let bCount = 0;
        
        for (let i = 0; i < digitCount; i++) {
            if (guess[i] === targetNumber[i]) {
                aCount++;
            } else if (targetNumber.includes(guess[i])) {
                bCount++;
            }
        }

        attempts++;
        addHistoryItem(guess, `${aCount}A${bCount}B`);
        clearInputs();
        showMessage('');

        if (aCount === digitCount) {
            endGame(true);
        }
    }

    function addHistoryItem(guess, result) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="guess">${guess}</span>
            <span class="result">${result}</span>
        `;
        historyList.insertBefore(item, historyList.firstChild);
    }

    function showMessage(msg) {
        messageEl.textContent = msg;
    }

    function endGame(isWin) {
        isGameOver = true;
        if (isWin) {
            modalMessage.textContent = `你用了 ${attempts} 次猜中了数字 ${targetNumber}！`;
            modal.style.display = 'flex';
        }
    }

    // 事件监听
    newGameBtn.addEventListener('click', initGame);
    
    backBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    guessBtn.addEventListener('click', handleGuess);

    digitCountSelect.addEventListener('change', () => {
        // 如果游戏已经开始，询问是否重新开始
        if (attempts > 0 && !isGameOver) {
            if (confirm('更改位数将重新开始游戏，确定吗？')) {
                initGame();
            } else {
                digitCountSelect.value = digitCount;
            }
        } else {
            initGame();
        }
    });

    playAgainBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        initGame();
    });

    returnHomeBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // 默认开始一个 4 位数的游游戏
    initGame();
});
