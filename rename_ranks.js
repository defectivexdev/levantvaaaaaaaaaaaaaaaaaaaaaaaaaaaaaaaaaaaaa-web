const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/img/ranks');
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.includes(' ')) {
        const newName = file.replace(/ /g, '_');
        fs.renameSync(path.join(dir, file), path.join(dir, newName));
        console.log(`Renamed ${file} to ${newName}`);
    }
});
