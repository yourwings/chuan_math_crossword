// 调试信息相关函数

// 收集并显示调试信息
function displayDebugInfo() {
    // 收集调试信息
    const debugInfo = collectDebugInfo();
    
    // 在控制台输出调试信息
    console.log('调试信息:', debugInfo);
    
    // 在游戏界面显示调试信息
    renderDebugInfo(debugInfo);
}

// 收集调试信息
function collectDebugInfo() {
    // 创建调试信息对象
    const debugInfo = {
        horizontalExpressions: 0,
        verticalExpressions: 0,
        intersections: [],
        blanks: [],
        expressionDetails: [] // 新增表达式详细信息数组
    };
    
    // 统计横向和纵向表达式数量，并收集表达式详细信息
    for (const expr of expressions) {
        if (expr.type === 'horizontal') {
            debugInfo.horizontalExpressions++;
        } else if (expr.type === 'vertical') {
            debugInfo.verticalExpressions++;
        }
        
        // 收集表达式详细信息
        const exprDetail = {
            type: expr.type,
            row: expr.row + 1, // 坐标从1开始显示
            col: expr.col + 1,
            expression: `${expr.num1} ${expr.operator} ${expr.num2} = ${expr.result}`,
            blank: expr.blank || 'none'
        };
        
        debugInfo.expressionDetails.push(exprDetail);
    }
    
    // 收集交叉点信息
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        
        // 遍历表达式的所有交叉点
        for (const pos in expr.intersections) {
            const intersection = expr.intersections[pos];
            const otherExpr = expressions[intersection.with];
            
            // 计算交叉点的坐标
            let row, col;
            if (expr.type === 'horizontal') {
                row = expr.row;
                col = expr.col;
                
                // 根据位置调整列坐标
                if (pos === 'num1') col = expr.col;
                else if (pos === 'num2') col = expr.col + 2;
                else if (pos === 'result') col = expr.col + 4;
            } else { // vertical
                row = expr.row;
                col = expr.col;
                
                // 根据位置调整行坐标
                if (pos === 'num1') row = expr.row;
                else if (pos === 'num2') row = expr.row + 2;
                else if (pos === 'result') row = expr.row + 4;
            }
            
            // 添加到交叉点列表，避免重复添加
            const intersectionInfo = { row: row + 1, col: col + 1 }; // 坐标从1开始
            const isDuplicate = debugInfo.intersections.some(item => 
                item.row === row + 1 && item.col === col + 1
            );
            
            if (!isDuplicate) {
                debugInfo.intersections.push(intersectionInfo);
            }
        }
    }
    
    // 收集空白格信息
    // 首先创建一个集合来跟踪所有空白格的坐标
    const blankCellSet = new Set();
    
    // 遍历所有表达式，收集空白格信息
    for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        
        if (expr.blank) {
            let row, col;
            
            if (expr.type === 'horizontal') {
                row = expr.row;
                
                // 根据空白格位置调整坐标
                if (expr.blank === 'num1') col = expr.col;
                else if (expr.blank === 'operator') col = expr.col + 1;
                else if (expr.blank === 'num2') col = expr.col + 2;
                else if (expr.blank === 'equals') col = expr.col + 3;
                else if (expr.blank === 'result') col = expr.col + 4;
            } else { // vertical
                col = expr.col;
                
                // 根据空白格位置调整坐标
                if (expr.blank === 'num1') row = expr.row;
                else if (expr.blank === 'operator') row = expr.row + 1;
                else if (expr.blank === 'num2') row = expr.row + 2;
                else if (expr.blank === 'equals') row = expr.row + 3;
                else if (expr.blank === 'result') row = expr.row + 4;
            }
            
            // 将坐标添加到集合中（坐标从0开始）
            const key = `${row},${col}`;
            blankCellSet.add(key);
        }
    }
    
    // 将集合中的所有空白格转换为数组
    for (const key of blankCellSet) {
        const [row, col] = key.split(',').map(Number);
        // 添加到空白格列表（坐标从1开始显示）
        debugInfo.blanks.push({ row: row + 1, col: col + 1 });
    }
    
    // 打印所有空白格的坐标，用于调试
    console.log('空白格坐标集合:', Array.from(blankCellSet).map(key => {
        const [row, col] = key.split(',').map(Number);
        return `(${row + 1}, ${col + 1})`;
    }).join(', '));
    
    return debugInfo;
}

// 在游戏界面渲染调试信息
function renderDebugInfo(debugInfo) {
    // 创建或获取调试信息容器
    let debugContainer = document.getElementById('debug-info-container');
    
    if (!debugContainer) {
        // 如果容器不存在，创建一个新的
        debugContainer = document.createElement('div');
        debugContainer.id = 'debug-info-container';
        debugContainer.className = 'debug-info-container';
        
        // 设置样式
        debugContainer.style.position = 'absolute';
        debugContainer.style.top = '10px';
        debugContainer.style.right = '10px';
        debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugContainer.style.color = 'white';
        debugContainer.style.padding = '10px';
        debugContainer.style.borderRadius = '5px';
        debugContainer.style.fontSize = '14px';
        debugContainer.style.maxWidth = '300px';
        debugContainer.style.maxHeight = '400px';
        debugContainer.style.overflowY = 'auto';
        debugContainer.style.zIndex = '1000';
        debugContainer.style.width = '30px';
        debugContainer.style.height = '30px';
        debugContainer.style.overflow = 'hidden';
        
        // 添加到文档
        document.body.appendChild(debugContainer);
    }
    
    // 检查容器当前状态
    if (debugContainer.style.width === '30px' && debugContainer.style.height === '30px') {
        // 如果是折叠状态，显示展开按钮
        debugContainer.innerHTML = '<button id="toggle-debug-info" style="width: 30px; height: 30px;">+</button>';
        
        // 添加展开按钮事件
        document.getElementById('toggle-debug-info').addEventListener('click', function() {
            // 展开调试信息
            debugContainer.style.width = '';
            debugContainer.style.height = '';
            debugContainer.style.maxWidth = '300px';
            debugContainer.style.maxHeight = '400px';
            debugContainer.style.overflow = 'auto';
            
            // 重新渲染完整内容
            let html = '<h3>调试信息</h3>';
            
            // 表达式数量
            html += `<p>横向表达式: ${debugInfo.horizontalExpressions}</p>`;
            html += `<p>纵向表达式: ${debugInfo.verticalExpressions}</p>`;
            
            // 交叉点信息
            html += `<p>交叉点数量: ${debugInfo.intersections.length}</p>`;
            html += '<details><summary>交叉点坐标</summary><ul>';
            debugInfo.intersections.forEach((point, index) => {
                html += `<li>${index + 1}: (${point.row}, ${point.col})</li>`;
            });
            html += '</ul></details>';
            
            // 空白格信息
            html += `<p>空白格数量: ${debugInfo.blanks.length}</p>`;
            html += '<details><summary>空白格坐标</summary><ul>';
            debugInfo.blanks.forEach((point, index) => {
                html += `<li>${index + 1}: (${point.row}, ${point.col})</li>`;
            });
            html += '</ul></details>';
            
            // 添加表达式详细信息
            html += '<details><summary>表达式详细信息</summary><ul>';
            debugInfo.expressionDetails.forEach((expr, index) => {
                html += `<li>${index + 1}: ${expr.type === 'horizontal' ? '横向' : '纵向'} (${expr.row}, ${expr.col}) - ${expr.expression} [空白: ${expr.blank}]</li>`;
            });
            html += '</ul></details>';
            
            // 添加复制按钮和隐藏按钮
            html += '<button id="copy-expressions-btn" style="margin-top: 10px; margin-right: 10px; padding: 5px;">复制表达式信息</button>';
            html += '<button id="toggle-debug-info" style="margin-top: 10px; padding: 5px;">隐藏调试信息</button>';
            
            // 更新容器内容
            debugContainer.innerHTML = html;
            
            // 添加隐藏按钮事件
            document.getElementById('toggle-debug-info').addEventListener('click', function() {
                if (this.textContent === '隐藏调试信息') {
                    debugContainer.style.width = '30px';
                    debugContainer.style.height = '30px';
                    debugContainer.style.overflow = 'hidden';
                    renderDebugInfo(debugInfo);
                }
            });
        });
    } else {
        // 如果是展开状态，显示完整内容
        let html = '<h3>调试信息</h3>';
        
        // 表达式数量
        html += `<p>横向表达式: ${debugInfo.horizontalExpressions}</p>`;
        html += `<p>纵向表达式: ${debugInfo.verticalExpressions}</p>`;
        
        // 交叉点信息
        html += `<p>交叉点数量: ${debugInfo.intersections.length}</p>`;
        html += '<details><summary>交叉点坐标</summary><ul>';
        debugInfo.intersections.forEach((point, index) => {
            html += `<li>${index + 1}: (${point.row}, ${point.col})</li>`;
        });
        html += '</ul></details>';
        
        // 空白格信息
        html += `<p>空白格数量: ${debugInfo.blanks.length}</p>`;
        html += '<details><summary>空白格坐标</summary><ul>';
        debugInfo.blanks.forEach((point, index) => {
            html += `<li>${index + 1}: (${point.row}, ${point.col})</li>`;
        });
        html += '</ul></details>';
        
        // 添加表达式详细信息
        html += '<details><summary>表达式详细信息</summary><ul>';
        debugInfo.expressionDetails.forEach((expr, index) => {
            html += `<li>${index + 1}: ${expr.type === 'horizontal' ? '横向' : '纵向'} (${expr.row}, ${expr.col}) - ${expr.expression} [空白: ${expr.blank}]</li>`;
        });
        html += '</ul></details>';
        
        // 添加复制按钮和切换按钮
        html += '<button id="copy-expressions-btn" style="margin-top: 10px; margin-right: 10px; padding: 5px;">复制表达式信息</button>';
        html += '<button id="toggle-debug-info" style="margin-top: 10px; padding: 5px;">隐藏调试信息</button>';
        
        // 更新容器内容
        debugContainer.innerHTML = html;
    }
    
    // 如果不是折叠状态，添加切换按钮事件和复制按钮事件
    if (debugContainer.style.width !== '30px' || debugContainer.style.height !== '30px') {
        document.getElementById('toggle-debug-info').addEventListener('click', function() {
            if (this.textContent === '隐藏调试信息') {
                debugContainer.style.width = '30px';
                debugContainer.style.height = '30px';
                debugContainer.style.overflow = 'hidden';
                renderDebugInfo(debugInfo);
            }
        });
        
        // 添加复制按钮事件
        document.getElementById('copy-expressions-btn').addEventListener('click', function() {
            // 创建要复制的文本
            let copyText = '表达式信息:\n';
            debugInfo.expressionDetails.forEach((expr, index) => {
                copyText += `${index + 1}: ${expr.type === 'horizontal' ? '横向' : '纵向'} (${expr.row}, ${expr.col}) - ${expr.expression} [空白: ${expr.blank}]\n`;
            });
            
            // 复制到剪贴板
            navigator.clipboard.writeText(copyText)
                .then(() => {
                    alert('表达式信息已复制到剪贴板！');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请查看控制台获取详细信息。');
                });
        });
    }
}