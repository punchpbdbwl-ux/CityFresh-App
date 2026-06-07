/**
 * CityFresh — Inventory App Module
 * Grouped product view: products with the same name are shown as one
 * collapsible parent row. Click the row to expand quantity tiers.
 * All tier rows are inline-editable.
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
  // Set of expanded group keys
  const expandedGroups = new Set();

  // ── Helpers ────────────────────────────────────────────────────────
  function getFlag(origin) {
    if (!origin) return '';
    for (const k of Object.keys(originFlags)) {
      if (origin.toLowerCase().includes(k.toLowerCase())) return originFlags[k];
    }
    return '';
  }

  function formatPrice(v) {
    if (v === '' || v === null || v === undefined || Number(v) === 0)
      return '<span class="price-nil">—</span>';
    return '<span class="price-val">฿' + Number(v).toLocaleString('th-TH', { maximumFractionDigits: 2 }) + '</span>';
  }

  function getCatStyle(name) {
    return DB.Categories.all().find(c => c.name === name) || { bg: '#D3D1C7', fg: '#444441' };
  }

  // Build a stable group key from a product
  function groupKey(p) {
    return (p.productOdoo || '').trim();
  }

  // ── Stats ──────────────────────────────────────────────────────────
  function updateStats() {
    const products = DB.Products.all();
    document.getElementById('s-total').textContent  = products.length;
    document.getElementById('s-active').textContent = products.filter(p => p.direct === 'ON').length;
    document.getElementById('s-cats').textContent   = [...new Set(products.map(p => p.category).filter(Boolean))].length;
  }

  // ── Category Sidebar ───────────────────────────────────────────────
  function renderCatSidebar() {
    const grid     = document.getElementById('cat-grid');
    const cats     = DB.Categories.all();
    const products = DB.Products.all();

    const allBtn = `<button class="cat-btn-all ${currentCat === '' ? 'active' : ''}" onclick="AppInventory.setCat('')">
      <i class="ti ti-layout-list" style="font-size:14px" aria-hidden="true"></i> All products
    </button>`;

    const catBtns = cats.map(c => {
      const count = products.filter(p => p.category === c.name).length;
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
    sel.innerHTML = DB.Categories.all().map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  // ── Grouped Table Render ───────────────────────────────────────────
  function renderTable() {
    const q = (document.getElementById('search').value || '').toLowerCase();

    let products = DB.Products.all().filter(p => {
      if (currentCat && p.category !== currentCat) return false;
      if (currentStatus && p.direct !== currentStatus) return false;
      if (q) {
        const hay = [p.productOdoo, p.productTH, p.category, p.variety, p.brand, p.origins]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // Group by productOdoo name
    const groupMap = new Map();
    products.forEach(p => {
      const key = groupKey(p);
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push(p);
    });

    // Convert to array of groups; sort if needed
    let groups = [...groupMap.entries()].map(([key, items]) => ({ key, items }));

    if (sortField) {
      groups.sort((a, b) => {
        // Sort by the first item's field
        let av = a.items[0][sortField], bv = b.items[0][sortField];
        if (av === '' || av == null) av = '';
        if (bv === '' || bv == null) bv = '';
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
    }

    const tbody   = document.getElementById('tbody');
    const emptyEl = document.getElementById('empty-state');

    if (!groups.length) {
      emptyEl.style.display = 'block';
      tbody.innerHTML = '';
      updateStats();
      return;
    }
    emptyEl.style.display = 'none';

    const rows = [];
    groups.forEach(({ key, items }) => {
      const rep  = items[0]; // representative for group header
      const cs   = getCatStyle(rep.category);
      const isExpanded = expandedGroups.has(key);
      const multiTier  = items.length > 1;
      const safeKey    = encodeURIComponent(key).replace(/'/g, '%27');

      // ── Parent row ──
      rows.push(`
        <tr class="group-row ${rep.direct === 'OFF' ? 'row-off' : ''} ${isExpanded ? 'group-expanded' : ''}"
            onclick="AppInventory.toggleGroup('${safeKey}')"
            title="Click to ${isExpanded ? 'collapse' : 'expand'} tiers">
          <td>
            <span class="status-pill ${rep.direct === 'ON' ? 'pill-on' : 'pill-off'}">${rep.direct === 'ON' ? 'Active' : 'Off'}</span>
          </td>
          <td>
            <span class="cat-chip" style="background:${cs.bg};color:${cs.fg}">${rep.category || '—'}</span>
          </td>
          <td colspan="7" style="max-width:0">
            <div class="group-name-wrap">
              <span class="expand-chevron ${isExpanded ? 'open' : ''}">
                <i class="ti ti-chevron-right" aria-hidden="true"></i>
              </span>
              <div>
                <div class="prod-name">${rep.productOdoo}</div>
                <div class="prod-thai">${rep.productTH || ''}</div>
              </div>
              ${multiTier
                ? `<span class="tier-badge">${items.length} tiers</span>`
                : `<span class="tier-badge tier-single">1 tier</span>`}
            </div>
          </td>
          <td class="num group-price-summary">
            ${multiTier
              ? `<span class="price-range">${formatPrice(Math.min(...items.map(i => Number(i.onlinePrice)||Infinity)))} – ${formatPrice(Math.max(...items.map(i => Number(i.onlinePrice)||0)))}</span>`
              : formatPrice(rep.onlinePrice)}
          </td>
          <td class="num">${formatPrice(rep.onlineTotal)}</td>
          <td>
            <div class="action-btns" onclick="event.stopPropagation()">
              <button class="act-btn" onclick="AppInventory.openAddTier('${safeKey}')" title="Add tier">
                <i class="ti ti-plus" aria-hidden="true"></i>
              </button>
              <button class="act-btn del" onclick="AppInventory.deleteGroup('${safeKey}')" title="Delete all tiers">
                <i class="ti ti-trash" aria-hidden="true"></i>
              </button>
            </div>
          </td>
        </tr>`);

      // ── Tier rows (only when expanded) ──
      if (isExpanded) {
        // Column header for tiers
        rows.push(`
          <tr class="tier-header-row">
            <td colspan="2"></td>
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
          const isEditing = (editingId === p.id);
          if (isEditing) {
            rows.push(buildEditTierRow(p, idx === items.length - 1));
          } else {
            rows.push(buildReadTierRow(p, idx, items.length));
          }
        });
      }
    });

    tbody.innerHTML = rows.join('');
    updateStats();
  }

  // ── Read-only tier row ─────────────────────────────────────────────
  function buildReadTierRow(p, idx, total) {
    const isLast = idx === total - 1;
    return `
      <tr class="tier-row ${p.direct === 'OFF' ? 'row-off' : ''} ${isLast ? 'tier-last' : ''}">
        <td>
          <span class="tier-num">#${idx + 1}</span>
        </td>
        <td>
          <button class="tier-status-btn ${p.direct === 'ON' ? 'ts-on' : 'ts-off'}"
            onclick="AppInventory.toggleStatus(${p.id})" title="Toggle status">
            ${p.direct === 'ON' ? 'Active' : 'Off'}
          </button>
        </td>
        <td style="font-size:12px;color:var(--soft)">${p.secondUom || '—'}</td>
        <td style="font-size:12px">${p.size || '—'}</td>
        <td style="font-size:12px;color:var(--soft)">${p.variety || '—'}</td>
        <td style="white-space:nowrap;font-size:12px">${getFlag(p.origins)} ${p.origins || '—'}</td>
        <td class="num" style="font-weight:600;font-size:14px">${p.qty}</td>
        <td style="font-size:12px">${p.unit || '—'}</td>
        <td class="num">${formatPrice(p.retailPrice)}</td>
        <td class="num">${formatPrice(p.onlinePrice)}</td>
        <td class="num">${formatPrice(p.onlineTotal)}</td>
        <td>
          <div class="action-btns">
            <button class="act-btn" onclick="AppInventory.startInlineEdit(${p.id})" title="Edit tier">
              <i class="ti ti-edit" aria-hidden="true"></i>
            </button>
            <button class="act-btn del" onclick="AppInventory.deleteTier(${p.id})" title="Delete tier">
              <i class="ti ti-trash" aria-hidden="true"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }

  // ── Inline-edit tier row ───────────────────────────────────────────
  function buildEditTierRow(p) {
    const v = f => p[f] !== undefined && p[f] !== '' ? p[f] : '';
    return `
      <tr class="tier-row tier-editing">
        <td><span class="tier-num edit-active">✎</span></td>
        <td>
          <select class="ie-sel" id="ie-direct" style="width:72px">
            <option value="ON" ${p.direct==='ON'?'selected':''}>Active</option>
            <option value="OFF" ${p.direct==='OFF'?'selected':''}>Off</option>
          </select>
        </td>
        <td><input class="ie-in" id="ie-secondUom" value="${v('secondUom')}" placeholder="UOM" /></td>
        <td><input class="ie-in" id="ie-size" value="${v('size')}" placeholder="Size" style="width:52px"/></td>
        <td><input class="ie-in" id="ie-variety" value="${v('variety')}" placeholder="Variety" /></td>
        <td><input class="ie-in" id="ie-origins" value="${v('origins')}" placeholder="Origin" /></td>
        <td><input class="ie-in ie-num" id="ie-qty" type="number" value="${v('qty')}" placeholder="Qty" style="width:52px"/></td>
        <td><input class="ie-in" id="ie-unit" value="${v('unit')}" placeholder="Unit" style="width:52px"/></td>
        <td><input class="ie-in ie-num" id="ie-retailPrice" type="number" step="0.01" value="${v('retailPrice')}" placeholder="Retail" /></td>
        <td><input class="ie-in ie-num" id="ie-onlinePrice" type="number" step="0.01" value="${v('onlinePrice')}" placeholder="Online" /></td>
        <td><input class="ie-in ie-num" id="ie-onlineTotal" type="number" step="0.01" value="${v('onlineTotal')}" placeholder="Total" /></td>
        <td>
          <div class="action-btns">
            <button class="act-btn save-btn" onclick="AppInventory.saveInlineEdit(${p.id})" title="Save">
              <i class="ti ti-check" aria-hidden="true"></i>
            </button>
            <button class="act-btn" onclick="AppInventory.cancelInlineEdit()" title="Cancel">
              <i class="ti ti-x" aria-hidden="true"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }

  // ── Expand / Collapse ──────────────────────────────────────────────
  function toggleGroup(safeKey) {
    const key = decodeURIComponent(safeKey);
    if (expandedGroups.has(key)) {
      expandedGroups.delete(key);
      editingId = null;
    } else {
      expandedGroups.add(key);
    }
    renderTable();
  }

  // ── Inline edit ────────────────────────────────────────────────────
  function startInlineEdit(id) {
    editingId = id;
    renderTable();
    // Focus first field
    requestAnimationFrame(() => {
      const el = document.getElementById('ie-secondUom');
      if (el) el.focus();
    });
  }

  function saveInlineEdit(id) {
    const g = elId => {
      const el = document.getElementById(elId);
      return el ? el.value.trim() : '';
    };
    const num = elId => {
      const v = g(elId);
      return v === '' ? '' : parseFloat(v);
    };

    DB.Products.update(id, {
      direct:      g('ie-direct'),
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
    renderTable();
    showToast('Tier saved');
  }

  function cancelInlineEdit() {
    editingId = null;
    renderTable();
  }

  // ── Delete tier / group ────────────────────────────────────────────
  function deleteTier(id) {
    // Find which group this belongs to
    const p = DB.Products.all().find(x => x.id === id);
    if (!p) return;
    const siblings = DB.Products.all().filter(x => groupKey(x) === groupKey(p));
    if (siblings.length === 1) {
      if (!confirm('This is the only tier. Delete the entire product?')) return;
      expandedGroups.delete(groupKey(p));
    } else {
      if (!confirm('Delete this pricing tier?')) return;
    }
    DB.Products.delete(id);
    renderTable();
    renderCatSidebar();
    showToast('Tier removed');
  }

  function deleteGroup(safeKey) {
    const key  = decodeURIComponent(safeKey);
    const items = DB.Products.all().filter(p => groupKey(p) === key);
    if (!confirm(`Delete "${key}" and all ${items.length} tier${items.length > 1 ? 's' : ''}?`)) return;
    items.forEach(p => DB.Products.delete(p.id));
    expandedGroups.delete(key);
    renderTable();
    renderCatSidebar();
    showToast('Product deleted');
  }

  // ── Add Tier ────────────────────────────────────────────────────────
  function openAddTier(safeKey) {
    const key = decodeURIComponent(safeKey);
    const rep = DB.Products.all().find(p => groupKey(p) === key);
    if (!rep) return;
    // Pre-fill modal with group's shared fields
    editingId = null;
    document.getElementById('prod-modal-title').textContent = 'Add pricing tier';
    const fields = ['direct','category','productOdoo','productTH','secondUom','cost','size','variety','brand','origins','qty','unit','retailPrice','onlinePrice','onlineTotal'];
    fields.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (!el) return;
      if (['qty','retailPrice','onlinePrice','onlineTotal'].includes(f)) {
        el.value = '';
      } else {
        el.value = rep[f] ?? '';
      }
    });
    document.getElementById('prod-modal').classList.add('open');
  }

  // ── Add / Edit product (modal) ─────────────────────────────────────
  function openAddProduct() {
    editingId = null;
    document.getElementById('prod-modal-title').textContent = 'Add product';
    ['direct','category','productOdoo','productTH','secondUom','cost','size',
     'variety','brand','origins','qty','unit','retailPrice','onlinePrice','onlineTotal']
      .forEach(f => {
        const el = document.getElementById('f-' + f);
        if (el) el.value = f === 'direct' ? 'ON' : '';
      });
    document.getElementById('prod-modal').classList.add('open');
  }

  function openEdit(id) {
    const p = DB.Products.all().find(x => x.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById('prod-modal-title').textContent = 'Edit product';
    Object.keys(p).forEach(k => {
      const el = document.getElementById('f-' + k);
      if (el) el.value = p[k] ?? '';
    });
    document.getElementById('prod-modal').classList.add('open');
  }

  function saveProduct() {
    const productOdoo = document.getElementById('f-productOdoo').value.trim();
    if (!productOdoo) { showToast('Product name is required'); return; }

    const g   = id => document.getElementById('f-' + id).value.trim();
    const num = id => { const v = g(id); return v === '' ? '' : parseFloat(v); };

    const row = {
      direct: g('direct'), category: g('category'),
      productOdoo, productTH: g('productTH'),
      secondUom: g('secondUom'), cost: num('cost'),
      size: g('size'), variety: g('variety'),
      brand: g('brand'), origins: g('origins'),
      qty: parseInt(g('qty')) || 0, unit: g('unit'),
      retailPrice: num('retailPrice'), onlinePrice: num('onlinePrice'),
      onlineTotal: num('onlineTotal'),
    };

    if (editingId) {
      DB.Products.update(editingId, row);
      showToast('Product updated');
    } else {
      DB.Products.add(row);
      // Auto-expand the group for the new product
      expandedGroups.add(productOdoo);
      showToast('Product added');
    }

    editingId = null;
    closeModal('prod-modal');
    renderTable();
    renderCatSidebar();
  }

  // ── Filtering & Sorting ────────────────────────────────────────────
  function setCat(cat) {
    currentCat = cat;
    const titleEl = document.getElementById('content-title');
    const subEl   = document.getElementById('content-sub');
    if (!cat) {
      titleEl.textContent = 'All Products';
      subEl.textContent   = 'Showing all categories';
    } else {
      const ci = DB.Categories.all().find(c => c.name === cat);
      titleEl.textContent = (ci ? ci.icon + ' ' : '') + cat;
      subEl.textContent   = DB.Products.all().filter(p => p.category === cat).length + ' products in this category';
    }
    renderCatSidebar();
    renderTable();
  }

  function setStatus(s) {
    currentStatus = s;
    ['sf-all','sf-on','sf-off'].forEach(id =>
      document.getElementById(id).classList.remove('active')
    );
    document.getElementById(s === '' ? 'sf-all' : s === 'ON' ? 'sf-on' : 'sf-off').classList.add('active');
    renderTable();
  }

  function sortBy(field) {
    if (sortField === field) sortDir *= -1;
    else { sortField = field; sortDir = 1; }
    document.querySelectorAll('thead th').forEach(t => t.classList.remove('sorted'));
    const th = document.getElementById('th-' + field);
    if (th) th.classList.add('sorted');
    renderTable();
  }

  function toggleStatus(id) {
    DB.Products.toggleStatus(id);
    renderTable();
    renderCatSidebar();
    showToast('Status updated');
  }

  function deleteProduct(id) {
    if (!confirm('Remove this product?')) return;
    DB.Products.delete(id);
    renderTable();
    renderCatSidebar();
    showToast('Product removed');
  }

  // ── Category Manager ───────────────────────────────────────────────
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
    const grid     = document.getElementById('cat-manage-grid');
    const cats     = DB.Categories.all();
    const products = DB.Products.all();
    grid.innerHTML = cats.map(c => {
      const count = products.filter(p => p.category === c.name).length;
      const icon  = FruitIcons.get(c.name, c.fg, 28);
      return `<div class="cmi" style="background:${c.bg};color:${c.fg}" title="${c.name}">
        <div class="cmi-actions">
          <button class="cmi-act cmi-edit" onclick="AppInventory.startEditCat(${c.id})" title="Edit" style="color:${c.fg}" aria-label="Edit ${c.name}">
            <i class="ti ti-edit" aria-hidden="true"></i>
          </button>
          <button class="cmi-act cmi-del" onclick="AppInventory.deleteCat(${c.id})" title="Delete" style="color:${c.fg}" aria-label="Delete ${c.name}">
            <i class="ti ti-trash" aria-hidden="true"></i>
          </button>
        </div>
        <div class="cmi-icon">${icon}</div>
        <span class="cmi-name">${c.name}</span>
        ${count > 0 ? `<span class="cmi-count">${count}</span>` : ''}
      </div>`;
    }).join('');
  }

  function renderIconPicker(selectedName) {
    const wrap = document.getElementById('icon-picker');
    if (!wrap) return;
    wrap.innerHTML = FruitIcons.all().map(n => {
      return `<button class="icon-pick-btn ${n === selectedName ? 'selected' : ''}"
        onclick="AppInventory.selectIcon('${n}')"
        title="${n}" aria-label="${n} icon"
        data-name="${n}">
        ${FruitIcons.get(n, 'currentColor', 22)}
      </button>`;
    }).join('');
  }

  function selectIcon(name) {
    document.querySelectorAll('.icon-pick-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.name === name);
    });
    document.getElementById('selected-icon-name').value = name;
  }

  function startEditCat(id) {
    const c = DB.Categories.all().find(x => x.id === id);
    if (!c) return;
    editingCatId = id;
    document.getElementById('cat-modal-title').textContent       = 'Edit category';
    document.getElementById('cat-add-panel').style.display       = 'none';
    document.getElementById('cat-edit-panel').style.display      = 'block';
    document.getElementById('cat-cancel-btn').style.display      = 'inline-flex';
    document.getElementById('edit-cat-name').value               = c.name;
    const colorSel = document.getElementById('edit-cat-color');
    const matchVal = `${c.bg},${c.fg}`;
    const found    = Array.from(colorSel.options).find(o => o.value === matchVal);
    colorSel.value = found ? matchVal : colorSel.options[0].value;
    renderIconPicker(c.iconName || c.name);
    document.getElementById('selected-icon-name').value          = c.iconName || c.name;
    document.getElementById('cat-save-btn').textContent          = 'Save changes';
  }

  function cancelEditCat() {
    editingCatId = null;
    document.getElementById('cat-edit-panel').style.display      = 'none';
    document.getElementById('cat-add-panel').style.display       = 'block';
    document.getElementById('cat-cancel-btn').style.display      = 'none';
    document.getElementById('cat-modal-title').textContent       = 'Manage categories';
    document.getElementById('cat-save-btn').textContent          = 'Add category';
    renderIconPicker(null);
  }

  function saveCategory() {
    if (editingCatId) {
      const name     = document.getElementById('edit-cat-name').value.trim();
      if (!name) { showToast('Category name is required'); return; }
      const [bg, fg] = document.getElementById('edit-cat-color').value.split(',');
      const iconName = document.getElementById('selected-icon-name').value || name;
      const oldCat   = DB.Categories.all().find(c => c.id === editingCatId);
      DB.Categories.save(DB.Categories.all().map(c =>
        c.id === editingCatId ? { ...c, name, bg, fg, iconName } : c
      ));
      if (oldCat && oldCat.name !== name) {
        DB.Products.save(DB.Products.all().map(p =>
          p.category === oldCat.name ? { ...p, category: name } : p
        ));
      }
      showToast('Category updated');
    } else {
      const name     = document.getElementById('new-cat-name').value.trim();
      if (!name) { showToast('Please enter a category name'); return; }
      const [bg, fg] = document.getElementById('new-cat-color').value.split(',');
      const iconName = document.getElementById('selected-icon-name').value || name;
      DB.Categories.add({ name, bg, fg, iconName });
      document.getElementById('new-cat-name').value = '';
      showToast('Category added');
    }
    editingCatId = null;
    renderCatManagerGrid();
    renderCatSidebar();
    updateCategorySelect();
    document.getElementById('cat-edit-panel').style.display = 'none';
    document.getElementById('cat-add-panel').style.display  = 'block';
    document.getElementById('cat-cancel-btn').style.display = 'none';
    document.getElementById('cat-modal-title').textContent  = 'Manage categories';
    document.getElementById('cat-save-btn').textContent     = 'Add category';
  }

  function deleteCat(id) {
    const c     = DB.Categories.all().find(x => x.id === id);
    if (!c) return;
    const count = DB.Products.all().filter(p => p.category === c.name).length;
    const msg   = count > 0
      ? `Remove "${c.name}"? ${count} product${count > 1 ? 's' : ''} will become uncategorised.`
      : `Remove "${c.name}"?`;
    if (!confirm(msg)) return;
    DB.Categories.delete(id);
    DB.Products.save(DB.Products.all().map(p =>
      p.category === c.name ? { ...p, category: '' } : p
    ));
    renderCatManagerGrid();
    renderCatSidebar();
    renderTable();
    showToast('Category removed');
  }

  function addCategory() { saveCategory(); }

  // ── Modal helpers ──────────────────────────────────────────────────
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }
  function handleOverlayClick(e, modalId) {
    if (e.target === document.getElementById(modalId)) closeModal(modalId);
  }

  // ── Init ───────────────────────────────────────────────────────────
  function init() {
    document.getElementById('search').addEventListener('input', renderTable);
    renderCatSidebar();
    renderTable();
    updateStats();
  }

  return {
    init,
    setCat, setStatus, sortBy,
    toggleGroup, startInlineEdit, saveInlineEdit, cancelInlineEdit,
    toggleStatus, deleteProduct, deleteTier, deleteGroup,
    openAddProduct, openAddTier, openEdit, saveProduct,
    openCatManager, renderCatManagerGrid,
    startEditCat, cancelEditCat, saveCategory,
    selectIcon, deleteCat, addCategory,
    closeModal, handleOverlayClick,
  };
})();

// ── Global toast ──────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// Globals for HTML onclick attributes
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
