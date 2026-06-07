/**
 * CityFresh — Inventory App Module
 * Handles all product table rendering, filtering, sorting, and CRUD.
 */

const AppInventory = (() => {

  const originFlags = {
    'USA': '🇺🇸', 'New Zealand': '🇳🇿', 'NewZealand': '🇳🇿', 'NZL': '🇳🇿',
    'FRA': '🇫🇷', 'THA': '🇹🇭', 'South Korea': '🇰🇷', 'Japan': '🇯🇵',
    'AUS': '🇦🇺', 'China': '🇨🇳', 'Spain': '🇪🇸', 'Italy': '🇮🇹',
    'Peru': '🇵🇪', 'South Africa': '🇿🇦', 'Chile': '🇨🇱',
  };

  let currentCat    = '';
  let currentStatus = '';
  let sortField     = '';
  let sortDir       = 1;
  let editingId     = null;

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
    const cats = DB.Categories.all();
    return cats.find(c => c.name === name) || { bg: '#D3D1C7', fg: '#444441' };
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
    const cats = DB.Categories.all();
    sel.innerHTML = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  // ── Table Render ───────────────────────────────────────────────────
  function renderTable() {
    let products = DB.Products.all().filter(p => {
      if (currentCat && p.category !== currentCat) return false;
      if (currentStatus && p.direct !== currentStatus) return false;
      const q = (document.getElementById('search').value || '').toLowerCase();
      if (q) {
        const haystack = [p.productOdoo, p.productTH, p.category, p.variety, p.brand, p.origins]
          .join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortField) {
      products.sort((a, b) => {
        let av = a[sortField], bv = b[sortField];
        if (av === '' || av == null) av = -Infinity;
        if (bv === '' || bv == null) bv = -Infinity;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
    }

    const tbody     = document.getElementById('tbody');
    const emptyEl   = document.getElementById('empty-state');

    if (!products.length) {
      emptyEl.style.display = 'block';
      tbody.innerHTML = '';
      updateStats();
      return;
    }
    emptyEl.style.display = 'none';

    tbody.innerHTML = products.map(p => {
      const cs = getCatStyle(p.category);
      return `<tr class="${p.direct === 'OFF' ? 'row-off' : ''}">
        <td><span class="status-pill ${p.direct === 'ON' ? 'pill-on' : 'pill-off'}">${p.direct === 'ON' ? 'Active' : 'Off'}</span></td>
        <td><span class="cat-chip" style="background:${cs.bg};color:${cs.fg}">${p.category || '—'}</span></td>
        <td style="max-width:210px">
          <div class="prod-name">${p.productOdoo}</div>
          <div class="prod-thai">${p.productTH || ''}</div>
        </td>
        <td style="font-size:12px;color:var(--soft)">${p.secondUom || '—'}</td>
        <td style="font-size:12px">${p.size || '—'}</td>
        <td style="font-size:12px;color:var(--soft)">${p.variety || '—'}</td>
        <td style="white-space:nowrap;font-size:12px">${getFlag(p.origins)} ${p.origins || '—'}</td>
        <td class="num" style="font-weight:500">${p.qty}</td>
        <td style="font-size:12px">${p.unit || '—'}</td>
        <td class="num">${formatPrice(p.retailPrice)}</td>
        <td class="num">${formatPrice(p.onlinePrice)}</td>
        <td class="num">${formatPrice(p.onlineTotal)}</td>
        <td>
          <div class="action-btns">
            <button class="act-btn" onclick="AppInventory.openEdit(${p.id})" title="Edit"><i class="ti ti-edit"></i></button>
            <button class="act-btn" onclick="AppInventory.toggleStatus(${p.id})" title="Toggle status"><i class="ti ti-refresh"></i></button>
            <button class="act-btn del" onclick="AppInventory.deleteProduct(${p.id})" title="Delete"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');

    updateStats();
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
    ['sf-all', 'sf-on', 'sf-off'].forEach(id =>
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

  // ── CRUD ───────────────────────────────────────────────────────────
  function toggleStatus(id) {
    DB.Products.toggleStatus(id);
    renderTable();
    renderCatSidebar();
    showToast('Status updated');
  }

  function deleteProduct(id) {
    if (!confirm('Remove this product from the inventory?')) return;
    DB.Products.delete(id);
    renderTable();
    renderCatSidebar();
    showToast('Product removed');
  }

  function getField(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

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
    const productOdoo = getField('f-productOdoo');
    if (!productOdoo) { showToast('Product name is required'); return; }

    const parseNum = id => {
      const v = getField(id);
      return v === '' ? '' : parseFloat(v);
    };

    const row = {
      direct:      getField('f-direct'),
      category:    getField('f-category'),
      productOdoo,
      productTH:   getField('f-productTH'),
      secondUom:   getField('f-secondUom'),
      cost:        parseNum('f-cost'),
      size:        getField('f-size'),
      variety:     getField('f-variety'),
      brand:       getField('f-brand'),
      origins:     getField('f-origins'),
      qty:         parseInt(getField('f-qty')) || 0,
      unit:        getField('f-unit'),
      retailPrice: parseNum('f-retailPrice'),
      onlinePrice: parseNum('f-onlinePrice'),
      onlineTotal: parseNum('f-onlineTotal'),
    };

    if (editingId) {
      DB.Products.update(editingId, row);
      showToast('Product updated');
    } else {
      DB.Products.add(row);
      showToast('Product added');
    }

    closeModal('prod-modal');
    renderTable();
    renderCatSidebar();
  }

  // ── Category Manager ───────────────────────────────────────────────
  let editingCatId = null;

  function openCatManager() {
    editingCatId = null;
    renderCatManagerGrid();
    renderIconPicker(null);
    document.getElementById('cat-modal').classList.add('open');
    document.getElementById('cat-edit-panel').style.display = 'none';
    document.getElementById('cat-add-panel').style.display  = 'block';
    document.getElementById('new-cat-name').value = '';
    document.getElementById('cat-modal-title').textContent  = 'Manage categories';
    document.getElementById('cat-save-btn').textContent     = 'Add category';
  }

  function renderCatManagerGrid() {
    const grid = document.getElementById('cat-manage-grid');
    const cats = DB.Categories.all();
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
    const wrap  = document.getElementById('icon-picker');
    const names = FruitIcons.all();
    wrap.innerHTML = names.map(n => {
      const isSel = n === selectedName;
      return `<button class="icon-pick-btn ${isSel ? 'selected' : ''}"
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

  function saveCategory() {
    if (editingCatId) {
      // — Save edits —
      const name = document.getElementById('edit-cat-name').value.trim();
      if (!name) { showToast('Category name is required'); return; }
      const [bg, fg]   = document.getElementById('edit-cat-color').value.split(',');
      const iconName   = document.getElementById('selected-icon-name').value || name;
      const oldCat     = DB.Categories.all().find(c => c.id === editingCatId);
      DB.Categories.save(
        DB.Categories.all().map(c =>
          c.id === editingCatId ? { ...c, name, bg, fg, iconName } : c
        )
      );
      // Rename products if name changed
      if (oldCat && oldCat.name !== name) {
        DB.Products.save(DB.Products.all().map(p =>
          p.category === oldCat.name ? { ...p, category: name } : p
        ));
      }
      showToast('Category updated');
    } else {
      // — Add new —
      const name = document.getElementById('new-cat-name').value.trim();
      if (!name) { showToast('Please enter a category name'); return; }
      const [bg, fg]  = document.getElementById('new-cat-color').value.split(',');
      const iconName  = document.getElementById('selected-icon-name').value || name;
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
    document.getElementById('cat-modal-title').textContent  = 'Manage categories';
    document.getElementById('cat-save-btn').textContent     = 'Add category';
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

  function deleteCat(id) {
    const c = DB.Categories.all().find(x => x.id === id);
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

  // Keep old addCategory for backward compat (now handled by saveCategory)
  function addCategory() { saveCategory(); }

  // ── Modal helpers ──────────────────────────────────────────────────
  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
  }

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

  // Public API
  return {
    init,
    setCat, setStatus, sortBy,
    toggleStatus, deleteProduct,
    openAddProduct, openEdit, saveProduct,
    openCatManager, renderCatManagerGrid,
    startEditCat, cancelEditCat, saveCategory,
    selectIcon, deleteCat, addCategory,
    closeModal, handleOverlayClick,
  };
})();

// ── Global toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// Expose globals that HTML onclick= attributes call
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
