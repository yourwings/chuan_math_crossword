const baseChengyuList = [
    '一心一意',
    '一举两得',
    '一帆风顺',
    '一见钟情',
    '一清二楚',
    '一落千丈',
    '一丝不苟',
    '一模一样',
    '一成不变',
    '一鼓作气',
    '一刀两断',
    '一举成名',
    '一箭双雕',
    '一诺千金',
    '一贫如洗',
    '一落千金',
    '一波三折',
    '一呼百应',
    '一笑置之',
    '一言九鼎',
    '一言难尽',
    '一心一德',
    '一见如故',
    '一鸣惊人',
    '一目了然',
    '一知半解',
    '一穷二白',
    '一事无成',
    '一举一动',
    '二话不说',
    '三心二意',
    '三番五次',
    '三言两语',
    '三思而行',
    '三头六臂',
    '三长两短',
    '三顾茅庐',
    '三阳开泰',
    '三教九流',
    '不可思议',
    '不约而同',
    '不辞辛苦',
    '不知所措',
    '不言而喻',
    '不翼而飞',
    '不折不扣',
    '不屈不挠',
    '不慌不忙',
    '不紧不慢',
    '不痛不痒',
    '不期而遇',
    '不遗余力',
    '不谋而合',
    '天南地北',
    '天真无邪',
    '天长地久',
    '天翻地覆',
    '天涯海角',
    '天经地义',
    '天罗地网',
    '天马行空',
    '天衣无缝',
    '天外有天',
    '大公无私',
    '大同小异',
    '大惊小怪',
    '大智若愚',
    '大材小用',
    '大惑不解',
    '大张旗鼓',
    '大言不惭',
    '大开眼界',
    '大气磅礴',
    '大是大非',
    '大起大落',
    '大张旗鼓',
    '大公至正',
    '大快人心',
    '大显身手',
    '大手大脚',
    '心平气和',
    '心花怒放',
    '心领神会',
    '心直口快',
    '心满意足',
    '心急如焚',
    '心狠手辣',
    '心惊肉跳',
    '心照不宣',
    '心神不宁',
    '心甘情愿',
    '心有余悸',
    '心驰神往',
    '心乱如麻',
    '心旷神怡',
    '心潮澎湃',
    '心悦诚服',
    '目不转睛',
    '目中无人',
    '目瞪口呆',
    '目不暇接',
    '目无法纪',
    '目空一切',
    '目不识丁',
    '目迷五色',
    '目光如炬',
    '手舞足蹈',
    '手忙脚乱',
    '手足无措',
    '手不释卷',
    '手无寸铁',
    '手到擒来',
    '手疾眼快',
    '手脚麻利',
    '手眼通天',
    '日新月异',
    '日久生情',
    '日积月累',
    '日夜兼程',
    '日甚一日',
    '日出而作',
    '日落而息',
    '日理万机',
    '日月如梭',
    '日薄西山',
    '水滴石穿',
    '水深火热',
    '水到渠成',
    '水落石出',
    '水天一色',
    '水乳交融',
    '水泄不通',
    '水火不容',
    '水性杨花',
    '水中捞月',
    '风调雨顺',
    '风和日丽',
    '风雨同舟',
    '风平浪静',
    '风云变幻',
    '风驰电掣',
    '风花雪月',
    '风卷残云',
    '风起云涌',
    '风声鹤唳',
    '风雨如晦',
    '风流倜傥',
    '风餐露宿',
    '风雨交加',
    '龙飞凤舞',
    '龙争虎斗',
    '龙马精神',
    '龙腾虎跃',
    '龙凤呈祥',
    '龙蛇混杂',
    '龙生九子',
    '龙盘虎踞',
    '龙颜大怒',
    '虎视眈眈',
    '虎口拔牙',
    '虎背熊腰',
    '虎头蛇尾',
    '虎落平阳',
    '虎虎生威',
    '生龙活虎',
    '生机勃勃',
    '生活富裕',
    '生离死别',
    '生死攸关',
    '亡羊补牢',
    '口是心非',
    '口若悬河',
    '口蜜腹剑',
    '开门见山',
    '开花结果',
    '开诚布公',
    '开天辟地',
    '开卷有益',
    '平易近人',
    '左右为难',
    '左右逢源',
    '左右开弓',
    '巧夺天工',
    '巧舌如簧',
    '巧立名目',
    '四通八达',
    '五光十色',
    '五花八门',
    '五颜六色',
    '六神无主',
    '七上八下',
    '七嘴八舌',
    '八面玲珑',
    '八仙过海',
    '九牛一毛',
    '九死一生',
    '十全十美',
    '十拿九稳',
    '百发百中',
    '百依百顺',
    '百感交集',
    '百折不挠',
    '百闻不如',
    '百花齐放',
    '百思不解',
    '百忙之中',
    '千方百计',
    '千钧一发',
    '千辛万苦',
    '千载难逢',
    '千言万语',
    '千军万马',
    '千姿百态',
    '千奇百怪',
    '万紫千红',
    '万众一心',
    '万无一失',
    '万事如意',
    '万象更新',
    '乐此不疲',
    '乐不思蜀',
    '乐在其中',
    '乐不可支',
    '乐观向上',
    '自相矛盾',
    '自强不息',
    '自作自受',
    '自言自语',
    '自私自利',
    '自始至终'
];

const idiomPool = [
    ...baseChengyuList,
    '爱不释手',
    '安居乐业',
    '安然无恙',
    '半信半疑',
    '班门弄斧',
    '包罗万象',
    '暴风骤雨',
    '比比皆是',
    '闭月羞花',
    '标新立异',
    '彬彬有礼',
    '宾至如归',
    '博大精深',
    '博览群书',
    '不卑不亢',
    '不可多得',
    '不可救药',
    '不拘小节',
    '不伦不类',
    '不眠不休',
    '不偏不倚',
    '不屈不挠',
    '不三不四',
    '不声不响',
    '不胜枚举',
    '不言而喻',
    '不遗余力',
    '不远万里',
    '才高八斗',
    '才华横溢',
    '财大气粗',
    '参差不齐',
    '层出不穷',
    '差强人意',
    '长篇大论',
    '长驱直入',
    '畅所欲言',
    '怅然若失',
    '朝气蓬勃',
    '沉默寡言',
    '称心如意',
    '瞠目结舌',
    '吃喝玩乐',
    '痴心妄想',
    '持之以恒',
    '川流不息',
    '吹毛求疵',
    '垂头丧气',
    '春风得意',
    '春暖花开',
    '此起彼伏',
    '从容不迫',
    '错综复杂',
    '大刀阔斧',
    '大费周章',
    '大公无私',
    '大惊失色',
    '大名鼎鼎',
    '大难临头',
    '大权在握',
    '大显神通',
    '大义凛然',
    '得寸进尺',
    '得过且过',
    '得心应手',
    '得意洋洋',
    '得意忘形',
    '得意之作',
    '滴水不漏',
    '独一无二',
    '独具匠心',
    '独树一帜',
    '多才多艺',
    '多此一举',
    '多多益善',
    '多如牛毛',
    '耳聪目明',
    '耳目一新',
    '发愤图强',
    '发财致富',
    '翻天覆地',
    '翻云覆雨',
    '繁花似锦',
    '反复无常',
    '方兴未艾',
    '放虎归山',
    '飞黄腾达',
    '飞檐走壁',
    '奋不顾身',
    '奋发图强',
    '丰富多彩',
    '风驰电掣',
    '逢凶化吉',
    '扶老携幼',
    '福星高照',
    '赴汤蹈火',
    '改过自新',
    '改头换面',
    '甘拜下风',
    '刚愎自用',
    '高瞻远瞩',
    '高枕无忧',
    '各奔东西',
    '各抒己见',
    '根深蒂固',
    '恭敬不如',
    '勾心斗角',
    '狗急跳墙',
    '姑息养奸',
    '孤军奋战',
    '古色古香',
    '顾此失彼',
    '光彩夺目',
    '光明磊落',
    '鬼斧神工',
    '滚瓜烂熟',
    '过目不忘',
    '海阔天空',
    '含辛茹苦',
    '含笑九泉',
    '汗流浃背',
    '行云流水',
    '好高骛远',
    '好景不长',
    '合情合理',
    '和蔼可亲',
    '和风细雨',
    '和睦相处',
    '鹤立鸡群',
    '横冲直撞',
    '横七竖八',
    '宏图大志',
    '轰轰烈烈',
    '呼风唤雨',
    '胡思乱想',
    '狐假虎威',
    '湖光山色',
    '胡言乱语',
    '虎背熊腰',
    '花好月圆',
    '花枝招展',
    '画蛇添足',
    '欢呼雀跃',
    '欢天喜地',
    '患得患失',
    '挥金如土',
    '挥汗如雨',
    '回味无穷',
    '昏天黑地',
    '浑然一体',
    '活灵活现',
    '火上浇油',
    '豁然开朗',
    '机不可失',
    '积极向上',
    '积少成多',
    '集思广益',
    '家喻户晓',
    '见多识广',
    '见义勇为',
    '见仁见智',
    '江山如画',
    '江山社稷',
    '交口称赞',
    '娇小玲珑',
    '教导有方',
    '节节高升',
    '节衣缩食',
    '捷足先登',
    '金碧辉煌',
    '金戈铁马',
    '津津乐道',
    '谨小慎微',
    '尽心尽力',
    '惊涛骇浪',
    '精兵强将',
    '精雕细琢',
    '精打细算',
    '精明强干',
    '井井有条',
    '久负盛名',
    '久经考验',
    '居安思危',
    '举世闻名',
    '举手之劳',
    '开诚相见',
    '慷慨解囊',
    '苦口婆心',
    '夸夸其谈',
    '宽宏大量',
    '款款深情',
    '来龙去脉',
    '乐善好施',
    '力挽狂澜',
    '历历在目',
    '恋恋不舍',
    '两全其美',
    '临危不惧',
    '琳琅满目',
    '流连忘返',
    '龙飞凤舞',
    '乱七八糟',
    '络绎不绝',
    '落花流水',
    '满腹经纶',
    '满面春风',
    '漫不经心',
    '忙忙碌碌',
    '茂林修竹',
    '眉开眼笑',
    '美不胜收',
    '美轮美奂',
    '面红耳赤',
    '妙不可言',
    '妙趣横生',
    '明察秋毫',
    '明目张胆',
    '名列前茅',
    '名副其实',
    '名扬四海',
    '目不暇接',
    '难能可贵',
    '年富力强',
    '念念不忘',
    '鸟语花香',
    '怒火中烧',
    '旗开得胜',
    '奇思妙想',
    '前所未有',
    '前仆后继',
    '强词夺理',
    '巧夺天工',
    '琴棋书画',
    '轻而易举',
    '青山绿水',
    '青出于蓝',
    '情不自禁',
    '情同手足',
    '情真意切',
    '穷追不舍',
    '曲折离奇',
    '全力以赴',
    '热火朝天',
    '人才辈出',
    '任劳任怨',
    '日新月异',
    '如火如荼',
    '如雷贯耳',
    '如梦初醒',
    '如鱼得水',
    '如愿以偿',
    '若隐若现',
    '三番两次',
    '三令五申',
    '三三两两',
    '森严壁垒',
    '杀鸡儆猴',
    '煞费苦心',
    '山明水秀',
    '山清水秀',
    '闪闪发光',
    '上下其手',
    '上天入地',
    '身临其境',
    '神采奕奕',
    '神机妙算',
    '神乎其技',
    '神秘莫测',
    '神清气爽',
    '神色自若',
    '神通广大',
    '神志不清',
    '生机盎然',
    '声东击西',
    '声名远扬',
    '声势浩大',
    '胜券在握',
    '失魂落魄',
    '十指连心',
    '实事求是',
    '石破天惊',
    '势不可挡',
    '势如破竹',
    '事半功倍',
    '适可而止',
    '守口如瓶',
    '守株待兔',
    '手无缚鸡',
    '受宠若惊',
    '书声琅琅',
    '数一数二',
    '双管齐下',
    '水天相接',
    '思前想后',
    '随遇而安',
    '所向披靡',
    '谈笑风生',
    '滔滔不绝',
    '陶醉其中',
    '腾云驾雾',
    '体贴入微',
    '天高云淡',
    '天南海北',
    '天涯比邻',
    '天真烂漫',
    '调兵遣将',
    '挑灯夜战',
    '铁面无私',
    '同甘共苦',
    '同心协力',
    '同舟共济',
    '头头是道',
    '土生土长',
    '推心置腹',
    '脱颖而出',
    '完好无损',
    '万无一失',
    '望尘莫及',
    '望穿秋水',
    '望梅止渴',
    '微不足道',
    '威风凛凛',
    '唯利是图',
    '惟妙惟肖',
    '闻名遐迩',
    '稳如泰山',
    '无边无际',
    '无地自容',
    '无法无天',
    '无拘无束',
    '无精打采',
    '无孔不入',
    '无穷无尽',
    '无所不能',
    '无所不在',
    '无微不至',
    '无与伦比',
    '五彩斑斓',
    '物美价廉',
    '夕阳西下',
    '息事宁人',
    '喜怒无常',
    '喜笑颜开',
    '细水长流',
    '细致入微',
    '先发制人',
    '先见之明',
    '相辅相成',
    '相亲相爱',
    '相濡以沫',
    '心安理得',
    '心地善良',
    '心服口服',
    '心口如一',
    '心明眼亮',
    '心平气和',
    '心满意足',
    '心心相印',
    '欣欣向荣',
    '信口开河',
    '信誓旦旦',
    '星罗棋布',
    '星星点点',
    '行色匆匆',
    '兴高采烈',
    '胸有成竹',
    '虚怀若谷',
    '栩栩如生',
    '悬崖勒马',
    '学富五车',
    '循序渐进',
    '瑕不掩瑜',
    '喜出望外',
    '一成不变',
    '一路顺风',
    '衣食无忧',
    '依依不舍',
    '因地制宜',
    '因势利导',
    '因材施教',
    '因人而异',
    '饮水思源',
    '迎刃而解',
    '应接不暇',
    '优柔寡断',
    '有备无患',
    '有口皆碑',
    '有条不紊',
    '有勇有谋',
    '与日俱增',
    '与众不同',
    '玉洁冰清',
    '郁郁葱葱',
    '浴血奋战',
    '缘木求鱼',
    '跃跃欲试',
    '云淡风轻',
    '芸芸众生',
    '再接再厉',
    '斩钉截铁',
    '张灯结彩',
    '张弛有度',
    '掌上明珠',
    '招兵买马',
    '争分夺秒',
    '蒸蒸日上',
    '枝繁叶茂',
    '直言不讳',
    '纸上谈兵',
    '众志成城',
    '珠光宝气',
    '珠联璧合',
    '诸如此类',
    '专心致志',
    '装模作样',
    '自给自足',
    '自由自在',
    '足智多谋',
    '左右开弓',
    '罪有应得',
    '一心一意',
    '一帆风顺',
    '一见如故',
    '一鸣惊人',
    '一举两得',
    '一目了然',
    '一丝不苟',
    '一清二楚',
    '一本正经',
    '一箭双雕',
    '一模一样',
    '一言九鼎',
    '一诺千金',
    '一波三折',
    '一呼百应',
    '一鼓作气',
    '一日千里',
    '一无所有',
    '三心二意',
    '三头六臂',
    '三顾茅庐',
    '三番五次',
    '三言两语',
    '三三两两',
    '七零八落',
    '七嘴八舌',
    '八仙过海',
    '九牛一毛',
    '十全十美',
    '十拿九稳',
    '十年如一',
    '千锤百炼',
    '千山万水',
    '千辛万苦',
    '千军万马',
    '千姿百态',
    '千言万语',
    '千变万化',
    '千方百计',
    '万紫千红',
    '万众一心',
    '万无一失',
    '万事如意',
    '万象更新',
    '才高八斗',
    '学富五车',
    '举一反三',
    '开门见山',
    '画蛇添足',
    '狐假虎威',
    '南辕北辙',
    '指鹿为马',
    '刻舟求剑',
    '守株待兔',
    '亡羊补牢',
    '自相矛盾',
    '掩耳盗铃',
    '画龙点睛',
    '井底之蛙',
    '盲人摸象',
    '滥竽充数',
    '愚公移山',
    '坐井观天',
    '闻鸡起舞',
    '守口如瓶',
    '口是心非',
    '惊弓之鸟',
    '如虎添翼',
    '见仁见智',
    '居安思危',
    '未雨绸缪',
    '胸有成竹',
    '破釜沉舟',
    '四面楚歌',
    '负荆请罪',
    '卧薪尝胆',
    '望梅止渴',
    '纸上谈兵',
    '草船借箭',
    '完璧归赵',
    '东施效颦',
    '画饼充饥',
    '指手画脚',
    '自作自受',
    '自食其果',
    '日积月累',
    '守望相助',
    '齐心协力',
    '聚沙成塔',
    '水滴石穿',
    '亡命天涯',
    '大公无私',
    '手不释卷',
    '后起之秀',
    '拾金不昧',
    '见义勇为',
    '助人为乐',
    '尊老爱幼',
    '勤学好问',
    '勤能补拙',
    '孜孜不倦',
    '持之以恒',
    '知错就改',
    '实事求是',
    '任劳任怨',
    '恭恭敬敬',
    '诚实守信',
    '光明磊落',
    '一视同仁',
    '大智若愚',
    '谦虚谨慎',
    '同甘共苦',
    '顾全大局',
    '百折不挠',
    '坚韧不拔',
    '奋发向上',
    '积极进取',
    '自立自强'
];

function buildChengyuList(baseList, pool, rounds, minSize) {
    const list = baseList.slice();
    for (let round = 0; round < rounds; round++) {
        const snapshot = list.slice();
        const toAdd = [];
        for (let i = 0; i < snapshot.length; i++) {
            const idiom = snapshot[i];
            const lastChar = idiom.charAt(idiom.length - 1);
            const hasSucc = snapshot.some(item => item.charAt(0) === lastChar);
            if (!hasSucc) {
                const candidates = pool.filter(item => item.charAt(0) === lastChar);
                shuffle(candidates);
                for (let j = 0; j < candidates.length && j < 5; j++) {
                    toAdd.push(candidates[j]);
                }
            }
        }
        if (toAdd.length === 0) {
            continue;
        }
        list.push(...toAdd);
        if (list.length >= minSize) {
            break;
        }
    }
    if (list.length < minSize) {
        const extras = pool.slice();
        shuffle(extras);
        if (extras.length > 0) {
            let index = 0;
            while (list.length < minSize) {
                list.push(extras[index % extras.length]);
                index += 1;
            }
        }
    }
    return list;
}

const chengyuList = buildChengyuList(baseChengyuList, idiomPool, 20, 1200);

if (typeof window !== 'undefined') {
    window.chengyuList = chengyuList;
}
if (typeof global !== 'undefined') {
    global.chengyuList = chengyuList;
}

const charToFirstIdioms = {};
chengyuList.forEach(idiom => {
    const firstChar = idiom.charAt(0);
    if (!charToFirstIdioms[firstChar]) {
        charToFirstIdioms[firstChar] = [];
    }
    charToFirstIdioms[firstChar].push(idiom);
});

let currentIdiom = null;
let correctOption = null;
let targetRounds = 10;
let currentRound = 0;
let correctCount = 0;
let attemptsUsed = 0;
let gameStarted = false;
let lastInitialIdiom = null;
const pathCache = {};
const forbiddenTailChars = ['盾'];
let currentChain = null;

const chainLengthInput = document.getElementById('chain-length');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const backButton = document.getElementById('back-btn');
const roundInfoElement = document.getElementById('round-info');
const correctInfoElement = document.getElementById('correct-info');
const statusElement = document.getElementById('status');
const currentIdiomElement = document.getElementById('current-idiom');
const optionsContainer = document.getElementById('options-container');
const gameOverModal = document.getElementById('game-over-modal');
const gameResultElement = document.getElementById('game-result');
const playAgainButton = document.getElementById('play-again-btn');
const returnHomeButton = document.getElementById('return-home-btn');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function hasSuccessor(idiom) {
    const lastChar = idiom.charAt(idiom.length - 1);
    if (forbiddenTailChars.indexOf(lastChar) !== -1) {
        return false;
    }
    const candidates = (charToFirstIdioms[lastChar] || []).filter(item => item !== idiom);
    return candidates.length > 0;
}

function getSuccessors(idiom) {
    const lastChar = idiom.charAt(idiom.length - 1);
    if (forbiddenTailChars.indexOf(lastChar) !== -1) {
        return [];
    }
    return (charToFirstIdioms[lastChar] || []).filter(item => item !== idiom);
}

function hasPath(idiom, depth, visited) {
    if (depth <= 1) {
        return true;
    }
    const key = idiom + '|' + depth;
    if (Object.prototype.hasOwnProperty.call(pathCache, key)) {
        return pathCache[key];
    }
    const nextList = getSuccessors(idiom);
    if (nextList.length === 0) {
        pathCache[key] = false;
        return false;
    }
    const baseVisited = visited || new Set();
    baseVisited.add(idiom);
    for (let i = 0; i < nextList.length; i++) {
        const next = nextList[i];
        if (baseVisited.has(next)) {
            continue;
        }
        const nextVisited = new Set(baseVisited);
        if (hasPath(next, depth - 1, nextVisited)) {
            pathCache[key] = true;
            return true;
        }
    }
    pathCache[key] = false;
    return false;
}

function pickInitialIdiom(depth) {
    const candidates = chengyuList.filter(hasSuccessor);
    if (candidates.length === 0) {
        return null;
    }
    const pool = candidates.slice();
    shuffle(pool);
    for (let i = 0; i < pool.length; i++) {
        const idiom = pool[i];
        if (idiom === lastInitialIdiom) {
            continue;
        }
        if (hasPath(idiom, depth, new Set())) {
            lastInitialIdiom = idiom;
            return idiom;
        }
    }
    const fallback = pool[0];
    lastInitialIdiom = fallback;
    return fallback;
}

function buildChain(length) {
    const steps = length;
    const candidates = chengyuList.filter(hasSuccessor);
    if (candidates.length === 0) {
        return null;
    }
    const startPool = candidates.slice();
    shuffle(startPool);
    for (let i = 0; i < startPool.length; i++) {
        const start = startPool[i];
        if (startPool.length > 1 && start === lastInitialIdiom) {
            continue;
        }
        const visited = new Set();
        visited.add(start);
        const path = dfsBuildChain(start, steps, [start], visited);
        if (path) {
            lastInitialIdiom = start;
            return path;
        }
    }
    return null;
}

function dfsBuildChain(current, remainingSteps, path, visited) {
    if (remainingSteps === 0) {
        return path;
    }
    const successors = getSuccessors(current).filter(item => !visited.has(item));
    if (successors.length === 0) {
        return null;
    }
    const pool = successors.slice();
    shuffle(pool);
    for (let i = 0; i < pool.length; i++) {
        const next = pool[i];
        const nextVisited = new Set(visited);
        nextVisited.add(next);
        const result = dfsBuildChain(next, remainingSteps - 1, path.concat(next), nextVisited);
        if (result) {
            return result;
        }
    }
    return null;
}

function updateStats() {
    roundInfoElement.textContent = `第 ${currentRound} / ${targetRounds} 题`;
    correctInfoElement.textContent = `已答对: ${correctCount}`;
}

function renderQuestion() {
    if (!currentChain || currentChain.length === 0) {
        currentIdiomElement.textContent = '成语数据不足，无法开始游戏';
        optionsContainer.innerHTML = '';
        return;
    }
    if (!currentIdiom) {
        currentIdiom = currentChain[0];
    }
    currentIdiomElement.textContent = currentIdiom;
    const roundIndex = currentRound - 1;
    const nextIndex = roundIndex + 1;
    if (nextIndex >= currentChain.length) {
        statusElement.textContent = '接龙已完成。';
        endGame(false);
        return;
    }
    const lastChar = currentIdiom.charAt(currentIdiom.length - 1);
    const nextIdiom = currentChain[nextIndex];
    correctOption = nextIdiom;
    const options = [correctOption];
    const distractionsPool = chengyuList.filter(idiom => idiom !== currentIdiom && idiom !== correctOption && idiom.charAt(0) !== lastChar);
    shuffle(distractionsPool);
    for (let i = 0; i < distractionsPool.length && options.length < 4; i++) {
        const candidate = distractionsPool[i];
        if (!options.includes(candidate)) {
            options.push(candidate);
        }
    }
    if (options.length < 4) {
        const extraPool = chengyuList.filter(idiom => idiom !== currentIdiom && !options.includes(idiom));
        shuffle(extraPool);
        for (let i = 0; i < extraPool.length && options.length < 4; i++) {
            options.push(extraPool[i]);
        }
    }
    shuffle(options);
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => handleOptionClick(option, button));
        optionsContainer.appendChild(button);
    });
}

function startGame() {
    let value = parseInt(chainLengthInput.value, 10);
    if (isNaN(value) || value < 5) {
        value = 5;
    }
    if (value > 50) {
        value = 50;
    }
    chainLengthInput.value = value.toString();
    targetRounds = value;
    correctCount = 0;
    currentRound = 1;
    attemptsUsed = 0;
    statusElement.textContent = '';
    currentChain = buildChain(targetRounds);
    if (!currentChain || currentChain.length === 0) {
        currentIdiomElement.textContent = '成语数据不足，无法开始游戏';
        optionsContainer.innerHTML = '';
        gameStarted = false;
        return;
    }
    currentIdiom = currentChain[0];
    gameStarted = true;
    restartButton.disabled = false;
    updateStats();
    renderQuestion();
}

function restartGame() {
    gameOverModal.style.display = 'none';
    startGame();
}

function handleOptionClick(selectedIdiom, button) {
    if (!gameStarted) {
        return;
    }
    if (button.disabled) {
        return;
    }
    if (selectedIdiom === correctOption) {
        button.classList.add('correct');
        correctCount += 1;
        statusElement.textContent = '回答正确，继续接龙。';
        currentIdiom = correctOption;
        attemptsUsed = 0;
        if (currentRound >= targetRounds) {
            endGame(false);
            return;
        }
        currentRound += 1;
        updateStats();
        setTimeout(() => {
            renderQuestion();
        }, 400);
    } else {
        button.classList.add('wrong');
        button.disabled = true;
        attemptsUsed += 1;
        if (attemptsUsed === 1) {
            statusElement.textContent = '答错了，还有一次机会。';
        } else {
            statusElement.textContent = '第二次答错，接龙结束。';
            endGame(true);
        }
    }
}

function endGame(broken) {
    if (!gameStarted && gameOverModal.style.display === 'flex') {
        return;
    }
    gameStarted = false;
    const lines = [];
    lines.push(`目标接龙数目：${targetRounds}`);
    lines.push(`实际答对数目：${correctCount}`);
    if (!broken && correctCount >= targetRounds) {
        lines.push('恭喜完成全部接龙。');
    } else if (correctCount === 0) {
        lines.push('还没有成功接龙，下次再来挑战。');
    } else if (broken) {
        lines.push('接龙中途被打断，下次再接再厉。');
    }
    gameResultElement.innerHTML = lines.join('<br>');
    gameOverModal.style.display = 'flex';
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
backButton.addEventListener('click', () => {
    window.location.href = '../index.html';
});
playAgainButton.addEventListener('click', () => {
    restartGame();
});
returnHomeButton.addEventListener('click', () => {
    window.location.href = '../index.html';
});

updateStats();
