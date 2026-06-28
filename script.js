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
