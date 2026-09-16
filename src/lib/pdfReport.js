import jsPDF from "jspdf";
import {
  DMAT_DIMENSIONS,
  DMAT_SOURCES,
  QUESTIONS,
  SCALE_0_5,
  dimensionInterpretation,
} from "./data";

let fontsLoadedPromise = null;

async function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

async function ensureFontsLoaded(doc) {
  if (!fontsLoadedPromise) {
    fontsLoadedPromise = Promise.all([
      fetch("/fonts/DejaVuSans-subset.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/DejaVuSans-Bold-subset.ttf").then((r) => r.arrayBuffer()),
    ]).then(([regular, bold]) => Promise.all([arrayBufferToBase64(regular), arrayBufferToBase64(bold)]));
  }
  const [regular, bold] = await fontsLoadedPromise;
  doc.addFileToVFS("DejaVuSans.ttf", regular);
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");
}

async function loadLogo() {
  try {
    const res = await fetch("/ctso-logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const PAGE_W = 210;
const PAGE_H = 297;
const M = 15;
const CONTENT_W = PAGE_W - M * 2;
const NAVY = [15, 23, 42];
const BLUE = [37, 99, 235];
const AMBER = [217, 119, 6];
const SLATE = [71, 85, 105];
const LIGHT = [248, 250, 252];
const GRID = [226, 232, 240];
const GREEN = [5, 150, 105];

function setFont(doc, bold = false, size = 9, color = NAVY) {
  doc.setFont("DejaVuSans", bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function addPageHeader(doc, title = "DMAT Dijital Olgunluk Değerlendirme Raporu") {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setFillColor(...BLUE);
  doc.rect(0, 18, PAGE_W, 1, "F");
  setFont(doc, true, 9, [255, 255, 255]);
  doc.text(title, M, 11.5);
  return 28;
}

function ensureSpace(doc, y, need = 25) {
  if (y + need <= PAGE_H - 18) return y;
  doc.addPage();
  return addPageHeader(doc);
}

function paragraph(doc, text, y, opts = {}) {
  const { x = M, width = CONTENT_W, size = 8.3, lineHeight = 4.2, bold = false, color = SLATE } = opts;
  setFont(doc, bold, size, color);
  const lines = doc.splitTextToSize(String(text || ""), width);
  lines.forEach((line, i) => doc.text(line, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

function sectionTitle(doc, title, y) {
  y = ensureSpace(doc, y, 16);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(M, y, CONTENT_W, 11, 2, 2, "F");
  doc.setFillColor(...BLUE);
  doc.rect(M, y, 2.3, 11, "F");
  setFont(doc, true, 10, NAVY);
  doc.text(title, M + 6, y + 7.2);
  return y + 16;
}

function kv(doc, label, value, x, y, width) {
  setFont(doc, true, 7.2, SLATE);
  doc.text(label, x, y);
  setFont(doc, false, 8.3, NAVY);
  const lines = doc.splitTextToSize(value || "—", width);
  lines.slice(0, 2).forEach((line, i) => doc.text(line, x, y + 4.2 + i * 4));
}

function drawDimensionBars(doc, scores, y) {
  for (const d of DMAT_DIMENSIONS) {
    y = ensureSpace(doc, y, 20);
    const score = scores[d.id];
    const interp = dimensionInterpretation(d.id, score);
    setFont(doc, true, 8.5, NAVY);
    doc.text(`${d.no}. ${d.title}`, M, y);
    setFont(doc, true, 8.5, BLUE);
    doc.text(`${score.toFixed(1)} / 100`, PAGE_W - M, y, { align: "right" });
    y += 3;
    doc.setFillColor(235, 239, 244);
    doc.roundedRect(M, y, CONTENT_W, 4, 2, 2, "F");
    doc.setFillColor(...BLUE);
    doc.roundedRect(M, y, CONTENT_W * (Math.max(0, Math.min(100, score)) / 100), 4, 2, 2, "F");
    y += 8;
    setFont(doc, true, 7.2, SLATE);
    doc.text(`${interp.level.name} · ${interp.level.official}`, M, y);
    y += 4;
    y = paragraph(doc, interp.text, y, { size: 7.5, lineHeight: 3.8, color: SLATE });
    y += 4;
  }
  return y;
}

function questionRows(result) {
  return [
    ["Q1a", "Halihazırda dijital yatırım", result.questionScores.q1Invested],
    ["Q1b", "Planlanan dijital yatırım", result.questionScores.q1Planned],
    ["Q2", "Dijitalleşmeye hazırlık", result.questionScores.q2],
    ["Q3", "Kullanılan dijital çözümler", result.questionScores.q3],
    ["Q4", "Gelişmiş dijital teknolojiler", result.questionScores.q4],
    ["Q5", "Yeniden beceri / yetkinlik", result.questionScores.q5],
    ["Q6", "Personel katılımı ve destek", result.questionScores.q6],
    ["Q7", "Veri yönetimi", result.questionScores.q7],
    ["Q8", "Veri güvenliği", result.questionScores.q8],
    ["Q9", "Otomasyon ve yapay zekâ", result.questionScores.q9],
    ["Q10", "Dijital teknolojilerle sürdürülebilirlik", result.questionScores.q10],
    ["Q11", "Dijital seçimlerde çevresel etki", result.questionScores.q11],
  ];
}

function multiAnswerText(qid, answers) {
  const q = QUESTIONS[qid];
  const value = answers[qid];
  if (value?.none) return "Yukarıdakilerin hiçbiri";
  if (!value?.selected?.length) return "Yanıt yok";
  return value.selected.map((i) => q.items[i]).join(" • ");
}

function scaleAnswerLines(qid, answers) {
  const q = QUESTIONS[qid];
  return q.items.map((item, i) => `${i + 1}. ${item}: ${answers[qid][i]} — ${SCALE_0_5[answers[qid][i]]}`);
}

function partialAnswerLines(answers) {
  const labels = ["Hayır", "Kısmen", "Evet"];
  return QUESTIONS.q11.items.map((item, i) => `${i + 1}. ${item}: ${labels[answers.q11[i]]}`);
}

function addResponseBlock(doc, title, lines, y) {
  y = ensureSpace(doc, y, 20);
  setFont(doc, true, 8.2, NAVY);
  doc.text(title, M, y);
  y += 5;
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, CONTENT_W - 4);
    y = ensureSpace(doc, y, wrapped.length * 3.8 + 4);
    setFont(doc, false, 7.2, SLATE);
    wrapped.forEach((l, i) => doc.text(l, M + 3, y + i * 3.8));
    y += wrapped.length * 3.8 + 2;
  }
  doc.setDrawColor(...GRID);
  doc.line(M, y, PAGE_W - M, y);
  return y + 5;
}

function addFooters(doc) {
  const count = doc.getNumberOfPages();
  for (let i = 1; i <= count; i++) {
    doc.setPage(i);
    doc.setDrawColor(...GRID);
    doc.line(M, PAGE_H - 12, PAGE_W - M, PAGE_H - 12);
    setFont(doc, false, 6.5, SLATE);
    doc.text("Çorlu Ticaret ve Sanayi Odası · EDIH / DMAT", M, PAGE_H - 7);
    doc.text(`Sayfa ${i} / ${count}`, PAGE_W - M, PAGE_H - 7, { align: "right" });
  }
}

export async function generatePdfReport({ profile, answers, result }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await ensureFontsLoaded(doc);
  const logo = await loadLogo();

  // KAPAK
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 7, PAGE_H, "F");
  if (logo) {
    try { doc.addImage(logo, "PNG", M + 2, 18, 30, 30); } catch { /* no-op */ }
  }
  setFont(doc, true, 9, [147, 197, 253]);
  doc.text("EUROPEAN DIGITAL INNOVATION HUBS · DMAT", M + 2, 65);
  setFont(doc, true, 24, [255,255,255]);
  doc.text("Dijital Olgunluk", M + 2, 82);
  doc.text("Değerlendirme Raporu", M + 2, 94);
  setFont(doc, false, 9.5, [203,213,225]);
  doc.text("KOBİ'ler için Digital Maturity Assessment Tool (DMAT)", M + 2, 105);

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(M + 2, 127, CONTENT_W - 4, 47, 4, 4, "F");
  setFont(doc, true, 8, [148,163,184]);
  doc.text("İŞLETME", M + 9, 139);
  setFont(doc, true, 15, [255,255,255]);
  const firmLines = doc.splitTextToSize(profile.companyName || "İşletme", CONTENT_W - 22);
  firmLines.slice(0,2).forEach((line,i) => doc.text(line, M + 9, 149 + i * 7));
  setFont(doc, false, 8, [203,213,225]);
  doc.text(`Değerlendirme tarihi: ${profile.date || new Date().toLocaleDateString("tr-TR")}`, M + 9, 167);

  setFont(doc, true, 10, [255,255,255]);
  doc.text("DMAT Genel Skoru", M + 2, 203);
  setFont(doc, true, 38, [245, 158, 11]);
  doc.text(result.overall.toFixed(1), M + 2, 222);
  setFont(doc, true, 11, [203,213,225]);
  doc.text(`/ 100  ·  ${result.level.name} (${result.level.official})`, M + 45, 220);
  setFont(doc, false, 7.5, [148,163,184]);
  doc.text("Kaynak: European Commission JRC DMAT Framework & EDIH Network", M + 2, 272);

  // SAYFA 2 — ÖZET
  doc.addPage();
  let y = addPageHeader(doc);
  y = sectionTitle(doc, "1. İşletme Bilgileri", y);
  const colW = (CONTENT_W - 8) / 2;
  const fields = [
    ["İşletme", profile.companyName], ["Mali sicil / KDV", profile.fiscalNo],
    ["İrtibat kişisi", profile.contactName], ["Görevi", profile.role],
    ["E-posta", profile.email], ["Telefon", profile.phone],
    ["İnternet sitesi", profile.website], ["Çalışan sayısı", profile.staffSize],
    ["Kuruluş yılı", profile.foundationYear], ["Ülke", profile.country],
    ["Bölge (NUTS2)", profile.region], ["Posta kodu", profile.postalCode],
    ["Ana sektör", profile.primarySector], ["PIC", profile.pic],
  ];
  fields.forEach(([label, value], i) => {
    const x = M + (i % 2) * (colW + 8);
    const row = Math.floor(i / 2);
    kv(doc, label, value, x, y + row * 13, colW);
  });
  y += Math.ceil(fields.length / 2) * 13 + 4;
  y = paragraph(doc, `Diğer sektörler: ${[...(profile.secondarySectors || []), profile.otherSector].filter(Boolean).join(", ") || "—"}`, y, { size: 7.6 });
  y = paragraph(doc, `Açık adres: ${profile.address || "—"}`, y + 3, { size: 7.6 });

  y = sectionTitle(doc, "2. Genel DMAT Sonucu", y + 8);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(M, y, 56, 36, 3, 3, "F");
  setFont(doc, true, 7.5, SLATE);
  doc.text("GENEL SKOR", M + 7, y + 9);
  setFont(doc, true, 24, BLUE);
  doc.text(result.overall.toFixed(1), M + 7, y + 23);
  setFont(doc, true, 8, NAVY);
  doc.text(`${result.level.name} · ${result.level.official}`, M + 7, y + 31);
  y += 43;

  y = sectionTitle(doc, "3. Altı DMAT Boyutu", y);
  y = drawDimensionBars(doc, result.dimensionScores, y);

  // SORU SKORLARI
  doc.addPage();
  y = addPageHeader(doc);
  y = sectionTitle(doc, "4. DMAT Soru Puanları", y);
  for (const [code, label, score] of questionRows(result)) {
    y = ensureSpace(doc, y, 10);
    setFont(doc, true, 7.5, BLUE);
    doc.text(code, M, y);
    setFont(doc, false, 7.5, NAVY);
    doc.text(label, M + 17, y);
    setFont(doc, true, 7.5, NAVY);
    doc.text(`${score.toFixed(1)} / 10`, PAGE_W - M, y, { align: "right" });
    doc.setDrawColor(...GRID);
    doc.line(M, y + 3, PAGE_W - M, y + 3);
    y += 9;
  }
  y = paragraph(doc, "Not: Q1, resmi DMAT yönteminde iki ayrı alt-soru olarak ele alınır: halihazırda yatırım yapılan alanlar (Q1a) ve yatırım planlanan alanlar (Q1b).", y + 3, { size: 7.3, color: SLATE });

  // YANIT DÖKÜMÜ
  doc.addPage();
  y = addPageHeader(doc);
  y = sectionTitle(doc, "5. Yanıt Dökümü", y);
  const q1Lines = QUESTIONS.q1.items.map((item, i) => {
    const invested = answers.q1Invested.none ? "Hayır" : answers.q1Invested.selected.includes(i) ? "Evet" : "Hayır";
    const planned = answers.q1Planned.none ? "Hayır" : answers.q1Planned.selected.includes(i) ? "Evet" : "Hayır";
    return `${i + 1}. ${item} — Yatırım yapıldı: ${invested} | Planlanıyor: ${planned}`;
  });
  y = addResponseBlock(doc, "Q1 · Dijitalleşme yatırımı yapılan / planlanan iş alanları", q1Lines, y);
  for (const qid of ["q2","q3","q5","q6","q7","q8","q10"]) {
    const q = QUESTIONS[qid];
    const text = multiAnswerText(qid, answers);
    y = addResponseBlock(doc, `Q${q.no} · ${q.title}`, [text], y);
  }
  y = addResponseBlock(doc, "Q4 · Gelişmiş dijital teknolojiler (0–5)", scaleAnswerLines("q4", answers), y);
  y = addResponseBlock(doc, "Q9 · Otomasyon ve yapay zekâ (0–5)", scaleAnswerLines("q9", answers), y);
  y = addResponseBlock(doc, "Q11 · Dijital seçimlerde çevresel etkiler", partialAnswerLines(answers), y);

  // METODOLOJİ
  doc.addPage();
  y = addPageHeader(doc);
  y = sectionTitle(doc, "6. DMAT Metodolojisi", y);
  y = paragraph(doc, "Bu rapordaki değerlendirme yalnızca European Digital Innovation Hubs (EDIH) ağı için Avrupa Komisyonu Ortak Araştırma Merkezi (JRC) tarafından geliştirilen Digital Maturity Assessment (DMA/DMAT) çerçevesine dayanır.", y, { size: 8.2, lineHeight: 4.4 });
  y += 4;
  const method = [
    "Her boyut 0–100 aralığında, her soru 0–10 aralığında puanlanır.",
    "Bir soru içindeki öğeler eşit katkı verir; sorular kendi boyutlarına eşit katkı verir.",
    "0–5 ölçekli sorularda 0,1,2,3,4,5 değerleri sırasıyla 0, 0.2, 0.4, 0.6, 0.8, 1 ağırlıklarına dönüştürülür ve soru 0–10'a normalize edilir.",
    "Dijital İş Stratejisi boyutunda Q1'in iki sütunu (halihazırda yatırım / yatırım planı) ayrı alt-sorular gibi ele alınır ve Q2 ile birlikte boyut skorunu oluşturur.",
    "Dijital Hazırlıklılık, İnsan Odaklı Dijitalleşme, Veri Yönetimi ve Yeşil Dijitalleşme boyutlarında iki soru eşit ağırlıktadır.",
    "Otomasyon ve Yapay Zekâ boyutu yalnızca Q9 skorundan üretilir.",
    "Genel DMAT skoru altı boyut skorunun aritmetik ortalamasıdır.",
  ];
  for (const item of method) {
    y = ensureSpace(doc, y, 10);
    setFont(doc, true, 8, BLUE);
    doc.text("•", M, y);
    y = paragraph(doc, item, y, { x: M + 5, width: CONTENT_W - 5, size: 7.8, lineHeight: 4.1 });
    y += 2;
  }

  y = sectionTitle(doc, "7. Sonuç Seviyeleri", y + 5);
  const bands = [
    ["0–25", "Temel (Basic)"],
    ["26–50", "Ortalama (Average)"],
    ["51–75", "Orta İleri (Moderately advanced)"],
    ["76–100", "İleri (Advanced)"],
  ];
  for (const [range, label] of bands) {
    y = ensureSpace(doc, y, 9);
    setFont(doc, true, 8, BLUE);
    doc.text(range, M, y);
    setFont(doc, true, 8, NAVY);
    doc.text(label, M + 24, y);
    y += 8;
  }
  y = paragraph(doc, "JRC dokümanında Average 26–50 ve Moderately advanced 50–75 bantları 50 puanda çakışmaktadır. Bu yerel uygulamada tekil sınıflandırma için 50 puan Ortalama bandında tutulmuş; ham puanlama değiştirilmemiştir.", y + 2, { size: 7.1, color: SLATE });

  y = sectionTitle(doc, "8. Kaynaklar", y + 6);
  for (const source of DMAT_SOURCES) {
    y = ensureSpace(doc, y, 20);
    setFont(doc, true, 7.6, NAVY);
    const titleLines = doc.splitTextToSize(source.title, CONTENT_W);
    titleLines.forEach((line, i) => doc.text(line, M, y + i * 4));
    y += titleLines.length * 4 + 1;
    y = paragraph(doc, source.detail, y, { size: 7.1, lineHeight: 3.8, color: SLATE });
    setFont(doc, false, 6.4, BLUE);
    const urlLines = doc.splitTextToSize(source.url, CONTENT_W);
    urlLines.forEach((line, i) => doc.text(line, M, y + i * 3.4));
    y += urlLines.length * 3.4 + 5;
  }

  y = ensureSpace(doc, y, 28);
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(M, y, CONTENT_W, 23, 3, 3, "FD");
  setFont(doc, true, 7.5, [146, 64, 14]);
  doc.text("Uygulama notu", M + 5, y + 7);
  paragraph(doc, "Bu Çorlu TSO uygulaması resmî EDIH portalına otomatik veri göndermez ve portalın karşılaştırmalı benchmark havuzunun yerine geçmez. Soru seti ve puanlama DMAT metodolojisine göre yerel olarak uygulanır.", y + 12, { x: M + 5, width: CONTENT_W - 10, size: 6.8, lineHeight: 3.5, color: [120, 53, 15] });

  addFooters(doc);

  const safe = (profile.companyName || "isletme").replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]+/g, "-").replace(/^-|-$/g, "").slice(0,60);
  doc.save(`DMAT-${safe || "rapor"}-${profile.date || "degerlendirme"}.pdf`);
}
