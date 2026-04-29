const fs = require('fs');

// Load backup (has calendar + synonym data for original 87)
const backupPath = '/Users/aiagent/Desktop/Joy Work/cg-field-app/admin/backups/plants.2026-04-17T18-00-24-486Z.js';
const backupRaw = fs.readFileSync(backupPath, 'utf8');
const backupMatch = backupRaw.match(/PLANTS\s*=\s*(\[[\s\S]+?\]);/);
const backup = eval('(' + backupMatch[1] + ')');

// Load CSV
const csvPath = '/Users/aiagent/Desktop/Joy Work/plants_export.csv';
const csvRaw = fs.readFileSync(csvPath, 'utf8');
const csvLines = csvRaw.split('\n').filter(l => l.trim());

// Parse CSV
function parseCSVLine(line) {
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
  return parts;
}

const csvData = {};
csvLines.slice(1).forEach(line => {
  const p = parseCSVLine(line);
  if (p[0]) csvData[p[0].toLowerCase()] = { botanical: p[0], common: p[1], size: p[2], target: p[3], aggression: p[4], type: p[5], fertilize: p[6] };
});

// Default calendars by type
const defaultCalendars = {
  Warm:  { jan:"", feb:"△", mar:"■", apr:"■", may:"■", jun:"■", jul:"△", aug:"", sep:"", oct:"△", nov:"■", dec:"△" },
  Year:  { jan:"", feb:"■", mar:"■", apr:"■", may:"■", jun:"■", jul:"■", aug:"■", sep:"■", oct:"■", nov:"■", dec:"■" },
  Shade: { jan:"△", feb:"■", mar:"■", apr:"■", may:"■", jun:"△", jul:"△", aug:"△", sep:"△", oct:"△", nov:"■", dec:"■" },
};

// Merge: use CSV data + calendar from backup if matched
const result = [];
const seen = new Set();

backup.forEach(plant => {
  const key = plant.botanical.toLowerCase();
  if (csvData[key]) {
    const csv = csvData[key];
    result.push({
      botanical: plant.botanical,
      common: csv.common || plant.common || '',
      synonyms: plant.synonyms || [],
      size: csv.size || '',
      target: csv.target || '',
      aggression: csv.aggression || '',
      type: csv.type || plant.type || '',
      fertilize: csv.fertilize || '',
      calendar: plant.calendar || defaultCalendars[csv.type] || defaultCalendars.Year,
      images: plant.images || []
    });
    seen.add(key);
  }
});

// Add new plants from CSV that weren't in backup
Object.keys(csvData).forEach(key => {
  if (!seen.has(key)) {
    const csv = csvData[key];
    const cal = defaultCalendars[csv.type] || defaultCalendars.Year;
    result.push({
      botanical: csv.botanical,
      common: csv.common || '',
      synonyms: [],
      size: csv.size || '',
      target: csv.target || '',
      aggression: csv.aggression || '',
      type: csv.type || 'Year',
      fertilize: csv.fertilize || '',
      calendar: cal,
      images: []
    });
  }
});

// Write
const out = `// Plant database — ${result.length} plants from CG Pruning Schedule\nconst PLANTS = ${JSON.stringify(result, null, 2)};\n`;
fs.writeFileSync('/Users/aiagent/Desktop/Joy Work/cg-field-app/plants.js', out);
console.log('Wrote', result.length, 'plants (preserved calendar for original 87, default calendars for new)');