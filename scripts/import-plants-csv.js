const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const inputArg = process.argv[2] || path.join(repoRoot, 'admin', 'plant-schedule-template.csv');
const inputPath = path.resolve(inputArg);
const plantsPath = path.join(repoRoot, 'plants.js');
const backupDir = path.join(repoRoot, 'admin', 'backups');
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const REQUIRED = ['botanical', 'common', 'synonyms', 'size', 'target', 'aggression', 'type', 'fertilize', ...MONTHS];
const ALLOWED_MONTH_VALUES = new Set(['', '■', '△']);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        value += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        value += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(value);
      value = '';
    } else if (ch === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (ch === '\r') {
      continue;
    } else {
      value += ch;
    }
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter(r => r.some(cell => String(cell).trim() !== ''));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  fail(`CSV not found: ${inputPath}`);
}

const rows = parseCsv(fs.readFileSync(inputPath, 'utf8'));
if (rows.length < 2) {
  fail('CSV must include a header row and at least one plant row.');
}

const header = rows[0].map(h => h.trim());
for (const col of REQUIRED) {
  if (!header.includes(col)) fail(`Missing required column: ${col}`);
}

const columnIndex = Object.fromEntries(header.map((name, index) => [name, index]));
const plants = rows.slice(1).map((row, idx) => {
  const line = idx + 2;
  const get = name => (row[columnIndex[name]] || '').trim();

  const botanical = get('botanical');
  if (!botanical) fail(`Row ${line}: botanical is required.`);

  const calendar = {};
  for (const month of MONTHS) {
    const value = get(month);
    if (!ALLOWED_MONTH_VALUES.has(value)) {
      fail(`Row ${line}: ${month} must be blank, ■, or △.`);
    }
    calendar[month] = value;
  }

  const plant = {
    botanical,
    common: get('common'),
    size: get('size'),
    target: get('target'),
    aggression: get('aggression'),
    type: get('type'),
    fertilize: get('fertilize'),
    calendar
  };

  const synonyms = get('synonyms')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

  if (synonyms.length) plant.synonyms = synonyms;
  return plant;
});

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(plantsPath, path.join(backupDir, `plants.${timestamp}.js`));

const output = `// Plant database — ${plants.length} plants from CG Pruning Schedule\nconst PLANTS = ${JSON.stringify(plants, null, 2)};\n`;
fs.writeFileSync(plantsPath, output);
console.log(`Imported ${plants.length} plants from ${inputPath}`);
console.log(`Backup saved in ${backupDir}`);
