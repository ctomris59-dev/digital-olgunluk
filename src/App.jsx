import React, { useState, useMemo } from "react";
import { ArrowRight, ArrowLeft, RotateCcw, ExternalLink, CircleCheck, X, Download, GraduationCap, ShieldCheck, CheckCircle2, ChevronRight, Award } from "lucide-react";
import { saveAssessment, saveTrainingSignup } from "./lib/supabaseClient";
import { notifyTrainingSignup } from "./lib/emailNotify";
import { AXES, SCALE_LABELS, LEVELS, levelFor, statusFor, axisLevelGuide } from "./lib/data";
import { generatePdfReport } from "./lib/pdfReport";

/* ---------------------------------------------------------------
   RENK SKALASI DİNAMİK YARDIMCI FONKSİYONU
--------------------------------------------------------------- */
function getScoreColorConfig(score) {
  if (score < 2.0) {
    return {
      barBg: "bg-red-500",
      badgeBg: "bg-red-50 text-red-700 border-red-200",
      text: "text-red-600",
      label: "Kritik"
    };
  } else if (score < 3.0) {
    return {
      barBg: "bg-orange-500",
      badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
      text: "text-orange-600",
      label: "Gelişime Açık"
    };
  } else if (score < 4.0) {
    return {
      barBg: "bg-amber-500",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
      text: "text-amber-700",
      label: "Orta Seviye"
    };
  } else if (score < 4.5) {
    return {
      barBg: "bg-emerald-500",
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      text: "text-emerald-700",
      label: "İyi Seviye"
    };
  } else {
    return {
      barBg: "bg-blue-600",
      badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
      text: "text-blue-800",
      label: "Lider"
    };
  }
}

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
        <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">METODOLOJİ</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Bu Değerlendirmenin Bilimsel Dayanağı</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-sm space-y-4 leading-relaxed text-slate-700">
          <p>
            Bu araç, Çorlu Ticaret ve Sanayi Odası tarafından özgün olarak geliştirilmiştir.
            Herhangi bir ticari veya akademik aracın birebir kopyası değildir — aşağıda
            listelenen uluslararası kabul görmüş dijital olgunluk çerçevelerinin
            kavramsal yapısından esinlenerek tasarlanmış, KOBİ'lere yönelik hafif bir
            <strong className="text-slate-900"> ön-tarama (self-assessment) aracıdır.</strong>
          </p>

          <div>
            <div className="text-sm font-semibold mb-2 text-slate-900">Referans Alınan Çerçeveler</div>
            <ul className="space-y-2.5 list-none pl-0">
              <li className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <strong className="text-slate-900">1. acatech Industrie 4.0 Maturity Index</strong> — Almanya Ulusal Bilim
                ve Mühendislik Akademisi (Schuh vd., 2017/2020). Kaynaklar, Bilgi Sistemleri,
                Organizasyonel Yapı ve Kültür olmak üzere 4 yapısal alanda, 6 aşamalı
                (Bilgisayarlaşma → Bağlanabilirlik → Görünürlük → Şeffaflık → Öngörü
                Yeteneği → Uyarlanabilirlik) bir olgunluk modeli sunar. Aracımızın genel
                olgunluk seviyeleri bu 6 aşamalı yapıdan uyarlanmıştır.
              </li>
              <li className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <strong className="text-slate-900">2. MIT Center for Digital Business & Capgemini — Digital Maturity Model</strong> —
                Westerman, Bonnet & McAfee (2014), <em>"Leading Digital"</em>, Harvard Business
                Review Press. Dijital Yoğunluk ile Dönüşüm Yönetimi Yoğunluğu'nun birlikte
                ölçülmesi gerektiği ilkesi, aracımızın Dijital Yetkinlik ve İnsan Kaynağı
                eksenine yansıtılmıştır.
              </li>
              <li className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <strong className="text-slate-900">3. Avrupa Komisyonu EDIH Ağı — Open DMAT</strong> (Digital Maturity
                Assessment Tool for SMEs). Dijital İş Stratejisi, Dijital Hazırlık, İnsan
                Odaklı Dijitalleşme, Veri Yönetimi, Otomasyon & Yapay Zeka ve Yeşil
                Dijitalleşme eksenlerini kapsar; aracımızın 6 ekseni kavramsal olarak bu
                yapıyla örtüşecek şekilde tasarlanmıştır.
              </li>
              <li className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <strong className="text-slate-900">4. Capability Maturity Model (CMMI Institute / SEI, Carnegie Mellon
                Üniversitesi)</strong> — Kademeli olgunluk seviyesiyle süreç değerlendirme
                metodolojisinin genel bilimsel temelini oluşturur; anket tabanlı
                öz-değerlendirme yaklaşımımız bu geleneği takip eder.
              </li>
              <li className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <strong className="text-slate-900">5. ISO/IEC 33001 Standart Ailesi</strong> (Bilgi Teknolojisi — Süreç
                Değerlendirmesi) — ISO/IEC 15504 (SPICE)'ın halefi olan bu uluslararası
                standart, süreçlerin "Eksik"ten "Yenilikçi"ye uzanan yetkinlik seviyelerine
                göre değerlendirilmesi için resmi terminoloji ve metodolojik çerçeve sağlar.
                Eksen bazlı seviye kademelendirmemizin resmi standardizasyon referansıdır.
              </li>
              <li className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <strong className="text-slate-900">6. OECD Going Digital Toolkit</strong> — OECD'nin, ülkelerin dijital
                dönüşümünü Altyapıya Erişim, Etkin Kullanım, İnovasyon, Nitelikli İşler,
                Sosyal Kapsayıcılık, Dijital Çağda Güven ve Pazar Açıklığı olmak üzere 7
                politika boyutunda ölçtüğü gösterge çerçevesi. Müşteri/Pazar, Dijital
                Yetkinlik ve Siber Güvenlik eksenlerimizdeki gösterge seçim mantığına ek bir
                makro referans noktası sağlamıştır.
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2 text-slate-900">Eksen — Çerçeve Eşleştirme Tablosu</div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Eksen</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Ana Referans Çerçeve(ler)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {[
                    ["01 Süreç Dijitalleşmesi", "acatech (Bilgi Sistemleri) · ISO/IEC 33001 ailesi"],
                    ["02 Veri Yönetimi ve Analitik", "acatech (Bilgi Sistemleri) · EDIH (Veri Yönetimi)"],
                    ["03 Müşteri/Pazar Dijital Varlığı", "MIT & Capgemini · EDIH (Dijital İş Stratejisi)"],
                    ["04 Otomasyon ve Yapay Zeka", "acatech (Kaynaklar) · EDIH (Otomasyon & YZ)"],
                    ["05 Dijital Yetkinlik ve İnsan Kaynağı", "acatech (Org. Yapı/Kültür) · MIT & Capgemini · OECD (Nitelikli İşler)"],
                    ["06 Siber Güvenlik ve Altyapı", "acatech (Kaynaklar) · OECD (Dijital Çağda Güven)"],
                  ].map(([axis, fw]) => (
                    <tr key={axis} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">{axis}</td>
                      <td className="py-2 px-3">{fw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2 text-slate-900">Yöntem</div>
            <ul className="space-y-1.5 list-none pl-0 text-slate-600">
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
            <div className="text-sm font-semibold mb-2 text-slate-900">Bilimsel Yaklaşım ve Doğrulama Notu</div>
            <p className="mb-2">
              Bu aracın soru seti, yukarıdaki kurumsal/akademik çerçevelerin kavramsal
              içeriğine dayanan bir <strong>içerik geçerliliği</strong> (content validity) ve{" "}
              <strong>yüzey geçerliliği</strong> (face validity) yaklaşımıyla tasarlanmıştır —
              yani sorular, alanında tanınmış modellerin ölçmeyi amaçladığı yapıları uzman
              değerlendirmesiyle yansıtacak şekilde oluşturulmuştur.
            </p>
            <p>
              Şeffaflık gereği belirtilmelidir: bu aracın henüz geniş bir örneklemde{" "}
              <strong>ampirik psikometrik doğrulaması</strong> (ör. iç tutarlılık/Cronbach's
              alpha analizi, faktör analizi) yapılmamıştır. Çorlu TSO, aracı zamanla kalibre
              etmek amacıyla anonimleştirilmiş toplu yanıt verilerini periyodik olarak analiz
              etmeyi ve gerektiğinde soru/ağırlıklandırma güncellemeleri yapmayı
              planlamaktadır.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2 text-slate-900">Sonuçların Yorumlanması İçin Rehber İlkeler</div>
            <ul className="space-y-1.5 list-none pl-0 text-slate-600">
              <li>• Bu araç bir ön-tarama enstrümanıdır; kesin bir yargı değil, bir yönlendirmenin başlangıç noktasıdır.</li>
              <li>• Eşik değerlere yakın sonuçlar tek başına karar vermek yerine bir görüşmeyle teyit edilmelidir.</li>
              <li>• Eksen bazlı sonuçlar, tek bir genel puandan daha fazla aksiyon değeri taşır — genel puan "büyük resmi", eksen puanları "nereden başlanacağını" gösterir.</li>
              <li>• Sonuçlar, cevap veren kişinin firma hakkındaki bilgi düzeyine bağlıdır; farklı bir yetkilinin cevapları farklı sonuç verebilir.</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2 text-slate-900">Sınırlamalar</div>
            <p className="text-slate-600">
              Bu bir <strong>öz-beyan (self-report)</strong> anketidir, üçüncü taraf
              doğrulaması içermez. Sertifikalı bir değerlendirme değildir — TÜBİTAK TÜSSİDE
              D3A/DDX veya EDIH Open DMAT gibi resmi araçların yerine geçmez; onlara{" "}
              <strong>ön hazırlık</strong> niteliğindedir.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2 text-slate-900">Kaynakça</div>
            <ul className="space-y-1.5 list-none pl-0 text-xs text-slate-500 font-mono">
              <li>Schuh, G., Anderl, R., Gausemeier, J., ten Hompel, M., & Wahlster, W. (Eds.). (2020). Industrie 4.0 Maturity Index: Managing the Digital Transformation of Companies. acatech STUDY. Munich: Herbert Utz Verlag.</li>
              <li>Westerman, G., Bonnet, D., & McAfee, A. (2014). Leading Digital: Turning Technology into Business Transformation. Harvard Business Review Press.</li>
              <li>Westerman, G., Bonnet, D., & McAfee, A. (2014). The Nine Elements of Digital Transformation. MIT Sloan Management Review.</li>
              <li>European Commission, European Digital Innovation Hubs Network — Digital Maturity Assessment Tool (Open DMAT) for SMEs.</li>
              <li>CMMI Institute / Software Engineering Institute, Carnegie Mellon University — CMMI Capability Maturity Model Integration (jenerik 5 seviyeli olgunluk kademelendirmesi).</li>
              <li>ISO/IEC 33001:2015, ISO/IEC 33002:2015, ISO/IEC 33020:2019 — Information technology — Process assessment. International Organization for Standardization.</li>
              <li>OECD (2019). Going Digital: Shaping Policies, Improving Lives. OECD Publishing, Paris. www.oecd.org/going-digital-toolkit.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DESTEK PROGRAMLARI
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

  // Toplam İlerleme Hesaplama
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
    if (axisIndex > 0) {
      setAxisIndex(axisIndex - 1);
    }
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
    <div className={`font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 ${
      screen === "quiz" ? "h-screen max-h-screen overflow-hidden flex flex-col bg-slate-100" : "min-h-screen bg-slate-50 flex flex-col"
    }`}>
      
{/* ==================== PRESTİJLİ VE MÜKEMMEL OTURAN KURUMSAL HEADER ==================== */}
      <header className="bg-[#091538] border-b border-amber-500/30 text-white flex-shrink-0 shadow-xl relative z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          
          {/* SOL TARAF: CUK OTURAN LOGO VE BAŞLIKLAR */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* LOGO KAPSAYICISI (SIKIŞMAYI VE BEYAZLIK ÇAKIŞMASINI ÖNLER) */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              
              {/* Sol Estetik Altın Parantez Yayı */}
              <svg className="h-10 sm:h-12 w-3 text-amber-400/80 mr-0.5" viewBox="0 0 12 40" fill="none">
                <path d="M10 2C4 10 4 30 10 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M5 8C2 14 2 26 5 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              </svg>

              {/* Dairesel Beyaz Çerçeveli Logo Kılıfı (Kare Beyaz Zemin Kaymasını Sıfırlar) */}
              <div className="relative h-11 w-11 sm:h-13 sm:w-13 rounded-full bg-white p-0.5 shadow-md ring-1 ring-amber-400/50 flex items-center justify-center overflow-hidden">
                <img
                  src="/ctso-logo.jpg"
                  alt="Çorlu TSO Logo"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>

              {/* Sağ Estetik Altın Parantez Yayı */}
              <svg className="h-10 sm:h-12 w-3 text-amber-400/80 ml-0.5" viewBox="0 0 12 40" fill="none">
                <path d="M2 2C8 10 8 30 2 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M7 8C10 14 10 26 7 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              </svg>

            </div>

            {/* Metin Yapısı */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none">
                  ÇORLU TİCARET VE SANAYİ ODASI
                </span>
                <span className="hidden md:inline-block h-1 w-1 rounded-full bg-slate-500"></span>
                <span className="hidden md:inline-block text-[10px] font-medium text-slate-300 uppercase tracking-wider">
                  DİJİTAL DÖNÜŞÜM PORTALI
                </span>
              </div>
              <div className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-tight mt-0.5">
                Dijital Olgunluk Ölçüm Aracı
              </div>
            </div>
          </div>

          {/* SAĞ TARAF: SADELEŞTİRİLMİŞ DANIŞMANLIK METNİ */}
          <div className="hidden md:flex items-center">
            <div className="text-right">
              <div className="text-[11px] font-medium text-slate-300 tracking-wide">
                KOBİ Ön-Tarama ve Danışmanlık Hizmeti
              </div>
            </div>
          </div>

          {/* MOBİL İLERLEME ROZETİ */}
          {screen !== "intro" && (
            <div className="md:hidden inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900 text-amber-400 border border-slate-800">
              {screen === "quiz" ? `%${progressPercent}` : "RAPOR"}
            </div>
          )}

        </div>

        {/* İnce Altın Çizgi */}
        <div className="h-[2px] w-full bg-gradient-to-r from-amber-600/20 via-amber-400/80 to-amber-600/20"></div>
      </header>

      {/* ANA İÇERİK KONTEYNERİ */}
      <main className={`max-w-5xl mx-auto px-4 w-full ${
        screen === "quiz" ? "flex-grow flex flex-col justify-between py-2 overflow-hidden" : "py-8 sm:py-12 flex-grow"
      }`}>
        {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}

        {/* EKRAN 1: INTRO */}
        {screen === "intro" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* HERO BÖLÜMÜ */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                <ShieldCheck size={18} className="text-amber-600" />
                <span>ÇORLU TİCARET VE SANAYİ ODASI DİJİTAL DÖNÜŞÜM HİZMETİ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                Firmanızın dijital olgunluk seviyesini ölçün.
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl mb-6">
                Çorlu Ticaret ve Sanayi Odası tarafından bölgemizdeki işletmelerin dijitalleşme süreçlerini desteklemek amacıyla geliştirilen bu ön değerlendirme aracı ile 6 stratejik eksende yetkinliklerinizi analiz edin.
              </p>

              {/* BİLGİ ROZETLERİ */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-900"></span>
                  <span>30 Soru</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-900"></span>
                  <span>6 Stratejik Eksen</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  <span>Anlık Sonuç & PDF Raporu</span>
                </div>
              </div>
            </div>

            {/* BİLİMSEL METODOLOJİ BANNERİ */}
            <div 
              onClick={() => setShowMethodology(true)}
              className="bg-slate-950 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-950 border border-blue-800 rounded-lg text-amber-400">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>BİLİMSEL METODOLOJİ VE KAYNAKÇA</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    acatech, MIT & Capgemini, AB EDIH, ISO/IEC 33001 ve OECD çerçevelerine dayanır — tam kaynakça için tıklayın →
                  </p>
                </div>
              </div>
              <div className="flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                Detaylar <ChevronRight size={16} className="ml-1" />
              </div>
            </div>

            {/* EKSENLER ÖZET KARTI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">DEĞERLENDİRME EKSENLERİ</h3>
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
                  Firma adı <span className="text-slate-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="Örn. ABC Makine Sanayi"
                  className="w-full sm:max-w-md px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowConsentText(true);
                      }}
                      className="font-semibold text-slate-800 underline hover:text-blue-900"
                    >
                      KVKK Aydınlatma Metni
                    </button>
                    'ni okudum, verilerimin bu amaçla işlenmesini kabul ediyorum.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => consent && setScreen("quiz")}
                  disabled={!consent}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  Değerlendirmeye Başla <ArrowRight size={16} />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                VERİ KULLANIMI: Cevaplarınız yalnızca firmanız için bu raporu oluşturmak ve size uygun destek programı önerilebilmesi için kullanılır.
              </p>
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
                <p><strong>Veri Sorumlusu:</strong> Çorlu Ticaret ve Sanayi Odası (Çorlu TSO), Çorlu / Tekirdağ.</p>
                <p><strong>İşlenen Veriler:</strong> Firma adı (opsiyonel) ve bu değerlendirme formunda verdiğiniz cevaplar.</p>
                <p><strong>İşleme Amacı:</strong> Firmanızın dijital olgunluk seviyesini ölçmek, size özel bir sonuç raporu oluşturmak ve size uygun destek programına (KOSGEB, EDIH, TÜBİTAK TÜSSİDE vb.) yönlendirme yapabilmesini sağlamaktır.</p>
                <p><strong>Saklama Süresi:</strong> Verileriniz saklanmamaktadır.</p>
                <p><strong>Paylaşım:</strong> Verileriniz yalnızca Çorlu TSO tarafından görülebilir; üçüncü kişi/kurumlarla paylaşılmaz.</p>
                <p><strong>Haklarınız:</strong> KVKK'nın 11. maddesi kapsamında verilerinize erişme, düzeltme, silinmesini talep etme haklarına sahipsiniz. Talepleriniz için Çorlu TSO Proje Servisi ile iletişime geçebilirsiniz.</p>
              </div>
              <button
                onClick={() => setShowConsentText(false)}
                className="mt-6 w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        )}

        {/* EKRAN 2: QUIZ (100VH NO-SCROLL MATRİS DÜZENİ) */}
        {screen === "quiz" && (
          <div className="h-full flex flex-col justify-between space-y-2 overflow-hidden">
            
            {/* ÜST BİLGİ & İLERLEME BARI */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex-shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    EKSEN {currentAxis.no} / {AXES.length}
                  </span>
                  <span className="hidden sm:inline text-slate-800 font-extrabold">{currentAxis.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px] font-semibold">Toplam İlerleme:</span>
                  <span className="text-blue-900 font-black">% {progressPercent}</span>
                </div>
              </div>

              {/* İLERLEME ÇUBUĞU */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-900 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* EKSEN TABLARI */}
              <div className="flex gap-1 overflow-x-auto pt-0.5">
                {AXES.map((a, i) => {
                  const done = a.questions.every((_, qi) => answers[`${a.id}-${qi}`]);
                  const isCurrent = i === axisIndex;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setAxisIndex(i)}
                      className={`flex-1 min-w-[90px] py-1 px-1.5 rounded text-[11px] font-bold transition-all border text-center truncate ${
                        isCurrent
                          ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                          : done
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {a.no}. {a.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* KART GÖVDESİ & MATRİS TABLOSU (NO SCROLL) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-md flex-grow flex flex-col justify-between overflow-hidden">
              
              {/* EKSEN AÇIKLAMASI & ÖLÇEK REHBERİ */}
              <div className="flex-shrink-0 border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="text-base font-black text-slate-900">{currentAxis.title}</h2>
                  <span className="text-xs font-semibold text-slate-400">
                    {answeredCount} / {currentAxis.questions.length} Cevaplandı
                  </span>
                </div>
                <p className="text-slate-500 text-xs truncate mb-2">{currentAxis.intro}</p>

                {/* TEK SATIR LIKERT REHBERİ */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg py-1 px-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="text-red-600">1: {SCALE_LABELS[0]}</span>
                  <span className="text-orange-600">2: {SCALE_LABELS[1]}</span>
                  <span className="text-amber-600">3: {SCALE_LABELS[2]}</span>
                  <span className="text-emerald-600">4: {SCALE_LABELS[3]}</span>
                  <span className="text-blue-600">5: {SCALE_LABELS[4]}</span>
                </div>
              </div>

              {/* 5 SORULUK KOMPAKT MATRİS LİSTESİ */}
              <div className="flex-grow flex flex-col justify-around py-1 space-y-1">
                {currentAxis.questions.map((q, qi) => {
                  const val = answers[`${currentAxis.id}-${qi}`];
                  const isAnswered = val !== undefined;

                  return (
                    <div 
                      key={qi} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg border transition-all ${
                        isAnswered 
                          ? "bg-blue-50/40 border-blue-200" 
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      {/* SORU METNİ */}
                      <div className="flex items-start gap-2 max-w-xl">
                        <span className={`flex-shrink-0 h-5 w-5 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5 ${
                          isAnswered ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {qi + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          {q}
                        </p>
                      </div>

                      {/* 1-5 BUTONLARI (YAN YANA MATRİS) */}
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 self-end sm:self-center">
                        {[1, 2, 3, 4, 5].map((v) => {
                          const active = val === v;
                          return (
                            <button
                              key={v}
                              onClick={() => setAnswer(qi, v)}
                              className={`h-8 w-10 sm:h-8 sm:w-11 rounded-md font-black text-xs transition-all border flex items-center justify-center ${
                                active
                                  ? "bg-blue-900 text-white border-blue-900 shadow-sm scale-105"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                              }`}
                            >
                              {v}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ALT NAVİGASYON */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-shrink-0 mt-1">
                <button
                  onClick={goPrevAxis}
                  disabled={axisIndex === 0}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <ArrowLeft size={14} /> Önceki Eksen
                </button>
                <button
                  onClick={goNextAxis}
                  disabled={!axisComplete}
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {axisIndex === AXES.length - 1 ? "Sonucu Gör" : "Sonraki Eksen"} <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* EKRAN 3: RESULTS */}
        {screen === "results" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* BAŞLIK & İNDİRME */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {firmName && <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">{firmName}</div>}
                <h2 className="text-2xl font-bold text-slate-900">Dijital Olgunluk Sonucu</h2>
                <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
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
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={16} /> {pdfState === "generating" ? "Rapor Hazırlanıyor…" : "Raporu PDF Olarak İndir"}
              </button>
            </div>

            {saveState === "saved" && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                ✓ SONUÇ ÇORLU TİCARET VE SANAYİ ODASI'NA İLETİLDİ
              </p>
            )}

            {/* GENEL SKOR KARTI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:border-r md:border-slate-100 md:pr-8">
                <Gauge value={overall} />
                <div className="text-xl font-extrabold text-blue-900 mt-2">{level.name}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5 mb-4">GENEL OLGUNLUK PUANI · 5 ÜZERİNDEN</div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-left text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Öncelik:</strong> {level.recommendation}
                </div>
              </div>
              <RadarChart scores={scores} />
            </div>

            {/* EKSEN BAZLI DETAYLAR */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">EKSEN BAZLI SONUÇLAR VE YÖNLENDİRMELER</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Her eksendeki puan, CMMI'ın 5 seviyeli olgunluk merdivenine göre renk skalası ile değerlendirilir.
                </p>
              </div>

              <div className="grid gap-3">
                {AXES.map((a) => {
                  const s = scores[a.id];
                  const colorCfg = getScoreColorConfig(s);
                  const guide = axisLevelGuide(a, s);
                  return (
                    <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{a.no} {a.title}</span>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${colorCfg.badgeBg}`}>
                          {s.toFixed(2)} / 5.00
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colorCfg.barBg} rounded-full transition-all duration-500`} style={{ width: `${(s / 5) * 100}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold uppercase tracking-wider ${colorCfg.text}`}>
                          SEVİYE {guide.level} — {guide.name.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {colorCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">{guide.description}</p>
                      
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                        <div className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Stratejik Aksiyon Yol Haritası
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {guide.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ÖNCELİKLİ GELİŞİM ALANLARI */}
            {weakAxes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ÖNCELİKLİ GELİŞİM ALANLARI İÇİN ÖNERİLEN KAYNAKLAR</h3>
                <div className="grid gap-3">
                  {weakAxes.map((a) => (
                    <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                      <div className="text-sm font-bold text-slate-900">{a.title}</div>
                      <div className="space-y-2">
                        {a.resources.map((r) => (
                          <div key={r.name} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg">
                            <div className="text-xs text-slate-700">{r.name}</div>
                            {r.url && (
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-white border border-slate-200 hover:border-blue-900 text-slate-800 text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
                              >
                                Kaynağa Git <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EĞİTİM KAYIT FORMU */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <CircleCheck className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Ücretsiz Eğitimlerden Haberdar Olun</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Çorlu TSO'nun Dijital Dönüşüm, Yapay Zeka ve Dijitalleşme konularındaki ücretsiz eğitimlerinden haberdar olmak isterseniz, iletişim bilgilerinizi bırakabilirsiniz.
                  </p>
                </div>
              </div>

              {trainingState === "saved" ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold">
                  ✓ Kaydınız alındı. Eğitim duyuruları e-posta/telefon ile size iletilecek.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <input
                    value={trainingEmail}
                    onChange={(e) => setTrainingEmail(e.target.value)}
                    placeholder="E-posta adresiniz *"
                    type="email"
                    className="px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <input
                    value={trainingPhone}
                    onChange={(e) => setTrainingPhone(e.target.value)}
                    placeholder="Telefon (opsiyonel)"
                    type="tel"
                    className="px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
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
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {trainingState === "saving" ? "Kaydediliyor…" : "Eğitim Bildirimlerine Kaydol"}
                </button>
              )}
            </div>

            {/* DESTEK PROGRAMLARI */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destek Programları</h4>
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

            {/* METODOLOJİ ÖZET BÖLÜMÜ */}
            <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-6 space-y-3">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">BİLİMSEL METODOLOJİ VE KAYNAKÇA</div>
              <div className="text-sm font-bold text-slate-900">Bu değerlendirme neye dayanıyor?</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bu araç; acatech Industrie 4.0 Maturity Index (Almanya Ulusal Bilim ve Mühendislik Akademisi), MIT & Capgemini Digital Maturity Model (Westerman, Bonnet & McAfee), Avrupa Komisyonu EDIH Open DMAT, ISO/IEC 33001 süreç değerlendirme standardı ve OECD Going Digital Toolkit çerçevelerinden esinlenerek Çorlu Ticaret ve Sanayi Odası tarafından özgün olarak geliştirilmiştir. Sertifikalı bir değerlendirme değildir; resmi araçlara ön hazırlık niteliğindedir.
              </p>
              <button
                onClick={() => setShowMethodology(true)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Detaylı Metodolojiyi ve Kaynakçayı Gör
              </button>
            </div>

            {/* BAŞTAN BAŞLA */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={restart}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center gap-2"
              >
                <RotateCcw size={14} /> Yeniden Başlat
              </button>
            </div>
          </div>
        )}
      </main>

      {/* SADELEŞTİRİLMİŞ KURUMSAL FOOTER */}
      {screen !== "quiz" && (
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4">
            <p className="font-semibold text-slate-700">Çorlu Ticaret ve Sanayi Odası © {new Date().getFullYear()}</p>
            <p className="mt-1 text-[11px] text-slate-400">Dijital Dönüşüm Hizmetleri</p>
          </div>
        </footer>
      )}
    </div>
  );
}
