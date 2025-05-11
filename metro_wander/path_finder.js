// 路径查找算法模块
// 优化的路径搜索算法，优先考虑换乘站作为搜索节点

import { metroData, getConnectedStations } from './metro_data.js';

// 创建全局PathFinder对象，用于调试信息收集
class PathFinder {
  constructor() {
    this.searchedPaths = [];
    this.foundPaths = [];
    this.transferInfo = [];
    this.reset();
  }
  
  reset() {
    this.searchedPaths = [];
    this.foundPaths = [];
    this.transferInfo = [];
  }
  
  // 记录搜索过的路径
  addSearchedPath(path) {
    // 只保留最近的50条路径，避免内存占用过大
    if (this.searchedPaths.length >= 50) {
      this.searchedPaths.shift();
    }
    this.searchedPaths.push(path);
  }
  
  // 记录找到的路径
  addFoundPath(path) {
    this.foundPaths.push(path);
  }
  
  // 记录换乘信息
  addTransferInfo(transferInfo) {
    this.transferInfo = transferInfo;
  }
}

// 创建全局PathFinder实例
window.pathFinder = new PathFinder();

/**
 * 查找从起点站到终点站的路径
 * @param {string} start 起点站名
 * @param {string} end 终点站名
 * @param {number} maxLength 路径最大长度
 * @param {number} minLength 路径最小长度
 * @param {boolean} isCreatorMode 是否为出题版模式
 * @returns {Promise<string[]|null>} 返回路径数组或null
 */
async function findPath(start, end, maxLength, minLength = 1, isCreatorMode = false) {
  // 返回Promise以支持异步操作
  return new Promise((resolve) => {
    setTimeout(() => {
      // 重置PathFinder，准备新的搜索
      if (window.pathFinder) {
        window.pathFinder.reset();
      }
      // 开始调试日志
      console.log(`%c路径搜索开始: 从 ${start} 到 ${end}`, 'color: blue; font-weight: bold');
      console.log(`搜索参数: 最小长度=${minLength}, 最大长度=${maxLength}, 出题模式=${isCreatorMode}`);
      
      // 根据游戏模式调整搜索参数
      if (isCreatorMode) {
        // 出题版模式，扩大搜索范围
        maxLength = 15; // 扩大最大路径长度
        minLength = 1;  // 允许任何长度的路径
        console.log('出题模式: 调整参数为 最小长度=1, 最大长度=15');
      } else {
        // 单人漫游模式，确保路径长度合理
        maxLength = Math.min(maxLength, 12); // 限制最大路径长度
        minLength = Math.max(minLength, 1); // 确保最小路径长度至少为1
        console.log(`单人漫游模式: 调整参数为 最小长度=${minLength}, 最大长度=${maxLength}`);
      }
      
      // 检查起点和终点是否直接相连
      const directlyConnected = areStationsConnected(start, end);
      console.log(`起点和终点是否直接相连: ${directlyConnected ? '是' : '否'}`);
      
      // 获取起点站和终点站的线路信息
      const startStationObj = metroData.stations.find(s => s.name === start);
      const endStationObj = metroData.stations.find(s => s.name === end);
      
      if (startStationObj && endStationObj) {
        console.log(`起点站 ${start} 所属线路: ${startStationObj.lines.map(line => {
          const lineObj = metroData.lines.find(l => l.id === line);
          return lineObj ? lineObj.name : line;
        }).join(', ')}`);
        
        console.log(`终点站 ${end} 所属线路: ${endStationObj.lines.map(line => {
          const lineObj = metroData.lines.find(l => l.id === line);
          return lineObj ? lineObj.name : line;
        }).join(', ')}`);
      } else {
        console.error(`错误: ${!startStationObj ? '起点站不存在' : '终点站不存在'}`);
      }
      
      // 检查是否需要换乘（起点站和终点站是否有共同线路）
      let requireTransfer = true;
      let commonLines = [];
      if (startStationObj && endStationObj) {
        for (const line of startStationObj.lines) {
          if (endStationObj.lines.includes(line)) {
            requireTransfer = false;
            commonLines.push(line);
          }
        }
      }
      
      console.log(`是否需要换乘: ${requireTransfer ? '是' : '否'}`);
      if (!requireTransfer && commonLines.length > 0) {
        console.log(`共同线路: ${commonLines.map(line => {
          const lineObj = metroData.lines.find(l => l.id === line);
          return lineObj ? lineObj.name : line;
        }).join(', ')}`);
      }
      
      // 使用广度优先搜索找到符合长度要求的路径
      const queue = [[start]];
      const visited = new Map(); // 使用Map来存储每个站点的访问深度，优化剪枝
      visited.set(start, 0);
      const validPaths = [];
      
      // 优化：设置最大队列长度，防止内存溢出
      const MAX_QUEUE_SIZE = 50000;
      // 优化：设置最大搜索时间（毫秒）
      const MAX_SEARCH_TIME = isCreatorMode ? 15000 : 25000;
      const startTime = Date.now();
      console.log(`搜索限制: 最大队列长度=${MAX_QUEUE_SIZE}, 最大搜索时间=${MAX_SEARCH_TIME}ms`);
      
      // 优化：预先计算所有站点的连接关系，避免重复查询
      const stationConnections = {};
      metroData.stations.forEach(station => {
        stationConnections[station.name] = getConnectedStations(station.name);
      });
      
      // 记录起点站的连接情况
      if (stationConnections[start]) {
        console.log(`起点站 ${start} 连接到的站点: ${stationConnections[start].join(', ')}`);
      }
      
      // 记录终点站的连接情况
      if (stationConnections[end]) {
        console.log(`终点站 ${end} 连接到的站点: ${stationConnections[end].join(', ')}`);
      }
      
      // 优化：设置最大路径数量
      const MAX_VALID_PATHS = isCreatorMode ? 10 : 20;
      console.log(`最大有效路径数量: ${MAX_VALID_PATHS}`);
      
      // 创建搜索统计信息
      const searchStats = {
        expandedNodes: 0,
        visitedStations: new Set(),
        maxQueueSize: 1,
        pathsFound: 0
      };
  
      while (queue.length > 0) {
        // 更新搜索统计信息
        searchStats.expandedNodes++;
        searchStats.maxQueueSize = Math.max(searchStats.maxQueueSize, queue.length);
        
        // 每100个节点输出一次搜索进度
        if (searchStats.expandedNodes % 100 === 0) {
          console.log(`搜索进度: 已展开${searchStats.expandedNodes}个节点, 队列长度=${queue.length}, 已找到${validPaths.length}条路径`);
        }
        
        // 优化：检查是否超时或队列过长
        if (Date.now() - startTime > MAX_SEARCH_TIME || queue.length > MAX_QUEUE_SIZE) {
          console.log(`%c搜索时间或队列长度超限，提前返回结果: 耗时=${Date.now() - startTime}ms, 队列长度=${queue.length}`, 'color: orange; font-weight: bold');
          break;
        }
        
        // 如果已经找到足够多的有效路径，提前结束搜索
        if (validPaths.length >= MAX_VALID_PATHS) {
          console.log(`%c已找到${validPaths.length}条有效路径，提前结束搜索`, 'color: green; font-weight: bold');
          break;
        }
        
        const path = queue.shift();
        const currentStation = path[path.length - 1];
        const currentDepth = path.length - 1; // 当前深度（不包括起点）
        
        // 记录访问的站点
        searchStats.visitedStations.add(currentStation);
        
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
            // 记录找到的有效路径
            validPaths.push(resultPath);
            searchStats.pathsFound++;
            
            // 记录到PathFinder中，用于调试
            if (window.pathFinder) {
              window.pathFinder.addFoundPath([start, ...resultPath]);
            }
            
            console.log(`%c找到有效路径 #${validPaths.length}: ${[start, ...resultPath].join(' → ')}`, 'color: green');
            console.log(`路径长度: ${resultPath.length}站`);
            
            // 分析路径中的换乘情况
            if (startStationObj && endStationObj) {
              const pathTransfers = analyzePathTransfers([start, ...resultPath], startStationObj, endStationObj);
              console.log(`换乘次数: ${pathTransfers.transferCount}, 换乘站: ${pathTransfers.transferStations.join(', ')}`);
            }
            
            // 为每条找到的路径生成详细的路径图分析
            console.log('%c当前路径详细分析:', 'color: purple; font-weight: bold; background-color: #f0f0f0; padding: 3px 5px; border-radius: 3px;');
            visualizePathGraph(start, end, resultPath, validPaths.length);
            
            // 如果已经找到足够多的有效路径，就返回其中一条
            if (validPaths.length >= MAX_VALID_PATHS) {
              console.log(`%c已达到最大路径数量 ${MAX_VALID_PATHS}，返回随机路径`, 'color: purple; font-weight: bold');
              const selectedPath = validPaths[Math.floor(Math.random() * validPaths.length)];
              // 输出搜索统计信息
              logSearchStats(searchStats, startTime);
              resolve(selectedPath);
              return;
            }
          } else {
            console.log(`找到路径但长度不符合要求: 长度=${resultPath.length}, 要求范围=[${minLength}, ${maxLength}]`);
          }
          // 即使找到终点，也继续搜索其他可能的路径
          continue;
        }
        
        // 优化：如果路径太长或已经达到最大深度，跳过
        if (currentDepth >= maxLength) {
          continue;
        }
        
        // 记录搜索过的路径到PathFinder中，用于调试
        if (window.pathFinder && path.length > 1) {
          window.pathFinder.addSearchedPath([...path]);
        }
        
        // 获取当前站点的所有相邻站点（使用预先计算的连接关系）
        const neighbors = stationConnections[currentStation] || [];
        
        // 优化：限制每个节点的分支数量
        const MAX_BRANCHES = 12;
        
        // 优先选择换乘站，提高查找效率和成功率
        const sortedNeighbors = [...neighbors].sort((a, b) => {
          const stationA = metroData.stations.find(s => s.name === a);
          const stationB = metroData.stations.find(s => s.name === b);
          
          if (stationA && stationB) {
            // 主要优先级：换乘站优先
            const transferDiff = (stationB.istransfer || 0) - (stationA.istransfer || 0);
            if (transferDiff !== 0) return transferDiff;
            
            // 次要优先级：线路数量更多的站点优先
            const lineCountDiff = (stationB.lines?.length || 0) - (stationA.lines?.length || 0);
            if (lineCountDiff !== 0) return lineCountDiff;
            
            // 第三优先级：如果终点站有特定线路，优先选择有相同线路的站点
            if (endStationObj) {
              const aSharesLineWithEnd = stationA.lines?.some(line => endStationObj.lines.includes(line)) ? 1 : 0;
              const bSharesLineWithEnd = stationB.lines?.some(line => endStationObj.lines.includes(line)) ? 1 : 0;
              return bSharesLineWithEnd - aSharesLineWithEnd;
            }
          }
          return 0;
        });
        
        // 增加分支数量，但确保不会超过实际邻居数量
        const limitedNeighbors = sortedNeighbors.slice(0, Math.min(MAX_BRANCHES, sortedNeighbors.length));
        
        // 如果当前路径长度已经接近最大长度，且邻居中有终点站相关线路的站点，优先考虑这些站点
        if (currentDepth >= maxLength * 0.7 && endStationObj) {
          const endLineNeighbors = limitedNeighbors.filter(neighbor => {
            const neighborStation = metroData.stations.find(s => s.name === neighbor);
            return neighborStation && neighborStation.lines?.some(line => endStationObj.lines.includes(line));
          });
          
          // 如果找到了有终点站线路的邻居，优先处理这些邻居
          if (endLineNeighbors.length > 0) {
            console.log('路径接近最大长度，优先考虑终点站线路的邻居站点');
            // 将这些邻居放在处理队列的前面
            limitedNeighbors.sort((a, b) => {
              const aHasEndLine = endLineNeighbors.includes(a) ? 1 : 0;
              const bHasEndLine = endLineNeighbors.includes(b) ? 1 : 0;
              return bHasEndLine - aHasEndLine;
            });
          }
        }
        
        for (const neighbor of limitedNeighbors) {
          // 处理终点站的情况
          if (neighbor === end) {
            // 如果是直接相连且要求至少经过一个中间站，则需要检查路径长度
            if (directlyConnected && path.length === 1 && minLength > 1) {
              continue;
            }
            // 如果路径长度已经达到最小要求，直接添加到路径中
            if (path.length >= minLength) {
              // 将终点站路径放在队列前面，提高处理优先级
              queue.unshift([...path, neighbor]);
            }
          } 
          // 如果邻居不是终点站
          else if (!visited.has(neighbor) || (visited.has(neighbor) && visited.get(neighbor) > currentDepth + 1)) {
            visited.set(neighbor, currentDepth + 1);
            
            // 如果是换乘站，优先处理（放在队列前面）
            const neighborStation = metroData.stations.find(s => s.name === neighbor);
            if (neighborStation && neighborStation.istransfer === 1) {
              // 将换乘站路径放在队列前面，但在终点站之后
              queue.splice(0, 0, [...path, neighbor]);
            } else {
              // 非换乘站正常添加到队列末尾
              queue.push([...path, neighbor]);
            }
          }
        }
      }
      
      // 输出搜索统计信息
      logSearchStats(searchStats, startTime);
      
      // 如果找到了有效路径，返回其中一条
      if (validPaths.length > 0) {
        // 输出所有找到的路径摘要
        console.log('%c所有找到的有效路径摘要:', 'color: blue; font-weight: bold; background-color: #f0f8ff; padding: 3px 5px; border-radius: 3px;');
        console.log('--------------------------------------------------------------');
        validPaths.forEach((path, index) => {
          const pathTransfers = analyzePathTransfers([start, ...path], startStationObj, endStationObj);
          console.log(`%c路径 #${index + 1}: ${[start, ...path].join(' → ')}`, 'color: green; font-weight: bold');
          console.log(`  站点数: ${path.length + 1}站 | 换乘次数: ${pathTransfers.transferCount}次 | 经过线路: ${pathTransfers.pathSummary.lines.join(', ')}`);
          console.log(`  换乘站: ${pathTransfers.transferStations.length > 0 ? pathTransfers.transferStations.join(', ') : '无需换乘'}`);
          console.log('--------------------------------------------------------------');
        });
        
        const selectedPath = validPaths[Math.floor(Math.random() * validPaths.length)];
        
        // 记录换乘信息到PathFinder中，用于调试
        if (window.pathFinder && selectedPath) {
          const fullPath = [start, ...selectedPath];
          const pathTransfers = analyzePathTransfers(fullPath, startStationObj, endStationObj);
          
          window.pathFinder.addTransferInfo(pathTransfers.transferStations.map(station => {
            // 找到换乘站的前后站点，确定换乘的线路
            const stationIndex = fullPath.indexOf(station);
            if (stationIndex > 0 && stationIndex < fullPath.length - 1) {
              const prevStation = metroData.stations.find(s => s.name === fullPath[stationIndex - 1]);
              const nextStation = metroData.stations.find(s => s.name === fullPath[stationIndex + 1]);
              const stationObj = metroData.stations.find(s => s.name === station);
              
              if (prevStation && nextStation && stationObj) {
                // 找到共同线路
                let fromLine = '';
                for (const line of prevStation.lines) {
                  if (stationObj.lines.includes(line)) {
                    const lineObj = metroData.lines.find(l => l.id === line);
                    fromLine = lineObj ? lineObj.name : `线路${line}`;
                    break;
                  }
                }
                
                let toLine = '';
                for (const line of nextStation.lines) {
                  if (stationObj.lines.includes(line)) {
                    const lineObj = metroData.lines.find(l => l.id === line);
                    toLine = lineObj ? lineObj.name : `线路${line}`;
                    break;
                  }
                }
                
                return { station, fromLine, toLine };
              }
            }
            
            return { station, fromLine: '未知', toLine: '未知' };
          }));
        }
        
        console.log(`%c返回随机选择的路径: ${[start, ...selectedPath].join(' → ')}`, 'color: blue; font-weight: bold');
        
        // 可视化最终选择的路径图
        console.log('%c最终选择的路径详细分析:', 'color: purple; font-weight: bold; background-color: #e6f7ff; padding: 3px 5px; border-radius: 3px;');
        const selectedPathIndex = validPaths.indexOf(selectedPath) + 1; // 获取选中路径的索引
        visualizePathGraph(start, end, selectedPath, selectedPathIndex);
        
        resolve(selectedPath);
        return;
      }
      
      console.log(`%c未找到有效路径，返回null`, 'color: red; font-weight: bold');
      resolve(null); // 没有找到路径
    }, 0); // 使用setTimeout确保UI可以更新
  });
}

/**
 * 检查两个站点是否直接相连
 * @param {string} station1 站点1名称
 * @param {string} station2 站点2名称
 * @returns {boolean} 是否直接相连
 */
function areStationsConnected(station1, station2) {
  // 获取站点对象
  const station1Obj = metroData.stations.find(s => s.name === station1);
  const station2Obj = metroData.stations.find(s => s.name === station2);
  
  if (!station1Obj || !station2Obj) return false;
  
  // 检查两站是否有共同线路
  for (const line1 of station1Obj.lines) {
    if (station2Obj.lines.includes(line1)) {
      // 有共同线路，还需要检查是否相邻
      // 这里简化处理，假设有共同线路的站点可能相连
      // 实际应用中需要完整的线路站点顺序数据
      return true;
    }
  }
  
  return false;
}

/**
 * 分析路径中的换乘情况，提供详细的换乘信息
 * @param {string[]} fullPath 完整路径（包括起点站）
 * @param {Object} startStationObj 起点站对象
 * @param {Object} endStationObj 终点站对象
 * @returns {Object} 换乘分析结果
 */
function analyzePathTransfers(fullPath, startStationObj, endStationObj) {
  const result = {
    transferCount: 0,
    transferStations: [],
    lineSegments: [],
    stationDetails: [], // 每个站点的详细信息
    pathSummary: {      // 路径摘要信息
      totalStations: fullPath.length,
      pathLength: fullPath.length - 1,
      lines: new Set(),  // 经过的所有线路
      transferLines: []  // 换乘的线路顺序
    }
  };
  
  if (fullPath.length < 2) return result;
  
  // 当前所在线路（可能有多条）
  let currentLines = [...startStationObj.lines];
  let currentLineNames = currentLines.map(line => {
    const lineObj = metroData.lines.find(l => l.id === line);
    return lineObj ? lineObj.name : `线路${line}`;
  });
  
  // 记录起点站信息
  result.stationDetails.push({
    index: 0,
    name: fullPath[0],
    type: '起点',
    isTransfer: startStationObj.istransfer === 1,
    lines: startStationObj.lines.map(line => {
      const lineObj = metroData.lines.find(l => l.id === line);
      return {
        id: line,
        name: lineObj ? lineObj.name : `线路${line}`,
        color: lineObj ? lineObj.color : '#999'
      };
    })
  });
  
  // 添加起点站的线路到路径摘要
  startStationObj.lines.forEach(line => {
    const lineObj = metroData.lines.find(l => l.id === line);
    if (lineObj) {
      result.pathSummary.lines.add(lineObj.name);
    } else {
      result.pathSummary.lines.add(`线路${line}`);
    }
  });
  
  // 记录当前使用的线路
  let currentUsedLine = null;
  if (currentLines.length > 0) {
    const lineObj = metroData.lines.find(l => l.id === currentLines[0]);
    currentUsedLine = lineObj ? lineObj.name : `线路${currentLines[0]}`;
    result.pathSummary.transferLines.push(currentUsedLine);
  }
  
  // 遍历路径中的每个站点（从第二个站点开始，因为第一个是起点）
  for (let i = 1; i < fullPath.length; i++) {
    const stationName = fullPath[i];
    const stationObj = metroData.stations.find(s => s.name === stationName);
    
    if (!stationObj) continue;
    
    // 记录站点信息
    const stationType = i === fullPath.length - 1 ? '终点' : '中间站';
    const stationLines = stationObj.lines.map(line => {
      const lineObj = metroData.lines.find(l => l.id === line);
      return {
        id: line,
        name: lineObj ? lineObj.name : `线路${line}`,
        color: lineObj ? lineObj.color : '#999'
      };
    });
    
    result.stationDetails.push({
      index: i,
      name: stationName,
      type: stationType,
      isTransfer: stationObj.istransfer === 1,
      lines: stationLines
    });
    
    // 添加站点的线路到路径摘要
    stationObj.lines.forEach(line => {
      const lineObj = metroData.lines.find(l => l.id === line);
      if (lineObj) {
        result.pathSummary.lines.add(lineObj.name);
      } else {
        result.pathSummary.lines.add(`线路${line}`);
      }
    });
    
    // 检查是否需要换乘
    const stationLineIds = stationObj.lines;
    const commonLines = currentLines.filter(line => stationLineIds.includes(line));
    const commonLineNames = commonLines.map(line => {
      const lineObj = metroData.lines.find(l => l.id === line);
      return lineObj ? lineObj.name : `线路${line}`;
    });
    
    // 如果没有共同线路，需要换乘
    if (commonLines.length === 0) {
      result.transferCount++;
      result.transferStations.push(stationName);
      
      // 记录换乘前的线路
      const prevLineNames = currentLineNames;
      
      // 更新当前所在线路
      currentLines = [...stationLineIds];
      currentLineNames = stationLines.map(l => l.name);
      
      // 更新当前使用的线路
      if (currentLines.length > 0) {
        const lineObj = metroData.lines.find(l => l.id === currentLines[0]);
        currentUsedLine = lineObj ? lineObj.name : `线路${currentLines[0]}`;
        result.pathSummary.transferLines.push(currentUsedLine);
      }
      
      // 记录线路段
      const prevStation = fullPath[i-1];
      const lineInfo = {
        from: prevStation,
        to: stationName,
        transferType: '换乘',
        fromLines: prevLineNames,
        toLines: currentLineNames,
        stationIndex: i
      };
      result.lineSegments.push(lineInfo);
    } else {
      // 更新当前所在线路为共同线路
      currentLines = commonLines;
      currentLineNames = commonLineNames;
      
      // 如果是第一个站点，记录起始线路段
      if (i === 1) {
        const lineInfo = {
          from: fullPath[0],
          to: stationName,
          transferType: '起始',
          lines: currentLineNames,
          stationIndex: i
        };
        result.lineSegments.push(lineInfo);
      }
    }
  }
  
  // 将线路集合转换为数组
  result.pathSummary.lines = Array.from(result.pathSummary.lines);
  
  return result;
}

/**
 * 输出搜索统计信息
 * @param {Object} stats 搜索统计信息
 * @param {number} startTime 搜索开始时间
 */
function logSearchStats(stats, startTime) {
  const endTime = Date.now();
  const searchTime = endTime - startTime;
  
  console.log('%c搜索统计信息', 'color: blue; font-weight: bold');
  console.log(`总搜索时间: ${searchTime}ms`);
  console.log(`展开节点数: ${stats.expandedNodes}`);
  console.log(`访问站点数: ${stats.visitedStations.size}`);
  console.log(`最大队列长度: ${stats.maxQueueSize}`);
  console.log(`找到路径数: ${stats.pathsFound}`);
}

/**
 * 可视化完整路径图
 * @param {string} start 起点站名
 * @param {string} end 终点站名
 * @param {string[]} path 路径（不包括起点站）
 */
/**
 * 可视化完整路径图，提供详细的路径分析信息
 * @param {string} start 起点站名
 * @param {string} end 终点站名
 * @param {string[]} path 路径（不包括起点站）
 * @param {number} pathIndex 路径索引，用于标识是第几条找到的路径
 * @returns {Object} 返回路径图信息对象
 */
function visualizePathGraph(start, end, path, pathIndex = 0) {
  if (!path || path.length === 0) {
    console.log('路径为空，无法可视化');
    return null;
  }
  
  // 完整路径（包括起点站）
  const fullPath = [start, ...path];
  
  console.log(`%c完整路径图 #${pathIndex}`, 'color: purple; font-weight: bold');
  console.log(`%c完整路径: ${fullPath.join(' → ')}`, 'color: blue');
  
  // 创建路径图信息
  const pathGraph = {
    pathIndex: pathIndex,
    stations: [],
    connections: [],
    transferInfo: {
      count: 0,
      stations: [],
      details: []
    },
    lineSegments: [] // 记录路径中的线路段
  };
  
  // 当前所在线路（可能有多条）
  let currentLines = [];
  let currentLineNames = [];
  
  // 添加站点信息
  fullPath.forEach((stationName, index) => {
    const stationObj = metroData.stations.find(s => s.name === stationName);
    if (!stationObj) return;
    
    const stationType = index === 0 ? '起点' : (index === fullPath.length - 1 ? '终点' : '中间站');
    const isTransfer = stationObj.istransfer === 1;
    
    // 获取站点所属线路名称
    const stationLines = stationObj.lines.map(line => {
      const lineObj = metroData.lines.find(l => l.id === line);
      return {
        id: line,
        name: lineObj ? lineObj.name : `线路${line}`,
        color: lineObj ? lineObj.color : '#999'
      };
    });
    
    // 添加站点信息
    pathGraph.stations.push({
      name: stationName,
      type: stationType,
      isTransfer: isTransfer,
      lines: stationLines
    });
    
    // 处理换乘逻辑
    if (index === 0) {
      // 起点站，初始化当前线路
      currentLines = [...stationObj.lines];
      currentLineNames = stationLines.map(l => l.name);
    } else {
      // 非起点站，检查是否需要换乘
      const prevStationName = fullPath[index - 1];
      const prevStationObj = metroData.stations.find(s => s.name === prevStationName);
      
      if (prevStationObj) {
        // 查找两站之间的共同线路
        const commonLines = prevStationObj.lines.filter(line => stationObj.lines.includes(line));
        const commonLineNames = commonLines.map(line => {
          const lineObj = metroData.lines.find(l => l.id === line);
          return lineObj ? lineObj.name : `线路${line}`;
        });
        
        // 添加连接信息
        pathGraph.connections.push({
          from: prevStationName,
          to: stationName,
          commonLines: commonLineNames,
          needTransfer: commonLines.length === 0
        });
        
        // 检查是否需要换乘
        if (commonLines.length === 0) {
          // 需要换乘
          pathGraph.transferInfo.count++;
          pathGraph.transferInfo.stations.push(stationName);
          
          // 记录换乘详情
          pathGraph.transferInfo.details.push({
            station: stationName,
            fromLines: currentLineNames,
            toLines: stationLines.map(l => l.name)
          });
          
          // 记录线路段
          if (currentLines.length > 0) {
            pathGraph.lineSegments.push({
              from: prevStationName,
              to: stationName,
              type: '换乘',
              fromLines: currentLineNames,
              toLines: stationLines.map(l => l.name)
            });
          }
          
          // 更新当前线路
          currentLines = [...stationObj.lines];
          currentLineNames = stationLines.map(l => l.name);
        } else {
          // 不需要换乘，更新当前线路为共同线路
          currentLines = commonLines;
          currentLineNames = commonLineNames;
          
          // 如果是第一个连接，记录起始线路段
          if (index === 1) {
            pathGraph.lineSegments.push({
              from: start,
              to: stationName,
              type: '起始',
              lines: currentLineNames
            });
          }
        }
      }
    }
  });
  
  // 输出路径图信息
  console.log('%c站点详细信息:', 'color: blue; font-weight: bold');
  pathGraph.stations.forEach((station, idx) => {
    const stationTypeStyle = 
      station.type === '起点' ? 'color: green; font-weight: bold' :
      station.type === '终点' ? 'color: red; font-weight: bold' :
      station.isTransfer ? 'color: orange; font-weight: bold' : 'color: black';
    
    console.log(
      `%c${idx + 1}. ${station.name}%c (${station.type}${station.isTransfer ? ', 换乘站' : ''})`,
      stationTypeStyle,
      'color: black'
    );
    
    // 输出站点所属线路
    console.log('  所属线路:', station.lines.map(l => l.name).join(', '));
  });
  
  console.log('%c路径连接信息:', 'color: blue; font-weight: bold');
  pathGraph.connections.forEach((connection, idx) => {
    const connectionStyle = connection.needTransfer ? 'color: red; font-weight: bold' : 'color: green';
    
    console.log(
      `%c${idx + 1}. ${connection.from} → ${connection.to}%c (${connection.needTransfer ? '需要换乘' : '共同线路: ' + connection.commonLines.join(', ')})`,
      'color: black',
      connectionStyle
    );
  });
  
  // 输出换乘信息
  console.log('%c换乘信息:', 'color: orange; font-weight: bold');
  console.log(`总换乘次数: ${pathGraph.transferInfo.count}`);
  
  if (pathGraph.transferInfo.count > 0) {
    console.log('换乘站点:', pathGraph.transferInfo.stations.join(', '));
    
    console.log('%c换乘详情:', 'color: orange');
    pathGraph.transferInfo.details.forEach((detail, idx) => {
      console.log(`${idx + 1}. 在 ${detail.station} 从 [${detail.fromLines.join(', ')}] 换乘到 [${detail.toLines.join(', ')}]`);
    });
  } else {
    console.log('全程无需换乘');
  }
  
  // 输出线路段信息
  console.log('%c线路段信息:', 'color: blue; font-weight: bold');
  pathGraph.lineSegments.forEach((segment, idx) => {
    const segmentStyle = segment.type === '换乘' ? 'color: orange' : 'color: green';
    
    if (segment.type === '换乘') {
      console.log(
        `%c${idx + 1}. ${segment.from} → ${segment.to} (换乘: 从 [${segment.fromLines.join(', ')}] 到 [${segment.toLines.join(', ')}])`,
        segmentStyle
      );
    } else {
      console.log(
        `%c${idx + 1}. ${segment.from} → ${segment.to} (线路: ${segment.lines.join(', ')})`,
        segmentStyle
      );
    }
  });
  
  // 输出路径摘要
  console.log('%c路径摘要:', 'color: purple; font-weight: bold');
  console.log(`总站点数: ${fullPath.length}站 | 路径长度: ${path.length}站 | 换乘次数: ${pathGraph.transferInfo.count}次`);
  
  // 返回路径图信息，可以被其他函数使用
  return pathGraph;
}

export { findPath, areStationsConnected, visualizePathGraph };