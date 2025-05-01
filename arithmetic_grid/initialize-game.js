// 初始化游戏函数 - 导出为模块
const initializeGameModule = function() {
    // 重置游戏状态
    puzzleGrid = Array(GRID_COUNT).fill().map(() => Array(GRID_COUNT).fill(null));
    expressions = [];
    cellStatus = Array(GRID_COUNT).fill().map(() => Array(GRID_COUNT).fill(null));
    
    // 获取当前难度
    const level = levelSelector.value;
    
    // 根据难度设置表达式数量
    let expressionCount;
    switch(level) {
        case 'easy':
            expressionCount = 4;
            break;
        case 'medium':
            expressionCount = 6;
            break;
        case 'hard':
            expressionCount = 8;
            break;
        default:
            expressionCount = 4;
    }
    
    // 最大重试次数，确保生成足够的表达式
    const maxRetries = 3;
    let retryCount = 0;
    let horizontalCount = 0;
    let verticalCount = 0;
    
    // 尝试生成足够数量的表达式，如果不够则重试
    while ((horizontalCount < expressionCount || verticalCount < expressionCount) && retryCount < maxRetries) {
        // 如果是重试，清空现有表达式
        if (retryCount > 0) {
            console.log(`第 ${retryCount} 次重试生成表达式`);
            expressions = [];
        }
        
        // 创建横向表达式
        horizontalCount = createHorizontalExpressions(expressionCount);
        
        // 创建纵向表达式
        verticalCount = createVerticalExpressions(expressionCount);
        
        // 如果表达式数量不足，增加重试计数
        if (horizontalCount < expressionCount || verticalCount < expressionCount) {
            retryCount++;
        }
    }
    
    console.log(`最终生成: ${horizontalCount} 个横向表达式, ${verticalCount} 个纵向表达式`);
    
    // 处理交叉点
    processIntersections();
    
    // 根据表达式数量动态计算空白格数量，保持约2:1的比例以增加难度
    const totalExpressions = expressions.length;
    // 空白格数量为表达式数量的2倍，增加难度
    const numBlanks = Math.ceil(totalExpressions * 2);
    
    // 统一选择空白格
    selectBlanks(numBlanks);
    
    // 收集并显示调试信息
    displayDebugInfo();
}

// 导出初始化游戏函数供game.js使用
window.initializeGameModule = initializeGameModule;
// 确保函数可以直接访问
if (typeof window !== 'undefined') {
    window.initializeGameModule = initializeGameModule;
}

// 创建横向表达式
function createHorizontalExpressions(count) {
    // 获取已有的纵向表达式的位置，用于增加交叉点概率
    const verticalPositions = expressions
        .filter(expr => expr.type === 'vertical')
        .map(expr => ({ row: expr.row, col: expr.col }));
    // 创建一个映射来跟踪已占用的单元格
    const occupiedCells = new Map();
    
    // 标记所有已有表达式占用的单元格
    for (const expr of expressions) {
        if (expr.type === 'horizontal') {
            for (let offset = 0; offset < 5; offset++) {
                occupiedCells.set(`${expr.row},${expr.col + offset}`, true);
            }
        } else { // vertical
            for (let offset = 0; offset < 5; offset++) {
                occupiedCells.set(`${expr.row + offset},${expr.col}`, true);
            }
        }
    }
    
    // 记录成功创建的表达式数量
    let createdCount = 0;
    let globalAttempts = 0;
    const maxGlobalAttempts = 100; // 全局最大尝试次数
    
    while (createdCount < count && globalAttempts < maxGlobalAttempts) {
        globalAttempts++;
        
        let row, col;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 50; // 增加单个表达式的最大尝试次数
        let bestPosition = null; // 存储最佳位置（有最多交叉点的位置）
        let maxIntersections = 0; // 最大交叉点数量
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            
            // 增加与现有纵向表达式交叉的概率
            if (verticalPositions.length > 0 && Math.random() < 0.9) { // 提高到90%的概率尝试创建交叉
                // 随机选择一个纵向表达式
                const verticalExpr = verticalPositions[Math.floor(Math.random() * verticalPositions.length)];
                
                // 选择该纵向表达式的某一行作为横向表达式的行
                // 只选择纵向表达式的num1、num2或result位置作为交叉点
                const positions = [0, 2, 4]; // 对应num1、num2和result的相对位置
                const offset = positions[Math.floor(Math.random() * positions.length)];
                row = verticalExpr.row + offset;
                
                // 为横向表达式选择一个随机起始列，确保与纵向表达式交叉
                // 计算可能的起始列范围，使得横向表达式的某个数字位置与纵向表达式交叉
                const possibleCols = [
                    verticalExpr.col - 4, // 使result与纵向表达式交叉
                    verticalExpr.col - 2, // 使num2与纵向表达式交叉
                    verticalExpr.col      // 使num1与纵向表达式交叉
                ].filter(c => c >= 1 && c <= GRID_COUNT - 5);
                
                if (possibleCols.length > 0) {
                    col = possibleCols[Math.floor(Math.random() * possibleCols.length)];
                } else {
                    // 如果没有合适的位置，随机选择
                    col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                }
            } else {
                // 随机选择位置
                row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            }
            
            // 检查新表达式是否与现有表达式重叠
            validPosition = true;
            let currentIntersections = 0; // 当前位置的交叉点数量
            
            for (let offset = 0; offset < 5; offset++) {
                const cellKey = `${row},${col + offset}`;
                if (occupiedCells.has(cellKey)) {
                    // 如果是数字位置与数字位置的交叉，允许重叠
                    const isNumberPosition = (offset === 0 || offset === 2 || offset === 4); // num1, num2, result
                    
                    // 检查交叉的表达式位置
                    let crossingExpr = null;
                    for (const expr of expressions) {
                        if (expr.type === 'vertical') {
                            for (let vOffset = 0; vOffset < 5; vOffset++) {
                                if (expr.row + vOffset === row && expr.col === col + offset) {
                                    const isVerticalNumberPosition = (vOffset === 0 || vOffset === 2 || vOffset === 4);
                                    // 只允许数字位置与数字位置交叉
                                    if (isNumberPosition && isVerticalNumberPosition) {
                                        crossingExpr = expr;
                                        currentIntersections++; // 增加交叉点计数
                                    } else {
                                        validPosition = false;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    
                    // 如果不是有效的交叉点，则位置无效
                    if (!crossingExpr && !isNumberPosition) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // 如果当前位置有效且有更多的交叉点，更新最佳位置
            if (validPosition && currentIntersections > maxIntersections) {
                maxIntersections = currentIntersections;
                bestPosition = { row, col };
            }
        }
        
        // 如果找到了最佳位置（有交叉点的位置），使用它
        if (bestPosition && maxIntersections > 0) {
            row = bestPosition.row;
            col = bestPosition.col;
            validPosition = true;
        }
        
        // 如果无法找到有效位置，尝试不同的随机策略
        if (!validPosition) {
            console.warn(`尝试 ${attempts} 次后无法为横向表达式找到有效位置，尝试新策略`); 
            // 尝试在更大范围内随机选择位置
            row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            
            // 简化验证逻辑，只检查是否有完全重叠的表达式
            validPosition = true;
            for (const expr of expressions) {
                if (expr.type === 'horizontal' && expr.row === row && 
                    expr.col <= col + 4 && expr.col + 4 >= col) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        // 如果仍然无法找到有效位置，记录并继续尝试下一个
        if (!validPosition) {
            console.warn(`无法为横向表达式找到有效位置，继续尝试`); 
            continue;
        }
        
        // 尝试查找可以共享的数字
        let sharedNum1 = null;
        let sharedNum2 = null;
        let sharedResult = null;
        
        // 查找可能的共享数字位置
        for (const expr of expressions) {
            if (expr.type === 'vertical') {
                // 检查是否有纵向表达式的数字可以与当前横向表达式共享
                // 只在数字位置（而不是运算符位置）进行共享
                if (expr.col === col && expr.row <= row && expr.row + 4 >= row) {
                    // 只在数字位置共享
                    if (expr.row === row) sharedNum1 = expr.num1;
                    else if (expr.row + 2 === row) sharedNum1 = expr.num2;
                    else if (expr.row + 4 === row) sharedNum1 = expr.result;
                }
                else if (expr.col === col + 2 && expr.row <= row && expr.row + 4 >= row) {
                    // 只在数字位置共享
                    if (expr.row === row) sharedNum2 = expr.num1;
                    else if (expr.row + 2 === row) sharedNum2 = expr.num2;
                    else if (expr.row + 4 === row) sharedNum2 = expr.result;
                }
                else if (expr.col === col + 4 && expr.row <= row && expr.row + 4 >= row) {
                    // 只在数字位置共享
                    if (expr.row === row) sharedResult = expr.num1;
                    else if (expr.row + 2 === row) sharedResult = expr.num2;
                    else if (expr.row + 4 === row) sharedResult = expr.result;
                }
            }
        }
        
        // 生成随机数字和运算符，优先使用共享数字
        const num1 = sharedNum1 !== null ? sharedNum1 : generateRandomNumber();
        const num2 = sharedNum2 !== null ? sharedNum2 : generateRandomNumber();
        const operator = generateRandomOperator(levelSelector.value);
        
        // 计算结果
        const result = calculateExpression(num1, operator, num2);
        
        // 如果有共享结果，但计算出的结果与共享结果不匹配，则重新尝试
        if (sharedResult !== null && sharedResult !== result) {
            i--;
            continue;
        }
        
        // 确保结果是整数（对于除法）
        if (operator === '/' && (num1 < num2 || num1 % num2 !== 0)) {
            // 如果结果不是整数或者会导致负数，重新尝试
            continue;
        }
        
        // 确保减法不会产生负数
        if (operator === '-' && num1 < num2) {
            // 如果减法会导致负数，重新尝试
            continue;
        }
        
        // 添加表达式（不设置空白格，由selectBlanks统一处理）
        expressions.push({
            type: 'horizontal',
            row,
            col,
            num1,
            operator,
            num2,
            result,
            blank: null,
            sharedPositions: {
                num1: sharedNum1 !== null,
                num2: sharedNum2 !== null,
                result: sharedResult !== null
            }
        });
        
        // 标记新表达式占用的单元格
        for (let offset = 0; offset < 5; offset++) {
            occupiedCells.set(`${row},${col + offset}`, true);
        }
        
        createdCount++;
    }
    
    console.log(`成功创建 ${createdCount}/${count} 个横向表达式`);
    return createdCount;
}

// 创建纵向表达式
function createVerticalExpressions(count) {
    // 获取已有的横向表达式的位置，用于增加交叉点概率
    const horizontalPositions = expressions
        .filter(expr => expr.type === 'horizontal')
        .map(expr => ({ row: expr.row, col: expr.col }));
    
    // 创建一个映射来跟踪已占用的单元格
    const occupiedCells = new Map();
    
    // 标记所有已有表达式占用的单元格
    for (const expr of expressions) {
        if (expr.type === 'horizontal') {
            for (let offset = 0; offset < 5; offset++) {
                occupiedCells.set(`${expr.row},${expr.col + offset}`, true);
            }
        } else { // vertical
            for (let offset = 0; offset < 5; offset++) {
                occupiedCells.set(`${expr.row + offset},${expr.col}`, true);
            }
        }
    }
    
    // 记录成功创建的表达式数量
    let createdCount = 0;
    let globalAttempts = 0;
    const maxGlobalAttempts = 100; // 全局最大尝试次数
    
    while (createdCount < count && globalAttempts < maxGlobalAttempts) {
        globalAttempts++;
        
        let row, col;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 50; // 增加单个表达式的最大尝试次数
        let bestPosition = null; // 存储最佳位置（有最多交叉点的位置）
        let maxIntersections = 0; // 最大交叉点数量
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            
            // 增加与现有横向表达式交叉的概率
            if (horizontalPositions.length > 0 && Math.random() < 0.9) { // 提高到90%的概率尝试创建交叉
                // 随机选择一个横向表达式
                const horizontalExpr = horizontalPositions[Math.floor(Math.random() * horizontalPositions.length)];
                
                // 选择该横向表达式的某一列作为纵向表达式的列
                // 只选择横向表达式的num1、num2或result位置作为交叉点
                const positions = [0, 2, 4]; // 对应num1、num2和result的相对位置
                const offset = positions[Math.floor(Math.random() * positions.length)];
                col = horizontalExpr.col + offset;
                
                // 为纵向表达式选择一个随机起始行，确保与横向表达式交叉
                // 计算可能的起始行范围，使得纵向表达式的某个数字位置与横向表达式交叉
                const possibleRows = [
                    horizontalExpr.row - 4, // 使result与横向表达式交叉
                    horizontalExpr.row - 2, // 使num2与横向表达式交叉
                    horizontalExpr.row      // 使num1与横向表达式交叉
                ].filter(r => r >= 1 && r <= GRID_COUNT - 5);
                
                if (possibleRows.length > 0) {
                    row = possibleRows[Math.floor(Math.random() * possibleRows.length)];
                } else {
                    // 如果没有合适的位置，随机选择
                    row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                }
            } else {
                // 随机选择位置
                col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
                row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            }
            
            // 检查新表达式是否与现有表达式重叠
            validPosition = true;
            let currentIntersections = 0; // 当前位置的交叉点数量
            
            for (let offset = 0; offset < 5; offset++) {
                const cellKey = `${row + offset},${col}`;
                if (occupiedCells.has(cellKey)) {
                    // 如果是数字位置与数字位置的交叉，允许重叠
                    const isNumberPosition = (offset === 0 || offset === 2 || offset === 4); // num1, num2, result
                    
                    // 检查交叉的表达式位置
                    let crossingExpr = null;
                    for (const expr of expressions) {
                        if (expr.type === 'horizontal') {
                            for (let hOffset = 0; hOffset < 5; hOffset++) {
                                if (expr.row === row + offset && expr.col + hOffset === col) {
                                    const isHorizontalNumberPosition = (hOffset === 0 || hOffset === 2 || hOffset === 4);
                                    // 只允许数字位置与数字位置交叉
                                    if (isNumberPosition && isHorizontalNumberPosition) {
                                        crossingExpr = expr;
                                        currentIntersections++; // 增加交叉点计数
                                    } else {
                                        validPosition = false;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    
                    // 如果不是有效的交叉点，则位置无效
                    if (!crossingExpr && !isNumberPosition) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // 如果当前位置有效且有更多的交叉点，更新最佳位置
            if (validPosition && currentIntersections > maxIntersections) {
                maxIntersections = currentIntersections;
                bestPosition = { row, col };
            }
        }
        
        // 如果找到了最佳位置（有交叉点的位置），使用它
        if (bestPosition && maxIntersections > 0) {
            row = bestPosition.row;
            col = bestPosition.col;
            validPosition = true;
        }
        
        // 如果无法找到有效位置，尝试不同的随机策略
        if (!validPosition) {
            console.warn(`尝试 ${attempts} 次后无法为纵向表达式找到有效位置，尝试新策略`); 
            // 尝试在更大范围内随机选择位置
            col = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            row = Math.floor(Math.random() * (GRID_COUNT - 5)) + 1;
            
            // 简化验证逻辑，只检查是否有完全重叠的表达式
            validPosition = true;
            for (const expr of expressions) {
                if (expr.type === 'vertical' && expr.col === col && 
                    expr.row <= row + 4 && expr.row + 4 >= row) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        // 如果仍然无法找到有效位置，记录并继续尝试下一个
        if (!validPosition) {
            console.warn(`无法为纵向表达式找到有效位置，继续尝试`); 
            continue;
        }
        
        // 尝试查找可以共享的数字
        let sharedNum1 = null;
        let sharedNum2 = null;
        let sharedResult = null;
        
        // 查找可能的共享数字位置
        for (const expr of expressions) {
            if (expr.type === 'horizontal') {
                // 检查是否有横向表达式的数字可以与当前纵向表达式共享
                // 只在数字位置（而不是运算符位置）进行共享
                if (expr.row === row && expr.col <= col && expr.col + 4 >= col) {
                    // 只在数字位置共享
                    if (expr.col === col) sharedNum1 = expr.num1;
                    else if (expr.col + 2 === col) sharedNum1 = expr.num2;
                    else if (expr.col + 4 === col) sharedNum1 = expr.result;
                }
                else if (expr.row === row + 2 && expr.col <= col && expr.col + 4 >= col) {
                    // 只在数字位置共享
                    if (expr.col === col) sharedNum2 = expr.num1;
                    else if (expr.col + 2 === col) sharedNum2 = expr.num2;
                    else if (expr.col + 4 === col) sharedNum2 = expr.result;
                }
                else if (expr.row === row + 4 && expr.col <= col && expr.col + 4 >= col) {
                    // 只在数字位置共享
                    if (expr.col === col) sharedResult = expr.num1;
                    else if (expr.col + 2 === col) sharedResult = expr.num2;
                    else if (expr.col + 4 === col) sharedResult = expr.result;
                }
            }
        }
        
        // 生成随机数字和运算符，优先使用共享数字
        const num1 = sharedNum1 !== null ? sharedNum1 : generateRandomNumber();
        const num2 = sharedNum2 !== null ? sharedNum2 : generateRandomNumber();
        const operator = generateRandomOperator(levelSelector.value);
        
        // 计算结果
        const result = calculateExpression(num1, operator, num2);
        
        // 如果有共享结果，但计算出的结果与共享结果不匹配，则重新尝试
        if (sharedResult !== null && sharedResult !== result) {
            i--;
            continue;
        }
        
        // 确保结果是整数（对于除法）
        if (operator === '/' && (num1 < num2 || num1 % num2 !== 0)) {
            // 如果结果不是整数或者会导致负数，重新尝试
            continue;
        }
        
        // 确保减法不会产生负数
        if (operator === '-' && num1 < num2) {
            // 如果减法会导致负数，重新尝试
            continue;
        }
        
        // 添加表达式（不设置空白格，由selectBlanks统一处理）
        expressions.push({
            type: 'vertical',
            row,
            col,
            num1,
            operator,
            num2,
            result,
            blank: null,
            sharedPositions: {
                num1: sharedNum1 !== null,
                num2: sharedNum2 !== null,
                result: sharedResult !== null
            }
        });
        
        // 标记新表达式占用的单元格
        for (let offset = 0; offset < 5; offset++) {
            occupiedCells.set(`${row + offset},${col}`, true);
        }
        
        createdCount++;
    }
    
    console.log(`成功创建 ${createdCount}/${count} 个纵向表达式`);
    return createdCount;
}


// 选择空白格
function selectBlanks(numBlanks) {
    // 创建一个可选空白格的列表
    const availableBlanks = [];
    
    // 遍历所有表达式，找出可以作为空白格的位置
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        const { type, row, col, sharedPositions } = expr;
        
        // 检查每个位置是否可以作为空白格
        // 如果是共享数字，我们降低其被选为空白格的概率，以保留更多共享数字
        // 这样可以增加游戏的挑战性，让玩家需要填写能同时满足多个表达式的数字
        if (sharedPositions && sharedPositions.num1) {
            // 共享数字有较低的权重被选为空白格（添加一次，相对减少被选中的概率）
            availableBlanks.push({ exprIndex: i, position: 'num1', isShared: true });
        } else {
            // 非共享数字添加多次，增加其被选中的概率
            availableBlanks.push({ exprIndex: i, position: 'num1', isShared: false });
            availableBlanks.push({ exprIndex: i, position: 'num1', isShared: false }); // 添加两次增加权重
        }
        
        if (sharedPositions && sharedPositions.num2) {
            // 共享数字有较低的权重被选为空白格
            availableBlanks.push({ exprIndex: i, position: 'num2', isShared: true });
        } else {
            // 非共享数字添加多次，增加其被选中的概率
            availableBlanks.push({ exprIndex: i, position: 'num2', isShared: false });
            availableBlanks.push({ exprIndex: i, position: 'num2', isShared: false }); // 添加两次增加权重
        }
        
        if (sharedPositions && sharedPositions.result) {
            // 共享数字有较低的权重被选为空白格
            availableBlanks.push({ exprIndex: i, position: 'result', isShared: true });
        } else {
            // 非共享数字添加多次，增加其被选中的概率
            availableBlanks.push({ exprIndex: i, position: 'result', isShared: false });
            availableBlanks.push({ exprIndex: i, position: 'result', isShared: false }); // 添加两次增加权重
        }
        
        // 运算符总是可以作为空白格，并且增加其权重
        availableBlanks.push({ exprIndex: i, position: 'operator', isShared: false });
        availableBlanks.push({ exprIndex: i, position: 'operator', isShared: false }); // 添加两次增加权重
    }
    
    // 确保每个表达式至少有一个空白格
    const expressionHasBlank = new Array(expressions.length).fill(false);
    const selectedBlanks = [];
    const availableByExpr = new Map();
    
    // 为每个表达式准备可用的空白格
    for (let i = 0; i < expressions.length; i++) {
        // 获取当前表达式的所有可选空白格
        const exprBlanks = availableBlanks.filter(blank => blank.exprIndex === i);
        if (exprBlanks.length > 0) {
            availableByExpr.set(i, [...exprBlanks]);
        }
    }
    
    // 第一步：确保每个表达式至少有一个空白格
    for (let i = 0; i < expressions.length; i++) {
        if (availableByExpr.has(i)) {
            const exprBlanks = availableByExpr.get(i);
            if (exprBlanks.length > 0) {
                // 随机选择一个位置
                const randomIndex = Math.floor(Math.random() * exprBlanks.length);
                const selectedBlank = exprBlanks[randomIndex];
                
                // 添加到已选列表
                selectedBlanks.push(selectedBlank);
                expressionHasBlank[i] = true;
                
                // 从所有可用空白格中移除已选的空白格
                for (const [exprIdx, blanks] of availableByExpr.entries()) {
                    const blankIndex = blanks.findIndex(blank => 
                        blank.exprIndex === selectedBlank.exprIndex && 
                        blank.position === selectedBlank.position);
                    
                    if (blankIndex !== -1) {
                        blanks.splice(blankIndex, 1);
                    }
                }
            }
        }
    }
    
    // 第二步：确保每个表达式至少有两个空白格（如果可能）
    for (let i = 0; i < expressions.length; i++) {
        if (availableByExpr.has(i) && expressionHasBlank[i]) {
            const exprBlanks = availableByExpr.get(i);
            if (exprBlanks.length > 0) {
                // 随机选择一个位置
                const randomIndex = Math.floor(Math.random() * exprBlanks.length);
                const selectedBlank = exprBlanks[randomIndex];
                
                // 添加到已选列表
                selectedBlanks.push(selectedBlank);
                
                // 从所有可用空白格中移除已选的空白格
                for (const [exprIdx, blanks] of availableByExpr.entries()) {
                    const blankIndex = blanks.findIndex(blank => 
                        blank.exprIndex === selectedBlank.exprIndex && 
                        blank.position === selectedBlank.position);
                    
                    if (blankIndex !== -1) {
                        blanks.splice(blankIndex, 1);
                    }
                }
            }
        }
    }
    
    // 第三步：分配剩余的空白格，直到达到目标数量
    // 将所有剩余的可用空白格合并到一个列表中
    const remainingAvailable = [];
    for (const blanks of availableByExpr.values()) {
        remainingAvailable.push(...blanks);
    }
    
    // 计算还需要多少空白格
    const remainingBlanks = Math.min(numBlanks - selectedBlanks.length, remainingAvailable.length);
    
    // 随机选择剩余的空白格
    for (let i = 0; i < remainingBlanks; i++) {
        if (remainingAvailable.length === 0) break;
        
        // 随机选择一个位置
        const randomIndex = Math.floor(Math.random() * remainingAvailable.length);
        const selectedBlank = remainingAvailable[randomIndex];
        
        // 从可选列表中移除
        remainingAvailable.splice(randomIndex, 1);
        
        // 添加到已选列表
        selectedBlanks.push(selectedBlank);
    }
    
    // 将选中的位置设置为空白格
    for (const { exprIndex, position } of selectedBlanks) {
        expressions[exprIndex].blank = position;
    }
    
    // 检查是否每个表达式都至少有一个空白格
    let allHaveBlank = true;
    for (let i = 0; i < expressions.length; i++) {
        if (!expressionHasBlank[i]) {
            allHaveBlank = false;
            console.warn(`表达式 ${i} 没有空白格！`);
        }
    }
    
    console.log(`总共选择了 ${selectedBlanks.length} 个空白格，目标是 ${numBlanks} 个`);
    console.log(`所有表达式都有空白格: ${allHaveBlank}`);
}

// 处理交叉点
function processIntersections() {
    // 为每个表达式初始化交叉点信息和共享位置信息
    for (let expr of expressions) {
        if (!expr.intersections) {
            expr.intersections = {};
        }
        if (!expr.sharedPositions) {
            expr.sharedPositions = {
                num1: false,
                num2: false,
                result: false
            };
        }
        // 确保crossPoints属性初始化
        if (!expr.crossPoints) {
            expr.crossPoints = [];
        }
    }
    
    // 创建一个映射来跟踪每个单元格的使用情况
    const cellUsage = new Map();
    
    // 首先标记所有表达式占用的单元格
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        
        if (expr.type === 'horizontal') {
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row},${expr.col + offset}`;
                if (!cellUsage.has(key)) {
                    cellUsage.set(key, []);
                }
                cellUsage.get(key).push({
                    exprIndex: i,
                    position: offset === 0 ? 'num1' : 
                              offset === 1 ? 'operator' : 
                              offset === 2 ? 'num2' : 
                              offset === 3 ? 'equals' : 'result'
                });
            }
        } else { // vertical
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row + offset},${expr.col}`;
                if (!cellUsage.has(key)) {
                    cellUsage.set(key, []);
                }
                cellUsage.get(key).push({
                    exprIndex: i,
                    position: offset === 0 ? 'num1' : 
                              offset === 1 ? 'operator' : 
                              offset === 2 ? 'num2' : 
                              offset === 3 ? 'equals' : 'result'
                });
            }
        }
    }
    
    // 检查是否有表达式重叠（同类型表达式在同一位置）
    // 在处理交叉点之前先检查重叠，如果有重叠则移除重叠的表达式
    const horizontalExprPositions = new Map();
    const verticalExprPositions = new Map();
    const expressionsToRemove = new Set();
    
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        
        if (expressionsToRemove.has(i)) continue; // 跳过已标记为移除的表达式
        
        if (expr.type === 'horizontal') {
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row},${expr.col + offset}`;
                if (horizontalExprPositions.has(key)) {
                    // 找到重叠的表达式索引
                    const overlapExprIndex = horizontalExprPositions.get(key);
                    // 标记较新的表达式为移除
                    expressionsToRemove.add(i);
                    console.warn(`检测到横向表达式重叠在位置: ${key}，移除表达式索引 ${i}`);
                    break; // 一旦发现重叠，不需要继续检查此表达式
                }
                horizontalExprPositions.set(key, i);
            }
        } else { // vertical
            for (let offset = 0; offset < 5; offset++) {
                const key = `${expr.row + offset},${expr.col}`;
                if (verticalExprPositions.has(key)) {
                    // 找到重叠的表达式索引
                    const overlapExprIndex = verticalExprPositions.get(key);
                    // 标记较新的表达式为移除
                    expressionsToRemove.add(i);
                    console.warn(`检测到纵向表达式重叠在位置: ${key}，移除表达式索引 ${i}`);
                    break; // 一旦发现重叠，不需要继续检查此表达式
                }
                verticalExprPositions.set(key, i);
            }
        }
    }
    
    // 移除重叠的表达式
    if (expressionsToRemove.size > 0) {
        console.warn(`移除 ${expressionsToRemove.size} 个重叠的表达式`);
        // 从大到小排序，以便正确移除
        const indicesToRemove = Array.from(expressionsToRemove).sort((a, b) => b - a);
        for (const index of indicesToRemove) {
            expressions.splice(index, 1);
        }
        
        // 重新构建cellUsage映射
        cellUsage.clear();
        for (let i = 0; i < expressions.length; i++) {
            const expr = expressions[i];
            
            if (expr.type === 'horizontal') {
                for (let offset = 0; offset < 5; offset++) {
                    const key = `${expr.row},${expr.col + offset}`;
                    if (!cellUsage.has(key)) {
                        cellUsage.set(key, []);
                    }
                    cellUsage.get(key).push({
                        exprIndex: i,
                        position: offset === 0 ? 'num1' : 
                                  offset === 1 ? 'operator' : 
                                  offset === 2 ? 'num2' : 
                                  offset === 3 ? 'equals' : 'result'
                    });
                }
            } else { // vertical
                for (let offset = 0; offset < 5; offset++) {
                    const key = `${expr.row + offset},${expr.col}`;
                    if (!cellUsage.has(key)) {
                        cellUsage.set(key, []);
                    }
                    cellUsage.get(key).push({
                        exprIndex: i,
                        position: offset === 0 ? 'num1' : 
                                  offset === 1 ? 'operator' : 
                                  offset === 2 ? 'num2' : 
                                  offset === 3 ? 'equals' : 'result'
                    });
                }
            }
        }
    }
    
    // 检查并处理交叉点
    const operatorEqualsOverlaps = new Set(); // 用于跟踪运算符或等号重叠
    
    for (const [cellKey, usages] of cellUsage.entries()) {
        // 只处理有多个表达式使用的单元格（交叉点）
        if (usages.length > 1) {
            // 确保只处理横向和纵向表达式的交叉
            const horizontalUsages = usages.filter(u => expressions[u.exprIndex].type === 'horizontal');
            const verticalUsages = usages.filter(u => expressions[u.exprIndex].type === 'vertical');
            
            if (horizontalUsages.length > 0 && verticalUsages.length > 0) {
                // 获取交叉的表达式
                const horizontalUsage = horizontalUsages[0];
                const verticalUsage = verticalUsages[0];
                const horizontal = expressions[horizontalUsage.exprIndex];
                const vertical = expressions[verticalUsage.exprIndex];
                const horizontalPos = horizontalUsage.position;
                const verticalPos = verticalUsage.position;
                
                // 检查是否有运算符或等号重叠
                const isOperatorOrEquals = pos => pos === 'operator' || pos === 'equals';
                
                if (isOperatorOrEquals(horizontalPos) || isOperatorOrEquals(verticalPos)) {
                    // 决定移除哪个表达式（这里选择移除较新添加的表达式）
                    const indexToRemove = Math.max(horizontalUsage.exprIndex, verticalUsage.exprIndex);
                    operatorEqualsOverlaps.add(indexToRemove);
                    console.warn(`检测到运算符或等号重叠在位置: ${cellKey}，标记表达式索引 ${indexToRemove} 为移除`);
                    continue; // 跳过此交叉点的处理
                }
                
                // 只处理数字位置的交叉（不处理运算符和等号）
                // 确保交叉点不是运算符或等号位置
                if ((horizontalPos === 'num1' || horizontalPos === 'num2' || horizontalPos === 'result') &&
                    (verticalPos === 'num1' || verticalPos === 'num2' || verticalPos === 'result')) {
                    
                    // 记录交叉点信息
                    horizontal.intersections[horizontalPos] = { with: verticalUsage.exprIndex, at: verticalPos };
                    vertical.intersections[verticalPos] = { with: horizontalUsage.exprIndex, at: horizontalPos };
                    
                    // 标记为共享位置
                    horizontal.sharedPositions[horizontalPos] = true;
                    vertical.sharedPositions[verticalPos] = true;
                    
                    // 确保两个表达式在交叉点处的值相同
                    let sharedValue;
                    let horizontalValid = false;
                    let verticalValid = false;
                    
                    // 首先检查是否已有值
                    if (horizontal[horizontalPos] !== undefined && horizontal[horizontalPos] !== null) {
                        sharedValue = horizontal[horizontalPos];
                        vertical[verticalPos] = sharedValue;
                    } else if (vertical[verticalPos] !== undefined && vertical[verticalPos] !== null) {
                        sharedValue = vertical[verticalPos];
                        horizontal[horizontalPos] = sharedValue;
                    } else {
                        // 如果都没有值，生成一个新的随机值
                        sharedValue = generateRandomNumber();
                        horizontal[horizontalPos] = sharedValue;
                        vertical[verticalPos] = sharedValue;
                    }
                    
                    // 验证横向表达式是否有效
                    if (horizontalPos === 'num1' || horizontalPos === 'num2') {
                        // 如果修改的是操作数，验证结果是否正确
                        const calculatedResult = calculateExpression(horizontal.num1, horizontal.operator, horizontal.num2);
                        horizontalValid = (calculatedResult === horizontal.result);
                    } else if (horizontalPos === 'result') {
                        // 如果修改的是结果，验证是否可以通过操作数计算得到
                        const calculatedResult = calculateExpression(horizontal.num1, horizontal.operator, horizontal.num2);
                        horizontalValid = (calculatedResult === horizontal.result);
                    }
                    
                    // 验证纵向表达式是否有效
                    if (verticalPos === 'num1' || verticalPos === 'num2') {
                        // 如果修改的是操作数，验证结果是否正确
                        const calculatedResult = calculateExpression(vertical.num1, vertical.operator, vertical.num2);
                        verticalValid = (calculatedResult === vertical.result);
                    } else if (verticalPos === 'result') {
                        // 如果修改的是结果，验证是否可以通过操作数计算得到
                        const calculatedResult = calculateExpression(vertical.num1, vertical.operator, vertical.num2);
                        verticalValid = (calculatedResult === vertical.result);
                    }
                    
                    // 如果任一表达式无效，尝试调整
                    if (!horizontalValid || !verticalValid) {
                        console.warn(`交叉点处的共享值 ${sharedValue} 导致表达式无效，尝试调整...`);
                        
                        // 尝试调整横向表达式
                        if (!horizontalValid) {
                            if (horizontalPos === 'num1') {
                                // 如果修改的是第一个操作数，调整第二个操作数使表达式有效
                                if (horizontal.operator === '+') {
                                    horizontal.num2 = horizontal.result - horizontal.num1;
                                } else if (horizontal.operator === '-') {
                                    horizontal.num2 = Math.abs(horizontal.result - horizontal.num1);
                                } else if (horizontal.operator === '*') {
                                    if (horizontal.num1 !== 0 && horizontal.result % horizontal.num1 === 0) {
                                        horizontal.num2 = horizontal.result / horizontal.num1;
                                    } else {
                                        // 无法通过乘法得到整数结果，调整结果
                                        horizontal.result = horizontal.num1 * horizontal.num2;
                                    }
                                } else if (horizontal.operator === '/') {
                                    horizontal.num2 = horizontal.num1 / horizontal.result;
                                    if (horizontal.num2 !== Math.floor(horizontal.num2)) {
                                        // 无法通过除法得到整数结果，调整结果
                                        horizontal.result = Math.floor(horizontal.num1 / horizontal.num2);
                                    }
                                }
                            } else if (horizontalPos === 'num2') {
                                // 如果修改的是第二个操作数，调整结果使表达式有效
                                horizontal.result = calculateExpression(horizontal.num1, horizontal.operator, horizontal.num2);
                            } else if (horizontalPos === 'result') {
                                // 如果修改的是结果，调整第二个操作数使表达式有效
                                if (horizontal.operator === '+') {
                                    horizontal.num2 = horizontal.result - horizontal.num1;
                                } else if (horizontal.operator === '-') {
                                    horizontal.num2 = Math.abs(horizontal.result - horizontal.num1);
                                } else if (horizontal.operator === '*') {
                                    if (horizontal.num1 !== 0 && horizontal.result % horizontal.num1 === 0) {
                                        horizontal.num2 = horizontal.result / horizontal.num1;
                                    } else {
                                        // 无法通过乘法得到整数结果，调整第一个操作数
                                        horizontal.num1 = Math.floor(horizontal.result / horizontal.num2);
                                        horizontal.result = horizontal.num1 * horizontal.num2;
                                    }
                                } else if (horizontal.operator === '/') {
                                    horizontal.num2 = horizontal.num1 / horizontal.result;
                                    if (horizontal.num2 !== Math.floor(horizontal.num2)) {
                                        // 无法通过除法得到整数结果，调整第一个操作数
                                        horizontal.num1 = horizontal.result * horizontal.num2;
                                    }
                                }
                            }
                        }
                        
                        // 尝试调整纵向表达式
                        if (!verticalValid) {
                            if (verticalPos === 'num1') {
                                // 如果修改的是第一个操作数，调整第二个操作数使表达式有效
                                if (vertical.operator === '+') {
                                    vertical.num2 = vertical.result - vertical.num1;
                                } else if (vertical.operator === '-') {
                                    vertical.num2 = Math.abs(vertical.result - vertical.num1);
                                } else if (vertical.operator === '*') {
                                    if (vertical.num1 !== 0 && vertical.result % vertical.num1 === 0) {
                                        vertical.num2 = vertical.result / vertical.num1;
                                    } else {
                                        // 无法通过乘法得到整数结果，调整结果
                                        vertical.result = vertical.num1 * vertical.num2;
                                    }
                                } else if (vertical.operator === '/') {
                                    vertical.num2 = vertical.num1 / vertical.result;
                                    if (vertical.num2 !== Math.floor(vertical.num2)) {
                                        // 无法通过除法得到整数结果，调整结果
                                        vertical.result = Math.floor(vertical.num1 / vertical.num2);
                                    }
                                }
                            } else if (verticalPos === 'num2') {
                                // 如果修改的是第二个操作数，调整结果使表达式有效
                                vertical.result = calculateExpression(vertical.num1, vertical.operator, vertical.num2);
                            } else if (verticalPos === 'result') {
                                // 如果修改的是结果，调整第二个操作数使表达式有效
                                if (vertical.operator === '+') {
                                    vertical.num2 = vertical.result - vertical.num1;
                                } else if (vertical.operator === '-') {
                                    vertical.num2 = Math.abs(vertical.result - vertical.num1);
                                } else if (vertical.operator === '*') {
                                    if (vertical.num1 !== 0 && vertical.result % vertical.num1 === 0) {
                                        vertical.num2 = vertical.result / vertical.num1;
                                    } else {
                                        // 无法通过乘法得到整数结果，调整第一个操作数
                                        vertical.num1 = Math.floor(vertical.result / vertical.num2);
                                        vertical.result = vertical.num1 * vertical.num2;
                                    }
                                } else if (vertical.operator === '/') {
                                    vertical.num2 = vertical.num1 / vertical.result;
                                    if (vertical.num2 !== Math.floor(vertical.num2)) {
                                        // 无法通过除法得到整数结果，调整第一个操作数
                                        vertical.num1 = vertical.result * vertical.num2;
                                    }
                                }
                            }
                        }
                        
                        // 再次验证调整后的表达式
                        const horizontalResult = calculateExpression(horizontal.num1, horizontal.operator, horizontal.num2);
                        const verticalResult = calculateExpression(vertical.num1, vertical.operator, vertical.num2);
                        
                        console.log(`调整后的横向表达式: ${horizontal.num1} ${horizontal.operator} ${horizontal.num2} = ${horizontal.result}，计算结果: ${horizontalResult}`);
                        console.log(`调整后的纵向表达式: ${vertical.num1} ${vertical.operator} ${vertical.num2} = ${vertical.result}，计算结果: ${verticalResult}`);
                        
                        // 确保交叉点的值在两个表达式中保持一致
                        if (horizontalPos === 'num1') horizontal.num1 = sharedValue;
                        else if (horizontalPos === 'num2') horizontal.num2 = sharedValue;
                        else if (horizontalPos === 'result') horizontal.result = sharedValue;
                        
                        if (verticalPos === 'num1') vertical.num1 = sharedValue;
                        else if (verticalPos === 'num2') vertical.num2 = sharedValue;
                        else if (verticalPos === 'result') vertical.result = sharedValue;
                    }
                    
                    // 解决空白格问题：在交叉点处，我们不强制两个表达式都设置空白格
                    // 而是记录这是一个交叉点，以便在selectBlanks函数中特殊处理
                    const [row, col] = cellKey.split(',').map(Number);
                    
                    // 添加交叉点信息到两个表达式中
                    horizontal.crossPoints.push({
                        row, col, position: horizontalPos,
                        withExpr: verticalUsage.exprIndex, atPosition: verticalPos
                    });
                    
                    vertical.crossPoints.push({
                        row, col, position: verticalPos,
                        withExpr: horizontalUsage.exprIndex, atPosition: horizontalPos
                    });
                }
            }
        }
    }
    
    // 移除因运算符或等号重叠而标记的表达式
    if (operatorEqualsOverlaps.size > 0) {
        console.warn(`移除 ${operatorEqualsOverlaps.size} 个因运算符或等号重叠的表达式`);
        // 从大到小排序，以便正确移除
        const indicesToRemove = Array.from(operatorEqualsOverlaps).sort((a, b) => b - a);
        for (const index of indicesToRemove) {
            expressions.splice(index, 1);
        }
    }
    
    // 计算交叉点数量
    let crossPointCount = 0;
    for (const expr of expressions) {
        crossPointCount += expr.crossPoints.length;
    }
    // 由于每个交叉点在两个表达式中都有记录，所以实际交叉点数量是记录数的一半
    crossPointCount = crossPointCount / 2;
    
    console.log(`表达式处理完成，总共有 ${expressions.length} 个表达式，${crossPointCount} 个交叉点`);
}
