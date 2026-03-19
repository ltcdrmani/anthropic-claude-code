// ===== Nav: scroll shadow + mobile burger =====
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const links  = document.querySelector('.nav__links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

burger.addEventListener('click', () => {
  links.classList.toggle('open');
});

// Close mobile menu on link click
links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => links.classList.remove('open'));
});

// ===== Smooth active link highlight =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.style.color = '');
      const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
      if (active) active.style.color = '#e8e8f0';
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// ===== Scroll reveal =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card, .skill-group, .about__grid, .hero__content').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ===== Contact form =====
const form = document.getElementById('contactForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  // Simulate async send
  setTimeout(() => {
    btn.textContent = 'Message Sent!';
    btn.style.background = '#10b981';
    form.reset();
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1200);
});
