// CG Landscape Field Guide — App Logic

(function() {
  'use strict';

  let currentTab = 'plant';
  let stream = null;

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
    previewImg.classList.add('hidden');
    statusMsg.textContent = '';
    if (searchResults) searchResults.classList.add('hidden');
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

  // Take Photo → opens environment camera directly (reliable on iOS & Android)
  if (takePhotoBtn) {
    takePhotoBtn.addEventListener('click', () => {
      if (cameraInput) cameraInput.click();
    });
  }

  // Upload Photo → opens gallery picker
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  // Camera input (environment camera — iOS/Android)
  if (cameraInput) {
    cameraInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  // Gallery input (user picks photo)
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      statusMsg.textContent = 'Please select an image file.';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => showPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function showPreview(dataUrl) {
    if (previewImg) {
      previewImg.src = dataUrl;
      previewImg.classList.remove('hidden');
    }
    identifyPlant(dataUrl);
  }

  // ── Plant identification (keyword match + PlantNet fallback) ──
  const PLANINET_API_KEY = '2b10QnGeg2NIOcrZ53NXegnd4';

  async function identifyPlant(dataUrl) {
    statusMsg.textContent = 'Identifying…';
    resultCard.classList.add('hidden');

    try {
      // Try PlantNet API first
      const formData = new FormData();
      formData.append('images', dataURLtoBlob(dataUrl));

      const response = await fetch('https://my-api.plantnet.org/v2/identify/all?api-key=' + PLANINET_API_KEY + '&org=1', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const match = data.results[0];
        const commonName = match.species?.commonNames?.[0] || '';
        const scientificName = match.species?.scientificName || match.scientificName || '';
        const plantName = scientificName + (commonName ? ' (' + commonName + ')' : '');
        const plant = findPlantInDB(plantName);
        displayPlantResult(plant || { name: plantName, size: '—', target: '—', aggression: '—', type: '—', fertilize: '—', calendar: {} });
        return;
      }
    } catch (err) {
      // PlantNet failed — fall through to keyword match
    }

    // Keyword match against our database
    const match = keywordMatch(dataUrl);
    displayPlantResult(match);
  }

  function dataURLtoBlob(dataURL) {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  }

  function keywordMatch(dataUrl) {
    // Simple approach: if no filename info, show all or pick first
    // For production, image recognition would do real matching
    // Here we show a random or first plant as placeholder
    // Return null to trigger "no match"
    return null;
  }

  function findPlantInDB(query) {
    if (!query) return null;
    const q = query.toLowerCase();
    return PLANTS.find(p =>
      p.name.toLowerCase().includes(q) ||
      q.includes(p.name.toLowerCase())
    ) || null;
  }

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

    resultBody.innerHTML = `
      <h2 class="plant-name">${plant.name}</h2>
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
          const result = findPlantInDB(q);
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
    return PLANTS.filter(p => p.name.toLowerCase().includes(q));
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
        return `<button class="search-item" data-name="${item.name}">${item.name}</button>`;
      } else {
        return `<button class="search-item" data-name="${item.name}">${item.name} <span class="sev-tag ${item.severity === 'High' ? 'sev-high' : 'sev-med'}">${item.severity}</span></button>`;
      }
    }).join('');
    searchResults.classList.remove('hidden');

    searchResults.querySelectorAll('.search-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        searchBar.value = name;
        searchResults.classList.add('hidden');
        if (currentTab === 'plant') {
          const plant = PLANTS.find(p => p.name === name);
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
