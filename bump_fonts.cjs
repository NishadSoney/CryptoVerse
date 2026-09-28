const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const multiplier = 1.05;

function processFile(filePath) {
    if (!filePath.endsWith('.css') && !filePath.endsWith('.php') && !filePath.endsWith('.html')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace standard font-size: Xpx or Xrem or Xem
    content = content.replace(/font-size:\s*([\d\.]+)(px|rem|em|vw)/g, (match, val, unit) => {
        let newVal = (parseFloat(val) * multiplier);
        if (unit === 'px') newVal = Math.round(newVal);
        else newVal = newVal.toFixed(4).replace(/\.?0+$/, ''); // clean decimals
        return `font-size: ${newVal}${unit}`;
    });

    // Replace clamp(min, val, max) in font-size
    content = content.replace(/font-size:\s*clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, (match, min, val, max) => {
        const scaleVal = (str) => {
            return str.replace(/([\d\.]+)(px|rem|em|vw)/g, (m, v, u) => {
                let nv = (parseFloat(v) * multiplier);
                if (u === 'px') nv = Math.round(nv);
                else nv = nv.toFixed(4).replace(/\.?0+$/, '');
                return `${nv}${u}`;
            });
        };
        return `font-size: clamp(${scaleVal(min)}, ${scaleVal(val)}, ${scaleVal(max)})`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

walkDir('.', processFile);
console.log("Done.");
