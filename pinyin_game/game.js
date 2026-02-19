const MODE_CHAR_TO_PINYIN = 'char_to_pinyin';
const MODE_PINYIN_TO_CHAR = 'pinyin_to_char';

const baseWordItems = [
    { text: '妈妈', pinyin: 'ma ma' },
    { text: '爸爸', pinyin: 'ba ba' },
    { text: '老师', pinyin: 'lao shi' },
    { text: '同学', pinyin: 'tong xue' },
    { text: '同桌', pinyin: 'tong zhuo' },
    { text: '同伴', pinyin: 'tong ban' },
    { text: '朋友', pinyin: 'peng you' },
    { text: '同学们', pinyin: 'tong xue men' },
    { text: '小明', pinyin: 'xiao ming' },
    { text: '小红', pinyin: 'xiao hong' },
    { text: '小华', pinyin: 'xiao hua' },
    { text: '小丽', pinyin: 'xiao li' },
    { text: '学校', pinyin: 'xue xiao' },
    { text: '教室', pinyin: 'jiao shi' },
    { text: '黑板', pinyin: 'hei ban' },
    { text: '粉笔', pinyin: 'fen bi' },
    { text: '课桌', pinyin: 'ke zhuo' },
    { text: '椅子', pinyin: 'yi zi' },
    { text: '窗户', pinyin: 'chuang hu' },
    { text: '门口', pinyin: 'men kou' },
    { text: '操场', pinyin: 'cao chang' },
    { text: '跑道', pinyin: 'pao dao' },
    { text: '图书馆', pinyin: 'tu shu guan' },
    { text: '实验室', pinyin: 'shi yan shi' },
    { text: '音乐室', pinyin: 'yin yue shi' },
    { text: '美术室', pinyin: 'mei shu shi' },
    { text: '书包', pinyin: 'shu bao' },
    { text: '铅笔', pinyin: 'qian bi' },
    { text: '钢笔', pinyin: 'gang bi' },
    { text: '圆珠笔', pinyin: 'yuan zhu bi' },
    { text: '橡皮', pinyin: 'xiang pi' },
    { text: '尺子', pinyin: 'chi zi' },
    { text: '本子', pinyin: 'ben zi' },
    { text: '练习册', pinyin: 'lian xi ce' },
    { text: '课本', pinyin: 'ke ben' },
    { text: '词典', pinyin: 'ci dian' },
    { text: '字典', pinyin: 'zi dian' },
    { text: '作业本', pinyin: 'zuo ye ben' },
    { text: '红领巾', pinyin: 'hong ling jin' },
    { text: '少先队', pinyin: 'shao xian dui' },
    { text: '课间', pinyin: 'ke jian' },
    { text: '上课', pinyin: 'shang ke' },
    { text: '下课', pinyin: 'xia ke' },
    { text: '早读', pinyin: 'zao du' },
    { text: '自习', pinyin: 'zi xi' },
    { text: '考试', pinyin: 'kao shi' },
    { text: '练习', pinyin: 'lian xi' },
    { text: '预习', pinyin: 'yu xi' },
    { text: '复习', pinyin: 'fu xi' },
    { text: '认真', pinyin: 'ren zhen' },
    { text: '努力', pinyin: 'nu li' },
    { text: '专心', pinyin: 'zhuan xin' },
    { text: '积极', pinyin: 'ji ji' },
    { text: '互助', pinyin: 'hu zhu' },
    { text: '合作', pinyin: 'he zuo' },
    { text: '讨论', pinyin: 'tao lun' },
    { text: '回答', pinyin: 'hui da' },
    { text: '举手', pinyin: 'ju shou' },
    { text: '朗读', pinyin: 'lang du' },
    { text: '背诵', pinyin: 'bei song' },
    { text: '默写', pinyin: 'mo xie' },
    { text: '听写', pinyin: 'ting xie' },
    { text: '批改', pinyin: 'pi gai' },
    { text: '签字', pinyin: 'qian zi' },
    { text: '家长', pinyin: 'jia zhang' },
    { text: '爷爷', pinyin: 'ye ye' },
    { text: '奶奶', pinyin: 'nai nai' },
    { text: '外公', pinyin: 'wai gong' },
    { text: '外婆', pinyin: 'wai po' },
    { text: '哥哥', pinyin: 'ge ge' },
    { text: '姐姐', pinyin: 'jie jie' },
    { text: '弟弟', pinyin: 'di di' },
    { text: '妹妹', pinyin: 'mei mei' },
    { text: '叔叔', pinyin: 'shu shu' },
    { text: '阿姨', pinyin: 'a yi' },
    { text: '早上', pinyin: 'zao shang' },
    { text: '中午', pinyin: 'zhong wu' },
    { text: '晚上', pinyin: 'wan shang' },
    { text: '春天', pinyin: 'chun tian' },
    { text: '夏天', pinyin: 'xia tian' },
    { text: '秋天', pinyin: 'qiu tian' },
    { text: '冬天', pinyin: 'dong tian' },
    { text: '春风', pinyin: 'chun feng' },
    { text: '夏雨', pinyin: 'xia yu' },
    { text: '秋叶', pinyin: 'qiu ye' },
    { text: '冬雪', pinyin: 'dong xue' },
    { text: '阳光', pinyin: 'yang guang' },
    { text: '月亮', pinyin: 'yue liang' },
    { text: '星星', pinyin: 'xing xing' },
    { text: '天空', pinyin: 'tian kong' },
    { text: '蓝天', pinyin: 'lan tian' },
    { text: '白云', pinyin: 'bai yun' },
    { text: '小鸟', pinyin: 'xiao niao' },
    { text: '小狗', pinyin: 'xiao gou' },
    { text: '小猫', pinyin: 'xiao mao' },
    { text: '小兔子', pinyin: 'xiao tu zi' },
    { text: '小鱼', pinyin: 'xiao yu' },
    { text: '花朵', pinyin: 'hua duo' },
    { text: '树木', pinyin: 'shu mu' },
    { text: '森林', pinyin: 'sen lin' },
    { text: '河流', pinyin: 'he liu' },
    { text: '小河', pinyin: 'xiao he' },
    { text: '小溪', pinyin: 'xiao xi' },
    { text: '大海', pinyin: 'da hai' },
    { text: '山峰', pinyin: 'shan feng' },
    { text: '山谷', pinyin: 'shan gu' },
    { text: '草地', pinyin: 'cao di' },
    { text: '花园', pinyin: 'hua yuan' },
    { text: '公园', pinyin: 'gong yuan' },
    { text: '城市', pinyin: 'cheng shi' },
    { text: '乡村', pinyin: 'xiang cun' },
    { text: '马路', pinyin: 'ma lu' },
    { text: '汽车', pinyin: 'qi che' },
    { text: '火车', pinyin: 'huo che' },
    { text: '轮船', pinyin: 'lun chuan' },
    { text: '飞机', pinyin: 'fei ji' },
    { text: '地铁', pinyin: 'di tie' },
    { text: '公交车', pinyin: 'gong jiao che' },
    { text: '红灯', pinyin: 'hong deng' },
    { text: '绿灯', pinyin: 'lv deng' },
    { text: '黄灯', pinyin: 'huang deng' },
    { text: '超市', pinyin: 'chao shi' },
    { text: '商店', pinyin: 'shang dian' },
    { text: '书店', pinyin: 'shu dian' },
    { text: '医院', pinyin: 'yi yuan' },
    { text: '邮局', pinyin: 'you ju' },
    { text: '警察', pinyin: 'jing cha' },
    { text: '医生', pinyin: 'yi sheng' },
    { text: '护士', pinyin: 'hu shi' },
    { text: '售货员', pinyin: 'shou huo yuan' },
    { text: '服务员', pinyin: 'fu wu yuan' },
    { text: '运动', pinyin: 'yun dong' },
    { text: '跑步', pinyin: 'pao bu' },
    { text: '跳绳', pinyin: 'tiao sheng' },
    { text: '踢球', pinyin: 'ti qiu' },
    { text: '打球', pinyin: 'da qiu' },
    { text: '游泳', pinyin: 'you yong' },
    { text: '爬山', pinyin: 'pa shan' },
    { text: '游戏', pinyin: 'you xi' },
    { text: '玩具', pinyin: 'wan ju' },
    { text: '积木', pinyin: 'ji mu' },
    { text: '拼图', pinyin: 'pin tu' },
    { text: '故事书', pinyin: 'gu shi shu' },
    { text: '童话', pinyin: 'tong hua' },
    { text: '笑话', pinyin: 'xiao hua' },
    { text: '谜语', pinyin: 'mi yu' },
    { text: '快乐', pinyin: 'kuai le' },
    { text: '高兴', pinyin: 'gao xing' },
    { text: '伤心', pinyin: 'shang xin' },
    { text: '难过', pinyin: 'nan guo' },
    { text: '生气', pinyin: 'sheng qi' },
    { text: '紧张', pinyin: 'jin zhang' },
    { text: '害怕', pinyin: 'hai pa' },
    { text: '勇敢', pinyin: 'yong gan' },
    { text: '聪明', pinyin: 'cong ming' },
    { text: '勤劳', pinyin: 'qin lao' },
    { text: '善良', pinyin: 'shan liang' },
    { text: '诚实', pinyin: 'cheng shi' },
    { text: '礼貌', pinyin: 'li mao' },
    { text: '热情', pinyin: 're qing' },
    { text: '大方', pinyin: 'da fang' },
    { text: '认真学习', pinyin: 'ren zhen xue xi' },
    { text: '按时完成', pinyin: 'an shi wan cheng' },
    { text: '独立思考', pinyin: 'du li si kao' },
    { text: '互相帮助', pinyin: 'hu xiang bang zhu' },
    { text: '文明礼貌', pinyin: 'wen ming li mao' },
    { text: '讲究卫生', pinyin: 'jiang jiu wei sheng' },
    { text: '爱护公物', pinyin: 'ai hu gong wu' },
    { text: '遵守纪律', pinyin: 'zun shou ji lv' },
    { text: '讲信用', pinyin: 'jiang xin yong' },
    { text: '讲道理', pinyin: 'jiang dao li' }
];

const baseIdiomItems = [
    { text: '自相矛盾', pinyin: 'zi xiang mao dun' },
    { text: '画蛇添足', pinyin: 'hua she tian zu' },
    { text: '守株待兔', pinyin: 'shou zhu dai tu' },
    { text: '亡羊补牢', pinyin: 'wang yang bu lao' },
    { text: '掩耳盗铃', pinyin: 'yan er dao ling' },
    { text: '刻舟求剑', pinyin: 'ke zhou qiu jian' },
    { text: '井底之蛙', pinyin: 'jing di zhi wa' },
    { text: '三心二意', pinyin: 'san xin er yi' },
    { text: '三头六臂', pinyin: 'san tou liu bi' },
    { text: '一心一意', pinyin: 'yi xin yi yi' },
    { text: '一举两得', pinyin: 'yi ju liang de' },
    { text: '一帆风顺', pinyin: 'yi fan feng shun' },
    { text: '一目了然', pinyin: 'yi mu liao ran' },
    { text: '一模一样', pinyin: 'yi mo yi yang' },
    { text: '一丝不苟', pinyin: 'yi si bu gou' },
    { text: '一清二楚', pinyin: 'yi qing er chu' },
    { text: '一箭双雕', pinyin: 'yi jian shuang diao' },
    { text: '一诺千金', pinyin: 'yi nuo qian jin' },
    { text: '一言九鼎', pinyin: 'yi yan jiu ding' },
    { text: '一日千里', pinyin: 'yi ri qian li' },
    { text: '一无所有', pinyin: 'yi wu suo you' },
    { text: '三言两语', pinyin: 'san yan liang yu' },
    { text: '三番五次', pinyin: 'san fan wu ci' },
    { text: '七上八下', pinyin: 'qi shang ba xia' },
    { text: '七嘴八舌', pinyin: 'qi zui ba she' },
    { text: '十全十美', pinyin: 'shi quan shi mei' },
    { text: '十拿九稳', pinyin: 'shi na jiu wen' },
    { text: '百发百中', pinyin: 'bai fa bai zhong' },
    { text: '百依百顺', pinyin: 'bai yi bai shun' },
    { text: '百折不挠', pinyin: 'bai zhe bu nao' },
    { text: '百思不解', pinyin: 'bai si bu jie' },
    { text: '百花齐放', pinyin: 'bai hua qi fang' },
    { text: '千方百计', pinyin: 'qian fang bai ji' },
    { text: '千军万马', pinyin: 'qian jun wan ma' },
    { text: '千言万语', pinyin: 'qian yan wan yu' },
    { text: '千辛万苦', pinyin: 'qian xin wan ku' },
    { text: '万紫千红', pinyin: 'wan zi qian hong' },
    { text: '万众一心', pinyin: 'wan zhong yi xin' },
    { text: '万无一失', pinyin: 'wan wu yi shi' },
    { text: '万事如意', pinyin: 'wan shi ru yi' },
    { text: '才高八斗', pinyin: 'cai gao ba dou' },
    { text: '学富五车', pinyin: 'xue fu wu che' },
    { text: '举一反三', pinyin: 'ju yi fan san' },
    { text: '开门见山', pinyin: 'kai men jian shan' },
    { text: '狐假虎威', pinyin: 'hu jia hu wei' },
    { text: '南辕北辙', pinyin: 'nan yuan bei zhe' },
    { text: '指鹿为马', pinyin: 'zhi lu wei ma' },
    { text: '纸上谈兵', pinyin: 'zhi shang tan bing' },
    { text: '草船借箭', pinyin: 'cao chuan jie jian' },
    { text: '望梅止渴', pinyin: 'wang mei zhi ke' },
    { text: '完璧归赵', pinyin: 'wan bi gui zhao' },
    { text: '东施效颦', pinyin: 'dong shi xiao pin' },
    { text: '画龙点睛', pinyin: 'hua long dian jing' },
    { text: '盲人摸象', pinyin: 'mang ren mo xiang' },
    { text: '滥竽充数', pinyin: 'lan yu chong shu' },
    { text: '愚公移山', pinyin: 'yu gong yi shan' },
    { text: '坐井观天', pinyin: 'zuo jing guan tian' },
    { text: '闻鸡起舞', pinyin: 'wen ji qi wu' },
    { text: '守口如瓶', pinyin: 'shou kou ru ping' },
    { text: '口是心非', pinyin: 'kou shi xin fei' },
    { text: '惊弓之鸟', pinyin: 'jing gong zhi niao' },
    { text: '如虎添翼', pinyin: 'ru hu tian yi' },
    { text: '见仁见智', pinyin: 'jian ren jian zhi' },
    { text: '居安思危', pinyin: 'ju an si wei' },
    { text: '未雨绸缪', pinyin: 'wei yu chou mou' },
    { text: '胸有成竹', pinyin: 'xiong you cheng zhu' },
    { text: '破釜沉舟', pinyin: 'po fu chen zhou' },
    { text: '四面楚歌', pinyin: 'si mian chu ge' },
    { text: '负荆请罪', pinyin: 'fu jing qing zui' },
    { text: '卧薪尝胆', pinyin: 'wo xin chang dan' },
    { text: '百闻不如', pinyin: 'bai wen bu ru' },
    { text: '目不转睛', pinyin: 'mu bu zhuan jing' },
    { text: '大公无私', pinyin: 'da gong wu si' },
    { text: '拾金不昧', pinyin: 'shi jin bu mei' },
    { text: '见义勇为', pinyin: 'jian yi yong wei' },
    { text: '助人为乐', pinyin: 'zhu ren wei le' },
    { text: '尊老爱幼', pinyin: 'zun lao ai you' },
    { text: '勤学好问', pinyin: 'qin xue hao wen' },
    { text: '勤能补拙', pinyin: 'qin neng bu zhuo' },
    { text: '孜孜不倦', pinyin: 'zi zi bu juan' },
    { text: '持之以恒', pinyin: 'chi zhi yi heng' },
    { text: '知错就改', pinyin: 'zhi cuo jiu gai' },
    { text: '实事求是', pinyin: 'shi shi qiu shi' },
    { text: '任劳任怨', pinyin: 'ren lao ren yuan' },
    { text: '光明磊落', pinyin: 'guang ming lei luo' },
    { text: '一视同仁', pinyin: 'yi shi tong ren' },
    { text: '大智若愚', pinyin: 'da zhi ruo yu' },
    { text: '谦虚谨慎', pinyin: 'qian xu jin shen' },
    { text: '同甘共苦', pinyin: 'tong gan gong ku' },
    { text: '顾全大局', pinyin: 'gu quan da ju' },
    { text: '百折不挠', pinyin: 'bai zhe bu nao' },
    { text: '坚韧不拔', pinyin: 'jian ren bu ba' },
    { text: '奋发向上', pinyin: 'fen fa xiang shang' },
    { text: '积极进取', pinyin: 'ji ji jin qu' },
    { text: '自立自强', pinyin: 'zi li zi qiang' }
];

const baseItems = baseWordItems.concat(baseIdiomItems);

const questionBank = [];
while (questionBank.length < 1000) {
    const item = baseItems[questionBank.length % baseItems.length];
    questionBank.push(item);
}

const modeCharToPinyinButton = document.getElementById('mode-char-to-pinyin');
const modePinyinToCharButton = document.getElementById('mode-pinyin-to-char');
const modeDescriptionElement = document.getElementById('mode-description');
const scoreInfoElement = document.getElementById('score-info');
const statusElement = document.getElementById('status');
const questionLabelElement = document.getElementById('question-label');
const questionTextElement = document.getElementById('question-text');
const inputAreaElement = document.getElementById('input-area');
const pinyinInputElement = document.getElementById('pinyin-input');
const submitButton = document.getElementById('submit-btn');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-btn');
const backButton = document.getElementById('back-btn');
const questionCountInput = document.getElementById('question-count');
const keyboardElement = document.getElementById('keyboard');

let currentMode = MODE_CHAR_TO_PINYIN;
let currentItem = null;
let currentOptions = [];
let score = 0;
let total = 0;
let answered = false;
let questionLimit = 10;
let sessionFinished = false;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function normalizePinyin(value) {
    return value.toLowerCase().replace(/[^a-z]/g, '');
}

function updateScoreInfo() {
    scoreInfoElement.textContent = `正确题数：${score} / ${total}（本轮上限：${questionLimit}）`;
}

function endSession() {
    sessionFinished = true;
    const base = questionLimit > 0 ? questionLimit : total;
    const denominator = base > 0 ? base : 1;
    const percent = Math.round((score * 100) / denominator);
    statusElement.textContent = `本轮结束：共答 ${total} 题，答对 ${score} 题，正确率 ${percent}%。点击“下一题”开始新一轮。`;
}

function checkSessionEnd() {
    if (!sessionFinished && total >= questionLimit) {
        endSession();
    }
}

function setMode(mode) {
    currentMode = mode;
    modeCharToPinyinButton.classList.toggle('active', mode === MODE_CHAR_TO_PINYIN);
    modePinyinToCharButton.classList.toggle('active', mode === MODE_PINYIN_TO_CHAR);
    if (mode === MODE_CHAR_TO_PINYIN) {
        modeDescriptionElement.textContent = '模式：根据汉字输入正确的拼音';
        questionLabelElement.textContent = '汉字：';
        inputAreaElement.style.display = 'flex';
        optionsContainer.style.display = 'none';
        if (keyboardElement) {
            keyboardElement.style.display = 'flex';
        }
    } else {
        modeDescriptionElement.textContent = '模式：根据拼音选择正确的词语';
        questionLabelElement.textContent = '拼音：';
        inputAreaElement.style.display = 'none';
        optionsContainer.style.display = 'grid';
        if (keyboardElement) {
            keyboardElement.style.display = 'none';
        }
    }
    answered = false;
    statusElement.textContent = '';
    loadNextQuestion();
}

function pickRandomItem() {
    const index = Math.floor(Math.random() * questionBank.length);
    return questionBank[index];
}

function renderCharToPinyinQuestion() {
    currentItem = pickRandomItem();
    questionTextElement.textContent = currentItem.text;
    pinyinInputElement.value = '';
    statusElement.textContent = '';
    answered = false;
}

function renderPinyinToCharQuestion() {
    currentItem = pickRandomItem();
    questionTextElement.textContent = currentItem.pinyin;
    optionsContainer.innerHTML = '';
    const options = [currentItem];
    const pool = questionBank.filter(item => item !== currentItem);
    shuffle(pool);
    for (let i = 0; i < pool.length && options.length < 4; i++) {
        const candidate = pool[i];
        if (!options.includes(candidate)) {
            options.push(candidate);
        }
    }
    shuffle(options);
    currentOptions = options;
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option.text;
        button.addEventListener('click', () => handleOptionClick(option, button));
        optionsContainer.appendChild(button);
    });
    statusElement.textContent = '';
    answered = false;
}

function loadNextQuestion() {
    if (currentMode === MODE_CHAR_TO_PINYIN) {
        renderCharToPinyinQuestion();
    } else {
        renderPinyinToCharQuestion();
    }
}

function handleSubmit() {
    if (sessionFinished) {
        statusElement.textContent = '本轮已结束，请点击“下一题”开始新一轮。';
        return;
    }
    if (answered) {
        return;
    }
    const userInput = pinyinInputElement.value.trim();
    if (!userInput) {
        statusElement.textContent = '请先输入拼音。';
        return;
    }
    const userNorm = normalizePinyin(userInput);
    const answerNorm = normalizePinyin(currentItem.pinyin);
    total += 1;
    if (userNorm === answerNorm) {
        score += 1;
        statusElement.textContent = '回答正确！';
    } else {
        statusElement.textContent = `回答错误，正确拼音是：${currentItem.pinyin}`;
    }
    answered = true;
    updateScoreInfo();
    checkSessionEnd();
}

function handleOptionClick(option, button) {
    if (sessionFinished) {
        statusElement.textContent = '本轮已结束，请点击“下一题”开始新一轮。';
        return;
    }
    if (answered) {
        return;
    }
    const buttons = optionsContainer.querySelectorAll('.option-button');
    buttons.forEach(b => {
        b.disabled = true;
    });
    total += 1;
    if (option === currentItem) {
        score += 1;
        button.classList.add('correct');
        statusElement.textContent = '回答正确！';
    } else {
        button.classList.add('wrong');
        statusElement.textContent = `回答错误，正确答案是：${currentItem.text}`;
        buttons.forEach(b => {
            if (b.textContent === currentItem.text) {
                b.classList.add('correct');
            }
        });
    }
    answered = true;
    updateScoreInfo();
    checkSessionEnd();
}

modeCharToPinyinButton.addEventListener('click', () => {
    setMode(MODE_CHAR_TO_PINYIN);
});

modePinyinToCharButton.addEventListener('click', () => {
    setMode(MODE_PINYIN_TO_CHAR);
});

submitButton.addEventListener('click', () => {
    if (currentMode === MODE_CHAR_TO_PINYIN) {
        handleSubmit();
    }
});

pinyinInputElement.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        handleSubmit();
    }
});

nextButton.addEventListener('click', () => {
    if (sessionFinished || total >= questionLimit) {
        let value = parseInt(questionCountInput.value, 10);
        if (isNaN(value) || value < 5) {
            value = 5;
        }
        if (value > 50) {
            value = 50;
        }
        questionCountInput.value = String(value);
        questionLimit = value;
        score = 0;
        total = 0;
        answered = false;
        sessionFinished = false;
        statusElement.textContent = '';
        updateScoreInfo();
    }
    loadNextQuestion();
});

backButton.addEventListener('click', () => {
    window.location.href = '../index.html';
});

if (questionCountInput) {
    let value = parseInt(questionCountInput.value, 10);
    if (!isNaN(value)) {
        questionLimit = value;
    }
}

if (questionCountInput) {
    questionCountInput.addEventListener('change', () => {
        let value = parseInt(questionCountInput.value, 10);
        if (isNaN(value) || value < 5) {
            value = 5;
        }
        if (value > 50) {
            value = 50;
        }
        questionCountInput.value = String(value);
        questionLimit = value;
        updateScoreInfo();
    });
}

if (keyboardElement) {
    keyboardElement.addEventListener('click', event => {
        const target = event.target;
        if (!target || target.tagName !== 'BUTTON') {
            return;
        }
        const key = target.getAttribute('data-key');
        if (!key) {
            return;
        }
        if (currentMode !== MODE_CHAR_TO_PINYIN) {
            return;
        }
        if (key === 'BACKSPACE') {
            const value = pinyinInputElement.value;
            pinyinInputElement.value = value.slice(0, -1);
            pinyinInputElement.focus();
            return;
        }
        if (key === 'SPACE') {
            pinyinInputElement.value += ' ';
            pinyinInputElement.focus();
            return;
        }
        if (key === 'CLEAR') {
            pinyinInputElement.value = '';
            pinyinInputElement.focus();
            return;
        }
        pinyinInputElement.value += key;
        pinyinInputElement.focus();
    });
}

modeDescriptionElement.textContent = '';
scoreInfoElement.textContent = '';
statusElement.textContent = '';
questionLabelElement.textContent = '';
updateScoreInfo();
setMode(MODE_CHAR_TO_PINYIN);
