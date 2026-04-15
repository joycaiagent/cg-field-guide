// CG Landscape Field Guide — App Logic

(function() {
  'use strict';

  let currentTab = 'plant';
  let stream = null;

  // ── Photo tips ─────────────────────────────────────────────
  const TIPS = [
    'Get close — include leaves or flowers for best results',
    'Avoid shadows and glare — natural light works best',
    'Try multiple angles: top, side, and close-up of leaves',
    'Include the whole plant if possible — not just one branch',
    'Focus on healthy parts of the plant — avoid damaged areas',
    'Best results: clear photo of leaves OR flowers OR bark'
  ];
  const tipEl = $('photo-tip-text');
  if (tipEl) tipEl.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];

  // ── Multi-photo state ──────────────────────────────────────
  let selectedPhotos = [];  // array of { dataUrl, blob }
  const MAX_PHOTOS = 5;

  // ── DOM refs ──────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const plantTab   = $('plant-tab');
  const pestTab    = $('pest-tab');
  const searchBar  = $('search-bar');
  const searchResults = $('search-results');
  const offlineBanner = $('offline-banner');
  const previewImg  = $('preview-img');
  const resultCard  = $('result-card');
  const resultBody  = $('result-body');
  const statusMsg   = $('status-msg');
  const photoPreviews = $('photo-previews');
  const addMoreRow  = $('add-more-row');
  const addMoreBtn  = $('add-more-btn');
  const identifyBtn = $('identify-btn');

  // ── Tab switching ─────────────────────────────────────────
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  function switchTab(tab) {
    currentTab = tab;
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    plantTab.classList.toggle('hidden', tab !== 'plant');
    pestTab.classList.toggle('hidden', tab !== 'pest');
    searchBar.placeholder = tab === 'plant'
      ? '🔍 Search plants by name…'
      : '🔍 Search pests…';
    clearResults();
  }

  function clearResults() {
    resultCard.classList.add('hidden');
    previewImg && previewImg.classList.add('hidden');
    statusMsg.textContent = '';
    if (searchResults) searchResults.classList.add('hidden');
    selectedPhotos = [];
    renderPhotoPreviews();
  }

  // ── Photo previews ────────────────────────────────────────
  function renderPhotoPreviews() {
    if (!photoPreviews) return;
    if (selectedPhotos.length === 0) {
      photoPreviews.classList.add('hidden');
      if (addMoreRow) addMoreRow.classList.add('hidden');
      return;
    }
    photoPreviews.classList.remove('hidden');
    if (addMoreRow) {
      addMoreRow.classList.remove('hidden');
      if (addMoreBtn) addMoreBtn.disabled = selectedPhotos.length >= MAX_PHOTOS;
    }
    photoPreviews.innerHTML = selectedPhotos.map((p, i) =>
      `<div class="thumb-wrap">
        <img src="${p.dataUrl}" class="thumb-img" alt="Photo ${i+1}" />
        <button class="thumb-remove" data-index="${i}" aria-label="Remove">✕</button>
        ${i === 0 ? '<span class="thumb-label">Main</span>' : ''}
      </div>`
    ).join('');
    photoPreviews.querySelectorAll('.thumb-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.currentTarget.dataset.index);
        selectedPhotos.splice(idx, 1);
        renderPhotoPreviews();
      });
    });
  }

  // ── Offline detection ──────────────────────────────────────
  function updateOnlineStatus() {
    if (offlineBanner) {
      offlineBanner.classList.toggle('hidden', navigator.onLine);
    }
  }
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // ── Camera / Upload ────────────────────────────────────────
  const takePhotoBtn = $('take-photo-btn');
  const uploadBtn   = $('upload-btn');
  const fileInput   = $('file-input');
  const cameraInput = $('camera-input');

  // Take Photo → opens environment camera
  if (takePhotoBtn) {
    takePhotoBtn.addEventListener('click', () => {
      if (selectedPhotos.length >= MAX_PHOTOS) {
        statusMsg.textContent = `Max ${MAX_PHOTOS} photos allowed.`;
        return;
      }
      if (cameraInput) cameraInput.click();
    });
  }

  // Upload Photo → opens gallery picker
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      if (selectedPhotos.length >= MAX_PHOTOS) {
        statusMsg.textContent = `Max ${MAX_PHOTOS} photos allowed.`;
        return;
      }
      if (fileInput) fileInput.click();
    });
  }

  // Add More button
  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      if (selectedPhotos.length < MAX_PHOTOS) fileInput && fileInput.click();
    });
  }

  // Identify button
  if (identifyBtn) {
    identifyBtn.addEventListener('click', () => {
      if (selectedPhotos.length === 0) return;
      identifyPlantMulti(selectedPhotos.map(p => p.dataUrl));
    });
  }

  // Camera input
  if (cameraInput) {
    cameraInput.addEventListener('change', e => {
      handleFiles(e.target.files);
      e.target.value = '';
    });
  }

  // Gallery input
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      handleFiles(e.target.files);
      e.target.value = '';
    });
  }

  function handleFiles(files) {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (selectedPhotos.length >= MAX_PHOTOS) return;
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target.result;
        selectedPhotos.push({ dataUrl, blob: dataURLtoBlob(dataUrl) });
        renderPhotoPreviews();
        // Auto-identify on first photo
        if (selectedPhotos.length === 1) {
          identifyPlantMulti(selectedPhotos.map(p => p.dataUrl));
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Plant identification (multi-photo + PlantNet) ───────────
  const PLANINET_API_KEY = '2b10hewV0342kXX83Sf8sX9ssJu';

  async function identifyPlantMulti(dataUrls) {
    statusMsg.textContent = 'Identifying…' + (dataUrls.length > 1 ? ` (${dataUrls.length} photos)` : '');
    resultCard.classList.add('hidden');

    try {
      const formData = new FormData();
      dataUrls.forEach(url => formData.append('images', dataURLtoBlob(url)));

      const response = await fetch(
        'https://my-api.plantnet.org/v2/identify/all?api-key=' + PLANINET_API_KEY + '&org=1',
        { method: 'POST', body: formData }
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Try top 5 PlantNet results with genus-level fallback
        for (const r of data.results.slice(0, 5)) {
          const scientificName = r.species?.scientificName || r.scientificName || '';
          const commonName = r.species?.commonNames?.[0] || '';
          const plant = findBestMatch(scientificName) || findBestMatch(commonName);
          if (plant) {
            displayPlantResult(plant);
            return;
          }
        }
        // No DB match — show what PlantNet found
        const top = data.results[0];
        const sn = top.species?.scientificName || '';
        const cn = top.species?.commonNames?.[0] || '';
        statusMsg.textContent = '';
        resultCard.classList.remove('hidden');
        resultBody.innerHTML = `
          <p class="no-match" style="color:var(--teal);font-weight:600;">Not in our 87-plant database</p>
          <p class="no-match" style="font-size:0.9rem">PlantNet identified as:</p>
          <h2 class="plant-name" style="font-style:italic">${sn}</h2>
          ${cn ? `<p class="plant-common">${cn}</p>` : ''}
          <p style="font-size:0.85rem;color:#666;margin-top:8px;">This plant isn't in our CG Landscape pruning guide. Check the search bar above or ask your supervisor.</p>
        `;
        return;
      }

      // No results from PlantNet
      statusMsg.textContent = 'Could not identify. Try clearer photos.';
    } catch (err) {
      statusMsg.textContent = 'Identification failed. Check your connection.';
    }
  }

  // Legacy single-photo alias
  async function identifyPlant(dataUrl) {
    return identifyPlantMulti([dataUrl]);
  }

  function dataURLtoBlob(dataURL) {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  }

  function findBestMatch(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    const genus = words[0] || '';

    let best = null;
    let bestScore = 0;

    for (const p of PLANTS) {
      const botanical = (p.botanical || '').toLowerCase();
      const common = (p.common || '').toLowerCase();
      if (!botanical) continue;

      let score = 0;

      // Exact full name match
      if (botanical === q || (common && common === q)) score = 100;
      // Botanical exact match
      else if (botanical === q) score = 95;
      // Common name exact match
      else if (common === q) score = 95;
      // Botanical contains query
      else if (botanical.includes(q)) score = 80;
      // Query contains botanical
      else if (q.includes(botanical)) score = 70;
      // Common contains query
      else if (common.includes(q)) score = 75;
      // Query contains common
      else if (q.includes(common)) score = 65;
      // Partial — any word match
      else {
        const bWords = botanical.split(/\s+/);
        const cWords = common ? common.split(/\s+/) : [];
        const matchCount = words.filter(w =>
          bWords.some(bw => bw.includes(w) || w.includes(bw)) ||
          cWords.some(cw => cw.includes(w) || w.includes(cw))
        ).length;
        if (matchCount > 0) score = 15 * matchCount;
      }

      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }

    if (best && bestScore >= 15) return best;

    // ── Genus-level fallback ────────────────────────────────
    // If no good match, try to match just the genus (first word)
    if (!genus || genus.length < 4) return null; // genus too short to be reliable

    let genusBest = null;
    let genusBestScore = 0;

    for (const p of PLANTS) {
      const botanical = (p.botanical || '').toLowerCase();
      if (!botanical) continue;
      // Does plant botanical start with this genus?
      if (botanical.startsWith(genus) || genus.startsWith(botanical.split(/\s+/)[0])) {
        // Score by how specific the genus match is
        const score = genus.length > 5 ? 60 : 40;
        if (score > genusBestScore) {
          genusBestScore = score;
          genusBest = p;
        }
      }
    }

    return genusBest;
  }

  function findPlantInDB(query) { return findBestMatch(query); }

  // ── Display results ────────────────────────────────────────
  function displayPlantResult(plant) {
    if (!plant) {
      statusMsg.textContent = 'No match found. Try the search bar above.';
      resultCard.classList.remove('hidden');
      resultBody.innerHTML = '<p class="no-match">No matching plant found in database.</p>';
      return;
    }

    statusMsg.textContent = '';
    resultCard.classList.remove('hidden');
    const cal = plant.calendar || {};
    const monthSymbols = {
      jan: cal.jan||'', feb: cal.feb||'', mar: cal.mar||'', apr: cal.apr||'',
      may: cal.may||'', jun: cal.jun||'', jul: cal.jul||'', aug: cal.aug||'',
      sep: cal.sep||'', oct: cal.oct||'', nov: cal.nov||'', dec: cal.dec||''
    };
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const calHTML = months.map((m, i) =>
      `<div class="cal-month${monthSymbols[m] === '■' ? ' best' : monthSymbols[m] === '△' ? ' light' : ''}">
        <span class="cal-sym">${monthSymbols[m] || '—'}</span>
        <span class="cal-name">${monthNames[i]}</span>
      </div>`
    ).join('');

    const botanical = plant.botanical || plant.name || '';
    const common = plant.common || '';

    resultBody.innerHTML = `
      <h2 class="plant-name" style="font-style:italic">${botanical}</h2>
      ${common ? `<p class="plant-common">${common}</p>` : ''}
      <div class="result-grid">
        <div class="result-item"><span class="label">Size</span><span class="value">${plant.size || '—'}</span></div>
        <div class="result-item"><span class="label">Prune Target</span><span class="value">${plant.target || '—'}</span></div>
        <div class="result-item"><span class="label">Aggression</span><span class="value">${plant.aggression || '—'}</span></div>
        <div class="result-item"><span class="label">Type</span><span class="value">${plant.type || '—'}</span></div>
        <div class="result-item"><span class="label">Fertilize</span><span class="value">${plant.fertilize || '—'}</span></div>
      </div>
      <h3>Pruning Calendar</h3>
      <div class="legend">
        <span class="leg-item"><span class="sym-box best-box">■</span> Best time</span>
        <span class="leg-item"><span class="sym-box light-box">△</span> Light only</span>
        <span class="leg-item"><span class="sym-box avoid-box">—</span> Avoid</span>
      </div>
      <div class="cal-grid">${calHTML}</div>
    `;
  }

  function displayPestResult(pest) {
    if (!pest) {
      resultBody.innerHTML = '<p class="no-match">No matching pest found.</p>';
      return;
    }
    resultCard.classList.remove('hidden');
    const severityClass = pest.severity === 'High' ? 'sev-high' : pest.severity === 'Medium' ? 'sev-med' : 'sev-low';
    resultBody.innerHTML = `
      <h2 class="plant-name">${pest.name}</h2>
      <div class="sev-badge ${severityClass}">Severity: ${pest.severity}</div>
      <h3>Plants Affected</h3>
      <p class="pest-plants">${pest.plantsAffected.join(', ')}</p>
      <h3>Symptoms</h3>
      <p class="pest-symptoms">${pest.symptoms}</p>
      <h3>Treatment</h3>
      <div class="treatment-steps">${pest.treatment.split('\n').map(s => `<p>${s}</p>`).join('')}</div>
    `;
  }

  // ── Search bar ─────────────────────────────────────────────
  if (searchBar) {
    searchBar.addEventListener('input', e => {
      const q = e.target.value.trim();
      if (!q) {
        if (searchResults) searchResults.classList.add('hidden');
        return;
      }
      const results = currentTab === 'plant'
        ? searchPlants(q)
        : searchPests(q);
      renderSearchResults(results);
    });

    searchBar.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q && currentTab === 'plant') {
          const result = findBestMatch(q);
          if (result) {
            displayPlantResult(result);
            previewImg.classList.add('hidden');
          }
        }
      }
    });
  }

  function searchPlants(query) {
    const q = query.toLowerCase();
    return PLANTS.filter(p =>
      (p.botanical || '').toLowerCase().includes(q) ||
      (p.common || '').toLowerCase().includes(q)
    );
  }

  function searchPests(query) {
    const q = query.toLowerCase();
    return PESTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.plantsAffected.some(plant => plant.toLowerCase().includes(q))
    );
  }

  function renderSearchResults(results) {
    if (!searchResults) return;
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">No results</div>';
      searchResults.classList.remove('hidden');
      return;
    }
    searchResults.innerHTML = results.slice(0, 10).map(item => {
      if (currentTab === 'plant') {
        const label = item.botanical + (item.common ? ' (' + item.common + ')' : '');
        return `<button class="search-item" data-name="${item.botanical}">${label}</button>`;
      } else {
        return `<button class="search-item" data-name="${item.name}">${item.name} <span class="sev-tag ${item.severity === 'High' ? 'sev-high' : 'sev-med'}">${item.severity}</span></button>`;
      }
    }).join('');
    searchResults.classList.remove('hidden');

    searchResults.querySelectorAll('.search-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const botanical = btn.dataset.name;
        searchBar.value = botanical;
        searchResults.classList.add('hidden');
        if (currentTab === 'plant') {
          const plant = PLANTS.find(p => p.botanical === botanical);
          displayPlantResult(plant);
          previewImg.classList.add('hidden');
        } else {
          const pest = PESTS.find(p => p.name === name);
          displayPestResult(pest);
        }
      });
    });
  }

  // ── Pest tab search & display ─────────────────────────────
  const pestResultCard = $('pest-result-card');
  const pestResultBody = $('pest-result-body');

  function displayPestResult2(pest) {
    if (!pest) {
      pestResultBody.innerHTML = '<p class="no-match">No matching pest found.</p>';
      pestResultCard.classList.remove('hidden');
      return;
    }
    pestResultCard.classList.remove('hidden');
    const severityClass = pest.severity === 'High' ? 'sev-high' : pest.severity === 'Medium' ? 'sev-med' : 'sev-low';
    pestResultBody.innerHTML = `
      <h2 class="plant-name">${pest.name}</h2>
      <div class="sev-badge ${severityClass}">Severity: ${pest.severity}</div>
      <h3>Plants Affected</h3>
      <p class="pest-plants">${pest.plantsAffected.join(', ')}</p>
      <h3>Symptoms</h3>
      <p class="pest-symptoms">${pest.symptoms}</p>
      <h3>Treatment</h3>
      <div class="treatment-steps">${pest.treatment.split('\n').map(s => `<p>${s}</p>`).join('')}</div>
    `;
  }

  // ── Register service worker ────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.warn('SW registration failed:', err));
  }
})();
