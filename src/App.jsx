import React, { useState, useMemo } from "react";
import { ArrowRight, ArrowLeft, RotateCcw, ExternalLink, CircleCheck, X, Download, GraduationCap, ShieldCheck, CheckCircle2, FileText, ChevronRight } from "lucide-react";
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
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 360, display: "block", margin: "0 auto" }}>
      {rings.map((r) => {
        const pts = AXES.map((_, i) => pointAt(i, (r / 5) * maxR).join(",")).join(" ");
        return (
          <polygon
            key={r}
            points={pts}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={r === 5 ? 1.5 : 1}
            strokeDasharray={r === 5 ? "0" : "3,3"}
          />
        );
      })}
      {AXES.map((a, i) => {
        const [x, y] = pointAt(i, maxR);
        return <line key={a.id} x1={cx} y1={cy} x2={x} y2={y} stroke="#CBD5E1" strokeWidth="1" />;
      })}
      <polygon points={dataPath} fill="rgba(30, 58, 138, 0.15)" stroke="#1E3A8A" strokeWidth="2.5" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="2" />
      ))}
      {AXES.map((a, i) => {
        const [x, y] = pointAt(i, maxR + 28);
        return (
          <text
            key={a.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#334155"
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
    <svg viewBox={`0 0 ${size} ${size * 0.62}`} width="100%" style={{ maxWidth: 240, display: "block", margin: "0 auto" }}>
      <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
      <path
        d={arcPath(startAngle, needleAngle, r)}
        fill="none"
        stroke="#1E3A8A"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {ticks.map((t) => {
        const a = startAngle + ((t - 1) / 4) * (endAngle - startAngle);
        const [x1, y1] = polar(a, r + 9);
        const [x2, y2] = polar(a, r + 17);
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748B" strokeWidth="1.5" />;
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#0F172A" />
      <text
        x={cx}
        y={cy - 32}
        textAnchor="middle"
        fontSize="32"
        fontWeight="800"
        fill="#0F172A"
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
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-50 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Bilimsel Çerçeve</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Metodoloji ve Uluslararası Standartlar</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-sm text-slate-600 space-y-5 leading-relaxed">
          <p>
            Bu araç, Çorlu Ticaret ve Sanayi Odası tarafından özgün olarak geliştirilmiştir.
            Aşağıda listelenen uluslararası kabul görmüş dijital olgunluk çerçevelerinin
            kavramsal yapısından esinlenerek tasarlanmış, KOBİ'lere yönelik bir
            <strong className="text-slate-900"> ön-tarama (self-assessment) aracıdır.</strong>
          </p>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Referans Alınan Uluslararası Çerçeveler</h4>
            <ul className="space-y-3 pl-0 list-none">
              <li className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <strong className="text-slate-900 block mb-1">1. acatech Industrie 4.0 Maturity Index</strong>
                Almanya Ulusal Bilim ve Mühendislik Akademisi. Kaynaklar, Bilgi Sistemleri, Organizasyonel Yapı ve Kültür eksenli 6 aşamalı olgunluk modeli.
              </li>
              <li className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <strong className="text-slate-900 block mb-1">2. MIT Center for Digital Business & Capgemini</strong>
                "Leading Digital" modeli. Dijital Yoğunluk ile Dönüşüm Yönetimi Yoğunluğu ölçümleme prensipleri.
              </li>
              <li className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <strong className="text-slate-900 block mb-1">3. Avrupa Komisyonu EDIH Ağı — Open DMAT</strong>
                Digital Maturity Assessment Tool for SMEs (KOBİ'ler için Dijital Olgunluk Değerlendirme Çerçevesi).
              </li>
              <li className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <strong className="text-slate-900 block mb-1">4. ISO/IEC 33001 Standart Ailesi & CMMI</strong>
                Süreç değerlendirme standartları ve kademeli yetkinlik seviyeleri metodolojisi.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Hesaplama Mantığı</h4>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
              <li>Toplam 6 eksen, eksen başına 5 soru (Toplam 30 soru)</li>
              <li>1-5 arası Likert ölçeğinde yanıtlandırma</li>
              <li>Eksen ve genel skorların aritmetik ortalama hesabı</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

const SUPPORT_PROGRAMS = [
  { name: "TÜBİTAK TÜSSİDE D3A / DDX Modeli", url: "https://ddxmodel.tubitak.gov.tr" },
  { name: "EDIH Open DMAT (Avrupa Komisyonu)", url: "https://european-digital-innovation-hubs.ec.europa.eu" },
  { name: "KOSGEB Dijital Dönüşüm Danışmanlığı Desteği", url: "https://www.kosgeb.gov.tr" },
];

/* ---------------------------------------------------------------
   ANA UYGULAMA
--------------------------------------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [firmName, setFirmName] = useState("");
  const [axisIndex, setAxisIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const [showConsentText, setShowConsentText] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [trainingEmail, setTrainingEmail] = useState("");
  const [trainingPhone, setTrainingPhone] = useState("");
  const [trainingState, setTrainingState] = useState("idle");
  const [pdfState, setPdfState] = useState("idle");

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* KURUMSAL ÜST HEADER BANNER */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src="/ctso-logo.jpg"
              alt="Çorlu TSO Logo"
              className="h-10 w-10 object-contain bg-white rounded p-0.5"
            />
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                Çorlu Ticaret ve Sanayi Odası
              </div>
              <div className="text-base font-bold text-white tracking-tight mt-1">
                Dijital Olgunluk Portal Değerlendirmesi
              </div>
            </div>
          </div>
          {screen !== "intro" && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {screen === "quiz" ? `Aşama ${axisIndex + 1} / ${AXES.length}` : "Değerlendirme Raporu"}
            </span>
          )}
        </div>
      </header>

      {/* ANA İÇERİK KONTEYNERİ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}

        {/* EKRAN 1: INTRO */}
        {screen === "intro" && (
          <div className="space-y-8">
            {/* HERO BÖLÜMÜ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">
                <ShieldCheck size={16} />
                <span>Resmi KOBİ Ön-Tarama Aracı</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                Firmanızın Dijital Olgunluk Seviyesini Ölçümleyin
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl mb-6">
                6 stratejik eksende hazırlanan 30 soruluk bu ön değerlendirme ile kurumunuzun dijital dönüşüm seviyesini tespit edebilir, gelişim alanlarınızı analiz edebilir ve uygun KOSGEB/TÜBİTAK desteklerine yönlendirilebilirsiniz.
              </p>

              {/* BİLGİ ROZETLERİ */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  <span>30 Analiz Sorusu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  <span>Yaklaşık 10-12 Dakika</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Anlık PDF Rapor Çıktısı</span>
                </div>
              </div>
            </div>

            {/* BİLİMSEL METODOLOJİ BANNERİ */}
            <div 
              onClick={() => setShowMethodology(true)}
              className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/50 border border-blue-700/50 rounded-lg text-blue-300">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Uluslararası Metodoloji Standartları</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    acatech Industrie 4.0, MIT & Capgemini ve AB EDIH Open DMAT altyapısına dayanır.
                  </p>
                </div>
              </div>
              <div className="flex items-center text-xs font-semibold text-blue-300 group-hover:translate-x-0.5 transition-transform">
                İncele <ChevronRight size={16} className="ml-1" />
              </div>
            </div>

            {/* EKSENLER ÖZET KARTI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Değerlendirme Eksenleri</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {AXES.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-100">{a.no}</span>
                    <span className="text-sm font-medium text-slate-800">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FORUM BÖLÜMÜ */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Firma Unvanı <span className="text-slate-400 font-normal">(Opsiyonel)</span>
                </label>
                <input
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="Örn: ABC Teknolojik İmalat San. Tic. A.Ş."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-900 rounded border-slate-300 focus:ring-blue-600"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowConsentText(true);
                      }}
                      className="font-semibold text-blue-900 underline hover:text-blue-900"
                    >
                      KVKK Aydınlatma Metni
                    </button>
                    'ni okudum. Verilerimin değerlendirme raporu oluşturulması amacıyla işlenmesini onaylıyorum.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => consent && setScreen("quiz")}
                  disabled={!consent}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-900 hover:bg-blue-900 disabled:bg-slate-300 text-white font-semibold text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  Değerlendirmeyi Başlat <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KVKK MODAL */}
        {showConsentText && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowConsentText(false)}
          >
            <div
              className="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 max-w-lg w-full"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">KVKK Aydınlatma Metni</h3>
                <button onClick={() => setShowConsentText(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <p><strong>Veri Sorumlusu:</strong> Çorlu Ticaret ve Sanayi Odası (Çorlu TSO).</p>
                <p><strong>İşlenen Veriler:</strong> Firma adı (isteğe bağlı) ve değerlendirme sorularına verilen yanıtlar.</p>
                <p><strong>Amaç:</strong> Dijital olgunluk skorunun hesaplanması, kurumsal raporlama ve uygun destek mekanizmalarının tespiti.</p>
                <p><strong>Gizlilik:</strong> Yanıtlarınız üçüncü taraf kurumlarla ticari amaçla paylaşılmaz.</p>
              </div>
              <button
                onClick={() => setShowConsentText(false)}
                className="mt-6 w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* EKRAN 2: QUIZ */}
        {screen === "quiz" && (
          <div className="space-y-6">
            {/* ADIM GOSTERGESI */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-1.5 overflow-x-auto">
              {AXES.map((a, i) => {
                const done = a.questions.every((_, qi) => answers[`${a.id}-${qi}`]);
                const isCurrent = i === axisIndex;
                return (
                  <div
                    key={a.id}
                    className={`flex-1 min-w-[100px] text-center py-2 px-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-blue-900 text-white shadow-sm"
                        : done
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-50 text-slate-500 border border-slate-100"
                    }`}
                  >
                    <div className="text-[10px] opacity-75">EKSEN {a.no}</div>
                    <div className="truncate">{a.short}</div>
                  </div>
                );
              })}
            </div>

            {/* SORU ALANI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                Eksen {currentAxis.no} / {AXES.length}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{currentAxis.title}</h2>
              <p className="text-slate-600 text-sm mb-8">{currentAxis.intro}</p>

              <div className="space-y-8">
                {currentAxis.questions.map((q, qi) => {
                  const val = answers[`${currentAxis.id}-${qi}`];
                  return (
                    <div key={qi} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {qi + 1}. {q}
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setAnswer(qi, v)}
                            className={`py-2.5 rounded-lg font-bold text-sm transition-all border ${
                              val === v
                                ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-400 px-1">
                        <span>1: {SCALE_LABELS[0]}</span>
                        <span>5: {SCALE_LABELS[4]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NAVİGASYON */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                <button
                  onClick={goPrevAxis}
                  disabled={axisIndex === 0}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm rounded-lg transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} /> Önceki Eksen
                </button>
                <button
                  onClick={goNextAxis}
                  disabled={!axisComplete}
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-900 text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {axisIndex === AXES.length - 1 ? "Sonuçları Tamamla" : "Sonraki Eksen"} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EKRAN 3: RESULTS */}
        {screen === "results" && (
          <div className="space-y-8">
            {/* BAŞLIK & İNDİRME */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {firmName && <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">{firmName}</div>}
                <h2 className="text-2xl font-bold text-slate-900">Dijital Olgunluk Değerlendirme Raporu</h2>
                <p className="text-xs text-slate-500 mt-1">Tamamlanma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
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
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-900 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={16} /> {pdfState === "generating" ? "Rapor Üretiliyor..." : "Resmi PDF Raporu İndir"}
              </button>
            </div>

            {/* GENEL SKOR KARTI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:border-r md:border-slate-100 md:pr-8">
                <Gauge value={overall} />
                <div className="text-xl font-extrabold text-blue-900 mt-2">{level.name}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5 mb-4">Genel Skor (5 Üzerinden)</div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-left text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Stratejik Öncelik:</strong> {level.recommendation}
                </div>
              </div>
              <RadarChart scores={scores} />
            </div>

            {/* EKSEN BAZLI DETAYLAR */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Eksen Bazlı Yetkinlik Seviyeleri</h3>
              <div className="grid gap-3">
                {AXES.map((a) => {
                  const s = scores[a.id];
                  const st = statusFor(s);
                  const guide = axisLevelGuide(a, s);
                  return (
                    <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{a.no}. {a.title}</span>
                        <span className="text-sm font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                          {s.toFixed(2)} / 5.00
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-900 rounded-full transition-all duration-500" style={{ width: `${(s / 5) * 100}%` }} />
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Seviye {guide.level}: {guide.name}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{guide.description}</p>
                      <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-800 font-medium border border-slate-100">
                        <span className="font-bold text-blue-900">Aksiyon Önerisi: </span>
                        {guide.action}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EĞİTİM VE DESTEK FORMU */}
            <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-base font-bold">Çorlu TSO Dijital Dönüşüm Eğitimleri</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Açılacak ücretsiz danışmanlık ve eğitim programlarından doğrudan haberdar olmak için iletişim bilgilerinizi ekleyebilirsiniz.
                  </p>
                </div>
              </div>

              {trainingState === "saved" ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 font-medium">
                  ✓ İletişim bilgileriniz başarıyla kaydedilmiştir.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <input
                    value={trainingEmail}
                    onChange={(e) => setTrainingEmail(e.target.value)}
                    placeholder="E-posta Adresi *"
                    type="email"
                    className="px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    value={trainingPhone}
                    onChange={(e) => setTrainingPhone(e.target.value)}
                    placeholder="Telefon (Opsiyonel)"
                    type="tel"
                    className="px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
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
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {trainingState === "saving" ? "Kaydediliyor..." : "Eğitim Duyurularına Kaydol"}
                </button>
              )}
            </div>

            {/* DESTEK PROGRAMLARI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">İlgili Destek Programları ve Bağlantılar</h4>
              <div className="grid gap-2">
                {SUPPORT_PROGRAMS.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors"
                  >
                    <span>{p.name}</span>
                    <ExternalLink size={14} className="text-slate-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* BAŞTAN BAŞLA */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={restart}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center gap-2"
              >
                <RotateCcw size={14} /> Yeni Değerlendirme Başlat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
