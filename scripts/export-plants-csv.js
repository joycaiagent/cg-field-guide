const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const plantsPath = path.join(repoRoot, 'plants.js');
const outputDir = path.join(repoRoot, 'admin');
const outputPath = path.join(outputDir, 'plant-schedule-template.csv');
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function loadPlants() {
  const source = fs.readFileSync(plantsPath, 'utf8') + '\nthis.__plants = PLANTS;';
  const context = {};
  vm.createContext(context);
  new vm.Script(source, { filename: 'plants.js' }).runInContext(context);
  return context.__plants || [];
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const plants = loadPlants();
const header = ['botanical', 'common', 'synonyms', 'image', 'size', 'target', 'aggression', 'type', 'fertilize', ...MONTHS];
const lines = [header.join(',')];

for (const plant of plants) {
  const row = [
    plant.botanical || '',
    plant.common || '',
    Array.isArray(plant.synonyms) ? plant.synonyms.join('|') : '',
    plant.image || '',
    plant.size || '',
    plant.target || '',
    plant.aggression || '',
    plant.type || '',
    plant.fertilize || '',
    ...MONTHS.map(month => (plant.calendar && plant.calendar[month]) || '')
  ];
  lines.push(row.map(csvEscape).join(','));
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, lines.join('\n') + '\n');
console.log(`Exported ${plants.length} plants to ${outputPath}`);
