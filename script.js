const summaryData = {
  title: 'Bau-XaaS Umbau & Machbarkeitsstudie',
  subtitle: 'Einfach verständlich, klar strukturiert und bereit für Entscheidungen.',
  location: 'Objektdaten aus der Machbarkeitsstudie',
  keyFacts: [
    'Grundstück: 430 m²',
    'Zone: W2 / Ausnützungsziffer 0.6',
    'Kubatur: 687 m³',
    'Sanierungskosten: CHF 400’000–500’000',
    'Gesamtinvestition: CHF 1.15–1.25 Mio',
    'Ziel: nachhaltige Totalsanierung und Ausbaureserve'
  ],
  variants: [
    'Variante A: Totalsanierung mit modernem Ausbau',
    'Variante B: Wird aktuell nicht geprüft'
  ],
  contact: [
    'Bau-XaaS',
    'info@bauxaas.ch',
    '+41 79 888 78 88'
  ]
};

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = 60;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(summaryData.title, margin, y);

  y += 30;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(summaryData.subtitle, margin, y, { maxWidth: 520 });

  y += 40;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Standort', margin, y);

  y += 20;
  doc.setFont('Helvetica', 'normal');
  doc.text(summaryData.location, margin, y, { maxWidth: 520 });

  y += 35;
  doc.setFont('Helvetica', 'bold');
  doc.text('Kernpunkte', margin, y);

  y += 18;
  doc.setFont('Helvetica', 'normal');
  summaryData.keyFacts.forEach((fact) => {
    doc.text('• ' + fact, margin, y, { maxWidth: 520 });
    y += 18;
  });

  y += 16;
  doc.setFont('Helvetica', 'bold');
  doc.text('Varianten', margin, y);

  y += 18;
  doc.setFont('Helvetica', 'normal');
  summaryData.variants.forEach((variant) => {
    doc.text('• ' + variant, margin, y, { maxWidth: 520 });
    y += 18;
  });

  y += 24;
  doc.setFont('Helvetica', 'bold');
  doc.text('Kontakt', margin, y);

  y += 18;
  doc.setFont('Helvetica', 'normal');
  summaryData.contact.forEach((line) => {
    doc.text(line, margin, y, { maxWidth: 520 });
    y += 16;
  });

  doc.save('Bau-XaaS_Umbau_Zusammenfassung.pdf');
}

const downloadButton = document.getElementById('downloadSummary');
downloadButton.addEventListener('click', generatePDF);
