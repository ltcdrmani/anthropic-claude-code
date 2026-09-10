const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const links  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

burger.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });

document.querySelectorAll('.timeline__item, .skill-group, .edu__card, .about__grid, .hero__content').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Contact form
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Message Sent! ✓';
    btn.style.background = '#10b981';
    e.target.reset();
    setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; btn.disabled = false; }, 3000);
  }, 1000);
});
