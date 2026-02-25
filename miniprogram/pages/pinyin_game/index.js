const { questionBank } = require('../../utils/pinyinData.js');
const { shuffle } = require('../../utils/idioms.js');

Page({
  data: {
    currentMode: 'char_to_pinyin',
    currentItem: {},
    userInput: '',
    status: '',
    score: 0,
    total: 0,
    questionLimit: 10,
    answered: false,
    sessionFinished: false,
    options: [],
    keyboardRows: [
      [
        { key: 'q', label: 'Q' }, { key: 'w', label: 'W' }, { key: 'e', label: 'E' },
        { key: 'r', label: 'R' }, { key: 't', label: 'T' }, { key: 'y', label: 'Y' },
        { key: 'u', label: 'U' }, { key: 'i', label: 'I' }, { key: 'o', label: 'O' }, { key: 'p', label: 'P' }
      ],
      [
        { key: 'a', label: 'A' }, { key: 's', label: 'S' }, { key: 'd', label: 'D' },
        { key: 'f', label: 'F' }, { key: 'g', label: 'G' }, { key: 'h', label: 'H' },
        { key: 'j', label: 'J' }, { key: 'k', label: 'K' }, { key: 'l', label: 'L' }
      ],
      [
        { key: 'z', label: 'Z' }, { key: 'x', label: 'X' }, { key: 'c', label: 'C' },
        { key: 'v', label: 'V' }, { key: 'b', label: 'B' }, { key: 'n', label: 'N' },
        { key: 'm', label: 'M' },
        { key: 'SPACE', label: '空格', wide: true },
        { key: 'BACKSPACE', label: '退格', wide: true },
        { key: 'CLEAR', label: '清空', wide: true }
      ]
    ]
  },

  onLoad: function() {
    this.loadNextQuestion();
  },

  setMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      currentMode: mode,
      score: 0,
      total: 0,
      answered: false,
      sessionFinished: false,
      status: '',
      userInput: ''
    }, () => {
      this.loadNextQuestion();
    });
  },

  onLimitInput: function(e) {
    this.setData({
      questionLimit: parseInt(e.detail.value) || 10
    });
  },

  onUserInput: function(e) {
    this.setData({
      userInput: e.detail.value
    });
  },

  onKeyTap: function(e) {
    if (this.data.answered || this.data.sessionFinished) return;
    const key = e.currentTarget.dataset.key;
    let input = this.data.userInput;

    if (key === 'BACKSPACE') {
      input = input.slice(0, -1);
    } else if (key === 'SPACE') {
      input += ' ';
    } else if (key === 'CLEAR') {
      input = '';
    } else {
      input += key;
    }

    this.setData({ userInput: input });
  },

  normalizePinyin: function(val) {
    return val.toLowerCase().replace(/[^a-z]/g, '');
  },

  handleSubmit: function() {
    if (this.data.answered || this.data.sessionFinished) return;
    const { userInput, currentItem, score, total, questionLimit } = this.data;
    
    if (!userInput.trim()) {
      this.setData({ status: '请先输入拼音。' });
      return;
    }

    const isCorrect = this.normalizePinyin(userInput) === this.normalizePinyin(currentItem.pinyin);
    const newTotal = total + 1;
    const newScore = isCorrect ? score + 1 : score;

    this.setData({
      answered: true,
      total: newTotal,
      score: newScore,
      status: isCorrect ? '回答正确！' : `回答错误，正确拼音是：${currentItem.pinyin}`
    });

    if (newTotal >= questionLimit) {
      this.endSession(newScore, newTotal);
    }
  },

  onOptionClick: function(e) {
    if (this.data.answered || this.data.sessionFinished) return;
    const selectedText = e.currentTarget.dataset.text;
    const { currentItem, score, total, questionLimit, options } = this.data;

    const isCorrect = selectedText === currentItem.text;
    const newTotal = total + 1;
    const newScore = isCorrect ? score + 1 : score;

    const newOptions = options.map(opt => ({
      ...opt,
      class: opt.text === currentItem.text ? 'correct' : (opt.text === selectedText ? 'wrong' : '')
    }));

    this.setData({
      answered: true,
      total: newTotal,
      score: newScore,
      options: newOptions,
      status: isCorrect ? '回答正确！' : `回答错误，正确答案是：${currentItem.text}`
    });

    if (newTotal >= questionLimit) {
      this.endSession(newScore, newTotal);
    }
  },

  loadNextQuestion: function() {
    if (this.data.sessionFinished) {
      this.setData({
        score: 0,
        total: 0,
        sessionFinished: false,
        status: '',
        answered: false,
        userInput: ''
      });
    }

    const index = Math.floor(Math.random() * questionBank.length);
    const item = questionBank[index];

    if (this.data.currentMode === 'char_to_pinyin') {
      this.setData({
        currentItem: item,
        userInput: '',
        answered: false,
        status: ''
      });
    } else {
      const options = [{ text: item.text, class: '' }];
      const pool = questionBank.filter(i => i.text !== item.text);
      shuffle(pool);
      for (let i = 0; i < 3; i++) {
        options.push({ text: pool[i].text, class: '' });
      }
      shuffle(options);

      this.setData({
        currentItem: item,
        options,
        answered: false,
        status: ''
      });
    }
  },

  endSession: function(score, total) {
    const percent = Math.round((score * 100) / total);
    this.setData({
      sessionFinished: true,
      status: `本轮结束：共答 ${total} 题，答对 ${score} 题，正确率 ${percent}%。点击“下一题”开始新一轮。`
    });
  },

  goBack: function() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: '/pages/index/index' });
      }
    });
  }
})
