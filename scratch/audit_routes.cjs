const fs = require('fs');

const text = fs.readFileSync('server.ts', 'utf8');
const lines = text.split('\n');
const routes = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const match = line.match(/^app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
  if (match) {
    routes.push(`${match[1].toUpperCase()} ${match[2]} (line ${i + 1})`);
  }
}

console.log('--- FOUND ' + routes.length + ' ROUTES IN server.ts ---');
console.log(routes.join('\n'));
