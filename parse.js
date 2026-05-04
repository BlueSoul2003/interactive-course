const fs = require('fs');
const content = fs.readFileSync('body_output.txt', 'utf16le');
const idx = content.indexOf('game-container');
if (idx > -1) {
    console.log(content.substring(idx, idx + 1000));
} else {
    console.log('No game-container found');
}
