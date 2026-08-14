import jsPDF from "jspdf";
import { AXES, LEVELS, levelFor, axisLevelGuide } from "./data";

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
const STEEL = [100, 116, 139];    // #64748B - İkincil Gri
const LIGHT_BG = [248, 250, 252]; // #F8FAFC - Kart Arka Planı
const GRID = [226, 232, 240];     // #E2E8F0 - Çizgiler
const GREEN_BG = [236, 253, 245]; // #ECFDF5 - İkincil Yeşil
const GREEN_BORDER = [167, 243, 208];
const GREEN_TEXT = [6, 95, 70];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2; // 178mm

/* ---------------------------------------------------------------
   SAYFA HEADER VE FOOTER ÇİZİMİ
--------------------------------------------------------------- */

function drawHeaderBanner(doc, logoBase64) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 20, "F");

  doc.setFillColor(...AMBER);
  doc.rect(0, 20, PAGE_W, 1, "F");

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", MARGIN, 3, 14, 14);
    } catch (e) {
      console.warn("PDF Logo yerleştirme hatası:", e);
    }
  }

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
    doc.text("ÇORLU TİCARET VE SANAYİ ODASI · PROJE SERVİSİ DİJİTAL DÖNÜŞÜM HİZMETLERİ", MARGIN, PAGE_H - 7);
    doc.text(`Sayfa ${i} / ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 7, { align: "right" });
  }
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

  AXES.forEach((_, i) => {
    const [x, y] = pointAt(i, maxR);
    doc.line(cx, cy, x, y);
  });

  const dataPts = AXES.map((a, i) => pointAt(i, (scores[a.id] / 5) * maxR));
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1);
  for (let i = 0; i < n; i++) {
    const [x1, y1] = dataPts[i];
    const [x2, y2] = dataPts[(i + 1) % n];
    doc.line(x1, y1, x2, y2);
  }
  dataPts.forEach(([x, y]) => {
    doc.setFillColor(...BLUE);
    doc.circle(x, y, 1.4, "F");
  });

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  AXES.forEach((a, i) => {
    const [x, y] = pointAt(i, maxR + 7);
    doc.text(a.short.toUpperCase(), x, y, { align: "center" });
  });
}

/* ---------------------------------------------------------------
   EKSEN KART ÇİZİM YARDIMCISI (DİNAMİK YÜKSEKLİK VE %100 SIĞMA)
--------------------------------------------------------------- */

function drawAxisCard(doc, axis, score, x, y, width) {
  const guide = axisLevelGuide(axis, score);

  // Metinlerin Satır Sayılarını Önceden Hesaplama
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8);
  const descLines = doc.splitTextToSize(guide.description, width - 12);

  doc.setFontSize(7.8);
  const actionClean = guide.action ? guide.action.replace(/\s+/g, " ") : "";
  const actionLines = doc.splitTextToSize(actionClean, width - 12);

  const halfW = (width - 16) / 2;
  doc.setFontSize(6.8);
  const kpiText = axis.kpis ? axis.kpis.slice(0, 2).join(" • ") : "";
  const kpiLines = doc.splitTextToSize(kpiText, halfW - 4);

  const qwText = axis.quickWin || "";
  const qwLines = doc.splitTextToSize(qwText, halfW - 4);

  // Alt Kutuların İhtiyaç Duyduğu Yükseklik
  const subBoxContentH = Math.max(kpiLines.length, qwLines.length) * 3.2;
  const subBoxH = Math.max(13, 6 + subBoxContentH);

  // Toplam Kart Yüksekliği Hesabı
  const cardHeight = 16 + (descLines.length * 3.8) + 4 + (actionLines.length * 3.6) + 4 + subBoxH + 4;

  // Kart Arka Planı
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...GRID);
  doc.roundedRect(x, y, width, cardHeight, 2, 2, "FD");

  // Sol Mavi Dikey Şerit
  doc.setFillColor(...BLUE);
  doc.rect(x, y, 2.5, cardHeight, "F");

  // Başlık Satırı
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(`${axis.no}. ${axis.title}`, x + 6, y + 6);

  // Puan
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text(`${score.toFixed(2)} / 5.00`, x + width - 6, y + 6, { align: "right" });

  // Seviye Rozeti
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...AMBER);
  doc.text(`SEVİYE ${guide.level}: ${guide.name.toUpperCase()}`, x + 6, y + 11.5);

  // Açıklama Metni
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(descLines, x + 6, y + 16);

  let currentY = y + 16 + descLines.length * 3.8 + 1;

  // Aksiyon Yol Haritası
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("Aksiyon Yol Haritası:", x + 6, currentY);
  currentY += 4;

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(30, 41, 59);
  doc.text(actionLines, x + 6, currentY);

  currentY += actionLines.length * 3.6 + 3;

  // KPI Kutusu (Sol)
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x + 6, currentY, halfW, subBoxH, 1, 1, "FD");

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.text("HEDEF KPI'LAR", x + 8, currentY + 4);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...STEEL);
  doc.text(kpiLines, x + 8, currentY + 7.5);

  // Quick Win Kutusu (Sağ)
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(x + 8 + halfW, currentY, halfW, subBoxH, 1, 1, "FD");

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  doc.text("HIZLI KAZANIM (0-3 AY)", x + 10 + halfW, currentY + 4);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(120, 53, 15);
  doc.text(qwLines, x + 10 + halfW, currentY + 7.5);

  return cardHeight;
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
  let y = 26;

  // Başlık Kutusu
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...GRID);
  doc.roundedRect(MARGIN, y, CONTENT_W, 15, 2, 2, "FD");
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(firmName ? firmName.toUpperCase() : "DİJİTAL OLGUNLUK DEĞERLENDİRME RAPORU", MARGIN + 5, y + 6.5);
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...STEEL);
  doc.text(`Rapor Tarihi: ${dateStr}  ·  Çorlu TSO Proje Servisi Danışmanlık Hizmetleri`, MARGIN + 5, y + 11.5);
  y += 19;

  // Genel Skor Kartı
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "FD");

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...BLUE);
  doc.text(overall.toFixed(2), MARGIN + 6, y + 19);

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...STEEL);
  doc.text("/ 5.00  GENEL OLGUNLUK PUANI", MARGIN + 40, y + 8.5);

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(`SEVİYE: ${level.name.toUpperCase()}`, MARGIN + 40, y + 16);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const recClean = (level.recommendation || "").replace(/^Öncelik:\s*/i, "");
  const recLines = doc.splitTextToSize(`Stratejik Öncelik: ${recClean}`, CONTENT_W - 45);
  doc.text(recLines, MARGIN + 40, y + 22);

  y += 36;

  // Rapor Açıklaması
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Bu Rapor Ne Anlama Geliyor?", MARGIN, y);
  y += 5.5;

  y = paragraph(
    doc,
    "Bu rapor, firmanızın 6 stratejik eksende verdiği yanıtların acatech Industrie 4.0 Maturity Index, " +
      "CMMI V2.0, ISO/IEC 33001, WEF SIRI, Fraunhofer IMPULS ve OECD standartları çerçevesinde analiz edilmesiyle üretilmiştir. " +
      "Amacı, dijital ve yeşil dönüşüm yolculuğunuzda mevcut durumunuzu tespit etmek, somut KPI'larınızı belirlemek ve AB Yeşil Mutabakatı / SKDM süreçlerine uyum yetkinliğinizi ölçmektir.",
    y,
    { size: 9, lineHeight: 4.5 }
  );
  y += 8;

  // Seviye Skalası
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Genel Olgunluk Seviye Skalası", MARGIN, y);
  y += 5;

  LEVELS.forEach((l) => {
    const isCurrent = l.name === level.name;
    if (isCurrent) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(MARGIN, y - 4, CONTENT_W, 8, 1, 1, "F");
    }
    doc.setFont("DejaVuSans", isCurrent ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(isCurrent ? [180, 83, 9] : STEEL));
    doc.text(`${isCurrent ? "►" : "•"}  ${l.name}`, MARGIN + 3, y + 1.5);
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(l.desc, MARGIN + 42, y + 1.5);
    y += 8.5;
  });

  /* ================= SAYFA 2: DASHBOARD & EKSEN 1, 2, 3 ================= */
  doc.addPage();
  drawHeaderBanner(doc, logoBase64);
  y = 26;

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Eksen Bazlı Olgunluk Analizi ve Puan Karnesi", MARGIN, y);
  y += 5;

  // ÜST DASHBOARD KUTUSU (Sol: Radar, Sağ: Özet Tablo)
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...GRID);
  doc.roundedRect(MARGIN, y, CONTENT_W, 52, 2, 2, "FD");

  // Sol: Radar Grafiği
  drawRadar(doc, scores, MARGIN + 40, y + 26, 18);

  // Sağ: Puan Özeti Tablosu
  const rightX = MARGIN + 84;
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("EKSEN PUAN DAĞILIMI", rightX, y + 6);

  AXES.forEach((a, idx) => {
    const rowY = y + 12 + idx * 6.2;
    const score = scores[a.id];

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...NAVY);
    doc.text(`${a.no}. ${a.short}`, rightX, rowY);

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...BLUE);
    doc.text(`${score.toFixed(2)}`, rightX + 34, rowY, { align: "right" });

    // İlerleme Barı
    doc.setFillColor(226, 232, 240);
    doc.rect(rightX + 38, rowY - 2.5, 48, 3.5, "F");
    doc.setFillColor(...BLUE);
    doc.rect(rightX + 38, rowY - 2.5, (score / 5) * 48, 3.5, "F");
  });

  y += 56;

  // Eksen 1, 2, 3 Kartları
  AXES.slice(0, 3).forEach((a) => {
    const score = scores[a.id];
    const h = drawAxisCard(doc, a, score, MARGIN, y, CONTENT_W);
    y += h + 4;
  });

  /* ================= SAYFA 3: EKSEN 4, 5, 6 DETAYLARI ================= */
  doc.addPage();
  drawHeaderBanner(doc, logoBase64);
  y = 26;

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Eksen Bazlı Detaylı Analiz ve Yol Haritası (Devam)", MARGIN, y);
  y += 6;

  // Eksen 4, 5, 6 Kartları
  AXES.slice(3, 6).forEach((a) => {
    const score = scores[a.id];
    const h = drawAxisCard(doc, a, score, MARGIN, y, CONTENT_W);
    y += h + 5;
  });

  /* ================= SAYFA 4: İKİZ DÖNÜŞÜM & TEŞVİK REHBERİ ================= */
  doc.addPage();
  drawHeaderBanner(doc, logoBase64);
  y = 26;

  // 1. İkiz Dönüşüm (Yeşil & Dijital) Bölümü
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("İkiz Dönüşüm (Yeşil & Dijital) Hazırlık Değerlendirmesi", MARGIN, y);
  y += 5;

  doc.setFillColor(...GREEN_BG);
  doc.setDrawColor(...GREEN_BORDER);
  doc.roundedRect(MARGIN, y, CONTENT_W, 36, 2, 2, "FD");

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN_TEXT);
  doc.text("Sınırda Karbon Düzenleme Mekanizması (SKDM) & Sürdürülebilirlik Odak Notu", MARGIN + 5, y + 6.5);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  const greenText =
    "AB Yeşil Mutabakatı ve Sınırda Karbon Düzenleme Mekanizması (SKDM) kapsamında, Trakya bölgemizdeki ihracatçı imalatçı firmalarımızın dijitalleşme yatırımlarını enerji verimliliği ve karbon ayak izi takibiyle entegre etmesi hayati önem taşımaktadır. " +
    "Dijital altyapınızdaki veri toplama yetkinliği (IoT sensörler, MES ve Enerji İzleme Yazılımları), ürün bazlı karbon yoğunluğunu doğrulukla hesaplamanız ve AB emisyon beyan süreçlerine cezasız uyum sağlamanız için temel ön şarttır.";
  const greenLines = doc.splitTextToSize(greenText, CONTENT_W - 10);
  doc.text(greenLines, MARGIN + 5, y + 11.5);

  y += 41;

  // 2. Öncelikli Gelişim Alanları
  if (weakAxes.length > 0) {
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text("Öncelikli Gelişim Alanları ve Danışmanlık Önerileri", MARGIN, y);
    y += 5;

    const displayWeak = weakAxes.slice(0, 3);

    displayWeak.forEach((a) => {
      const resNames = Array.isArray(a.resources) ? a.resources.map((r) => r.name).join("  •  ") : "";
      const resLines = doc.splitTextToSize(`Önerilen Destek Kaynakları: ${resNames}`, CONTENT_W - 10);
      const actLines = doc.splitTextToSize(`Aksiyon Tavsiyesi: ${a.quickWin}`, CONTENT_W - 10);

      const cardH = 8 + resLines.length * 3.6 + actLines.length * 3.6 + 2;

      doc.setFillColor(...LIGHT_BG);
      doc.setDrawColor(...GRID);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 2, 2, "FD");

      let currentInnerY = y + 5;

      doc.setFont("DejaVuSans", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...AMBER);
      doc.text(`• ${a.title} (Puan: ${scores[a.id].toFixed(2)} / 5.00)`, MARGIN + 4, currentInnerY);
      currentInnerY += 4.5;

      doc.setFont("DejaVuSans", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(resLines, MARGIN + 4, currentInnerY);
      currentInnerY += resLines.length * 3.6 + 1.5;

      doc.setFont("DejaVuSans", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...BLUE);
      doc.text(actLines, MARGIN + 4, currentInnerY);

      y += cardH + 3;
    });
    y += 2;
  }

  // 3. Eşleştirilmiş Resmi Destek Programları
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Eşleştirilmiş Resmi Destek ve Teşvik Programları", MARGIN, y);
  y += 5;

  const supports = [
    ["TÜBİTAK TÜSSİDE D3A / DDX Modeli", "Dijital Dönüşüm Danışmanlığı ve Yol Haritası Desteği"],
    ["EDIH West Marmara İkiz Dönüşüm", "AB Destekli Ücretsiz Test-Before-Invest ve Yeşil Veri Hizmetleri"],
    ["KOSGEB Dijital Dönüşüm Desteği", "İşletme Geliştirme, Yazılım, Donanım ve Danışmanlık Hibeleri"],
    ["Ticaret Bakanlığı E-İhracat Destekleri", "Pazaryeri Entegrasyon, Dijital Pazarlama ve E-İhracat Hibeleri"],
  ];

  supports.forEach(([name, desc]) => {
    const descLines = doc.splitTextToSize(desc, CONTENT_W - 10);
    const cardH = 8 + descLines.length * 3.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...GRID);
    doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 1.5, 1.5, "FD");

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(`• ${name}`, MARGIN + 4, y + 4.5);

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...STEEL);
    doc.text(descLines, MARGIN + 4, y + 8.5);

    y += cardH + 2;
  });

  y += 3;

  // 4. Çorlu TSO Proje Servisi Çağrı Kutusu (DÜZELTİLDİ VE ÇOK SATIRLI HİZALANDI)
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(7.5);
  const calloutText = "Rapor sonuçlarınızı detaylandırmak ve firmanıza özel yol haritası oluşturmak için Odamız uzmanlarıyla birebir danışmanlık randevusu alabilirsiniz.";
  const calloutLines = doc.splitTextToSize(calloutText, CONTENT_W - 10);

  const calloutH = 10 + (calloutLines.length * 3.8);

  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_W, calloutH, 2, 2, "F");

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...AMBER);
  doc.text("ÇORLU TSO PROJE SERVİSİ İLE İLETİŞİME GEÇİN", MARGIN + 5, y + 5.5);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(calloutLines, MARGIN + 5, y + 10.5);

  /* ================= SAYFA 5: BİLİMSEL METODOLOJİ VE AKADEMİK KAYNAKÇA ================= */
  doc.addPage();
  drawHeaderBanner(doc, logoBase64);
  y = 26;

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Metodolojik Çerçeve ve Akademik Kaynakça", MARGIN, y);
  y += 6;

  y = paragraph(
    doc,
    "Bu değerlendirme aracı, Çorlu Ticaret ve Sanayi Odası tarafından özgün olarak geliştirilmiş olup uluslararası kabul görmüş dijital olgunluk çerçevelerinin kavramsal altyapılarına dayanmaktadır. Sertifikalı bir resmi denetim yerine, KOBİ'lerin dijital ve yeşil dönüşüm süreçlerine ön hazırlık niteliğinde bir öz-değerlendirme aracıdır.",
    y,
    { size: 8.5, lineHeight: 4.2 }
  );

  y += 6;

  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text("Referans Alınan Uluslararası Çerçeve ve Standartlar", MARGIN, y);
  y += 5;

  const frameworks = [
    ["1. acatech Industrie 4.0 Maturity Index", "Almanya Ulusal Bilim ve Mühendislik Akademisi (Schuh vd., 2017/2020). Kaynaklar, Bilgi Sistemleri, Organizasyonel Yapı ve Kültür olmak üzere 4 yapısal alanda 6 olgunluk seviyesi tanımlar."],
    ["2. WEF & Singapore EDB — SIRI (Smart Industry Readiness Index)", "Dünya Ekonomik Forumu ve Singapur EDB ortaklığıyla geliştirilen, sanayi işletmelerinin teknoloji, süreç ve organizasyon boyutlarında dijitalleşme seviyesini ölçen küresel standart."],
    ["3. Fraunhofer IMPULS & VDMA Industry 4.0 Readiness", "Almanya Fraunhofer Enstitüsü tarafından imalatçı KOBİ'lerin dijital araçlar, yeşil dönüşüm ve veri yönetimi olgunluğunu ölçmek üzere geliştirilmiş model."],
    ["4. MIT Center for Digital Business & Capgemini — Digital Maturity Model", "Westerman, Bonnet & McAfee (2014), 'Leading Digital'. Dijital Yoğunluk ile Dönüşüm Yönetimi Yoğunluğu prensipleri esas alınmıştır."],
    ["5. Avrupa Komisyonu EDIH Ağı — Open DMAT", "Digital Maturity Assessment Tool for SMEs. Dijital İş Stratejisi, Veri Yönetimi, Otomasyon & Yapay Zeka ve İkiz Dönüşüm boyutlarını kapsar."],
    ["6. CMMI V2.0 & ISO/IEC 33001 Standart Ailesi", "Süreç değerlendirme ve kademeli olgunluk seviyelendirmesinin uluslararası resmi metodolojik altyapısını oluşturur."],
    ["7. NIST Cybersecurity Framework & OECD Going Digital", "Siber dayanıklılık, erişim güvenliği, veri gizliliği (KVKK/GDPR) ve dijital çağda güven politikalarının temel referansıdır."],
  ];

  frameworks.forEach(([title, desc]) => {
    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...GRID);
    doc.roundedRect(MARGIN, y, CONTENT_W, 19, 1.5, 1.5, "FD");

    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text(title, MARGIN + 4, y + 5);

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(desc, CONTENT_W - 8);
    doc.text(descLines, MARGIN + 4, y + 9.5);

    y += 22;
  });

  y += 4;

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...STEEL);
  const disclaimer = "Telif Hakkı © Çorlu Ticaret ve Sanayi Odası. Tüm hakları saklıdır. Bu rapor bilgilendirme amacıyla üretilmiştir; resmi akreditasyon veya kanuni denetim yerine geçmez.";
  const discLines = doc.splitTextToSize(disclaimer, CONTENT_W);
  doc.text(discLines, MARGIN, y);

  footer(doc);

  const safeName = (firmName || "firma").replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\- ]/g, "").trim() || "firma";
  doc.save(`corlu-tso-dijital-olgunluk-${safeName}.pdf`);
}
