// 小川杂货店 - 游戏逻辑

// 游戏配置
const DIFFICULTY_LEVELS = {
  easy: {
    name: '简单',
    productCount: 10,
    minProductPrice: 1,
    maxProductPrice: 10,
    minMoney: 20,
    maxMoney: 50
  },
  medium: {
    name: '中等',
    productCount: 15,
    minProductPrice: 5,
    maxProductPrice: 20,
    minMoney: 50,
    maxMoney: 100
  },
  hard: {
    name: '困难',
    productCount: 20,
    minProductPrice: 10,
    maxProductPrice: 50,
    minMoney: 100,
    maxMoney: 200
  }
};

// 当前难度
let currentDifficulty = 'easy';

// 商品类别和对应的表情符号
const PRODUCT_CATEGORIES = [
  { name: '水果', emoji: '🍎', items: ['苹果', '香蕉', '橙子', '西瓜', '草莓', '葡萄', '桃子', '梨', '菠萝', '樱桃'] },
  { name: '蔬菜', emoji: '🥦', items: ['西红柿', '黄瓜', '胡萝卜', '土豆', '洋葱', '白菜', '茄子', '青椒', '花菜', '生菜'] },
  { name: '饮料', emoji: '🥤', items: ['可乐', '果汁', '矿泉水', '牛奶', '咖啡', '茶', '汽水', '豆浆', '酸奶', '能量饮料'] },
  { name: '零食', emoji: '🍪', items: ['饼干', '薯片', '巧克力', '糖果', '爆米花', '坚果', '冰淇淋', '蛋糕', '面包', '果冻'] },
  { name: '日用品', emoji: '🧴', items: ['洗发水', '肥皂', '牙膏', '纸巾', '洗衣粉', '洗洁精', '卫生纸', '拖把', '垃圾袋', '洗手液'] },
  { name: '文具', emoji: '✏️', items: ['铅笔', '钢笔', '橡皮', '尺子', '笔记本', '胶水', '剪刀', '订书机', '文件夹', '计算器'] }
];

// 游戏状态
let gameState = {
  playerMoney: 0,
  products: [],
  cart: [],
  isGameOver: false
};

// DOM元素
const playerMoneyElement = document.getElementById('player-money');
const remainingBalanceElement = document.getElementById('remaining-balance');
const productsContainerElement = document.getElementById('products-container');
const cartItemsElement = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const clearCartButton = document.getElementById('clear-cart-btn');
const checkoutButton = document.getElementById('checkout-btn');
const gameResultElement = document.getElementById('game-result');
const resultTitleElement = document.getElementById('result-title');
const resultMessageElement = document.getElementById('result-message');
const itemsCountElement = document.getElementById('items-count');
const totalSpentElement = document.getElementById('total-spent');
const remainingMoneyElement = document.getElementById('remaining-money');
const playAgainButton = document.getElementById('play-again-btn');
const difficultySelectElement = document.getElementById('difficulty-select');
const commonAddButton = document.getElementById('common-add-btn');

// 创建余额显示元素
if (!document.getElementById('remaining-balance')) {
  const moneyContainer = document.querySelector('.money-container');
  const balanceSpan = document.createElement('span');
  balanceSpan.id = 'remaining-balance';
  balanceSpan.className = 'remaining-balance';
  balanceSpan.innerHTML = ' (购物后余额：<span id="balance-amount">0</span> 元)';
  moneyContainer.appendChild(balanceSpan);
}

// 初始化游戏
function initializeGame() {
  // 获取当前难度设置
  const difficulty = DIFFICULTY_LEVELS[currentDifficulty];
  
  // 重置游戏状态
  gameState = {
    playerMoney: getRandomInt(difficulty.minMoney, difficulty.maxMoney),
    products: [],
    cart: [],
    isGameOver: false
  };

  // 生成随机商品
  generateRandomProducts();

  // 更新UI
  updateUI();

  // 隐藏游戏结果
  gameResultElement.classList.add('hidden');
}

// 生成随机商品
function generateRandomProducts() {
  // 清空现有商品
  gameState.products = [];

  // 获取当前难度设置
  const difficulty = DIFFICULTY_LEVELS[currentDifficulty];
  const productCount = difficulty.productCount;

  // 用于跟踪已使用的商品，避免重复
  const usedItems = new Set();

  // 生成商品
  for (let i = 0; i < productCount; i++) {
    // 随机选择商品类别
    const categoryIndex = getRandomInt(0, PRODUCT_CATEGORIES.length - 1);
    const category = PRODUCT_CATEGORIES[categoryIndex];

    // 尝试找到未使用的商品
    let itemName, itemKey;
    let attempts = 0;
    do {
      const itemIndex = getRandomInt(0, category.items.length - 1);
      itemName = category.items[itemIndex];
      itemKey = `${category.name}-${itemName}`;
      attempts++;
      // 如果尝试了10次还找不到未使用的商品，就跳出循环
      if (attempts > 10) break;
    } while (usedItems.has(itemKey));

    // 标记商品为已使用
    usedItems.add(itemKey);

    // 随机生成整数价格
    const price = getRandomInt(difficulty.minProductPrice, difficulty.maxProductPrice);

    // 创建商品对象
    const product = {
      id: i + 1,
      name: itemName,
      category: category.name,
      emoji: category.emoji,
      price: price
    };

    // 添加到商品列表
    gameState.products.push(product);
  }
}

// 更新UI
function updateUI() {
  // 更新玩家金钱
  playerMoneyElement.textContent = gameState.playerMoney;

  // 更新购物后余额
  updateRemainingBalance();

  // 更新商品列表
  renderProducts();

  // 更新购物车
  renderCart();

  // 更新按钮状态
  updateButtonStates();
}

// 更新购物后余额
function updateRemainingBalance() {
  const cartTotal = calculateCartTotal();
  const remainingBalance = gameState.playerMoney - cartTotal;
  const balanceAmountElement = document.getElementById('balance-amount');
  if (balanceAmountElement) {
    balanceAmountElement.textContent = remainingBalance;
    // 如果余额不足，显示红色
    if (remainingBalance < 0) {
      balanceAmountElement.style.color = '#e74c3c';
    } else {
      balanceAmountElement.style.color = '';
    }
  }
}

// 渲染商品列表
function renderProducts() {
  // 清空商品容器
  productsContainerElement.innerHTML = '';

  // 添加每个商品
  gameState.products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.productId = product.id;
    productCard.innerHTML = `
      <div class="product-info">
        <div class="product-info-row">
          <div class="product-name">${product.emoji} ${product.name}</div>
          <div class="product-price">${product.price} 元</div>
        </div>
      </div>
    `;

    // 检查商品是否已在购物车中
    const inCart = gameState.cart.some(item => item.id === product.id);
    // 检查是否有足够的钱购买
    const canAfford = product.price <= gameState.playerMoney;
    
    // 如果商品已在购物车中，添加禁用类
    if (inCart) {
      productCard.classList.add('in-cart');
      // 已在购物车的商品不添加点击事件，使其无法被选择
    } else if (!canAfford) {
      // 如果余额不足，添加不可购买样式
      productCard.classList.add('cannot-afford');
      // 不添加点击事件，使其无法被选择
    } else {
      // 添加点击事件 - 选中商品
      productCard.addEventListener('click', function() {
        // 移除其他商品的选中状态
        document.querySelectorAll('.product-card').forEach(card => {
          card.classList.remove('selected');
        });
        // 添加选中状态
        this.classList.add('selected');
        
        // 更新加入购物车按钮状态
        if (commonAddButton) {
          commonAddButton.disabled = false;
        }
      });
    }

    // 添加到容器
    productsContainerElement.appendChild(productCard);
  });
}

// 渲染购物车
function renderCart() {
  // 清空购物车容器
  cartItemsElement.innerHTML = '';

  // 如果购物车为空
  if (gameState.cart.length === 0) {
    cartItemsElement.innerHTML = '<div class="cart-empty">购物车是空的</div>';
    cartTotalElement.textContent = '0';
    return;
  }

  // 计算总价
  const total = calculateCartTotal();

  // 添加每个购物车项目
  gameState.cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.emoji} ${item.name}</div>
        <div class="cart-item-price">${item.price} 元</div>
      </div>
      <button class="remove-item-btn" data-product-id="${item.id}">移除</button>
    `;

    // 添加移除按钮点击事件
    const removeButton = cartItem.querySelector('.remove-item-btn');
    removeButton.addEventListener('click', () => removeFromCart(item.id));

    // 添加到购物车容器
    cartItemsElement.appendChild(cartItem);
  });

  // 更新总价
  cartTotalElement.textContent = total;
}

// 更新按钮状态
function updateButtonStates() {
  // 清空购物车按钮
  clearCartButton.disabled = gameState.cart.length === 0;

  // 结算按钮
  const total = calculateCartTotal();
  checkoutButton.disabled = gameState.cart.length === 0 || total > gameState.playerMoney;

  // 更新商品卡片状态
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = parseInt(card.dataset.productId);
    
    // 检查商品是否已在购物车中
    const inCart = gameState.cart.some(item => item.id === productId);
    
    // 获取商品价格
    const product = gameState.products.find(p => p.id === productId);
    const canAfford = product && product.price <= gameState.playerMoney;
    
    // 更新商品卡片样式
    if (inCart) {
      card.classList.add('in-cart');
      card.classList.remove('selected');
      // 已在购物车的商品不可点击
      card.style.pointerEvents = 'none';
    } else {
      // 无论余额是否足够，都保持可选中状态
      // 只在视觉上区分是否可购买
      if (!canAfford) {
        card.classList.add('cannot-afford');
      } else {
        card.classList.remove('cannot-afford');
      }
      // 保持所有未加入购物车的商品可点击
      card.style.pointerEvents = 'auto';
    }
  });

  // 更新通用加入购物车按钮状态
  if (commonAddButton) {
    const selectedProduct = document.querySelector('.product-card.selected');
    commonAddButton.disabled = !selectedProduct;
  }
}

// 添加到购物车
function addToCart(product) {
  // 检查是否已经在购物车中
  const existingItem = gameState.cart.find(item => item.id === product.id);
  if (existingItem) {
    return; // 已经在购物车中，不重复添加
  }

  // 检查是否有足够的钱
  const currentTotal = calculateCartTotal();
  if (currentTotal + product.price > gameState.playerMoney) {
    alert('余额不足，无法加入购物车');
    return; // 余额不足时直接返回，不改变商品状态
  }

  // 添加到购物车
  gameState.cart.push(product);

  // 更新UI
  renderCart();
  updateButtonStates();
  updateRemainingBalance();
}

// 从购物车移除
function removeFromCart(productId) {
  // 找到商品索引
  const index = gameState.cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    // 从购物车移除
    gameState.cart.splice(index, 1);

    // 找到对应的商品卡片并移除in-cart类
    const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (productCard) {
      productCard.classList.remove('in-cart');
    }

    // 更新UI
    renderCart();
    updateButtonStates();
    updateRemainingBalance();
  }
}

// 清空购物车
function clearCart() {
  gameState.cart = [];
  renderCart();
  updateButtonStates();
  updateRemainingBalance();
}

// 结算
function checkout() {
  // 检查购物车是否为空
  if (gameState.cart.length === 0) {
    return;
  }

  // 计算总价
  const total = calculateCartTotal();

  // 检查是否有足够的钱
  if (total > gameState.playerMoney) {
    alert('金额不足，无法结算！');
    return;
  }

  // 扣除金额
  gameState.playerMoney -= total;

  // 显示游戏结果
  showGameResult(true, gameState.cart.length, total, gameState.playerMoney);

  // 设置游戏结束标志
  gameState.isGameOver = true;
}

// 计算购物车总价
function calculateCartTotal() {
  return gameState.cart.reduce((total, item) => total + item.price, 0);
}

// 显示游戏结果
function showGameResult(isSuccess, itemsCount, totalSpent, remainingMoney) {
  // 设置结果标题
  resultTitleElement.textContent = isSuccess ? '购物成功！' : '购物失败';
  resultTitleElement.className = isSuccess ? '' : 'failure';

  // 设置结果消息
  resultMessageElement.innerHTML = `你成功购买了 <span id="items-count">${itemsCount}</span> 件商品，花费了 <span id="total-spent">${totalSpent}</span> 元。`;

  // 设置统计信息
  remainingMoneyElement.textContent = remainingMoney;

  // 显示结果弹窗
  gameResultElement.classList.remove('hidden');
}

// 切换难度
function changeDifficulty(difficulty) {
  if (DIFFICULTY_LEVELS[difficulty]) {
    currentDifficulty = difficulty;
    initializeGame();
  }
}

// 获取随机整数（包含最小值和最大值）
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 设置事件监听器
function setupEventListeners() {
  // 清空购物车按钮
  clearCartButton.addEventListener('click', clearCart);

  // 结算按钮
  checkoutButton.addEventListener('click', checkout);

  // 再玩一次按钮
  playAgainButton.addEventListener('click', initializeGame);
  
  // 返回主页按钮
  const backButton = document.getElementById('back-btn');
  if (backButton) {
    backButton.addEventListener('click', () => window.location.href = '../index.html');
  }
  
  // 重新开始游戏按钮
  const restartGameButton = document.getElementById('restart-game-btn');
  if (restartGameButton) {
    restartGameButton.addEventListener('click', initializeGame);
  }
  
  // 难度选择
  if (difficultySelectElement) {
    difficultySelectElement.addEventListener('change', (e) => {
      changeDifficulty(e.target.value);
    });
  }
  
  // 公共加入购物车按钮事件 - 使用新的按钮类名
  if (commonAddButton) {
    commonAddButton.addEventListener('click', function() {
      const selectedProduct = document.querySelector('.product-card.selected');
      if (selectedProduct) {
        const productId = parseInt(selectedProduct.dataset.productId);
        const product = gameState.products.find(p => p.id === productId);
        // 检查商品是否已在购物车中
        const inCart = gameState.cart.some(item => item.id === productId);
        if (product && !inCart) {
          // 检查是否有足够的钱
          const currentTotal = calculateCartTotal();
          if (currentTotal + product.price > gameState.playerMoney) {
            alert('余额不足，无法加入购物车');
            return; // 余额不足时直接返回，不改变商品状态
          }
          
          addToCart(product);
          // 移除选中状态
          selectedProduct.classList.remove('selected');
          // 添加已在购物车标记
          selectedProduct.classList.add('in-cart');
          // 禁用加入购物车按钮
          commonAddButton.disabled = true;
        }
      } else {
        alert('请先选择一个商品！');
      }
    });
  }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initializeGame();
});