import React, { useState, useMemo } from "react";
import { ArrowRight, ArrowLeft, RotateCcw, ExternalLink, CircleCheck, X, Download, GraduationCap } from "lucide-react";
import { saveAssessment, saveTrainingSignup } from "./lib/supabaseClient";
import { notifyTrainingSignup } from "./lib/emailNotify";
import { AXES, SCALE_LABELS, LEVELS, levelFor, statusFor, axisLevelGuide } from "./lib/data";
import { generatePdfReport } from "./lib/pdfReport";


/* ---------------------------------------------------------------
   RADAR / GAUGE GÖRSELLERİ
--------------------------------------------------------------- */

function RadarChart({ scores }) {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 118;
  const n = AXES.length;

  const pointAt = (i, r) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const rings = [1, 2, 3, 4, 5];
  const dataPoints = AXES.map((a, i) => pointAt(i, (scores[a.id] / 5) * maxR));
  const dataPath = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 380, display: "block", margin: "0 auto" }}>
      {rings.map((r) => {
        const pts = AXES.map((_, i) => pointAt(i, (r / 5) * maxR).join(",")).join(" ");
        return (
          <polygon
            key={r}
            points={pts}
            fill="none"
            stroke="var(--grid)"
            strokeWidth={r === 5 ? 1.2 : 0.7}
            strokeDasharray={r === 5 ? "0" : "2,3"}
          />
        );
      })}
      {AXES.map((a, i) => {
        const [x, y] = pointAt(i, maxR);
        return <line key={a.id} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--grid)" strokeWidth="0.7" />;
      })}
      <polygon points={dataPath} fill="var(--brass)" fillOpacity="0.22" stroke="var(--brass)" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="var(--brass)" stroke="var(--paper)" strokeWidth="1.5" />
      ))}
      {AXES.map((a, i) => {
        const [x, y] = pointAt(i, maxR + 30);
        return (
          <text
            key={a.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="11"
            fill="var(--ink)"
            fontWeight="600"
          >
            {a.short.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

function Gauge({ value }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 88;
  const startAngle = -180;
  const endAngle = 0;
  const pct = Math.max(0, Math.min(1, (value - 1) / 4));
  const needleAngle = startAngle + pct * (endAngle - startAngle);

  const polar = (angleDeg, radius) => {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };

  const arcPath = (a0, a1, radius) => {
    const [x0, y0] = polar(a0, radius);
    const [x1, y1] = polar(a1, radius);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`;
  };

  const ticks = [1, 2, 3, 4, 5];
  const [nx, ny] = polar(needleAngle, r - 14);

  return (
    <svg viewBox={`0 0 ${size} ${size * 0.62}`} width="100%" style={{ maxWidth: 260, display: "block", margin: "0 auto" }}>
      <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="var(--grid)" strokeWidth="10" strokeLinecap="round" />
      <path
        d={arcPath(startAngle, needleAngle, r)}
        fill="none"
        stroke="var(--brass)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {ticks.map((t) => {
        const a = startAngle + ((t - 1) / 4) * (endAngle - startAngle);
        const [x1, y1] = polar(a, r + 9);
        const [x2, y2] = polar(a, r + 17);
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="1.5" />;
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="var(--ink)" />
      <text
        x={cx}
        y={cy - 34}
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="30"
        fontWeight="700"
        fill="var(--ink)"
      >
        {value.toFixed(2)}
      </text>
    </svg>
  );
}

/* ---------------------------------------------------------------
   METODOLOJİ İÇERİĞİ
--------------------------------------------------------------- */

function MethodologyModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: "rgba(27,36,48,0.55)" }}
      onClick={onClose}
    >
      <div
        className="dmat-card p-6 max-w-2xl w-full"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="dmat-mono text-xs mb-1" style={{ color: "var(--brass)" }}>METODOLOJİ</div>
            <div className="dmat-display text-lg font-semibold">Bu Değerlendirmenin Bilimsel Dayanağı</div>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="text-sm space-y-4 leading-relaxed" style={{ color: "#3A4250" }}>
          <p>
            Bu araç, Çorlu Ticaret ve Sanayi Odası tarafından özgün olarak geliştirilmiştir.
            Herhangi bir ticari veya akademik aracın birebir kopyası değildir — aşağıda
            listelenen uluslararası kabul görmüş dijital olgunluk çerçevelerinin
            kavramsal yapısından esinlenerek tasarlanmış, KOBİ'lere yönelik hafif bir
            <strong> ön-tarama (self-assessment) aracıdır.</strong>
          </p>

          <div>
            <div className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Referans Alınan Çerçeveler</div>
            <ul className="space-y-2.5 list-none">
              <li>
                <strong>1. acatech Industrie 4.0 Maturity Index</strong> — Almanya Ulusal Bilim
                ve Mühendislik Akademisi (Schuh vd., 2017/2020). Kaynaklar, Bilgi Sistemleri,
                Organizasyonel Yapı ve Kültür olmak üzere 4 yapısal alanda, 6 aşamalı
                (Bilgisayarlaşma → Bağlanabilirlik → Görünürlük → Şeffaflık → Öngörü
                Yeteneği → Uyarlanabilirlik) bir olgunluk modeli sunar. Aracımızın genel
                olgunluk seviyeleri bu 6 aşamalı yapıdan uyarlanmıştır.
              </li>
              <li>
                <strong>2. MIT Center for Digital Business & Capgemini — Digital Maturity Model</strong> —
                Westerman, Bonnet & McAfee (2014), <em>"Leading Digital"</em>, Harvard Business
                Review Press. Dijital Yoğunluk ile Dönüşüm Yönetimi Yoğunluğu'nun birlikte
                ölçülmesi gerektiği ilkesi, aracımızın Dijital Yetkinlik ve İnsan Kaynağı
                eksenine yansıtılmıştır.
              </li>
              <li>
                <strong>3. Avrupa Komisyonu EDIH Ağı — Open DMAT</strong> (Digital Maturity
                Assessment Tool for SMEs). Dijital İş Stratejisi, Dijital Hazırlık, İnsan
                Odaklı Dijitalleşme, Veri Yönetimi, Otomasyon & Yapay Zeka ve Yeşil
                Dijitalleşme eksenlerini kapsar; aracımızın 6 ekseni kavramsal olarak bu
                yapıyla örtüşecek şekilde tasarlanmıştır.
              </li>
              <li>
                <strong>4. Capability Maturity Model (CMMI Institute / SEI, Carnegie Mellon
                Üniversitesi)</strong> — Kademeli olgunluk seviyesiyle süreç değerlendirme
                metodolojisinin genel bilimsel temelini oluşturur; anket tabanlı
                öz-değerlendirme yaklaşımımız bu geleneği takip eder.
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Yöntem</div>
            <ul className="space-y-1.5 list-none">
              <li>• 6 eksen, eksen başına 5 soru — toplam 30 soru</li>
              <li>• Her soru 1 (hiç yok) – 5 (tam entegre) arası Likert ölçeğiyle yanıtlanır</li>
              <li>• Eksen puanı: o eksendeki soruların aritmetik ortalaması</li>
              <li>• Genel olgunluk puanı: 6 eksen puanının eşit ağırlıklı ortalaması (şeffaflık için ek ağırlıklandırma yapılmamıştır)</li>
              <li>• Genel puan, acatech'in 6 aşamalı modeline uyarlanmış bir ölçekle yorumlanır</li>
              <li>
                • <strong>Eksen bazlı yönlendirme:</strong> her eksenin 1-5 puanı, CMMI
                (Capability Maturity Model Integration, SEI / Carnegie Mellon Üniversitesi)
                tarafından yaygınlaştırılan jenerik 5 seviyeli olgunluk kademelendirmesine
                (Başlangıç → Tekrarlanabilir → Tanımlı → Ölçülüyor → Optimize Ediliyor) göre
                en yakın tam sayıya yuvarlanarak yorumlanır ve her seviye için somut bir
                aksiyon önerisi sunulur.
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Sınırlamalar</div>
            <p>
              Şeffaflık gereği belirtilmelidir: bu bir <strong>öz-beyan (self-report)</strong>{" "}
              anketidir, üçüncü taraf doğrulaması içermez. Sertifikalı bir değerlendirme
              değildir — TÜBİTAK TÜSSİDE D3A/DDX veya EDIH Open DMAT gibi resmi araçların
              yerine geçmez; onlara <strong>ön hazırlık</strong> niteliğindedir. Sonuçlar,
              cevap veren kişinin firma hakkındaki bilgi düzeyine bağlıdır.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Kaynakça</div>
            <ul className="space-y-1.5 list-none dmat-mono text-xs" style={{ color: "var(--steel)" }}>
              <li>Schuh, G., Anderl, R., Gausemeier, J., ten Hompel, M., & Wahlster, W. (Eds.). (2020). Industrie 4.0 Maturity Index: Managing the Digital Transformation of Companies. acatech STUDY. Munich: Herbert Utz Verlag.</li>
              <li>Westerman, G., Bonnet, D., & McAfee, A. (2014). Leading Digital: Turning Technology into Business Transformation. Harvard Business Review Press.</li>
              <li>Westerman, G., Bonnet, D., & McAfee, A. (2014). The Nine Elements of Digital Transformation. MIT Sloan Management Review.</li>
              <li>European Commission, European Digital Innovation Hubs Network — Digital Maturity Assessment Tool (Open DMAT) for SMEs.</li>
              <li>CMMI Institute / Software Engineering Institute, Carnegie Mellon University — CMMI Capability Maturity Model Integration (jenerik 5 seviyeli olgunluk kademelendirmesi).</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="dmat-btn-primary px-5 py-2.5 text-sm font-medium mt-6"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DESTEK PROGRAMLARI — sade, yorumsuz liste
--------------------------------------------------------------- */

const SUPPORT_PROGRAMS = [
  { name: "TÜBİTAK TÜSSİDE D3A / DDX Modeli", url: "https://ddxmodel.tubitak.gov.tr" },
  { name: "EDIH Open DMAT (Avrupa Komisyonu)", url: "https://european-digital-innovation-hubs.ec.europa.eu" },
  { name: "KOSGEB Dijital Dönüşüm Danışmanlığı Desteği", url: "https://www.kosgeb.gov.tr" },
];

/* ---------------------------------------------------------------
   ANA UYGULAMA
--------------------------------------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | quiz | results
  const [firmName, setFirmName] = useState("");
  const [axisIndex, setAxisIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const [showConsentText, setShowConsentText] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [trainingEmail, setTrainingEmail] = useState("");
  const [trainingPhone, setTrainingPhone] = useState("");
  const [trainingState, setTrainingState] = useState("idle"); // idle | saving | saved | error
  const [pdfState, setPdfState] = useState("idle"); // idle | generating | error

  const currentAxis = AXES[axisIndex];
  const answeredCount = currentAxis.questions.filter((_, qi) => answers[`${currentAxis.id}-${qi}`]).length;
  const axisComplete = answeredCount === currentAxis.questions.length;

  const scores = useMemo(() => {
    const result = {};
    AXES.forEach((a) => {
      const vals = a.questions.map((_, qi) => answers[`${a.id}-${qi}`]).filter(Boolean);
      result[a.id] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    });
    return result;
  }, [answers]);

  const overall = useMemo(() => {
    const vals = Object.values(scores);
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  }, [scores]);

  const level = levelFor(overall);

  const setAnswer = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [`${currentAxis.id}-${qIndex}`]: value }));
  };

  const goNextAxis = () => {
    if (axisIndex < AXES.length - 1) {
      setAxisIndex(axisIndex + 1);
    } else {
      setScreen("results");
      setSaveState("saving");
      saveAssessment({
        firmName: firmName || null,
        answers,
        scores,
        overall,
        levelName: level.name,
        consent: true,
      })
        .then((ok) => setSaveState(ok ? "saved" : "error"))
        .catch(() => setSaveState("error"));
    }
  };
  const goPrevAxis = () => {
    if (axisIndex > 0) setAxisIndex(axisIndex - 1);
  };

  const restart = () => {
    setAnswers({});
    setAxisIndex(0);
    setFirmName("");
    setConsent(false);
    setSaveState("idle");
    setTrainingEmail("");
    setTrainingPhone("");
    setTrainingState("idle");
    setScreen("intro");
  };

  const weakAxes = AXES.filter((a) => scores[a.id] > 0 && scores[a.id] < 3).sort(
    (a, b) => scores[a.id] - scores[b.id]
  );

  return (
    <div style={{ "--ink": "#1B2430", "--paper": "#F7F7F4", "--paper2": "#EFEFEA", "--brass": "#B5793A", "--steel": "#5B6672", "--grid": "#E2E1DB", "--red": "#A8442F", "--green": "#3F6E52" }}
      className="w-full min-h-screen flex items-center justify-center"
    >
      <style>{`
        .dmat-root { font-family: 'Inter', -apple-system, sans-serif; background: var(--paper); color: var(--ink); font-size: 16px; line-height: 1.55; }
        .dmat-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.01em; }
        .dmat-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em; }
        .dmat-card { background: #FFFFFF; border: 1px solid var(--grid); border-radius: 12px; box-shadow: 0 1px 3px rgba(27,36,48,0.05); }
        .dmat-btn-primary { background: var(--ink); color: #fff; border-radius: 8px; font-weight: 600; }
        .dmat-btn-primary:hover { background: #2A3546; }
        .dmat-btn-primary:disabled { background: var(--grid); color: #9A9A92; cursor: not-allowed; }
        .dmat-btn-brass { background: var(--brass); color: #fff; border-radius: 8px; font-weight: 600; }
        .dmat-btn-brass:hover { background: #9E6530; }
        .dmat-btn-ghost { border: 1px solid var(--grid); color: var(--ink); background: #fff; border-radius: 8px; font-weight: 500; }
        .dmat-btn-ghost:hover { background: var(--paper2); border-color: var(--steel); }
        .dmat-tick { border: 1px solid var(--grid); background: #fff; border-radius: 7px; transition: all .15s ease; font-weight: 600; }
        .dmat-tick:hover { border-color: var(--brass); }
        .dmat-tick.active { background: var(--brass); border-color: var(--brass); color: white; }
        .dmat-tab { border: 1px solid var(--grid); font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; border-radius: 6px; background: #fff; }
        .dmat-tab.done { background: var(--ink); color: #fff; border-color: var(--ink); }
        .dmat-tab.current { border-color: var(--brass); border-width: 2px; }
      `}</style>

      <div className="dmat-root w-full min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-6 sm:py-8">

          {/* HEADER */}
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 pb-4" style={{ borderBottom: "1px solid var(--grid)" }}>
            <div className="flex items-center gap-3">
              <img
                src="/ctso-logo.jpg"
                alt="Çorlu Ticaret ve Sanayi Odası"
                style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
              />
              <div>
                <div className="dmat-mono text-[11px]" style={{ color: "var(--steel)" }}>ÇORLU TİCARET VE SANAYİ ODASI</div>
                <div className="dmat-display text-lg sm:text-xl font-bold leading-tight">Dijital Olgunluk Ölçüm Aracı</div>
              </div>
            </div>
            {screen !== "intro" && (
              <div className="dmat-mono text-xs text-right flex-shrink-0" style={{ color: "var(--steel)" }}>
                {screen === "quiz" ? `EKSEN ${axisIndex + 1} / ${AXES.length}` : "SONUÇ RAPORU"}
              </div>
            )}
          </div>

          {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}

          {/* INTRO */}
          {screen === "intro" && (
            <div>
              <div className="dmat-mono text-xs mb-2.5" style={{ color: "var(--brass)" }}>ÖN DEĞERLENDİRME · ~12-15 DAKİKA</div>
              <h1 className="dmat-display text-3xl sm:text-4xl font-bold leading-[1.12] mb-3.5" style={{ letterSpacing: "-0.02em" }}>
                Firmanızın dijital olgunluk seviyesini ölçün.
              </h1>
              <p className="text-base leading-relaxed mb-5" style={{ color: "#3A4250", maxWidth: 560 }}>
                6 eksende, 30 soruluk kısa bir değerlendirme ile firmanızın dijital dönüşümde
                bulunduğu noktayı görün. Sonuçlar; hangi alanda güçlü, hangi alanda öncelikli
                gelişim ihtiyacı olduğunuzu gösterir ve size uygun destek programlarına
                yönlendirir.
              </p>

              {/* METODOLOJİ — en üstte, en görünür */}
              <button
                onClick={() => setShowMethodology(true)}
                className="block w-full text-left mb-4 group"
                style={{ maxWidth: 560 }}
              >
                <div
                  className="p-4 flex items-center gap-3.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(181,121,58,0.09), rgba(181,121,58,0.03))",
                    border: "1.5px solid var(--brass)",
                    borderRadius: 12,
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 38, height: 38, background: "var(--brass)", borderRadius: 9 }}
                  >
                    <GraduationCap size={19} color="#fff" />
                  </div>
                  <div className="flex-1">
                    <div className="dmat-mono text-[10.5px] font-semibold mb-0.5" style={{ color: "var(--brass)" }}>
                      BİLİMSEL METODOLOJİ VE KAYNAKÇA
                    </div>
                    <p className="text-sm leading-snug" style={{ color: "var(--ink)" }}>
                      acatech, MIT & Capgemini ve AB EDIH çerçevelerine dayanır — tam kaynakça için tıklayın →
                    </p>
                  </div>
                </div>
              </button>

              <div className="dmat-card p-4 mb-5" style={{ maxWidth: 560 }}>
                <div className="dmat-mono text-[10.5px] mb-2.5" style={{ color: "var(--steel)" }}>DEĞERLENDİRME EKSENLERİ</div>
                <div className="grid grid-cols-2 gap-2">
                  {AXES.map((a) => (
                    <div key={a.id} className="flex items-center gap-1.5 text-sm">
                      <span className="dmat-mono text-xs" style={{ color: "var(--brass)" }}>{a.no}</span>
                      <span>{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block mb-1.5 text-sm font-medium">Firma adı (opsiyonel)</label>
              <input
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Örn. ABC Makine Sanayi"
                className="w-full px-4 py-2.5 mb-4 text-sm outline-none"
                style={{ maxWidth: 460, background: "#fff", border: "1px solid var(--grid)", borderRadius: 8 }}
              />

              <label className="flex items-start gap-2.5 mb-4 cursor-pointer" style={{ maxWidth: 520 }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                  style={{ width: 17, height: 17, accentColor: "var(--brass)", flexShrink: 0 }}
                />
                <span className="text-sm leading-relaxed">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConsentText(true);
                    }}
                    className="underline font-medium"
                    style={{ color: "var(--steel)" }}
                  >
                    KVKK Aydınlatma Metni
                  </button>
                  'ni okudum, verilerimin bu amaçla işlenmesini kabul ediyorum.
                </span>
              </label>

              <div>
                <button
                  onClick={() => consent && setScreen("quiz")}
                  disabled={!consent}
                  className="dmat-btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
                >
                  Değerlendirmeye Başla <ArrowRight size={16} />
                </button>
              </div>

              <p className="dmat-mono text-[10.5px] mt-4" style={{ color: "var(--steel)", maxWidth: 480 }}>
                VERİ KULLANIMI: Cevaplarınız yalnızca firmanız için bu raporu oluşturmak ve
                size uygun destek programı önerilebilmesi için kullanılır.
              </p>
            </div>
          )}

          {/* KVKK MODAL */}
          {showConsentText && (
            <div
              className="fixed inset-0 flex items-center justify-center p-6 z-50"
              style={{ background: "rgba(27,36,48,0.55)" }}
              onClick={() => setShowConsentText(false)}
            >
              <div
                className="dmat-card p-6 max-w-lg w-full"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="dmat-display text-lg font-semibold">KVKK Aydınlatma Metni</div>
                  <button onClick={() => setShowConsentText(false)}><X size={18} /></button>
                </div>
                <div className="text-sm space-y-3 leading-relaxed" style={{ color: "#3A4250" }}>
                  <p>
                    <strong>Veri Sorumlusu:</strong> Çorlu Ticaret ve Sanayi Odası (Çorlu TSO), Tekirdağ.
                  </p>
                  <p>
                    <strong>İşlenen Veriler:</strong> Firma adı (opsiyonel) ve bu değerlendirme
                    formunda verdiğiniz cevaplar.
                  </p>
                  <p>
                    <strong>İşleme Amacı:</strong> Firmanızın dijital olgunluk seviyesini ölçmek,
                    size özel bir sonuç raporu oluşturmak ve Çorlu Ticaret ve Sanayi Odası'nın size uygun
                    destek programına (KOSGEB, EDIH, TÜBİTAK TÜSSİDE vb.) yönlendirme yapabilmesini
                    sağlamaktır.
                  </p>
                  <p>
                    <strong>Saklama Süresi:</strong> Veriler, yönlendirme ve takip süreci
                    tamamlanana kadar, en fazla 24 ay saklanır.
                  </p>
                  <p>
                    <strong>Paylaşım:</strong> Verileriniz yalnızca Çorlu Ticaret ve Sanayi Odası personeli
                    tarafından görülebilir; üçüncü kişi/kurumlarla yalnızca sizin açık isteğiniz
                    üzerine (ör. bir destek programına yönlendirme talebiniz olduğunda) paylaşılır.
                  </p>
                  <p>
                    <strong>Haklarınız:</strong> KVKK'nın 11. maddesi kapsamında verilerinize erişme,
                    düzeltme, silinmesini talep etme haklarına sahipsiniz. Talepleriniz için Çorlu
                    TSO Proje Birimi ile iletişime geçebilirsiniz.
                  </p>
                </div>
                <button
                  onClick={() => setShowConsentText(false)}
                  className="dmat-btn-primary px-5 py-2.5 text-sm font-medium mt-5"
                >
                  Anladım, Kapat
                </button>
              </div>
            </div>
          )}

          {/* QUIZ */}
          {screen === "quiz" && (
            <div>
              {/* axis tabs */}
              <div className="flex gap-1.5 mb-8 flex-wrap">
                {AXES.map((a, i) => {
                  const done = a.questions.every((_, qi) => answers[`${a.id}-${qi}`]);
                  return (
                    <div
                      key={a.id}
                      className={`dmat-tab px-2.5 py-1.5 ${done ? "done" : ""} ${i === axisIndex ? "current" : ""}`}
                    >
                      {a.no} {a.short}
                    </div>
                  );
                })}
              </div>

              <div className="dmat-mono text-xs mb-2" style={{ color: "var(--brass)" }}>EKSEN {currentAxis.no}</div>
              <h2 className="dmat-display text-3xl font-bold mb-2.5">{currentAxis.title}</h2>
              <p className="text-base mb-9" style={{ color: "#3A4250" }}>{currentAxis.intro}</p>

              <div className="space-y-8 mb-9">
                {currentAxis.questions.map((q, qi) => {
                  const val = answers[`${currentAxis.id}-${qi}`];
                  return (
                    <div key={qi}>
                      <p className="text-base mb-3.5 leading-relaxed font-medium">{q}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setAnswer(qi, v)}
                            className={`dmat-tick flex-1 py-3 text-sm ${val === v ? "active" : ""}`}
                            title={SCALE_LABELS[v - 1]}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between dmat-mono text-[10.5px] mt-2" style={{ color: "var(--steel)" }}>
                        <span>{SCALE_LABELS[0]}</span>
                        <span>{SCALE_LABELS[4]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={goPrevAxis}
                  disabled={axisIndex === 0}
                  className="dmat-btn-ghost px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-30"
                >
                  <ArrowLeft size={15} /> Önceki Eksen
                </button>
                <button
                  onClick={goNextAxis}
                  disabled={!axisComplete}
                  className="dmat-btn-primary px-6 py-2.5 text-sm font-medium inline-flex items-center gap-2"
                >
                  {axisIndex === AXES.length - 1 ? "Sonucu Gör" : "Sonraki Eksen"} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {screen === "results" && (
            <div>
              {firmName && <div className="dmat-mono text-xs mb-1" style={{ color: "var(--steel)" }}>{firmName.toUpperCase()}</div>}
              <h2 className="dmat-display text-3xl font-bold mb-1.5">Dijital Olgunluk Sonucu</h2>
              <p className="text-sm mb-2" style={{ color: "#3A4250" }}>{level.desc}</p>
              {saveState === "saving" && (
                <p className="dmat-mono text-[10px] mb-6" style={{ color: "var(--steel)" }}>SONUÇ KAYDEDİLİYOR…</p>
              )}
              {saveState === "saved" && (
                <p className="dmat-mono text-[10px] mb-6" style={{ color: "var(--green)" }}>✓ SONUÇ ÇORLU TİCARET VE SANAYİ ODASI'NA İLETİLDİ</p>
              )}
              {saveState === "error" && (
                <p className="dmat-mono text-[10px] mb-6" style={{ color: "var(--steel)" }}>SONUÇ YALNIZCA BU EKRANDA GÖRÜNTÜLENİYOR (kayıt şu an aktif değil)</p>
              )}
              {saveState === "idle" && <div className="mb-6" />}

              <div className="dmat-card p-6 mb-8 grid md:grid-cols-2 gap-6 items-center">
                <div className="text-center">
                  <Gauge value={overall} />
                  <div className="dmat-display text-xl font-bold mt-1" style={{ color: "var(--brass)" }}>{level.name}</div>
                  <div className="dmat-mono text-[10px] mb-3" style={{ color: "var(--steel)" }}>GENEL OLGUNLUK PUANI · 5 ÜZERİNDEN</div>
                  <div className="text-xs text-left px-3 py-2.5" style={{ background: "var(--paper2)", borderRadius: 6, color: "var(--ink)" }}>
                    <strong>Öncelik:</strong> {level.recommendation}
                  </div>
                </div>
                <RadarChart scores={scores} />
              </div>

              {/* axis breakdown */}
              <div className="dmat-mono text-xs mb-1" style={{ color: "var(--steel)" }}>EKSEN BAZLI SONUÇLAR VE YÖNLENDİRMELER</div>
              <p className="text-xs mb-4" style={{ color: "var(--steel)" }}>
                Her eksendeki puan, CMMI'ın 5 seviyeli olgunluk merdivenine (Başlangıç →
                Tekrarlanabilir → Tanımlı → Ölçülüyor → Optimize Ediliyor) göre yorumlanır.
              </p>
              <div className="space-y-3 mb-9">
                {AXES.map((a) => {
                  const s = scores[a.id];
                  const st = statusFor(s);
                  const guide = axisLevelGuide(a, s);
                  const barColor = st.tone === "low" ? "var(--red)" : st.tone === "mid" ? "var(--brass)" : "var(--green)";
                  return (
                    <div key={a.id} className="dmat-card px-4 py-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{a.no} {a.title}</span>
                        <span className="dmat-mono text-xs font-semibold" style={{ color: barColor }}>{s.toFixed(2)} / 5.00</span>
                      </div>
                      <div style={{ height: 6, background: "var(--grid)", borderRadius: 3, overflow: "hidden" }} className="mb-2">
                        <div style={{ width: `${(s / 5) * 100}%`, height: "100%", background: barColor }} />
                      </div>
                      <div className="dmat-mono text-[10px] mb-2.5" style={{ color: barColor }}>
                        SEVİYE {guide.level} — {guide.name.toUpperCase()}
                      </div>
                      <p className="text-sm mb-2" style={{ color: "#3A4250" }}>{guide.description}</p>
                      <div className="flex items-start gap-1.5 text-sm" style={{ color: "var(--ink)" }}>
                        <span className="font-medium flex-shrink-0">Önerilen adım:</span>
                        <span>{guide.action}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* recommendations */}
              {weakAxes.length > 0 && (
                <div className="mb-9">
                  <div className="dmat-mono text-xs mb-3" style={{ color: "var(--steel)" }}>ÖNCELİKLİ GELİŞİM ALANLARI İÇİN ÖNERİLEN KAYNAKLAR</div>
                  <div className="space-y-2">
                    {weakAxes.map((a) => (
                      <div key={a.id} className="dmat-card px-4 py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{a.title}</div>
                          <div className="text-xs" style={{ color: "#3A4250" }}>{a.resource.name}</div>
                        </div>
                        {a.resource.url && (
                          <a
                            href={a.resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="dmat-btn-ghost px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
                          >
                            Kaynağa Git <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EĞİTİM KAYIT FORMU */}
              <div className="dmat-card p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <CircleCheck size={20} style={{ color: "var(--green)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div className="text-sm font-semibold mb-1">Ücretsiz Eğitimlerden Haberdar Olun</div>
                    <p className="text-sm leading-relaxed" style={{ color: "#3A4250" }}>
                      Çorlu TSO'nun Dijital Dönüşüm, Yapay Zeka ve Dijitalleşme konularındaki
                      ücretsiz eğitimlerinden haberdar olmak isterseniz, iletişim bilgilerinizi
                      bırakabilirsiniz.
                    </p>
                  </div>
                </div>

                {trainingState === "saved" ? (
                  <div className="text-sm px-4 py-3" style={{ background: "var(--paper2)", borderRadius: 8, color: "var(--green)" }}>
                    ✓ Kaydınız alındı. Eğitim duyuruları e-posta/telefon ile size iletilecek.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <input
                      value={trainingEmail}
                      onChange={(e) => setTrainingEmail(e.target.value)}
                      placeholder="E-posta adresiniz *"
                      type="email"
                      className="w-full px-3.5 py-2.5 text-sm outline-none"
                      style={{ background: "#fff", border: "1px solid var(--grid)", borderRadius: 8 }}
                    />
                    <input
                      value={trainingPhone}
                      onChange={(e) => setTrainingPhone(e.target.value)}
                      placeholder="Telefon (opsiyonel)"
                      type="tel"
                      className="w-full px-3.5 py-2.5 text-sm outline-none"
                      style={{ background: "#fff", border: "1px solid var(--grid)", borderRadius: 8 }}
                    />
                  </div>
                )}

                {trainingState !== "saved" && (
                  <button
                    onClick={async () => {
                      if (!trainingEmail) return;
                      setTrainingState("saving");
                      const ok = await saveTrainingSignup({ firmName, email: trainingEmail, phone: trainingPhone });
                      notifyTrainingSignup({ firmName, email: trainingEmail, phone: trainingPhone });
                      setTrainingState(ok ? "saved" : "error");
                    }}
                    disabled={!trainingEmail || trainingState === "saving"}
                    className="dmat-btn-primary px-5 py-2.5 text-sm font-medium"
                  >
                    {trainingState === "saving" ? "Kaydediliyor…" : "Eğitim Bildirimlerine Kaydol"}
                  </button>
                )}
                {trainingState === "error" && (
                  <p className="text-xs mt-2" style={{ color: "var(--red)" }}>
                    Kayıt şu an alınamadı — lütfen daha sonra tekrar deneyin.
                  </p>
                )}
              </div>

              {/* DESTEK PROGRAMLARI — sade liste, yorum yok */}
              <div className="dmat-card p-6 mb-6">
                <div className="text-sm font-semibold mb-3">Destek Programları</div>
                <div className="space-y-2">
                  {SUPPORT_PROGRAMS.map((p) => (
                    <a
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-4 py-3 text-sm"
                      style={{ background: "var(--paper2)", borderRadius: 8, color: "var(--ink)" }}
                    >
                      <span>{p.name}</span>
                      <ExternalLink size={14} style={{ color: "var(--steel)", flexShrink: 0 }} />
                    </a>
                  ))}
                </div>
              </div>

              {/* METODOLOJİ ÖZETİ */}
              <div
                className="p-6 mb-8"
                style={{
                  background: "linear-gradient(135deg, rgba(181,121,58,0.08), rgba(181,121,58,0.03))",
                  border: "1.5px solid var(--brass)",
                  borderRadius: 12,
                }}
              >
                <div className="dmat-mono text-xs font-semibold mb-2" style={{ color: "var(--brass)" }}>BİLİMSEL METODOLOJİ VE KAYNAKÇA</div>
                <div className="text-base font-semibold mb-2">Bu değerlendirme neye dayanıyor?</div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#3A4250" }}>
                  Bu araç; acatech Industrie 4.0 Maturity Index (Almanya Ulusal Bilim ve
                  Mühendislik Akademisi), MIT & Capgemini Digital Maturity Model (Westerman,
                  Bonnet & McAfee) ve Avrupa Komisyonu EDIH Open DMAT çerçevelerinden
                  esinlenerek Çorlu Ticaret ve Sanayi Odası tarafından özgün olarak geliştirilmiştir.
                  Sertifikalı bir değerlendirme değildir; resmi araçlara ön hazırlık
                  niteliğindedir.
                </p>
                <button
                  onClick={() => setShowMethodology(true)}
                  className="dmat-btn-brass px-5 py-2.5 text-sm"
                >
                  Detaylı Metodolojiyi ve Kaynakçayı Gör
                </button>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={async () => {
                    setPdfState("generating");
                    try {
                      await generatePdfReport({ firmName, scores, overall, answers });
                      setPdfState("idle");
                    } catch (e) {
                      console.error(e);
                      setPdfState("error");
                    }
                  }}
                  disabled={pdfState === "generating"}
                  className="dmat-btn-primary px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
                >
                  <Download size={15} /> {pdfState === "generating" ? "Rapor Hazırlanıyor…" : "Raporu PDF Olarak İndir"}
                </button>
                <button
                  onClick={restart}
                  className="dmat-btn-ghost px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
                >
                  <RotateCcw size={15} /> Yeniden Başlat
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
