import jsPDF from "jspdf";
import { AXES, LEVELS, levelFor, statusFor, axisLevelGuide } from "./data";

/* ---------------------------------------------------------------
   FONT VE LOGO YÜKLEME YARDIMCILARI
--------------------------------------------------------------- */

let fontsLoadedPromise = null;

async function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadLogoBase64() {
  try {
    const response = await fetch("/ctso-logo.jpg");
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Logo yüklenemedi:", e);
    return null;
  }
}

async function ensureFontsLoaded(doc) {
  if (!fontsLoadedPromise) {
    fontsLoadedPromise = Promise.all([
      fetch("/fonts/DejaVuSans-subset.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/DejaVuSans-Bold-subset.ttf").then((r) => r.arrayBuffer()),
    ]).then(([regularBuf, boldBuf]) =>
      Promise.all([arrayBufferToBase64(regularBuf), arrayBufferToBase64(boldBuf)])
    );
  }
  const [regularB64, boldB64] = await fontsLoadedPromise;
  doc.addFileToVFS("DejaVuSans.ttf", regularB64);
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", boldB64);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");
}

/* ---------------------------------------------------------------
   KURUMSAL RENK PALETİ VE SAYFA BOYUTLARI
--------------------------------------------------------------- */

const NAVY = [9, 21, 56];         // #091538 - Çorlu TSO Derin Lacivert
const AMBER = [217, 119, 6];      // #D97706 - Kurumsal Altın
const BLUE = [30, 58, 138];       // #1E3A8A - Vurgu Mavi
const STEEL = [100, 116, 139];    // #64748B - Ikincil Gri
const LIGHT_BG = [248, 250, 252]; // #F8FAFC - Kart Arka Planı
const GRID = [226, 232, 240];     // #E2E8F0 - Çizgiler

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

/* ---------------------------------------------------------------
   SAYFA HEADER VE FOOTER ÇİZİMİ (KAYMALARI ÖNLER)
--------------------------------------------------------------- */

function drawHeaderBanner(doc, logoBase64) {
  // Üst Koyu Şerit
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 20, "F");

  // İnce Altın Çizgi
  doc.setFillColor(...AMBER);
  doc.rect(0, 20, PAGE_W, 1, "F");

  // Logo (Sabit Boyut ve Konum)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", MARGIN, 3, 14, 14);
    } catch (e) {
      console.warn("PDF Logo yerleştirme hatası:", e);
    }
  }

  // Header Metinleri
  const titleX = logoBase64 ? MARGIN + 18 : MARGIN;
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...AMBER);
  doc.text("ÇORLU TİCARET VE SANAYİ ODASI", titleX, 9);

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Dijital Olgunluk Değerlendirme Raporu", titleX, 15);
}

function footer(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...GRID);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...STEEL);
    doc.text("ÇORLU TİCARET VE SANAYİ ODASI · DİJİTAL DÖNÜŞÜM HİZMETLERİ", MARGIN, PAGE_H - 7);
    doc.text(`Sayfa ${i} / ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 7, { align: "right" });
  }
}

function ensureSpace(doc, y, needed, logoBase64) {
  if (y + needed > PAGE_H - 18) {
    doc.addPage();
    drawHeaderBanner(doc, logoBase64);
    return 28;
  }
  return y;
}

function paragraph(doc, text, y, opts = {}) {
  const { size = 8.5, color = [51, 65, 85], lineHeight = 4.2, width = CONTENT_W, x = MARGIN } = opts;
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, width);
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineHeight);
  });
  return y + lines.length * lineHeight;
}

/* ---------------------------------------------------------------
   RADAR GRAFİĞİ
--------------------------------------------------------------- */

function drawRadar(doc, scores, cx, cy, maxR) {
  const n = AXES.length;
  const pointAt = (i, r) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  // Izgara
  [1, 2, 3, 4, 5].forEach((ring) => {
    doc.setDrawColor(...GRID);
    doc.setLineWidth(ring === 5 ? 0.3 : 0.15);
    const pts = AXES.map((_, i) => pointAt(i, (ring / 5) * maxR));
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % n];
      doc.line(x1, y1, x2, y2);
    }
  });

  // Eksenler
  AXES.forEach((_, i) => {
    const [x, y] = pointAt(i, maxR);
    doc.line(cx, cy, x, y);
  });

  // Veri Poligonu
  const dataPts = AXES.map((a, i) => pointAt(i, (scores[a.id] / 5) * maxR));
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.8);
  for (let i = 0; i < n; i++) {
    const [x1, y1] = dataPts[i];
    const [x2, y2] = dataPts[(i + 1) % n];
    doc.line(x1, y1, x2, y2);
  }
  dataPts.forEach(([x, y]) => {
    doc.setFillColor(...BLUE);
    doc.circle(x, y, 1.2, "F");
  });

  // Etiketler
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  AXES.forEach((a, i) => {
    const [x, y] = pointAt(i, maxR + 8);
    doc.text(a.short.toUpperCase(), x, y, { align: "center" });
  });
}

/* ---------------------------------------------------------------
   ANA RAPOR OLUŞTURUCU
--------------------------------------------------------------- */

export async function generatePdfReport({ firmName, scores, overall, answers }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await ensureFontsLoaded(doc);
  const logoBase64 = await loadLogoBase64();

  const level = levelFor(overall);
  const weakAxes = AXES.filter((a) => scores[a.id] > 0 && scores[a.id] < 3).sort(
    (a, b) => scores[a.id] - scores[b.id]
  );
  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  /* ================= SAYFA 1: EXECUTIVE KAPAK VE ÖZET ================= */
  drawHeaderBanner(doc, logoBase64);
  let y = 28;

  // Başlık Kutusu
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...GRID);
  doc.roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, "FD");
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(firmName ? firmName.toUpperCase() : "DİJİTAL OLGUNLUK DEĞERLENDİRME RAPORU", MARGIN + 4, y + 6);
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...STEEL);
  doc.text(`Rapor Tarihi: ${dateStr}  ·  Çorlu TSO KOBİ Danışmanlık Hizmetleri`, MARGIN + 4, y + 10.5);
  y += 18;

  // Genel Skor Kartı
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(MARGIN, y, CONTENT_W, 28, 3, 3, "FD");

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...BLUE);
  doc.text(overall.toFixed(2), MARGIN + 6, y + 18);

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...STEEL);
  doc.text("/ 5.00  GENEL OLGUNLUK PUANI", MARGIN + 38, y + 8);

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(`SEVİYE: ${level.name.toUpperCase()}`, MARGIN + 38, y + 15);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const recClean = (level.recommendation || "").replace(/^Öncelik:\s*/i, "");
  const recLines = doc.splitTextToSize(`Stratejik Öncelik: ${recClean}`, CONTENT_W - 42);
  doc.text(recLines, MARGIN + 38, y + 21);

  y += 34;

  // Rapor Açıklaması
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text("Bu Rapor Ne Anlama Geliyor?", MARGIN, y);
  y += 5;

  y = paragraph(
    doc,
    "Bu rapor, firmanızın 6 stratejik eksende verdiği yanıtların acatech Industrie 4.0 Maturity Index, " +
      "CMMI V2.0 ve ISO/IEC 33001 standartları çerçevesinde analiz edilmesiyle üretilmiştir. " +
      "Amacı, dijital dönüşüm yolculuğunuzda mevcut durumunuzu tespit etmek ve öncelikli gelişim alanlarınızı belirlemektir.",
    y
  );
  y += 6;

  // Seviye Skalası
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text("Genel Olgunluk Seviye Skalası", MARGIN, y);
  y += 4;

  LEVELS.forEach((l) => {
    const isCurrent = l.name === level.name;
    if (isCurrent) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(MARGIN, y - 3.5, CONTENT_W, 6, 1, 1, "F");
    }
    doc.setFont("DejaVuSans", isCurrent ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...(isCurrent ? [180, 83, 9] : STEEL));
    doc.text(`${isCurrent ? "►" : "•"}  ${l.name}`, MARGIN + 2, y);
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(l.desc, MARGIN + 38, y);
    y += 5.5;
  });

  /* ================= SAYFA 2: RADAR & İLK 3 EKSEN ANALİZİ ================= */
  doc.addPage();
  drawHeaderBanner(doc, logoBase64);
  y = 28;

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Eksen Bazlı Olgunluk Analizi", MARGIN, y);
  y += 4;

  drawRadar(doc, scores, PAGE_W / 2, y + 26, 24);
  y += 56;

  // İlk 3 Eksen
  AXES.slice(0, 3).forEach((a) => {
    y = ensureSpace(doc, y, 32, logoBase64);
    const s = scores[a.id];
    const guide = axisLevelGuide(a, s);

    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...GRID);
    doc.roundedRect(MARGIN, y, CONTENT_W, 28, 2, 2, "FD");

    doc.setFillColor(...BLUE);
    doc.rect(MARGIN, y, 2, 28, "F");

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(`${a.no}. ${a.title}`, MARGIN + 5, y + 5.5);

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text(`${s.toFixed(2)} / 5.00`, PAGE_W - MARGIN - 4, y + 5.5, { align: "right" });

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...AMBER);
    doc.text(`SEVİYE ${guide.level}: ${guide.name.toUpperCase()}`, MARGIN + 5, y + 10);

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(51, 65, 85);
    const actionClean = guide.action ? guide.action.replace(/\s+/g, " ") : "";
    const actionLines = doc.splitTextToSize(`Aksiyon Yol Haritası: ${actionClean}`, CONTENT_W - 10);
    doc.text(actionLines, MARGIN + 5, y + 15);

    y += 31;
  });

  /* ================= SAYFA 3: SON 3 EKSEN ANALİZİ ================= */
  doc.addPage();
  drawHeaderBanner(doc, logoBase64);
  y = 28;

  AXES.slice(3, 6).forEach((a) => {
    y = ensureSpace(doc, y, 32, logoBase64);
    const s = scores[a.id];
    const guide = axisLevelGuide(a, s);

    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...GRID);
    doc.roundedRect(MARGIN, y, CONTENT_W, 28, 2, 2, "FD");

    doc.setFillColor(...BLUE);
    doc.rect(MARGIN, y, 2, 28, "F");

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(`${a.no}. ${a.title}`, MARGIN + 5, y + 5.5);

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text(`${s.toFixed(2)} / 5.00`, PAGE_W - MARGIN - 4, y + 5.5, { align: "right" });

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...AMBER);
    doc.text(`SEVİYE ${guide.level}: ${guide.name.toUpperCase()}`, MARGIN + 5, y + 10);

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(51, 65, 85);
    const actionClean = guide.action ? guide.action.replace(/\s+/g, " ") : "";
    const actionLines = doc.splitTextToSize(`Aksiyon Yol Haritası: ${actionClean}`, CONTENT_W - 10);
    doc.text(actionLines, MARGIN + 5, y + 15);

    y += 31;
  });

  /* ================= SAYFA 4: GELİŞİM ALANLARI, DESTEKLER VE METODOLOJİ ================= */
  doc.addPage();
  drawHeaderBanner(doc, logoBase64);
  y = 28;

  if (weakAxes.length > 0) {
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...NAVY);
    doc.text("Öncelikli Gelişim Alanları ve Önerilen Destekler", MARGIN, y);
    y += 5;

    weakAxes.forEach((a) => {
      y = ensureSpace(doc, y, 16, logoBase64);
      doc.setFont("DejaVuSans", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...AMBER);
      doc.text(`• ${a.title} (Puan: ${scores[a.id].toFixed(2)})`, MARGIN + 2, y);
      y += 4;

      if (Array.isArray(a.resources)) {
        a.resources.forEach((r) => {
          doc.setFont("DejaVuSans", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...STEEL);
          doc.text(`- ${r.name}`, MARGIN + 6, y);
          y += 4;
        });
      }
      y += 2;
    });
    y += 4;
  }

  // Destek Programları
  y = ensureSpace(doc, y, 35, logoBase64);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text("Resmi Destek Programları", MARGIN, y);
  y += 5;

  [
    ["TÜBİTAK TÜSSİDE D3A / DDX Modeli", "https://ddxmodel.tubitak.gov.tr"],
    ["EDIH Open DMAT (Avrupa Komisyonu)", "https://european-digital-innovation-hubs.ec.europa.eu"],
    ["KOSGEB Dijital Dönüşüm Danışmanlığı Desteği", "https://www.kosgeb.gov.tr"],
  ].forEach(([name, url]) => {
    y = ensureSpace(doc, y, 7, logoBase64);
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(`• ${name}`, MARGIN + 2, y);
    y += 4;
  });

  y += 6;

  // Metodoloji
  y = ensureSpace(doc, y, 40, logoBase64);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text("Metodolojik Çerçeve ve Akademik Kaynakça", MARGIN, y);
  y += 5;

  y = paragraph(
    doc,
    "Bu araç, Çorlu Ticaret ve Sanayi Odası tarafından özgün olarak geliştirilmiş olup acatech Industrie 4.0 " +
      "Maturity Index, MIT & Capgemini Digital Maturity Model, AB EDIH Open DMAT, CMMI V2.0, ISO/IEC 33001 ve " +
      "OECD Going Digital standartlarına dayanmaktadır. Sertifikalı bir denetim yerine, KOBİ'lerin dijital dönüşüm süreçlerine ön hazırlık niteliğinde hafif bir öz-değerlendirme aracıdır.",
    y,
    { size: 8 }
  );

  footer(doc);

  const safeName = (firmName || "firma").replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\- ]/g, "").trim() || "firma";
  doc.save(`corlu-tso-dijital-olgunluk-${safeName}.pdf`);
}
