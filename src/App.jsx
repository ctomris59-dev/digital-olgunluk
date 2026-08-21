import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleCheck,
  Download,
  ExternalLink,
  GraduationCap,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { saveAssessment, saveTrainingSignup } from "./lib/supabaseClient";
import { notifyTrainingSignup } from "./lib/emailNotify";
import { AXES, SCALE_LABELS, levelFor, axisLevelGuide } from "./lib/data";
import { generatePdfReport } from "./lib/pdfReport";

// UI-FIX-DMAT-2026-08-21-FULLSCREEN-PORTAL-V1

const SUPPORT_PROGRAMS = [
  { name: "TÜBİTAK TÜSSİDE D3A / DDX Modeli", url: "https://ddxmodel.tubitak.gov.tr" },
  { name: "EDIH West Marmara İkiz Dönüşüm Desteği", url: "https://european-digital-innovation-hubs.ec.europa.eu" },
  { name: "KOSGEB Dijital Dönüşüm Danışmanlığı Desteği", url: "https://www.kosgeb.gov.tr" },
  { name: "Ticaret Bakanlığı E-İhracat Destek Programı", url: "https://www.ticaret.gov.tr" },
];

function getScoreColorConfig(score) {
  if (score < 2) return { bar: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", text: "text-red-600", label: "Kritik" };
  if (score < 3) return { bar: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-600", label: "Gelişime Açık" };
  if (score < 4) return { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-800 border-amber-200", text: "text-amber-700", label: "Orta Seviye" };
  if (score < 4.5) return { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-800 border-emerald-200", text: "text-emerald-700", label: "İyi Seviye" };
  return { bar: "bg-[#2E68D7]", badge: "bg-blue-50 text-blue-800 border-blue-200", text: "text-blue-700", label: "Lider" };
}

function RadarChart({ scores }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 98;
  const n = AXES.length;
  const pointAt = (i, r) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const rings = [1, 2, 3, 4, 5];
  const dataPoints = AXES.map((a, i) => pointAt(i, ((scores[a.id] || 0) / 5) * maxR));
  const dataPath = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" className="mx-auto block max-h-[245px] max-w-[300px]">
      {rings.map((r) => {
        const pts = AXES.map((_, i) => pointAt(i, (r / 5) * maxR).join(",")).join(" ");
        return <polygon key={r} points={pts} fill="none" stroke="#DCE4EB" strokeWidth={r === 5 ? 1.4 : 1} strokeDasharray={r === 5 ? "0" : "3,3"} />;
      })}
      {AXES.map((a, i) => {
        const [x, y] = pointAt(i, maxR);
        return <line key={a.id} x1={cx} y1={cy} x2={x} y2={y} stroke="#CBD5DF" strokeWidth="1" />;
      })}
      <polygon points={dataPath} fill="rgba(46,104,215,.13)" stroke="#2E68D7" strokeWidth="2.6" />
      {dataPoints.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.8" fill="#2E68D7" stroke="#fff" strokeWidth="2" />)}
      {AXES.map((a, i) => {
        const [x, y] = pointAt(i, maxR + 25);
        return <text key={a.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="#526070" fontWeight="800">{a.short.toUpperCase()}</text>;
      })}
    </svg>
  );
}

function ScoreGauge({ value }) {
  const size = 210;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = 82;
  const start = -180;
  const end = 0;
  const pct = Math.max(0, Math.min(1, (value - 1) / 4));
  const angle = start + pct * (end - start);
  const polar = (a, radius) => {
    const rad = (a * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };
  const arc = (a0, a1, radius) => {
    const [x0, y0] = polar(a0, radius);
    const [x1, y1] = polar(a1, radius);
    return `M ${x0} ${y0} A ${radius} ${radius} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const [nx, ny] = polar(angle, r - 13);

  return (
    <svg viewBox={`0 0 ${size} ${size * 0.63}`} width="100%" className="mx-auto block max-w-[230px]">
      <path d={arc(start, end, r)} fill="none" stroke="#E4E9EF" strokeWidth="12" strokeLinecap="round" />
      <path d={arc(start, angle, r)} fill="none" stroke="#B9782D" strokeWidth="12" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#10243D" strokeWidth="3.3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5.5" fill="#10243D" />
      <text x={cx} y={cy - 30} textAnchor="middle" fontSize="31" fontWeight="850" fill="#10243D">{value.toFixed(2)}</text>
    </svg>
  );
}

function MethodologyModal({ onClose }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    {
      label: "Model",
      title: "Bilimsel dayanak",
      body: (
        <div className="grid gap-3 md:grid-cols-2">
          {["acatech Industrie 4.0 Maturity Index", "WEF & Singapore EDB — SIRI", "Fraunhofer IMPULS", "MIT & Capgemini — Leading Digital"].map((x, i) => (
            <div key={x} className="rounded-2xl border border-[#DFE5EA] bg-[#F7F9FB] p-4">
              <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#B9782D]">0{i + 1}</div>
              <div className="mt-1.5 text-xs font-extrabold text-[#14283F]">{x}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Standartlar",
      title: "Standart ve politika referansları",
      body: (
        <div className="grid gap-3 md:grid-cols-3">
          {["AB EDIH Open DMAT", "CMMI V2.0 & ISO/IEC 33001", "NIST Cybersecurity Framework & OECD Going Digital"].map((x, i) => (
            <div key={x} className="rounded-2xl border border-[#DFE5EA] bg-white p-4 shadow-[0_8px_24px_rgba(12,31,54,.05)]">
              <BookOpen size={18} className="text-[#2E68D7]" />
              <div className="mt-3 text-xs font-extrabold leading-5 text-[#14283F]">{x}</div>
              <div className="mt-1 text-[10px] leading-4 text-[#6C7886]">Dijital olgunluk, süreç, güven ve dönüşüm yönetimi boyutlarına referans sağlar.</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Yaklaşım",
      title: "Bu araç nasıl kullanılmalı?",
      body: (
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["01", "Ön tarama", "Araç resmi denetim veya sertifikasyon değil, KOBİ'ler için hızlı öz-değerlendirmedir."],
            ["02", "6 eksen", "Süreç, veri, pazar, otomasyon, yetkinlik ve siber güvenlik birlikte değerlendirilir."],
            ["03", "5 seviye", "Yanıtlar 1–5 ölçeğinde puanlanır; sonuçlar olgunluk seviyesine ve aksiyonlara çevrilir."],
          ].map(([no, title, desc]) => (
            <div key={no} className="rounded-2xl bg-[#0A1D35] p-4 text-white">
              <div className="text-[10px] font-extrabold tracking-[.16em] text-[#E7B871]">{no}</div>
              <div className="mt-2 text-sm font-extrabold">{title}</div>
              <p className="mt-2 text-[10px] leading-5 text-white/65">{desc}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#061628]/85 p-3 backdrop-blur-md" onClick={onClose}>
      <div className="flex h-[min(560px,calc(100dvh-24px))] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-[#FBFCFD] shadow-[0_30px_90px_rgba(3,19,37,.35)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#DFE5EA] px-5 py-3.5">
          <div>
            <div className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#B9782D]">Dijital olgunluk metodolojisi</div>
            <h3 className="mt-0.5 text-lg font-extrabold tracking-tight text-[#10243D]">Bilimsel Metodoloji ve Kaynakça</h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE3E9] bg-white text-[#6E7A86] hover:bg-[#F4F6F8]"><X size={18} /></button>
        </div>
        <div className="grid flex-shrink-0 grid-cols-3 gap-1.5 border-b border-[#E4E9ED] bg-[#F5F7F9] p-2.5 sm:px-5">
          {tabs.map((item, idx) => (
            <button key={item.label} type="button" onClick={() => setTab(idx)} className={`rounded-xl px-3 py-2 text-[10px] font-extrabold transition ${idx === tab ? "bg-[#10243D] text-white" : "text-[#65717D] hover:bg-white"}`}>{item.label}</button>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 gap-4 p-4 sm:grid-cols-[.31fr_.69fr] sm:p-5">
          <div className="hidden rounded-[22px] bg-[#B9782D] p-5 text-white sm:block">
            <GraduationCap size={27} />
            <div className="mt-5 text-[9px] font-extrabold uppercase tracking-[.17em] text-white/60">Aktif bölüm</div>
            <div className="mt-2 text-xl font-extrabold leading-tight">{tabs[tab].title}</div>
            <p className="mt-3 text-[10px] leading-5 text-white/70">İçerik tek ekran içinde sekmelere ayrılmıştır; modal kaydırması yoktur.</p>
          </div>
          <div className="min-h-0 overflow-hidden rounded-[22px] border border-[#DEE5EA] bg-white p-4 sm:p-5">
            <div className="mb-3 text-xs font-extrabold text-[#10243D] sm:hidden">{tabs[tab].title}</div>
            {tabs[tab].body}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentModal({ onClose }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    {
      label: "Veri & Amaç",
      body: (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#DFE5EA] bg-[#F7F9FB] p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#B9782D]">Veri Sorumlusu</div><p className="mt-2 text-[11px] leading-5 text-[#566574]">Çorlu Ticaret ve Sanayi Odası (Çorlu TSO), Çorlu / Tekirdağ.</p></div>
          <div className="rounded-2xl border border-[#DFE5EA] bg-[#F7F9FB] p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#B9782D]">İşlenen Veriler</div><p className="mt-2 text-[11px] leading-5 text-[#566574]">Firma unvanı, yetkili adı-soyadı, e-posta, telefon, değerlendirme cevapları ve olgunluk skorları.</p></div>
          <div className="rounded-2xl border border-[#DFE5EA] bg-[#F7F9FB] p-4 sm:col-span-2"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#B9782D]">İşleme Amacı</div><p className="mt-2 text-[11px] leading-5 text-[#566574]">Firmanızın dijital olgunluk seviyesini ölçmek, size özel sonuç raporu sunmak ve Oda tarafından ilerleyen dönemde gelişim sürecinizi takip edebilmek.</p></div>
        </div>
      ),
    },
    {
      label: "Hukuk & Güvenlik",
      body: (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#DFE5EA] bg-white p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#2E68D7]">Hukuki Sebep</div><p className="mt-2 text-[11px] leading-5 text-[#566574]">KVKK md. 5/1 uyarınca açık rızanıza dayanılarak işlenir.</p></div>
          <div className="rounded-2xl border border-[#DFE5EA] bg-white p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#2E68D7]">Saklama ve Güvenlik</div><p className="mt-2 text-[11px] leading-5 text-[#566574]">Veriler yalnızca Oda yetkililerinin erişebildiği güvenli veritabanında saklanır; ticari amaçla kullanılmaz.</p></div>
          <div className="rounded-2xl bg-[#10243D] p-4 text-white sm:col-span-2"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#E7B871]">Haklarınız</div><p className="mt-2 text-[11px] leading-5 text-white/70">KVKK md. 11 kapsamındaki erişim, düzeltme, silme ve rızayı geri alma haklarınızı Oda'ya yazılı başvuru ile kullanabilirsiniz.</p></div>
        </div>
      ),
    },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#061628]/85 p-3 backdrop-blur-md" onClick={onClose}>
      <div className="flex h-[min(500px,calc(100dvh-24px))] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-[#FBFCFD] shadow-[0_30px_90px_rgba(3,19,37,.35)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#DFE5EA] px-5 py-3.5"><div><div className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#B9782D]">Kişisel verilerin korunması</div><h3 className="text-lg font-extrabold text-[#10243D]">KVKK Aydınlatma Metni</h3></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE3E9] bg-white text-[#6E7A86]"><X size={18} /></button></div>
        <div className="grid grid-cols-2 gap-1.5 border-b border-[#E4E9ED] bg-[#F5F7F9] p-2.5 sm:px-5">{tabs.map((t, i) => <button key={t.label} onClick={() => setTab(i)} className={`rounded-xl px-3 py-2 text-[10px] font-extrabold ${i === tab ? "bg-[#10243D] text-white" : "text-[#65717D] hover:bg-white"}`}>{t.label}</button>)}</div>
        <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-5">{tabs[tab].body}</div>
      </div>
    </div>
  );
}

function AxisIcon({ no }) {
  return <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4E9DB] text-[10px] font-black text-[#9B6324]">{no}</span>;
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [firmName, setFirmName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactErrors, setContactErrors] = useState({});
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
  const [resultTab, setResultTab] = useState("overview");

  const currentAxis = AXES[axisIndex];
  const answeredCount = currentAxis.questions.filter((_, qi) => answers[`${currentAxis.id}-${qi}`]).length;
  const axisComplete = answeredCount === currentAxis.questions.length;
  const totalQuestions = AXES.length * 5;
  const totalAnswered = Object.keys(answers).length;
  const progressPercent = Math.round((totalAnswered / totalQuestions) * 100);

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
  const weakAxes = AXES.filter((a) => scores[a.id] > 0 && scores[a.id] < 3).sort((a, b) => scores[a.id] - scores[b.id]);

  const setAnswer = (qIndex, value) => setAnswers((prev) => ({ ...prev, [`${currentAxis.id}-${qIndex}`]: value }));

  const goNextAxis = () => {
    if (!axisComplete) return;
    if (axisIndex < AXES.length - 1) setAxisIndex((x) => x + 1);
    else setScreen("contact");
  };

  const goPrevAxis = () => {
    if (axisIndex > 0) setAxisIndex((x) => x - 1);
    else setScreen("intro");
  };

  const validateContact = () => {
    const errs = {};
    if (!firmName.trim()) errs.firmName = "Firma adı zorunludur";
    if (!contactName.trim()) errs.contactName = "Ad soyad zorunludur";
    if (!contactEmail.trim()) errs.contactEmail = "E-posta zorunludur";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) errs.contactEmail = "Geçerli bir e-posta girin";
    if (!contactPhone.trim()) errs.contactPhone = "Telefon zorunludur";
    else if (contactPhone.replace(/\D/g, "").length < 10) errs.contactPhone = "Geçerli bir telefon girin";
    setContactErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitContactAndShowResults = async (e) => {
    e.preventDefault();
    if (!validateContact()) return;
    setSaveState("saving");
    const ok = await saveAssessment({
      firmName: firmName.trim(), contactName: contactName.trim(), email: contactEmail.trim(), phone: contactPhone.trim(), answers, scores, overall, levelName: level.name, consent: true,
    });
    setSaveState(ok ? "saved" : "error");
    if (!ok) return;
    setResultTab("overview");
    setScreen("results");
  };

  const restart = () => {
    setAnswers({}); setAxisIndex(0); setFirmName(""); setContactName(""); setContactEmail(""); setContactPhone(""); setContactErrors({}); setConsent(false); setSaveState("idle"); setTrainingEmail(""); setTrainingPhone(""); setTrainingState("idle"); setPdfState("idle"); setResultTab("overview"); setScreen("intro");
  };

  const handlePdf = async () => {
    setPdfState("generating");
    try {
      await generatePdfReport({ firmName, scores, overall, answers });
      setPdfState("idle");
    } catch (e) {
      console.error(e);
      setPdfState("error");
    }
  };

  return (
    <div className="portal-app relative h-[100dvh] w-full overflow-hidden bg-[#EDF2F6] text-[#15263A]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(83,108,132,.065)_1px,transparent_1px),linear-gradient(90deg,rgba(83,108,132,.065)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute -left-28 -top-36 h-[420px] w-[420px] rounded-full bg-[#D4E1F4]/65 blur-[90px]" />
        <div className="absolute -bottom-40 right-[-90px] h-[430px] w-[430px] rounded-full bg-[#EED7BB]/50 blur-[100px]" />
      </div>

      <header className="relative z-30 h-16 border-b border-white/10 bg-[#081C35] text-white shadow-[0_8px_28px_rgba(4,18,35,.16)]">
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-[2px] ring-2 ring-[#B9782D]/80">
              <img src="/ctso-logo.png" alt="Çorlu TSO" className="h-full w-full rounded-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#D9B27C] sm:text-[10px]">
                <span>Çorlu Ticaret ve Sanayi Odası</span><span className="hidden h-1 w-1 rounded-full bg-white/25 sm:block" /><span className="hidden text-white/50 sm:block">Üye Dönüşüm Portalı</span>
              </div>
              <div className="truncate text-[15px] font-extrabold tracking-tight text-white sm:text-lg">Dijital Olgunluk Analizi</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl border border-white/10 bg-white/[.06] px-3 py-1.5 text-right md:block"><div className="text-[8px] font-extrabold uppercase tracking-[.17em] text-white/40">DMAT · 01</div><div className="text-[10px] font-bold text-white/80">6 eksen · 30 soru</div></div>
            {screen === "quiz" && <div className="rounded-xl bg-[#B9782D] px-3 py-1.5 text-[10px] font-extrabold text-white">%{progressPercent}</div>}
          </div>
        </div>
      </header>

      <main className="relative z-10 h-[calc(100dvh-64px)] overflow-hidden">
        {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}
        {showConsentText && <ConsentModal onClose={() => setShowConsentText(false)} />}

        {screen === "intro" && (
          <section className="mx-auto grid h-full max-w-[1500px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-5">
            <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[28px] bg-[#0B2745] p-5 text-white shadow-[0_24px_70px_rgba(8,31,57,.18)] sm:p-7 lg:col-span-7 lg:p-8">
              <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[50px] border-[#B9782D]/15" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-[linear-gradient(180deg,transparent,rgba(4,16,31,.28))]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#E4B876]"><ShieldCheck size={13} /> Dijital dönüşüm ön taraması</div>
                <h1 className="vh-title mt-5 max-w-3xl text-[clamp(2.2rem,4.1vw,4.15rem)] font-extrabold leading-[.98] tracking-[-.05em]">Dijital olgunluğunuzu ölçün. Dönüşüm rotanızı netleştirin.</h1>
                <p className="vh-copy mt-4 max-w-2xl text-[13px] font-medium leading-6 text-white/67 sm:text-[15px] sm:leading-7">Süreçten veriye, müşteri deneyiminden yapay zekâ ve siber güvenliğe kadar işletmenizi 6 stratejik eksende değerlendirin; olgunluk seviyenizi ve öncelikli aksiyonlarınızı görün.</p>
              </div>

              <div className="relative mt-auto pt-5">
                <div className="grid grid-cols-3 gap-2.5">
                  {[["30", "Soru"], ["06", "Stratejik Eksen"], ["05", "Olgunluk Seviyesi"]].map(([n, t]) => <div key={t} className="rounded-2xl border border-white/10 bg-white/[.06] p-3"><div className="text-xl font-black text-[#E7B871] sm:text-2xl">{n}</div><div className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-white/55">{t}</div></div>)}
                </div>
                <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl border border-white/10 bg-black/10 p-3">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#D59547]" />
                  <span className="text-[10px] leading-4 text-white/68"><button type="button" onClick={(e) => { e.preventDefault(); setShowConsentText(true); }} className="font-extrabold text-white underline decoration-white/40 underline-offset-2">KVKK Aydınlatma Metni</button>'ni okudum, verilerimin belirtilen amaçlarla işlenmesini kabul ediyorum.</span>
                </label>
                <div className="mt-3 flex gap-2.5">
                  <button onClick={() => consent && setScreen("quiz")} disabled={!consent} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#B9782D] px-5 py-3 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(185,120,45,.22)] transition hover:bg-[#A56826] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35">Değerlendirmeye Başla <ArrowRight size={15} /></button>
                  <button onClick={() => setShowMethodology(true)} className="hidden items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[.06] px-4 text-[10px] font-extrabold text-white/80 transition hover:bg-white/[.1] sm:flex"><GraduationCap size={14} /> Metodoloji</button>
                </div>
              </div>
            </div>

            <div className="hidden min-h-0 flex-col gap-3 lg:col-span-5 lg:flex">
              <div className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(24,48,74,.09)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-extrabold uppercase tracking-[.17em] text-[#A76827]">Değerlendirme mimarisi</div><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#14283F]">6 eksende bütüncül görünüm</h2></div><div className="rounded-xl bg-[#F4E9DB] px-2.5 py-1.5 text-[9px] font-black text-[#9B6324]">DMAT</div></div>
                <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-2.5">
                  {AXES.map((a) => <div key={a.id} className="flex min-h-0 flex-col justify-between rounded-[18px] border border-[#E0E6EB] bg-[#F9FAFB] p-3.5"><div className="flex items-center gap-2.5"><AxisIcon no={a.no} /><div className="text-[11px] font-extrabold leading-4 text-[#1A2E44]">{a.title}</div></div><div className="vh-axis-copy mt-2 line-clamp-2 text-[9px] leading-4 text-[#71808E]">{a.intro}</div></div>)}
                </div>
              </div>
              <button onClick={() => setShowMethodology(true)} className="flex h-[76px] flex-shrink-0 items-center justify-between rounded-[22px] bg-[#10243D] px-5 text-left text-white shadow-[0_14px_34px_rgba(16,36,61,.14)]"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B9782D]"><GraduationCap size={18} /></div><div><div className="text-[9px] font-extrabold uppercase tracking-[.15em] text-[#E5B875]">Bilimsel altyapı</div><div className="mt-0.5 text-xs font-extrabold">acatech · SIRI · EDIH · NIST</div></div></div><ChevronRight size={18} className="text-white/40" /></button>
            </div>
          </section>
        )}

        {screen === "quiz" && (
          <section className="mx-auto flex h-full max-w-[1500px] flex-col px-3 py-3 sm:px-6 lg:px-8 lg:py-4">
            <div className="flex flex-shrink-0 items-center justify-between gap-3 rounded-[20px] border border-white/80 bg-white/90 px-4 py-2.5 shadow-[0_10px_30px_rgba(19,47,75,.06)] backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-3"><AxisIcon no={currentAxis.no} /><div className="min-w-0"><div className="text-[8px] font-extrabold uppercase tracking-[.16em] text-[#A76827]">Eksen {axisIndex + 1} / {AXES.length}</div><div className="truncate text-sm font-extrabold text-[#152B42] sm:text-base">{currentAxis.title}</div></div></div>
              <div className="hidden max-w-[360px] flex-1 sm:block"><div className="mb-1 flex justify-between text-[8px] font-bold uppercase tracking-[.12em] text-[#8A96A2]"><span>Toplam ilerleme</span><span>%{progressPercent}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#E8EDF1]"><div className="h-full rounded-full bg-[#B9782D] transition-all" style={{ width: `${progressPercent}%` }} /></div></div>
              <div className="rounded-xl border border-[#E1E6EB] bg-[#F7F9FA] px-3 py-1.5 text-[9px] font-extrabold text-[#536373]">{answeredCount}/5 yanıt</div>
            </div>

            <div className="mt-2.5 flex min-h-0 flex-1 flex-col gap-2">
              {currentAxis.questions.map((q, qi) => {
                const selected = answers[`${currentAxis.id}-${qi}`];
                return (
                  <div key={qi} className="quiz-card grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#DEE5EA] bg-white/92 px-3.5 py-2.5 shadow-[0_7px_20px_rgba(20,47,73,.045)] backdrop-blur-lg sm:px-4">
                    <div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#EDF2F8] text-[9px] font-black text-[#2E68D7]">{qi + 1}</span><p className="quiz-question text-[10.5px] font-bold leading-[1.35] text-[#314255] sm:text-[11.5px]">{q}</p></div>
                    <div className="flex flex-shrink-0 gap-1 sm:gap-1.5">
                      {SCALE_LABELS.map((label, idx) => {
                        const val = idx + 1;
                        const active = selected === val;
                        return <button key={val} onClick={() => setAnswer(qi, val)} title={`${val} — ${label}`} className={`scale-btn flex h-8 w-8 items-center justify-center rounded-[10px] border text-[10px] font-black transition sm:h-9 sm:w-9 ${active ? "border-[#B9782D] bg-[#B9782D] text-white shadow-[0_5px_12px_rgba(185,120,45,.18)]" : "border-[#DCE3E8] bg-[#F8FAFB] text-[#607080] hover:border-[#B9782D]/60 hover:bg-[#F7EFE6]"}`}>{val}</button>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2.5 flex flex-shrink-0 items-center justify-between gap-3">
              <button onClick={goPrevAxis} className="flex items-center gap-1.5 rounded-xl border border-[#D9E1E7] bg-white/90 px-4 py-2.5 text-[10px] font-extrabold text-[#536273] hover:bg-white"><ArrowLeft size={14} /> Geri</button>
              <div className="hidden items-center gap-1.5 text-[8px] font-bold text-[#8B97A3] lg:flex">1 Hiç yok <span>·</span> 3 Kısmen var <span>·</span> 5 Tam entegre</div>
              <button onClick={goNextAxis} disabled={!axisComplete} className="flex items-center gap-1.5 rounded-xl bg-[#10243D] px-5 py-2.5 text-[10px] font-extrabold text-white transition hover:bg-[#173553] disabled:cursor-not-allowed disabled:bg-[#CBD3DA]">{axisIndex < AXES.length - 1 ? "Sonraki Eksen" : "Son Adıma Geç"} <ArrowRight size={14} /></button>
            </div>
          </section>
        )}

        {screen === "contact" && (
          <section className="mx-auto grid h-full max-w-[1200px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-5">
            <div className="hidden min-h-0 flex-col justify-between overflow-hidden rounded-[28px] bg-[#10243D] p-7 text-white lg:col-span-5 lg:flex">
              <div><div className="inline-flex items-center gap-2 rounded-full bg-white/[.07] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#E5B875]"><ShieldCheck size={13} /> Son adım</div><h2 className="mt-5 text-[clamp(2rem,3.3vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-.045em]">Karnenizi kişiselleştirelim.</h2><p className="mt-4 max-w-md text-[12px] leading-6 text-white/60">İletişim bilgileriniz yalnızca sonuç raporunun sunulması ve Çorlu TSO'nun dönüşüm destekleri kapsamında gelişiminizin takip edilebilmesi için kullanılır.</p></div>
              <div className="grid grid-cols-3 gap-2.5">{[["30", "Yanıt"], [overall.toFixed(1), "Ön Skor"], ["PDF", "Rapor"]].map(([x, y]) => <div key={y} className="rounded-2xl border border-white/10 bg-white/[.06] p-3"><div className="text-xl font-black text-[#E5B875]">{x}</div><div className="mt-0.5 text-[8px] font-extrabold uppercase tracking-[.12em] text-white/45">{y}</div></div>)}</div>
            </div>

            <div className="flex min-h-0 flex-col justify-center rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(16,42,68,.10)] backdrop-blur-xl sm:p-7 lg:col-span-7">
              <div className="mx-auto w-full max-w-xl">
                <div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#A76827]">Sonuçlara erişim</div><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#14283F] sm:text-2xl">Sonucunuzu görmek için bilgilerinizi girin</h2><p className="mt-1.5 text-[10px] leading-5 text-[#71808E] sm:text-[11px]">Dijital olgunluk karneniz ve PDF raporunuz kayıt sonrasında görüntülenecektir.</p>
                <form onSubmit={submitContactAndShowResults} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2"><label className="mb-1 block text-[9px] font-extrabold uppercase tracking-[.1em] text-[#677583]">Firma Adı *</label><input value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="Örn. ABC Makine Sanayi" className={`w-full rounded-xl border bg-[#FBFCFD] px-3.5 py-2.5 text-[11px] outline-none transition focus:border-[#B9782D] focus:ring-2 focus:ring-[#B9782D]/10 ${contactErrors.firmName ? "border-red-400" : "border-[#D8E0E6]"}`} />{contactErrors.firmName && <p className="mt-1 text-[9px] text-red-600">{contactErrors.firmName}</p>}</div>
                  <div className="sm:col-span-2"><label className="mb-1 block text-[9px] font-extrabold uppercase tracking-[.1em] text-[#677583]">Ad Soyad *</label><input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Yetkili adı soyadı" className={`w-full rounded-xl border bg-[#FBFCFD] px-3.5 py-2.5 text-[11px] outline-none transition focus:border-[#B9782D] focus:ring-2 focus:ring-[#B9782D]/10 ${contactErrors.contactName ? "border-red-400" : "border-[#D8E0E6]"}`} />{contactErrors.contactName && <p className="mt-1 text-[9px] text-red-600">{contactErrors.contactName}</p>}</div>
                  <div><label className="mb-1 block text-[9px] font-extrabold uppercase tracking-[.1em] text-[#677583]">E-posta *</label><input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="ornek@firma.com" className={`w-full rounded-xl border bg-[#FBFCFD] px-3.5 py-2.5 text-[11px] outline-none transition focus:border-[#B9782D] focus:ring-2 focus:ring-[#B9782D]/10 ${contactErrors.contactEmail ? "border-red-400" : "border-[#D8E0E6]"}`} />{contactErrors.contactEmail && <p className="mt-1 text-[9px] text-red-600">{contactErrors.contactEmail}</p>}</div>
                  <div><label className="mb-1 block text-[9px] font-extrabold uppercase tracking-[.1em] text-[#677583]">Telefon *</label><input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="05XX XXX XX XX" className={`w-full rounded-xl border bg-[#FBFCFD] px-3.5 py-2.5 text-[11px] outline-none transition focus:border-[#B9782D] focus:ring-2 focus:ring-[#B9782D]/10 ${contactErrors.contactPhone ? "border-red-400" : "border-[#D8E0E6]"}`} />{contactErrors.contactPhone && <p className="mt-1 text-[9px] text-red-600">{contactErrors.contactPhone}</p>}</div>
                  {saveState === "error" && <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-[10px] font-semibold text-red-700">Kaydınız gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.</p>}
                  <div className="mt-1 flex items-center justify-between sm:col-span-2"><button type="button" onClick={() => setScreen("quiz")} className="rounded-xl border border-[#D9E1E7] bg-white px-4 py-2.5 text-[10px] font-extrabold text-[#596777]"><ArrowLeft size={13} className="mr-1 inline" />Geri</button><button type="submit" disabled={saveState === "saving"} className="flex items-center gap-1.5 rounded-xl bg-[#B9782D] px-5 py-2.5 text-[10px] font-extrabold text-white transition hover:bg-[#A56826] disabled:opacity-50">{saveState === "saving" ? "Kaydediliyor…" : "Sonucumu Görüntüle"}{saveState !== "saving" && <ArrowRight size={13} />}</button></div>
                </form>
              </div>
            </div>
          </section>
        )}

        {screen === "results" && (
          <section className="mx-auto flex h-full max-w-[1500px] flex-col px-3 py-3 sm:px-6 lg:px-8 lg:py-4">
            <div className="flex flex-shrink-0 items-center justify-between gap-3 rounded-[20px] border border-white/80 bg-white/92 px-4 py-2.5 shadow-[0_10px_30px_rgba(19,47,75,.06)] backdrop-blur-xl">
              <div className="min-w-0"><div className="truncate text-[9px] font-extrabold uppercase tracking-[.15em] text-[#A76827]">{firmName || "Dijital Olgunluk Sonucu"}</div><div className="truncate text-sm font-extrabold text-[#14283F] sm:text-base">{level.name} · {overall.toFixed(2)} / 5.00</div></div>
              <div className="hidden items-center gap-1 rounded-xl bg-[#F2F5F7] p-1 sm:flex">{[["overview", "Genel Bakış"], ["axes", "6 Eksen"], ["roadmap", "Yol Haritası"], ["report", "Rapor & Eğitim"]].map(([id, label]) => <button key={id} onClick={() => setResultTab(id)} className={`rounded-lg px-3 py-1.5 text-[9px] font-extrabold transition ${resultTab === id ? "bg-[#10243D] text-white shadow-sm" : "text-[#687582] hover:bg-white"}`}>{label}</button>)}</div>
              <select value={resultTab} onChange={(e) => setResultTab(e.target.value)} className="rounded-xl border border-[#DCE3E8] bg-white px-2.5 py-1.5 text-[9px] font-extrabold text-[#435364] outline-none sm:hidden"><option value="overview">Genel Bakış</option><option value="axes">6 Eksen</option><option value="roadmap">Yol Haritası</option><option value="report">Rapor & Eğitim</option></select>
            </div>

            <div className="mt-2.5 min-h-0 flex-1">
              {resultTab === "overview" && (
                <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 md:grid-cols-12">
                  <div className="flex min-h-0 flex-col justify-center rounded-[24px] border border-white/80 bg-white/92 p-4 shadow-[0_12px_36px_rgba(18,43,68,.07)] md:col-span-4"><div className="text-center"><div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#9A682F]">Genel olgunluk puanı</div><ScoreGauge value={overall} /><div className="-mt-2 text-lg font-extrabold text-[#14283F]">{level.name}</div><div className="mt-2 rounded-2xl bg-[#F4F6F8] p-3 text-left text-[10px] leading-5 text-[#5C6976]"><strong className="text-[#14283F]">Öncelik:</strong> {level.recommendation}</div></div></div>
                  <div className="hidden min-h-0 flex-col justify-center rounded-[24px] border border-white/80 bg-white/92 p-4 shadow-[0_12px_36px_rgba(18,43,68,.07)] md:col-span-4 md:flex"><div className="text-center text-[9px] font-extrabold uppercase tracking-[.16em] text-[#778592]">Eksen profili</div><RadarChart scores={scores} /></div>
                  <div className="flex min-h-0 flex-col rounded-[24px] bg-[#10243D] p-4 text-white shadow-[0_12px_36px_rgba(16,36,61,.12)] md:col-span-4"><div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#E5B875]">Öncelikli gelişim alanları</div><div className="mt-3 grid min-h-0 flex-1 gap-2">{(weakAxes.length ? weakAxes.slice(0, 3) : AXES.slice(0, 3)).map((a) => { const s = scores[a.id]; const guide = axisLevelGuide(a, s); return <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[.06] p-3"><div className="flex items-center justify-between gap-2"><div className="text-[10px] font-extrabold">{a.title}</div><div className="text-[10px] font-black text-[#E5B875]">{s.toFixed(2)}</div></div><p className="vh-result-copy mt-1.5 line-clamp-2 text-[9px] leading-4 text-white/57">{guide.description}</p></div>; })}</div>{saveState === "saved" && <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-emerald-300"><CircleCheck size={12} /> Sonuç Çorlu TSO'ya iletildi</div>}</div>
                </div>
              )}

              {resultTab === "axes" && (
                <div className="grid h-full min-h-0 grid-cols-2 gap-2.5 lg:grid-cols-3">
                  {AXES.map((a) => { const s = scores[a.id]; const cfg = getScoreColorConfig(s); const guide = axisLevelGuide(a, s); return <div key={a.id} className="flex min-h-0 flex-col rounded-[22px] border border-white/80 bg-white/92 p-3.5 shadow-[0_10px_30px_rgba(18,43,68,.055)]"><div className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><AxisIcon no={a.no} /><div className="line-clamp-2 text-[10px] font-extrabold leading-4 text-[#1C3046]">{a.title}</div></div><span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[9px] font-black ${cfg.badge}`}>{s.toFixed(2)}</span></div><div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E9EDF1]"><div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${(s / 5) * 100}%` }} /></div><div className={`mt-2 text-[8px] font-extrabold uppercase tracking-[.1em] ${cfg.text}`}>Seviye {guide.level} · {guide.name}</div><p className="vh-axis-result mt-1.5 line-clamp-3 text-[9px] leading-4 text-[#6D7A87]">{guide.description}</p><div className="vh-axis-action mt-auto pt-2"><div className="rounded-xl bg-[#F5F7F9] p-2 text-[8.5px] leading-4 text-[#536271]"><strong className="text-[#24384D]">Aksiyon:</strong> <span className="line-clamp-2">{guide.action}</span></div></div></div>; })}
                </div>
              )}

              {resultTab === "roadmap" && (
                <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 lg:grid-cols-[1.15fr_.85fr]">
                  <div className="flex min-h-0 flex-col rounded-[24px] border border-white/80 bg-white/92 p-4 shadow-[0_12px_36px_rgba(18,43,68,.07)]"><div className="flex items-center justify-between"><div><div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#A76827]">Öncelikli kaynaklar</div><div className="mt-0.5 text-sm font-extrabold text-[#14283F]">Gelişim alanlarınıza göre yönlendirmeler</div></div></div><div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">{(weakAxes.length ? weakAxes.slice(0, 4) : AXES.slice(0, 4)).map((a) => <div key={a.id} className="rounded-[18px] border border-[#E0E6EB] bg-[#F9FAFB] p-3"><div className="flex items-center gap-2"><AxisIcon no={a.no} /><div className="text-[10px] font-extrabold text-[#23374B]">{a.title}</div></div><div className="mt-2 space-y-1.5">{a.resources.slice(0, 2).map((r) => r.url ? <a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 rounded-xl bg-white px-2.5 py-2 text-[8.5px] font-bold text-[#5C6A77] hover:text-[#2E68D7]"><span className="line-clamp-1">{r.name}</span><ExternalLink size={11} /></a> : <div key={r.name} className="rounded-xl bg-white px-2.5 py-2 text-[8.5px] font-bold text-[#5C6A77]">{r.name}</div>)}</div></div>)}</div></div>
                  <div className="hidden min-h-0 flex-col rounded-[24px] bg-[#10243D] p-4 text-white shadow-[0_12px_36px_rgba(16,36,61,.12)] lg:flex"><div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#E5B875]">Destek programları</div><div className="mt-3 grid min-h-0 flex-1 gap-2">{SUPPORT_PROGRAMS.map((p, i) => <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.06] p-3 text-[9.5px] font-bold text-white/75 hover:bg-white/[.1]"><span><span className="mr-2 text-[#E5B875]">0{i + 1}</span>{p.name}</span><ExternalLink size={12} className="text-white/35" /></a>)}</div><button onClick={() => setShowMethodology(true)} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-[#B9782D] px-3 py-2.5 text-[9px] font-extrabold"><GraduationCap size={12} /> Metodolojiyi Gör</button></div>
                </div>
              )}

              {resultTab === "report" && (
                <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 lg:grid-cols-2">
                  <div className="flex min-h-0 flex-col justify-between rounded-[24px] bg-[#10243D] p-5 text-white shadow-[0_14px_38px_rgba(16,36,61,.14)]"><div><div className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#E5B875]">PDF Raporu</div><h3 className="mt-1 text-xl font-extrabold">Sonucunuzu kurum içinde paylaşın.</h3><p className="mt-2 max-w-lg text-[10px] leading-5 text-white/60">Eksen skorları, genel olgunluk seviyesi ve gelişim önerileri PDF raporunda bir araya gelir.</p></div><div><button onClick={handlePdf} disabled={pdfState === "generating"} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#B9782D] px-5 py-3 text-[10px] font-extrabold text-white hover:bg-[#A56826] disabled:opacity-50"><Download size={14} /> {pdfState === "generating" ? "Rapor Hazırlanıyor…" : "Raporu PDF Olarak İndir"}</button><button onClick={restart} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.06] px-5 py-2.5 text-[9px] font-extrabold text-white/70"><RotateCcw size={12} /> Yeni Değerlendirme Başlat</button></div></div>
                  <div className="flex min-h-0 flex-col rounded-[24px] border border-white/80 bg-white/92 p-5 shadow-[0_12px_36px_rgba(18,43,68,.07)]"><div className="flex items-start gap-3"><div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#2E68D7]"><CircleCheck size={18} /></div><div><div className="text-[9px] font-extrabold uppercase tracking-[.14em] text-[#71808E]">Çorlu TSO eğitimleri</div><h3 className="mt-0.5 text-sm font-extrabold text-[#14283F]">Ücretsiz eğitimlerden haberdar olun</h3><p className="mt-1 text-[9.5px] leading-4 text-[#71808E]">Dijital Dönüşüm, Yapay Zekâ ve Yeşil Dönüşüm/SKDM eğitim duyurularını alın.</p></div></div>{trainingState === "saved" ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] font-bold text-emerald-800">✓ Kaydınız alındı. Eğitim duyuruları size iletilecek.</div> : <div className="mt-4 grid gap-2.5"><input value={trainingEmail} onChange={(e) => setTrainingEmail(e.target.value)} placeholder="E-posta adresiniz *" type="email" className="rounded-xl border border-[#D8E0E6] bg-[#FBFCFD] px-3.5 py-2.5 text-[10px] outline-none focus:border-[#B9782D]" /><input value={trainingPhone} onChange={(e) => setTrainingPhone(e.target.value)} placeholder="Telefon (opsiyonel)" type="tel" className="rounded-xl border border-[#D8E0E6] bg-[#FBFCFD] px-3.5 py-2.5 text-[10px] outline-none focus:border-[#B9782D]" /><button onClick={async () => { if (!trainingEmail) return; setTrainingState("saving"); const ok = await saveTrainingSignup({ firmName, email: trainingEmail, phone: trainingPhone }); notifyTrainingSignup({ firmName, email: trainingEmail, phone: trainingPhone }); setTrainingState(ok ? "saved" : "error"); }} disabled={!trainingEmail || trainingState === "saving"} className="rounded-xl bg-[#2E68D7] px-4 py-2.5 text-[9.5px] font-extrabold text-white disabled:opacity-50">{trainingState === "saving" ? "Kaydediliyor…" : "Eğitim Bildirimlerine Kaydol"}</button></div>}<button onClick={() => setShowMethodology(true)} className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE4E9] bg-[#F7F9FA] px-3 py-2 text-[9px] font-extrabold text-[#586777]"><BookOpen size={12} /> Bilimsel Metodoloji</button></div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
