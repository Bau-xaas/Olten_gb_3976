/* ===== NAVIGATION ===== */
const nav      = document.getElementById('nav');
const burger   = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ===== COUNTING ANIMATION ===== */
function animateCount(el) {
  const target = parseInt(el.dataset.to, 10);
  const duration = 1600;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('de-CH');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ===== INTERSECTION OBSERVER (reveal + counters + bars) ===== */
const ioOptions = { threshold: 0.15 };

// Reveal animation
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, ioOptions);
document.querySelectorAll('.kpi-card, .objekt-card, .reno-card, .variant-card, .tl-item, .bkp-row, .foerder-item').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Counter animation
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      countObserver.unobserve(e.target);
    }
  });
}, ioOptions);
document.querySelectorAll('.count').forEach(el => countObserver.observe(el));

// BKP bar animation
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.bkp-bar').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
const bkpSection = document.getElementById('kosten');
if (bkpSection) barObserver.observe(bkpSection);

// Progress bar animation
const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelector('.progress-fill').style.width = '72%';
      progressObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.progress-track').forEach(el => progressObserver.observe(el));

/* ===== BEFORE / AFTER SLIDERS ===== */
let activeSlider = null;

function initSlider(wrapper) {
  const before = wrapper.querySelector('.ba-before');
  const handle = wrapper.querySelector('.ba-handle');
  if (!before || !handle) return;

  let pct = 50;
  handle.style.left = '50%';

  function update(x) {
    const rect = wrapper.getBoundingClientRect();
    pct = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
  }

  wrapper.addEventListener('mousedown', (e) => {
    activeSlider = { update };
    update(e.clientX);
    e.preventDefault();
  });
  wrapper.addEventListener('touchstart', (e) => {
    activeSlider = { update };
    update(e.touches[0].clientX);
  }, { passive: true });

  let hintDone = false;
  const hintObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hintDone) {
      hintDone = true;
      setTimeout(() => {
        const dur = 1200, start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const ease = t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
          const cur = t < .5 ? 50 + (30-50)*ease : 30 + (50-30)*((ease-.5)*2);
          pct = cur;
          before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
          handle.style.left = pct + '%';
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 600);
      hintObserver.disconnect();
    }
  }, { threshold: 0.5 });
  hintObserver.observe(wrapper);
}

document.querySelectorAll('.ba-wrapper').forEach(initSlider);

window.addEventListener('mousemove', (e) => { if (activeSlider) activeSlider.update(e.clientX); });
window.addEventListener('mouseup',   () => { activeSlider = null; });
window.addEventListener('touchmove', (e) => { if (activeSlider) activeSlider.update(e.touches[0].clientX); }, { passive: true });
window.addEventListener('touchend',  () => { activeSlider = null; });

/* ===== FLOOR PLAN TABS ===== */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const floor = tab.dataset.floor;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.floor-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + floor);
    if (panel) panel.classList.add('active');
  });
});

/* ===== SMOOTH SCROLL OFFSET (for sticky nav) ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 168;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
