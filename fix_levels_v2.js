
const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, 'go_one_stroke', 'game.js');
let content = fs.readFileSync(gameJsPath, 'utf8');

const levelsMatch = content.match(/const levels = (\[[\s\S]*?\]);/);
if (!levelsMatch) {
    console.error("Could not find levels array");
    process.exit(1);
}

let levels;
try {
    levels = eval(levelsMatch[1]);
} catch (e) {
    console.error("Error parsing levels array:", e);
    process.exit(1);
}

function fixLevel(level, index) {
    let { nodes, edges } = level;
    
    // 1. Remove duplicate edges and sort vertices so u < v
    let edgeSet = new Set();
    edges.forEach(([u, v]) => {
        let min = Math.min(u, v);
        let max = Math.max(u, v);
        edgeSet.add(`${min},${max}`);
    });

    function getDegrees(eSet) {
        let degs = new Array(nodes.length).fill(0);
        for(let e of eSet) {
            let [u, v] = e.split(',').map(Number);
            degs[u]++;
            degs[v]++;
        }
        return degs;
    }

    function getOddNodes(eSet) {
        let degs = getDegrees(eSet);
        let odds = [];
        degs.forEach((d, i) => {
            if (d % 2 !== 0) odds.push(i);
        });
        return odds;
    }

    // Connect components check (Euler path needs connected graph of edges)
    function isConnected(eSet) {
        if(eSet.size === 0) return true;
        let adj = Array.from({length: nodes.length}, () => []);
        let activeNodes = new Set();
        for(let e of eSet) {
            let [u, v] = e.split(',').map(Number);
            adj[u].push(v);
            adj[v].push(u);
            activeNodes.add(u);
            activeNodes.add(v);
        }
        
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
            if(!visited.has(node)) return false;
        }
        return true;
    }

    let odds = getOddNodes(edgeSet);
    
    // 2. Balance Euler path (target: 0 or 2 odd nodes)
    let safetyCounter = 0;
    while (odds.length > 2 && safetyCounter < 100) {
        safetyCounter++;
        let paired = false;
        
        // Try to add an edge between two closest odd nodes
        let bestPairToAdd = null;
        let bestDistAdd = Infinity;

        for (let i = 0; i < odds.length; i++) {
            for (let j = i + 1; j < odds.length; j++) {
                let u = odds[i];
                let v = odds[j];
                let min = Math.min(u, v);
                let max = Math.max(u, v);
                let key = `${min},${max}`;
                
                if (!edgeSet.has(key)) {
                    let dist = Math.hypot(nodes[u].x - nodes[v].x, nodes[u].y - nodes[v].y);
                    if (dist < bestDistAdd) {
                        bestDistAdd = dist;
                        bestPairToAdd = key;
                    }
                }
            }
        }

        if (bestPairToAdd) {
            edgeSet.add(bestPairToAdd);
            paired = true;
        } else {
            // If we cannot add (complete graph among odds), try removing an edge between odds
            for (let i = 0; i < odds.length; i++) {
                for (let j = i + 1; j < odds.length; j++) {
                    let u = odds[i];
                    let v = odds[j];
                    let min = Math.min(u, v);
                    let max = Math.max(u, v);
                    let key = `${min},${max}`;
                    
                    if (edgeSet.has(key)) {
                        // Check if removing disconnects graph
                        edgeSet.delete(key);
                        if (isConnected(edgeSet)) {
                            paired = true;
                            break;
                        } else {
                            edgeSet.add(key); // rollback
                        }
                    }
                }
                if (paired) break;
            }
        }

        odds = getOddNodes(edgeSet);
    }
    
    if (odds.length > 2) {
        console.warn(`Warning: Could not fully balance Level ${index + 1}`);
    }

    let uniqueEdges = Array.from(edgeSet).map(e => {
        let [u, v] = e.split(',').map(Number);
        return [u, v];
    });

    return { nodes, edges: uniqueEdges };
}

console.log("Fixing levels...");
const fixedLevels = levels.map((l, i) => fixLevel(l, i));

// Format output properly
let fixedLevelsStr = '[\n';
fixedLevels.forEach((l, i) => {
    let nodesStr = l.nodes.map(n => `{ x: ${n.x}, y: ${n.y} }`).join(', ');
    let edgesStr = l.edges.map(e => `[${e[0]}, ${e[1]}]`).join(', ');
    fixedLevelsStr += `        { nodes: [${nodesStr}], edges: [${edgesStr}] }`;
    if (i < fixedLevels.length - 1) {
        fixedLevelsStr += ',\n';
    } else {
        fixedLevelsStr += '\n';
    }
});
fixedLevelsStr += '    ]';

const newContent = content.replace(/const levels = \[\s*\{[\s\S]*?\];/m, `const levels = ${fixedLevelsStr};`);

if (newContent === content) {
    console.error("Failed to replace content in game.js. Regex might be wrong.");
} else {
    fs.writeFileSync(gameJsPath, newContent);
    console.log("Successfully fixed and updated game.js");
}
