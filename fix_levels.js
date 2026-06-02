
const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, 'go_one_stroke', 'game.js');
const content = fs.readFileSync(gameJsPath, 'utf8');

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
    
    // 1. Remove duplicate edges
    let seenEdges = new Set();
    let uniqueEdges = [];
    edges.forEach(([u, v]) => {
        const key = [u, v].sort().join(',');
        if (!seenEdges.has(key)) {
            seenEdges.add(key);
            uniqueEdges.push([u, v]);
        }
    });
    
    // 2. Calculate degrees
    function getOddNodes(edges, nodeCount) {
        const degree = new Array(nodeCount).fill(0);
        edges.forEach(([u, v]) => {
            degree[u]++;
            degree[v]++;
        });
        const oddNodes = [];
        degree.forEach((d, i) => {
            if (d % 2 !== 0) oddNodes.push(i);
        });
        return oddNodes;
    }

    let oddNodes = getOddNodes(uniqueEdges, nodes.length);
    
    // 3. Balance Euler path (target: 0 or 2 odd nodes)
    // While odd nodes > 2, try to connect two odd nodes that are NOT currently connected
    while (oddNodes.length > 2) {
        let paired = false;
        for (let i = 0; i < oddNodes.length; i++) {
            for (let j = i + 1; j < oddNodes.length; j++) {
                const u = oddNodes[i];
                const v = oddNodes[j];
                const key = [u, v].sort().join(',');
                if (!seenEdges.has(key)) {
                    uniqueEdges.push([u, v]);
                    seenEdges.add(key);
                    oddNodes = getOddNodes(uniqueEdges, nodes.length);
                    paired = true;
                    break;
                }
            }
            if (paired) break;
        }
        
        // If we couldn't find a pair to connect without duplicating, 
        // try to REMOVE an edge between two odd nodes
        if (!paired) {
            for (let i = 0; i < oddNodes.length; i++) {
                for (let j = i + 1; j < oddNodes.length; j++) {
                    const u = oddNodes[i];
                    const v = oddNodes[j];
                    const key = [u, v].sort().join(',');
                    const edgeIdx = uniqueEdges.findIndex(e => [e[0], e[1]].sort().join(',') === key);
                    if (edgeIdx !== -1) {
                        uniqueEdges.splice(edgeIdx, 1);
                        seenEdges.delete(key);
                        oddNodes = getOddNodes(uniqueEdges, nodes.length);
                        paired = true;
                        break;
                    }
                }
                if (paired) break;
            }
        }

        // If still not paired, we have a problem (very dense graph), but for these levels it should work
        if (!paired) {
            console.warn(`Warning: Could not fully balance Level ${index + 1}`);
            break;
        }
    }

    return { nodes, edges: uniqueEdges };
}

console.log("Fixing levels...");
const fixedLevels = levels.map((l, i) => fixLevel(l, i));

// Format the output to match the original style as much as possible
const fixedLevelsStr = JSON.stringify(fixedLevels, null, 4)
    .replace(/"x":/g, 'x:')
    .replace(/"y":/g, 'y:')
    .replace(/"nodes":/g, 'nodes:')
    .replace(/"edges":/g, 'edges:');

const newContent = content.replace(/const levels = \[[\s\S]*?\];/, `const levels = ${fixedLevelsStr};`);

fs.writeFileSync(gameJsPath, newContent);
console.log("Successfully fixed and updated game.js");
