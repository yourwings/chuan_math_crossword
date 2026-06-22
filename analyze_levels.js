
const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, 'go_one_stroke', 'game.js');
const content = fs.readFileSync(gameJsPath, 'utf8');

// Simple regex to extract the levels array. 
// Note: This might be fragile if the structure changes, but for this specific file it should work.
const levelsMatch = content.match(/const levels = (\[[\s\S]*?\]);/);
if (!levelsMatch) {
    console.error("Could not find levels array");
    process.exit(1);
}

let levels;
try {
    // We need to be careful with eval, but here we are in a controlled environment
    // and just trying to parse a static array.
    levels = eval(levelsMatch[1]);
} catch (e) {
    console.error("Error parsing levels array:", e);
    process.exit(1);
}

function analyzeLevel(level, index) {
    const { nodes, edges } = level;
    const degree = new Array(nodes.length).fill(0);
    const edgeCounts = new Map();
    let duplicateEdges = [];

    edges.forEach(([u, v]) => {
        const key = [u, v].sort().join(',');
        edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
        degree[u]++;
        degree[v]++;
    });

    for (let [key, count] of edgeCounts.entries()) {
        if (count > 1) {
            duplicateEdges.push({ key, count });
        }
    }

    const oddNodes = degree.filter(d => d % 2 !== 0).length;
    const isEuler = oddNodes === 0 || oddNodes === 2;

    // Check connectivity
    let isConnected = true;
    if (edges.length > 0) {
        let adj = Array.from({length: nodes.length}, () => []);
        let activeNodes = new Set();
        edges.forEach(([u, v]) => {
            adj[u].push(v);
            adj[v].push(u);
            activeNodes.add(u);
            activeNodes.add(v);
        });
        
        let startNode = Array.from(activeNodes)[0];
        let visited = new Set();
        let q = [startNode];
        visited.add(startNode);
        
        while(q.length > 0) {
            let curr = q.shift();
            for(let nxt of adj[curr]) {
                if(!visited.has(nxt)) {
                    visited.add(nxt);
                    q.push(nxt);
                }
            }
        }
        
        for(let node of activeNodes) {
            if(!visited.has(node)) {
                isConnected = false;
                break;
            }
        }
    }

    return {
        index: index + 1,
        duplicateEdges,
        oddNodes,
        isEuler,
        isConnected,
        nodeDegrees: degree
    };
}

console.log("Analyzing levels...");
const results = levels.map(analyzeLevel);

const invalidLevels = results.filter(r => r.duplicateEdges.length > 0 || !r.isEuler || !r.isConnected);

if (invalidLevels.length === 0) {
    console.log("All levels are valid!");
} else {
    console.log(`Found ${invalidLevels.length} problematic levels:\n`);
    invalidLevels.forEach(r => {
        console.log(`Level ${r.index}:`);
        if (r.duplicateEdges.length > 0) {
            console.log(`  - Duplicate edges: ${r.duplicateEdges.map(e => `${e.key} (count: ${e.count})`).join(', ')}`);
        }
        if (!r.isEuler) {
            console.log(`  - Invalid Euler path: ${r.oddNodes} odd-degree nodes`);
        }
        if (!r.isConnected) {
            console.log(`  - Disconnected graph`);
        }
        console.log("");
    });
}
