const fs = require('fs');
const lines = fs.readFileSync('src/index.css', 'utf8').split('\n');

const base = lines.slice(0, 46).join('\n');
const ui = lines.slice(46, 173).join('\n');
const landing = lines.slice(173, 438).join('\n');
const game = lines.slice(438).join('\n');

fs.mkdirSync('src/styles', { recursive: true });
fs.writeFileSync('src/styles/base.css', base);
fs.writeFileSync('src/styles/ui.css', ui);
fs.writeFileSync('src/styles/landing.css', landing);
fs.writeFileSync('src/styles/game.css', game);

const index = `@import "./styles/base.css";\n@import "./styles/ui.css";\n@import "./styles/landing.css";\n@import "./styles/game.css";\n`;
fs.writeFileSync('src/index.css', index);
