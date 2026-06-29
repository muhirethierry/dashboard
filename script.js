// ── Stat definitions ──────────────────────────────────────────
const INITIAL_BARS = {
  views:    [40, 55, 35, 70, 60, 80, 90, 75, 95, 100],
  signups:  [30, 45, 60, 40, 75, 65, 80, 70, 90,  85],
  revenue:  [50, 60, 45, 80, 70, 90, 65, 85, 95, 100],
  orders:   [35, 50, 65, 45, 70, 60, 80, 75, 90,  88],
  sessions: [60, 80, 50, 70, 90, 75, 85, 65, 95,  88],
};

const INITIAL_VALUES = {
  views:    24810,
  signups:  1342,
  revenue:  58240,
  orders:   893,
  sessions: 312,
};

const stats = [
  {
    id: 'views',
    label: 'Page views',
    prefix: '', suffix: '',
    color: 'blue', icon: '📈',
    change: '+12.4%', dir: 'up',
    step:   () => Math.floor(Math.random() * 18) + 3,
    format: v => v.toLocaleString(),
  },
  {
    id: 'signups',
    label: 'Sign-ups',
    prefix: '', suffix: '',
    color: 'green', icon: '👤',
    change: '+8.1%', dir: 'up',
    step:   () => (Math.random() > 0.5 ? 1 : 0),
    format: v => v.toLocaleString(),
  },
  {
    id: 'revenue',
    label: 'Revenue',
    prefix: '$', suffix: '',
    color: 'amber', icon: '💰',
    change: '+19.3%', dir: 'up',
    step:   () => Math.floor(Math.random() * 120) + 10,
    format: v => v.toLocaleString(),
  },
  {
    id: 'orders',
    label: 'Orders',
    prefix: '', suffix: '',
    color: 'pink', icon: '📦',
    change: '+5.7%', dir: 'up',
    step:   () => (Math.random() > 0.4 ? 1 : 0),
    format: v => v.toLocaleString(),
  },
  {
    id: 'sessions',
    label: 'Active sessions',
    prefix: '', suffix: '',
    color: 'purple', icon: '🟣',
    change: '+3.2%', dir: 'up',
    step:   () => Math.floor(Math.random() * 5) - 1,
    format: v => Math.max(0, v).toLocaleString(),
  },
];

// Attach live values and bars to each stat object
stats.forEach(s => {
  s.value = INITIAL_VALUES[s.id];
  s.bars  = [...INITIAL_BARS[s.id]];
});

// ── Render grid ───────────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('statGrid');
  grid.innerHTML = stats.map(s => `
    <div class="stat-card ${s.color}" id="card-${s.id}">
      <div class="card-top">
        <div class="card-label">${s.label}</div>
        <div class="card-icon">${s.icon}</div>
      </div>
      <div class="stat-value" id="val-${s.id}">
        ${s.prefix}${s.format(s.value)}${s.suffix}
      </div>
      <div class="stat-change ${s.dir}" id="chg-${s.id}">
        ${s.dir === 'up' ? '↑' : '↓'} ${s.change}
        <span>vs last month</span>
      </div>
      <div class="mini-chart" id="chart-${s.id}">
        ${s.bars.map((h, i) =>
          `<div class="mini-bar${i === s.bars.length - 1 ? ' active' : ''}"
                style="height:${h}%"></div>`
        ).join('')}
      </div>
    </div>
  `).join('');
}

// ── Animate number ────────────────────────────────────────────
function animateValue(id, from, to, prefix, suffix, fmt) {
  const el = document.getElementById('val-' + id);
  if (!el) return;
  const duration = 500;
  const start = performance.now();
  const tick = (now) => {
    const p    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const cur  = Math.round(from + (to - from) * ease);
    el.textContent = prefix + fmt(cur) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Update mini bars ──────────────────────────────────────────
function updateBars(stat) {
  const container = document.getElementById('chart-' + stat.id);
  if (!container) return;
  const bars = container.querySelectorAll('.mini-bar');
  bars.forEach((b, i) => {
    b.style.height = stat.bars[i] + '%';
    b.classList.toggle('active', i === bars.length - 1);
  });
}

// ── Bump one stat ─────────────────────────────────────────────
function bump(stat) {
  const old   = stat.value;
  const delta = stat.step();
  stat.value  = Math.max(0, stat.value + delta);

  animateValue(stat.id, old, stat.value, stat.prefix, stat.suffix, stat.format);

  // Shift bar history
  const pct = Math.min(100, Math.round((stat.value / (stat.value * 1.05)) * 100));
  stat.bars.push(pct);
  stat.bars.shift();
  updateBars(stat);

  if (delta > 0) addLog(stat, delta);
}

// ── Bump all ──────────────────────────────────────────────────
function bumpAll() {
  stats.forEach(s => bump(s));
}

// ── Auto-update ───────────────────────────────────────────────
let autoTimer = null;

function setAuto(btn) {
  if (autoTimer) {
    // Already running — stop it
    clearInterval(autoTimer);
    autoTimer = null;
    btn.classList.remove('active');
    btn.textContent = 'Auto update';
  } else {
    autoTimer = setInterval(bumpAll, 2000);
    btn.classList.add('active');
    btn.textContent = 'Stop auto';
  }
}

// ── Reset ─────────────────────────────────────────────────────
function resetAll() {
  // Stop auto-update
  clearInterval(autoTimer);
  autoTimer = null;
  const btnAuto = document.getElementById('btnAuto');
  btnAuto.classList.remove('active');
  btnAuto.textContent = 'Auto update';

  // Restore every stat to its original value and bars
  stats.forEach(s => {
    const old  = s.value;
    s.value    = INITIAL_VALUES[s.id];
    s.bars     = [...INITIAL_BARS[s.id]];

    animateValue(s.id, old, s.value, s.prefix, s.suffix, s.format);
    updateBars(s);
  });

  // Clear activity log
  document.getElementById('logList').innerHTML = '';
}

// ── Activity log ──────────────────────────────────────────────
const LOG_COLORS = {
  blue:   '#4f8ef7',
  green:  '#34d399',
  amber:  '#fbbf24',
  pink:   '#f472b6',
  purple: '#a78bfa',
};

function addLog(stat, delta) {
  const list = document.getElementById('logList');
  const now  = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `
    <div class="log-dot" style="background:${LOG_COLORS[stat.color]}"></div>
    <span>${stat.label} increased by <strong>+${stat.format(delta)}</strong></span>
    <span class="log-time">${time}</span>
  `;

  list.prepend(item);
  if (list.children.length > 8) list.lastChild.remove();
}

// ── Live clock ────────────────────────────────────────────────
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function updateClock() {
  const now  = new Date();
  const h    = String(now.getHours()).padStart(2, '0');
  const m    = String(now.getMinutes()).padStart(2, '0');
  const s    = String(now.getSeconds()).padStart(2, '0');
  const day  = DAYS[now.getDay()];
  const date = `${day}, ${MONTHS[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;

  document.getElementById('clockTime').textContent = `${h}:${m}:${s}`;
  document.getElementById('clockDate').textContent = date;
}

// ── Init ──────────────────────────────────────────────────────
renderGrid();
updateClock();
setInterval(updateClock, 1000);
autoTimer = setInterval(bumpAll, 2000);
document.getElementById('btnAuto').textContent = 'Stop auto';