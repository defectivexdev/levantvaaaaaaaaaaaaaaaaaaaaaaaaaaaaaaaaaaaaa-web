const fs = require('fs');
const content = fs.readFileSync('src/config/badges.ts', 'utf8');

const lines = content.split('\n');
let finalLines = [];
let inBadge = false;
let currentBadge = [];
let hasImage = false;
let isFirstSolo = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '{') {
        inBadge = true;
        currentBadge = [line];
        hasImage = false;
        isFirstSolo = false;
    } else if (inBadge) {
        currentBadge.push(line);
        if (line.includes("badge_id: 'first_solo'")) isFirstSolo = true;
        if (line.includes("image: ") && !line.includes("undefined") && !line.includes("''")) hasImage = true;
        
        if (line.trim() === '},' || line.trim() === '}') {
            inBadge = false;
            // Only push if it's NOT first_solo AND HAS an image
            if (!isFirstSolo && hasImage) {
                finalLines.push(...currentBadge);
            }
        }
    } else {
        finalLines.push(line);
    }
}

fs.writeFileSync('src/config/badges.ts', finalLines.join('\n'));
console.log('Done modifying badges.ts');
