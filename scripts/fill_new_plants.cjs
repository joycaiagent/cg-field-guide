const fs = require('fs');

// Load current CSV
const csv = fs.readFileSync('/Users/aiagent/Desktop/Joy Work/plants_export.csv', 'utf8');
const lines = csv.split('\n');

// New plants data (researched)
const newPlants = [
  { botanical: "Achillea 'Moonshine'", common: "Moonshine Yarrow", size: "2′", target: "Cut to 6–8″", aggression: "Medium", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Achillea millefolium 'Pomegranate'", common: "Pomegranate Yarrow", size: "2′", target: "Cut to 6–8″", aggression: "Medium", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Lantana 'New Gold'", common: "New Gold Lantana", size: "2–3′", target: "Cut back 50%", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Lantana 'Confetti'", common: "Confetti Lantana", size: "2–3′", target: "Cut back 50%", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Azalea 'Orange Delight'", common: "Orange Delight Azalea", size: "3–5′", target: "Light shape after bloom", aggression: "Light", type: "Shade", fertilize: "Acid fert spring" },
  { botanical: "Azalea 'Southern Charm'", common: "Southern Charm Azalea", size: "4–6′", target: "Light shape after bloom", aggression: "Light", type: "Shade", fertilize: "Acid fert spring" },
  { botanical: "Azalea 'Red Bird'", common: "Red Bird Azalea", size: "3–4′", target: "Light shape after bloom", aggression: "Light", type: "Shade", fertilize: "Acid fert spring" },
  { botanical: "Hydrangea macrophylla 'Nikko Blue'", common: "Nikko Blue Hydrangea", size: "4–6′", target: "Deadhead + light trim", aggression: "Light", type: "Shade", fertilize: "Rich fert spring" },
  { botanical: "Hydrangea macrophylla 'Leuchtfeuer'", common: "Leuchtfeuer Hydrangea", size: "4–6′", target: "Deadhead + light trim", aggression: "Light", type: "Shade", fertilize: "Rich fert spring" },
  { botanical: "Xylosma congestum", common: "Xylosma", size: "8–15′", target: "-20–40%", aggression: "Medium", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Lomandra longifolia 'Platinum Beauty'", common: "Platinum Beauty Lomandra", size: "3–4′", target: "Cut to 4–6″ annually", aggression: "Heavy", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Asparagus densiflorus 'Myers'", common: "Myers Asparagus Fern", size: "2–3′", target: "Clean up dead fronds", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Philodendron 'Xanadu'", common: "Xanadu Philodendron", size: "3–5′", target: "Remove damaged leaves", aggression: "Light", type: "Shade", fertilize: "Light fert spring" },
  { botanical: "Limonium perezii", common: "Sea Lavender", size: "2–3′", target: "Cut back after bloom", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Strelitzia nicolai", common: "White Bird of Paradise", size: "15–25′", target: "Remove dead leaves", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Dietes", common: "Dietes", size: "2–3′", target: "Cut to 6–8″ annually", aggression: "Heavy", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Schefflera arboricola", common: "Schefflera", size: "6–10′", target: "Light shape as needed", aggression: "Light", type: "Shade", fertilize: "Light fert spring" },
  { botanical: "Tecomaria capensis", common: "Cape Honeysuckle", size: "6–10′", target: "-30–50%", aggression: "Medium", type: "Warm", fertilize: "Light fert after prune" },
  { botanical: "Strelitzia reginae", common: "Bird of Paradise", size: "4–6′", target: "Remove dead leaves/seed heads", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Tecoma 'Orange Jubilee'", common: "Orange Jubilee", size: "8–12′", target: "-30–50%", aggression: "Medium", type: "Warm", fertilize: "Light fert after prune" },
  { botanical: "Lantana montevidensis", common: "Purple Lantana", size: "2–3′", target: "Cut back 50%", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Lavandula dentata", common: "French Lavender", size: "2–3′", target: "Trim after bloom", aggression: "Light", type: "Year", fertilize: "Light fert after trim" },
  { botanical: "Lavandula ginginsii 'Goodwin Creek Grey'", common: "Goodwin Creek Grey Lavender", size: "2–3′", target: "Trim after bloom", aggression: "Light", type: "Year", fertilize: "Light fert after trim" },
  { botanical: "Salvia 'Allen Chickering'", common: "Allen Chickering Salvia", size: "3–4′", target: "Cut back after bloom", aggression: "Medium", type: "Warm", fertilize: "Light fert after cut" },
  { botanical: "Salvia leucantha 'Santa Barbara'", common: "Santa Barbara Mexican Sage", size: "3–4′", target: "Cut to 12–18″ in winter", aggression: "Heavy", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Salvia leucantha 'Daniela's Dream'", common: "Daniela's Dream Salvia", size: "3–4′", target: "Cut to 12–18″ in winter", aggression: "Heavy", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Tulbaghia violacea", common: "Society Garlic", size: "1–2′", target: "Cut back after bloom", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Salvia 'Mystic Spires'", common: "Mystic Spires Salvia", size: "2–3′", target: "Cut back after bloom", aggression: "Medium", type: "Warm", fertilize: "Light fert after cut" },
  { botanical: "Carissa macrocarpa 'Boxwood Beauty'", common: "Boxwood Beauty Natal Plum", size: "2–3′", target: "Light shape as needed", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Carissa macrocarpa 'Green Carpet'", common: "Green Carpet Natal Plum", size: "1–2′", target: "Light shape as needed", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Bougainvillea 'La Jolla'", common: "La Jolla Bougainvillea", size: "6–8′", target: "Trim as needed", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Cordyline 'Lime Passion'", common: "Lime Passion Cordyline", size: "3–5′", target: "Remove dead leaves", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Bougainvillea 'Barbara Karst'", common: "Barbara Karst Bougainvillea", size: "6–10′", target: "Trim as needed", aggression: "Medium", type: "Warm", fertilize: "Light fert spring" },
  { botanical: "Leucadendron discolor", common: "Pom Pom Leucadendron", size: "4–6′", target: "Light shape after bloom", aggression: "Light", type: "Year", fertilize: "None or very light" },
  { botanical: "Cordyline 'Design-a-line'", common: "Design-a-Line Cordyline", size: "3–4′", target: "Remove dead leaves", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Phlomis fruticosa", common: "Jerusalem Sage", size: "3–4′", target: "Cut back after bloom", aggression: "Medium", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Dianella 'Tasmanica Variegata'", common: "Variegated Flax Lily", size: "2–3′", target: "Cut to 6–8″ annually", aggression: "Heavy", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Dianella revoluta 'Little Rev'", common: "Little Rev Dianella", size: "1–2′", target: "Cut to 6–8″ annually", aggression: "Heavy", type: "Year", fertilize: "Light fert after cut" },
  { botanical: "Pennisetum 'Massalsium' 'Red Bunny'", common: "Red Bunny Fountain Grass", size: "3–4′", target: "Cut to 6–8″ in late winter", aggression: "Heavy", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Agapanthus 'Tinkerbell'", common: "Tinkerbell Lily of the Nile", size: "1–2′", target: "Remove dead stalks after bloom", aggression: "Light", type: "Year", fertilize: "Light fert spring" },
  { botanical: "Hemerocallis 'Stella de Oro'", common: "Stella de Oro Daylily", size: "1–2′", target: "Cut back in late winter", aggression: "Medium", type: "Year", fertilize: "Light fert spring" },
];

// Build lookup from existing plants (first 87 lines that have data)
const existing = {};
lines.slice(1).forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(',');
  if (parts.length >= 2 && parts[1]) {
    const key = parts[0].trim().toLowerCase();
    existing[key] = line;
  }
});

// Helper to escape CSV field
const escape = v => '"' + String(v || '').replace(/"/g, '""') + '"';

// Write updated CSV
const header = 'Botanical,Common,Size,Target,Aggression,Type,Fertilize';
const rows = [header];

// Write existing plants that have data (keep original row if it has size/aggression/etc.)
lines.slice(1).forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(',');
  const botanical = parts[0]?.trim().replace(/^"|"$/g, '');
  if (!botanical) return;
  
  // Check if row has any data beyond botanical
  const hasData = parts.slice(1).some(p => p && p.trim());
  
  if (hasData) {
    // Keep original
    rows.push(line);
  } else {
    // Try to fill from newPlants lookup
    const key = botanical.toLowerCase();
    const match = newPlants.find(np => np.botanical.toLowerCase() === key || np.common.toLowerCase() === key);
    if (match) {
      rows.push([escape(match.botanical), escape(match.common), escape(match.size), escape(match.target), escape(match.aggression), escape(match.type), escape(match.fertilize)].join(','));
    }
  }
});

fs.writeFileSync('/Users/aiagent/Desktop/Joy Work/plants_export.csv', rows.join('\n'));
console.log('Done — saved', rows.length - 1, 'plants to CSV');