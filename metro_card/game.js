// 北京地铁基础数据
// 北京地铁截至2025年1月29条线路522座车站最新数据（部分示例，实际应补全全部数据）
// 添加istransfer属性：1表示换乘站（线路数>1），0表示非换乘站
const metroData = {
  stations: [
    { name: "环球度假区", lines:[1, 7], cardmode: 1, istransfer: 1},
    { name: "花庄", lines: [1, 7], cardmode: 1, istransfer: 1},
    { name: "土桥", lines: [1], cardmode: 0, istransfer: 0},
    { name: "临河里", lines: [1], cardmode: 0, istransfer: 0},
    { name: "梨园", lines: [1], cardmode: 0, istransfer: 0},
    { name: "九棵树", lines: [1], cardmode: 0, istransfer: 0},
    { name: "果园", lines: [1], cardmode: 0, istransfer: 0},
    { name: "通州北苑", lines: [1], cardmode: 0, istransfer: 0},
    { name: "八里桥", lines: [1], cardmode: 0, istransfer: 0},
    { name: "管庄", lines: [1], cardmode: 0, istransfer: 0},
    { name: "双桥", lines: [1], cardmode: 0, istransfer: 0},
    { name: "传媒大学", lines: [1], cardmode: 0, istransfer: 0},
    { name: "高碑店", lines: [1], cardmode: 0, istransfer: 0},
    { name: "四惠东", lines: [1], cardmode: 0, istransfer: 0},
    { name: "四惠", lines: [1], cardmode: 0, istransfer: 0},
    { name: "大望路", lines: [1, 14], cardmode: 1, istransfer: 1},
    { name: "国贸", lines: [1, 10], cardmode: 1, istransfer: 1},
    { name: "永安里", lines: [1], cardmode: 0, istransfer: 0},
    { name: "建国门", lines: [1, 2], cardmode: 1, istransfer: 1},
    { name: "东单", lines: [1, 5], cardmode: 1, istransfer: 1},
    { name: "王府井", lines: [1, 8], cardmode: 1, istransfer: 1},
    { name: "天安门东", lines: [1], cardmode: 1, istransfer: 0},
    { name: "天安门西", lines: [1], cardmode: 1, istransfer: 0},
    { name: "西单", lines: [1, 4], cardmode: 1, istransfer: 1},
    { name: "复兴门", lines: [1, 2], cardmode: 1, istransfer: 1},
    { name: "南礼士路", lines: [1], cardmode: 0, istransfer: 0},
    { name: "木樨地", lines: [1, 16], cardmode: 0, istransfer: 1},
    { name: "军事博物馆", lines: [1, 9], cardmode: 1, istransfer: 1},
    { name: "公主坟", lines: [1, 10], cardmode: 1, istransfer: 1},
    { name: "万寿路", lines: [1], cardmode: 0, istransfer: 0},
    { name: "五棵松", lines: [1], cardmode: 0, istransfer: 0},
    { name: "玉泉路", lines: [1], cardmode: 0, istransfer: 0},
    { name: "八宝山", lines: [1], cardmode: 0, istransfer: 0},
    { name: "八角游乐园", lines: [1], cardmode: 0, istransfer: 0},
    { name: "古城", lines: [1], cardmode: 0, istransfer: 0},
    { name: "苹果园", lines: [1, "S1"], cardmode: 1, istransfer: 1},
    { name: "东直门", lines: [2, 13, "sdjc"], cardmode: 1, istransfer: 1},
    { name: "雍和宫", lines: [2, 5], cardmode: 1, istransfer: 1},
    { name: "安定门", lines: [2], cardmode: 0, istransfer: 0},
    { name: "鼓楼大街", lines: [2, 8], cardmode: 1, istransfer: 1},
    { name: "积水潭", lines: [2, 19], cardmode: 1, istransfer: 1},
    { name: "西直门", lines: [2, 4, 13], cardmode: 1, istransfer: 1},
    { name: "车公庄", lines: [2, 6], cardmode: 1, istransfer: 1},
    { name: "阜成门", lines: [2], cardmode: 0, istransfer: 0},
    { name: "长椿街", lines: [2], cardmode: 0, istransfer: 0},
    { name: "宣武门", lines: [2, 4], cardmode: 1, istransfer: 1},
    { name: "和平门", lines: [2], cardmode: 0, istransfer: 0},
    { name: "前门", lines: [2, 8], cardmode: 1, istransfer: 1},
    { name: "崇文门", lines: [2, 5], cardmode: 1, istransfer: 1},
    { name: "北京站", lines: [2], cardmode: 1, istransfer: 0},
    { name: "朝阳门", lines: [2, 6], cardmode: 1, istransfer: 1},
    { name: "东四十条", lines: [2, 3], cardmode: 0, istransfer: 1},
    { name: "东坝北", lines: [3, 12], cardmode: 0, istransfer: 1},
    { name: "东坝", lines: [3], cardmode: 0, istransfer: 0},
    { name: "东坝南", lines: [3], cardmode: 0, istransfer: 0},
    { name: "姚家园", lines: [3], cardmode: 0, istransfer: 0},
    { name: "朝阳站", lines: [3], cardmode: 0, istransfer: 0},
    { name: "石佛营", lines: [3], cardmode: 0, istransfer: 0},
    { name: "朝阳公园", lines: [3, 14], cardmode: 1, istransfer: 1},
    { name: "团结湖", lines: [3, 10], cardmode: 0, istransfer: 1},
    { name: "工人体育场", lines: [3, 17], cardmode: 0, istransfer: 1},
    { name: "安河桥北", lines: [4], cardmode: 0, istransfer: 0},
    { name: "北宫门", lines: [4], cardmode: 1, istransfer: 0},
    { name: "西苑", lines: [4, 16], cardmode: 1, istransfer: 1},
    { name: "圆明园", lines: [4], cardmode: 1, istransfer: 0},
    { name: "北京大学东门", lines: [4], cardmode: 1, istransfer: 0},
    { name: "中关村", lines: [4], cardmode: 0, istransfer: 0},
    { name: "海淀黄庄", lines: [4, 10], cardmode: 1, istransfer: 1},
    { name: "人民大学", lines: [4, 12], cardmode: 0, istransfer: 1},
    { name: "魏公村", lines: [4], cardmode: 0, istransfer: 0},
    { name: "国家图书馆", lines: [4, 9, 16], cardmode: 1, istransfer: 1},
    { name: "动物园", lines: [4], cardmode: 1, istransfer: 0},
    { name: "新街口", lines: [4], cardmode: 0, istransfer: 0},
    { name: "平安里", lines: [4, 6, 19], cardmode: 1, istransfer: 1},
    { name: "西四", lines: [4], cardmode: 0, istransfer: 0},
    { name: "灵境胡同", lines: [4], cardmode: 0, istransfer: 0},
    { name: "菜市口", lines: [4, 7], cardmode: 1, istransfer: 1},
    { name: "陶然亭", lines: [4], cardmode: 0, istransfer: 0},
    { name: "北京南站", lines: [4, 14], cardmode: 1, istransfer: 1},
    { name: "马家堡", lines: [4], cardmode: 0, istransfer: 0},
    { name: "角门西", lines: [4, 10], cardmode: 1, istransfer: 1},
    { name: "公益西桥", lines: [4], cardmode: 0, istransfer: 0},
    { name: "新宫", lines: [4], cardmode: 1, istransfer: 0},
    { name: "西红门", lines: [4], cardmode: 0, istransfer: 0},
    { name: "高米店北", lines: [4], cardmode: 0, istransfer: 0},
    { name: "高米店", lines: [4], cardmode: 0, istransfer: 0},
    { name: "高米店南", lines: [4], cardmode: 0, istransfer: 0},
    { name: "枣园", lines: [4], cardmode: 0, istransfer: 0},
    { name: "清源路", lines: [4], cardmode: 0, istransfer: 0},
    { name: "黄村西大街", lines: [4], cardmode: 0, istransfer: 0},
    { name: "黄村火车站", lines: [4], cardmode: 0, istransfer: 0},
    { name: "义和庄", lines: [4], cardmode: 0, istransfer: 0},
    { name: "生物医药基地", lines: [4], cardmode: 0, istransfer: 0},
    { name: "天宫院", lines: [4], cardmode: 0, istransfer: 0},
    { name: "天通苑北", lines: [5], cardmode: 0, istransfer: 0},
    { name: "天通苑", lines: [5], cardmode: 0, istransfer: 0},
    { name: "天通苑南", lines: [5], cardmode: 0, istransfer: 0},
    { name: "立水桥", lines: [5, 13], cardmode: 1, istransfer: 1},
    { name: "立水桥南", lines: [5], cardmode: 0, istransfer: 0},
    { name: "北苑路北", lines: [5], cardmode: 0, istransfer: 0},
    { name: "大屯路东", lines: [5, 15], cardmode: 1, istransfer: 1},
    { name: "惠新西街北口", lines: [5], cardmode: 0, istransfer: 0},
    { name: "惠新西街南口", lines: [5, 10], cardmode: 1, istransfer: 1},
    { name: "和平西桥", lines: [5, 12], cardmode: 0, istransfer: 1},
    { name: "和平里北街", lines: [5], cardmode: 0, istransfer: 0},
    { name: "北新桥", lines: [5, "sdjc"], cardmode: 1, istransfer: 1},
    { name: "张自忠路", lines: [5], cardmode: 0, istransfer: 0},
    { name: "东四", lines: [5, 6], cardmode: 1, istransfer: 1},
    { name: "灯市口", lines: [5], cardmode: 0, istransfer: 0},
    { name: "磁器口", lines: [5, 7], cardmode: 1, istransfer: 1},
    { name: "天坛东门", lines: [5], cardmode: 1, istransfer: 0},
    { name: "蒲黄榆", lines: [5, 14], cardmode: 1, istransfer: 1},
    { name: "刘家窑", lines: [5], cardmode: 0, istransfer: 0},
    { name: "宋家庄", lines: [5, 10, "yz"], cardmode: 1, istransfer: 1},
    { name: "潞城", lines: [6], cardmode: 0, istransfer: 0},
    { name: "东夏园", lines: [6], cardmode: 0, istransfer: 0},
    { name: "郝家府", lines: [6], cardmode: 0, istransfer: 0},
    { name: "北运河东", lines: [6], cardmode: 0, istransfer: 0},
    { name: "北运河西", lines: [6], cardmode: 0, istransfer: 0},
    { name: "通运门", lines: [6], cardmode: 0, istransfer: 0},
    { name: "通州北关", lines: [6], cardmode: 0, istransfer: 0},
    { name: "物资学院路", lines: [6], cardmode: 0, istransfer: 0},
    { name: "草房", lines: [6], cardmode: 0, istransfer: 0},
    { name: "常营", lines: [6], cardmode: 0, istransfer: 0},
    { name: "黄渠", lines: [6], cardmode: 0, istransfer: 0},
    { name: "褡裢坡", lines: [6], cardmode: 0, istransfer: 0},
    { name: "青年路", lines: [6], cardmode: 0, istransfer: 0},
    { name: "十里堡", lines: [6], cardmode: 0, istransfer: 0},
    { name: "金台路", lines: [6, 14], cardmode: 1, istransfer: 1},
    { name: "呼家楼", lines: [6, 10], cardmode: 1, istransfer: 1},
    { name: "东大桥", lines: [6], cardmode: 1, istransfer: 0},
    { name: "南锣鼓巷", lines: [6, 8], cardmode:1, istransfer: 1},
    { name: "北海北", lines: [6], cardmode: 1, istransfer: 0},
    { name: "车公庄西", lines: [6], cardmode: 0, istransfer: 0},
    { name: "二里沟", lines: [6, 16], cardmode: 0, istransfer: 1},
    { name: "白石桥南", lines: [6, 9], cardmode: 1, istransfer: 1},
    { name: "花园桥", lines: [6], cardmode: 0, istransfer: 0},
    { name: "慈寿寺", lines: [6, 10], cardmode: 1, istransfer: 1},
    { name: "海淀五路居", lines: [6], cardmode: 0, istransfer: 0},
    { name: "田村", lines: [6], cardmode: 0, istransfer: 0},
    { name: "廖公庄", lines: [6], cardmode: 0, istransfer: 0},
    { name: "西黄村", lines: [6], cardmode: 0, istransfer: 0},
    { name: "杨庄", lines: [6], cardmode: 0, istransfer: 0},
    { name: "金安桥", lines: [6, 11, "S1"], cardmode: 0, istransfer: 1},
    { name: "高楼金", lines: [7], cardmode: 0, istransfer: 0},
    { name: "群芳", lines: [7], cardmode: 0, istransfer: 0},
    { name: "万盛东", lines: [7], cardmode: 0, istransfer: 0},
    { name: "万盛西", lines: [7], cardmode: 0, istransfer: 0},
    { name: "黑庄户", lines: [7], cardmode: 0, istransfer: 0},
    { name: "郎辛庄", lines: [7], cardmode: 0, istransfer: 0},
    { name: "黄厂", lines: [7], cardmode: 0, istransfer: 0},
    { name: "焦化厂", lines: [7], cardmode: 0, istransfer: 0},
    { name: "双合", lines: [7], cardmode: 0, istransfer: 0},
    { name: "垡头", lines: [7], cardmode: 0, istransfer: 0},
    { name: "欢乐谷景区", lines: [7], cardmode: 0, istransfer: 0},
    { name: "南楼梓庄", lines: [7], cardmode: 0, istransfer: 0},
    { name: "化工", lines: [7], cardmode: 0, istransfer: 0},
    { name: "百子湾", lines: [7], cardmode: 0, istransfer: 0},
    { name: "大郊亭", lines: [7], cardmode: 0, istransfer: 0},
    { name: "九龙山", lines: [7, 14], cardmode: 1, istransfer: 1},
    { name: "双井", lines: [7, 10], cardmode: 1, istransfer: 1},
    { name: "广渠门外", lines: [7], cardmode: 0, istransfer: 0},
    { name: "广渠门内", lines: [7], cardmode: 0, istransfer: 0},
    { name: "桥湾", lines: [7], cardmode: 0, istransfer: 0},
    { name: "珠市口", lines: [7, 8], cardmode: 1, istransfer: 1},
    { name: "虎坊桥", lines: [7], cardmode: 0, istransfer: 0},
    { name: "广安门内", lines: [7], cardmode: 0, istransfer: 0},
    { name: "达官营", lines: [7, 16], cardmode: 0, istransfer: 1},
    { name: "湾子", lines: [7], cardmode: 0, istransfer: 0},
    { name: "北京西站", lines: [7, 9], cardmode: 1, istransfer: 1},
    { name: "朱辛庄", lines: [8, "cp"], cardmode: 1, istransfer: 1},
    { name: "育知路", lines: [8], cardmode: 0, istransfer: 0},
    { name: "平西府", lines: [8], cardmode: 0, istransfer: 0},
    { name: "回龙观东大街", lines: [8], cardmode: 0, istransfer: 0},
    { name: "霍营", lines: [8, 13], cardmode: 1, istransfer: 1},
    { name: "育新", lines: [8], cardmode: 0, istransfer: 0},
    { name: "西小口", lines: [8], cardmode: 0, istransfer: 0},
    { name: "永泰庄", lines: [8], cardmode: 0, istransfer: 0},
    { name: "林萃桥", lines: [8], cardmode: 0, istransfer: 0},
    { name: "森林公园南门", lines: [8], cardmode: 0, istransfer: 0},
    { name: "奥林匹克公园", lines: [8, 15], cardmode:1, istransfer: 1},
    { name: "奥体中心", lines: [8], cardmode: 0, istransfer: 0},
    { name: "北土城", lines: [8, 10], cardmode: 1, istransfer: 1},
    { name: "安华桥", lines: [8, 12], cardmode: 0, istransfer: 1},
    { name: "安德里北街", lines: [8], cardmode: 0, istransfer: 0},
    { name: "什刹海", lines: [8], cardmode: 1, istransfer: 0},
    { name: "中国美术馆", lines: [8], cardmode: 1, istransfer: 0},
    { name: "金鱼胡同", lines: [8], cardmode: 0, istransfer: 0},
    { name: "天桥", lines: [8], cardmode: 0, istransfer: 0},
    { name: "永定门外", lines: [8, 14], cardmode: 1, istransfer: 1},
    { name: "木樨园", lines: [8], cardmode: 0, istransfer: 0},
    { name: "海户屯", lines: [8], cardmode: 0, istransfer: 0},
    { name: "大红门南", lines: [8], cardmode: 0, istransfer: 0},
    { name: "和义", lines: [8], cardmode: 0, istransfer: 0},
    { name: "东高地", lines: [8], cardmode: 0, istransfer: 0},
    { name: "火箭万源", lines: [8], cardmode: 0, istransfer: 0},
    { name: "五福堂", lines: [8], cardmode: 0, istransfer: 0},
    { name: "德茂", lines: [8], cardmode: 0, istransfer: 0},
    { name: "瀛海", lines: [8], cardmode: 0, istransfer: 0},
    { name: "白锥子", lines: [9], cardmode: 0, istransfer: 0},
    { name: "六里桥东", lines: [9], cardmode: 0, istransfer: 0},
    { name: "六里桥", lines: [9, 10], cardmode: 1, istransfer: 1},
    { name: "七里庄", lines: [9, 14], cardmode: 1, istransfer: 1},
    { name: "丰台东大街", lines: [9], cardmode: 0, istransfer: 0},
    { name: "丰台南路", lines: [9, 16], cardmode: 0, istransfer: 1},
    { name: "科怡路", lines: [9], cardmode: 0, istransfer: 0},
    { name: "丰台科技园", lines: [9], cardmode: 0, istransfer: 0},
    { name: "郭公庄", lines: [9, "fs"], cardmode: 0, istransfer: 1},
    { name: "苏州街", lines: [10, 16], cardmode: 0, istransfer: 1},
    { name: "巴沟", lines: [10, "xj"], cardmode: 0, istransfer: 1},
    { name: "火器营", lines: [10], cardmode: 0, istransfer: 0},
    { name: "长春桥", lines: [10, 12], cardmode: 0, istransfer: 1},
    { name: "车道沟", lines: [10], cardmode: 0, istransfer: 0},
    { name: "西钓鱼台", lines: [10], cardmode: 0, istransfer: 0},
    { name: "莲花桥", lines: [10], cardmode: 0, istransfer: 0},
    { name: "西局", lines: [10, 14], cardmode: 1, istransfer: 1},
    { name: "泥洼", lines: [10], cardmode: 0, istransfer: 0},
    { name: "丰台站", lines: [10, 16], cardmode: 0, istransfer: 1},
    { name: "首经贸", lines: [10, "fs"], cardmode: 0, istransfer: 1},
    { name: "纪家庙", lines: [10], cardmode: 0, istransfer: 0},
    { name: "草桥", lines: [10, 19, "dxjc"], cardmode: 1, istransfer: 1},
    { name: "角门东", lines: [10], cardmode: 0, istransfer: 0},
    { name: "大红门", lines: [10], cardmode: 0, istransfer: 0},
    { name: "石榴庄", lines: [10], cardmode: 0, istransfer: 0},
    { name: "成寿寺", lines: [10], cardmode: 0, istransfer: 0},
    { name: "分钟寺", lines: [10], cardmode: 0, istransfer: 0},
    { name: "十里河", lines: [10, 14, 17], cardmode: 1, istransfer: 1},
    { name: "潘家园", lines: [10], cardmode: 0, istransfer: 0},
    { name: "劲松", lines: [10], cardmode: 0, istransfer: 0},
    { name: "金台夕照", lines: [10], cardmode: 1, istransfer: 0},
    { name: "农业展览馆", lines: [10], cardmode: 0, istransfer: 0},
    { name: "亮马桥", lines: [10], cardmode: 0, istransfer: 0},
    { name: "三元桥", lines: [10, 12, "sdjc"], cardmode: 1, istransfer: 1},
    { name: "太阳宫", lines: [10, 17], cardmode: 0, istransfer: 1},
    { name: "芍药居", lines: [10, 13], cardmode: 1, istransfer: 1},
    { name: "安贞门", lines: [10], cardmode: 0, istransfer: 0},
    { name: "健德门", lines: [10], cardmode: 0, istransfer: 0},
    { name: "牡丹园", lines: [10, 19], cardmode: 1, istransfer: 1},
    { name: "西土城", lines: [10, "cp"], cardmode: 0, istransfer: 1},
    { name: "知春路", lines: [10, 13], cardmode: 1, istransfer: 1},
    { name: "知春里", lines: [10], cardmode: 0, istransfer: 0},
    { name: "新首钢", lines: [11], cardmode: 0, istransfer: 0},
    { name: "北辛安", lines: [11], cardmode: 0, istransfer: 0},
    { name: "模式口", lines: [11], cardmode: 0, istransfer: 0},
    { name: "四季青桥", lines: [12], cardmode: 0, istransfer: 0},
    { name: "蓝靛厂", lines: [12], cardmode: 0, istransfer: 0},
    { name: "苏州桥", lines: [12], cardmode: 0, istransfer: 0},
    { name: "大钟寺", lines: [12, 13], cardmode: 0, istransfer: 1},
    { name: "蓟门桥", lines: [12, "cp"], cardmode: 0, istransfer: 1},
    { name: "北太平庄", lines: [12, 19], cardmode: 0, istransfer: 1},
    { name: "马甸桥", lines: [12], cardmode: 0, istransfer: 0},
    { name: "安贞桥", lines: [12], cardmode: 0, istransfer: 0},
    { name: "光熙门", lines: [12, 13], cardmode: 0, istransfer: 1},
    { name: "西坝河", lines: [12, 17], cardmode: 0, istransfer: 1},
    { name: "将台西", lines: [12], cardmode: 0, istransfer: 0},
    { name: "高家园", lines: [12], cardmode: 0, istransfer: 0},
    { name: "驼房营", lines: [12], cardmode: 0, istransfer: 0},
    { name: "东坝西", lines: [12], cardmode: 0, istransfer: 0},
    { name: "五道口", lines: [13], cardmode: 0, istransfer: 0},
    { name: "上地", lines: [13], cardmode: 0, istransfer: 0},
    { name: "清河站", lines: [13, "cp"], cardmode: 1, istransfer: 1},
    { name: "西二旗", lines: [13, "cp"], cardmode: 1, istransfer: 1},
    { name: "龙泽", lines: [13], cardmode: 0, istransfer: 0},
    { name: "回龙观", lines: [13], cardmode: 0, istransfer: 0},
    { name: "北苑", lines: [13], cardmode: 0, istransfer: 0},
    { name: "望京西", lines: [13, 15], cardmode: 1, istransfer: 1},
    { name: "柳芳", lines: [13], cardmode: 0, istransfer: 0},
    { name: "善各庄", lines: [14], cardmode: 0, istransfer: 0},
    { name: "来广营", lines: [14], cardmode: 0, istransfer: 0},
    { name: "东湖渠", lines: [14], cardmode: 0, istransfer: 0},
    { name: "望京", lines: [14, 15], cardmode: 1, istransfer: 1},
    { name: "阜通", lines: [14], cardmode: 0, istransfer: 0},
    { name: "望京南", lines: [14], cardmode: 0, istransfer: 0},
    { name: "将台", lines: [14], cardmode: 0, istransfer: 0},
    { name: "东风北桥", lines: [14], cardmode: 0, istransfer: 0},
    { name: "枣营", lines: [14], cardmode: 0, istransfer: 0},
    { name: "平乐园", lines: [14], cardmode: 0, istransfer: 0},
    { name: "北工大西门", lines: [14], cardmode: 0, istransfer: 0},
    { name: "方庄", lines: [14], cardmode: 0, istransfer: 0},
    { name: "景泰", lines: [14], cardmode: 0, istransfer: 0},
    { name: "陶然桥", lines: [14], cardmode: 0, istransfer: 0},
    { name: "景风门", lines: [14, 19], cardmode: 1, istransfer: 1},
    { name: "西铁营", lines: [14], cardmode: 0, istransfer: 0},
    { name: "菜户营", lines: [14], cardmode: 0, istransfer: 0},
    { name: "丽泽商务区", lines: [14], cardmode: 0, istransfer: 0},
    { name: "东管头", lines: [14], cardmode: 0, istransfer: 0},
    { name: "大井", lines: [14], cardmode: 0, istransfer: 0},
    { name: "郭庄子", lines: [14], cardmode: 0, istransfer: 0},
    { name: "大瓦窑", lines: [14], cardmode: 0, istransfer: 0},
    { name: "园博园", lines: [14], cardmode: 0, istransfer: 0},
    { name: "张郭庄", lines: [14], cardmode: 0, istransfer: 0},
    { name: "俸伯", lines: [15], cardmode: 0, istransfer: 0},
    { name: "顺义", lines: [15], cardmode: 0, istransfer: 0},
    { name: "石门", lines: [15], cardmode: 0, istransfer: 0},
    { name: "南法信", lines: [15], cardmode: 0, istransfer: 0},
    { name: "后沙峪", lines: [15], cardmode: 0, istransfer: 0},
    { name: "花梨坎", lines: [15], cardmode: 0, istransfer: 0},
    { name: "国展", lines: [15], cardmode: 0, istransfer: 0},
    { name: "孙河", lines: [15], cardmode: 0, istransfer: 0},
    { name: "马泉营", lines: [15], cardmode: 0, istransfer: 0},
    { name: "崔各庄", lines: [15], cardmode: 0, istransfer: 0},
    { name: "望京东", lines: [15], cardmode: 0, istransfer: 0},
    { name: "关庄", lines: [15], cardmode: 0, istransfer: 0},
    { name: "安立路", lines: [15], cardmode: 0, istransfer: 0},
    { name: "北沙滩", lines: [15], cardmode: 0, istransfer: 0},
    { name: "六道口", lines: [15, "cp"], cardmode: 0, istransfer: 1},
    { name: "清华东路西口", lines: [15], cardmode: 0, istransfer: 0},
    { name: "北安河", lines: [16], cardmode: 0, istransfer: 0},
    { name: "温阳路", lines: [16], cardmode: 0, istransfer: 0},
    { name: "稻香湖路", lines: [16], cardmode: 0, istransfer: 0},
    { name: "屯佃", lines: [16], cardmode: 0, istransfer: 0},
    { name: "永丰", lines: [16], cardmode: 0, istransfer: 0},
    { name: "永丰南", lines: [16], cardmode: 0, istransfer: 0},
    { name: "西北旺", lines: [16], cardmode: 0, istransfer: 0},
    { name: "马连洼", lines: [16], cardmode: 0, istransfer: 0},
    { name: "农大南路", lines: [16], cardmode: 0, istransfer: 0},
    { name: "万泉河桥", lines: [16], cardmode: 0, istransfer: 0},
    { name: "万寿寺", lines: [16], cardmode: 0, istransfer: 0},
    { name: "甘家口", lines: [16], cardmode: 0, istransfer: 0},
    { name: "玉渊潭东门", lines: [16], cardmode: 0, istransfer: 0},
    { name: "红莲南路", lines: [16], cardmode: 0, istransfer: 0},
    { name: "东管头南", lines: [16, "fs"], cardmode: 0, istransfer: 1},
    { name: "富丰桥", lines: [16], cardmode: 0, istransfer: 0},
    { name: "看丹", lines: [16], cardmode: 0, istransfer: 0},
    { name: "榆树庄", lines: [16], cardmode: 0, istransfer: 0},
    { name: "洪泰庄", lines: [16], cardmode: 0, istransfer: 0},
    { name: "宛平城", lines: [16], cardmode: 0, istransfer: 0},
    { name: "周家庄", lines: [17], cardmode: 0, istransfer: 0},
    { name: "十八里店", lines: [17], cardmode: 0, istransfer: 0},
    { name: "北神树", lines: [17], cardmode: 0, istransfer: 0},
    { name: "次渠北", lines: [17], cardmode: 0, istransfer: 0},
    { name: "次渠", lines: [17, "yz"], cardmode: 0, istransfer: 1},
    { name: "嘉会湖", lines: [17], cardmode: 0, istransfer: 0},
    { name: "新发地", lines: [19], cardmode: 0, istransfer: 0},
    { name: "牛街", lines: [19], cardmode: 0, istransfer: 0},
    { name: "太平桥", lines: [19], cardmode: 0, istransfer: 0},
    { name: "花乡东桥", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "白盆窑", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "大葆台", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "稻田", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "长阳", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "篱笆房", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "广阳城", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "良乡大学城北", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "良乡大学城", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "良乡大学城西", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "良乡南关", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "苏庄", lines: ["fs"], cardmode: 0, istransfer: 0},
    { name: "阎村东", lines: ["fs", "yf"], cardmode: 0, istransfer: 1},
    { name: "昌平西山口", lines: ["fs", "yf"], cardmode: 0, istransfer: 1},
    { name: "十三陵景区", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "昌平", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "昌平东关", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "北邵洼", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "南邵", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "沙河高教园", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "沙河", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "巩华城", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "生命科学园", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "朱房北", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "清河小营桥", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "学知园", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "学院桥", lines: ["cp"], cardmode: 0, istransfer: 0},
    { name: "肖村", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "小红门", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "旧宫", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "亦庄桥", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "亦庄文化园", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "万源街", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "荣京东街", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "荣昌东街", lines: ["yz", "yzt1"], cardmode: 0, istransfer: 1},
    { name: "同济南路", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "经海路", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "次渠南", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "亦庄火车站", lines: ["yz"], cardmode: 0, istransfer: 0},
    { name: "紫草坞", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "阎村", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "星城", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "大石河东", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "马各庄", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "饶乐府", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "房山城关", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "燕山", lines: ["yf"], cardmode: 0, istransfer: 0},
    { name: "四道桥", lines: ["S1"], cardmode: 0, istransfer: 0},
    { name: "桥户营", lines: ["S1"], cardmode: 0, istransfer: 0},
    { name: "上岸", lines: ["S1"], cardmode: 0, istransfer: 0},
    { name: "栗园庄", lines: ["S1"], cardmode: 0, istransfer: 0},
    { name: "小园", lines: ["S1"], cardmode: 0, istransfer: 0},
    { name: "石厂", lines: ["S1"], cardmode: 0, istransfer: 0},
    { name: "颐和园西门", lines: ["xj"], cardmode: 0, istransfer: 0},
    { name: "茶棚", lines: ["xj"], cardmode: 0, istransfer: 0},
    { name: "万安", lines: ["xj"], cardmode: 0, istransfer: 0},
    { name: "国家植物园", lines: ["xj"], cardmode: 0, istransfer: 0},
    { name: "香山", lines: ["xj"], cardmode: 0, istransfer: 0},
    { name: "定海园", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "定海园西", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "经海一路", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "亦创会展中心", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "亦庄同仁", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "鹿圈东", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "泰河路", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "九号村", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "四海庄", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "太和桥北", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "瑞合庄", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "融兴街", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "屈庄", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "老观里", lines: ["yzt1"], cardmode: 0, istransfer: 0},
    { name: "2号航站楼", lines: ["sdjc"], cardmode: 0, istransfer: 0},
    { name: "3号航站楼", lines: ["sdjc"], cardmode: 0, istransfer: 0},
    { name: "大兴新城", lines: ["dxjc"], cardmode: 0, istransfer: 0},
    { name: "大兴机场", lines: ["dxjc"], cardmode: 0, istransfer: 0},
  ],
  lines: [
    { id: 1, name: "1号线" },
    { id: 2, name: "2号线" },
    { id: 3, name: "3号线" },
    { id: 4, name: "4号线" },
    { id: 5, name: "5号线" },
    { id: 6, name: "6号线" },
    { id: 7, name: "7号线" },
    { id: 8, name: "8号线" },
    { id: 9, name: "9号线" },
    { id: 10, name: "10号线" },
    { id: 11, name: "11号线" },
    { id: 12, name: "12号线" },
    { id: 13, name: "13号线" },
    { id: 14, name: "14号线" },
    { id: 15, name: "15号线" },
    { id: 16, name: "16号线" },
    { id: 17, name: "17号线" },
    { id: 19, name: "19号线" },
    { id: "fs", name: "房山线" },
    { id: "cp", name: "昌平线" },
    { id: "yz", name: "亦庄线" },
    { id: "yf", name: "燕房线" },
    { id: "S1", name: "S1线" },
    { id: "xj", name: "西郊线" },
    { id: "yzt1", name: "亦庄T1线" },
    { id: "sdjc", name: "首都机场线" },
    { id: "dxjc", name: "大兴机场线" }
  ]
};

// 导出地铁数据函数
function getMetroData() {
  return metroData;
}

// 确保在模块内部可以访问
window.getMetroData = getMetroData;

// 全局变量
let gameStarted = false; // 游戏是否已经开始

// 为所有地铁站添加istransfer属性
function initStationTransferProperty() {
  // 由于所有站点已经在数据中直接设置了istransfer属性，此函数仅作为备用
  // 检查是否有站点缺少istransfer属性
  let missingCount = 0;
  metroData.stations.forEach(station => {
    if (!('istransfer' in station)) {
      station.istransfer = station.lines.length > 1 ? 1 : 0;
      missingCount++;
    }
  });
  
  if (missingCount > 0) {
    console.log(`已为${missingCount}个缺少istransfer属性的站点补全属性`);
  } else {
    console.log('所有站点已有istransfer属性，无需初始化');
  }
}

// 页面加载时初始化游戏
document.addEventListener('DOMContentLoaded', function() {
  // 初始化地铁站换乘属性
  initStationTransferProperty();
  
  // 初始化游戏事件
  initGameEvents();
  
  // 不再自动启动游戏，等待用户点击开始游戏按钮
  // 只显示游戏界面，不启动计时器
  const standardModeUI = document.getElementById('standard-mode-ui');
  const soloExplorationUI = document.getElementById('solo-exploration-ui');
  
  if (standardModeUI && soloExplorationUI) {
    standardModeUI.style.display = 'none';
    soloExplorationUI.style.display = 'block';
  }
});

// 单人漫游模式相关函数
let playerHand = []; // 玩家手中的地铁牌
let currentPath = []; // 当前选择的路径
let startStation = ""; // 起点站
let endStation = ""; // 终点站
let playerScore = 0; // 玩家得分
let timerInterval = null; // 计时器间隔
let remainingTime = 300; // 剩余时间（秒），默认5分钟
let hintCount = 3; // 提示次数，默认3次

// 初始化单人漫游模式
// 更新计时器显示的函数
function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// 处理下一题的函数，不重置分数和计时器
function initSoloExplorationNextQuestion(isCreatorMode = false) {
  console.log('初始化下一题函数被调用，出题版模式:', isCreatorMode);
  
  // 获取当前游戏模式
  const gameModeSelect = document.getElementById('game-mode');
  const currentMode = gameModeSelect ? gameModeSelect.value : 'solo-exploration';
  
  // 检查是否是出题版模式
  const isCreatorModeActive = currentMode === 'solo-exploration-creator';
  
  // 根据模式选择正确的UI元素
  const standardModeUI = document.getElementById('standard-mode-ui');
  const soloExplorationUI = document.getElementById('solo-exploration-ui');
  const soloExplorationCreatorUI = document.getElementById('solo-exploration-creator-ui');
  const answerOptions = document.getElementById('answer-options');
  
  // 根据模式选择正确的元素ID
  const startStationElement = isCreatorModeActive ? document.getElementById('creator-start-station') : document.getElementById('start-station');
  const endStationElement = isCreatorModeActive ? document.getElementById('creator-end-station') : document.getElementById('end-station');
  const currentPathElement = isCreatorModeActive ? document.getElementById('creator-current-path') : document.getElementById('current-path');
  const playerHandElement = isCreatorModeActive ? document.getElementById('creator-player-hand') : document.getElementById('player-hand');
  const nextBtn = document.getElementById('next-btn');
  
  console.log('UI元素状态 - 起点站:', startStationElement ? '找到' : '未找到', 
              '终点站:', endStationElement ? '找到' : '未找到', 
              '路径:', currentPathElement ? '找到' : '未找到', 
              '手牌:', playerHandElement ? '找到' : '未找到');
  
  // 检查UI元素是否存在
  if (!standardModeUI || (!soloExplorationUI && !soloExplorationCreatorUI)) {
    console.error('无法找到游戏UI元素');
    return;
  }
  
  // 隐藏所有模式UI，显示当前选择的模式UI
  standardModeUI.style.display = 'none';
  if (soloExplorationUI) soloExplorationUI.style.display = 'none';
  if (soloExplorationCreatorUI) soloExplorationCreatorUI.style.display = 'none';
  
  // 根据模式显示对应UI
  if (isCreatorModeActive) {
    if (soloExplorationCreatorUI) soloExplorationCreatorUI.style.display = 'block';
    console.log('显示出题版UI');
  } else {
    if (soloExplorationUI) soloExplorationUI.style.display = 'block';
    console.log('显示普通版UI');
  }
  
  if (answerOptions) answerOptions.innerHTML = '';
  
  // 只重置当前路径和手牌，保留分数和计时器
  playerHand = [];
  currentPath = [];
  
  // 获取当前选择的难度
  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect ? difficultySelect.value : 'easy';
  
  if (isCreatorModeActive && !startStation && !endStation) {
    // 出题版模式且没有选择站点：显示站点选择界面
    console.log('出题版模式且没有选择站点，显示站点选择界面');
    showStationSelectionUI();
  } else {
    // 如果是普通模式或者已经有选择的站点，则不重新选择站点
    if (!isCreatorModeActive && (!startStation || !endStation)) {
      // 普通模式且没有选择站点：随机选择起点站和终点站
      const stationNames = metroData.stations.map(station => station.name);
      console.log('可用站点数量:', stationNames.length);
      startStation = stationNames[Math.floor(Math.random() * stationNames.length)];
      
      // 确保终点站与起点站不同
      do {
        endStation = stationNames[Math.floor(Math.random() * stationNames.length)];
      } while (endStation === startStation);
      
      console.log('选择的起点站:', startStation);
      console.log('选择的终点站:', endStation);
    } else {
      console.log('使用已选择的站点 - 起点站:', startStation, '终点站:', endStation);
    }
    
    // 显示起点站和终点站及其线路信息
    updateStationDisplay();
    
    // 发放地铁牌给玩家（随机选择合理数量的牌）
    dealMetroCards(10); // 限制为最多10张牌
    console.log('发放的地铁牌:', playerHand);
    
    // 确保玩家手牌区域是可见的
    if (playerHandElement) {
      playerHandElement.style.display = 'flex';
      console.log('设置玩家手牌区域为可见:', playerHandElement.id);
    } else {
      console.error('无法找到玩家手牌容器元素');
    }
    
    // 渲染玩家手牌
    renderPlayerHand();
  }
  
  // 清空当前路径
  if (currentPathElement) {
    currentPathElement.innerHTML = '';
    console.log('已清空当前路径显示');
  }
  
  // 启用下一题按钮
  if (nextBtn) {
    nextBtn.disabled = false;
    // 始终将按钮文本设置为"下一题"，无论是否为出题版模式
    nextBtn.textContent = '下一题';
    console.log('已设置下一题按钮文本为:', nextBtn.textContent);
  }
  
  
  console.log('下一题初始化完成');
}

function initSoloExploration(isCreatorMode = false) {
  console.log('初始化单人漫游模式函数被调用');
  
  // 获取UI元素
  const standardModeUI = document.getElementById('standard-mode-ui');
  const soloExplorationUI = document.getElementById('solo-exploration-ui');
  const soloExplorationCreatorUI = document.getElementById('solo-exploration-creator-ui');
  const answerOptions = document.getElementById('answer-options');
  
  // 根据模式选择正确的元素ID
  const startStationElement = isCreatorMode ? document.getElementById('creator-start-station') : document.getElementById('start-station');
  const endStationElement = isCreatorMode ? document.getElementById('creator-end-station') : document.getElementById('end-station');
  const currentPathElement = isCreatorMode ? document.getElementById('creator-current-path') : document.getElementById('current-path');
  const playerHandElement = isCreatorMode ? document.getElementById('creator-player-hand') : document.getElementById('player-hand');
  
  const nextBtn = document.getElementById('next-btn');
  const hintBtn = document.getElementById('hint-btn');
  const scoreElement = document.getElementById('score');
  const timerElement = document.getElementById('timer');
  
  // 检查UI元素是否存在
  if (!standardModeUI || !soloExplorationUI) {
    console.error('无法找到游戏UI元素');
    return;
  }
  
  // 隐藏所有模式UI，显示当前选择的模式UI
  console.log('切换UI显示');
  standardModeUI.style.display = 'none';
  soloExplorationUI.style.display = 'none';
  soloExplorationCreatorUI.style.display = 'none';
  
  // 根据模式显示对应UI
  if (isCreatorMode) {
    soloExplorationCreatorUI.style.display = 'block';
  } else {
    soloExplorationUI.style.display = 'block';
  }
  
  if (answerOptions) answerOptions.innerHTML = '';
  
  
  // 重置游戏状态
  playerHand = [];
  currentPath = [];
  playerScore = 0;
  remainingTime = 300; // 5分钟倒计时
  hintCount = 3; // 重置提示次数
  gameStarted = false; // 游戏尚未开始
  
  // 更新分数显示
  if (scoreElement) scoreElement.textContent = playerScore;
  
  // 更新计时器显示
  if (timerElement) timerElement.textContent = '时间: 05:00';
  
  // 更新提示按钮文本
  if (hintBtn) {
    hintBtn.textContent = `提示 (${hintCount})`;
    hintBtn.disabled = false;
  }
  
  // 清除之前的计时器
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // 获取当前选择的难度
  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect ? difficultySelect.value : 'easy';
  
  if (isCreatorMode) {
    // 出题版模式：显示站点选择界面
    showStationSelectionUI();
  } else {
    // 普通模式：随机选择起点站和终点站
    const stationNames = metroData.stations.map(station => station.name);
    console.log('可用站点数量:', stationNames.length);
    startStation = stationNames[Math.floor(Math.random() * stationNames.length)];
    
    // 确保终点站与起点站不同
    do {
      endStation = stationNames[Math.floor(Math.random() * stationNames.length)];
    } while (endStation === startStation);
    
    console.log('选择的起点站:', startStation);
    console.log('选择的终点站:', endStation);
    
    // 显示起点站和终点站及其线路信息
    updateStationDisplay();
    
    // 发放地铁牌给玩家（随机选择合理数量的牌）
    dealMetroCards(10); // 限制为最多10张牌
    console.log('发放的地铁牌:', playerHand);
    
    // 确保玩家手牌区域是可见的
    if (playerHandElement) {
      playerHandElement.style.display = 'flex';
    }
    
    // 渲染玩家手牌
    renderPlayerHand();
  }
  
  // 清空当前路径
  if (currentPathElement) currentPathElement.innerHTML = '';
  
  // 启用下一题按钮
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.textContent = '下一题';
  }
  
  console.log('单人漫游模式初始化完成');
}

// 发放地铁牌给玩家
// 查找从起点到终点的路径
function findPath(start, end, maxLength, minLength = 1) {
  // 显示loading状态
  showLoadingState(true, '正在生成路线...');
  
  // 使用Promise和setTimeout来避免页面卡死
  return new Promise((resolve) => {
    setTimeout(() => {
      // 获取当前游戏模式
      const gameModeSelect = document.getElementById('game-mode');
      const isCreatorMode = gameModeSelect && gameModeSelect.value === 'solo-exploration-creator';
      
      // 根据游戏模式调整搜索参数
      if (isCreatorMode) {
        // 出题版模式，扩大搜索范围
        maxLength = 15; // 扩大最大路径长度
        minLength = 1;  // 允许任何长度的路径
      } else {
        // 单人漫游模式，确保路径长度合理
        maxLength = Math.min(maxLength, 8); // 限制最大路径长度
        minLength = Math.max(minLength, 1); // 确保最小路径长度至少为1
      }
      
      // 优化：检查起点和终点是否直接相连，如果是且minLength > 1，则不考虑直接路径
      const directlyConnected = areStationsConnected(start, end);
      
      // 获取起点站和终点站的线路信息
      const startStationObj = metroData.stations.find(s => s.name === start);
      const endStationObj = metroData.stations.find(s => s.name === end);
      
      // 检查是否需要换乘（起点站和终点站是否有共同线路）
      let requireTransfer = true;
      if (startStationObj && endStationObj) {
        for (const line of startStationObj.lines) {
          if (endStationObj.lines.includes(line)) {
            requireTransfer = false;
            break;
          }
        }
      }
      
      // 使用广度优先搜索找到符合长度要求的路径
      const queue = [[start]];
      const visited = new Map(); // 使用Map来存储每个站点的访问深度，优化剪枝
      visited.set(start, 0);
      const validPaths = [];
      
      // 优化：设置最大队列长度，防止内存溢出
      const MAX_QUEUE_SIZE = 30000; // 增加队列大小以提高搜索效率
      // 优化：设置最大搜索时间（毫秒）
      const MAX_SEARCH_TIME = isCreatorMode ? 10000 : 20000; // 在单人漫游模式下增加搜索时间，提高找到有效路径的概率
      const startTime = Date.now();
      
      // 优化：预先计算所有站点的连接关系，避免重复查询
      const stationConnections = {};
      metroData.stations.forEach(station => {
        stationConnections[station.name] = getConnectedStations(station.name);
      });
      
      // 优化：设置最大路径数量
      const MAX_VALID_PATHS = isCreatorMode ? 5 : 15; // 在单人漫游模式下增加需要找到的路径数量
  
  while (queue.length > 0) {
    // 优化：检查是否超时或队列过长
    if (Date.now() - startTime > MAX_SEARCH_TIME || queue.length > MAX_QUEUE_SIZE) {
      console.log('搜索时间或队列长度超限，提前返回结果');
      break;
    }
    
    // 如果已经找到足够多的有效路径，提前结束搜索
    if (validPaths.length >= MAX_VALID_PATHS) {
      console.log(`已找到${validPaths.length}条有效路径，提前结束搜索`);
      break;
    }
    
    const path = queue.shift();
    const currentStation = path[path.length - 1];
    const currentDepth = path.length - 1; // 当前深度（不包括起点）
    
    // 如果找到终点
    if (currentStation === end) {
      // 优化：如果是直接相连且要求至少经过一个中间站，则跳过
      if (directlyConnected && path.length === 2 && minLength > 1) {
        continue;
      }
      
      const resultPath = path.slice(1); // 不包括起点站
      
      // 检查路径是否需要换乘
      if (requireTransfer) {
        // 检查路径中是否存在换乘站（即站点所属线路与起点站不同）
        let hasTransfer = false;
        for (const station of resultPath) {
          const stationObj = metroData.stations.find(s => s.name === station);
          if (stationObj) {
            let differentLine = true;
            // 检查站点是否与起点站有不同的线路
            for (const line of stationObj.lines) {
              if (startStationObj.lines.includes(line)) {
                differentLine = false;
                break;
              }
            }
            if (differentLine) {
              hasTransfer = true;
              break;
            }
          }
        }
        
        // 如果需要换乘但路径中没有换乘站，跳过此路径
        if (!hasTransfer) {
          continue;
        }
      }
      
      // 检查路径长度是否符合要求
      if (resultPath.length >= minLength && resultPath.length <= maxLength) {
        validPaths.push(resultPath);
        // 如果已经找到足够多的有效路径，就返回其中一条
        if (validPaths.length >= MAX_VALID_PATHS) {
          // 隐藏loading状态
          showLoadingState(false);
          resolve(validPaths[Math.floor(Math.random() * validPaths.length)]);
          return;
        }
      }
      // 即使找到终点，也继续搜索其他可能的路径
      continue;
    }
    
    // 优化：如果路径太长或已经达到最大深度，跳过
    if (currentDepth >= maxLength) {
      continue;
    }
    
    // 获取当前站点的所有相邻站点（使用预先计算的连接关系）
    const neighbors = stationConnections[currentStation] || [];
    
    // 优化：随机打乱邻居顺序，避免总是选择相同的路径
    shuffleArray(neighbors);
    
    // 优化：限制每个节点的分支数量，但增加分支数量以提高找到有效路径的概率
    const MAX_BRANCHES = 8;
    // 优先选择换乘站，提高查找效率和成功率
    const sortedNeighbors = [...neighbors].sort((a, b) => {
      const stationA = metroData.stations.find(s => s.name === a);
      const stationB = metroData.stations.find(s => s.name === b);
      // 如果是换乘站，优先级更高
      if (stationA && stationB) {
        return (stationB.istransfer || 0) - (stationA.istransfer || 0);
      }
      return 0;
    });
    
    const limitedNeighbors = sortedNeighbors.slice(0, MAX_BRANCHES);
    
    for (const neighbor of limitedNeighbors) {
      // 跳过终点站，确保终点站不会出现在地铁牌中
      if (neighbor === end) {
        // 如果是直接相连且要求至少经过一个中间站，则需要检查路径长度
        if (directlyConnected && path.length === 1 && minLength > 1) {
          continue;
        }
        // 如果路径长度已经达到最小要求，直接添加到路径中
        if (path.length >= minLength) {
          queue.push([...path, neighbor]);
        }
      } 
      // 如果邻居不是终点站且未访问过或找到了更短的路径
      else if (!visited.has(neighbor) || (visited.has(neighbor) && visited.get(neighbor) > currentDepth + 1)) {
        visited.set(neighbor, currentDepth + 1);
        queue.push([...path, neighbor]);
      }
    }
  }
  
  // 如果找到了有效路径，返回其中一条
  if (validPaths.length > 0) {
    // 隐藏loading状态
    showLoadingState(false);
    resolve(validPaths[Math.floor(Math.random() * validPaths.length)]);
    return;
  }
  
  // 隐藏loading状态
  showLoadingState(false);
  resolve(null); // 没有找到路径
    }, 0); // 使用setTimeout确保UI可以更新
  });
}


// 获取与指定站点直接相连的所有站点
function getConnectedStations(station) {
  const connectedStations = [];
  
  // 查找当前站点对象
  const stationObj = metroData.stations.find(s => s.name === station);
  if (!stationObj) return [];
  
  const stationLines = stationObj.lines || [];
  
  // 遍历所有站点，检查是否与当前站点共享线路
  for (const otherStationObj of metroData.stations) {
    if (otherStationObj.name !== station) {
      // 检查是否有共同线路
      for (const line of stationLines) {
        if (otherStationObj.lines.includes(line)) {
          connectedStations.push(otherStationObj.name);
          break;
        }
      }
    }
  }
  
  return connectedStations;
}

// 计时器函数
function startTimer() {
  // 清除之前的计时器
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  const timerElement = document.getElementById('timer');
  
  // 设置计时器，每秒更新一次
  timerInterval = setInterval(() => {
    remainingTime--;
    
    if (remainingTime <= 0) {
      // 时间到，游戏结束
      clearInterval(timerInterval);
      endGame(false);
    }
    
    // 更新计时器显示
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerElement.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// 游戏结束函数
function endGame(isSuccess) {
  // 停止计时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // 设置游戏状态为未开始
  gameStarted = false;
  
  // 计算最终得分
  const finalScore = playerScore;
  
  // 显示游戏结果
  const gameResult = document.getElementById('game-result');
  const gameOverModal = document.getElementById('game-over-modal');
  
  // 显示结算信息，只显示分数相关信息，不显示路径
  if (gameResult) {
    gameResult.innerHTML = `
      <div class="score-summary">
        <p>你的最终得分：<span class="final-score">${finalScore}</span></p>
      </div>
    `;
  }
  
  // 重置游戏状态
  playerHand = [];
  currentPath = [];
  
  // 启用开始游戏按钮，禁用其他按钮
  const startBtn = document.getElementById('start-btn');
  const nextBtn = document.getElementById('next-btn');
  const hintBtn = document.getElementById('hint-btn');
  
  if (startBtn) startBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = true;
  if (hintBtn) hintBtn.disabled = true;
  
  if (gameResult && gameOverModal) {
    if (isSuccess) {
      gameResult.innerHTML = `
        <p>恭喜！你成功从 <strong>${startStation}</strong> 到达了 <strong>${endStation}</strong>！</p>
        <p>你使用了 ${currentPath.length - 1} 张地铁牌完成了路径。</p>
        <p>最终得分: <strong>${finalScore}</strong></p>
      `;
    } else {
      gameResult.innerHTML = `
        <p>时间到！</p>
        <p>你未能成功从 <strong>${startStation}</strong> 到达 <strong>${endStation}</strong>。</p>
        <p>最终得分: <strong>${finalScore}</strong></p>
      `;
    }
    gameOverModal.style.display = 'block';
  }
}

// 显示或隐藏加载状态
function showLoadingState(show, message = '加载中...') {
  // 检查是否已存在loading元素
  let loadingElement = document.getElementById('loading-overlay');
  
  if (show) {
    // 如果不存在loading元素，创建一个
    if (!loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.id = 'loading-overlay';
      loadingElement.style.position = 'fixed';
      loadingElement.style.top = '0';
      loadingElement.style.left = '0';
      loadingElement.style.width = '100%';
      loadingElement.style.height = '100%';
      loadingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      loadingElement.style.display = 'flex';
      loadingElement.style.justifyContent = 'center';
      loadingElement.style.alignItems = 'center';
      loadingElement.style.zIndex = '9999';
      
      const loadingContent = document.createElement('div');
      loadingContent.style.backgroundColor = 'white';
      loadingContent.style.padding = '20px';
      loadingContent.style.borderRadius = '5px';
      loadingContent.style.textAlign = 'center';
      
      const spinner = document.createElement('div');
      spinner.style.border = '4px solid #f3f3f3';
      spinner.style.borderTop = '4px solid #3498db';
      spinner.style.borderRadius = '50%';
      spinner.style.width = '30px';
      spinner.style.height = '30px';
      spinner.style.animation = 'spin 2s linear infinite';
      spinner.style.margin = '0 auto 10px auto';
      
      // 添加CSS动画
      const style = document.createElement('style');
      style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);
      
      const messageElement = document.createElement('p');
      messageElement.id = 'loading-message';
      messageElement.textContent = message;
      
      loadingContent.appendChild(spinner);
      loadingContent.appendChild(messageElement);
      loadingElement.appendChild(loadingContent);
      
      document.body.appendChild(loadingElement);
    } else {
      // 如果已存在，更新消息并显示
      loadingElement.style.display = 'flex';
      const messageElement = document.getElementById('loading-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
    }
  } else if (loadingElement) {
    // 隐藏loading元素
    loadingElement.style.display = 'none';
  }
}

function dealMetroCards(count) {
  // 强制限制最大发牌数量为10张，无论传入的count是多少
  const maxCardCount = 10;
  const actualCount = Math.min(count, maxCardCount);
  console.log('开始发放地铁牌，请求数量:', count, '实际数量:', actualCount);
  
  // 确保playerHand是空的，防止累积卡片
  playerHand = [];
  
  // 获取所有站点名称
  const stationNames = metroData.stations.map(station => station.name);
  console.log('可用站点总数:', stationNames.length);
  
  // 将起点站和终点站都添加到已使用站点集合中，确保终点站不会出现在玩家手牌中
  const usedStations = new Set([startStation, endStation]);
  
  // 获取当前难度
  const difficultySelect = document.getElementById('difficulty');
  const difficulty = difficultySelect ? difficultySelect.value : 'easy';
  console.log('当前游戏难度:', difficulty);
  
  // 根据难度设置路径长度限制
  let minStations, maxStations;
  switch (difficulty) {
    case 'easy':
      minStations = 3; // 确保至少经过一个中间站
      maxStations = 4;
      break;
    case 'medium':
      minStations = 4;
      maxStations = 5;
      break;
    case 'hard':
      minStations = 5;
      maxStations = 8; // 困难模式下增加路径长度
      break;
    default:
      minStations = 3;
      maxStations = 4;
  }
  
  console.log(`根据难度${difficulty}设置路径长度：最小${minStations}，最大${maxStations}`)
  
  // 检查起点站和终点站是否在同一条线路上
  const startStationObj = metroData.stations.find(s => s.name === startStation);
  const endStationObj = metroData.stations.find(s => s.name === endStation);
  
  let sameLineFound = false;
  if (startStationObj && endStationObj) {
    // 检查是否有共同的线路
    for (const line of startStationObj.lines) {
      if (endStationObj.lines.includes(line)) {
        sameLineFound = true;
        break;
      }
    }
  }
  
  // 获取当前游戏模式
  const gameModeSelect = document.getElementById('game-mode');
  const isCreatorMode = gameModeSelect && gameModeSelect.value === 'solo-exploration-creator';
  
  // 如果在同一条线路上且不是出题版模式，重新选择终点站
  // 在出题版模式下，我们尊重用户的选择，即使起点站和终点站在同一条线路上
  if (sameLineFound && !isCreatorMode) {
    console.log('起点站和终点站在同一条线路上，重新选择终点站');
    let attempts = 0;
    const maxAttempts = 50; // 增加尝试次数，确保能找到合适的终点站
    
    while (sameLineFound && attempts < maxAttempts) {
      // 随机选择新的终点站
      const newEndStation = stationNames[Math.floor(Math.random() * stationNames.length)];
      if (newEndStation !== startStation) {
        const newEndStationObj = metroData.stations.find(s => s.name === newEndStation);
        
        // 检查新终点站是否与起点站在不同线路上
        sameLineFound = false;
        if (newEndStationObj) {
          for (const line of startStationObj.lines) {
            if (newEndStationObj.lines.includes(line)) {
              sameLineFound = true;
              break;
            }
          }
          
          if (!sameLineFound) {
            endStation = newEndStation;
            // 更新UI显示
            updateStationDisplay();
            console.log('已选择新的终点站:', endStation);
          }
        }
      }
      attempts++;
    }
    
    // 如果多次尝试后仍未找到不同线路的终点站，强制选择一个
    if (sameLineFound) {
      console.log('多次尝试后仍未找到不同线路的终点站，强制选择一个');
      // 获取所有不包含起点站线路的站点
      const differentLineStations = metroData.stations.filter(s => {
        if (s.name === startStation) return false;
        
        // 检查是否有共同线路
        for (const line of startStationObj.lines) {
          if (s.lines.includes(line)) return false;
        }
        return true;
      });
      
      if (differentLineStations.length > 0) {
        // 随机选择一个不同线路的站点
        const randomStation = differentLineStations[Math.floor(Math.random() * differentLineStations.length)];
        endStation = randomStation.name;
        updateStationDisplay();
        console.log('强制选择了不同线路的终点站:', endStation);
        sameLineFound = false;
      }
    }
  }
  
  // 检查起点站和终点站是否直接相连
  const directlyConnected = areStationsConnected(startStation, endStation);
  console.log('起点站和终点站是否直接相连:', directlyConnected);
  
  // 如果直接相连，确保minStations至少为2，以强制经过中间站
  if (directlyConnected && minStations < 2) {
    minStations = 2;
    console.log('起点站和终点站直接相连，设置最小路径长度为2');
  }
  
  // 创建一个空的手牌数组
  playerHand = [];
  
  // 获取当前游戏模式
  //const gameModeSelect = document.getElementById('game-mode');
  //const isCreatorMode = gameModeSelect && gameModeSelect.value === 'solo-exploration-creator';
  
  console.log(`尝试寻找从${startStation}到${endStation}的路径，最小长度${minStations}，最大长度${maxStations}`);
  console.log('当前模式:', isCreatorMode ? '出题版模式' : '普通模式');
  
  // 显示加载状态
  showLoadingState(true, '正在生成路线...');
  
  // 使用异步的findPath函数
  findPath(startStation, endStation, maxStations, minStations).then(path => {
    if (path) {
      // 如果找到了符合难度要求的路径
      console.log('找到从', startStation, '到', endStation, '的路径:', path);
      
      // 将路径中的站点添加到玩家手牌中
      for (const station of path) {
        playerHand.push(station);
        usedStations.add(station);
      }
      
      // 如果路径长度小于actualCount，随机添加其他站点
      const remainingCards = actualCount - playerHand.length;
      console.log('需要添加的额外随机站点数量:', remainingCards);
      
      for (let i = 0; i < remainingCards; i++) {
        let randomStation;
        let attempts = 0;
        const maxAttempts = 50; // 防止无限循环
        
        do {
          randomStation = stationNames[Math.floor(Math.random() * stationNames.length)];
          attempts++;
          if (attempts > maxAttempts) {
            // 如果尝试次数过多，放宽条件
            console.log('尝试次数过多，放宽选择条件');
            break;
          }
        } while (usedStations.has(randomStation)); // 终点站已经在usedStations中，不需要额外检查
        
        if (!usedStations.has(randomStation)) {
          playerHand.push(randomStation);
          usedStations.add(randomStation);
          console.log('添加随机站点到手牌:', randomStation);
        }
      }
    } else {
      console.warn('未找到有效路径，随机选择站点');
      
      // 如果没有找到有效路径，随机选择站点
      const availableStations = stationNames.filter(station => !usedStations.has(station));
      
      for (let i = 0; i < actualCount && availableStations.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableStations.length);
        const selectedStation = availableStations[randomIndex];
        
        playerHand.push(selectedStation);
        
        // 从可用站点中移除已选择的站点
        availableStations.splice(randomIndex, 1);
      }
    }
    
    // 随机打乱手牌顺序
    shuffleArray(playerHand);
    
    console.log('发放的地铁牌:', playerHand);
    
    // 隐藏加载状态
    showLoadingState(false);
    
    // 渲染玩家手牌
    renderPlayerHand();
  }).catch(error => {
    console.error('生成路径时出错:', error);
    showLoadingState(false);
    
    // 出错时随机选择站点
    const availableStations = stationNames.filter(station => !usedStations.has(station));
    
    for (let i = 0; i < actualCount && availableStations.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableStations.length);
      const selectedStation = availableStations[randomIndex];
      
      playerHand.push(selectedStation);
      
      // 从可用站点中移除已选择的站点
      availableStations.splice(randomIndex, 1);
    }
    
    // 随机打乱手牌顺序
    shuffleArray(playerHand);
    
    console.log('发放的地铁牌:', playerHand);
    
    // 渲染玩家手牌
    renderPlayerHand();
  });
  
  // 由于findPath现在是异步的，这里不再返回playerHand
        
    if (!usedStations.has(randomStation)) {
          playerHand.push(randomStation);
          usedStations.add(randomStation);
          console.log('添加随机站点到手牌:', randomStation);
        }

    else {
      // 如果没有找到合适的路径，尝试重新选择起点和终点站
      let attempts = 1;
      console.log(`第${attempts}次尝试未找到合适路径，重新选择站点`);
      
      if (attempts < 5) {
        // 重新选择起点站和终点站
        let newStartFound = false;
        let newEndFound = false;
        let maxSelectionAttempts = 20;
        let selectionAttempt = 0;
        
        while (!newStartFound && selectionAttempt < maxSelectionAttempts) {
          startStation = stationNames[Math.floor(Math.random() * stationNames.length)];
          selectionAttempt++;
          
          // 确保新选择的起点站有足够的连接站点
          const connections = getConnectedStations(startStation);
          if (connections.length >= 3) {
            newStartFound = true;
          }
        }
        
        selectionAttempt = 0;
        while (!newEndFound && selectionAttempt < maxSelectionAttempts) {
          endStation = stationNames[Math.floor(Math.random() * stationNames.length)];
          selectionAttempt++;
          
          // 确保终点站不同于起点站，且不直接相连（或者如果直接相连，确保有其他可行路径）
          if (endStation !== startStation) {
            const directConnection = areStationsConnected(startStation, endStation);
            if (!directConnection || getConnectedStations(startStation).length >= 3) {
              newEndFound = true;
            }
          }
        }
        
        // 更新UI显示
        updateStationDisplay();
        console.log(`重新选择站点：起点${startStation}，终点${endStation}`);
        
        // 重置已使用站点集合
        usedStations.clear();
        usedStations.add(startStation);
      }
    }
  
  
  // 如果多次尝试后仍未找到有效路径，随机发放牌
  if (playerHand.length === 0) {
    console.log('多次尝试后仍无法找到符合难度要求的路径，随机发放牌');
    playerHand = [];
    
    // 确保至少有一个可行的中间站点
    const startConnections = getConnectedStations(startStation);
    let middleStation = null;
    
    // 尝试找到一个可以连接起点和终点的中间站点
    for (const connection of startConnections) {
      if (connection !== endStation && areStationsConnected(connection, endStation)) {
        middleStation = connection;
        break;
      }
    }
    
    // 如果找到了中间站点，添加到手牌中
    if (middleStation) {
      playerHand.push(middleStation);
      usedStations.add(middleStation);
      console.log('添加中间站点到手牌:', middleStation);
    }
    
    // 添加剩余随机站点
    const remainingCount = middleStation ? actualCount - 1 : actualCount;
    console.log('需要添加的随机站点数量:', remainingCount);
    
    for (let i = 0; i < remainingCount; i++) {
      let randomStation;
      let attempts = 0;
      const maxAttempts = 30;
      
      do {
        randomStation = stationNames[Math.floor(Math.random() * stationNames.length)];
        attempts++;
        if (attempts > maxAttempts) break;
      } while (usedStations.has(randomStation) || randomStation === endStation);
      
      if (!usedStations.has(randomStation)) {
        playerHand.push(randomStation);
        usedStations.add(randomStation);
        console.log('添加随机站点到手牌:', randomStation);
      }
    }
  }
  
  // 随机打乱手牌顺序
  shuffleArray(playerHand);
  console.log('最终发放的地铁牌数量:', playerHand.length);
  console.log('最终发放的地铁牌:', playerHand);
  
  // 确保手牌数量正确
  if (playerHand.length === 0) {
    console.error('警告：发放的地铁牌数量为0，可能存在问题！');
    // 紧急情况下，随机发放一些牌
    for (let i = 0; i < actualCount; i++) {
      const randomIndex = Math.floor(Math.random() * stationNames.length);
      const randomStation = stationNames[randomIndex];
      // 确保不选择终点站
      if (randomStation !== endStation && !usedStations.has(randomStation)) {
        playerHand.push(randomStation);
        usedStations.add(randomStation);
      }
    }
    console.log('紧急修复：随机发放了地铁牌，数量:', playerHand.length);
  }
  
  return playerHand;
}

// 更新起点站和终点站显示
function updateStationDisplay() {
  // 获取当前游戏模式
  const gameModeSelect = document.getElementById('game-mode');
  const currentMode = gameModeSelect ? gameModeSelect.value : 'solo-exploration';
  const isCreatorMode = currentMode === 'solo-exploration-creator';
  
  // 根据模式选择正确的元素ID
  const startStationElement = isCreatorMode ? document.getElementById('creator-start-station') : document.getElementById('start-station');
  const endStationElement = isCreatorMode ? document.getElementById('creator-end-station') : document.getElementById('end-station');
  const currentPathElement = isCreatorMode ? document.getElementById('creator-current-path') : document.getElementById('current-path');
  
  console.log('更新站点显示 - 模式:', isCreatorMode ? '出题版' : '普通', '起点站元素:', startStationElement ? '找到' : '未找到', '终点站元素:', endStationElement ? '找到' : '未找到');
  
  if (startStationElement) {
    // 清空原有内容
    startStationElement.innerHTML = '';
    
    // 添加站名
    const stationNameSpan = document.createElement('span');
    stationNameSpan.textContent = startStation;
    startStationElement.appendChild(stationNameSpan);
    
    // 添加线路信息 - 使用弹性布局
    const flexLineContainer = document.createElement('div');
    flexLineContainer.className = 'flex-line-container';
    startStationElement.appendChild(flexLineContainer);
    
    // 查找起点站对象并添加线路信息
    const startStationObj = metroData.stations.find(s => s.name === startStation);
    const startLines = startStationObj ? startStationObj.lines : [];
    startLines.forEach(line => {
      const lineTag = document.createElement('span');
      const lineClass = getLineClassName(line);
      lineTag.className = `card-line-badge line-${lineClass}`;
      lineTag.textContent = getLineNameById(line);
      
      flexLineContainer.appendChild(lineTag);
    });
    console.log('已更新起点站显示:', startStation);
  }
  
  if (endStationElement) {
    // 清空原有内容
    endStationElement.innerHTML = '';
    
    // 添加站名
    const stationNameSpan = document.createElement('span');
    stationNameSpan.textContent = endStation;
    endStationElement.appendChild(stationNameSpan);
    
    // 添加线路信息 - 使用弹性布局
    const flexLineContainer = document.createElement('div');
    flexLineContainer.className = 'flex-line-container';
    endStationElement.appendChild(flexLineContainer);
    
    // 查找终点站对象并添加线路信息
    const endStationObj = metroData.stations.find(s => s.name === endStation);
    const endLines = endStationObj ? endStationObj.lines : [];
    endLines.forEach(line => {
      const lineTag = document.createElement('span');
      const lineClass = getLineClassName(line);
      lineTag.className = `card-line-badge line-${lineClass}`;
      lineTag.textContent = getLineNameById(line);
      
      flexLineContainer.appendChild(lineTag);
    });
    console.log('已更新终点站显示:', endStation);
  }
  
  // 更新当前路径显示
  if (currentPathElement && currentPath.length > 0) {
    renderPath();
  }
}

// 获取线路名称的函数
function getLineNameById(lineId) {
  // 确保能够正确处理字母型线路ID
  const lineInfo = metroData.lines.find(l => l.id === lineId);
  return lineInfo ? lineInfo.name : (typeof lineId === 'string' ? lineId.toUpperCase() : lineId);
}

// 起点站线路筛选变更处理函数
function handleStartLineFilterChange() {
  const selectedLine = this.value;
  console.log('起点站线路筛选变更:', selectedLine);
  
  // 获取最新的startStationSelect引用
  const currentStartStationSelect = document.getElementById('start-station-select');
  if (!currentStartStationSelect) {
    console.error('无法找到起点站选择元素');
    return;
  }
  
  // 清空当前选项
  currentStartStationSelect.innerHTML = '<option value="">-- 请选择 --</option>';
  
  // 启用站点选择
  currentStartStationSelect.disabled = false;
  
  // 按站点名称排序
  const sortedStations = [...metroData.stations].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  
  // 添加符合条件的站点
  let stationsAdded = 0;
  sortedStations.forEach(station => {
    // 检查站点是否属于选定的线路
    let belongsToLine = false;
    
    if (selectedLine === 'all') {
      belongsToLine = true;
    } else if (Array.isArray(station.lines)) {
      // 确保正确比较线路ID（可能是字符串或数字）
      belongsToLine = station.lines.some(lineId => String(lineId) === String(selectedLine));
    }
    
    if (belongsToLine) {
      const startOption = document.createElement('option');
      startOption.value = station.name;
      startOption.textContent = station.name;
      currentStartStationSelect.appendChild(startOption);
      stationsAdded++;
    }
  });
  
  console.log(`为起点站添加了 ${stationsAdded} 个站点选项`);
}

// 终点站线路筛选变更处理函数
function handleEndLineFilterChange() {
  const selectedLine = this.value;
  console.log('终点站线路筛选变更:', selectedLine);
  
  // 获取最新的endStationSelect引用
  const currentEndStationSelect = document.getElementById('end-station-select');
  if (!currentEndStationSelect) {
    console.error('无法找到终点站选择元素');
    return;
  }
  
  // 清空当前选项
  currentEndStationSelect.innerHTML = '<option value="">-- 请选择 --</option>';
  
  // 启用站点选择
  currentEndStationSelect.disabled = false;
  
  // 按站点名称排序
  const sortedStations = [...metroData.stations].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  
  // 添加符合条件的站点
  let stationsAdded = 0;
  sortedStations.forEach(station => {
    // 检查站点是否属于选定的线路
    let belongsToLine = false;
    
    if (selectedLine === 'all') {
      belongsToLine = true;
    } else if (Array.isArray(station.lines)) {
      // 确保正确比较线路ID（可能是字符串或数字）
      belongsToLine = station.lines.some(lineId => String(lineId) === String(selectedLine));
    }
    
    if (belongsToLine) {
      const endOption = document.createElement('option');
      endOption.value = station.name;
      endOption.textContent = station.name;
      currentEndStationSelect.appendChild(endOption);
      stationsAdded++;
    }
  });
  
  console.log(`为终点站添加了 ${stationsAdded} 个站点选项`);
}

// 单人漫游（出题版）模式的站点选择界面初始化
function showStationSelectionUI() {
  console.log('初始化站点选择界面');
  
  // 获取UI元素 - 使用预设的UI元素而不是动态创建
  const startLineFilter = document.getElementById('start-line-filter');
  const endLineFilter = document.getElementById('end-line-filter');
  const startStationSelect = document.getElementById('start-station-select');
  const endStationSelect = document.getElementById('end-station-select');
  const confirmStationsBtn = document.getElementById('confirm-stations-btn');
  const stationSelectionRow = document.querySelector('.station-selection-row');
  
  // 确保站点选择行使用四列布局
  if (stationSelectionRow) {
    stationSelectionRow.style.display = 'grid';
    stationSelectionRow.style.gridTemplateColumns = 'repeat(4, 1fr)';
    stationSelectionRow.style.gap = '10px';
    stationSelectionRow.style.marginBottom = '15px';
    console.log('已设置站点选择行为四列网格布局');
  }
  
  // 清空选择器
  if (startLineFilter) startLineFilter.innerHTML = '<option value="">-- 请先选择线路 --</option>';
  if (endLineFilter) endLineFilter.innerHTML = '<option value="">-- 请先选择线路 --</option>';
  if (startStationSelect) {
    startStationSelect.innerHTML = '<option value="">-- 请先选择线路 --</option>';
    startStationSelect.disabled = true;
  }
  if (endStationSelect) {
    endStationSelect.innerHTML = '<option value="">-- 请先选择线路 --</option>';
    endStationSelect.disabled = true;
  }
  if (confirmStationsBtn) confirmStationsBtn.disabled = true;
  
  // 填充线路选择下拉框
  if (startLineFilter && endLineFilter) {
    // 添加所有线路选项
    const allLinesOption = document.createElement('option');
    allLinesOption.value = 'all';
    allLinesOption.textContent = '所有线路';
    startLineFilter.appendChild(allLinesOption.cloneNode(true));
    endLineFilter.appendChild(allLinesOption);
    
    // 按线路名称排序
    const sortedLines = [...metroData.lines].sort((a, b) => {
      // 尝试将线路名称转换为数字进行比较
      const aNum = parseInt(a.name.replace(/[^0-9]/g, ''));
      const bNum = parseInt(b.name.replace(/[^0-9]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    
    sortedLines.forEach(line => {
      const startOption = document.createElement('option');
      startOption.value = line.id;
      startOption.textContent = line.name;
      startLineFilter.appendChild(startOption);
      
      const endOption = document.createElement('option');
      endOption.value = line.id;
      endOption.textContent = line.name;
      endLineFilter.appendChild(endOption);
    });
  }
  
  // 添加线路筛选事件 - 修复起点站线路筛选
  if (startLineFilter) {
    // 先移除可能存在的旧事件监听器
    startLineFilter.replaceWith(startLineFilter.cloneNode(true));
    // 重新获取引用
    const refreshedStartLineFilter = document.getElementById('start-line-filter');
    if (refreshedStartLineFilter) {
      refreshedStartLineFilter.addEventListener('change', handleStartLineFilterChange);
      console.log('为起点站线路筛选器添加了新的事件监听器');
    }
  }
  
  // 添加终点站线路筛选事件
  if (endLineFilter) {
    // 先移除可能存在的旧事件监听器
    endLineFilter.replaceWith(endLineFilter.cloneNode(true));
    // 重新获取引用
    const refreshedEndLineFilter = document.getElementById('end-line-filter');
    if (refreshedEndLineFilter) {
      refreshedEndLineFilter.addEventListener('change', handleEndLineFilterChange);
      console.log('为终点站线路筛选器添加了新的事件监听器');
    }
  }
  
  // 添加站点选择事件
  if (startStationSelect && endStationSelect) {
    // 使用外部定义的checkSelections函数，避免重复定义
    
    // 清除现有的事件监听器
    // 由于无法直接移除匿名函数监听器，我们使用克隆节点的方式
    const startParent = startStationSelect.parentNode;
    const endParent = endStationSelect.parentNode;
    
    // 保存当前值
    const startValue = startStationSelect.value;
    const endValue = endStationSelect.value;
    
    // 克隆节点（不包含事件监听器）
    const newStartSelect = startStationSelect.cloneNode(true);
    const newEndSelect = endStationSelect.cloneNode(true);
    
    // 恢复之前的值
    newStartSelect.value = startValue;
    newEndSelect.value = endValue;
    
    // 替换节点
    startParent.replaceChild(newStartSelect, startStationSelect);
    endParent.replaceChild(newEndSelect, endStationSelect);
    
    // 重新获取引用
    const updatedStartSelect = document.getElementById('start-station-select');
    const updatedEndSelect = document.getElementById('end-station-select');
    
    // 添加事件监听器
    if (updatedStartSelect) {
      updatedStartSelect.addEventListener('change', function() {
        console.log('起点站选择变更:', this.value);
        checkSelections();
      });
      console.log('为起点站添加了新的事件监听器');
    }
    
    if (updatedEndSelect) {
      updatedEndSelect.addEventListener('change', function() {
        console.log('终点站选择变更:', this.value);
        checkSelections();
      });
      console.log('为终点站添加了新的事件监听器');
    }
    
    // 初始状态下禁用确认按钮
    if (confirmStationsBtn) {
      confirmStationsBtn.disabled = true;
      console.log('初始化确认按钮状态：禁用');
    }
    
    // 初始检查一次，以防页面加载后已有选择
    checkSelections();
    console.log('初始检查站点选择完成');
  }
  
  // 添加确认按钮事件 - 使用已经获取的confirmStationsBtn变量，避免重复获取
  if (confirmStationsBtn) {
    // 先移除可能存在的旧事件监听器，防止重复绑定
    confirmStationsBtn.replaceWith(confirmStationsBtn.cloneNode(true));
    // 重新获取按钮，因为cloneNode会丢失事件监听器
    const refreshedConfirmBtn = document.getElementById('confirm-stations-btn');
    
    // 为新的按钮添加事件监听器
    refreshedConfirmBtn.addEventListener('click', function() {
      const selectedStartStation = document.getElementById('start-station-select').value;
      const selectedEndStation = document.getElementById('end-station-select').value;
      
      console.log('确认按钮被点击，起点站:', selectedStartStation, '终点站:', selectedEndStation);
      
      if (selectedStartStation && selectedEndStation && selectedStartStation !== selectedEndStation) {
        // 设置起点站和终点站
        startStation = selectedStartStation;
        endStation = selectedEndStation;
        
        console.log('设置起点站和终点站成功:', startStation, endStation);
        
        // 更新显示
        updateStationDisplay();
        
        // 发放地铁牌
        dealMetroCards(10);
        console.log('发放的地铁牌:', playerHand);
        
        // 确保玩家手牌区域是可见的
        const playerHandElement = document.getElementById('creator-player-hand') || document.getElementById('player-hand');
        if (playerHandElement) {
          playerHandElement.style.display = 'flex';
          console.log('设置玩家手牌区域为可见');
        } else {
          console.error('无法找到玩家手牌容器元素');
        }
        
        // 移除选择界面
        const selectionUI = document.querySelector('.station-selection-ui');
        if (selectionUI) {
          selectionUI.remove();
        }
        
        // 启动计时器
        startTimer();
        gameStarted = true;
        
        // 显示成功消息
        showResultMessage(`已选择从${startStation}到${endStation}的路线，游戏开始！`, 'correct');
        
        // 立即渲染玩家手牌
        renderPlayerHand();
        console.log('确认按钮点击后已渲染玩家手牌');
        
        // 确保下一题按钮可用
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.textContent = '验证';
        }
      } else {
        console.warn('站点选择无效，请确保选择了不同的起点站和终点站');
        showResultMessage('请选择不同的起点站和终点站', 'incorrect');
      }
    });
  } else {
    console.error('无法找到确认按钮元素');
  }
}

// 获取线路CSS类名的函数
function getLineClassName(lineId) {
  // 确保正确处理字符串类型的线路ID
  return typeof lineId === 'string' ? 
    lineId.toLowerCase().replace(/\s+/g, '') : 
    lineId.toString().toLowerCase().replace(/\s+/g, '');
}

// 渲染玩家手牌
function renderPlayerHand() {
  console.log('渲染玩家手牌函数被调用');
  
  // 获取游戏模式
  const gameModeSelect = document.getElementById('game-mode');
  const isCreatorMode = gameModeSelect && gameModeSelect.value === 'solo-exploration-creator';
  
  // 根据模式选择正确的手牌容器
  const handContainer = isCreatorMode ? 
    document.getElementById('creator-player-hand') : 
    document.getElementById('player-hand');
  
  if (!handContainer) {
    console.error('无法找到玩家手牌容器元素');
    return;
  }
  
  // 确保手牌容器可见
  handContainer.style.display = 'flex';
  handContainer.innerHTML = '';
  
  console.log('准备渲染手牌，手牌数量:', playerHand.length);
  
  // 检查playerHand是否为空或未定义
  if (!playerHand || playerHand.length === 0) {
    console.warn('警告：玩家手牌为空，可能需要先调用dealMetroCards函数');
    // 创建一个提示元素
    const emptyHandMessage = document.createElement('div');
    emptyHandMessage.className = 'empty-hand-message';
    emptyHandMessage.textContent = '暂无可用的地铁牌';
    emptyHandMessage.style.width = '100%';
    emptyHandMessage.style.textAlign = 'center';
    emptyHandMessage.style.padding = '20px';
    emptyHandMessage.style.color = '#666';
    handContainer.appendChild(emptyHandMessage);
    return;
  }
  
  playerHand.forEach(station => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.dataset.station = station;
    
    // 创建卡牌内容容器
    const cardContent = document.createElement('div');
    cardContent.className = 'card-inner-content';
    
    // 添加站名
    const stationName = document.createElement('div');
    stationName.className = 'card-station-name';
    stationName.textContent = station;
    cardContent.appendChild(stationName);
    
    // 添加线路信息
    const stationLines = document.createElement('div');
    stationLines.className = 'card-station-lines';
    
    // 查找站点对象并获取线路信息
    const stationObj = metroData.stations.find(s => s.name === station);
    const lines = stationObj ? stationObj.lines : [];
    
    // 创建一个灵活的线路容器，可以横向排列多条线路
    const flexLineContainer = document.createElement('div');
    flexLineContainer.className = 'flex-line-container';
    stationLines.appendChild(flexLineContainer);
    
    // 为每条线路创建标签，使用弹性布局横向排列
    lines.forEach(line => {
      const lineTag = document.createElement('span');
      const lineClass = getLineClassName(line);
      lineTag.className = `card-line-badge line-${lineClass}`;
      lineTag.textContent = getLineNameById(line);
      
      flexLineContainer.appendChild(lineTag);
    });
    
    // 添加换乘站信息
    if (lines.length > 1) {
      const transferInfo = document.createElement('div');
      transferInfo.className = 'transfer-station-info';
      transferInfo.textContent = '换乘站';
      transferInfo.style.fontSize = '10px';
      transferInfo.style.color = '#666';
      transferInfo.style.marginTop = '2px';
      cardContent.appendChild(transferInfo);
    }
    
    cardContent.appendChild(stationLines);
    card.appendChild(cardContent);
    
    // 添加点击事件
    card.addEventListener('click', () => selectCard(station, card));
    
    handContainer.appendChild(card);
  });
  
  console.log('玩家手牌渲染完成');
}

// 选择卡牌添加到路径中
function selectCard(station, cardElement) {
  // 如果是第一张牌，必须与起点站线路相连
  if (currentPath.length === 0) {
    if (!areStationsConnected(startStation, station)) {
      showResultMessage(`第一张牌必须与起点站${startStation}的线路相连！`, 'incorrect');
      return;
    }
    // 将起点站添加到路径中作为第一站
    currentPath.push(startStation);
  }
  
  // 如果路径已经包含终点站，不能再添加
  if (currentPath.includes(endStation)) {
    showResultMessage('路径已经到达终点站！', 'incorrect');
    return;
  }
  
  // 验证是否可以添加到路径中（相邻站点必须在同一条线路上）
  if (currentPath.length > 0) {
    const lastStation = currentPath[currentPath.length - 1];
    if (!areStationsConnected(lastStation, station)) {
      showResultMessage(`${lastStation}和${station}之间没有直接连接！`, 'incorrect');
      return;
    }
  }
  
  // 添加到路径中
  currentPath.push(station);
  
  // 从玩家手牌中移除
  const index = playerHand.indexOf(station);
  if (index !== -1) {
    playerHand.splice(index, 1);
  }
  
  // 更新UI
  cardElement.remove();
  updatePathDisplay();
  
  // 检查是否可以到达终点站
  const lastStation = currentPath[currentPath.length - 1];
  if (areStationsConnected(lastStation, endStation)) {
    // 增加得分
    playerScore += 10;
    document.getElementById('score').textContent = playerScore;
    
    showResultMessage('恭喜！你已成功到达终点站！点击"下一题"继续游戏', 'correct');
    
    // 将终点站添加到路径中
    currentPath.push(endStation);
    updatePathDisplay();
  }
}

// 更新路径显示
function updatePathDisplay() {
  // 获取当前游戏模式
  const gameModeSelect = document.getElementById('game-mode');
  const isCreatorMode = gameModeSelect && gameModeSelect.value === 'solo-exploration-creator';
  
  // 根据模式选择正确的路径容器
  const pathContainer = isCreatorMode ? 
    document.getElementById('creator-current-path') : 
    document.getElementById('current-path');
    
  if (!pathContainer) {
    console.error('无法找到路径容器元素');
    return;
  }
  
  pathContainer.innerHTML = '';
  
  currentPath.forEach((station, index) => {
    // 创建站点元素
    const stationElement = document.createElement('div');
    stationElement.className = 'path-station';
    
    // 添加站名
    const stationName = document.createElement('span');
    stationName.className = 'path-station-name';
    stationName.textContent = station;
    stationElement.appendChild(stationName);
    
    // 添加线路信息
    const stationObj = metroData.stations.find(s => s.name === station);
    const lines = stationObj ? stationObj.lines : [];
    
    // 添加换乘站信息 - 显示所有可换乘线路
    if (lines.length > 0) {
      const transferContainer = document.createElement('div');
      transferContainer.className = 'transfer-container';
      transferContainer.style.display = 'flex';
      transferContainer.style.flexWrap = 'wrap';
      transferContainer.style.gap = '2px';
      transferContainer.style.marginTop = '2px';
      
      // 添加换乘站标识
      const transferLabel = document.createElement('span');
      transferLabel.className = 'transfer-label';
      transferLabel.textContent = '线路:';
      transferLabel.style.fontSize = '10px';
      transferLabel.style.color = '#666';
      transferLabel.style.marginRight = '4px';
      transferContainer.appendChild(transferLabel);
      
      // 为每条线路创建标签
      lines.forEach(line => {
        const lineTag = document.createElement('span');
        const lineClass = getLineClassName(line);
        lineTag.className = `card-line-badge line-${lineClass}`;
        lineTag.textContent = getLineNameById(line);
        lineTag.style.fontSize = '10px';
        lineTag.style.padding = '1px 3px';
        
        transferContainer.appendChild(lineTag);
      });
      
      stationElement.appendChild(transferContainer);
    }
    
    // 添加到路径容器
    pathContainer.appendChild(stationElement);
    
    // 如果不是最后一个站点，添加连接箭头和实际换乘线路
    if (index < currentPath.length - 1) {
      const nextStation = currentPath[index + 1];
      const nextStationObj = metroData.stations.find(s => s.name === nextStation);
      const nextStationLines = nextStationObj ? nextStationObj.lines : [];
      
      // 找出两站之间的共同线路
      const commonLines = lines.filter(line => nextStationLines.includes(line));
      
      // 创建箭头容器
      const arrowContainer = document.createElement('div');
      arrowContainer.className = 'path-arrow-container';
      arrowContainer.style.display = 'flex';
      arrowContainer.style.flexDirection = 'column';
      arrowContainer.style.alignItems = 'center';
      arrowContainer.style.justifyContent = 'center';
      
      // 添加箭头
      const arrow = document.createElement('div');
      arrow.className = 'path-arrow';
      arrow.textContent = '→';
      arrowContainer.appendChild(arrow);
      
      // 如果有共同线路，在箭头下方显示实际换乘线路
      if (commonLines.length > 0) {
        const lineContainer = document.createElement('div');
        lineContainer.className = 'arrow-line-container';
        lineContainer.style.display = 'flex';
        lineContainer.style.flexWrap = 'wrap';
        lineContainer.style.justifyContent = 'center';
        lineContainer.style.marginTop = '2px';
        
        commonLines.forEach(line => {
          const lineTag = document.createElement('span');
          const lineClass = getLineClassName(line);
          lineTag.className = `card-line-badge line-${lineClass}`;
          lineTag.textContent = getLineNameById(line);
          lineTag.style.fontSize = '10px';
          lineTag.style.padding = '1px 3px';
          lineTag.style.margin = '0 1px';
          
          lineContainer.appendChild(lineTag);
        });
        
        arrowContainer.appendChild(lineContainer);
      }
      
      pathContainer.appendChild(arrowContainer);
    }
  });
}

// 检查两个站点是否直接相连
function areStationsConnected(station1, station2) {
  const stationObj1 = metroData.stations.find(s => s.name === station1);
  const stationObj2 = metroData.stations.find(s => s.name === station2);
  
  const lines1 = stationObj1 ? stationObj1.lines : [];
  const lines2 = stationObj2 ? stationObj2.lines : [];
  
  // 检查是否有共同的线路
  for (const line of lines1) {
    if (lines2.includes(line)) {
      // 还需要检查在该线路上是否相邻（这里简化处理，假设共享线路的站点都是相连的）
      return true;
    }
  }
  
  return false;
}

// 显示结果消息
function showResultMessage(message, type) {
  const resultElement = document.getElementById('result-message');
  resultElement.textContent = message;
  resultElement.className = 'result-message ' + type;
  
  // 3秒后清除消息
  setTimeout(() => {
    resultElement.textContent = '';
    resultElement.className = 'result-message';
  }, 3000);
}

// 游戏启动函数
function startGame() {
  console.log('游戏启动函数被调用');
  const gameModeSelect = document.getElementById('game-mode');
  
  if (!gameModeSelect) {
    console.error('无法找到游戏模式选择器元素');
    return;
  }
  
  const selectedMode = gameModeSelect.value;
  console.log('选择的游戏模式:', selectedMode);
  
  // 重置游戏状态
  playerHand = [];
  currentPath = [];
  playerScore = 0;
  remainingTime = 300; // 重置时间为5分钟
  hintCount = 3; // 重置提示次数
  
  // 保存提示次数到本地存储
  localStorage.setItem('hintCount', hintCount);
  
  // 更新分数显示
  const scoreElement = document.getElementById('score');
  if (scoreElement) scoreElement.textContent = playerScore;
  
  // 更新计时器显示
  const timerElement = document.getElementById('timer');
  if (timerElement) timerElement.textContent = '时间: 05:00';
  
  // 清除之前的计时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // 隐藏所有游戏模式UI
  const soloExplorationUI = document.getElementById('solo-exploration-ui');
  const standardModeUI = document.getElementById('standard-mode-ui');
  const soloExplorationCreatorUI = document.getElementById('solo-exploration-creator-ui');
  
  if (soloExplorationUI) soloExplorationUI.style.display = 'none';
  if (standardModeUI) standardModeUI.style.display = 'none';
  if (soloExplorationCreatorUI) soloExplorationCreatorUI.style.display = 'none';
  
  // 根据选择的游戏模式初始化不同的游戏
  if (selectedMode === 'solo-exploration') {
    console.log('初始化单人漫游模式');
    // 显示单人漫游UI
    if (soloExplorationUI) soloExplorationUI.style.display = 'block';
    
    initSoloExploration(false);
    // 启动计时器（只有在点击开始游戏后才开始计时）
    startTimer();
    gameStarted = true;
    
    // 确保玩家手牌区域可见
    const playerHandElement = document.getElementById('player-hand');
    if (playerHandElement) {
      playerHandElement.style.display = 'flex';
      console.log('已设置玩家手牌区域为可见');
    }
    
    // 确保在游戏开始后重新渲染玩家手牌
    console.log('在游戏开始后重新渲染玩家手牌');
    renderPlayerHand();
    
    // 显示成功消息
    showResultMessage(`游戏开始！从${startStation}到${endStation}`, 'correct');
  } else if (selectedMode === 'solo-exploration-creator') {
    console.log('初始化单人漫游（出题版）模式');
    // 显示单人漫游出题版UI
    if (soloExplorationCreatorUI) soloExplorationCreatorUI.style.display = 'block';
    
    initSoloExploration(true);
    // 出题版模式不立即启动计时器，等待选择站点后再启动
    
    // 显示成功消息
    showResultMessage('请选择起点站和终点站', 'correct');
  }
  
  // 更新按钮状态
  const startBtn = document.getElementById('start-btn');
  const nextBtn = document.getElementById('next-btn');
  const hintBtn = document.getElementById('hint-btn');
  
  if (startBtn) startBtn.disabled = true;
  if (nextBtn) nextBtn.disabled = false;
  if (hintBtn) {
    hintBtn.disabled = false;
    hintBtn.textContent = `提示 (${hintCount})`;
  }
}

// 提示功能 - 显示一张可以连接的卡牌
function showHint() {
  // 如果没有提示次数了，直接返回
  if (hintCount <= 0) {
    showResultMessage('提示次数已用完！', 'incorrect');
    return;
  }
  
  // 减少提示次数
  hintCount--;
  
  // 更新提示按钮文本
  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) {
    hintBtn.textContent = `提示 (${hintCount})`;
    if (hintCount <= 0) {
      hintBtn.disabled = true;
    }
  }
  
  // 保存提示次数到本地存储，确保在点击后正确显示
  localStorage.setItem('hintCount', hintCount);
  
  // 尝试找到从当前位置到终点站的最佳路径
  let startPoint = currentPath.length === 0 ? startStation : currentPath[currentPath.length - 1];
  
  // 异步查找路径，但使用同步方式处理结果
  findPath(startPoint, endStation, 5, 1).then(path => {
    if (path && path.length > 0) {
      // 找到了有效路径
      // 如果路径的第一个站点在玩家手牌中，提示使用它
      const nextStation = path[0];
      if (playerHand.includes(nextStation)) {
        highlightCard(nextStation);
        showResultMessage(`提示：使用${nextStation}可以构建到达终点站的有效路径`, 'correct');
      } else {
        // 如果路径中没有玩家手牌中的站点，提示一般性建议
        showResultMessage(`提示：尝试找到可以连接到${path.join('、')}的站点`, 'correct');
      }
    } else {
      // 如果路径为空，提示与当前最后一个站点相连的卡牌
      if (currentPath.length === 0) {
        // 查找与起点站相连的卡牌
        for (const station of playerHand) {
          if (areStationsConnected(startStation, station)) {
            highlightCard(station);
            showResultMessage(`提示：${station}与起点站${startStation}相连`, 'correct');
            return;
          }
        }
      } else {
        // 获取当前路径的最后一个站点
        const lastStation = currentPath[currentPath.length - 1];
        
        // 查找与最后一个站点相连的卡牌
        for (const station of playerHand) {
          if (areStationsConnected(lastStation, station)) {
            highlightCard(station);
            showResultMessage(`提示：${station}与${lastStation}相连`, 'correct');
            return;
          }
        }
        
        // 如果当前路径的最后一个站点可以直接连接到终点站
        if (areStationsConnected(lastStation, endStation)) {
          showResultMessage(`提示：当前路径已可以直接到达终点站${endStation}`, 'correct');
          return;
        }
      }
      
      // 如果没有找到可以连接的卡牌
      showResultMessage('提示：当前没有可以直接连接的卡牌', 'incorrect');
    }
  }).catch(error => {
    console.error('提示功能查找路径出错:', error);
    showResultMessage('提示：无法找到有效路径', 'incorrect');
  });
}

// 高亮显示提示的卡牌
function highlightCard(station) {
  const cards = document.querySelectorAll('.player-card');
  cards.forEach(card => {
    if (card.dataset.station === station) {
      // 添加高亮效果
      card.style.boxShadow = '0 0 15px 5px #ffcc00';
      card.style.transform = 'translateY(-10px)';
      
      // 3秒后恢复正常
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.transform = '';
      }, 3000);
    }
  });
}

// 游戏模式切换处理
// 由于使用了ES模块，确保DOM完全加载后再添加事件监听器
function initGameEvents() {
  console.log('初始化游戏事件');
  const gameModeSelect = document.getElementById('game-mode');
  const startBtn = document.getElementById('start-btn');
  const nextBtn = document.getElementById('next-btn');
  const hintBtn = document.getElementById('hint-btn');
  
  if (!gameModeSelect || !startBtn || !nextBtn) {
    console.error('无法找到游戏控制元素');
    return;
  }
  
  // 设置默认游戏模式为单人漫游
  gameModeSelect.value = 'solo-exploration';
  
  // 检查是否已经存在单人漫游（出题版）选项，避免重复添加
  let hasCreatorOption = false;
  for (let i = 0; i < gameModeSelect.options.length; i++) {
    if (gameModeSelect.options[i].value === 'solo-exploration-creator') {
      hasCreatorOption = true;
      break;
    }
  }
  
  // 只有在不存在的情况下才添加单人漫游（出题版）选项
  if (!hasCreatorOption) {
    const creatorOption = document.createElement('option');
    creatorOption.value = 'solo-exploration-creator';
    creatorOption.textContent = '单人漫游（出题版）';
    gameModeSelect.appendChild(creatorOption);
  }
  
  gameModeSelect.addEventListener('change', function() {
    // 重置UI状态
    document.getElementById('solo-exploration-ui').style.display = 'block';
    nextBtn.textContent = '下一题';
    
    // 清除之前的计时器
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    // 重置游戏状态
    gameStarted = false;
    
    // 确保玩家手牌区域可见
    const playerHandElement = document.getElementById('player-hand');
    if (playerHandElement) {
      playerHandElement.style.display = 'flex';
      console.log('游戏模式切换：已设置玩家手牌区域为可见');
    }
  });
  
  startBtn.addEventListener('click', function() {
    console.log('点击开始游戏按钮');
    startGame();
  });
  
  // 提示按钮事件
  if (hintBtn) {
    hintBtn.addEventListener('click', function() {
      if (gameModeSelect.value === 'solo-exploration') {
        showHint();
      }
    });
  }
  
  nextBtn.addEventListener('click', function() {
    const selectedMode = gameModeSelect.value;
    console.log('下一题按钮被点击，当前模式:', selectedMode);
    
    if (selectedMode === 'solo-exploration' || selectedMode === 'solo-exploration-creator') {
      // 清空当前路径和玩家手牌，准备下一题
      if (nextBtn.textContent === '重新开始' || nextBtn.textContent === '下一题') {
        console.log('准备下一题...');
        // 清空当前路径
        currentPath = [];
        // 清空玩家手牌
        playerHand = [];
        // 重新渲染路径和手牌
        updatePathDisplay();
        renderPlayerHand();
        
        // 保存当前游戏状态
        const wasGameStarted = gameStarted;
        const currentScore = playerScore;
        const currentTime = remainingTime;
        const currentHintCount = hintCount;
        
        // 无论是什么模式，都重置起点终点站
        startStation = null;
        endStation = null;
        
        if (selectedMode === 'solo-exploration') {
          // 普通模式：重新生成题目
          console.log('普通模式：重新生成题目');
          initSoloExplorationNextQuestion(false);
        } else {
          // 出题版模式：重新选择站点
          console.log('出题版模式：重置站点选择');
          initSoloExplorationNextQuestion(true);
        }
        
        // 恢复游戏状态
        gameStarted = wasGameStarted;
        playerScore = currentScore;
        remainingTime = currentTime;
        hintCount = currentHintCount;
        
        // 更新UI显示
        document.getElementById('score').textContent = playerScore;
        updateTimerDisplay();
        
        // 发放新的地铁牌
        console.log('发放新的地铁牌...');
        dealMetroCards(10);
        
        // 确保玩家手牌区域是可见的
        const playerHandElement = selectedMode === 'solo-exploration-creator' ? 
          document.getElementById('creator-player-hand') : document.getElementById('player-hand');
        if (playerHandElement) {
          playerHandElement.style.display = 'flex';
          console.log('设置玩家手牌区域为可见:', playerHandElement.id);
        }
        
        // 渲染新的手牌
        console.log('渲染新的手牌...');
        renderPlayerHand();
        
        // 更新提示按钮
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
          hintBtn.textContent = `提示 (${hintCount})`;
          hintBtn.disabled = hintCount <= 0;
        }
        
        // 确保下一题按钮文本正确设置为"验证"
        nextBtn.textContent = '验证';
        nextBtn.disabled = false;
      } else if (nextBtn.textContent === '验证') {
        // 验证路径是否有效
        if (currentPath.length === 0) {
          // 如果没有选择任何卡牌，提示用户选择
          showResultMessage('请选择至少一张地铁牌来构建路径', 'incorrect');
        } else if (!currentPath.includes(endStation)) {
          // 如果路径不完整，检查是否可以到达终点站
          const lastStation = currentPath[currentPath.length - 1];
          if (areStationsConnected(lastStation, endStation)) {
            // 如果可以到达终点站，添加到路径并更新显示
            currentPath.push(endStation);
            updatePathDisplay();
            
            // 增加得分
            playerScore += 10;
            document.getElementById('score').textContent = playerScore;
            
            // 显示成功消息并更改按钮文本
            showResultMessage('恭喜！你已成功到达终点站！点击"下一题"继续游戏', 'correct');
            nextBtn.textContent = '下一题';
          } else {
            // 如果不能到达终点站，提示用户继续选择
            showResultMessage(`当前路径无法直接到达${endStation}，请继续选择地铁牌`, 'incorrect');
          }
        } else {
          // 路径已包含终点站，可以进入下一题
          nextBtn.textContent = '下一题';
          showResultMessage('路径已完成！点击"下一题"继续游戏', 'correct');
        }
      } else {
        // 其他情况（如按钮文本为其他值）
        // 重置为下一题
        nextBtn.textContent = '下一题';
        showResultMessage('可以点击"下一题"按钮进入新的题目', 'correct');
      }
    }
    // 其他模式的处理逻辑...
  });
  
  // 添加游戏结束模态框的按钮事件
  const playAgainBtn = document.getElementById('play-again-btn');
  const returnHomeBtn = document.getElementById('return-home-btn');
  
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', function() {
      document.getElementById('game-over-modal').style.display = 'none';
      initSoloExploration();
    });
  }
  
  if (returnHomeBtn) {
    returnHomeBtn.addEventListener('click', function() {
      document.getElementById('game-over-modal').style.display = 'none';
    });
  }
}

// 检查站点选择状态的全局函数
function checkSelections() {
  // 每次检查时重新获取最新的DOM元素引用
  const currentStartSelect = document.getElementById('start-station-select');
  const currentEndSelect = document.getElementById('end-station-select');
  const currentConfirmBtn = document.getElementById('confirm-stations-btn');
  
  console.log('检查站点选择：', 
    currentStartSelect ? currentStartSelect.value : '未找到起点站选择框', 
    currentEndSelect ? currentEndSelect.value : '未找到终点站选择框');
  
  // 使用最新获取的DOM元素引用进行判断
  if (currentConfirmBtn && currentStartSelect && currentEndSelect && 
      currentStartSelect.value && currentEndSelect.value && 
      currentStartSelect.value !== currentEndSelect.value) {
    currentConfirmBtn.disabled = false;
    console.log('启用确认按钮');
  } else if (currentConfirmBtn) {
    currentConfirmBtn.disabled = true;
    console.log('禁用确认按钮');
  }
}

// 洗牌函数 - 用于随机打乱数组顺序
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 确保DOM加载完成后初始化事件
document.addEventListener('DOMContentLoaded', function() {
  initGameEvents();
  // 不再自动启动游戏，等待用户点击开始游戏按钮
  // 移除自动启动代码，防止未选择模式和难度就开始倒计时
});