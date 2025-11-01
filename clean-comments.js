const fs = require('fs');
const path = require('path');

function cleanComments(content) {
  const lines = content.split('\n');
  
  const cleanedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      return null;
    }
    
    let inString = false;
    let stringChar = null;
    let escaped = false;
    let commentPos = -1;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\' && !escaped) {
        escaped = true;
        continue;
      }
      
      if ((char === '"' || char === "'" || char === '`') && !inString) {
        inString = true;
        stringChar = char;
        continue;
      }
      
      if (char === stringChar && inString && !escaped) {
        inString = false;
        stringChar = null;
        continue;
      }
      
      if (char === '/' && !inString && i < line.length - 1 && line[i + 1] === '/') {
        commentPos = i;
        break;
      }
    }
    
    if (commentPos !== -1) {
      return line.substring(0, commentPos).trimEnd();
    }
    
    return line;
  }).filter(line => line !== null);
  
  return cleanedLines.join('\n');
}

function cleanDir(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git') {
        cleanDir(itemPath);
      }
    } else if (item.endsWith('.js')) {
      const content = fs.readFileSync(itemPath, 'utf8');
      
      const cleanedContent = cleanComments(content);
      
      fs.writeFileSync(itemPath, cleanedContent);
      console.log(`Membersihkan komentar dari: ${itemPath}`);
    }
  }
}

cleanDir(__dirname);
console.log('Pembersihan komentar selesai!');