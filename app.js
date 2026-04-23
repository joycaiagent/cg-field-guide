// CG Landscape Field Guide — App Logic

(function() {
  'use strict';

  let currentTab = 'plant';
  const APP_LAST_UPDATED = 'Apr 22, 2026';

  // ── Thumbnail lookup (maps genus → first available image) ──
  const _thumbMap = {
    'achillea':      'assets/plants/achillea_millefolium_pomegranate.jpg',
    'agapanthus':    'assets/plants/agapanthus_tinkerbell.jpg',
    'bougainvillea': 'assets/plants/bougainvillea_barbara_karst.jpg',
    'carissa':       'assets/plants/carissa_green_carpet.jpg',
    'chondropetalum':'assets/plants/chondropetalum_tectorum_1.jpg',
    'cordyline':     'assets/plants/cordyline_australis_red_star_2.jpg',
    'dianella':      'assets/plants/dianella_revoluta_little_rev_00.jpg',
    'dietes':        'assets/plants/dietes_00.jpg',
    'lantana':       'assets/plants/lantana_montevidensis_purple_00.jpg',
    'lavandula':     'assets/plants/lavandula_dentata_00.jpg',
    'lomandra':      'assets/plants/lomandra_longifolia_breeze_1.jpg',
    'miscanthus':    'assets/plants/miscanthus_sinensis.jpg',
    'pennisetum':    'assets/plants/pennisetum_fairy_tails.jpg',
    'philodendron':  'assets/plants/philodendron_xanadu_00.jpg',
    'rhaphiolepis':  'assets/plants/rhaphiolepis_indica_1.jpg',
    'rosa':          'assets/plants/rosa_iceberg.jpg',
    'salvia':        'assets/plants/salvia_allen_chickering_00.jpg',
    'schefflera':    'assets/plants/schefflera_arboricola_1.jpg',
    'strelitzia':    'assets/plants/strelitzia_nicolai_1.jpg',
    'tecoma':        'assets/plants/tecoma_stans_1.jpg',
    'trachelospermum':'assets/plants/trachelospermum_jasminoides.jpg',
  };

  function getThumb(plant) {
    const key = (plant.botanical || plant.name || '').split(' ')[0].toLowerCase();
    return _thumbMap[key] || null;
  }

  // ── Popular plants (quick-tap shortcuts) ─────────────────
  const POPULAR_PLANTS = [
    { botanical: 'Bougainvillea spectabilis',  common: 'Bougainvillea' },
    { botanical: 'Lantana montevidensis',     common: 'Purple Lantana' },
    { botanical: 'Pittosporum',                 common: 'Pittosporum' },
    { botanical: 'Carissa macrocarpa',          common: 'Natal Plum' },
    { botanical: 'Lomandra longifolia \'Breeze\'', common: 'Lomandra' },
    { botanical: 'Myoporum parvifolium',        common: 'Myoporum' },
    { botanical: 'Podocarpus',                 common: 'Podocarpus' },
    { botanical: 'Salvia leucantha',           common: 'Mexican Bush Sage' },
  ];

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
  let visibleSearchItems = [];
  const MAX_PHOTOS = 5;

  const tabBtns   = document.querySelectorAll('.tab-btn');
  const plantTab   = $('plant-tab');
  const pestTab    = $('pest-tab');
  const searchBar  = $('search-bar');
  const searchClear = $('search-clear');
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
  const fileInput   = $('file-input');
  const cameraInput = $('camera-input');
  const lightbox = $('image-lightbox');
  const lightboxImg = $('image-lightbox-img');
  const lightboxStage = $('image-lightbox-stage');
  const lightboxCloseBtn = $('lightbox-close-btn');
  const zoomInBtn = $('zoom-in-btn');
  const zoomOutBtn = $('zoom-out-btn');
  const zoomResetBtn = $('zoom-reset-btn');
  let lightboxZoom = 1;

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
    searchBar.value = '';
    if (searchClear) searchClear.classList.add('hidden');
  }

  // ── Popular plants grid ────────────────────────────────────
  function initPopularPlants() {
    const grid = $('popular-grid');
    if (!grid) return;
    POPULAR_PLANTS.forEach(p => {
      const plant = PLANTS.find(pl =>
        (pl.botanical || '').toLowerCase() === p.botanical.toLowerCase() ||
        (pl.botanical || '').toLowerCase().startsWith(p.botanical.toLowerCase())
      );
      const thumb = getThumb(plant || p);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'popular-item';
      item.innerHTML = `
        ${thumb ? `<img src="${thumb}" class="popular-thumb" alt="${p.common}" loading="lazy" />` : '<div class="popular-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🌿</div>'}
        <span class="popular-name">${p.common}</span>
      `;
      item.addEventListener('click', () => {
        if (plant) {
          displayPlantResult(plant, 'exact');
          hidePreview();
          searchBar.value = plant.botanical;
        } else {
          statusMsg.textContent = 'Plant not found in database.';
        }
      });
      grid.appendChild(item);
    });
  }

  // ── Browse all plants ──────────────────────────────────────
  function initBrowseAll() {
    const toggle = $('browse-toggle');
    const list = $('browse-list');
    if (!toggle || !list) return;

    // Build alphabetical list
    const sorted = [...PLANTS].sort((a, b) =>
      (a.botanical || '').localeCompare(b.botanical || '')
    );
    list.innerHTML = sorted.map(p => {
      const thumb = getThumb(p);
      return `<button type="button" class="browse-item" data-bot="${p.botanical}">
        ${thumb ? `<img src="${thumb}" style="width:18px;height:18px;object-fit:cover;border-radius:3px;vertical-align:middle;margin-right:4px;" />` : ''}
        ${p.botanical}${p.common && p.common !== p.botanical ? ' – ' + p.common : ''}
      </button>`;
    }).join('');

    toggle.addEventListener('click', () => {
      const isHidden = list.classList.toggle('hidden');
      toggle.innerHTML = isHidden ? '📋 Browse all plants ▾' : '📋 Browse all plants ▴';
    });

    list.addEventListener('click', e => {
      const btn = e.target.closest('.browse-item');
      if (!btn) return;
      const bot = btn.dataset.bot;
      const plant = PLANTS.find(p => p.botanical === bot);
      if (plant) {
        displayPlantResult(plant, 'exact');
        hidePreview();
        searchBar.value = plant.botanical;
      }
    });
  }

  initPopularPlants();
  initBrowseAll();

  function hidePreview() {
    if (previewImg) previewImg.classList.add('hidden');
  }

  function hideSearchResults() {
    if (searchResults) searchResults.classList.add('hidden');
  }

  function clearResults() {
    resultCard.classList.add('hidden');
    hidePreview();
    statusMsg.textContent = '';
    hideSearchResults();
    selectedPhotos = [];
    renderPhotoPreviews();
  }

  function setLightboxZoom(nextZoom) {
    lightboxZoom = Math.max(1, Math.min(4, nextZoom));
    if (lightboxImg) {
      lightboxImg.style.transform = `scale(${lightboxZoom})`;
    }
    if (zoomResetBtn) {
      zoomResetBtn.textContent = `${Math.round(lightboxZoom * 100)}%`;
    }
  }

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Expanded plant image';
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxStage) {
      lightboxStage.scrollTop = 0;
      lightboxStage.scrollLeft = 0;
    }
    setLightboxZoom(1);
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
    setLightboxZoom(1);
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
        // Auto-identify ONCE on first photo — user controls when to ID more
        if (selectedPhotos.length === 1) {
          identifyPlantMulti(selectedPhotos.map(p => p.dataUrl));
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Plant identification (multi-photo + PlantNet) ───────────
  const PLANINET_API_KEY = '2b10hewV0342kXX83Sf8sX9ssJu';

  const MAX_IMG_W = 800, MAX_IMG_H = 800, IMG_QUALITY = 0.8;

  /** Analyze one photo against PlantNet + our DB, return ranked results */
  async function analyzePhoto(dataUrl) {
    const resized = await resizeImage(dataUrl, MAX_IMG_W, MAX_IMG_H, IMG_QUALITY);
    const blob = dataURLtoBlob(resized);
    const formData = new FormData();
    formData.append('images', blob);
    const response = await fetch(
      'https://my-api.plantnet.org/v2/identify/all?api-key=' + PLANINET_API_KEY + '&org=1',
      { method: 'POST', body: formData }
    );
    return response.json();
  }

  /** Vote across all photo results — pick the most-confident DB match */
  function voteResults(allResults) {
    const plantScores = {};
    for (const r of allResults) {
      if (!r.plant) continue;
      const key = r.plant.botanical;
      const tier = r.confidence === 'exact' ? 4 : r.confidence === 'high' ? 3 : r.confidence === 'fuzzy' ? 2 : r.confidence === 'genus' ? 1 : 0;
      if (!plantScores[key]) plantScores[key] = { plant: r.plant, confidence: r.confidence, score: 0, count: 0 };
      plantScores[key].score += tier * 10 + r.score;
      plantScores[key].count++;
    }
    let best = null, bestAvg = 0;
    for (const ps of Object.values(plantScores)) {
      const avg = ps.score / ps.count;
      if (avg > bestAvg) { bestAvg = avg; best = ps; }
    }
    return best;
  }

  async function identifyPlantMulti(dataUrls) {
    const n = dataUrls.length;
    statusMsg.textContent = 'Analyzing…';
    resultCard.classList.add('hidden');

    try {
      // Compress all photos first
      statusMsg.textContent = n === 1 ? 'Compressing photo…' : 'Compressing photos…';
      const compressed = await Promise.all(
        dataUrls.map(url => resizeImage(url, MAX_IMG_W, MAX_IMG_H, IMG_QUALITY))
      );

      // Send each photo separately, collect all results
      const allResults = [];
      for (let i = 0; i < compressed.length; i++) {
        statusMsg.textContent = `Checking photo ${i + 1} of ${n}…`;
        try {
          const data = await analyzePhoto(compressed[i]);
          if (!data.results || data.results.length === 0) continue;
          for (const r of data.results.slice(0, 5)) {
            const scientificName = r.species?.scientificName || r.scientificName || '';
            const commonName = r.species?.commonNames?.[0] || '';
            const result = findBestMatch(scientificName) || findBestMatch(commonName);
            if (result) {
              allResults.push({
                plant: result.plant,
                confidence: result.confidence,
                score: result.confidence === 'exact' ? 40 : result.confidence === 'high' ? 30 : result.confidence === 'fuzzy' ? 15 : 5,
                species: scientificName,
                common: commonName
              });
              if (result.confidence === 'exact' || result.confidence === 'high') break;
            }
          }
        } catch (e) {
          console.warn('Photo', i, 'error:', e);
        }
      }

      if (allResults.length > 0) {
        const winner = voteResults(allResults);
        if (winner) {
          displayPlantResult(winner.plant, winner.confidence);
          return;
        }
      }

      // No confident DB match
      const bestPN = allResults.find(r => r.species) || { species: '', common: '' };
      const tip = allResults.length === 0
        ? 'No plant detected. Try including leaves, flowers, or bark in the photo.'
        : "This plant isn't in the CG Landscape pruning guide. Ask your supervisor.";
      statusMsg.textContent = '';
      resultCard.classList.remove('hidden');
      resultBody.innerHTML = `
        <p class="no-match" style="color:var(--teal);font-weight:600;">Not in our 87-plant database</p>
        <p class="no-match" style="font-size:0.9rem">PlantNet identified as:</p>
        <h2 class="plant-name" style="font-style:italic">${bestPN.species || 'Unknown'}</h2>
        ${bestPN.common ? `<p class="plant-common">${bestPN.common}</p>` : ''}
        <p style="font-size:0.85rem;color:#666;margin-top:8px;">${tip}</p>
      `;
    } catch (err) {
      statusMsg.textContent = 'Identification failed. Check your connection.';
    }
  }
  // Legacy single-photo alias
  async function identifyPlant(dataUrl) {
    return identifyPlantMulti([dataUrl]);
  }

  /** Resize an image to maxWidth×maxHeight, return new dataURL */
  function resizeImage(dataUrl, maxWidth, maxHeight, quality) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl); // fallback: return original
      img.src = dataUrl;
    });
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
  function displayPlantResult(plant, confidence) {
    if (!plant) {
      statusMsg.textContent = 'No match found. Try the search bar above.';
      resultCard.classList.remove('hidden');
      resultBody.innerHTML = '<p class="no-match">No matching plant found in database.</p>';
      return;
    }

    statusMsg.textContent = '';
    resultCard.classList.remove('hidden');

    let badge = '';
    if (confidence === 'exact' || confidence === 'high') {
      badge = '<span class="match-badge exact">&#10003; Match</span>';
    } else if (confidence === 'fuzzy') {
      badge = '<span class="match-badge fuzzy">&#126; Close match</span>';
    } else if (confidence === 'genus') {
      badge = '<span class="match-badge genus">&#63; Genus match — verify species</span>';
    }

    const cal = plant.calendar || {};
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthSymbols = {
      jan: cal.jan || '', feb: cal.feb || '', mar: cal.mar || '', apr: cal.apr || '',
      may: cal.may || '', jun: cal.jun || '', jul: cal.jul || '', aug: cal.aug || '',
      sep: cal.sep || '', oct: cal.oct || '', nov: cal.nov || '', dec: cal.dec || ''
    };
    const bestMonths = months.filter(m => monthSymbols[m] === '■').map((m, i) => monthNames[months.indexOf(m)]);
    const lightMonths = months.filter(m => monthSymbols[m] === '△').map((m, i) => monthNames[months.indexOf(m)]);
    const seasonLabelMap = {
      Warm: 'Warmer growing season plant',
      Cool: 'Cool season or cooler weather performer',
      Year: 'Can usually be maintained through most of the year',
      Shade: 'Use extra caution, usually slower recovery in shade'
    };
    const aggressionNoteMap = {
      Light: 'Stay conservative, shape more than reduce.',
      'Light–Med': 'Moderate shaping is usually safe.',
      Medium: 'Can take a noticeable cutback if healthy.',
      'Med–Heavy': 'Can handle a strong reduction when timed right.',
      Heavy: 'Can be cut back hard during the right window.'
    };
    const calHTML = months.map((m, i) =>
      `<div class="cal-month${monthSymbols[m] === '■' ? ' best' : monthSymbols[m] === '△' ? ' light' : ''}">
        <span class="cal-sym">${monthSymbols[m] || '&#8212;'}</span>
        <span class="cal-name">${monthNames[i]}</span>
      </div>`
    ).join('');

    const botanical = plant.botanical || plant.name || '';
    const common = plant.common || '';
    const image = plant.image || '';
    const images = Array.isArray(plant.images) ? plant.images : (image ? [image] : []);
    const synonyms = Array.isArray(plant.synonyms) && plant.synonyms.length
      ? plant.synonyms.join(', ')
      : '';
    const bestMonthsText = bestMonths.length ? bestMonths.join(', ') : 'No strong prune window listed';
    const lightMonthsText = lightMonths.length ? lightMonths.join(', ') : 'None listed';
    const seasonNote = seasonLabelMap[plant.type] || 'Follow the calendar window and plant health.';
    const aggressionNote = aggressionNoteMap[plant.aggression] || 'Match pruning intensity to plant health and site conditions.';

    resultBody.innerHTML = `
      <div class="result-header result-header-rich${image ? ' result-header-with-image' : ''}">
        <div>
          <p class="result-kicker">Plant match</p>
          <h2 class="plant-name" style="font-style:italic">${botanical}</h2>
          ${common ? `<p class="plant-common">${common}</p>` : ''}
          ${synonyms ? `<p class="plant-aliases"><strong>Also called:</strong> ${synonyms}</p>` : ''}
        </div>
        <div class="result-header-side">
          ${badge ? `<div class="result-badge-wrap">${badge}</div>` : ''}
          ${image ? `<div class="plant-image-card"><img src="${image}" alt="${common || botanical}" class="plant-image" loading="lazy" /></div>` : ''}
        </div>
      </div>
      ${images.length ? `
      <div class="plant-gallery">
        ${images.map((img, i) => `<img src="${img}" alt="Reference ${i+1}" class="gallery-img" loading="lazy" />`).join('')}
      </div>` : ''}

      <div class="hero-note-card">
        <div class="hero-note-main">
          <span class="hero-note-label">Best prune window</span>
          <span class="hero-note-value">${bestMonthsText}</span>
        </div>
        <div class="hero-note-sub">Light prune only: ${lightMonthsText}</div>
      </div>

      <div class="result-summary">Use this as a quick field guide for pruning timing, cutback level, and feed timing.</div>

      <div class="result-grid">
        <div class="result-item"><span class="label">Size</span><span class="value">${plant.size || '&#8212;'}</span></div>
        <div class="result-item"><span class="label">Prune Target</span><span class="value">${plant.target || '&#8212;'}</span></div>
        <div class="result-item"><span class="label">Aggression</span><span class="value">${plant.aggression || '&#8212;'}</span></div>
        <div class="result-item"><span class="label">Season</span><span class="value">${plant.type || '&#8212;'}</span></div>
        <div class="result-item result-item-wide"><span class="label">Feed After Prune</span><span class="value">${plant.fertilize || '&#8212;'}</span></div>
      </div>

      <div class="detail-stack">
        <div class="detail-card">
          <span class="label">Pruning note</span>
          <p>${aggressionNote}</p>
        </div>
        <div class="detail-card">
          <span class="label">Season note</span>
          <p>${seasonNote}</p>
        </div>
      </div>

      <section class="calendar-card">
        <div class="calendar-head">
          <div>
            <h3>Pruning Calendar</h3>
            <p class="calendar-caption">Dark teal is best time, light teal is light pruning only.</p>
          </div>
        </div>
        <div class="legend">
          <span class="leg-item"><span class="sym-box best-box">■</span> Best time</span>
          <span class="leg-item"><span class="sym-box light-box">△</span> Light only</span>
          <span class="leg-item"><span class="sym-box avoid-box">&#8212;</span> Avoid</span>
        </div>
        <div class="cal-grid">${calHTML}</div>
      </section>
      <p class="result-meta">Schedule last updated ${APP_LAST_UPDATED}</p>
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

  if (resultBody) {
    resultBody.addEventListener('click', e => {
      const img = e.target.closest('.plant-image, .gallery-img');
      if (!img) return;
      openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
    });
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => setLightboxZoom(lightboxZoom + 0.5));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setLightboxZoom(lightboxZoom - 0.5));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => setLightboxZoom(1));
  if (lightboxStage) {
    lightboxStage.addEventListener('click', e => {
      if (e.target === lightboxStage) {
        closeLightbox();
        return;
      }
      if (e.target === lightboxImg && lightboxZoom <= 1.05) {
        closeLightbox();
      }
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });

  // ── Search bar ─────────────────────────────────────────────
  if (searchBar) {
    searchBar.addEventListener('input', e => {
      const q = e.target.value.trim();
      if (searchClear) searchClear.classList.toggle('hidden', !q);
      if (!q) {
        if (searchResults) searchResults.classList.add('hidden');
        return;
      }
      if (currentTab === 'plant' && tryDisplayTypedPlant(q)) return;
      const results = currentTab === 'plant'
        ? searchPlants(q)
        : searchPests(q);
      renderSearchResults(results);
    });

    searchBar.addEventListener('change', e => {
      tryDisplayTypedPlant(e.target.value);
    });

    searchBar.addEventListener('blur', e => {
      setTimeout(() => tryDisplayTypedPlant(e.target.value), 120);
    });

    searchBar.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault(); // prevent form submit / blur cascade
        const q = e.target.value.trim();
        if (q && currentTab === 'plant') {
          if (tryDisplayTypedPlant(q)) return;
          const result = findBestMatch(q);
          if (result) {
            displayPlantResult(result.plant, result.confidence);
            hidePreview();
          }
        }
      }
    });
  }

  // ── Search clear button ────────────────────────────────────
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchBar.value = '';
      searchClear.classList.add('hidden');
      hideSearchResults();
      searchBar.focus();
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

  function tryDisplayTypedPlant(query) {
    const q = (query || '').trim();
    if (!q || currentTab !== 'plant') return false;

    const exact = PLANTS.find(p =>
      (p.botanical || '').toLowerCase() === q.toLowerCase() ||
      (p.common || '').toLowerCase() === q.toLowerCase() ||
      (Array.isArray(p.synonyms) && p.synonyms.some(s => s.toLowerCase() === q.toLowerCase()))
    );
    if (exact) {
      displayPlantResult(exact, 'exact');
      hideSearchResults();
      hidePreview();
      return true;
    }

    const results = searchPlants(q);
    if (results.length === 1) {
      displayPlantResult(results[0], 'exact');
      hideSearchResults();
      hidePreview();
      return true;
    }

    return false;
  }

  function searchPests(query) {
    const q = query.toLowerCase();
    return PESTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.plantsAffected.some(plant => plant.toLowerCase().includes(q))
    );
  }

  function selectSearchResult(index) {
    const item = visibleSearchItems[index];
    if (!item) return;
    searchBar.value = currentTab === 'plant' ? item.botanical : item.name;
    hideSearchResults();
    statusMsg.textContent = 'Looking up…';
    if (currentTab === 'plant') {
      displayPlantResult(item, 'exact');
      hidePreview();
      if (resultCard && resultCard.scrollIntoView) {
        setTimeout(() => resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
      }
    } else {
      displayPestResult(item);
    }
  }

  function renderSearchResults(results) {
    if (!searchResults) return;
    visibleSearchItems = results.slice(0, 10);
    if (visibleSearchItems.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">No results</div>';
      searchResults.classList.remove('hidden');
      return;
    }
    searchResults.innerHTML = visibleSearchItems.map((item, index) => {
      if (currentTab === 'plant') {
        const thumb = getThumb(item);
        const thumbHtml = thumb
          ? `<img src="${thumb}" class="search-thumb" alt="" loading="lazy" />`
          : `<div class="search-thumb" style="display:flex;align-items:center;justify-content:center;font-size:0.9rem;background:#e8f5f5;color:var(--teal);">🌿</div>`;
        return `<button type="button" class="search-item" data-result-index="${index}">
          ${thumbHtml}
          <span class="search-item-text">
            <span class="search-item-name">${item.botanical}</span>
            ${item.common ? `<span class="search-item-common">${item.common}</span>` : ''}
          </span>
        </button>`;
      } else {
        return `<button type="button" class="search-item" data-result-index="${index}">${item.name} <span class="sev-tag ${item.severity === 'High' ? 'sev-high' : 'sev-med'}">${item.severity}</span></button>`;
      }
    }).join('');
    searchResults.classList.remove('hidden');
  }

  if (searchResults) {
    const handleSearchSelection = e => {
      const btn = e.target.closest('.search-item');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(btn.dataset.resultIndex, 10);
      if (Number.isNaN(index)) return;
      selectSearchResult(index);
    };
    searchResults.addEventListener('touchstart', handleSearchSelection, { passive: false });
    searchResults.addEventListener('mousedown', handleSearchSelection);
    searchResults.addEventListener('click', handleSearchSelection);
  }

  // ── Pest tab search & display ─────────────────────────────
  const pestResultCard = $('pest-result-card');
  const pestResultBody = $('pest-result-body');

  function displayPestResult(pest) {
    if (!pest) {
      pestResultBody.innerHTML = '<p class="no-match">No matching pest found.</p>';
      pestResultCard.classList.remove('hidden');
      return;
    }
    pestResultCard.classList.remove('hidden');
    const severityClass = pest.severity === 'High' ? 'sev-high' : pest.severity === 'Medium' ? 'sev-med' : 'sev-low';
    const pestImageHtml = pest.image
      ? `<img src="${pest.image}" alt="${pest.name}" class="pest-detail-img" style="max-width:100%;border-radius:8px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.15);"> `
      : '';
    pestResultBody.innerHTML = `
      ${pestImageHtml}
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
