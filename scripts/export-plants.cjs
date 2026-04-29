const fs = require('fs');
const content = fs.readFileSync('/Users/aiagent/Desktop/Joy Work/cg-field-app/plants.js', 'utf8');
const match = content.match(/PLANTS\s*=\s*(\[[\s\S]+?\]);/);
if (!match) { console.log('Could not find PLANTS array'); process.exit(1); }
const Plants = eval('(' + match[1] + ')');

const header = 'Botanical,Common,Size,Target,Aggression,Type,Fertilize';
const rows = [header];
Plants.forEach(p => {
  const e = v => '"' + (v || '').replace(/"/g, '""') + '"';
  rows.push([e(p.botanical), e(p.common), e(p.size), e(p.target), e(p.aggression), e(p.type), e(p.fertilize)].join(','));
});

fs.writeFileSync('/Users/aiagent/Desktop/Joy Work/plants_export.csv', rows.join('\n'));
console.log('Exported', Plants.length, 'plants to plants_export.csv');