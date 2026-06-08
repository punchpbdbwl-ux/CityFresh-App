/**
 * CityFresh — Inventory App
 * All DB calls are async so they work with both localStorage and Supabase.
 */

const AppInventory = (() => {

  const originFlags = {
    'USA':'🇺🇸','New Zealand':'🇳🇿','NewZealand':'🇳🇿','NZL':'🇳🇿',
    'FRA':'🇫🇷','THA':'🇹🇭','South Korea':'🇰🇷','Japan':'🇯🇵',
    'AUS':'🇦🇺','China':'🇨🇳','Spain':'🇪🇸','Italy':'🇮🇹',
    'Peru':'🇵🇪','South Africa':'🇿🇦','Chile':'🇨🇱',
  };

  let currentCat    = '';
  let currentStatus = '';
  let sortField     = '';
  let sortDir       = 1;
  let editingId     = null;
  let editingCatId  = null;
  const expandedGroups = new Set();

  // ── Helpers ───────────────────────────────────────────────────────
  function getFlag(o) {
    if (!o) return '';
    for (const k of Object.keys(originFlags))
      if (o.toLowerCase().includes(k.toLowerCase())) return originFlags[k];
    return '';
  }
  function fmtPrice(v) {
    if (v === '' || v === null || v === undefined || Number(v) === 0)
      return '<span class="price-nil">—</span>';
    return '<span class="price-val">฿' + Number(v).toLocaleString('th-TH', { maximumFractionDigits: 2 }) + '</span>';
  }
  function groupKey(p) { return (p.productOdoo || '').trim(); }
  function getCatStyle(name) {
    return _cats.find(c => c.name === name) || { bg: '#D3D1C7', fg: '#444441' };
  }

  // ── In-memory cache (populated on init and after every mutation) ──
  let _products = [];
  let _cats     = [];

  async function refreshCache() {
    [_products, _cats] = await Promise.all([DB.Products.all(), DB.Categories.all()]);
  }

  // ── Stats ─────────────────────────────────────────────────────────
  function updateStats() {
    document.getElementById('s-total').textContent  = _products.length;
    document.getElementById('s-active').textContent = _products.filter(p => p.direct === 'ON').length;
    document.getElementById('s-cats').textContent   = [...new Set(_products.map(p => p.category).filter(Boolean))].length;
  }

  // ── Connection badge ──────────────────────────────────────────────
  function setModeBadge() {
    const badge = document.getElementById('mode-badge');
    if (!badge) return;
    if (DB.mode === 'supabase') {
      badge.textContent = '🌐 Live sync';
      badge.className   = 'mode-badge mode-live';
    } else {
      badge.textContent = '💾 Offline';
      badge.className   = 'mode-badge mode-offline';
    }
  }

  // ── Realtime subscription (Supabase only) ─────────────────────────
  function startRealtime() {
    if (DB.mode !== 'supabase') return;
    DB.subscribeRealtime(async () => {
      await refreshCache();
      renderCatSidebar();
      renderTable();
      updateStats();
      showToast('↻ Updated from server');
    });
  }

  // ── Category Sidebar ──────────────────────────────────────────────
  function renderCatSidebar() {
    const grid = document.getElementById('cat-grid');

    const allBtn = `<button class="cat-btn-all ${currentCat === '' ? 'active' : ''}" onclick="AppInventory.setCat('')">
      <i class="ti ti-layout-list" style="font-size:14px" aria-hidden="true"></i> All products
    </button>`;

    const catBtns = _cats.map(c => {
      const count = _products.filter(p => p.category === c.name).length;
      const name  = c.name.replace(/'/g, "\\'");
      const icon  = FruitIcons.get(c.name, c.fg, 26);
      return `<button class="cat-btn ${currentCat === c.name ? 'active' : ''}"
        onclick="AppInventory.setCat('${name}')"
        style="background:${c.bg};color:${c.fg}">
        <span class="cat-svg-icon">${icon}</span>
        <span class="cat-label">${c.name}</span>
        ${count > 0 ? `<span class="cat-count">${count}</span>` : ''}
      </button>`;
    }).join('');

    const addBtn = `<button class="add-cat-btn" onclick="AppInventory.openCatManager()">
      <i class="ti ti-plus" style="font-size:18px" aria-hidden="true"></i>
      <span>Add</span>
    </button>`;

    grid.innerHTML = allBtn + catBtns + addBtn;
    updateCategorySelect();
  }

  function updateCategorySelect() {
    const sel = document.getElementById('f-category');
    if (!sel) return;
    sel.innerHTML = _cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  // ── Grouped Table ─────────────────────────────────────────────────
  function renderTable() {
    const q = (document.getElementById('search').value || '').toLowerCase();
    let products = _products.filter(p => {
      if (currentCat   && p.category !== currentCat)   return false;
      if (currentStatus && p.direct  !== currentStatus) return false;
      if (q) {
        const hay = [p.productOdoo, p.productTH, p.category, p.variety, p.brand, p.origins].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const groupMap = new Map();
    products.forEach(p => {
      const k = groupKey(p);
      if (!groupMap.has(k)) groupMap.set(k, []);
      groupMap.get(k).push(p);
    });

    let groups = [...groupMap.entries()].map(([key, items]) => ({ key, items }));
    if (sortField) {
      groups.sort((a, b) => {
        let av = a.items[0][sortField] ?? '';
        let bv = b.items[0][sortField] ?? '';
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
    }

    const tbody   = document.getElementById('tbody');
    const emptyEl = document.getElementById('empty-state');
    if (!groups.length) { emptyEl.style.display = 'block'; tbody.innerHTML = ''; updateStats(); return; }
    emptyEl.style.display = 'none';

    const rows = [];
    groups.forEach(({ key, items }) => {
      const rep       = items[0];
      const cs        = getCatStyle(rep.category);
      const isExp     = expandedGroups.has(key);
      const multi     = items.length > 1;
      const safeKey   = encodeURIComponent(key).replace(/'/g, '%27');
      const prices    = items.map(i => Number(i.onlinePrice) || 0).filter(v => v > 0);
      const minP      = prices.length ? Math.min(...prices) : 0;
      const maxP      = prices.length ? Math.max(...prices) : 0;

      rows.push(`
        <tr class="group-row ${rep.direct==='OFF'?'row-off':''} ${isExp?'group-expanded':''}"
            onclick="AppInventory.toggleGroup('${safeKey}')"
            title="Click to ${isExp?'collapse':'expand'} tiers">
          <td onclick="event.stopPropagation()">
            <label class="sw-wrap" title="${rep.direct==='ON'?'Turn off':'Turn on'}">
              <input type="checkbox" class="sw-input" ${rep.direct==='ON'?'checked':''}
                onchange="AppInventory.toggleStatus(${rep.id}, this)">
              <span class="sw-track"><span class="sw-thumb"></span></span>
            </label>
          </td>
          <td><span class="cat-chip" style="background:${cs.bg};color:${cs.fg}">${rep.category||'—'}</span></td>
          <td colspan="7">
            <div class="group-name-wrap">
              <span class="expand-chevron ${isExp?'open':''}"><i class="ti ti-chevron-right" aria-hidden="true"></i></span>
              <div>
                <div class="prod-name">${rep.productOdoo}</div>
                <div class="prod-thai">${rep.productTH||''}</div>
              </div>
              <span class="tier-badge ${multi?'':'tier-single'}">${items.length} tier${items.length>1?'s':''}</span>
            </div>
          </td>
          <td class="num" style="white-space:nowrap">
            ${multi && prices.length > 1
              ? `<span class="price-range">${fmtPrice(minP)} – ${fmtPrice(maxP)}</span>`
              : fmtPrice(rep.onlinePrice)}
          </td>
          <td class="num">${fmtPrice(rep.onlineTotal)}</td>
          <td onclick="event.stopPropagation()">
            <div class="action-btns">
              <button class="act-btn" onclick="AppInventory.openAddTier('${safeKey}')" title="Add tier"><i class="ti ti-plus" aria-hidden="true"></i></button>
              <button class="act-btn del" onclick="AppInventory.deleteGroup('${safeKey}')" title="Delete product"><i class="ti ti-trash" aria-hidden="true"></i></button>
            </div>
          </td>
        </tr>`);

      if (isExp) {
        rows.push(`
          <tr class="tier-header-row">
            <td class="tier-col-lbl">On/Off</td>
            <td class="tier-col-lbl">#</td>
            <td class="tier-col-lbl">UOM</td>
            <td class="tier-col-lbl">Size</td>
            <td class="tier-col-lbl">Variety</td>
            <td class="tier-col-lbl">Origin</td>
            <td class="tier-col-lbl num">Qty</td>
            <td class="tier-col-lbl">Unit</td>
            <td class="tier-col-lbl num">Retail ฿</td>
            <td class="tier-col-lbl num">Online ฿</td>
            <td class="tier-col-lbl num">Total ฿</td>
            <td class="tier-col-lbl">Actions</td>
          </tr>`);

        items.forEach((p, idx) => {
          const last = idx === items.length - 1;
          rows.push(editingId === p.id ? buildEditRow(p, last) : buildReadRow(p, idx, last));
        });
      }
    });

    tbody.innerHTML = rows.join('');
    updateStats();
    if (editingId) requestAnimationFrame(() => { const el = document.getElementById('ie-secondUom'); if (el) el.focus(); });
  }

  function buildReadRow(p, idx, last) {
    return `
      <tr class="tier-row ${p.direct==='OFF'?'row-off':''} ${last?'tier-last':''}">
        <td>
          <label class="sw-wrap" title="${p.direct==='ON'?'Turn off':'Turn on'}">
            <input type="checkbox" class="sw-input" ${p.direct==='ON'?'checked':''}
              onchange="AppInventory.toggleStatus(${p.id}, this)">
            <span class="sw-track"><span class="sw-thumb"></span></span>
          </label>
        </td>
        <td><span class="tier-num">${idx+1}</span></td>
        <td style="font-size:12px;color:var(--soft)">${p.secondUom||'—'}</td>
        <td style="font-size:12px">${p.size||'—'}</td>
        <td style="font-size:12px;color:var(--soft)">${p.variety||'—'}</td>
        <td style="white-space:nowrap;font-size:12px">${getFlag(p.origins)} ${p.origins||'—'}</td>
        <td class="num" style="font-weight:700;font-size:14px">${p.qty}</td>
        <td style="font-size:12px">${p.unit||'—'}</td>
        <td class="num">${fmtPrice(p.retailPrice)}</td>
        <td class="num">${fmtPrice(p.onlinePrice)}</td>
        <td class="num">${fmtPrice(p.onlineTotal)}</td>
        <td>
          <div class="action-btns">
            <button class="act-btn" onclick="AppInventory.startInlineEdit(${p.id})" title="Edit"><i class="ti ti-edit" aria-hidden="true"></i></button>
            <button class="act-btn del" onclick="AppInventory.deleteTier(${p.id})" title="Delete"><i class="ti ti-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>`;
  }

  function buildEditRow(p, last) {
    const v = f => (p[f] !== undefined && p[f] !== '') ? p[f] : '';
    return `
      <tr class="tier-row tier-editing ${last?'tier-last':''}">
        <td>
          <label class="sw-wrap">
            <input type="checkbox" class="sw-input" id="ie-direct-chk" ${p.direct==='ON'?'checked':''}>
            <span class="sw-track"><span class="sw-thumb"></span></span>
          </label>
        </td>
        <td><span class="tier-num edit-active">✎</span></td>
        <td><input class="ie-in" id="ie-secondUom" value="${v('secondUom')}" placeholder="UOM"/></td>
        <td><input class="ie-in" id="ie-size" value="${v('size')}" placeholder="Size" style="width:52px"/></td>
        <td><input class="ie-in" id="ie-variety" value="${v('variety')}" placeholder="Variety"/></td>
        <td><input class="ie-in" id="ie-origins" value="${v('origins')}" placeholder="Origin"/></td>
        <td><input class="ie-in ie-num" id="ie-qty" type="number" value="${v('qty')}" style="width:52px"/></td>
        <td><input class="ie-in" id="ie-unit" value="${v('unit')}" style="width:52px"/></td>
        <td><input class="ie-in ie-num" id="ie-retailPrice" type="number" step="0.01" value="${v('retailPrice')}"/></td>
        <td><input class="ie-in ie-num" id="ie-onlinePrice" type="number" step="0.01" value="${v('onlinePrice')}"/></td>
        <td><input class="ie-in ie-num" id="ie-onlineTotal" type="number" step="0.01" value="${v('onlineTotal')}"/></td>
        <td>
          <div class="action-btns">
            <button class="act-btn save-btn" onclick="AppInventory.saveInlineEdit(${p.id})" title="Save"><i class="ti ti-check" aria-hidden="true"></i></button>
            <button class="act-btn" onclick="AppInventory.cancelInlineEdit()" title="Cancel"><i class="ti ti-x" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>`;
  }

  // ── Expand / Collapse ─────────────────────────────────────────────
  function toggleGroup(safeKey) {
    const key = decodeURIComponent(safeKey);
    if (expandedGroups.has(key)) { expandedGroups.delete(key); editingId = null; }
    else expandedGroups.add(key);
    renderTable();
  }

  // ── Inline edit ───────────────────────────────────────────────────
  function startInlineEdit(id) { editingId = id; renderTable(); }
  function cancelInlineEdit()  { editingId = null; renderTable(); }

  async function saveInlineEdit(id) {
    const g   = elId => { const el = document.getElementById(elId); return el ? el.value.trim() : ''; };
    const num = elId => { const v = g(elId); return v === '' ? '' : parseFloat(v); };
    showLoading(true);
    try {
      await DB.Products.update(id, {
        direct:      document.getElementById('ie-direct-chk')?.checked ? 'ON' : 'OFF',
        secondUom:   g('ie-secondUom'),
        size:        g('ie-size'),
        variety:     g('ie-variety'),
        origins:     g('ie-origins'),
        qty:         parseInt(g('ie-qty')) || 0,
        unit:        g('ie-unit'),
        retailPrice: num('ie-retailPrice'),
        onlinePrice: num('ie-onlinePrice'),
        onlineTotal: num('ie-onlineTotal'),
      });
      editingId = null;
      await refreshCache();
      renderTable();
      showToast('Tier saved');
    } catch (e) { showToast('Save failed: ' + e.message); }
    finally { showLoading(false); }
  }

  // ── Toggle status ─────────────────────────────────────────────────
  async function toggleStatus(id, chkEl) {
    const newStatus = chkEl.checked ? 'ON' : 'OFF';
    // Optimistic UI — update cache immediately
    _products = _products.map(p => p.id === id ? { ...p, direct: newStatus } : p);
    renderTable();
    updateStats();
    try {
      await DB.Products.update(id, { direct: newStatus });
      if (DB.mode === 'local') { await refreshCache(); }
      // Supabase realtime will trigger refreshCache via subscription
    } catch (e) {
      // Revert on failure
      _products = _products.map(p => p.id === id ? { ...p, direct: newStatus === 'ON' ? 'OFF' : 'ON' } : p);
      renderTable();
      showToast('Update failed: ' + e.message);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────
  async function deleteTier(id) {
    const p        = _products.find(x => x.id === id);
    if (!p) return;
    const siblings = _products.filter(x => groupKey(x) === groupKey(p));
    const msg      = siblings.length === 1 ? 'Only tier — delete the product?' : 'Delete this pricing tier?';
    if (!confirm(msg)) return;
    if (siblings.length === 1) expandedGroups.delete(groupKey(p));
    showLoading(true);
    try {
      await DB.Products.delete(id);
      await refreshCache();
      renderTable(); renderCatSidebar(); showToast('Tier removed');
    } catch (e) { showToast('Delete failed: ' + e.message); }
    finally { showLoading(false); }
  }

  async function deleteGroup(safeKey) {
    const key   = decodeURIComponent(safeKey);
    const items = _products.filter(p => groupKey(p) === key);
    if (!confirm(`Delete "${key}" and all ${items.length} tier${items.length > 1 ? 's' : ''}?`)) return;
    showLoading(true);
    try {
      for (const p of items) await DB.Products.delete(p.id);
      expandedGroups.delete(key);
      await refreshCache();
      renderTable(); renderCatSidebar(); showToast('Product deleted');
    } catch (e) { showToast('Delete failed: ' + e.message); }
    finally { showLoading(false); }
  }

  // ── Add tier / product ────────────────────────────────────────────
  function openAddTier(safeKey) {
    const key = decodeURIComponent(safeKey);
    const rep = _products.find(p => groupKey(p) === key);
    if (!rep) return;
    editingId = null;
    document.getElementById('prod-modal-title').textContent = 'Add pricing tier';
    const fields = ['direct','category','productOdoo','productTH','secondUom','cost','size','variety','brand','origins','qty','unit','retailPrice','onlinePrice','onlineTotal'];
    fields.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (!el) return;
      el.value = ['qty','retailPrice','onlinePrice','onlineTotal'].includes(f) ? '' : (rep[f] ?? '');
    });
    document.getElementById('prod-modal').classList.add('open');
  }

  function openAddProduct() {
    editingId = null;
    document.getElementById('prod-modal-title').textContent = 'Add product';
    ['direct','category','productOdoo','productTH','secondUom','cost','size','variety','brand','origins','qty','unit','retailPrice','onlinePrice','onlineTotal']
      .forEach(f => { const el = document.getElementById('f-' + f); if (el) el.value = f === 'direct' ? 'ON' : ''; });
    document.getElementById('prod-modal').classList.add('open');
  }

  function openEdit(id) {
    const p = _products.find(x => x.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById('prod-modal-title').textContent = 'Edit product';
    Object.keys(p).forEach(k => { const el = document.getElementById('f-' + k); if (el) el.value = p[k] ?? ''; });
    document.getElementById('prod-modal').classList.add('open');
  }

  async function saveProduct() {
    const productOdoo = document.getElementById('f-productOdoo').value.trim();
    if (!productOdoo) { showToast('Product name is required'); return; }
    const g   = id => document.getElementById('f-' + id)?.value.trim() ?? '';
    const num = id => { const v = g(id); return v === '' ? '' : parseFloat(v); };
    const row = {
      direct: g('direct'), category: g('category'), productOdoo, productTH: g('productTH'),
      secondUom: g('secondUom'), cost: num('cost'), size: g('size'), variety: g('variety'),
      brand: g('brand'), origins: g('origins'), qty: parseInt(g('qty')) || 0, unit: g('unit'),
      retailPrice: num('retailPrice'), onlinePrice: num('onlinePrice'), onlineTotal: num('onlineTotal'),
    };
    showLoading(true);
    try {
      if (editingId) { await DB.Products.update(editingId, row); showToast('Product updated'); }
      else           { await DB.Products.add(row); expandedGroups.add(productOdoo); showToast('Product added'); }
      editingId = null;
      closeModal('prod-modal');
      await refreshCache();
      renderTable(); renderCatSidebar();
    } catch (e) { showToast('Save failed: ' + e.message); }
    finally { showLoading(false); }
  }

  // ── Filter / Sort ─────────────────────────────────────────────────
  function setCat(cat) {
    currentCat = cat;
    const ci = _cats.find(c => c.name === cat);
    document.getElementById('content-title').textContent = cat ? (ci ? ci.icon + ' ' : '') + cat : 'All Products';
    document.getElementById('content-sub').textContent   = cat
      ? _products.filter(p => p.category === cat).length + ' products in this category'
      : 'Showing all categories';
    renderCatSidebar();
    renderTable();
  }

  function setStatus(s) {
    currentStatus = s;
    ['sf-all','sf-on','sf-off'].forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(s === '' ? 'sf-all' : s === 'ON' ? 'sf-on' : 'sf-off').classList.add('active');
    renderTable();
  }

  function sortBy(field) {
    if (sortField === field) sortDir *= -1; else { sortField = field; sortDir = 1; }
    document.querySelectorAll('thead th').forEach(t => t.classList.remove('sorted'));
    const th = document.getElementById('th-' + field);
    if (th) th.classList.add('sorted');
    renderTable();
  }

  // ── Category Manager ──────────────────────────────────────────────
  function openCatManager() {
    editingCatId = null;
    renderCatManagerGrid();
    renderIconPicker(null);
    document.getElementById('cat-modal').classList.add('open');
    document.getElementById('cat-edit-panel').style.display = 'none';
    document.getElementById('cat-add-panel').style.display  = 'block';
    document.getElementById('cat-modal-title').textContent  = 'Manage categories';
    document.getElementById('cat-save-btn').textContent     = 'Add category';
  }

  function renderCatManagerGrid() {
    const grid = document.getElementById('cat-manage-grid');
    grid.innerHTML = _cats.map(c => {
      const count = _products.filter(p => p.category === c.name).length;
      const icon  = FruitIcons.get(c.name, c.fg, 28);
      return `<div class="cmi" style="background:${c.bg};color:${c.fg}" title="${c.name}">
        <div class="cmi-actions">
          <button class="cmi-act" onclick="AppInventory.startEditCat(${c.id})" style="color:${c.fg}" aria-label="Edit ${c.name}"><i class="ti ti-edit" aria-hidden="true"></i></button>
          <button class="cmi-act" onclick="AppInventory.deleteCat(${c.id})" style="color:${c.fg}" aria-label="Delete ${c.name}"><i class="ti ti-trash" aria-hidden="true"></i></button>
        </div>
        <div class="cmi-icon">${icon}</div>
        <span class="cmi-name">${c.name}</span>
        ${count > 0 ? `<span class="cmi-count">${count}</span>` : ''}
      </div>`;
    }).join('');
  }

  function renderIconPicker(sel) {
    const wrap = document.getElementById('icon-picker');
    if (!wrap) return;
    wrap.innerHTML = FruitIcons.all().map(n =>
      `<button class="icon-pick-btn ${n === sel ? 'selected' : ''}"
        onclick="AppInventory.selectIcon('${n}')" title="${n}" data-name="${n}">
        ${FruitIcons.get(n, 'currentColor', 22)}
      </button>`
    ).join('');
  }

  function selectIcon(name) {
    document.querySelectorAll('.icon-pick-btn').forEach(b => b.classList.toggle('selected', b.dataset.name === name));
    document.getElementById('selected-icon-name').value = name;
  }

  function startEditCat(id) {
    const c = _cats.find(x => x.id === id);
    if (!c) return;
    editingCatId = id;
    document.getElementById('cat-modal-title').textContent  = 'Edit category';
    document.getElementById('cat-add-panel').style.display  = 'none';
    document.getElementById('cat-edit-panel').style.display = 'block';
    document.getElementById('cat-cancel-btn').style.display = 'inline-flex';
    document.getElementById('edit-cat-name').value          = c.name;
    const sel = document.getElementById('edit-cat-color');
    const mv  = `${c.bg},${c.fg}`;
    sel.value  = Array.from(sel.options).find(o => o.value === mv) ? mv : sel.options[0].value;
    renderIconPicker(c.iconName || c.name);
    document.getElementById('selected-icon-name').value    = c.iconName || c.name;
    document.getElementById('cat-save-btn').textContent    = 'Save changes';
  }

  function cancelEditCat() {
    editingCatId = null;
    document.getElementById('cat-edit-panel').style.display = 'none';
    document.getElementById('cat-add-panel').style.display  = 'block';
    document.getElementById('cat-cancel-btn').style.display = 'none';
    document.getElementById('cat-modal-title').textContent  = 'Manage categories';
    document.getElementById('cat-save-btn').textContent     = 'Add category';
    renderIconPicker(null);
  }

  async function saveCategory() {
    const iconName = document.getElementById('selected-icon-name').value;
    showLoading(true);
    try {
      if (editingCatId) {
        const name     = document.getElementById('edit-cat-name').value.trim();
        if (!name) { showToast('Category name is required'); return; }
        const [bg, fg] = document.getElementById('edit-cat-color').value.split(',');
        const oldCat   = _cats.find(c => c.id === editingCatId);
        const updated  = _cats.map(c => c.id === editingCatId ? { ...c, name, bg, fg, iconName: iconName || name } : c);
        await DB.Categories.save(updated);
        if (oldCat && oldCat.name !== name) {
          const updatedProds = _products.map(p => p.category === oldCat.name ? { ...p, category: name } : p);
          await DB.Products.save(updatedProds);
        }
        showToast('Category updated');
      } else {
        const name     = document.getElementById('new-cat-name').value.trim();
        if (!name) { showToast('Please enter a category name'); return; }
        const [bg, fg] = document.getElementById('new-cat-color').value.split(',');
        await DB.Categories.add({ name, bg, fg, iconName: iconName || name });
        document.getElementById('new-cat-name').value = '';
        showToast('Category added');
      }
      editingCatId = null;
      await refreshCache();
      renderCatManagerGrid(); renderCatSidebar(); updateCategorySelect();
      document.getElementById('cat-edit-panel').style.display = 'none';
      document.getElementById('cat-add-panel').style.display  = 'block';
      document.getElementById('cat-cancel-btn').style.display = 'none';
      document.getElementById('cat-modal-title').textContent  = 'Manage categories';
      document.getElementById('cat-save-btn').textContent     = 'Add category';
    } catch (e) { showToast('Save failed: ' + e.message); }
    finally { showLoading(false); }
  }

  async function deleteCat(id) {
    const c     = _cats.find(x => x.id === id);
    if (!c) return;
    const count = _products.filter(p => p.category === c.name).length;
    if (!confirm(count > 0 ? `Remove "${c.name}"? ${count} product${count>1?'s':''} will be uncategorised.` : `Remove "${c.name}"?`)) return;
    showLoading(true);
    try {
      await DB.Categories.delete(id);
      const updatedProds = _products.map(p => p.category === c.name ? { ...p, category: '' } : p);
      await DB.Products.save(updatedProds);
      await refreshCache();
      renderCatManagerGrid(); renderCatSidebar(); renderTable(); showToast('Category removed');
    } catch (e) { showToast('Delete failed: ' + e.message); }
    finally { showLoading(false); }
  }

  function addCategory() { saveCategory(); }

  // ── Modal / UI helpers ────────────────────────────────────────────
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }
  function handleOverlayClick(e, id) { if (e.target === document.getElementById(id)) closeModal(id); }

  function showLoading(on) {
    const el = document.getElementById('loading-bar');
    if (el) el.style.display = on ? 'block' : 'none';
  }

  // ── Init ──────────────────────────────────────────────────────────
  async function init() {
    setModeBadge();
    showLoading(true);
    try {
      await refreshCache();

      // Seed defaults if DB is empty (first run)
      if (_products.length === 0) {
        for (const p of _defaultProducts()) await DB.Products.add(p);
        await refreshCache();
      }
      if (_cats.length === 0) {
        for (const c of _defaultCategories()) await DB.Categories.add(c);
        await refreshCache();
      }
    } catch (e) {
      showToast('Could not connect to database: ' + e.message);
    } finally {
      showLoading(false);
    }

    document.getElementById('search').addEventListener('input', renderTable);
    renderCatSidebar();
    renderTable();
    updateStats();
    startRealtime();
  }

  return {
    init,
    setCat, setStatus, sortBy,
    toggleGroup, startInlineEdit, saveInlineEdit, cancelInlineEdit,
    toggleStatus, deleteTier, deleteGroup,
    openAddProduct, openAddTier, openEdit, saveProduct,
    openCatManager, renderCatManagerGrid,
    startEditCat, cancelEditCat, saveCategory, selectIcon, deleteCat, addCategory,
    closeModal, handleOverlayClick,
  };
})();

// ── Globals ───────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}
function openAddProduct()          { AppInventory.openAddProduct(); }
function saveProduct()             { AppInventory.saveProduct(); }
function openCatManager()          { AppInventory.openCatManager(); }
function addCategory()             { AppInventory.addCategory(); }
function saveCategory()            { AppInventory.saveCategory(); }
function cancelEditCat()           { AppInventory.cancelEditCat(); }
function closeModal(id)            { AppInventory.closeModal(id); }
function handleOverlayClick(e, id) { AppInventory.handleOverlayClick(e, id); }
function setStatus(s)              { AppInventory.setStatus(s); }
function sortBy(f)                 { AppInventory.sortBy(f); }
