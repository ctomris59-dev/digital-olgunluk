// Çorlu TSO Dijital Olgunluk Ölçüm Aracı — paylaşılan veri modeli
// Hem ekran (App.jsx) hem PDF rapor motoru (pdfReport.js) bu dosyayı kullanır.
// Böylece ekranda gösterilen sorular/skorlar ile PDF çıktısı her zaman birebir tutarlı olur.

// Eksen bazlı olgunluk merdiveni: CMMI (Capability Maturity Model Integration,
// SEI / Carnegie Mellon Üniversitesi) tarafından yaygınlaştırılan jenerik 5
// seviyeli olgunluk kademelendirmesi (Başlangıç → Tekrarlanabilir → Tanımlı →
// Ölçülüyor → Optimize Ediliyor) esas alınarak, her eksenin kendi çerçevesine
// (bkz. "framework" alanı) uyarlanmıştır. Puan 1-5 arası en yakın tam sayıya
// yuvarlanarak ilgili seviye eşleştirilir. Bkz. Metodoloji bölümü.
const CMMI_LEVEL_NAMES = ["Başlangıç", "Tekrarlanabilir", "Tanımlı", "Ölçülüyor", "Optimize Ediliyor"];

const AXES = [
  {
    id: "process",
    no: "01",
    short: "Süreç",
    title: "Süreç Dijitalleşmesi",
    intro: "İş süreçlerinizin kağıt/manuel mi, yoksa yazılım destekli mi yürüdüğünü ölçer.",
    framework: "acatech — Bilgi Sistemleri",
    questions: [
      "Muhasebe, stok, satış gibi temel iş süreçlerimiz kağıt/Excel yerine bir yazılım üzerinden yürütülür.",
      "Departmanlar arası bilgi akışı, manuel tekrar girişi gerektirmeden dijital bir sistem üzerinden aktarılır.",
      "İş süreçlerindeki darboğazları düzenli olarak dijital araçlarla (raporlama, dashboard) takip ederiz.",
      "Yeni bir dijital araç devreye alma kararı, tanımlı bir sorumlu/süreç üzerinden yürütülür.",
      "İş süreçlerimize ait performans göstergeleri (KPI) düzenli olarak tanımlanır, ölçülür ve raporlanır.",
    ],
    resource: {
      name: "KOSGEB İşletme Geliştirme Destek Programı",
      url: "https://www.kosgeb.gov.tr",
    },
    levelGuide: [
      { description: "Süreçler büyük ölçüde kağıt/manuel yürütülüyor, standart bir yöntem yok.", action: "En sık tekrarlanan 2-3 süreci (fatura, stok takibi vb.) basit bir yazılıma taşımakla başlayın." },
      { description: "Bazı süreçler yazılımla yürütülüyor ama kişiye bağlı, standart değil.", action: "Kullanılan araçları tüm ekip için standart hale getirin, temel bir prosedür dokümanı oluşturun." },
      { description: "Süreçler tanımlanmış ve çoğunlukla dijital araçlarla yürütülüyor.", action: "Departmanlar arası veri akışını sağlayacak bir ERP/entegrasyon çözümünü değerlendirin." },
      { description: "Süreç performansı düzenli olarak ölçülüyor ve raporlanıyor.", action: "KPI'ları gerçek zamanlı bir dashboard'a taşıyarak karar hızınızı artırın." },
      { description: "Süreçler sürekli izleniyor ve veri temelli optimize ediliyor.", action: "Süreç madenciliği (process mining) araçlarıyla darboğazları otomatik tespit etmeyi değerlendirin." },
    ],
  },
  {
    id: "data",
    no: "02",
    short: "Veri",
    title: "Veri Yönetimi ve Analitik",
    intro: "Verinin toplanma, saklanma ve karar almada kullanılma biçimini ölçer.",
    framework: "acatech — Bilgi Sistemleri / EDIH — Veri Yönetimi",
    questions: [
      "Satış, üretim veya müşteri verilerimiz dağınık Excel dosyaları yerine merkezi bir sistemde toplanır.",
      "Yönetim kararları alınırken güncel veriye dayalı raporlar kullanılır.",
      "Verilerimizin yedeklenmesi düzenli ve otomatik olarak yapılır.",
      "Veri kalitesinden (doğruluk, güncellik, tutarlılık) sorumlu bir kişi veya süreç vardır.",
      "Farklı sistemlerden (satış, üretim, finans) gelen veriler birbiriyle ilişkilendirilerek analiz edilebilir.",
    ],
    resource: {
      name: "EDIH West Marmara — Veri Yönetimi Danışmanlığı",
      url: "https://european-digital-innovation-hubs.ec.europa.eu",
    },
    levelGuide: [
      { description: "Veri dağınık, çoğunlukla Excel dosyalarında; merkezi bir sistem yok.", action: "Kritik verilerinizi (satış, stok, müşteri) tek bir bulut tabanlı sistemde toplamaya başlayın." },
      { description: "Bazı veriler merkezi ama analiz düzensiz, planlı raporlama yok.", action: "Haftalık/aylık düzenli bir rapor şablonu oluşturup yönetime sunun." },
      { description: "Veri kalitesi ve güvenliği tanımlı süreçlerle yönetiliyor.", action: "Farklı kaynaklardan gelen veriyi birleştiren bir BI aracı (Power BI, Looker Studio vb.) değerlendirin." },
      { description: "Veriye dayalı karar alma yönetim kültürünün bir parçası.", action: "Tahminleme (forecasting) modelleriyle talep/stok planlamasını destekleyin." },
      { description: "Veri, gerçek zamanlı ve öngörücü kararların temelini oluşturuyor.", action: "Makine öğrenmesi tabanlı anomali tespiti veya otomatik uyarı sistemleri kurun." },
    ],
  },
  {
    id: "market",
    no: "03",
    short: "Pazar",
    title: "Müşteri / Pazar Dijital Varlığı",
    intro: "E-ticaret, dijital pazarlama ve online müşteri ilişkilerindeki olgunluğu ölçer.",
    framework: "MIT & Capgemini — Dijital Yoğunluk / EDIH — Dijital İş Stratejisi",
    questions: [
      "Güncel tutulan bir web sitemiz ve/veya aktif sosyal medya hesabımız vardır.",
      "Ürün/hizmetlerimizi online kanallardan (e-ticaret, pazaryeri, B2B platform) satabiliyoruz.",
      "Müşteri talep ve şikayetleri dijital bir sistem (CRM, ticket sistemi) üzerinden takip edilir.",
      "Dijital pazarlama faaliyetlerimizin sonuçlarını ölçüp değerlendiririz.",
      "Rakip analizi veya pazar trendlerini takip etmek için dijital araç/veri kaynakları kullanırız.",
    ],
    resource: {
      name: "KOSGEB E-Ticaret Destek Programı",
      url: "https://www.kosgeb.gov.tr",
    },
    levelGuide: [
      { description: "Dijital varlık minimal veya yok; müşteri ilişkileri büyük ölçüde yüz yüze/telefonla.", action: "Güncel bir web sitesi ve en az bir sosyal medya kanalı oluşturun." },
      { description: "Temel bir dijital varlık var ama düzensiz güncelleniyor, ölçüm yok.", action: "Web sitesi ve sosyal medya trafiğini basit analitik araçlarla (Google Analytics vb.) takip etmeye başlayın." },
      { description: "Online satış/pazarlama kanalları aktif ve düzenli yönetiliyor.", action: "Müşteri ilişkilerini bir CRM sistemine taşıyarak talep/şikayet takibini sistematikleştirin." },
      { description: "Dijital pazarlama performansı ölçülüyor, kampanyalar veriyle optimize ediliyor.", action: "Müşteri segmentasyonu yaparak hedefli pazarlama kampanyaları kurgulayın." },
      { description: "Çok kanallı, veri temelli, kişiselleştirilmiş bir müşteri deneyimi sunuluyor.", action: "Müşteri yaşam boyu değerini (CLV) analiz eden gelişmiş analitik modellerini değerlendirin." },
    ],
  },
  {
    id: "automation",
    no: "04",
    short: "Otomasyon",
    title: "Otomasyon ve Yapay Zeka",
    intro: "Üretim ve operasyonda otomasyon ile YZ araçlarının benimsenme düzeyini ölçer.",
    framework: "acatech — Kaynaklar / EDIH — Otomasyon ve YZ",
    questions: [
      "Üretim/operasyon süreçlerimizde otomasyon sistemleri (PLC, robotik, otomatik hat) kullanılır.",
      "Tekrarlayan idari işler için otomasyon araçları veya yazılım robotları kullanılır.",
      "Firmamızda yapay zeka destekli araçlar deneniyor veya kullanılıyor.",
      "Makine/ekipman verilerimiz (IoT sensör, performans verisi) dijital olarak izlenip analiz ediliyor.",
      "Operasyonel kararlarımız (bakım zamanlaması, stok, üretim planı vb.) geçmiş verilere dayalı öngörü/tahmin modelleriyle destekleniyor.",
    ],
    resource: {
      name: "EDIH — Test-Before-Invest Hizmetleri",
      url: "https://european-digital-innovation-hubs.ec.europa.eu",
    },
    levelGuide: [
      { description: "Otomasyon yok veya çok sınırlı; işler büyük ölçüde elle yürütülüyor.", action: "Tekrarlayan, kural bazlı bir idari işi (örn. fatura kesme) basit bir otomasyon aracıyla devreye alın." },
      { description: "Bazı noktasal otomasyonlar var ama birbirinden bağımsız/entegre değil.", action: "Otomasyonu birden fazla sürece yaymak için bir yol haritası oluşturun." },
      { description: "Otomasyon, tanımlı süreçlerin standart bir parçası haline gelmiş.", action: "IoT sensörleriyle makine/ekipman verisini toplamaya başlayın." },
      { description: "Makine/operasyon verileri düzenli izleniyor ve analiz ediliyor.", action: "Kestirimci bakım (predictive maintenance) modelleriyle arıza öncesi müdahaleyi mümkün kılın." },
      { description: "YZ destekli sistemler operasyonel kararları otonom şekilde optimize ediyor.", action: "Uçtan uca otonom karar destek sistemlerini pilot bir hatta test edin." },
    ],
  },
  {
    id: "people",
    no: "05",
    short: "Yetkinlik",
    title: "Dijital Yetkinlik ve İnsan Kaynağı",
    intro: "Çalışan yetkinliği, organizasyonel yapı ve yönetimin dijital dönüşüme verdiği önceliği ölçer.",
    framework: "acatech — Organizasyonel Yapı ve Kültür / MIT & Capgemini — Dönüşüm Yönetimi",
    questions: [
      "Çalışanlarımız günlük işlerinde kullandıkları dijital araçlar konusunda yeterli eğitim almıştır.",
      "Firmamızda dijital dönüşüm/yeni teknoloji konularında düzenli eğitim faaliyetleri yürütülür.",
      "Yönetim, dijital dönüşümü stratejik öncelik olarak görür ve kaynak ayırır.",
      "Çalışanlarımız yeni dijital araç ve sistemlere geçişte genel olarak açık ve uyumludur.",
      "Firmamızda dijital dönüşüm sürecini yürüten veya bu konuda sorumluluk üstlenen tanımlı bir kişi/ekip vardır.",
    ],
    resource: {
      name: "Çorlu TSO Eğitim Programları",
      url: null,
    },
    levelGuide: [
      { description: "Dijital yetkinlik düşük; dönüşümden sorumlu bir kişi/ekip yok.", action: "Dijital dönüşümden sorumlu en az bir kişi/temas noktası belirleyin." },
      { description: "Bazı çalışanlar temel dijital araçları kullanabiliyor ama eğitim düzensiz.", action: "Temel dijital araçlar için düzenli, planlı bir eğitim takvimi oluşturun." },
      { description: "Yönetim dijital dönüşümü stratejik öncelik olarak görüyor, kaynak ayırıyor.", action: "Dijital dönüşüm için yıllık bütçe ve somut hedefler (KPI) belirleyin." },
      { description: "Dijital kültür organizasyona yayılmış, değişime açıklık yüksek.", action: "Çapraz fonksiyonlu bir dijital dönüşüm ekibi/komitesi kurun." },
      { description: "Sürekli öğrenen, çevik ve dijital yerlisi bir organizasyon kültürü var.", action: "İç girişimcilik programlarıyla dijital inovasyonu içeriden besleyin." },
    ],
  },
  {
    id: "security",
    no: "06",
    short: "Güvenlik",
    title: "Siber Güvenlik ve Altyapı",
    intro: "IT altyapısı, veri güvenliği ve KVKK uyum farkındalığını ölçer.",
    framework: "acatech — Kaynaklar",
    questions: [
      "İnternet, sunucu, bulut altyapımız güncel ve ihtiyaçlarımızı karşılayacak durumdadır.",
      "Sistemlerimize erişim yetkilendirme ile kontrol edilir; şifre/erişim politikalarımız vardır.",
      "Siber saldırı, veri sızıntısı gibi risklere karşı önlemlerimiz (antivirüs, güvenlik duvarı vb.) mevcuttur.",
      "KVKK ve veri güvenliği yükümlülüklerimiz konusunda farkındalığımız ve uyum sürecimiz vardır.",
      "Sistem arızası veya veri kaybı durumuna karşı bir iş sürekliliği/kurtarma planımız vardır.",
    ],
    resource: {
      name: "KOSGEB Bilgi Yönetimi Destek Programı",
      url: "https://www.kosgeb.gov.tr",
    },
    levelGuide: [
      { description: "Temel güvenlik önlemleri (antivirüs, güvenlik duvarı) bile eksik/düzensiz.", action: "Öncelikle temel siber hijyeni sağlayın: güncel antivirüs, güvenlik duvarı, düzenli yedekleme." },
      { description: "Temel önlemler var ama erişim yönetimi ve yazılı politika eksik.", action: "Kullanıcı bazlı erişim yetkilendirmesi ve şifre politikası oluşturun." },
      { description: "Erişim ve güvenlik politikaları tanımlı, KVKK uyumu sağlanmış.", action: "Yılda en az bir kez sızma testi (penetration test) veya güvenlik denetimi yaptırın." },
      { description: "Güvenlik düzenli izleniyor, olaylara müdahale süreci tanımlı.", action: "Bir iş sürekliliği/felaket kurtarma planı oluşturup düzenli test edin." },
      { description: "Siber güvenlik sürekli izlenen, otomatik tehdit tespiti içeren olgun bir yapı.", action: "SOC (Security Operations Center) hizmeti veya gelişmiş tehdit istihbaratı çözümlerini değerlendirin." },
    ],
  },
];

const SCALE_LABELS = ["Hiç yok", "Başlangıç", "Kısmen var", "Sistematik", "Tam entegre"];

// Genel olgunluk skalası, acatech Industrie 4.0 Maturity Index'in 6 aşamalı
// yapısına (Bilgisayarlaşma → Bağlanabilirlik → Görünürlük → Şeffaflık →
// Öngörü Yeteneği → Uyarlanabilirlik) uyarlanmıştır. Bkz. Metodoloji bölümü.
const LEVELS = [
  { max: 1.49, name: "Bilgisayarlaşma", desc: "Temel dijital araçlar münferit kullanılıyor; süreçler büyük ölçüde manuel.", recommendation: "Öncelik: temel dijital altyapıyı (donanım, temel yazılımlar) tüm departmanlara yaygınlaştırmak." },
  { max: 2.19, name: "Bağlanabilirlik", desc: "Sistemler birbirine bağlanmaya başlamış ama entegrasyon sınırlı.", recommendation: "Öncelik: farklı sistemleri (ERP, muhasebe, üretim) birbirine bağlayıp veri akışını otomatikleştirmek." },
  { max: 2.89, name: "Görünürlük", desc: "Veriler görünür hale geliyor; süreçler izlenebiliyor ama analiz sığ.", recommendation: "Öncelik: toplanan veriyi anlamlı raporlara dönüştürüp yönetime düzenli sunmak." },
  { max: 3.59, name: "Şeffaflık", desc: "Veriler ilişkilendirilip yorumlanıyor; kararlar veriye dayanıyor.", recommendation: "Öncelik: farklı veri kaynaklarını ilişkilendirip kök-neden analizleri yapabilmek." },
  { max: 4.29, name: "Öngörü Yeteneği", desc: "Geçmiş veriden geleceğe dair tahmin/öngörü üretilebiliyor.", recommendation: "Öncelik: geçmiş veriden geleceğe dair tahmin modelleri geliştirmek (talep, bakım, risk)." },
  { max: 5.01, name: "Uyarlanabilirlik", desc: "Sistemler kendi kendine öğreniyor, süreçler otonom şekilde optimize oluyor.", recommendation: "Öncelik: sistemlerin kendi kendine öğrenip süreçleri otonom optimize etmesini sağlamak." },
];

function levelFor(score) {
  return LEVELS.find((l) => score <= l.max) ?? LEVELS[LEVELS.length - 1];
}

function statusFor(score) {
  if (score < 3) return { label: "Öncelikli gelişim alanı", tone: "low" };
  if (score < 4) return { label: "Gelişim fırsatı", tone: "mid" };
  return { label: "Güçlü alan", tone: "high" };
}

// Eksenin 1-5 arası puanını en yakın CMMI seviyesine (1-5) yuvarlayıp
// o seviyeye ait açıklama ve aksiyon önerisini döndürür.
function axisLevelGuide(axis, score) {
  const levelIndex = Math.max(1, Math.min(5, Math.round(score || 1)));
  const guide = axis.levelGuide[levelIndex - 1];
  return { level: levelIndex, name: CMMI_LEVEL_NAMES[levelIndex - 1], ...guide };
}

export { AXES, SCALE_LABELS, LEVELS, CMMI_LEVEL_NAMES, levelFor, statusFor, axisLevelGuide };
