import jsPDF from "jspdf";
import { AXES, LEVELS, levelFor, statusFor, axisLevelGuide } from "./data";

/* ---------------------------------------------------------------
   Yardımcılar
--------------------------------------------------------------- */

const INK = [27, 36, 48];
const STEEL = [78, 106, 122];
const BRASS = [181, 121, 58];
const GRID = [201, 195, 176];
const GREEN = [63, 110, 82];
const RED = [168, 68, 47];
const PAPER = [251, 250, 245];

function toneColor(tone) {
  if (tone === "low") return RED;
  if (tone === "mid") return BRASS;
  return GREEN;
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

function footer(doc, pageLabel) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...GRID);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 15, PAGE_W - MARGIN, PAGE_H - 15);
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...STEEL);
    doc.text("ÇORLU TSO — PROJE BİRİMİ · DİJİTAL OLGUNLUK ÖLÇÜM ARACI", MARGIN, PAGE_H - 10);
    doc.text(`${i} / ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
  }
}

function ensureSpace(doc, y, needed) {
  if (y + needed > PAGE_H - 22) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function heading(doc, text, y, size = 13) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(...INK);
  doc.text(text, MARGIN, y);
  return y + size * 0.5;
}

function paragraph(doc, text, y, opts = {}) {
  const { size = 9.5, color = [58, 66, 80], lineHeight = 4.6, width = CONTENT_W } = opts;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, width);
  lines.forEach((line, i) => {
    doc.text(line, MARGIN, y + i * lineHeight);
  });
  return y + lines.length * lineHeight;
}

/* ---------------------------------------------------------------
   Vektör radar grafiği (ekrandaki ile aynı matematik)
--------------------------------------------------------------- */

function drawRadar(doc, scores, cx, cy, maxR) {
  const n = AXES.length;
  const pointAt = (i, r) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  // ızgara halkaları
  [1, 2, 3, 4, 5].forEach((ring) => {
    doc.setDrawColor(...GRID);
    doc.setLineWidth(ring === 5 ? 0.35 : 0.2);
    const pts = AXES.map((_, i) => pointAt(i, (ring / 5) * maxR));
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % n];
      doc.line(x1, y1, x2, y2);
    }
  });

  // eksen çizgileri
  doc.setDrawColor(...GRID);
  doc.setLineWidth(0.2);
  AXES.forEach((_, i) => {
    const [x, y] = pointAt(i, maxR);
    doc.line(cx, cy, x, y);
  });

  // veri poligonu
  const dataPts = AXES.map((a, i) => pointAt(i, (scores[a.id] / 5) * maxR));
  doc.setDrawColor(...BRASS);
  doc.setLineWidth(0.6);
  doc.setFillColor(...BRASS);
  for (let i = 0; i < n; i++) {
    const [x1, y1] = dataPts[i];
    const [x2, y2] = dataPts[(i + 1) % n];
    doc.line(x1, y1, x2, y2);
  }
  dataPts.forEach(([x, y]) => {
    doc.circle(x, y, 1.3, "F");
  });

  // eksen etiketleri
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  AXES.forEach((a, i) => {
    const [x, y] = pointAt(i, maxR + 12);
    doc.text(a.short.toUpperCase(), x, y, { align: "center" });
  });
}

/* ---------------------------------------------------------------
   Ana rapor oluşturucu
--------------------------------------------------------------- */

export function generatePdfReport({ firmName, scores, overall, answers }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const level = levelFor(overall);
  const weakAxes = AXES.filter((a) => scores[a.id] > 0 && scores[a.id] < 3).sort(
    (a, b) => scores[a.id] - scores[b.id]
  );
  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  /* ---- SAYFA 1 — Kapak / Genel Sonuç ---- */
  let y = MARGIN;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRASS);
  doc.text("ÇORLU TSO — PROJE BİRİMİ", MARGIN, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text("Dijital Olgunluk Değerlendirme Raporu", MARGIN, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...STEEL);
  doc.text(`${firmName ? firmName : "Firma adı belirtilmedi"}  ·  ${dateStr}`, MARGIN, y);
  y += 12;

  doc.setDrawColor(...GRID);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 12;

  // Genel puan bloğu
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.setTextColor(...BRASS);
  doc.text(overall.toFixed(2), MARGIN, y + 4);
  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...STEEL);
  doc.text("/ 5.00 — GENEL OLGUNLUK PUANI", MARGIN + 32, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(level.name, MARGIN + 32, y + 8);
  y += 18;
  y = paragraph(doc, level.desc, y, { size: 10, color: [58, 66, 80] });
  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRASS);
  const recLines = doc.splitTextToSize(`Öncelik: ${level.recommendation}`, CONTENT_W);
  doc.text(recLines, MARGIN, y);
  y += recLines.length * 4.6 + 6;

  y = heading(doc, "Bu Rapor Ne Anlama Geliyor?", y + 4);
  y += 3;
  y = paragraph(
    doc,
    "Bu rapor, firmanızın 6 eksende ve 30 soruda verdiği cevaplara dayanarak hazırlanmış bir " +
      "dijital olgunluk ön değerlendirmesidir. Puanlama, acatech Industrie 4.0 Maturity Index'in " +
      "6 aşamalı yapısına (Bilgisayarlaşma → Bağlanabilirlik → Görünürlük → Şeffaflık → Öngörü " +
      "Yeteneği → Uyarlanabilirlik) uyarlanmıştır. Ayrıntılı yöntem ve kaynakça bu raporun son " +
      "sayfasında yer almaktadır.",
    y
  );
  y += 10;

  y = heading(doc, "Genel Olgunluk Skalası", y);
  y += 5;
  LEVELS.forEach((l) => {
    const isCurrent = l.name === level.name;
    doc.setFont("helvetica", isCurrent ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(isCurrent ? BRASS : STEEL));
    doc.text(`${isCurrent ? "▶" : "·"}  ${l.name}`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.3);
    doc.setTextColor(...(isCurrent ? [58, 66, 80] : GRID));
    doc.text(l.desc, MARGIN + 42, y);
    y += 6;
  });

  /* ---- SAYFA 2 — Radar + Eksen Tablosu ---- */
  doc.addPage();
  y = MARGIN;
  y = heading(doc, "Eksen Bazlı Sonuçlar", y, 15);
  y += 4;
  y = paragraph(
    doc,
    "Aşağıdaki grafik, 6 değerlendirme ekseninde alınan puanları (1–5 arası) görselleştirir. " +
      "Merkeze yakın değerler gelişim ihtiyacını, dış halkaya yakın değerler olgunluğu gösterir.",
    y
  );
  y += 8;

  const radarCy = y + 40;
  drawRadar(doc, scores, PAGE_W / 2, radarCy, 34);
  y = radarCy + 46;

  y = heading(doc, "Eksen Detayları", y, 12);
  y += 6;

  AXES.forEach((a) => {
    y = ensureSpace(doc, y, 32);
    const s = scores[a.id];
    const st = statusFor(s);
    const guide = axisLevelGuide(a, s);
    const color = toneColor(st.tone);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(`${a.no}  ${a.title}`, MARGIN, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(`${s.toFixed(2)} / 5.00`, PAGE_W - MARGIN, y, { align: "right" });
    y += 4.5;

    // skor çubuğu
    const barW = CONTENT_W;
    doc.setFillColor(...GRID);
    doc.rect(MARGIN, y, barW, 2, "F");
    doc.setFillColor(...color);
    doc.rect(MARGIN, y, barW * (s / 5), 2, "F");
    y += 5.5;

    doc.setFont("courier", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(...color);
    doc.text(`SEVİYE ${guide.level} — ${guide.name.toUpperCase()}  ·  ${a.framework}`, MARGIN, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...[58, 66, 80]);
    const descLines = doc.splitTextToSize(guide.description, CONTENT_W);
    doc.text(descLines, MARGIN, y);
    y += descLines.length * 4.2 + 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(...INK);
    const actionLines = doc.splitTextToSize(`Önerilen adım: ${guide.action}`, CONTENT_W);
    doc.text(actionLines, MARGIN, y);
    y += actionLines.length * 4.2 + 7;
  });

  /* ---- SAYFA 3 — Öneriler ve Sonraki Adım ---- */
  doc.addPage();
  y = MARGIN;
  y = heading(doc, "Öncelikli Gelişim Alanları ve Öneriler", y, 15);
  y += 4;

  if (weakAxes.length > 0) {
    y = paragraph(
      doc,
      "Aşağıdaki eksenlerde puanınız 3.00'ün altında kaldığı için öncelikli gelişim alanı " +
        "olarak işaretlenmiştir. Her biri için size uygun bir destek/danışmanlık kaynağı önerilmiştir.",
      y
    );
    y += 8;

    weakAxes.forEach((a) => {
      y = ensureSpace(doc, y, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(`${a.no}  ${a.title}`, MARGIN, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...BRASS);
      doc.text(`→  ${a.resource.name}`, MARGIN, y);
      y += 4.5;
      if (a.resource.url) {
        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...STEEL);
        doc.textWithLink(a.resource.url, MARGIN, y, { url: a.resource.url });
        y += 4.5;
      }
      y += 4;
    });
  } else {
    y = paragraph(
      doc,
      "Değerlendirilen hiçbir eksende 3.00 puanının altında kalınmadı — firmanız genel olarak " +
        "sağlıklı bir dijital olgunluk seviyesinde. Yine de Çorlu TSO Proje Birimi ile birlikte " +
        "sonraki adımları planlamak faydalı olacaktır.",
      y
    );
    y += 10;
  }

  y = ensureSpace(doc, y, 40);
  y += 6;
  doc.setDrawColor(...GRID);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;

  y = heading(doc, "Destek Programları", y, 13);
  y += 4;
  y = paragraph(
    doc,
    "Aşağıdaki resmi destek programları, dijital dönüşüm sürecinizde başvurabileceğiniz " +
      "bağımsız kaynaklardır:",
    y
  );
  y += 5;
  [
    ["TÜBİTAK TÜSSİDE D3A / DDX Modeli", "https://ddxmodel.tubitak.gov.tr"],
    ["EDIH Open DMAT (Avrupa Komisyonu)", "https://european-digital-innovation-hubs.ec.europa.eu"],
    ["KOSGEB Dijital Dönüşüm Danışmanlığı Desteği", "https://www.kosgeb.gov.tr"],
  ].forEach(([name, url]) => {
    y = ensureSpace(doc, y, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(`•  ${name}`, MARGIN, y);
    y += 4.3;
    doc.setFont("courier", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(...STEEL);
    doc.textWithLink(url, MARGIN + 4, y, { url });
    y += 6;
  });
  y += 4;

  y = ensureSpace(doc, y, 30);
  y = heading(doc, "Ücretsiz Eğitimler", y, 13);
  y += 4;
  y = paragraph(
    doc,
    "Çorlu TSO'nun Dijital Dönüşüm, Yapay Zeka ve Dijitalleşme konularındaki ücretsiz " +
      "eğitimlerinden haberdar olmak için değerlendirme web sayfasındaki kayıt formunu " +
      "doldurabilirsiniz.",
    y
  );

  /* ---- SAYFA 4 — Metodoloji ---- */
  doc.addPage();
  y = MARGIN;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRASS);
  doc.text("METODOLOJİ", MARGIN, y);
  y += 7;
  y = heading(doc, "Bu Değerlendirmenin Bilimsel Dayanağı", y, 15);
  y += 5;

  y = paragraph(
    doc,
    "Bu araç, Çorlu TSO Proje Birimi tarafından özgün olarak geliştirilmiştir. Herhangi bir " +
      "ticari veya akademik aracın birebir kopyası değildir — aşağıda listelenen uluslararası " +
      "kabul görmüş dijital olgunluk çerçevelerinin kavramsal yapısından esinlenerek tasarlanmış, " +
      "KOBİ'lere yönelik hafif bir ön-tarama (self-assessment) aracıdır.",
    y
  );
  y += 8;

  const frameworks = [
    [
      "1. acatech Industrie 4.0 Maturity Index",
      "Almanya Ulusal Bilim ve Mühendislik Akademisi (Schuh vd., 2020). Kaynaklar, Bilgi " +
        "Sistemleri, Organizasyonel Yapı ve Kültür olmak üzere 4 yapısal alanda, 6 aşamalı bir " +
        "olgunluk modeli sunar. Aracımızın genel olgunluk seviyeleri bu yapıdan uyarlanmıştır.",
    ],
    [
      "2. MIT Center for Digital Business & Capgemini — Digital Maturity Model",
      "Westerman, Bonnet & McAfee (2014), \"Leading Digital\", Harvard Business Review Press. " +
        "Dijital Yoğunluk ile Dönüşüm Yönetimi Yoğunluğu'nun birlikte ölçülmesi ilkesi, Dijital " +
        "Yetkinlik ve İnsan Kaynağı eksenimize yansıtılmıştır.",
    ],
    [
      "3. Avrupa Komisyonu EDIH Ağı — Open DMAT",
      "Digital Maturity Assessment Tool for SMEs. Dijital İş Stratejisi, Dijital Hazırlık, İnsan " +
        "Odaklı Dijitalleşme, Veri Yönetimi, Otomasyon & YZ ve Yeşil Dijitalleşme eksenlerini " +
        "kapsar; aracımızın 6 ekseni bu yapıyla kavramsal olarak örtüşür.",
    ],
    [
      "4. Capability Maturity Model (CMMI Institute / SEI, Carnegie Mellon Üniversitesi)",
      "Kademeli olgunluk seviyesiyle süreç değerlendirme metodolojisinin genel bilimsel " +
        "temelini oluşturur; anket tabanlı öz-değerlendirme yaklaşımımız bu geleneği takip eder.",
    ],
  ];

  frameworks.forEach(([title, body]) => {
    y = ensureSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const titleLines = doc.splitTextToSize(title, CONTENT_W);
    doc.text(titleLines, MARGIN, y);
    y += titleLines.length * 4.4 + 1;
    y = paragraph(doc, body, y, { size: 8.6 });
    y += 6;
  });

  y = ensureSpace(doc, y, 40);
  y = heading(doc, "Yöntem", y, 12);
  y += 5;
  [
    "6 eksen, eksen başına 5 soru — toplam 30 soru",
    "Her soru 1 (hiç yok) – 5 (tam entegre) arası Likert ölçeğiyle yanıtlanır",
    "Eksen puanı: o eksendeki soruların aritmetik ortalaması",
    "Genel olgunluk puanı: 6 eksen puanının eşit ağırlıklı ortalaması",
    "Genel puan, acatech'in 6 aşamalı modeline uyarlanmış bir ölçekle yorumlanır",
    "Eksen bazlı yönlendirme: her eksenin puanı CMMI'ın 5 seviyeli olgunluk merdivenine (Başlangıç→Tekrarlanabilir→Tanımlı→Ölçülüyor→Optimize) göre yorumlanır",
  ].forEach((line) => {
    y = ensureSpace(doc, y, 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...[58, 66, 80]);
    doc.text(`•  ${line}`, MARGIN, y);
    y += 5;
  });
  y += 5;

  y = ensureSpace(doc, y, 30);
  y = heading(doc, "Sınırlamalar", y, 12);
  y += 5;
  y = paragraph(
    doc,
    "Şeffaflık gereği belirtilmelidir: bu bir öz-beyan (self-report) anketidir, üçüncü taraf " +
      "doğrulaması içermez. Sertifikalı bir değerlendirme değildir — TÜBİTAK TÜSSİDE D3A/DDX " +
      "veya EDIH Open DMAT gibi resmi araçların yerine geçmez; onlara ön hazırlık niteliğindedir.",
    y,
    { size: 8.8 }
  );
  y += 10;

  y = ensureSpace(doc, y, 40);
  y = heading(doc, "Kaynakça", y, 12);
  y += 5;
  [
    "Schuh, G., Anderl, R., Gausemeier, J., ten Hompel, M., & Wahlster, W. (Eds.). (2020). Industrie 4.0",
    "Maturity Index: Managing the Digital Transformation of Companies. acatech STUDY. Munich: Herbert Utz Verlag.",
    "Westerman, G., Bonnet, D., & McAfee, A. (2014). Leading Digital: Turning Technology into",
    "Business Transformation. Harvard Business Review Press.",
    "Westerman, G., Bonnet, D., & McAfee, A. (2014). The Nine Elements of Digital Transformation.",
    "MIT Sloan Management Review.",
    "European Commission, European Digital Innovation Hubs Network — Digital Maturity",
    "Assessment Tool (Open DMAT) for SMEs.",
    "CMMI Institute / SEI, Carnegie Mellon University — Capability Maturity Model",
    "Integration (jenerik 5 seviyeli olgunluk kademelendirmesi).",
  ].forEach((line) => {
    y = ensureSpace(doc, y, 5);
    doc.setFont("courier", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(...STEEL);
    doc.text(line, MARGIN, y);
    y += 4;
  });

  footer(doc);

  const safeName = (firmName || "firma").replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\- ]/g, "").trim() || "firma";
  doc.save(`corlu-tso-dijital-olgunluk-${safeName}.pdf`);
}
