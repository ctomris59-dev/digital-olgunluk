import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CircleCheck,
  Download,
  ExternalLink,
  FileText,
  Info,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { saveAssessment } from "./lib/supabaseClient";
import {
  DMAT_DIMENSIONS,
  DMAT_SOURCES,
  QUESTIONS,
  SCALE_0_5,
  SECTORS,
  STAFF_SIZES,
  calculateDMAT,
  createInitialAnswers,
  dimensionInterpretation,
  isQuestionComplete,
  maturityLevel,
} from "./lib/data";
import { generatePdfReport } from "./lib/pdfReport";

const initialProfile = () => ({
  date: new Date().toISOString().slice(0, 10),
  companyName: "",
  fiscalNo: "",
  contactName: "",
  role: "",
  email: "",
  phone: "",
  website: "",
  staffSize: "",
  foundationYear: "",
  country: "Türkiye",
  region: "",
  postalCode: "",
  address: "",
  pic: "",
  primarySector: "",
  secondarySectors: [],
  otherSector: "",
});

function MethodologyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07172A]/80 p-3 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[calc(100dvh-24px)] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-700">EDIH / DMAT</div>
            <h2 className="mt-1 text-xl font-black text-slate-900">Metodoloji ve Kaynaklar</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><X size={18} /></button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <section className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck size={18} /> Bu uygulamada yalnızca EDIH DMAT yöntemi kullanılır</div>
            <p className="mt-2 text-[12px] leading-6 text-white/70">
              Anket, KOBİ'ler için European Digital Innovation Hubs (EDIH) ağında kullanılan Digital Maturity Assessment Tool (DMAT) soru setine dayanır. Eski özel 1–5 olgunluk modeli, CMMI/acatech/SIRI vb. karma referanslar kullanılmaz.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-black text-slate-900">Resmî puanlama mantığı</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {[
                ["Soru puanı", "Her DMAT sorusu 0–10 aralığında hesaplanır."],
                ["Boyut puanı", "Altı DMAT boyutunun her biri 0–100 aralığında hesaplanır."],
                ["Öğe ağırlığı", "Bir soru içindeki öğeler eşit katkı verir; sorular boyut skoruna eşit katkı verir."],
                ["0–5 ölçeği", "0,1,2,3,4,5 yanıtları sırasıyla 0,.2,.4,.6,.8,1'e dönüştürülür ve 0–10'a normalize edilir."],
                ["Q1 özel kuralı", "Halihazırda yatırım ve yatırım planı ayrı alt-sorular gibi ele alınır; Q2 ile birlikte Dijital İş Stratejisi skorunu oluşturur."],
                ["Genel skor", "Altı boyut skorunun aritmetik ortalamasıdır."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[11px] font-black text-slate-900">{title}</div>
                  <p className="mt-1.5 text-[11px] leading-5 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black text-slate-900">DMAT sonuç bantları</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                ["0–25", "Temel", "Basic"],
                ["26–50", "Ortalama", "Average"],
                ["51–75", "Orta İleri", "Moderately advanced"],
                ["76–100", "İleri", "Advanced"],
              ].map(([range, tr, en]) => (
                <div key={range} className="rounded-2xl border border-slate-200 p-3">
                  <div className="text-lg font-black text-slate-900">{range}</div>
                  <div className="mt-1 text-[11px] font-extrabold text-slate-800">{tr}</div>
                  <div className="text-[9px] text-slate-500">{en}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">
              JRC dokümanında “Average 26–50” ile “Moderately advanced 50–75” aralıkları 50 puanda çakışır. Bu uygulamada tekil sınıflandırma için 50 puan “Ortalama”, 50'nin üzeri “Orta İleri” kabul edilir; ham skor değişmez.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-black text-slate-900">Kaynaklar</h3>
            <div className="mt-3 space-y-2">
              {DMAT_SOURCES.map((source) => (
                <a key={source.title} href={source.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/40">
                  <div>
                    <div className="text-[11px] font-extrabold text-slate-900">{source.title}</div>
                    <div className="mt-1 text-[10px] leading-5 text-slate-500">{source.detail}</div>
                  </div>
                  <ExternalLink size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                </a>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-900">
            <strong>Not:</strong> Bu, Çorlu TSO için hazırlanmış yerel bir DMAT uygulamasıdır. Resmî EDIH portalındaki kayıt/benchmark veritabanına otomatik veri göndermez; ancak soru seti ve puanlama mantığı DMAT metodolojisine göre uygulanır.
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarChart({ scores }) {
  const size = 320;
  const cx = 160;
  const cy = 160;
  const maxR = 104;
  const n = DMAT_DIMENSIONS.length;
  const pointAt = (i, r) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const rings = [25, 50, 75, 100];
  const data = DMAT_DIMENSIONS.map((d, i) => pointAt(i, ((scores[d.id] || 0) / 100) * maxR));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]">
      {rings.map((r) => (
        <polygon key={r} points={DMAT_DIMENSIONS.map((_, i) => pointAt(i, (r / 100) * maxR).join(",")).join(" ")} fill="none" stroke="#DDE5EC" strokeWidth="1" strokeDasharray={r === 100 ? "0" : "4 4"} />
      ))}
      {DMAT_DIMENSIONS.map((d, i) => {
        const [x, y] = pointAt(i, maxR);
        return <line key={d.id} x1={cx} y1={cy} x2={x} y2={y} stroke="#D2DCE5" />;
      })}
      <polygon points={data.map((p) => p.join(",")).join(" ")} fill="rgba(37,99,235,.14)" stroke="#2563EB" strokeWidth="3" />
      {data.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#2563EB" stroke="white" strokeWidth="2" />)}
      {DMAT_DIMENSIONS.map((d, i) => {
        const [x, y] = pointAt(i, maxR + 30);
        return <text key={d.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="800" fill="#475569">{d.short.toUpperCase()}</text>;
      })}
    </svg>
  );
}

function ScoreBadge({ score }) {
  const level = maturityLevel(score);
  const cls = level.key === "advanced" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : level.key === "moderate" ? "bg-blue-50 text-blue-800 border-blue-200" : level.key === "average" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-rose-50 text-rose-800 border-rose-200";
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${cls}`}>{score.toFixed(1)} / 100</span>;
}

function MultiQuestion({ q, value, onChange }) {
  const toggle = (idx) => {
    const exists = value.selected.includes(idx);
    const next = exists ? value.selected.filter((x) => x !== idx) : [...value.selected, idx];
    onChange({ selected: next, none: false });
  };
  return (
    <div className="space-y-2">
      {q.items.map((item, idx) => {
        const checked = value.selected.includes(idx);
        return (
          <button key={idx} type="button" onClick={() => toggle(idx)} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${checked ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`}>{checked && <Check size={13} />}</span>
            <span className="text-[11px] font-semibold leading-5 text-slate-700">{item}</span>
          </button>
        );
      })}
      <button type="button" onClick={() => onChange({ selected: [], none: true })} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${value.none ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"}`}>
        <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${value.none ? "border-white bg-white text-slate-900" : "border-slate-300 bg-white"}`}>{value.none && <Check size={13} />}</span>
        <span className="text-[11px] font-extrabold">Yukarıdakilerin hiçbiri</span>
      </button>
    </div>
  );
}

function MatrixQuestion({ answers, setAnswers }) {
  const q = QUESTIONS.q1;
  const updateGroup = (key, idx) => {
    const group = answers[key];
    const exists = group.selected.includes(idx);
    const selected = exists ? group.selected.filter((x) => x !== idx) : [...group.selected, idx];
    setAnswers((a) => ({ ...a, [key]: { selected, none: false } }));
  };
  const setNone = (key) => setAnswers((a) => ({ ...a, [key]: { selected: [], none: true } }));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[1fr_88px_88px] bg-slate-50 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-slate-500 sm:grid-cols-[1fr_130px_130px]">
        <div>İş alanı</div><div className="text-center">Yatırım yapıldı</div><div className="text-center">Planlanıyor</div>
      </div>
      {q.items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_88px_88px] items-center border-t border-slate-100 px-3 py-2.5 sm:grid-cols-[1fr_130px_130px]">
          <div className="pr-3 text-[10.5px] font-semibold leading-5 text-slate-700">{item}</div>
          {["q1Invested", "q1Planned"].map((key) => {
            const checked = answers[key].selected.includes(idx);
            return <div key={key} className="flex justify-center"><button type="button" aria-label={checked ? "Seçimi kaldır" : "Seç"} onClick={() => updateGroup(key, idx)} className={`flex h-8 w-8 items-center justify-center rounded-lg border ${checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`}>{checked && <Check size={16} />}</button></div>;
          })}
        </div>
      ))}
      <div className="grid gap-2 border-t border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
        <button type="button" onClick={() => setNone("q1Invested")} className={`rounded-xl border px-3 py-2 text-[10px] font-extrabold ${answers.q1Invested.none ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"}`}>Halihazırda hiçbirine yatırım yapılmadı</button>
        <button type="button" onClick={() => setNone("q1Planned")} className={`rounded-xl border px-3 py-2 text-[10px] font-extrabold ${answers.q1Planned.none ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"}`}>Hiçbirine yatırım planlanmıyor</button>
      </div>
    </div>
  );
}

function Scale05Question({ q, values, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {SCALE_0_5.map((label, i) => <div key={label} className="rounded-xl bg-slate-100 px-2 py-2 text-center text-[8px] font-extrabold leading-4 text-slate-500"><span className="block text-[12px] text-slate-900">{i}</span>{label}</div>)}
      </div>
      {q.items.map((item, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-[10.5px] font-semibold leading-5 text-slate-700">{item}</div>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {SCALE_0_5.map((_, score) => (
              <button key={score} type="button" onClick={() => onChange(idx, score)} className={`rounded-xl border py-2 text-[11px] font-black transition ${values[idx] === score ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"}`}>{score}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PartialQuestion({ q, values, onChange }) {
  const opts = [[0, "Hayır"], [1, "Kısmen"], [2, "Evet"]];
  return (
    <div className="space-y-3">
      {q.items.map((item, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-[10.5px] font-semibold leading-5 text-slate-700">{item}</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {opts.map(([score, label]) => <button key={score} type="button" onClick={() => onChange(idx, score)} className={`rounded-xl border py-2 text-[10px] font-extrabold ${values[idx] === score ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>{label}</button>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileForm({ profile, setProfile, consent, setConsent }) {
  const set = (key, val) => setProfile((p) => ({ ...p, [key]: val }));
  const toggleSecondary = (sector) => {
    const exists = profile.secondarySectors.includes(sector);
    if (exists) set("secondarySectors", profile.secondarySectors.filter((x) => x !== sector));
    else if (profile.secondarySectors.length < 3) set("secondarySectors", [...profile.secondarySectors, sector]);
  };
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-800 outline-none focus:border-blue-500";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-[10px] font-black uppercase tracking-[.15em] text-blue-700">Modül 1.1 · Genel Veriler</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 text-[10px] font-extrabold text-slate-600">İşletmenin adı *<input className={`${inputClass} mt-1`} value={profile.companyName} onChange={(e) => set("companyName", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Tarih<input className={`${inputClass} mt-1`} type="date" value={profile.date} onChange={(e) => set("date", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Mali sicil / KDV no<input className={`${inputClass} mt-1`} value={profile.fiscalNo} onChange={(e) => set("fiscalNo", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">İrtibat kişisi *<input className={`${inputClass} mt-1`} value={profile.contactName} onChange={(e) => set("contactName", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Görevi<input className={`${inputClass} mt-1`} value={profile.role} onChange={(e) => set("role", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">E-posta *<input className={`${inputClass} mt-1`} type="email" value={profile.email} onChange={(e) => set("email", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Telefon<input className={`${inputClass} mt-1`} value={profile.phone} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">İnternet sitesi<input className={`${inputClass} mt-1`} value={profile.website} onChange={(e) => set("website", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Çalışan sayısı *<select className={`${inputClass} mt-1`} value={profile.staffSize} onChange={(e) => set("staffSize", e.target.value)}><option value="">Seçiniz</option>{STAFF_SIZES.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label className="text-[10px] font-extrabold text-slate-600">Kuruluş yılı<input className={`${inputClass} mt-1`} inputMode="numeric" maxLength={4} value={profile.foundationYear} onChange={(e) => set("foundationYear", e.target.value.replace(/\D/g, "").slice(0,4))} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Ülke<input className={`${inputClass} mt-1`} value={profile.country} onChange={(e) => set("country", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Bölge (NUTS2)<input className={`${inputClass} mt-1`} placeholder="Örn. TR21 Tekirdağ, Edirne, Kırklareli" value={profile.region} onChange={(e) => set("region", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">Posta kodu<input className={`${inputClass} mt-1`} value={profile.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></label>
          <label className="text-[10px] font-extrabold text-slate-600">PIC (varsa)<input className={`${inputClass} mt-1`} value={profile.pic} onChange={(e) => set("pic", e.target.value)} /></label>
          <label className="sm:col-span-2 text-[10px] font-extrabold text-slate-600">Açık adres<textarea className={`${inputClass} mt-1 min-h-[72px] resize-none`} value={profile.address} onChange={(e) => set("address", e.target.value)} /></label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-[10px] font-black uppercase tracking-[.15em] text-blue-700">Modül 1.2 · Faaliyet Sektörü</div>
        <label className="mt-4 block text-[10px] font-extrabold text-slate-600">Ana faaliyet sektörü *<select className={`${inputClass} mt-1`} value={profile.primarySector} onChange={(e) => set("primarySector", e.target.value)}><option value="">Seçiniz</option>{SECTORS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <div className="mt-4 flex items-center justify-between"><div className="text-[10px] font-extrabold text-slate-600">Diğer faaliyet sektörleri</div><div className="text-[9px] font-bold text-slate-400">En fazla 3 seçim</div></div>
        <div className="mt-2 grid max-h-[310px] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {SECTORS.map((sector) => {
            const selected = profile.secondarySectors.includes(sector);
            const disabled = !selected && profile.secondarySectors.length >= 3;
            return <button key={sector} type="button" disabled={disabled} onClick={() => toggleSecondary(sector)} className={`rounded-xl border px-2.5 py-2 text-left text-[9px] font-bold leading-4 ${selected ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-slate-50 text-slate-600 disabled:opacity-40"}`}>{sector}</button>;
          })}
        </div>
        <label className="mt-3 block text-[10px] font-extrabold text-slate-600">Listede olmayan diğer sektör<input className={`${inputClass} mt-1`} value={profile.otherSector} onChange={(e) => set("otherSector", e.target.value)} /></label>
        <label className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[9.5px] leading-5 text-slate-600">
          <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>Değerlendirme verilerimin Çorlu TSO tarafından DMAT raporunun oluşturulması ve proje hizmetlerinin izlenmesi amacıyla işlenmesini onaylıyorum.</span>
        </label>
      </section>
    </div>
  );
}

function ResultView({ profile, answers, result, onRestart, onMethodology }) {
  const [pdfState, setPdfState] = useState("idle");
  const overallLevel = result.level;
  const weak = [...DMAT_DIMENSIONS].sort((a,b) => result.dimensionScores[a.id] - result.dimensionScores[b.id]);

  const handlePdf = async () => {
    setPdfState("generating");
    try { await generatePdfReport({ profile, answers, result }); }
    finally { setPdfState("idle"); }
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-[28px] bg-slate-950 p-6 text-white">
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-amber-300">DMAT Genel Skor</div>
          <div className="mt-4 flex items-end gap-2"><span className="text-6xl font-black tracking-tight">{result.overall.toFixed(1)}</span><span className="pb-2 text-lg font-bold text-white/45">/100</span></div>
          <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-extrabold">{overallLevel.name} · {overallLevel.official}</div>
          <p className="mt-5 text-[10.5px] leading-6 text-white/60">Genel skor, altı DMAT boyut skorunun aritmetik ortalamasıdır. Bu sonuç EDIH/JRC DMAT puanlama yaklaşımına göre hesaplanmıştır.</p>
          <div className="mt-5 flex gap-2">
            <button onClick={handlePdf} disabled={pdfState === "generating"} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-[10px] font-black hover:bg-amber-500 disabled:opacity-50"><Download size={14} />{pdfState === "generating" ? "Rapor hazırlanıyor…" : "PDF Raporu"}</button>
            <button onClick={onMethodology} className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-white/70"><BookOpen size={15} /></button>
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-4"><RadarChart scores={result.dimensionScores} /></div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DMAT_DIMENSIONS.map((d) => {
          const score = result.dimensionScores[d.id];
          const interp = dimensionInterpretation(d.id, score);
          return <div key={d.id} className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[.14em] text-blue-700">Boyut {d.no}</div><div className="mt-1 text-[12px] font-black text-slate-900">{d.title}</div></div><ScoreBadge score={score} /></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${score}%` }} /></div>
            <div className="mt-2 text-[9px] font-extrabold uppercase tracking-wide text-slate-400">{interp.level.name} · {interp.level.official}</div>
            <p className="mt-2 text-[9.5px] leading-5 text-slate-600">{interp.text}</p>
          </div>;
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2"><BarChart3 size={17} className="text-blue-600" /><h3 className="text-sm font-black text-slate-900">11 DMAT sorusunun puanları</h3></div>
          <div className="mt-4 space-y-2">
            {[
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
            ].map(([code, label, score]) => <div key={code} className="grid grid-cols-[42px_1fr_54px] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"><span className="text-[9px] font-black text-blue-700">{code}</span><span className="text-[9.5px] font-semibold text-slate-600">{label}</span><span className="text-right text-[10px] font-black text-slate-900">{score.toFixed(1)}/10</span></div>)}
          </div>
        </div>

        <div className="rounded-3xl bg-blue-700 p-5 text-white">
          <div className="text-[9px] font-black uppercase tracking-[.15em] text-blue-200">Öncelikli DMAT alanları</div>
          <div className="mt-4 space-y-3">
            {weak.slice(0,3).map((d, i) => {
              const score = result.dimensionScores[d.id];
              const interp = dimensionInterpretation(d.id, score);
              return <div key={d.id} className="rounded-2xl border border-white/10 bg-white/[.08] p-4"><div className="flex items-center justify-between gap-3"><div className="text-[10.5px] font-black"><span className="mr-2 text-blue-200">0{i+1}</span>{d.title}</div><span className="text-[11px] font-black text-white">{score.toFixed(1)}</span></div><p className="mt-2 text-[9.5px] leading-5 text-white/65">{interp.text}</p></div>;
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/25 p-3 text-[9px] leading-5 text-white/55">PDF raporunda firma bilgileri, genel skor, 6 boyut skoru, soru skorları, yanıt dökümü, DMAT metodolojisi ve kaynakları yer alır.</div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button onClick={onMethodology} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-extrabold text-slate-600"><BookOpen size={13}/> Metodoloji ve Kaynaklar</button>
        <button onClick={onRestart} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[10px] font-extrabold text-white"><RotateCcw size={13}/> Yeni Değerlendirme</button>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0); // 0 profile, 1..6 dimensions, 7 result
  const [profile, setProfile] = useState(initialProfile);
  const [answers, setAnswers] = useState(createInitialAnswers);
  const [consent, setConsent] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [result, setResult] = useState(null);
  const [saveState, setSaveState] = useState("idle");

  const currentDimension = step >= 1 && step <= 6 ? DMAT_DIMENSIONS[step - 1] : null;
  const progress = step === 7 ? 100 : Math.round((step / 7) * 100);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(profile.companyName.trim() && profile.contactName.trim() && profile.email.trim() && profile.staffSize && profile.primarySector && consent);
    if (currentDimension) return currentDimension.questions.every((qid) => isQuestionComplete(qid, answers));
    return true;
  }, [step, currentDimension, profile, consent, answers]);

  const updateArrayAnswer = (qid, idx, val) => setAnswers((a) => {
    const next = [...a[qid]];
    next[idx] = val;
    return { ...a, [qid]: next };
  });

  const finish = async () => {
    const nextResult = calculateDMAT(answers);
    setResult(nextResult);
    setStep(7);
    setSaveState("saving");
    const ok = await saveAssessment({
      firmName: profile.companyName,
      contactName: profile.contactName,
      email: profile.email,
      phone: profile.phone,
      answers: { profile, dmat: answers },
      scores: { questions: nextResult.questionScores, dimensions: nextResult.dimensionScores },
      overall: nextResult.overall,
      levelName: `${nextResult.level.name} (${nextResult.level.official})`,
      consent,
    });
    setSaveState(ok ? "saved" : "local");
  };

  const next = () => {
    if (!canContinue) return;
    if (step < 6) setStep((s) => s + 1);
    else finish();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setStep(0);
    setProfile(initialProfile());
    setAnswers(createInitialAnswers());
    setConsent(false);
    setResult(null);
    setSaveState("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900">
      {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/ctso-logo.png" alt="Çorlu TSO" className="h-10 w-10 object-contain" />
            <div className="min-w-0">
              <div className="truncate text-[9px] font-black uppercase tracking-[.16em] text-blue-700">EDIH · Digital Maturity Assessment Tool</div>
              <div className="truncate text-sm font-black text-slate-900 sm:text-base">DMAT Dijital Olgunluk Değerlendirmesi</div>
            </div>
          </div>
          <button onClick={() => setShowMethodology(true)} className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[9px] font-extrabold text-slate-600 hover:bg-slate-50"><BookOpen size={13}/><span className="hidden sm:inline">Metodoloji</span></button>
        </div>
        <div className="h-1 bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        {step < 7 && (
          <>
            <section className="mb-4 rounded-[28px] bg-slate-950 p-5 text-white sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[.16em] text-amber-300">{step === 0 ? "Modül 1 · Müşteri Verileri" : `Modül 2 · Boyut ${currentDimension.no} / 06`}</div>
                  <h1 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{step === 0 ? "İşletme Bilgileri" : currentDimension.title}</h1>
                  <p className="mt-2 max-w-3xl text-[10.5px] leading-6 text-white/60">{step === 0 ? "DMAT'ın müşteri verileri modülü. Bu bilgiler puanlamaya dahil edilmez; değerlendirme kaydı ve rapor üst bilgisi için kullanılır." : currentDimension.description}</p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/[.07] px-4 py-3"><FileText size={16} className="text-amber-300"/><div><div className="text-[9px] font-extrabold text-white/50">İlerleme</div><div className="text-[12px] font-black">{step}/7 · %{progress}</div></div></div>
              </div>
            </section>

            {step === 0 ? <ProfileForm profile={profile} setProfile={setProfile} consent={consent} setConsent={setConsent} /> : (
              <div className="space-y-4">
                {currentDimension.questions.map((qid) => {
                  const q = QUESTIONS[qid];
                  return <section key={qid} className="rounded-[28px] border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-[11px] font-black text-white">Q{q.no}</div>
                      <div><h2 className="text-[12px] font-black leading-6 text-slate-900">{q.title}</h2>{q.type === "scale05" && <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-400"><Info size={11}/> Her satır için 0–5 arasında bir değer seçin.</div>}{q.type === "partial" && <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-400"><Info size={11}/> Her satırı Hayır / Kısmen / Evet olarak değerlendirin.</div>}</div>
                    </div>
                    <div className="mt-4">
                      {qid === "q1" && <MatrixQuestion answers={answers} setAnswers={setAnswers} />}
                      {q.type === "multi" && <MultiQuestion q={q} value={answers[qid]} onChange={(v) => setAnswers((a) => ({...a, [qid]: v}))} />}
                      {q.type === "scale05" && <Scale05Question q={q} values={answers[qid]} onChange={(idx,val) => updateArrayAnswer(qid,idx,val)} />}
                      {q.type === "partial" && <PartialQuestion q={q} values={answers[qid]} onChange={(idx,val) => updateArrayAnswer(qid,idx,val)} />}
                    </div>
                  </section>;
                })}
              </div>
            )}

            {!canContinue && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[10px] font-bold leading-5 text-amber-900">Devam etmek için bu ekrandaki zorunlu alanları tamamlayın. Çoklu seçim sorularında hiçbir seçenek geçerli değilse “Yukarıdakilerin hiçbiri”ni seçin.</div>}

            <div className="mt-5 flex items-center justify-between gap-3">
              <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s-1))} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-extrabold text-slate-600 disabled:opacity-30"><ArrowLeft size={14}/> Geri</button>
              <button disabled={!canContinue} onClick={next} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[10px] font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">{step === 6 ? "DMAT Sonucunu Hesapla" : "Devam Et"}<ArrowRight size={14}/></button>
            </div>
          </>
        )}

        {step === 7 && result && (
          <>
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] font-bold text-emerald-900"><span className="flex items-center gap-2"><CircleCheck size={15}/> DMAT değerlendirmesi tamamlandı.</span><span className="text-[9px] font-semibold text-emerald-700">{saveState === "saved" ? "Kayıt gönderildi" : saveState === "saving" ? "Kaydediliyor…" : "Sonuç tarayıcıda hazır"}</span></div>
            <ResultView profile={profile} answers={answers} result={result} onRestart={restart} onMethodology={() => setShowMethodology(true)} />
          </>
        )}
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[9px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Çorlu Ticaret ve Sanayi Odası · DMAT Dijital Olgunluk Değerlendirmesi</span>
          <button onClick={() => setShowMethodology(true)} className="flex items-center gap-1.5 font-extrabold text-blue-700"><BookOpen size={11}/> EDIH / DMAT metodolojisi</button>
        </div>
      </footer>
    </div>
  );
}
