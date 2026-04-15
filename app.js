// CG Landscape Field Guide — App Logic

(function() {
  'use strict';

  let currentTab = 'plant';
  let stream = null;

  // ── DOM refs ──────────────────────────────────────────────
  const $ = id => document.getElementById(id);

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
        // Try top 5 PlantNet results with improved matching
        for (const r of data.results.slice(0, 5)) {
          const scientificName = r.species?.scientificName || r.scientificName || '';
          const commonName = r.species?.commonNames?.[0] || '';
          const result = findBestMatch(scientificName) || findBestMatch(commonName);
          if (result) {
            displayPlantResult(result.plant, result.confidence);
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
  // ── Fuzzy matching utilities ─────────────────────────────

  /** Levenshtein distance — number of single-char edits to turn a into b */
  function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const m = a.length, n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  }

  /** Score (0-1) for fuzzy match. Returns 0 if too different. */
  function fuzzyScore(str, query) {
    if (!str || !query) return 0;
    const s = str.toLowerCase(), q = query.toLowerCase();
    if (s === q) return 1;
    if (s.includes(q) || q.includes(s)) {
      return 0.85 + 0.1 * Math.min(q.length, s.length) / Math.max(q.length, s.length);
    }
    const maxLen = Math.max(s.length, q.length);
    if (maxLen > 15 && levenshtein(s, q) > 5) return 0;
    if (maxLen <= 15 && levenshtein(s, q) > Math.floor(maxLen / 2)) return 0;
    const dist = levenshtein(s, q);
    const score = 1 - dist / maxLen;
    return score > 0.55 ? score : 0;
  }

  /**
   * Returns { plant, confidence } or null.
   * confidence: 'exact' | 'high' | 'fuzzy' | 'genus' | null
   */
  function findBestMatch(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    const genus = words[0] || '';

    let best = null, bestScore = 0, bestConfidence = null;

    for (const p of PLANTS) {
      const botanical = (p.botanical || '').toLowerCase();
      const common    = (p.common    || '').toLowerCase();
      const synonyms  = Array.isArray(p.synonyms) ? p.synonyms.map(s => s.toLowerCase()) : [];

      let score = 0, confidence = null;

      // Tier 1: Exact & near-exact
      if (botanical === q || (common && common === q)) {
        score = 100; confidence = 'exact';
      } else if (botanical === q) {
        score = 95; confidence = 'exact';
      } else if (common === q) {
        score = 92; confidence = 'high';
      } else if (synonyms.some(s => s === q)) {
        score = 90; confidence = 'high';
      } else if (botanical.includes(q) && q.length > 4) {
        score = 80; confidence = 'high';
      } else if (q.includes(botanical) && botanical.length > 4) {
        score = 75; confidence = 'high';
      } else if (common.includes(q)) {
        score = 70; confidence = 'fuzzy';
      } else if (q.includes(common) && common.length > 3) {
        score = 65; confidence = 'fuzzy';
      } else if (synonyms.some(s => s.includes(q))) {
        score = 65; confidence = 'fuzzy';
      } else if (synonyms.some(s => q.includes(s) && s.length > 3)) {
        score = 60; confidence = 'fuzzy';
      } else {
        const bWords = botanical.split(/\s+/);
        const cWords = common ? common.split(/\s+/) : [];
        const sWords = synonyms.flatMap(s => s.split(/\s+/));
        const allWords = [...bWords, ...cWords, ...sWords];
        const matchCount = words.filter(w =>
          w.length > 2 && allWords.some(aw => aw.includes(w) || w.includes(aw))
        ).length;
        if (matchCount > 0) {
          score = 20 * matchCount; confidence = 'fuzzy';
        } else {
          const fScore = Math.max(
            fuzzyScore(botanical, q),
            fuzzyScore(common, q),
            ...synonyms.map(s => fuzzyScore(s, q))
          );
          if (fScore > 0) {
            score = Math.round(fScore * 60); confidence = 'fuzzy';
          }
        }
      }

      if (score > bestScore) { bestScore = score; best = p; bestConfidence = confidence; }
    }

    if (best && bestScore >= 20) {
      return { plant: best, confidence: bestConfidence };
    }

    // Genus-level fallback
    if (!genus || genus.length < 4) return null;

    let genusBest = null, genusBestScore = 0;
    for (const p of PLANTS) {
      const botanical = (p.botanical || '').toLowerCase();
      if (!botanical) continue;
      if (botanical.startsWith(genus) || genus.startsWith(botanical.split(/\s+/)[0])) {
        const score = genus.length > 5 ? 55 : 40;
        if (score > genusBestScore) { genusBestScore = score; genusBest = p; }
      }
    }

    return genusBest ? { plant: genusBest, confidence: 'genus' } : null;
  }

  function findPlantInDB(query) {
    const result = findBestMatch(query);
    return result ? result.plant : null;
  }

  // ── Display results ────────────────────────────────────────
  function displayPlantResult(plant, confidence) {    if (!plant) {      statusMsg.textContent = 'No match found. Try the search bar above.';      resultCard.classList.remove('hidden');      resultBody.innerHTML = '<p class="no-match">No matching plant found in database.</p>';      return;    }    statusMsg.textContent = '';    resultCard.classList.remove('hidden');    // Confidence badge    let badge = '';    if (confidence === 'exact' || confidence === 'high') {      badge = '<span class="match-badge exact">&#10003; Match</span>';    } else if (confidence === 'fuzzy') {      badge = '<span class="match-badge fuzzy">&#126; Close match</span>';    } else if (confidence === 'genus') {      badge = '<span class="match-badge genus">&#63; Genus match — verify species</span>';    }    const cal = plant.calendar || {};    const monthSymbols = {      jan: cal.jan||'', feb: cal.feb||'', mar: cal.mar||'', apr: cal.apr||'',      may: cal.may||'', jun: cal.jun||'', jul: cal.jul||'', aug: cal.aug||'',      sep: cal.sep||'', oct: cal.oct||'', nov: cal.nov||'', dec: cal.dec||''    };    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];    const calHTML = months.map((m, i) =>      `<div class="cal-month${monthSymbols[m] === '&#9632;' ? ' best' : monthSymbols[m] === '&#9651;' ? ' light' : ''}">        <span class="cal-sym">${monthSymbols[m] || '&#8212;'}</span>        <span class="cal-name">${monthNames[i]}</span>      </div>`    ).join('');    const botanical = plant.botanical || plant.name || '';    const common = plant.common || '';    resultBody.innerHTML = `      ${badge}      <h2 class="plant-name" style="font-style:italic">${botanical}</h2>      ${common ? `<p class="plant-common">${common}</p>` : ''}      <div class="result-grid">        <div class="result-item"><span class="label">Size</span><span class="value">${plant.size || '&#8212;'}</span></div>        <div class="result-item"><span class="label">Prune Target</span><span class="value">${plant.target || '&#8212;'}</span></div>        <div class="result-item"><span class="label">Aggression</span><span class="value">${plant.aggression || '&#8212;'}</span></div>        <div class="result-item"><span class="label">Type</span><span class="value">${plant.type || '&#8212;'}</span></div>        <div class="result-item"><span class="label">Fertilize</span><span class="value">${plant.fertilize || '&#8212;'}</span></div>      </div>      <h3>Pruning Calendar</h3>      <div class="legend">        <span class="leg-item"><span class="sym-box best-box">&#9632;</span> Best time</span>        <span class="leg-item"><span class="sym-box light-box">&#9651;</span> Light only</span>        <span class="leg-item"><span class="sym-box avoid-box">&#8212;</span> Avoid</span>      </div>      <div class="cal-grid">${calHTML}</div>    `;  }  function displayPestResult(pest) {
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
            displayPlantResult(result.plant, result.confidence);
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
      (p.common || '').toLowerCase().includes(q) ||
      (Array.isArray(p.synonyms) && p.synonyms.some(s => s.toLowerCase().includes(q)))
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
