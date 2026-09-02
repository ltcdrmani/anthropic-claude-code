const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

burger.addEventListener('click', () => {
  links.classList.toggle('open');
});

links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    links.classList.remove('open');
    document.querySelectorAll('.nav__dropdown-menu').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.nav__dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
  });
});

/* DROPDOWN */
document.querySelectorAll('.nav__dropdown-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = btn.nextElementSibling;
    const isOpen = menu.classList.contains('open');
    document.querySelectorAll('.nav__dropdown-menu').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.nav__dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (!isOpen) {
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.nav__dropdown-menu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.nav__dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
});

/* ACTIVE SECTION HIGHLIGHT */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"], .nav__dropdown-menu a[href^="#"]');
const dropdownBtn = document.querySelector('.nav__dropdown-btn');
const dayIds = ['day1','day2','day3','day4','day5','day6','day7','day8'];

function highlightNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
  if (dropdownBtn) {
    dropdownBtn.classList.toggle('active', dayIds.includes(current));
  }
}
window.addEventListener('scroll', highlightNav);
highlightNav();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.day-header, .timeline__item, .weather-bar, .meal-box, .overview__card, .valid-card, .validation__verdict, .validation__table-wrap, .checklist-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* CHECKLIST */
(function() {
  const STORAGE_KEY = 'pnw-trip-checklist';
  const checkboxes = document.querySelectorAll('.checklist-card__list input[type="checkbox"]');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateProgress() {
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.checklist-card__list input:checked').length;
    const pct = total ? Math.round((checked / total) * 100) : 0;
    progressFill.style.width = pct + '%';
    progressText.textContent = checked + ' / ' + total + ' complete';
  }

  function updateCardCounts() {
    document.querySelectorAll('.checklist-card').forEach(card => {
      const items = card.querySelectorAll('input[type="checkbox"]');
      const done = card.querySelectorAll('input[type="checkbox"]:checked').length;
      const countEl = card.querySelector('.checklist-card__count');
      countEl.textContent = done + '/' + items.length;
      countEl.classList.toggle('done', done === items.length && items.length > 0);
    });
  }

  const state = loadState();
  checkboxes.forEach(cb => {
    if (state[cb.dataset.key]) cb.checked = true;
    cb.addEventListener('change', () => {
      const s = loadState();
      if (cb.checked) s[cb.dataset.key] = true;
      else delete s[cb.dataset.key];
      saveState(s);
      updateProgress();
      updateCardCounts();
    });
  });

  updateProgress();
  updateCardCounts();

  document.querySelectorAll('.checklist-card__header').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      list.classList.toggle('collapsed', expanded);
    });
  });

  document.getElementById('uncheckAll').addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = false);
    saveState({});
    updateProgress();
    updateCardCounts();
  });

  document.getElementById('collapseAll').addEventListener('click', function() {
    const headers = document.querySelectorAll('.checklist-card__header');
    const allCollapsed = Array.from(headers).every(h => h.getAttribute('aria-expanded') === 'false');
    headers.forEach(btn => {
      btn.setAttribute('aria-expanded', allCollapsed);
      btn.nextElementSibling.classList.toggle('collapsed', !allCollapsed);
    });
    this.textContent = allCollapsed ? 'Collapse All' : 'Expand All';
  });
})();

/* TODAY AUTO-FOCUS & TRIP PROGRESS */
(function () {
  var DAYS = [
    { id: 'day1', dates: ['2026-09-03', '2026-09-04'], label: 'Sep 3–4' },
    { id: 'day2', dates: ['2026-09-05'], label: 'Sep 5' },
    { id: 'day3', dates: ['2026-09-06'], label: 'Sep 6' },
    { id: 'day4', dates: ['2026-09-07'], label: 'Sep 7' }
  ];
  var N = DAYS.length;
  var prog = document.getElementById('tripProgress');

  function localDateStr(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  var today = localDateStr(new Date());
  var idx = -1;
  for (var i = 0; i < N; i++) { if (DAYS[i].dates.indexOf(today) !== -1) { idx = i; break; } }

  function daysUntil(dateStr) {
    return Math.round((new Date(dateStr + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
  }

  if (idx >= 0) {
    var pct = Math.round(((idx + 1) / N) * 100);
    if (prog) {
      prog.hidden = false;
      prog.innerHTML =
        '<div class="trip-progress__bar"><span style="width:' + pct + '%"></span></div>' +
        '<p class="trip-progress__text">Day ' + (idx + 1) + ' of ' + N + ' • ' + DAYS[idx].label +
        ' — <a href="#' + DAYS[idx].id + '">jump to today ↓</a></p>';
    }
    var sec = document.getElementById(DAYS[idx].id);
    if (sec) {
      sec.classList.add('is-today');
      var badgeEl = sec.querySelector('.day-header__badge');
      if (badgeEl && !sec.querySelector('.today-badge')) {
        var tb = document.createElement('span');
        tb.className = 'today-badge';
        tb.textContent = 'Today';
        badgeEl.insertAdjacentElement('afterend', tb);
      }
      if (!location.hash) {
        setTimeout(function () {
          window.scrollTo({ top: sec.offsetTop - 76, behavior: 'smooth' });
        }, 500);
      }
    }
  } else if (prog) {
    var startDelta = daysUntil(DAYS[0].dates[0]);
    prog.hidden = false;
    if (startDelta > 0) {
      prog.innerHTML = '<p class="trip-progress__text">Trip starts ' + DAYS[0].label +
        ' • ' + startDelta + ' day' + (startDelta > 1 ? 's' : '') + ' to go</p>';
    } else {
      prog.innerHTML = '<p class="trip-progress__text">Trip complete — hope it was amazing!</p>';
    }
  }
})();

/* THEME TOGGLE (dark mode) */
(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  function paint() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (btn) btn.textContent = dark ? '☀️' : '🌙';
  }
  paint();
  if (btn) btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    paint();
  });
})();
