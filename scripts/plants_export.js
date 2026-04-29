const fs = require('fs');
const { PLANTS } = require('./plants.js');

const header = 'Botanical,Common,Size,Target,Aggression,Type,Fertilize';
const rows = [header];

PLANTS.forEach(p => {
  const escape = v => '"' + (v || '').replace(/"/g, '""') + '"';
  rows.push([escape(p.botanical), escape(p.common), escape(p.size), escape(p.target), escape(p.aggression), escape(p.type), escape(p.fertilize)].join(','));
});

fs.writeFileSync('plants_export.csv', rows.join('\n'));
console.log('Exported', PLANTS.length, 'plants to plants_export.csv');