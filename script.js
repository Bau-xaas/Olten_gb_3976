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

/* ===== BEFORE / AFTER SLIDER ===== */
const baWrapper = document.getElementById('baWrapper');
const baBefore  = document.getElementById('baBefore');
const baHandle  = document.getElementById('baHandle');

if (baWrapper && baBefore && baHandle) {
  let dragging = false;
  let pct = 50;

  function setSlider(x) {
    const rect = baWrapper.getBoundingClientRect();
    pct = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
    baBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    baHandle.style.left = pct + '%';
  }

  // Initialise at 50%
  baHandle.style.left = '50%';

  baWrapper.addEventListener('mousedown', (e) => {
    dragging = true;
    setSlider(e.clientX);
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => { if (dragging) setSlider(e.clientX); });
  window.addEventListener('mouseup',   () => { dragging = false; });

  baWrapper.addEventListener('touchstart', (e) => {
    dragging = true;
    setSlider(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (dragging) setSlider(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });

  // Hint: auto-animate once on load to show interaction
  let hintDone = false;
  const hintObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hintDone) {
      hintDone = true;
      setTimeout(() => autoHint(), 600);
      hintObserver.disconnect();
    }
  }, { threshold: 0.5 });
  hintObserver.observe(baWrapper);

  function autoHint() {
    const duration = 1200;
    const start = performance.now();
    const fromPct = 50;
    const toPct   = 30;
    const back    = 50;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = t < .5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const cur = t < .5
        ? fromPct + (toPct - fromPct) * (ease)
        : toPct   + (back   - toPct)  * ((ease - .5) * 2);
      pct = cur;
      baBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      baHandle.style.left = pct + '%';
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

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

/* ===== PDF GENERATION ===== */
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', generatePDF);
}

function generatePDF() {
  if (!window.jspdf) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const m = 20;
  let y = m;

  const addLine = (text, size, bold, color) => {
    doc.setFontSize(size || 11);
    doc.setFont('Helvetica', bold ? 'bold' : 'normal');
    if (color) doc.setTextColor(...color);
    else doc.setTextColor(28, 25, 23);
    doc.text(text, m, y, { maxWidth: 170 });
    y += size ? size * 0.5 + 2 : 7;
  };

  const addDivider = () => {
    doc.setDrawColor(229, 226, 220);
    doc.line(m, y, 210 - m, y);
    y += 5;
  };

  const addGold = (text) => addLine(text, 9, true, [184, 151, 90]);

  // Header
  doc.setFillColor(28, 25, 23);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('Helvetica', 'bold');
  doc.text('Bau-XaaS | Grobe Plausibilitätsprüfung 2026', m, 13);
  doc.setFontSize(9); doc.setFont('Helvetica', 'normal');
  doc.setTextColor(184, 151, 90);
  doc.text('Totalsanierung EFH Feldstrasse 49, 4600 Olten', m, 22);
  y = 40;

  addLine('Projektübersicht', 16, true);
  addDivider();

  addGold('OBJEKT');
  addLine('Adresse:     Feldstrasse 49, 4600 Olten');
  addLine('Grundstück:  Nr. 3976 · 430 m²');
  addLine('Zone:        W2 (Wohnzone 2) · Ausnützungsziffer 0.6');
  addLine('Gebäudeart:  Einfamilienhaus (EFH)');
  addLine('Kubatur:     687 m³');
  y += 4;

  addDivider();
  addGold('KOSTENSTRUKTUR (VARIANTE A — TOTALSANIERUNG)');
  addLine('Sanierungskosten brutto:       CHF 400\'000 – 500\'000');
  addLine('Umgebungsarbeiten:             ca. CHF 50\'000 – 80\'000');
  addLine('Baunebenkosten / Honorare:     ca. CHF 50\'000 – 70\'000');
  y += 3;
  doc.setFillColor(248, 247, 244);
  doc.rect(m, y - 1, 170, 10, 'F');
  addLine('Gesamtinvestition (inkl. Liegenschaft):   CHF 1.15 – 1.25 Mio', 11, true, [184, 151, 90]);
  y += 3;

  addDivider();
  addGold('BKP POSITIONEN (INBEGRIFFEN IN SANIERUNGSKOSTEN)');
  const bkp = [
    ['BKP 230', 'Elektroinstallationen'],
    ['BKP 240', 'Heizung / Wärmepumpe'],
    ['BKP 250', 'Sanitäranlagen'],
    ['BKP 271', 'Gipserarbeiten'],
    ['BKP 281', 'Bodenbeläge'],
  ];
  bkp.forEach(([code, name]) => {
    addLine(`  ${code}   ${name}`, 10);
  });
  y += 3;

  addDivider();
  addGold('FÖRDERGELDER');
  addLine('· Wärmepumpe:  kantonale & bundesweite Förderung (Ersatz fossile Heizung)');
  addLine('· GEAK Plus:   Gebäudeenergieausweis als Grundlage für Förderanträge');
  addLine('· Gebäudehülle: Fassade, Dach & Fenster gemäss kantonalem Programm');
  y += 3;

  addDivider();
  addGold('VARIANTEN');
  addLine('Variante A (Empfehlung): Totalsanierung Bestand', 10, true);
  addLine('  → Werterhalt, energetische Sanierung, planbare Kosten, schnelle Umsetzung');
  y += 2;
  addLine('Variante B (Spätere Phase): Erweiterung & Dachausbau', 10);
  addLine('  → +100 m² Ausbaureserve, aktuell nicht im Scope');
  y += 4;

  addDivider();
  addGold('KONTAKT');
  addLine('Bau-XaaS — Bau, IT & Immobilien', 11, true);
  addLine('E-Mail:   info@bauxaas.ch');
  addLine('Telefon:  +41 79 888 78 88');

  // Footer
  doc.setFillColor(240, 237, 232);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setFontSize(8); doc.setFont('Helvetica', 'normal');
  doc.setTextColor(87, 83, 78);
  doc.text('© 2026 Bau-XaaS | Bau, IT & Immobilien | info@bauxaas.ch | +41 79 888 78 88', m, 290);
  doc.text('Grobe Plausibilitätsstudie — Angaben ohne Gewähr, vorbehältlich detaillierter Planung.', m, 295);

  doc.save('BauXaaS_PlausibilitaetsPruefung_Feldstrasse49_Olten.pdf');
}

/* ===== SMOOTH SCROLL OFFSET (for sticky nav) ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
