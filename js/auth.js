/**
 * CityFresh — Auth Module
 * Handles sign-in, registration, session management,
 * page transitions and the loading screen animation.
 */

// ── Helpers ────────────────────────────────────────────────────────
const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function clearErrors() {
  document.querySelectorAll('.err-msg').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.success-msg').forEach(e => { e.classList.remove('show'); e.textContent = ''; });
  document.querySelectorAll('.field-wrap input').forEach(i => i.classList.remove('error'));
}

function togglePw(inputId, iconId) {
  const el = document.getElementById(inputId);
  const ic = document.getElementById(iconId);
  el.type = el.type === 'password' ? 'text' : 'password';
  ic.className = (el.type === 'password' ? 'ti ti-eye' : 'ti ti-eye-off') + ' fi';
}

function checkStrength() {
  const pw  = document.getElementById('r-pw').value;
  const bar = document.getElementById('pw-bar');
  const hint = document.getElementById('pw-hint');
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const cols  = ['#C84040','#E68755','#C8A832','#8BAC4A'];
  const labels = ['Too short','Weak','Good','Strong'];
  const pcts  = [25, 50, 75, 100];
  if (!pw.length) { bar.style.width = '0'; hint.textContent = 'Use 8+ characters with letters and numbers.'; return; }
  const i = Math.max(0, s - 1);
  bar.style.width    = pcts[i] + '%';
  bar.style.background = cols[i];
  hint.textContent   = labels[i];
}

// ── Tab switching ──────────────────────────────────────────────────
function switchTab(t) {
  document.getElementById('t-si').classList.toggle('active', t === 'si');
  document.getElementById('t-reg').classList.toggle('active', t === 'reg');
  document.getElementById('p-si').style.display  = t === 'si' ? 'block' : 'none';
  document.getElementById('p-reg').style.display = t === 'reg' ? 'block' : 'none';
  document.getElementById('p-fgt').style.display = 'none';
  document.getElementById('tabs').style.display  = 'flex';
  clearErrors();
}

function showForgot(back) {
  if (back) {
    document.getElementById('p-fgt').style.display = 'none';
    document.getElementById('p-si').style.display  = 'block';
    document.getElementById('tabs').style.display  = 'flex';
    return;
  }
  document.getElementById('p-si').style.display  = 'none';
  document.getElementById('p-fgt').style.display = 'block';
  document.getElementById('tabs').style.display  = 'none';
}

// ── Sign in ─────────────────────────────────────────────────────────
function doSignIn() {
  clearErrors();
  const email    = document.getElementById('si-email').value.trim();
  const password = document.getElementById('si-pw').value;
  const remember = document.getElementById('si-rem').checked;
  let ok = true;

  if (!isValidEmail(email)) {
    document.getElementById('si-email-err').classList.add('show');
    document.getElementById('si-email').classList.add('error');
    ok = false;
  }
  if (!password) {
    document.getElementById('si-pw-err').textContent = 'Please enter your password.';
    document.getElementById('si-pw-err').classList.add('show');
    document.getElementById('si-pw').classList.add('error');
    ok = false;
  }
  if (!ok) return;

  const result = DB.Users.verify(email, password);
  if (!result.ok) {
    document.getElementById('si-pw-err').textContent = result.error;
    document.getElementById('si-pw-err').classList.add('show');
    return;
  }

  DB.Session.set(result.user, remember);
  startLoadingScreen(result.user);
}

// ── Register ────────────────────────────────────────────────────────
function doRegister() {
  clearErrors();
  const name     = document.getElementById('r-name').value.trim();
  const email    = document.getElementById('r-email').value.trim();
  const password = document.getElementById('r-pw').value;
  const confirm  = document.getElementById('r-pw2').value;
  let ok = true;

  if (!name) {
    document.getElementById('r-name-err').classList.add('show');
    document.getElementById('r-name').classList.add('error');
    ok = false;
  }
  if (!isValidEmail(email)) {
    document.getElementById('r-email-err').classList.add('show');
    document.getElementById('r-email').classList.add('error');
    ok = false;
  }
  if (password.length < 8) {
    document.getElementById('r-match-err').textContent = 'Password must be at least 8 characters.';
    document.getElementById('r-match-err').classList.add('show');
    ok = false;
  } else if (password !== confirm) {
    document.getElementById('r-match-err').classList.add('show');
    ok = false;
  }
  if (!ok) return;

  const result = DB.Users.register(name, email, password);
  if (!result.ok) {
    document.getElementById('r-email-err').textContent = result.error;
    document.getElementById('r-email-err').classList.add('show');
    return;
  }

  const user = DB.Users.get(email);
  DB.Session.set(user, false);
  startLoadingScreen(user);
}

// ── Forgot password ─────────────────────────────────────────────────
function doForgot() {
  const email = document.getElementById('fg-email').value.trim();
  const msg   = document.getElementById('fg-ok');
  if (!isValidEmail(email)) {
    msg.style.color = 'var(--re)';
    msg.textContent = 'Please enter a valid email address.';
    msg.classList.add('show');
    return;
  }
  msg.style.color = 'var(--gd)';
  msg.textContent = 'If this email is registered, a reset link has been sent.';
  msg.classList.add('show');
}

// ── Logout ──────────────────────────────────────────────────────────
function doLogout() {
  DB.Session.clear();
  goPage('pg-app', 'pg-login');
  document.getElementById('si-email').value = '';
  document.getElementById('si-pw').value    = '';
  clearErrors();
  switchTab('si');
  showToast('Signed out successfully');
}

// ══════════════════════════════════════
// PAGE TRANSITIONS
// ══════════════════════════════════════
function goPage(fromId, toId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);

  from.classList.add('fade-out');
  setTimeout(() => {
    from.classList.remove('active', 'fade-out');
    from.style.display = 'none';

    to.style.display   = 'flex';
    to.style.opacity   = '0';
    to.classList.add('active');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => { to.style.opacity = '1'; })
    );
  }, 380);
}

// ══════════════════════════════════════
// LOADING SCREEN
// ══════════════════════════════════════
const FRUIT_DATA = [
  { icon: '🍎', bg: '#8BAC4A' }, { icon: '🍊', bg: '#E68755' },
  { icon: '🥭', bg: '#E68755' }, { icon: '🫐', bg: '#7B5EA7' },
  { icon: '🍓', bg: '#C84040' }, { icon: '🥑', bg: '#4A6B1A' },
  { icon: '🍑', bg: '#F4A58A' }, { icon: '🍇', bg: '#7B5EA7' },
  { icon: '🥝', bg: '#6B8C2A' }, { icon: '🍒', bg: '#C84040' },
];
const LOAD_MSGS = [
  'Checking credentials…',
  'Loading product catalogue…',
  'Syncing inventory data…',
  'Almost ready…',
  'Welcome to CityFresh!',
];
const BLOB_COLORS = ['#8BAC4A','#D4537E','#C8A832','#0F6E56','#E68755','#7B5EA7'];

function buildBlobs() {
  const wrap = document.getElementById('blobs');
  wrap.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const d   = document.createElement('div');
    d.className = 'blob';
    const sz  = 60 + Math.random() * 180;
    const r1  = 30 + Math.random() * 40;
    const r2  = 50 + Math.random() * 40;
    d.style.cssText = [
      `width:${sz}px`, `height:${sz}px`,
      `background:${BLOB_COLORS[i % BLOB_COLORS.length]}`,
      `left:${Math.random() * 100}%`, `top:${Math.random() * 100}%`,
      `opacity:${0.025 + Math.random() * 0.03}`,
      `border-radius:${r1}% ${r2}% ${r1}% ${r2}%`,
      `animation-delay:${Math.random() * 4}s`,
    ].join(';');
    wrap.appendChild(d);
  }
}

function startLoadingScreen(user) {
  buildBlobs();

  // Transition login → loading
  const login = document.getElementById('pg-login');
  const load  = document.getElementById('pg-load');
  login.classList.add('fade-out');
  setTimeout(() => {
    login.classList.remove('active', 'fade-out');
    login.style.display = 'none';

    load.style.display = 'flex';
    load.style.opacity = '0';
    load.classList.add('active');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => { load.style.opacity = '1'; })
    );
    runLoadAnimation(user);
  }, 380);
}

function runLoadAnimation(user) {
  // Render fruit dots
  const fruitsWrap = document.getElementById('load-fruits');
  fruitsWrap.innerHTML = '';
  FRUIT_DATA.forEach((f, i) => {
    const d = document.createElement('div');
    d.className = 'fruit-dot';
    d.style.background = f.bg;
    d.textContent = f.icon;
    fruitsWrap.appendChild(d);
    setTimeout(() => d.classList.add('pop'), 80 + i * 140);
  });

  // Progress bar
  const bar    = document.getElementById('load-bar');
  const status = document.getElementById('load-status');
  let progress = 0, msgIdx = 0;
  bar.style.width = '0';
  status.textContent = LOAD_MSGS[0];

  const TOTAL_STEPS = 80;
  const STEP_MS     = 40;

  const iv = setInterval(() => {
    progress++;
    bar.style.width = (progress / TOTAL_STEPS * 100) + '%';

    const newIdx = Math.floor((progress / TOTAL_STEPS) * (LOAD_MSGS.length - 1));
    if (newIdx !== msgIdx) {
      msgIdx = newIdx;
      status.style.opacity = '0';
      setTimeout(() => {
        status.textContent   = LOAD_MSGS[msgIdx];
        status.style.opacity = '1';
      }, 200);
    }

    if (progress >= TOTAL_STEPS) {
      clearInterval(iv);
      setTimeout(() => enterApp(user), 300);
    }
  }, STEP_MS);
}

function enterApp(user) {
  // Update header with user info
  document.getElementById('user-avatar').textContent = user.name.substring(0, 2).toUpperCase();
  document.getElementById('user-name').textContent   = user.name;
  document.getElementById('user-email').textContent  = user.email;

  // Transition loading → app
  const load = document.getElementById('pg-load');
  const app  = document.getElementById('pg-app');
  load.classList.add('fade-out');
  setTimeout(() => {
    load.classList.remove('active', 'fade-out');
    load.style.display = 'none';
    document.getElementById('load-bar').style.width = '0';

    app.style.display = 'flex';
    app.style.opacity = '0';
    app.classList.add('active');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => { app.style.opacity = '1'; })
    );

    // Boot the inventory app
    AppInventory.init();
  }, 380);
}

// ── Boot: check for existing session ───────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  DB.Users.seedDemo(); // ensure demo account exists

  const session = DB.Session.get();
  if (session && DB.Session.isActive()) {
    const user = DB.Users.get(session.email);
    if (user) {
      // Skip login, go straight to app
      document.getElementById('pg-login').classList.remove('active');
      document.getElementById('pg-login').style.display = 'none';
      startLoadingScreen(user);
      return;
    }
  }
  // Show login normally
  document.getElementById('pg-login').style.opacity = '1';
});
