/**
 * CityFresh — Mini Database (localStorage)
 * All data is stored in the browser's localStorage under namespaced keys.
 * Structure:
 *   cf_users       → { [email]: { name, email, passwordHash, createdAt } }
 *   cf_products    → [ ...product objects ]
 *   cf_categories  → [ ...category objects ]
 *   cf_session     → { email, name, loggedInAt, remember }
 */

const DB = (() => {

  const KEYS = {
    USERS:      'cf_users',
    PRODUCTS:   'cf_products',
    CATEGORIES: 'cf_categories',
    SESSION:    'cf_session',
  };

  // ── Tiny hash (not cryptographic — demo only) ──────────────────────
  function hashPassword(pw) {
    let h = 0;
    for (let i = 0; i < pw.length; i++) {
      h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
    }
    return h.toString(16);
  }

  // ── Low-level read/write ───────────────────────────────────────────
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  // ══════════════════════════════
  // USERS
  // ══════════════════════════════
  const Users = {
    all() { return read(KEYS.USERS, {}); },

    get(email) { return this.all()[email.toLowerCase()] || null; },

    register(name, email, password) {
      const users = this.all();
      const key   = email.toLowerCase();
      if (users[key]) return { ok: false, error: 'Email already registered.' };
      users[key] = {
        name,
        email: key,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
        role: 'user',
      };
      write(KEYS.USERS, users);
      return { ok: true };
    },

    verify(email, password) {
      const user = this.get(email);
      if (!user) return { ok: false, error: 'No account found. Please create one.' };
      if (user.passwordHash !== hashPassword(password))
        return { ok: false, error: 'Incorrect password.' };
      return { ok: true, user };
    },

    // Seed a demo account on first load
    seedDemo() {
      if (!this.get('demo@cityfresh.com')) {
        this.register('Demo User', 'demo@cityfresh.com', 'cityfresh2025');
      }
    },
  };

  // ══════════════════════════════
  // SESSION
  // ══════════════════════════════
  const Session = {
    get()  { return read(KEYS.SESSION, null); },
    set(user, remember) {
      write(KEYS.SESSION, {
        email:      user.email,
        name:       user.name,
        loggedInAt: new Date().toISOString(),
        remember,
      });
    },
    clear() { localStorage.removeItem(KEYS.SESSION); },
    isActive() {
      const s = this.get();
      if (!s) return false;
      if (!s.remember) return true; // session only — always valid while tab open
      const age = Date.now() - new Date(s.loggedInAt).getTime();
      return age < 30 * 24 * 60 * 60 * 1000; // 30 days if remembered
    },
  };

  // ══════════════════════════════
  // PRODUCTS
  // ══════════════════════════════
  const Products = {
    all()     { return read(KEYS.PRODUCTS, getDefaultProducts()); },
    save(arr) { write(KEYS.PRODUCTS, arr); },

    add(product) {
      const list = this.all();
      product.id = Date.now();
      product.createdAt = new Date().toISOString();
      list.push(product);
      this.save(list);
      return product;
    },

    update(id, updates) {
      const list = this.all().map(p =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      this.save(list);
    },

    delete(id) {
      this.save(this.all().filter(p => p.id !== id));
    },

    toggleStatus(id) {
      const list = this.all().map(p =>
        p.id === id ? { ...p, direct: p.direct === 'ON' ? 'OFF' : 'ON' } : p
      );
      this.save(list);
    },
  };

  // ══════════════════════════════
  // CATEGORIES
  // ══════════════════════════════
  const Categories = {
    all()     { return read(KEYS.CATEGORIES, getDefaultCategories()); },
    save(arr) { write(KEYS.CATEGORIES, arr); },

    add(cat) {
      const list = this.all();
      list.push({ ...cat, id: Date.now() });
      this.save(list);
    },

    delete(id) {
      this.save(this.all().filter(c => c.id !== id));
    },
  };

  // ══════════════════════════════
  // DEFAULT SEED DATA
  // ══════════════════════════════
  function getDefaultCategories() {
    return [
      { id:1, name:'Apple',        bg:'#8BAC4A', fg:'#1A1A1A' },
      { id:2, name:'Blueberry',    bg:'#7B5EA7', fg:'#fff' },
      { id:3, name:'Raspberry',    bg:'#D4537E', fg:'#fff' },
      { id:4, name:'Strawberry',   bg:'#C84040', fg:'#fff' },
      { id:5, name:'Lychee',       bg:'#F4C0D1', fg:'#72243E' },
      { id:6, name:'Durian',       bg:'#C8A832', fg:'#1A1A1A' },
      { id:7, name:'Dragon Fruit', bg:'#D4537E', fg:'#fff' },
      { id:8, name:'Mango',        bg:'#E68755', fg:'#fff' },
      { id:9, name:'Pear',         bg:'#8BAC4A', fg:'#1A1A1A' },
      { id:10,name:'Avocado',      bg:'#4A6B1A', fg:'#fff' },
      { id:11,name:'Kiwi',         bg:'#6B8C2A', fg:'#fff' },
      { id:12,name:'Persimmon',    bg:'#E68755', fg:'#fff' },
      { id:13,name:'Peach',        bg:'#F4A58A', fg:'#7A2A1A' },
      { id:14,name:'Plum',         bg:'#7B5EA7', fg:'#fff' },
      { id:15,name:'Orange',       bg:'#E68755', fg:'#fff' },
      { id:16,name:'Nectarine',    bg:'#D4537E', fg:'#fff' },
      { id:17,name:'Sweet Potato', bg:'#C8A832', fg:'#1A1A1A' },
      { id:18,name:'Melon',        bg:'#8BAC4A', fg:'#1A1A1A' },
      { id:19,name:'Grape',        bg:'#7B5EA7', fg:'#fff' },
      { id:20,name:'Cherry',       bg:'#C84040', fg:'#fff' },
    ];
  }

  function getDefaultProducts() {
    return [
      { id:1001, direct:'ON', category:'Apple', productOdoo:'Apple Envy 18 kg. USA (80, ENZA, HG)', productTH:'แอปเปิ้ล Envy USA Size 80', secondUom:'Box 80', cost:'', size:'80', variety:'ENVY', brand:'ENZA', origins:'USA', qty:10, unit:'Piece', retailPrice:'', onlinePrice:70, onlineTotal:700 },
      { id:1002, direct:'ON', category:'Apple', productOdoo:'Apple Envy 18 kg. USA (80, ENZA, HG)', productTH:'แอปเปิ้ล Envy USA Size 80', secondUom:'Box 80', cost:'', size:'80', variety:'ENVY', brand:'ENZA', origins:'USA', qty:40, unit:'Piece', retailPrice:'', onlinePrice:65, onlineTotal:2600 },
      { id:1003, direct:'ON', category:'Apple', productOdoo:'Apple Envy 18 kg. USA (80, ENZA, HG)', productTH:'แอปเปิ้ล Envy USA Size 80', secondUom:'Box 80', cost:1980, size:'80', variety:'ENVY', brand:'ENZA', origins:'USA', qty:80, unit:'Piece', retailPrice:'', onlinePrice:60, onlineTotal:4800 },
      { id:1004, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 11x10pcs. NZL (140/10, ROCKIT, HG)', productTH:'แอปเปิ้ล Rockit Pack10', secondUom:'11x10pcs.', cost:'', size:'f140/10', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:1, unit:'Pack', retailPrice:490, onlinePrice:490, onlineTotal:490 },
      { id:1005, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 11x10pcs. NZL (140/10, ROCKIT, HG)', productTH:'แอปเปิ้ล Rockit Pack10', secondUom:'11x10pcs.', cost:'', size:'f140/10', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:5, unit:'Pack', retailPrice:'', onlinePrice:450, onlineTotal:2250 },
      { id:1006, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 11x10pcs. NZL (140/10, ROCKIT, HG)', productTH:'แอปเปิ้ล Rockit Pack10', secondUom:'11x10pcs.', cost:1574.35, size:'f140/10', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:11, unit:'Pack', retailPrice:'', onlinePrice:400, onlineTotal:4400 },
      { id:1007, direct:'ON', category:'Apple', productOdoo:'Apple Pink Lady 18 kg. USA (125, PINK LADY, 3A)', productTH:'แอปเปิ้ล Pink Lady Size 125', secondUom:'Box125', cost:'', size:'125', variety:'PINK LADY', brand:'PINK LADY', origins:'USA', qty:1, unit:'Piece', retailPrice:25, onlinePrice:'', onlineTotal:0 },
      { id:1008, direct:'ON', category:'Apple', productOdoo:'Apple Pink Lady 18 kg. USA (125, PINK LADY, 3A)', productTH:'แอปเปิ้ล Pink Lady Size 125', secondUom:'Box125', cost:'', size:'125', variety:'PINK LADY', brand:'PINK LADY', origins:'USA', qty:10, unit:'Piece', retailPrice:'', onlinePrice:25, onlineTotal:250 },
      { id:1009, direct:'ON', category:'Apple', productOdoo:'Apple Pink Lady 18 kg. USA (125, PINK LADY, 3A)', productTH:'แอปเปิ้ล Pink Lady Size 125', secondUom:'Box125', cost:974.85, size:'125', variety:'PINK LADY', brand:'PINK LADY', origins:'USA', qty:125, unit:'Piece', retailPrice:'', onlinePrice:20, onlineTotal:2500 },
      { id:1010, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 15x5pcs. NZL (67/5, ROCKIT, HG)', productTH:'แอปเปิ้ล rockit 15*5', secondUom:'15x5pcs.', cost:'', size:'13.4', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:1, unit:'Pack', retailPrice:270, onlinePrice:'', onlineTotal:0 },
      { id:1011, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 15x5pcs. NZL (67/5, ROCKIT, HG)', productTH:'แอปเปิ้ล rockit 15*5', secondUom:'15x5pcs.', cost:'', size:'13.4', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:5, unit:'Pack', retailPrice:'', onlinePrice:270, onlineTotal:1350 },
      { id:1012, direct:'ON', category:'Apple', productOdoo:'Apple Rockit 15x5pcs. NZL (67/5, ROCKIT, HG)', productTH:'แอปเปิ้ล rockit 15*5', secondUom:'15x5pcs.', cost:1276.396, size:'13.4', variety:'ROCKIT', brand:'ROCKIT', origins:'New Zealand', qty:15, unit:'Pack', retailPrice:'', onlinePrice:250, onlineTotal:3750 },
      { id:1013, direct:'ON', category:'Apple', productOdoo:'Apple Posy 17.3 kg. NZL (120, POSY, PG)', productTH:'แอปเปิ้ล posy #120', secondUom:'17.3 Kg', cost:'', size:'120', variety:'POSY', brand:'POSY', origins:'New Zealand', qty:1, unit:'Piece', retailPrice:50, onlinePrice:'', onlineTotal:0 },
      { id:1014, direct:'ON', category:'Apple', productOdoo:'Apple Posy 17.3 kg. NZL (120, POSY, PG)', productTH:'แอปเปิ้ล posy #120', secondUom:'17.3 Kg', cost:1714, size:'120', variety:'POSY', brand:'POSY', origins:'New Zealand', qty:120, unit:'Piece', retailPrice:'', onlinePrice:40, onlineTotal:4800 },
      { id:1015, direct:'ON', category:'Apple', productOdoo:'Apple Granny Smith 18 kg. FRA (125, TASTY GRANNY, G-1)', productTH:'แอปเปิ้ลเขียว #125', secondUom:'Box125', cost:945.636364, size:'125', variety:'Granny Smith', brand:'TASTY GRANNY', origins:'FRA', qty:125, unit:'Piece', retailPrice:'', onlinePrice:20, onlineTotal:2500 },
      { id:1016, direct:'ON', category:'Apple', productOdoo:'Apple Envy 10 kg. NZL (24, ENZA, SG)', productTH:'แอปเปิ้ล Envy Size 24', secondUom:'BOX 24.', cost:'', size:'24', variety:'ENVY', brand:'ENZA', origins:'NewZealand', qty:1, unit:'Piece', retailPrice:190, onlinePrice:0, onlineTotal:0 },
      { id:1017, direct:'ON', category:'Apple', productOdoo:'Apple Envy 10 kg. NZL (24, ENZA, SG)', productTH:'แอปเปิ้ล Envy Size 24', secondUom:'BOX 24.', cost:1655.71956, size:'24', variety:'ENVY', brand:'ENZA', origins:'NewZealand', qty:24, unit:'Piece', retailPrice:'', onlinePrice:170, onlineTotal:4080 },
      { id:1018, direct:'ON', category:'Apple', productOdoo:'Apple Posy Gift Box 6', productTH:'แอปเปิ้ล Posy Gift Box', secondUom:'', cost:'', size:'', variety:'', brand:'', origins:'', qty:1, unit:'box', retailPrice:590, onlinePrice:590, onlineTotal:590 },
      { id:1019, direct:'ON', category:'Mango', productOdoo:'Mango Nam Dok Mai THA (Premium)', productTH:'มะม่วงน้ำดอกไม้ พรีเมียม', secondUom:'Box 10kg', cost:350, size:'L', variety:'Nam Dok Mai', brand:'CityFresh', origins:'THA', qty:10, unit:'Piece', retailPrice:120, onlinePrice:110, onlineTotal:1100 },
      { id:1020, direct:'ON', category:'Blueberry', productOdoo:'Blueberry Premium USA 125g', productTH:'บลูเบอร์รี่ พรีเมียม USA', secondUom:'Punnet 125g', cost:85, size:'', variety:'Premium', brand:'', origins:'USA', qty:1, unit:'Punnet', retailPrice:120, onlinePrice:115, onlineTotal:115 },
      { id:1021, direct:'OFF', category:'Strawberry', productOdoo:'Strawberry Korea Premium 250g', productTH:'สตรอเบอร์รี่เกาหลี พรีเมียม', secondUom:'Box 250g', cost:95, size:'', variety:'Maehyang', brand:'', origins:'South Korea', qty:1, unit:'Box', retailPrice:160, onlinePrice:150, onlineTotal:150 },
      { id:1022, direct:'ON', category:'Grape', productOdoo:'Grape Shine Muscat JPN', productTH:'องุ่น Shine Muscat ญี่ปุ่น', secondUom:'Bunch ~500g', cost:280, size:'', variety:'Shine Muscat', brand:'', origins:'Japan', qty:1, unit:'Bunch', retailPrice:450, onlinePrice:420, onlineTotal:420 },
      { id:1023, direct:'ON', category:'Cherry', productOdoo:'Cherry USA Jumbo 500g', productTH:'เชอร์รี่ USA Jumbo', secondUom:'Box 500g', cost:220, size:'Jumbo', variety:'Bing', brand:'', origins:'USA', qty:1, unit:'Box', retailPrice:360, onlinePrice:340, onlineTotal:340 },
    ];
  }

  return { Users, Session, Products, Categories };
})();
