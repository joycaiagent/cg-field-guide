const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = '/Users/aiagent/Desktop/Joy Work';
const PDF_DIR = path.join(BASE, 'state/app-plant-pics/pdf');
const JPG_DIR = path.join(BASE, 'state/app-plant-pics/pdf-jpgs');
const ASSETS_DIR = path.join(BASE, 'cg-field-app/assets/plants');
const PLANTS_PATH = path.join(BASE, 'cg-field-app/plants.js');

fs.mkdirSync(JPG_DIR, { recursive: true });

const text = fs.readFileSync(PLANTS_PATH, 'utf8');
const match = text.match(/const PLANTS = (\[\s\S]+);\s*$/);
if (!match) { console.log('No PLANTS array found'); process.exit(1); }
const plants = eval('(' + match[1] + ')');

function slugify(s) {
  return String(s || '')
    .toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/["'‘’`]/g, '').replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');
}

const PDF_MAP = {
  'bouteloua_gracilis': 'Bouteloua gracilis',
  'calamagrostis_x_acutiflora_karl_foerster': null,
  'cordyline_australis_red_star': "Cordyline 'Design-a-line'",
  'helictotrichon_sempervirens': null,
  'melinis_nerviglumis': null,
  'miscanthus_sinensis_morning_light': 'Miscanthus sinensis',
  'miscanthus_sinensis': 'Miscanthus sinensis',
  'pennisetum_fairy_tails': null,
  'pennisetum_setaceum': 'Pennisetum setaceum',
  'pennisetum_spathiolatum': null,
  'achillea_millefolium_pomegranate': "Achillea millefolium 'Pomegranate'",
  'achillea_moonshine_yellow': "Achillea 'Moonshine' Yellow",
  'agapanthus_tinkerbell': "Agapanthus 'Tinkerbell'",
  'asparagus_densiflorus_myers': "Asparagus densiflorus 'Myers'",
  'azalea_orange_delight': "Azalea 'Orange Delight'",
  'azalea_red_bird': "Azalea 'Red Bird'",
  'azalea_southern_charm_pink': "Azalea 'Southern Charm'",
  'bougainvillea_barbara_karst': "Bougainvillea 'Barbara Karst'",
  'bougainvillea_la_jolla': "Bougainvillea 'La Jolla'",
  'carissa_green_carpet': 'Carissa macrocarpa',
  'carissa_macrocarpa_booxwood_beauty': 'Carissa macrocarpa',
  'chondropetalum_tectorum': null,
  'cordyline_design_a_line': "Cordyline 'Design-a-line'",
  'cordyline_lime_passion': "Cordyline 'Lime Passion'",
  'dianella_revoluta_little_rev': "Dianella revoluta 'Little Rev'",
  'dianella_tesmanica_variegata': "Dianella 'Tasmanica Variegata'",
  'dietes': 'Dietes',
  'hemercocallis_stella_d_orro': "Hemerocallis 'stella d orro'",
  'hydrangea_macrophylla_leuchtfeuer': "Hydrangea macrophylla 'Leuchtfeuer'",
  'hydrangea_macrophylla_nikko_blue': "Hydrangea macrophylla 'Nikko Blue'",
  'lanatana_confetti': "Lantana 'Confetti'",
  'lanatana_new_gold': "Lantana 'New Gold'",
  'lantana_montevidensis_purple': 'Lantana montevidensis',
  'lavandula_dentata': 'Lavandula dentata',
  'lavandula_ginginsii_goodwin_creek_grey': "Lavandula ginginsii 'Goodwin Creek Grey'",
  'leucadendron_discolor_pom_pom': "Leucadendron discolor",
  'limonium_perezii': 'Limonium perezii',
  'lomandra_longifolia_breeze': "Lomandra longifolia 'Breeze'",
  'lomandra_longifolia_platinum_beauty': "Lomandra longifolia 'Platinum Beauty'",
  'muhlenbergia_capillaris': null,
  'pennisetum_massalcum_red_bunny': "Pennisetum 'Massalsium' 'Red Bunny'",
  'philodendron_xanadu': "Philodendron 'Xanadu'",
  'phlomis_fruticosa': 'Phlomis fruticosa',
  'salvia_allen_chickering': "Salvia 'Allen Chickering'",
  'salvia_leucantha_danielles_dream': "Salvia leucantha 'Daniela's Dream'",
  'salvia_leucantha_santa_barbara': "Salvia leucantha 'Santa Barbara'",
  'salvia_mystic_spires': "Salvia 'Mystic Spires'",
  'shefflera_arboricola': 'Schefflera arboricola',
  'strelitzia_nocolai': 'Strelitzia nicolai',
  'strelitzia_reginae': 'Strelitzia reginae',
  'tacoma_orange_jubliee': 'Tacoma orange Jubliee',
  'tecomaria_capensis_orange': 'Tecomaria capensis (Orange)',
  'trachelospermum_jasminoides': 'Trachelospermum jasminoides',
  'tulbaghia_violacea': 'Tulbaghia violacea',
  'xylosma_congestum': 'Xylosma congestum',
};

function findPlant(key) {
  const q = String(key || '').toLowerCase();
  return plants.find(p => (p.botanical || '').toLowerCase() === q)
    || plants.find(p => (p.common || '').toLowerCase() === q);
}

const done = [], skipped = [];
const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf') && !f.startsWith('scan_from')).sort();

for (const pdfFile of files) {
  const name = pdfFile.replace('.pdf', '').replace(/"/g, '');
  const plantKey = PDF_MAP[name];
  if (!plantKey) { skipped.push(pdfFile + ' -> no_app_match'); continue; }
  const plant = findPlant(plantKey);
  if (!plant) { skipped.push(pdfFile + ' -> not_found: ' + plantKey); continue; }
  const baseSlug = slugify(plant.botanical || plant.common || plantKey);
  let pages = 1;
  try {
    const out = execSync(`/opt/homebrew/bin/pdfinfo "${PDF_DIR}/${pdfFile}" 2>/dev/null | grep "^Pages:" | awk '{print $2}'`, { encoding: 'utf8' });
    pages = parseInt(out.trim()) || 1;
  } catch (e) {}
  let newCount = 0;
  for (let page = 1; page <= Math.min(pages, 3); page++) {
    const jpgPath = path.join(JPG_DIR, baseSlug + '_p' + page + '.jpg');
    try {
      execSync(`/opt/homebrew/bin/pdftoppm -jpeg -singlefile -r 180 -f ${page} -l ${page} "${PDF_DIR}/${pdfFile}" "${jpgPath.replace('.jpg', '')}"`, { encoding: 'utf8' });
    } catch (e) {}
    if (!fs.existsSync(jpgPath)) continue;
    let destName = baseSlug + '_' + page + '.jpg';
    let counter = page;
    while (fs.existsSync(path.join(ASSETS_DIR, destName))) {
      counter++;
      destName = baseSlug + '_' + counter + '.jpg';
    }
    fs.copyFileSync(jpgPath, path.join(ASSETS_DIR, destName));
    if (!Array.isArray(plant.images)) plant.images = [];
    const rel = 'assets/plants/' + destName;
    if (!plant.images.includes(rel)) { plant.images.push(rel); newCount++; }
  }
  done.push(pdfFile + ' -> ' + plant.botanical + ' (' + newCount + ' new)');
}

fs.writeFileSync(PLANTS_PATH, '// Plant database — ' + plants.length + ' plants from CG Pruning Schedule\nconst PLANTS = ' + JSON.stringify(plants, null, 2) + ';\n');
console.log('Done: ' + done.length + ' PDFs');
done.forEach(d => console.log('  ' + d));
if (skipped.length) { console.log('Skipped: ' + skipped.length); skipped.forEach(s => console.log('  ' + s)); }
