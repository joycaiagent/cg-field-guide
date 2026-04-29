const fs = require('fs');
const path = require('path');

const csvPath = '/Users/aiagent/Desktop/Joy Work/plants_export.csv';
const plantsJsPath = '/Users/aiagent/Desktop/Joy Work/cg-field-app/plants.js';

const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(l => l.trim());

const plants = [];
lines.slice(1).forEach(line => {
  // Simple CSV parse - handle quoted fields
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());

  if (parts[0]) {
    plants.push({
      botanical: parts[0] || '',
      common: parts[1] || '',
      size: parts[2] || '',
      target: parts[3] || '',
      aggression: parts[4] || '',
      type: parts[5] || '',
      fertilize: parts[6] || ''
    });
  }
});

// Build new plants.js content
const content = `// Plant database — ${plants.length} plants from CG Pruning Schedule
const PLANTS = ${JSON.stringify(plants, null, 2)};
`;

fs.writeFileSync(plantsJsPath, content);
console.log('Wrote', plants.length, 'plants to plants.js');