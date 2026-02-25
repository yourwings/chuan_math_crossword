const { chengyuList, shuffle } = require('../../utils/idioms.js');

Page({
  data: {
    targetRounds: 10,
    currentRound: 0,
    correctCount: 0,
    currentIdiom: '',
    status: '',
    options: [],
    gameStarted: false,
    showGameOver: false,
    resultMsg: '',
    correctOption: ''
  },

  charToFirstIdioms: {},
  pathCache: {},
  forbiddenTailChars: ['盾'],
  lastInitialIdiom: '',
  attemptsUsed: 0,
  currentChain: [],

  onLoad: function() {
    this.initCharMap();
  },

  initCharMap: function() {
    const charMap = {};
    chengyuList.forEach(idiom => {
      const firstChar = idiom.charAt(0);
      if (!charMap[firstChar]) {
        charMap[firstChar] = [];
      }
      charMap[firstChar].push(idiom);
    });
    this.charToFirstIdioms = charMap;
  },

  onTargetRoundsInput: function(e) {
    this.setData({
      targetRounds: parseInt(e.detail.value) || 10
    });
  },

  hasSuccessor: function(idiom) {
    const lastChar = idiom.charAt(idiom.length - 1);
    if (this.forbiddenTailChars.indexOf(lastChar) !== -1) {
      return false;
    }
    const candidates = (this.charToFirstIdioms[lastChar] || []).filter(item => item !== idiom);
    return candidates.length > 0;
  },

  getSuccessors: function(idiom) {
    const lastChar = idiom.charAt(idiom.length - 1);
    if (this.forbiddenTailChars.indexOf(lastChar) !== -1) {
      return [];
    }
    return (this.charToFirstIdioms[lastChar] || []).filter(item => item !== idiom);
  },

  hasPath: function(idiom, depth, visited) {
    if (depth <= 1) return true;
    const key = idiom + '|' + depth;
    if (this.pathCache[key] !== undefined) return this.pathCache[key];

    const nextList = this.getSuccessors(idiom);
    if (nextList.length === 0) {
      this.pathCache[key] = false;
      return false;
    }

    const baseVisited = visited || new Set();
    baseVisited.add(idiom);
    for (const next of nextList) {
      if (baseVisited.has(next)) continue;
      const nextVisited = new Set(baseVisited);
      if (this.hasPath(next, depth - 1, nextVisited)) {
        this.pathCache[key] = true;
        return true;
      }
    }
    this.pathCache[key] = false;
    return false;
  },

  buildChain: function(length) {
    const candidates = chengyuList.filter(idiom => this.hasSuccessor(idiom));
    if (candidates.length === 0) return null;

    const startPool = shuffle([...candidates]);
    for (const start of startPool) {
      if (startPool.length > 1 && start === this.lastInitialIdiom) continue;
      const visited = new Set([start]);
      const path = this.dfsBuildChain(start, length, [start], visited);
      if (path) {
        this.lastInitialIdiom = start;
        return path;
      }
    }
    return null;
  },

  dfsBuildChain: function(current, remainingSteps, path, visited) {
    if (remainingSteps === 0) return path;
    const successors = this.getSuccessors(current).filter(item => !visited.has(item));
    if (successors.length === 0) return null;

    const pool = shuffle([...successors]);
    for (const next of pool) {
      const nextVisited = new Set(visited);
      nextVisited.add(next);
      const result = this.dfsBuildChain(next, remainingSteps - 1, [...path, next], nextVisited);
      if (result) return result;
    }
    return null;
  },

  startGame: function() {
    const target = Math.min(Math.max(this.data.targetRounds, 5), 50);
    this.currentChain = this.buildChain(target);
    if (!this.currentChain) {
      wx.showToast({ title: '数据初始化失败', icon: 'none' });
      return;
    }

    this.attemptsUsed = 0;
    this.setData({
      gameStarted: true,
      showGameOver: false,
      currentRound: 1,
      correctCount: 0,
      targetRounds: target,
      currentIdiom: this.currentChain[0],
      status: ''
    }, () => {
      this.renderQuestion();
    });
  },

  renderQuestion: function() {
    const { currentRound, currentIdiom } = this.data;
    const nextIndex = currentRound;
    if (nextIndex >= this.currentChain.length) {
      this.endGame(false);
      return;
    }

    const nextIdiom = this.currentChain[nextIndex];
    const lastChar = currentIdiom.charAt(currentIdiom.length - 1);
    
    // 生成选项
    const options = [{ text: nextIdiom, class: '', disabled: false }];
    const distractionsPool = chengyuList.filter(idiom => 
      idiom !== currentIdiom && 
      idiom !== nextIdiom && 
      idiom.charAt(0) !== lastChar
    );
    shuffle(distractionsPool);
    for (let i = 0; i < distractionsPool.length && options.length < 4; i++) {
      options.push({ text: distractionsPool[i], class: '', disabled: false });
    }
    shuffle(options);

    this.setData({
      options,
      correctOption: nextIdiom
    });
  },

  onOptionClick: function(e) {
    const selectedIdiom = e.currentTarget.dataset.idiom;
    const { correctOption, currentRound, targetRounds, correctCount } = this.data;

    if (selectedIdiom === correctOption) {
      const newOptions = this.data.options.map(opt => ({
        ...opt,
        class: opt.text === selectedIdiom ? 'correct' : '',
        disabled: true
      }));

      this.setData({
        options: newOptions,
        correctCount: correctCount + 1,
        status: '回答正确，继续接龙。',
        currentIdiom: correctOption
      });

      this.attemptsUsed = 0;
      if (currentRound >= targetRounds) {
        setTimeout(() => this.endGame(false), 500);
      } else {
        setTimeout(() => {
          this.setData({
            currentRound: currentRound + 1,
            status: ''
          });
          this.renderQuestion();
        }, 800);
      }
    } else {
      this.attemptsUsed++;
      const newOptions = this.data.options.map(opt => ({
        ...opt,
        class: opt.text === selectedIdiom ? 'wrong' : opt.class,
        disabled: opt.text === selectedIdiom ? true : opt.disabled
      }));

      if (this.attemptsUsed === 1) {
        this.setData({
          options: newOptions,
          status: '答错了，还有一次机会。'
        });
      } else {
        this.setData({
          options: newOptions,
          status: '第二次答错，接龙结束。'
        });
        setTimeout(() => this.endGame(true), 800);
      }
    }
  },

  endGame: function(broken) {
    const { correctCount, targetRounds } = this.data;
    let resultMsg = '';
    if (!broken && correctCount >= targetRounds) {
      resultMsg = '恭喜完成全部接龙。';
    } else if (correctCount === 0) {
      resultMsg = '还没有成功接龙，下次再挑战。';
    } else {
      resultMsg = '接龙中途被打断，下次再接再厉。';
    }

    this.setData({
      showGameOver: true,
      resultMsg,
      gameStarted: false
    });
  },

  restartGame: function() {
    this.startGame();
  },

  goBack: function() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: '/pages/index/index' });
      }
    });
  }
})
