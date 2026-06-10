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
    const clearBtn = document.getElementById('clear-btn');
    const backspaceBtn = document.getElementById('backspace-btn');
    const numBtns = document.querySelectorAll('.num-btn[data-value]');
    const gamePlayArea = document.getElementById('game-play');
    const messageEl = document.getElementById('message');
    const historyList = document.getElementById('history-list');
    const modal = document.getElementById('game-over-modal');
    const modalMessage = document.getElementById('modal-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const returnHomeBtn = document.getElementById('return-home-btn');
    
    let currentInputIndex = 0;

    // 初始化游戏
    function initGame() {
        digitCount = parseInt(digitCountSelect.value);
        targetNumber = generateTargetNumber(digitCount);
        attempts = 0;
        isGameOver = false;
        currentInputIndex = 0;
        
        createDigitInputs();
        setupNumPad();
        
        messageEl.textContent = '';
        historyList.innerHTML = '';
        // 不要直接设置 block，保留 CSS 中的 flex 布局
        gamePlayArea.style.display = ''; 
        
        console.log('Target:', targetNumber); // 调试用
    }

    // 创建数字输入框
    function createDigitInputs() {
        digitInputsContainer.innerHTML = '';
        for (let i = 0; i < digitCount; i++) {
            const input = document.createElement('div');
            input.className = 'digit-input';
            input.dataset.index = i;
            input.textContent = '';
            digitInputsContainer.appendChild(input);
        }
        updateInputFocus();
    }

    function updateInputFocus() {
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        inputs.forEach((input, i) => {
            if (i === currentInputIndex) {
                input.style.borderColor = '#4CAF50';
                input.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.4)';
            } else {
                input.style.borderColor = '#2196F3';
                input.style.boxShadow = 'none';
            }
        });
    }

    function setupNumPad() {
        // 清除旧的监听器（如果有）
        const newNumBtns = document.querySelectorAll('.num-btn[data-value]');
        newNumBtns.forEach(btn => {
            btn.onclick = () => {
                if (isGameOver) return;
                const value = btn.dataset.value;
                handleNumInput(value);
            };
        });

        clearBtn.onclick = () => {
            if (isGameOver) return;
            clearInputs();
        };

        backspaceBtn.onclick = () => {
            if (isGameOver) return;
            handleBackspace();
        };
    }

    function handleNumInput(value) {
        if (currentInputIndex < digitCount) {
            const inputs = digitInputsContainer.querySelectorAll('.digit-input');
            inputs[currentInputIndex].textContent = value;
            currentInputIndex++;
            if (currentInputIndex > digitCount - 1) {
                // 已填满，但不自动提交，让用户确认
            }
            updateInputFocus();
        }
    }

    function handleBackspace() {
        if (currentInputIndex > 0) {
            currentInputIndex--;
            const inputs = digitInputsContainer.querySelectorAll('.digit-input');
            inputs[currentInputIndex].textContent = '';
            updateInputFocus();
        }
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
            guess += input.textContent;
        });
        return guess;
    }

    // 清空输入框
    function clearInputs() {
        const inputs = digitInputsContainer.querySelectorAll('.digit-input');
        inputs.forEach(input => {
            input.textContent = '';
        });
        currentInputIndex = 0;
        updateInputFocus();
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
        
        const guessDigits = guess.split('');
        const uniqueDigits = new Set(guessDigits);
        if (uniqueDigits.size !== digitCount) {
            showMessage('数字不能重复，请检查后提交');
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
        addHistoryItem(attempts, guess, aCount, bCount);
        clearInputs();
        showMessage('');

        if (aCount === digitCount) {
            endGame(true);
        }
    }

    function addHistoryItem(index, guess, a, b) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="idx">#${index}</span>
            <span class="guess">${guess}</span>
            <span class="result">
                <span class="a-part">${a}A</span><span class="b-part">${b}B</span>
            </span>
        `;
        historyList.insertBefore(item, historyList.firstChild);
    }

    function showMessage(msg) {
        messageEl.textContent = msg;
    }

    function endGame(isWin) {
        isGameOver = true;
        if (isWin) {
            modalMessage.textContent = `恭喜！你用了 ${attempts} 次猜中了数字 ${targetNumber}！`;
            modal.style.display = 'flex';
        }
    }

    // 事件监听
    newGameBtn.addEventListener('click', initGame);
    
    backBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    guessBtn.addEventListener('click', handleGuess);

    // 监听物理键盘
    window.addEventListener('keydown', (e) => {
        if (isGameOver) return;
        if (e.key >= '0' && e.key <= '9') {
            handleNumInput(e.key);
        } else if (e.key === 'Backspace') {
            handleBackspace();
        } else if (e.key === 'Enter') {
            handleGuess();
        } else if (e.key === 'Escape') {
            clearInputs();
        }
    });

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
