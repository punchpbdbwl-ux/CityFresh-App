/**
 * CityFresh — Database Layer
 *
 * Supports two modes selected by CONFIG in config.js:
 *
 *  Mode A  →  localStorage   (offline, single-device, default)
 *  Mode B  →  Supabase       (real-time, multi-device, via URL)
 *
 * The rest of the app (app.js, import.js) calls DB.Products / DB.Categories
 * and never knows which backend is in use.
 */

/* ─────────────────────────────────────────────────────────────────
   DEFAULT SEED DATA  (used on first run in both modes)
───────────────────────────────────────────────────────────────── */
function _defaultCategories() {
  return [
    { id:1,  name:'Apple',        bg:'#8BAC4A', fg:'#fff' },
    { id:2,  name:'Blueberry',    bg:'#7B5EA7', fg:'#fff' },
    { id:3,  name:'Raspberry',    bg:'#D4537E', fg:'#fff' },
    { id:4,  name:'Strawberry',   bg:'#C84040', fg:'#fff' },
    { id:5,  name:'Lychee',       bg:'#D4537E', fg:'#fff' },
    { id:6,  name:'Durian',       bg:'#C8A832', fg:'#1A1A1A' },
    { id:7,  name:'Dragon Fruit', bg:'#C84040', fg:'#fff' },
    { id:8,  name:'Mango',        bg:'#E68755', fg:'#fff' },
    { id:9,  name:'Pear',         bg:'#6B8C2A', fg:'#fff' },
    { id:10, name:'Avocado',      bg:'#4A6B1A', fg:'#fff' },
    { id:11, name:'Kiwi',         bg:'#6B8C2A', fg:'#fff' },
    { id:12, name:'Persimmon',    bg:'#E68755', fg:'#fff' },
    { id:13, name:'Peach',        bg:'#E68755', fg:'#fff' },
    { id:14, name:'Plum',         bg:'#7B5EA7', fg:'#fff' },
    { id:15, name:'Orange',       bg:'#E68755', fg:'#fff' },
    { id:16, name:'Nectarine',    bg:'#D4537E', fg:'#fff' },
    { id:17, name:'Sweet Potato', bg:'#C8A832', fg:'#1A1A1A' },
    { id:18, name:'Melon',        bg:'#8BAC4A', fg:'#fff' },
    { id:19, name:'Grape',        bg:'#7B5EA7', fg:'#fff' },
    { id:20, name:'Cherry',       bg:'#C84040', fg:'#fff' },
  ];
}

function _defaultProducts() {
  return [
    { id:1001, direct:'ON', category:'Apple', productOdoo:'Apple Envy 18 kg. USA (80, ENZA, HG)', productTH:'แอปเปิ้ล Envy USA Size 80', secondUom:'Box 80', cost:'', size:'80', variety:'ENVY', brand:'ENZA', origins:'USA', qty:1, unit:'Piece', retailPrice:70, onlinePrice:0, onlineTotal:0 },
    { id:1002, direct:'ON', category:'Apple', productOdoo:'Apple Envy 18 kg. USA (80, ENZA, HG)', productTH:'แอปเปิ้ล Envy USA Size 80', secondUom:'Box 80', cost:'', size:'80', variety:'ENVY', brand:'ENZA', origins:'USA', qty:10, unit:'Piece', retailPrice:'', onlinePrice:70, onlineTotal:700 },
    { id:1003, direct:'ON', category:'Apple', productOdoo:'Apple Envy 18 kg. USA (80, ENZA, HG)', productTH:'แอปเปิ้ล Envy USA Size 80', secondUom:'Box 80', cost:1980, size:'80', variety:'ENVY', brand:'ENZA', origins:'USA', qty:80, unit:'Piece', retailPrice:'', onlinePrice:60, onlineTotal:4800 },
    { id:1004, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 11x10pcs. NZL (140/10, ROCKIT, HG)', productTH:'แอปเปิ้ล Rockit Pack10', secondUom:'11x10pcs.', cost:'', size:'f140/10', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:1, unit:'Pack', retailPrice:490, onlinePrice:490, onlineTotal:490 },
    { id:1005, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 11x10pcs. NZL (140/10, ROCKIT, HG)', productTH:'แอปเปิ้ล Rockit Pack10', secondUom:'11x10pcs.', cost:1574.35, size:'f140/10', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:11, unit:'Pack', retailPrice:'', onlinePrice:400, onlineTotal:4400 },
    { id:1006, direct:'ON', category:'Apple', productOdoo:'Apple Pink Lady 18 kg. USA (125, PINK LADY, 3A)', productTH:'แอปเปิ้ล Pink Lady Size 125', secondUom:'Box125', cost:'', size:'125', variety:'PINK LADY', brand:'PINK LADY', origins:'USA', qty:1, unit:'Piece', retailPrice:25, onlinePrice:'', onlineTotal:0 },
    { id:1007, direct:'ON', category:'Apple', productOdoo:'Apple Pink Lady 18 kg. USA (125, PINK LADY, 3A)', productTH:'แอปเปิ้ล Pink Lady Size 125', secondUom:'Box125', cost:974.85, size:'125', variety:'PINK LADY', brand:'PINK LADY', origins:'USA', qty:125, unit:'Piece', retailPrice:'', onlinePrice:20, onlineTotal:2500 },
    { id:1008, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 15x5pcs. NZL (67/5, ROCKIT, HG)', productTH:'แอปเปิ้ล rockit 15*5', secondUom:'15x5pcs.', cost:'', size:'13.4', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:1, unit:'Pack', retailPrice:270, onlinePrice:'', onlineTotal:0 },
    { id:1009, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 15x5pcs. NZL (67/5, ROCKIT, HG)', productTH:'แอปเปิ้ล rockit 15*5', secondUom:'15x5pcs.', cost:'', size:'13.4', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:5, unit:'Pack', retailPrice:'', onlinePrice:270, onlineTotal:1350 },
    { id:1010, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 15x5pcs. NZL (67/5, ROCKIT, HG)', productTH:'แอปเปิ้ล rockit 15*5', secondUom:'15x5pcs.', cost:1276.4, size:'13.4', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:15, unit:'Pack', retailPrice:'', onlinePrice:250, onlineTotal:3750 },
    { id:1011, direct:'ON', category:'Apple', productOdoo:'Apple Posy 17.3 kg. NZL (120, POSY, PG)', productTH:'แอปเปิ้ล posy #120', secondUom:'17.3 Kg', cost:1714, size:'120', variety:'POSY', brand:'POSY', origins:'New Zealand', qty:120, unit:'Piece', retailPrice:'', onlinePrice:40, onlineTotal:4800 },
    { id:1012, direct:'ON', category:'Apple', productOdoo:'Apple Granny Smith 18 kg. FRA (125, TASTY GRANNY, G-1)', productTH:'แอปเปิ้ลเขียว #125', secondUom:'Box125', cost:945.64, size:'125', variety:'Granny Smith', brand:'TASTY GRANNY', origins:'FRA', qty:125, unit:'Piece', retailPrice:'', onlinePrice:20, onlineTotal:2500 },
    { id:1013, direct:'ON', category:'Apple', productOdoo:'Apple Envy 10 kg. NZL (24, ENZA, SG)', productTH:'แอปเปิ้ล Envy Size 24', secondUom:'BOX 24.', cost:1655.72, size:'24', variety:'ENVY', brand:'ENZA', origins:'NewZealand', qty:24, unit:'Piece', retailPrice:'', onlinePrice:170, onlineTotal:4080 },
    { id:1014, direct:'ON', category:'Mango', productOdoo:'Mango Nam Dok Mai THA (Premium)', productTH:'มะม่วงน้ำดอกไม้ พรีเมียม', secondUom:'Box 10kg', cost:350, size:'L', variety:'Nam Dok Mai', brand:'CityFresh', origins:'THA', qty:10, unit:'Piece', retailPrice:120, onlinePrice:110, onlineTotal:1100 },
    { id:1015, direct:'ON', category:'Blueberry', productOdoo:'Blueberry Premium USA 125g', productTH:'บลูเบอร์รี่ พรีเมียม USA', secondUom:'Punnet 125g', cost:85, size:'', variety:'Premium', brand:'', origins:'USA', qty:1, unit:'Punnet', retailPrice:120, onlinePrice:115, onlineTotal:115 },
    { id:1016, direct:'OFF', category:'Strawberry', productOdoo:'Strawberry Korea Premium 250g', productTH:'สตรอเบอร์รี่เกาหลี พรีเมียม', secondUom:'Box 250g', cost:95, size:'', variety:'Maehyang', brand:'', origins:'South Korea', qty:1, unit:'Box', retailPrice:160, onlinePrice:150, onlineTotal:150 },
    { id:1017, direct:'ON', category:'Grape', productOdoo:'Grape Shine Muscat JPN', productTH:'องุ่น Shine Muscat ญี่ปุ่น', secondUom:'Bunch ~500g', cost:280, size:'', variety:'Shine Muscat', brand:'', origins:'Japan', qty:1, unit:'Bunch', retailPrice:450, onlinePrice:420, onlineTotal:420 },
    { id:1018, direct:'ON', category:'Cherry', productOdoo:'Cherry USA Jumbo 500g', productTH:'เชอร์รี่ USA Jumbo', secondUom:'Box 500g', cost:220, size:'Jumbo', variety:'Bing', brand:'', origins:'USA', qty:1, unit:'Box', retailPrice:360, onlinePrice:340, onlineTotal:340 },
  ];
}

/* ─────────────────────────────────────────────────────────────────
   MODE A  —  localStorage backend
───────────────────────────────────────────────────────────────── */
const LocalDB = (() => {
  const K = { PRODUCTS:'cf_products', CATEGORIES:'cf_categories' };
  const read  = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
  const write = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const Products = {
    all()     { return read(K.PRODUCTS, _defaultProducts()); },
    save(arr) { write(K.PRODUCTS, arr); },
    add(p)    { const list = this.all(); p.id = Date.now(); p.createdAt = new Date().toISOString(); list.push(p); this.save(list); return p; },
    update(id, u) { this.save(this.all().map(p => p.id === id ? { ...p, ...u, updatedAt: new Date().toISOString() } : p)); },
    delete(id)    { this.save(this.all().filter(p => p.id !== id)); },
    toggleStatus(id) { this.save(this.all().map(p => p.id === id ? { ...p, direct: p.direct === 'ON' ? 'OFF' : 'ON' } : p)); },
  };

  const Categories = {
    all()     { return read(K.CATEGORIES, _defaultCategories()); },
    save(arr) { write(K.CATEGORIES, arr); },
    add(c)    { const list = this.all(); c.id = Date.now(); list.push(c); this.save(list); },
    delete(id){ this.save(this.all().filter(c => c.id !== id)); },
  };

  return { Products, Categories, mode: 'local' };
})();

/* ─────────────────────────────────────────────────────────────────
   MODE B  —  Supabase backend  (real-time)
───────────────────────────────────────────────────────────────── */
const SupabaseDB = (() => {
  let _url = '', _key = '', _client = null;

  // Lightweight fetch wrapper (no SDK needed)
  async function req(method, table, body = null, query = '') {
    const res = await fetch(`${_url}/rest/v1/${table}${query}`, {
      method,
      headers: {
        'apikey':        _key,
        'Authorization': `Bearer ${_key}`,
        'Content-Type':  'application/json',
        'Prefer':        method === 'POST' ? 'return=representation' : 'return=minimal',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase ${method} ${table}: ${err}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  const Products = {
    async all()     { return await req('GET',    'cf_products', null, '?order=id'); },
    async save(arr) { /* bulk replace — delete all then insert */
      await req('DELETE', 'cf_products', null, '?id=gte.0');
      if (arr.length) await req('POST', 'cf_products', arr);
    },
    async add(p) {
      p.created_at = new Date().toISOString();
      const res = await req('POST', 'cf_products', [p]);
      return res[0];
    },
    async update(id, u) {
      u.updated_at = new Date().toISOString();
      await req('PATCH', 'cf_products', u, `?id=eq.${id}`);
    },
    async delete(id)    { await req('DELETE', 'cf_products', null, `?id=eq.${id}`); },
    async toggleStatus(id) {
      const all  = await this.all();
      const p    = all.find(x => x.id === id);
      if (!p) return;
      await this.update(id, { direct: p.direct === 'ON' ? 'OFF' : 'ON' });
    },
  };

  const Categories = {
    async all()     { return await req('GET',    'cf_categories', null, '?order=id'); },
    async save(arr) {
      await req('DELETE', 'cf_categories', null, '?id=gte.0');
      if (arr.length) await req('POST', 'cf_categories', arr);
    },
    async add(c)    { c.created_at = new Date().toISOString(); const r = await req('POST', 'cf_categories', [c]); return r[0]; },
    async delete(id){ await req('DELETE', 'cf_categories', null, `?id=eq.${id}`); },
  };

  // Real-time listener — calls cb() whenever products or categories change
  function subscribeRealtime(cb) {
    const wsUrl = _url.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws    = new WebSocket(`${wsUrl}/realtime/v1/websocket?apikey=${_key}&vsn=1.0.0`);
    ws.onopen = () => {
      ws.send(JSON.stringify({ topic: 'realtime:*', event: 'phx_join', payload: {}, ref: '1' }));
    };
    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === 'postgres_changes') cb();
      } catch {}
    };
    ws.onerror = () => console.warn('[CityFresh] Realtime WS error — changes will still save, live sync paused');
    ws.onclose = () => setTimeout(() => subscribeRealtime(cb), 3000); // auto-reconnect
    return ws;
  }

  function init(url, key) { _url = url; _key = key; }

  return { Products, Categories, subscribeRealtime, init, mode: 'supabase' };
})();

/* ─────────────────────────────────────────────────────────────────
   DB  —  auto-selects backend from CONFIG (config.js)
───────────────────────────────────────────────────────────────── */
let DB;

(function selectBackend() {
  const cfg = (typeof CONFIG !== 'undefined') ? CONFIG : {};

  if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
      cfg.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    SupabaseDB.init(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    DB = SupabaseDB;
    console.info('[CityFresh] 🌐 Supabase real-time mode');
  } else {
    DB = LocalDB;
    console.info('[CityFresh] 💾 localStorage mode');
  }
})();
