import React, { useState, useMemo } from "react";
import { ArrowRight, ArrowLeft, RotateCcw, ExternalLink, CircleCheck } from "lucide-react";

/* ---------------------------------------------------------------
   VERİ MODELİ
--------------------------------------------------------------- */

const AXES = [
  {
    id: "process",
    no: "01",
    short: "Süreç",
    title: "Süreç Dijitalleşmesi",
    intro: "İş süreçlerinizin kağıt/manuel mi, yoksa yazılım destekli mi yürüdüğünü ölçer.",
    questions: [
      "Muhasebe, stok, satış gibi temel iş süreçlerimiz kağıt/Excel yerine bir yazılım üzerinden yürütülür.",
      "Departmanlar arası bilgi akışı, manuel tekrar girişi gerektirmeden dijital bir sistem üzerinden aktarılır.",
      "İş süreçlerindeki darboğazları düzenli olarak dijital araçlarla (raporlama, dashboard) takip ederiz.",
      "Yeni bir dijital araç devreye alma kararı, tanımlı bir sorumlu/süreç üzerinden yürütülür.",
    ],
    resource: {
      name: "KOSGEB İşletme Geliştirme Destek Programı",
      url: "https://www.kosgeb.gov.tr",
    },
  },
  {
    id: "data",
    no: "02",
    short: "Veri",
    title: "Veri Yönetimi ve Analitik",
    intro: "Verinin toplanma, saklanma ve karar almada kullanılma biçimini ölçer.",
    questions: [
      "Satış, üretim veya müşteri verilerimiz dağınık Excel dosyaları yerine merkezi bir sistemde toplanır.",
      "Yönetim kararları alınırken güncel veriye dayalı raporlar kullanılır.",
      "Verilerimizin yedeklenmesi düzenli ve otomatik olarak yapılır.",
      "Veri kalitesinden (doğruluk, güncellik, tutarlılık) sorumlu bir kişi veya süreç vardır.",
    ],
    resource: {
      name: "EDIH West Marmara — Veri Yönetimi Danışmanlığı",
      url: "https://european-digital-innovation-hubs.ec.europa.eu",
    },
  },
  {
    id: "market",
    no: "03",
    short: "Pazar",
    title: "Müşteri / Pazar Dijital Varlığı",
    intro: "E-ticaret, dijital pazarlama ve online müşteri ilişkilerindeki olgunluğu ölçer.",
    questions: [
      "Güncel tutulan bir web sitemiz ve/veya aktif sosyal medya hesabımız vardır.",
      "Ürün/hizmetlerimizi online kanallardan (e-ticaret, pazaryeri, B2B platform) satabiliyoruz.",
      "Müşteri talep ve şikayetleri dijital bir sistem (CRM, ticket sistemi) üzerinden takip edilir.",
      "Dijital pazarlama faaliyetlerimizin sonuçlarını ölçüp değerlendiririz.",
    ],
    resource: {
      name: "KOSGEB E-Ticaret Destek Programı",
      url: "https://www.kosgeb.gov.tr",
    },
  },
  {
    id: "automation",
    no: "04",
    short: "Otomasyon",
    title: "Otomasyon ve Yapay Zeka",
    intro: "Üretim ve operasyonda otomasyon ile YZ araçlarının benimsenme düzeyini ölçer.",
    questions: [
      "Üretim/operasyon süreçlerimizde otomasyon sistemleri (PLC, robotik, otomatik hat) kullanılır.",
      "Tekrarlayan idari işler için otomasyon araçları veya yazılım robotları kullanılır.",
      "Firmamızda yapay zeka destekli araçlar deneniyor veya kullanılıyor.",
      "Makine/ekipman verilerimiz (IoT sensör, performans verisi) dijital olarak izlenip analiz ediliyor.",
    ],
    resource: {
      name: "EDIH — Test-Before-Invest Hizmetleri",
      url: "https://european-digital-innovation-hubs.ec.europa.eu",
    },
  },
  {
    id: "people",
    no: "05",
    short: "Yetkinlik",
    title: "Dijital Yetkinlik ve İnsan Kaynağı",
    intro: "Çalışan yetkinliği ve yönetimin dijital dönüşüme verdiği önceliği ölçer.",
    questions: [
      "Çalışanlarımız günlük işlerinde kullandıkları dijital araçlar konusunda yeterli eğitim almıştır.",
      "Firmamızda dijital dönüşüm/yeni teknoloji konularında düzenli eğitim faaliyetleri yürütülür.",
      "Yönetim, dijital dönüşümü stratejik öncelik olarak görür ve kaynak ayırır.",
      "Çalışanlarımız yeni dijital araç ve sistemlere geçişte genel olarak açık ve uyumludur.",
    ],
    resource: {
      name: "Çorlu TSO Eğitim Programları",
      url: null,
    },
  },
  {
    id: "security",
    no: "06",
    short: "Güvenlik",
    title: "Siber Güvenlik ve Altyapı",
    intro: "IT altyapısı, veri güvenliği ve KVKK uyum farkındalığını ölçer.",
    questions: [
      "İnternet, sunucu, bulut altyapımız güncel ve ihtiyaçlarımızı karşılayacak durumdadır.",
      "Sistemlerimize erişim yetkilendirme ile kontrol edilir; şifre/erişim politikalarımız vardır.",
      "Siber saldırı, veri sızıntısı gibi risklere karşı önlemlerimiz (antivirüs, güvenlik duvarı vb.) mevcuttur.",
      "KVKK ve veri güvenliği yükümlülüklerimiz konusunda farkındalığımız ve uyum sürecimiz vardır.",
    ],
    resource: {
      name: "KOSGEB Bilgi Yönetimi Destek Programı",
      url: "https://www.kosgeb.gov.tr",
    },
  },
];

const SCALE_LABELS = ["Hiç yok", "Başlangıç", "Kısmen var", "Sistematik", "Tam entegre"];

const LEVELS = [
  { max: 1.99, name: "Başlangıç", desc: "Dijitalleşme büyük ölçüde yok veya plansız ilerliyor." },
  { max: 2.99, name: "Gelişen", desc: "Bazı adımlar atılmış ama dağınık ve sistemsiz." },
  { max: 3.99, name: "Yapılanan", desc: "Sistematik uygulamalar var, entegrasyon eksik." },
  { max: 4.49, name: "Olgun", desc: "Süreçler dijital ve entegre, sürekli takip var." },
  { max: 5.01, name: "Lider", desc: "Tam entegre, sürekli iyileştirme kültürü yerleşmiş." },
];

function levelFor(score) {
  return LEVELS.find((l) => score <= l.max) ?? LEVELS[LEVELS.length - 1];
}

function statusFor(score) {
  if (score < 3) return { label: "Öncelikli gelişim alanı", tone: "low" };
  if (score < 4) return { label: "Gelişim fırsatı", tone: "mid" };
  return { label: "Güçlü alan", tone: "high" };
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
   ANA UYGULAMA
--------------------------------------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | quiz | results
  const [firmName, setFirmName] = useState("");
  const [axisIndex, setAxisIndex] = useState(0);
  const [answers, setAnswers] = useState({});

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
    }
  };
  const goPrevAxis = () => {
    if (axisIndex > 0) setAxisIndex(axisIndex - 1);
  };

  const restart = () => {
    setAnswers({});
    setAxisIndex(0);
    setFirmName("");
    setScreen("intro");
  };

  const weakAxes = AXES.filter((a) => scores[a.id] > 0 && scores[a.id] < 3).sort(
    (a, b) => scores[a.id] - scores[b.id]
  );

  return (
    <div style={{ "--ink": "#1B2430", "--paper": "#F1EEE4", "--paper2": "#E8E4D6", "--brass": "#B5793A", "--steel": "#4E6A7A", "--grid": "#C9C3B0", "--red": "#A8442F", "--green": "#3F6E52" }}
      className="w-full min-h-screen flex items-center justify-center"
    >
      <style>{`
        .dmat-root { font-family: 'IBM Plex Sans', sans-serif; background: var(--paper); color: var(--ink); }
        .dmat-display { font-family: 'Space Grotesk', sans-serif; }
        .dmat-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.03em; }
        .dmat-card { background: #FBFAF5; border: 1px solid var(--grid); }
        .dmat-btn-primary { background: var(--ink); color: var(--paper); }
        .dmat-btn-primary:hover { background: #2A3546; }
        .dmat-btn-primary:disabled { background: var(--grid); color: #8A8574; cursor: not-allowed; }
        .dmat-btn-ghost { border: 1px solid var(--ink); color: var(--ink); background: transparent; }
        .dmat-btn-ghost:hover { background: var(--ink); color: var(--paper); }
        .dmat-tick { border: 1px solid var(--grid); background: #FBFAF5; transition: all .15s ease; }
        .dmat-tick:hover { border-color: var(--brass); }
        .dmat-tick.active { background: var(--brass); border-color: var(--brass); color: white; }
        .dmat-tab { border: 1px solid var(--grid); font-family: 'IBM Plex Mono', monospace; font-size: 11px; }
        .dmat-tab.done { background: var(--ink); color: var(--paper); border-color: var(--ink); }
        .dmat-tab.current { border-color: var(--brass); border-width: 2px; }
        .grid-bg {
          background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 28px 28px;
          background-position: center;
        }
      `}</style>

      <div className="dmat-root w-full min-h-screen grid-bg" style={{ backgroundColor: "var(--paper)" }}>
        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-10 pb-4" style={{ borderBottom: "1px solid var(--grid)" }}>
            <div>
              <div className="dmat-mono text-xs" style={{ color: "var(--steel)" }}>ÇORLU TSO — PROJE BİRİMİ</div>
              <div className="dmat-display text-lg font-semibold">Dijital Olgunluk Ölçüm Aracı</div>
            </div>
            {screen !== "intro" && (
              <div className="dmat-mono text-xs text-right" style={{ color: "var(--steel)" }}>
                {screen === "quiz" ? `EKSEN ${axisIndex + 1} / ${AXES.length}` : "SONUÇ RAPORU"}
              </div>
            )}
          </div>

          {/* INTRO */}
          {screen === "intro" && (
            <div>
              <div className="dmat-mono text-xs mb-3" style={{ color: "var(--brass)" }}>ÖN DEĞERLENDİRME · ~10 DAKİKA</div>
              <h1 className="dmat-display text-4xl font-bold leading-tight mb-5">
                Firmanızın dijital<br/>olgunluk seviyesini ölçün.
              </h1>
              <p className="text-base leading-relaxed mb-6" style={{ color: "#3A4250", maxWidth: 520 }}>
                6 eksende, 24 soruluk kısa bir değerlendirme ile firmanızın dijital dönüşümde
                bulunduğu noktayı görün. Sonuçlar; hangi alanda güçlü, hangi alanda öncelikli
                gelişim ihtiyacı olduğunuzu gösterir ve size uygun destek programlarına
                yönlendirir.
              </p>

              <div className="dmat-card p-5 mb-7" style={{ maxWidth: 520 }}>
                <div className="dmat-mono text-xs mb-3" style={{ color: "var(--steel)" }}>DEĞERLENDİRME EKSENLERİ</div>
                <div className="grid grid-cols-2 gap-2">
                  {AXES.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                      <span className="dmat-mono" style={{ color: "var(--brass)" }}>{a.no}</span>
                      <span>{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block mb-2 text-sm font-medium">Firma adı (opsiyonel)</label>
              <input
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Örn. ABC Makine Sanayi"
                className="w-full px-4 py-3 mb-6 text-sm outline-none"
                style={{ maxWidth: 420, background: "#FBFAF5", border: "1px solid var(--grid)" }}
              />

              <div>
                <button
                  onClick={() => setScreen("quiz")}
                  className="dmat-btn-primary px-6 py-3 text-sm font-medium inline-flex items-center gap-2"
                >
                  Değerlendirmeye Başla <ArrowRight size={16} />
                </button>
              </div>

              <p className="dmat-mono text-xs mt-8" style={{ color: "var(--steel)", maxWidth: 480 }}>
                VERİ KULLANIMI: Cevaplarınız yalnızca bu raporu oluşturmak ve Çorlu TSO
                Proje Birimi'nin size uygun destek programı önerebilmesi için kullanılır.
              </p>
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
              <h2 className="dmat-display text-2xl font-semibold mb-2">{currentAxis.title}</h2>
              <p className="text-sm mb-8" style={{ color: "#3A4250" }}>{currentAxis.intro}</p>

              <div className="space-y-7 mb-9">
                {currentAxis.questions.map((q, qi) => {
                  const val = answers[`${currentAxis.id}-${qi}`];
                  return (
                    <div key={qi}>
                      <p className="text-sm mb-3 leading-relaxed">{q}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setAnswer(qi, v)}
                            className={`dmat-tick flex-1 py-2.5 text-xs font-medium ${val === v ? "active" : ""}`}
                            title={SCALE_LABELS[v - 1]}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between dmat-mono text-[10px] mt-1.5" style={{ color: "var(--steel)" }}>
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
              <h2 className="dmat-display text-2xl font-semibold mb-1">Dijital Olgunluk Sonucu</h2>
              <p className="text-sm mb-8" style={{ color: "#3A4250" }}>{level.desc}</p>

              <div className="dmat-card p-6 mb-8 grid md:grid-cols-2 gap-6 items-center">
                <div className="text-center">
                  <Gauge value={overall} />
                  <div className="dmat-display text-xl font-bold mt-1" style={{ color: "var(--brass)" }}>{level.name}</div>
                  <div className="dmat-mono text-[10px]" style={{ color: "var(--steel)" }}>GENEL OLGUNLUK PUANI · 5 ÜZERİNDEN</div>
                </div>
                <RadarChart scores={scores} />
              </div>

              {/* axis breakdown */}
              <div className="dmat-mono text-xs mb-3" style={{ color: "var(--steel)" }}>EKSEN BAZLI SONUÇLAR</div>
              <div className="space-y-2.5 mb-9">
                {AXES.map((a) => {
                  const s = scores[a.id];
                  const st = statusFor(s);
                  const barColor = st.tone === "low" ? "var(--red)" : st.tone === "mid" ? "var(--brass)" : "var(--green)";
                  return (
                    <div key={a.id} className="dmat-card px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{a.no} {a.title}</span>
                        <span className="dmat-mono text-xs font-semibold">{s.toFixed(2)}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--grid)" }}>
                        <div style={{ width: `${(s / 5) * 100}%`, height: "100%", background: barColor }} />
                      </div>
                      <div className="dmat-mono text-[10px] mt-1.5" style={{ color: barColor }}>{st.label.toUpperCase()}</div>
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

              {/* CTA */}
              <div className="dmat-card p-6 mb-8" style={{ borderColor: "var(--ink)" }}>
                <div className="flex items-start gap-3">
                  <CircleCheck size={20} style={{ color: "var(--green)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div className="text-sm font-semibold mb-1">Sonraki Adım</div>
                    <p className="text-sm leading-relaxed" style={{ color: "#3A4250" }}>
                      Sonuçlarınızı Çorlu TSO Proje Birimi ile birlikte değerlendirmek, uygun
                      destek programına (TÜBİTAK TÜSSİDE D3A/DDX, EDIH Open DMAT veya KOSGEB
                      Dijital Dönüşüm Danışmanlığı Desteği) yönlendirilmek için bizimle
                      iletişime geçebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={restart}
                className="dmat-btn-ghost px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
              >
                <RotateCcw size={15} /> Yeniden Başlat
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
