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

const withSuccessor = [];
const withoutSuccessor = [];

for (let i = 0; i < uniqueList.length; i++) {
  const idiom = uniqueList[i];
  if (hasSuccessorInList(idiom, uniqueList)) {
    withSuccessor.push(idiom);
  } else {
    withoutSuccessor.push(idiom);
  }
}

const offset = parseInt(process.argv[2] || '0', 10);
const limit = parseInt(process.argv[3] || String(withoutSuccessor.length), 10);
const slice = withoutSuccessor.slice(offset, offset + limit);

console.log('TOTAL', uniqueList.length);
console.log('WITH_SUCCESSOR_COUNT', withSuccessor.length);
console.log('WITHOUT_SUCCESSOR_COUNT', withoutSuccessor.length);
console.log('SLICE_OFFSET', offset);
console.log('SLICE_LIMIT', slice.length);
console.log('WITHOUT_SUCCESSOR_SLICE', slice.join('、'));
