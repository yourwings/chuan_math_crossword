global.document = {
  getElementById: () => ({
    addEventListener: () => {},
    style: {},
    innerHTML: '',
    textContent: ''
  }),
  createElement: () => ({
    appendChild: () => {},
    className: '',
    textContent: '',
    style: {}
  })
};

global.window = { location: { href: '' } };

require('./game.js');

const list = global.chengyuList || (global.window && global.window.chengyuList) || [];
const uniqueList = Array.from(new Set(list));

function hasSuccessorInList(idiom, listRef) {
  const lastChar = idiom.charAt(idiom.length - 1);
  return listRef.some(item => item !== idiom && item.charAt(0) === lastChar);
}

const tailMap = {};

for (let i = 0; i < uniqueList.length; i++) {
  const idiom = uniqueList[i];
  const lastChar = idiom.charAt(idiom.length - 1);
  if (!tailMap[lastChar]) {
    tailMap[lastChar] = {
      total: 0,
      withSucc: 0,
      withoutSucc: 0
    };
  }
  tailMap[lastChar].total += 1;
}

for (let i = 0; i < uniqueList.length; i++) {
  const idiom = uniqueList[i];
  const lastChar = idiom.charAt(idiom.length - 1);
  const hasSucc = hasSuccessorInList(idiom, uniqueList);
  if (hasSucc) {
    tailMap[lastChar].withSucc += 1;
  } else {
    tailMap[lastChar].withoutSucc += 1;
  }
}

const tails = Object.keys(tailMap).map(char => {
  return {
    char,
    total: tailMap[char].total,
    withSucc: tailMap[char].withSucc,
    withoutSucc: tailMap[char].withoutSucc
  };
});

tails.sort((a, b) => b.total - a.total);

console.log('TAIL_STATS_TOTAL_IDIOMS', uniqueList.length);
console.log('TAIL_STATS_DISTINCT_TAILS', tails.length);
tails.forEach(item => {
  console.log(
    'TAIL',
    item.char,
    'TOTAL',
    item.total,
    'WITH_SUCCESSOR',
    item.withSucc,
    'WITHOUT_SUCCESSOR',
    item.withoutSucc
  );
});

