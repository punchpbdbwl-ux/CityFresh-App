/**
 * CityFresh — Import Module
 * Supports .csv, .xlsx, .xls
 * Flow: drop/select file → parse → map columns → preview → confirm import
 */

const ImportModule = (() => {

  // All product fields the user can map to
  const CITYFRESH_FIELDS = [
    { key: 'direct',       label: 'Status (ON/OFF)',      required: false },
    { key: 'category',     label: 'Category',             required: false },
    { key: 'productOdoo',  label: 'Product Name (ODOO)',  required: true  },
    { key: 'productTH',    label: 'Thai Name',            required: false },
    { key: 'secondUom',    label: 'UOM / Weight',         required: false },
    { key: 'cost',         label: 'Cost',                 required: false },
    { key: 'size',         label: 'Size',                 required: false },
    { key: 'variety',      label: 'Variety',              required: false },
    { key: 'brand',        label: 'Brand',                required: false },
    { key: 'origins',      label: 'Origin',               required: false },
    { key: 'qty',          label: 'Quantity',             required: false },
    { key: 'unit',         label: 'Unit',                 required: false },
    { key: 'retailPrice',  label: 'Retail Price (฿)',     required: false },
    { key: 'onlinePrice',  label: 'Online Price (฿)',     required: false },
    { key: 'onlineTotal',  label: 'Online Total (฿)',     required: false },
  ];

  // Auto-detect mappings by fuzzy-matching header names
  const FUZZY_MAP = {
    direct:       ['direct','status','active','on/off'],
    category:     ['category','cat','type','fruit'],
    productOdoo:  ['product','products odoo','odoo','name','product name','item','sku'],
    productTH:    ['thai','th name','thai name','product th','ชื่อ'],
    secondUom:    ['uom','weight','unit of measure','second uom','uom/weight','box'],
    cost:         ['cost','price cost','cogs','unit cost'],
    size:         ['size','grade'],
    variety:      ['variety','cultivar','type'],
    brand:        ['brand','brand name','label'],
    origins:      ['origin','origins','country','source'],
    qty:          ['qty','quantity','stock','amount','count'],
    unit:         ['unit','unit type','pack unit'],
    retailPrice:  ['retail','retail price','price list','pricelist','retail ฿'],
    onlinePrice:  ['online','online price','online pricelist','e-commerce price','online ฿'],
    onlineTotal:  ['total','online total','total price','online total price','total ฿'],
  };

  let parsedHeaders = [];
  let parsedRows    = [];
  let currentFile   = '';

  // ── Drag & drop ──────────────────────────────────────────────────
  function onDragOver(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.add('drag-over');
  }
  function onDragLeave(e) {
    document.getElementById('drop-zone').classList.remove('drag-over');
  }
  function onDrop(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }
  function onFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = ''; // reset so same file can be re-selected
  }

  // ── File processing ───────────────────────────────────────────────
  function processFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    currentFile = file.name;

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = e => parseCSV(e.target.result);
      reader.readAsText(file, 'UTF-8');
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = e => parseExcel(e.target.result);
      reader.readAsArrayBuffer(file);
    } else {
      showImportStatus('Unsupported file type. Please use .csv, .xlsx, or .xls', 'err');
    }
  }

  function parseCSV(text) {
    // Handle both comma and semicolon delimiters
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) { showImportStatus('File is empty or has no data rows.', 'err'); return; }

    const delim   = lines[0].includes(';') ? ';' : ',';
    const headers = csvSplit(lines[0], delim);
    const rows    = lines.slice(1)
      .filter(l => l.trim())
      .map(l => {
        const vals = csvSplit(l, delim);
        const obj  = {};
        headers.forEach((h, i) => obj[h] = (vals[i] || '').trim());
        return obj;
      });

    parsedHeaders = headers;
    parsedRows    = rows;
    afterParse();
  }

  function csvSplit(line, delim) {
    // Handles quoted fields
    const result = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === delim && !inQ) { result.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    result.push(cur.trim());
    return result;
  }

  function parseExcel(arrayBuffer) {
    try {
      const wb   = XLSX.read(arrayBuffer, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (data.length < 2) { showImportStatus('Spreadsheet appears empty.', 'err'); return; }

      const headers = data[0].map(h => String(h).trim());
      const rows    = data.slice(1)
        .filter(r => r.some(c => String(c).trim()))
        .map(r => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = String(r[i] ?? '').trim());
          return obj;
        });

      parsedHeaders = headers;
      parsedRows    = rows;
      afterParse();
    } catch (err) {
      showImportStatus('Could not read Excel file: ' + err.message, 'err');
    }
  }

  // ── After parse: build mapping UI ────────────────────────────────
  function afterParse() {
    document.getElementById('import-file-name').textContent = currentFile;
    buildMappingUI();
    buildPreview();
    document.getElementById('import-mapping-wrap').style.display  = 'block';
    document.getElementById('import-preview-wrap').style.display  = 'block';
    document.getElementById('import-options-wrap').style.display  = 'block';
    document.getElementById('import-footer').style.display        = 'flex';
    showImportStatus('');
  }

  function autoDetect(headerName) {
    const h = headerName.toLowerCase().trim();
    for (const [field, aliases] of Object.entries(FUZZY_MAP)) {
      if (aliases.some(a => h === a || h.includes(a) || a.includes(h))) return field;
    }
    return '';
  }

  function buildMappingUI() {
    const grid = document.getElementById('mapping-grid');
    grid.innerHTML = CITYFRESH_FIELDS.map(f => {
      const detected = autoDetect(parsedHeaders.find(h => autoDetect(h) === f.key) || '');
      const options  = ['<option value="">— not mapped —</option>']
        .concat(parsedHeaders.map(h => {
          const sel = autoDetect(h) === f.key ? 'selected' : '';
          return `<option value="${escHtml(h)}" ${sel}>${escHtml(h)}</option>`;
        })).join('');
      const hasSel   = parsedHeaders.some(h => autoDetect(h) === f.key);
      return `<div class="map-row">
        <label>${f.label}${f.required ? ' <span style="color:var(--re)">*</span>' : ''}</label>
        <select id="map-${f.key}" class="${hasSel ? 'mapped' : ''}" onchange="ImportModule.onMapChange(this)">
          ${options}
        </select>
      </div>`;
    }).join('');
  }

  function onMapChange(sel) {
    sel.classList.toggle('mapped', sel.value !== '');
    buildPreview();
  }

  // ── Preview table ─────────────────────────────────────────────────
  function buildPreview() {
    const mappedFields = getMappings();
    const keys = Object.keys(mappedFields).filter(k => mappedFields[k]);
    const preview5 = parsedRows.slice(0, 5);

    document.getElementById('preview-count').textContent =
      parsedRows.length + ' row' + (parsedRows.length !== 1 ? 's' : '') + ' detected';

    const table = document.getElementById('preview-table');
    if (!keys.length) { table.innerHTML = '<tr><td colspan="2" style="padding:12px;color:var(--soft);text-align:center">Map at least one column to see a preview.</td></tr>'; return; }

    const friendlyLabel = k => CITYFRESH_FIELDS.find(f => f.key === k)?.label || k;

    const thead = `<thead><tr>${keys.map(k => `<th>${friendlyLabel(k)}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${preview5.map(row =>
      `<tr>${keys.map(k => `<td>${escHtml(String(row[mappedFields[k]] ?? ''))}</td>`).join('')}</tr>`
    ).join('')}</tbody>`;
    table.innerHTML = thead + tbody;
  }

  function getMappings() {
    const result = {};
    CITYFRESH_FIELDS.forEach(f => {
      const sel = document.getElementById('map-' + f.key);
      result[f.key] = sel ? sel.value : '';
    });
    return result;
  }

  // ── Confirm import ────────────────────────────────────────────────
  function confirmImport() {
    const mappings = getMappings();

    // Validate required fields
    const missing = CITYFRESH_FIELDS.filter(f => f.required && !mappings[f.key]);
    if (missing.length) {
      showImportStatus(`Please map required field: ${missing.map(f => f.label).join(', ')}`, 'err');
      return;
    }

    const mode = document.querySelector('input[name="import-mode"]:checked').value;

    const imported = parsedRows
      .filter(row => {
        const val = row[mappings.productOdoo] || '';
        return val.trim() !== '';
      })
      .map(row => {
        const p = {};
        CITYFRESH_FIELDS.forEach(f => {
          if (!mappings[f.key]) return;
          let v = (row[mappings[f.key]] || '').trim();

          // Type coercion
          if (f.key === 'direct') {
            p[f.key] = v.toUpperCase() === 'OFF' ? 'OFF' : 'ON';
          } else if (['cost','qty','retailPrice','onlinePrice','onlineTotal'].includes(f.key)) {
            const n = parseFloat(v.replace(/[฿,\s]/g, ''));
            p[f.key] = isNaN(n) ? '' : n;
          } else {
            p[f.key] = v;
          }
        });

        // Fill defaults for unmapped required-ish fields
        if (!p.direct) p.direct = 'ON';
        if (!p.qty)    p.qty    = 0;

        p.id        = Date.now() + Math.random();
        p.createdAt = new Date().toISOString();
        return p;
      });

    if (!imported.length) {
      showImportStatus('No valid rows found to import.', 'err');
      return;
    }

    // Auto-create any new categories found
    const existingCatNames = DB.Categories.all().map(c => c.name);
    const CAT_COLORS = [
      '#8BAC4A,#1A1A1A','#D4537E,#fff','#C8A832,#1A1A1A','#0F6E56,#fff',
      '#E68755,#fff','#7B5EA7,#fff','#C84040,#fff','#5590CC,#fff',
    ];
    let colorIdx = 0;
    const newCats = [...new Set(imported.map(p => p.category).filter(Boolean))]
      .filter(n => !existingCatNames.includes(n));
    newCats.forEach(name => {
      const [bg, fg] = CAT_COLORS[colorIdx++ % CAT_COLORS.length].split(',');
      DB.Categories.add({ name, icon: '🍀', bg, fg });
    });

    if (mode === 'replace') {
      DB.Products.save(imported);
    } else {
      const existing = DB.Products.all();
      DB.Products.save([...existing, ...imported]);
    }

    closeModal('import-modal');
    AppInventory.init();

    const msg = `✓ ${imported.length} product${imported.length !== 1 ? 's' : ''} imported` +
      (newCats.length ? ` · ${newCats.length} new categor${newCats.length !== 1 ? 'ies' : 'y'} created` : '');
    showToast(msg);
    resetImportModal();
  }

  // ── Helpers ────────────────────────────────────────────────────────
  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showImportStatus(msg, type) {
    const el = document.getElementById('import-status');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'import-status-msg' + (type ? ' ' + type : '');
  }

  function resetImportModal() {
    parsedHeaders = [];
    parsedRows    = [];
    currentFile   = '';
    ['import-mapping-wrap','import-preview-wrap','import-options-wrap','import-footer']
      .forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('import-file-name').textContent = '';
    document.getElementById('import-status').textContent = '';
    document.querySelector('input[name="import-mode"][value="append"]').checked = true;
  }

  function openImportModal() {
    resetImportModal();
    document.getElementById('import-modal').classList.add('open');
  }

  return {
    onDragOver, onDragLeave, onDrop, onFileSelect,
    onMapChange, confirmImport, openImportModal,
  };
})();

// Global so HTML onclick can reach it
function openImportModal() { ImportModule.openImportModal(); }
