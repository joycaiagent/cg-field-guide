const fs = require('fs');

const csv = fs.readFileSync('/Users/aiagent/Desktop/Joy Work/plants_export.csv', 'utf8');
const lines = csv.split('\n');

const newPlants = [
  { botanical: "Achillea 'Moonshine' Yellow", common: "Moonshine Yarrow", size: "2′", target: "Cut to 6–8″", aggression: "Medium", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Lantana 'New Gold'", common: "New Gold Lantana", size: "2–3′", target: "Cut back 50%", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Lantana 'Confetti'", common: "Confetti Lantana", size: "2–3′", target: "Cut back 50%", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Azalea 'Orange Delight'", common: "Orange Delight Azalea", size: "3–5′", target: "Light shape after bloom", aggression: "Light", type: "Shade", fertilize: "Acid fert spring" },
  { botanical: "Azalea 'Southern Charm'", common: "Southern Charm Azalea", size: "4–6′", target: "Light shape after bloom", aggression: "Light", type: "Shade", fertilize: "Acid fert spring" },
  { botanical: "Azalea 'Red Bird'", common: "Red Bird Azalea", size: "3–4′", target: "Light shape after bloom", aggression: "Light", type: "Shade", fertilize: "Acid fert spring" },
  { botanical: "Xylosma congestum", common: "Xylosma", size: "8–15′", target: "-20–40%", aggression: "Medium", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Lomandra longifolia 'Platinum Beauty'‑", common: "Platinum Beauty Lomandra", size: "3–4′", target: "Cut to 4–6″ annually", aggression: "Heavy", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Strelitzia nicolai", common: "White Bird of Paradise", size: "15–25′", target: "Remove dead leaves", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Tecomaria capensis", common: "Cape Honeysuckle", size: "6–10′", target: "-30–50%", aggression: "Medium", type: "Warm", fertilize: "Light fert after prune" },
  { botanical: "Strelitzia reginae", common: "Bird of Paradise", size: "4–6′", target: "Remove dead leaves/seed heads", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Tecoma 'Orange Jubilee'", common: "Orange Jubilee", size: "8–12′", target: "-30–50%", aggression: "Medium", type: "Warm", fertilize: "Light fert after prune" },
  { botanical: "Lantana montevidensis", common: "Purple Lantana", size: "2–3′", target: "Cut back 50%", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Salvia 'Allen Chickering'", common: "Allen Chickering Salvia", size: "3–4′", target: "Cut back after bloom", aggression: "Medium", type: "Warm", fertilize: "Light fert after cut" },
  { botanical: "Salvia leucantha 'Santa Barbara'", common: "Santa Barbara Mexican Sage", size: "3–4′", target: "Cut to 12–18″ in winter", aggression: "Heavy", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Salvia leucantha 'Daniela's Dream'", common: "Daniela's Dream Salvia", size: "3–4′", target: "Cut to 12–18″ in winter", aggression: "Heavy", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Salvia 'Mystic Spires'", common: "Mystic Spires Salvia", size: "2–3′", target: "Cut back after bloom", aggression: "Medium", type: "Warm", fertilize: "Light fert after cut" },
  { botanical: "Bougainvillea 'La Jolla'", common: "La Jolla Bougainvillea", size: "6–8′", target: "Trim as needed", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Cordyline 'Lime Passion'", common: "Lime Passion Cordyline", size: "3–5′", target: "Remove dead leaves", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Bougainvillea 'Barbara Karst'", common: "Barbara Karst Bougainvillea", size: "6–10′", target: "Trim as needed", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Leucadendron discolor", common: "Pom Pom Leucadendron", size: "4–6′", target: "Light shape after bloom", aggression: "Light", type: "Year", fertilize: "None or very light" },
  { botanical: "Cordyline 'Design-a-line'", common: "Design-a-Line Cordyline", size: "3–4′", target: "Remove dead leaves", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Dianella 'Tasmanica Variegata'", common: "Variegated Flax Lily", size: "2–3′", target: "Cut to 6–8″ annually", aggression: "Heavy", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Dianella revoluta 'Little Rev'", common: "Little Rev Dianella", size: "1–2′", target: "Cut to 6–8″ annually", aggression: "Heavy", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Pennisetum 'Massalsium' 'Red Bunny'", common: "Red Bunny Fountain Grass", size: "3–4′", target: "Cut to 6–8″ in late winter", aggression: "Heavy", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Agapanthus 'Tinkerbell'", common: "Tinkerbell Lily of the Nile", size: "1–2′", target: "Remove dead stalks after bloom", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Hemerocallis 'stella d orro'", common: "Stella de Oro Daylily", size: "1–2′", target: "Cut back in late winter", aggression: "Medium", type: "Year", fertilize: "Light fert spring" },
];

const escape = v => '"' + String(v || '').replace(/"/g, '""') + '"';

const header = 'Botanical,Common,Size,Target,Aggression,Type,Fertilize';
const rows = [header];

newPlants.forEach(np => {
  rows.push([escape(np.botanical), escape(np.common), escape(np.size), escape(np.target), escape(np.aggression), escape(np.type), escape(np.fertilize)].join(','));
});

fs.writeFileSync('/Users/aiagent/Desktop/Joy Work/new_plants_filled.csv', rows.join('\n'));
console.log('Saved', rows.length - 1, 'new plants');