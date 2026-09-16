// EDIH / DMAT SME — resmi soru seti ve puanlama modeli
// Kaynak: European Commission JRC, Digital Maturity Assessment (DMA)
// Framework & Questionnaires for SMEs/PSOs, JRC133234 (2023)

export const DMAT_SOURCES = [
  {
    title: "European Commission JRC — Digital Maturity Assessment (DMA) Framework & Questionnaires for SMEs/PSOs",
    detail: "JRC133234, 2023 — resmi çerçeve, puanlama kuralları ve sonuç yorumlama yaklaşımı.",
    url: "https://european-digital-innovation-hubs.ec.europa.eu/system/files/2023-11/DMA_Framework_Guidelines_for_EDIHs.pdf",
  },
  {
    title: "European Digital Innovation Hubs Network — Türkçe DMAT KOBİ Soru Formu",
    detail: "EDIH ağı tarafından yayımlanan Türkçe KOBİ DMAT soru seti.",
    url: "https://european-digital-innovation-hubs.ec.europa.eu/system/files/2024-05/CNECT-2023-00777-00-00-TR-TRA-00.pdf",
  },
  {
    title: "EDIH Network — Open DMAT",
    detail: "EDIH'lerde kullanılan DMAT ile aynı soruları içeren açık öz-değerlendirme aracı.",
    url: "https://european-digital-innovation-hubs.ec.europa.eu/open-dma",
  },
];

export const STAFF_SIZES = [
  "Mikro ölçekli (1-9)",
  "Küçük ölçekli (10-49)",
  "Orta ölçekli (50-249)",
  "Büyük ölçekli (250 veya daha fazla)",
];

export const SECTORS = [
  "Havacılık ve Uzay",
  "Tarım ve gıda",
  "Kamu, sosyal ve kişisel hizmet faaliyetleri",
  "İnşaat",
  "Tüketim maddeleri/ürünleri",
  "Kültür ve Yaratıcı endüstriler",
  "Savunma ve güvenlik",
  "Eğitim",
  "Enerji ve uygulamaları",
  "Çevre",
  "Finansal hizmetler",
  "Yaşam bilimleri ve sağlık hizmetleri",
  "İmalat",
  "Denizcilik ve balıkçılık",
  "Madencilik ve taş ocakçılığı",
  "Mobilite (Otomotiv dahil)",
  "Kamu yönetimi",
  "Gayrimenkul, kiralama ve işletme faaliyetleri",
  "Mesleki, Bilimsel ve Teknik Faaliyetler",
  "Telekomünikasyon, Bilgi ve İletişim",
  "Turizm (restoran ve konaklama dahil)",
  "Toptan ve perakende",
  "Yasal Yönler",
  "Düzenleme",
];

export const SCALE_0_5 = [
  "Kullanılmadı",
  "Kullanmayı düşünüyoruz",
  "Prototipleme",
  "Test ediliyor",
  "Uygulanıyor",
  "Operasyonel",
];

export const DMAT_DIMENSIONS = [
  {
    id: "strategy",
    no: "01",
    short: "Strateji",
    title: "Dijital İş Stratejisi",
    description:
      "İşletmenin dijitalleşme yatırımlarını, planlarını, kaynaklarını ve kurumsal hazırlığını değerlendirir.",
    questions: ["q1", "q2"],
  },
  {
    id: "readiness",
    no: "02",
    short: "Hazırlık",
    title: "Dijital Hazırlıklılık",
    description:
      "Ana akım ve gelişmiş dijital teknolojilerin işletmede ne ölçüde benimsendiğini değerlendirir.",
    questions: ["q3", "q4"],
  },
  {
    id: "people",
    no: "03",
    short: "İnsan",
    title: "İnsan Odaklı Dijitalleşme",
    description:
      "Personelin dijital becerilerini, katılımını ve dijital araçlarla güçlendirilmesini değerlendirir.",
    questions: ["q5", "q6"],
  },
  {
    id: "data",
    no: "04",
    short: "Veri",
    title: "Veri Yönetimi ve Bağlanabilirliği",
    description:
      "Verinin saklanması, düzenlenmesi, erişilebilirliği, analizi ve siber güvenlik uygulamalarını değerlendirir.",
    questions: ["q7", "q8"],
  },
  {
    id: "ai",
    no: "05",
    short: "YZ",
    title: "Otomasyon ve Yapay Zekâ",
    description:
      "İş süreçlerinde otomasyon, analitik ve yapay zekâ tabanlı uygulamaların olgunluğunu değerlendirir.",
    questions: ["q9"],
  },
  {
    id: "green",
    no: "06",
    short: "Yeşil",
    title: "Yeşil Dijitalleşme",
    description:
      "Dijitalleşmenin çevresel sürdürülebilirlik, kaynak verimliliği ve çevresel seçimlerle ilişkisini değerlendirir.",
    questions: ["q10", "q11"],
  },
];

export const QUESTIONS = {
  q1: {
    id: "q1",
    no: 1,
    type: "matrix-yes",
    title:
      "İşletmeniz aşağıdaki hangi iş alanlarında dijitalleşmeye halihazırda yatırım yaptı ve gelecekte hangi alanlara yatırım yapmayı planlıyor? Lütfen uygun tüm seçenekleri işaretleyin:",
    columns: ["Halihazırda yatırım yapıldı", "Yatırım yapmayı planlıyor"],
    items: [
      "Ürün/Hizmet tasarımı (araştırma, geliştirme ve inovasyon dahil)",
      "Proje planlama ve yönetimi",
      "Operasyonlar (fiziksel mal üretimi/imalat, paketleme, bakım, hizmetler, vb.)",
      "Diğer dahili tesis konumları veya değer zincirindeki diğer şirketlerle işbirliği",
      "Gelen lojistik ve depolama",
      "Pazarlama, satış ve müşteri hizmetleri (müşteri yönetimi, sipariş işleme, yardım masası, vb.)",
      "Teslimat (giden lojistik, e-Faturalar, vb.)",
      "Yönetim ve insan kaynakları",
      "Tedarik ve alımlar",
      "(Siber) güvenlik ve Kişisel Veri düzenlemeleri/GDPR ile uyumluluk",
    ],
  },
  q2: {
    id: "q2",
    no: 2,
    type: "multi",
    title:
      "İşletmeniz (daha fazla) dijitalleşmeye aşağıdaki yöntemlerden hangisiyle hazırlanıyor? Lütfen uygun tüm seçenekleri işaretleyin:",
    items: [
      "Dijitalleşme ihtiyaçları belirlenir ve işletme hedefleri ile uyumlu hale getirilir",
      "En az bir yıl boyunca dijitalleşmeyi güvence altına almak için finansal kaynakların (öz kaynaklar, krediler, sübvansiyonlar) belirlenmesi",
      "Dijitalleşme planlarını desteklemeye hazır Bilgi Teknolojileri (BT) altyapısı",
      "Bilgi ve İletişim Teknolojileri (BİT) uzmanları istihdam edilmiş/taşeron olarak çalıştırılmaktadır (veya işe alım/taşeron ihtiyaçları belirlenmiştir)",
      "İşletme yönetiminin gerekli kurumsal değişikliklere öncülük etmeye hazır olması",
      "İlgili iş birimlerinin ve çalışanlarının dijitalleşme planlarını desteklemeye hazır olması",
      "İş mimarisi ve operasyonel süreçler, dijitalleşmenin gerektirdiği şekilde uyarlanabilir",
      "Üretilen ürünlerin halihazırda bir hizmet olarak ticarileştirilmesi (Hizmetleştirme olarak adlandırılır) veya dijital teknolojiler tarafından etkinleştirilen hizmetlerle desteklenmesi",
      "Müşterilerin ve ortakların çevrim içi hizmetlerden/etkileşimlerden memnuniyetinin düzenli olarak gözlenmesi (sosyal medya kanallarında, e-ticaret operasyonlarında, e-posta alışverişlerinde vb.)",
      "Dijitalleşmenin riskleri (örneğin, diğer iş alanları üzerindeki planlanmamış etkiler) göz önünde bulundurulmaktadır",
    ],
  },
  q3: {
    id: "q3",
    no: 3,
    type: "multi",
    title:
      "İşletmeniz tarafından şu anda aşağıdaki dijital teknoloji ve çözümlerden hangileri kullanılmaktadır? Lütfen uygun tüm seçenekleri işaretleyin:",
    items: [
      "Bağlantı altyapısı (yüksek hızlı (fiber) İnternet, bulut bilişim hizmetleri, ofis sistemlerine uzaktan erişim)",
      "İşletmenin İnternet sitesi",
      "Müşterilerle iletişim kurmak için İnternet tabanlı formlar ve bloglar/forumlar",
      "Müşterilerle iletişim kurmak için canlı sohbetler, sosyal ağlar ve sohbet robotları",
      "E-Ticaret satışları (İşletmeden Tüketiciye, İşletmeden İşletmeye)",
      "E-Pazarlama tanıtımı (çevrim içi reklamlar, iş için sosyal medya, vb.)",
      "E-Devlet (kamu ihaleleri de dahil olmak üzere kamu kurumlarıyla çevrim içi etkileşim)",
      "Uzaktan faaliyet işbirliği araçları (ör. telefonla çalışma platformu, video konferans, sanal öğrenme, işe özel)",
      "Dahili İnternet portalı (kurum içi ağ)",
      "Bilgi Yönetim Sistemleri (İşletme Kaynakları Planlaması, Ürün Yaşam Döngüsü Yönetimi, Müşteri İlişkileri Yönetimi, Tedarik Zinciri Yönetimi, e-faturalama)",
    ],
  },
  q4: {
    id: "q4",
    no: 4,
    type: "scale05",
    title:
      "Aşağıdaki gelişmiş dijital teknolojilerden hangileri işletmeniz tarafından halihazırda kullanılıyor? Lütfen 0-5 ölçeğini kullanarak tüm seçenekleri derecelendirin:",
    items: [
      "Simülasyon ve dijital ikizler (yani fiziksel nesnelerin/süreçlerin gerçek zamanlı dijital temsilleri)",
      "Sanal gerçeklik, artırılmış gerçeklik",
      "Bilgisayar destekli tasarım (CAD) ve üretim (CAM)",
      "Üretim yürütme sistemleri",
      "Nesnelerin İnterneti (IoT) ve Endüstriyel Nesnelerin İnterneti (I-IoT)",
      "Blockchain teknolojisi",
      "Katmanlı üretim (örn. 3D yazıcılar)",
    ],
  },
  q5: {
    id: "q5",
    no: 5,
    type: "multi",
    title:
      "İşletmeniz, personelini dijitalleşme için yeniden beceri kazandırmak ve yetkinleştirmek için neler yapıyor? Lütfen uygun tüm seçenekleri işaretleyin:",
    items: [
      "Beceri eksikliklerini belirlemek için personel beceri değerlendirmesi yapar",
      "Personelin eğitimi ve yetkinlik kazandırılması için bir eğitim planı tasarlıyor",
      "Kısa eğitimler düzenliyor, öğretici kitapçıklar/kılavuzlar ve diğer e-öğrenim kaynakları sağlıyor",
      "Yaparak öğrenme/eşli öğrenme/deneyim edinme fırsatlarını kolaylaştırıyor",
      "Ana yetkinlik alanlarında stajyerlik ve iş yerleştirmeleri sağlıyor",
      "Personeli, harici kuruluşlar (eğitim sağlayıcılar, akademisyenler, satıcılar) tarafından düzenlenen eğitimlere katılmaya teşvik ediyor",
      "Sübvansiyonlu eğitim ve beceri geliştirme programlarından yararlanıyor",
    ],
  },
  q6: {
    id: "q6",
    no: 6,
    type: "multi",
    title:
      "Yeni dijital çözümleri benimserken, işletmeniz personelinin katılımını nasıl sağlıyor ve onları nasıl destekliyor? Lütfen uygun tüm seçenekleri işaretleyin:",
    items: [
      "Personelin yeni dijital teknolojiler hakkındaki farkındalığını kolaylaştırmak",
      "Dijitalleşme planlarını personele şeffaf ve kapsayıcı bir şekilde iletmek",
      "Personelin kabulünü izleyerek potansiyel yan etkileri azaltmak için önlemler almak (örneğin, değişme korkusu; 'daima açık' kültürü ile iş-hayat dengesi; gizlilik ihlali risklerine karşı önlemler vb.)",
      "Ürün/hizmet/süreç dijitalizasyonunun tasarımına ve geliştirilmesine personeli (BİT dışı personel dahil) dahil etmek",
      "Personele, karar almaları ve yürütmeleri için daha fazla özerklik ve uygun dijital araçlar sağlamak",
      "İşleri ve iş akışlarını, personelin gerçekten çalışmak istediği yolları destekleyecek şekilde yeniden tasarlar/uyarlar",
      "Dijitalleşmenin sağladığı daha esnek çalışma düzenlemeleri oluşturmak (örn. uzaktan çalışma)",
      "Personele dijital destek ekibi/servisi (dahili/harici) sağlamak",
    ],
  },
  q7: {
    id: "q7",
    no: 7,
    type: "multi",
    title:
      "İşletmenizin verileri nasıl yönetiliyor (yani saklanıyor, düzenleniyor, erişiliyor ve kullanılıyor)? Lütfen uygun tüm seçenekleri işaretleyin:",
    items: [
      "Kurumumuzda bir veri yönetimi politikası/planı/önlemler bütünü bulunmaktadır",
      "Veriler dijital olarak toplanmıyor",
      "İlgili veriler dijital olarak depolanıyor (örn. ofis uygulamaları, e-posta klasörleri, bağımsız uygulamalar, CRM veya ERP sistemi vb.)",
      "Veriler farklı sistemler arasında dağıtılmış olsalar bile uygun şekilde entegre ediliyor (örneğin, uyumlu sistemler, uygulama programlama ara birimleri aracılığıyla)",
      "Verilere farklı cihazlardan ve konumlardan gerçek zamanlı olarak erişilebiliyor",
      "Toplanan veriler düzenli olarak analiz ediliyor ve karar verme için raporlanıyor",
      "Veri analizleri, harici kaynakların kendi verileriyle birleştirilmesiyle zenginleştirilir",
      "Veri analizlerine uzman yardımı olmadan erişilebiliyor (örneğin kontrol paneli üzerinden)",
    ],
    zeroScoreItems: [1],
  },
  q8: {
    id: "q8",
    no: 8,
    type: "multi",
    title: "İşletmenizin verileri yeterince güvende mi? Lütfen uygun tüm seçenekleri işaretleyin:",
    items: [
      "Bir işletme veri güvenliği politikası/önlemler bütünü bulunmaktadır",
      "Müşteriyle ilgili tüm veriler siber saldırılara karşı korunmaktadır",
      "Personel düzenli olarak siber güvenlik ve veri koruma sorunları/riskleri hakkında bilgilendirilmekte ve eğitilmektedir",
      "Siber tehditler düzenli olarak izlenmekte ve değerlendirilmektedir",
      "Kritik işletme verilerinin tam bir yedek kopyası tutulmaktadır (kapalı sistemde/bulutta)",
      "Felaket senaryolarında iş sürekliliği planı mevcuttur (tüm verilerin fidye yazılımı saldırısıyla kilitlenmesi veya BT altyapısına fiziksel zarar gelmesi gibi)",
    ],
  },
  q9: {
    id: "q9",
    no: 9,
    type: "scale05",
    title:
      "İşletmeniz aşağıdaki teknolojilerden ve iş uygulamalarından hangilerini halihazırda kullanıyor? Lütfen 0-5 ölçeğini kullanarak tüm seçenekleri derecelendirin:",
    items: [
      "Sohbet robotları, metin madenciliği, makine çevirisi, duygu analizi dahil olmak üzere Doğal Dil İşleme",
      "Bilgisayar görüşü / görüntü tanıma",
      "Ses işleme / konuşma tanıma, işleme ve sentezleme",
      "Robotik ve otonom cihazlar",
      "İş zekası, veri analizi, karar destek sistemleri, öneri sistemleri, akıllı kontrol sistemleri",
    ],
  },
  q10: {
    id: "q10",
    no: 10,
    type: "multi",
    title:
      "İşletmeniz çevresel sürdürülebilirliğe katkıda bulunmak için dijital teknolojileri nasıl kullanıyor? Lütfen uygun tüm seçenekleri işaretleyin:",
    items: [
      "Sürdürülebilir iş modeli (örn. döngüsel ekonomi modeli, hizmet olarak ürün)",
      "Sürdürülebilir hizmet sunumu (örn. diğer kullanıcılar tarafından daha fazla yeniden kullanım için kullanım takibi)",
      "Sürdürülebilir ürünler (örneğin, eko-tasarım, uçtan uca ürün yaşam döngüsü planlaması, kullanım ömrünün sonlandırılması ve faydalı ömrün uzatılması)",
      "Sürdürülebilir üretim ve imalat yöntemleri, malzemeler ve bileşenler (kullanım ömrü sonu yönetimi dahil)",
      "Emisyonlar, kirlilik ve/veya atık yönetimi",
      "Kendi tesislerinde sürdürülebilir enerji üretimi",
      "Ham madde tüketiminin/maliyetinin iyileştirilmesi",
      "Nakliye ve paketleme maliyetlerinin azaltılması",
      "Sorumlu tüketici davranışlarını teşvik etmek için dijital uygulamalar",
      "Kağıtsız idari süreçler",
    ],
  },
  q11: {
    id: "q11",
    no: 11,
    type: "partial",
    title:
      "İşletmeniz dijital seçim ve uygulamalarında çevresel etkileri dikkate alıyor mu? Lütfen verilen skalayı kullanarak tüm seçenekleri değerlendirin: Hayır, Kısmen, Evet:",
    items: [
      "Çevresel kaygılar ve standartlar işletmenin iş modeli ve stratejisine dahil edilmiştir",
      "Uygulanan bir Çevre Yönetim Sistemi/sertifikasyonu bulunmaktadır",
      "Çevresel yönler dijital teknolojilerin/tedarikçilerin tedarik kriterlerinin bir parçasıdır",
      "Dijital teknolojilerin ve veri depolama alanının enerji tüketimi izlenir ve optimize edilir",
      "Eski teknolojik ekipmanın geri dönüşümü/yeniden kullanımı işletme tarafından aktif olarak uygulanmaktadır",
    ],
  },
};

export const createInitialAnswers = () => ({
  q1Invested: { selected: [], none: false },
  q1Planned: { selected: [], none: false },
  q2: { selected: [], none: false },
  q3: { selected: [], none: false },
  q4: Array(QUESTIONS.q4.items.length).fill(null),
  q5: { selected: [], none: false },
  q6: { selected: [], none: false },
  q7: { selected: [], none: false },
  q8: { selected: [], none: false },
  q9: Array(QUESTIONS.q9.items.length).fill(null),
  q10: { selected: [], none: false },
  q11: Array(QUESTIONS.q11.items.length).fill(null),
});

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function multiScore(group, questionId) {
  const q = QUESTIONS[questionId];
  const zeroSet = new Set(q.zeroScoreItems || []);
  const positiveItemCount = q.items.length - zeroSet.size;
  const selectedPositive = (group?.selected || []).filter((idx) => !zeroSet.has(idx)).length;
  if (!positiveItemCount) return 0;
  return clamp((selectedPositive * 10) / positiveItemCount, 0, 10);
}

function scale05Score(values) {
  if (!values?.length) return 0;
  // 0..5 => 0, .2, .4, .6, .8, 1. Her öğe eşit ağırlıkta.
  const raw = values.reduce((sum, v) => sum + (Number(v || 0) / 5), 0);
  return clamp((raw * 10) / values.length, 0, 10);
}

function partialScore(values) {
  if (!values?.length) return 0;
  // SME Q11 resmi ekinde Hayır=0, Kısmen=1, Evet=2; 5 öğe => azami 10 puan.
  return clamp(values.reduce((sum, v) => sum + Number(v || 0), 0), 0, 10);
}

export function calculateDMAT(answers) {
  const q1ai = multiScore(answers.q1Invested, "q2"); // 10 adet 0/1 öğe; q2 ile aynı max yapı
  const q1pi = multiScore(answers.q1Planned, "q2");
  const q2 = multiScore(answers.q2, "q2");
  const q3 = multiScore(answers.q3, "q3");
  const q4 = scale05Score(answers.q4);
  const q5 = multiScore(answers.q5, "q5");
  const q6 = multiScore(answers.q6, "q6");
  const q7 = multiScore(answers.q7, "q7");
  const q8 = multiScore(answers.q8, "q8");
  const q9 = scale05Score(answers.q9);
  const q10 = multiScore(answers.q10, "q10");
  const q11 = partialScore(answers.q11);

  const questionScores = {
    q1Invested: round2(q1ai),
    q1Planned: round2(q1pi),
    q2: round2(q2),
    q3: round2(q3),
    q4: round2(q4),
    q5: round2(q5),
    q6: round2(q6),
    q7: round2(q7),
    q8: round2(q8),
    q9: round2(q9),
    q10: round2(q10),
    q11: round2(q11),
  };

  const dimensionScores = {
    // Resmi kılavuz: Q1'in iki sütunu ayrı soru gibi değerlendirilir; Q2 ile birlikte D1'i oluşturur.
    strategy: round2(((q1ai + q1pi + q2) / 30) * 100),
    readiness: round2((q3 + q4) * 5),
    people: round2((q5 + q6) * 5),
    data: round2((q7 + q8) * 5),
    ai: round2(q9 * 10),
    green: round2((q10 + q11) * 5),
  };

  const overall = round2(
    Object.values(dimensionScores).reduce((sum, v) => sum + v, 0) /
      Object.values(dimensionScores).length
  );

  return { questionScores, dimensionScores, overall, level: maturityLevel(overall) };
}

export function maturityLevel(score) {
  // JRC yorumlama bantları: Basic 0-25, Average 26-50,
  // Moderately advanced 50-75, Advanced 76-100. Sınır çakışmasını
  // deterministik kılmak için 50, "Ortalama" bandında tutulur.
  if (score <= 25) return { key: "basic", name: "Temel", official: "Basic", range: "0–25" };
  if (score <= 50) return { key: "average", name: "Ortalama", official: "Average", range: "26–50" };
  if (score <= 75) return { key: "moderate", name: "Orta İleri", official: "Moderately advanced", range: "51–75" };
  return { key: "advanced", name: "İleri", official: "Advanced", range: "76–100" };
}

const INTERPRETATIONS = {
  strategy: {
    basic: "Dijitalleşme için plan, kaynak ve yatırım kapsamı henüz sınırlı. Öncelik, açık bir plan ve kaynak tahsisi oluşturmaktır.",
    average: "Başlangıç düzeyinde plan, kaynak ve yatırımlar mevcut; dijitalleşmenin stratejik öneminin ve yatırım kapsamının genişletilmesi gerekir.",
    moderate: "Belirgin bir plan, kaynak ve yönetim desteği bulunuyor; mevcut ve planlanan yatırımlar birçok iş alanına yayılmış durumda.",
    advanced: "Dijitalleşme stratejik bir öncelik; kapsamlı yatırımlar, kaynaklar ve yönetim taahhüdü yerleşmiş durumda.",
  },
  readiness: {
    basic: "Ana akım dijital teknolojilerin kullanımı az ve gelişmiş teknolojiler sınırlı. Temel dijital altyapı ve kullanım alanları genişletilebilir.",
    average: "Ana akım dijital teknolojiler kullanılmaya başlanmış; gelişmiş teknolojilerin işletme süreçlerine yayılımı sınırlı.",
    moderate: "Temel dijital altyapı güçlü, ana akım teknolojiler yaygın; bazı gelişmiş teknolojiler uygulanıyor veya deneniyor.",
    advanced: "Ana akım ve gelişmiş dijital teknolojiler geniş ölçekte benimsenmiş ve iş süreçlerine operasyonel olarak yerleşmiş durumda.",
  },
  people: {
    basic: "Dijital beceri geliştirme ve personel katılımı sınırlı. Sistematik beceri analizi ve eğitim planı önemli bir başlangıç alanıdır.",
    average: "Bazı eğitim ve katılım uygulamaları mevcut; bunların planlı, sürekli ve kapsayıcı bir yapıya dönüştürülmesi gerekir.",
    moderate: "Personel eğitimi, katılımı ve dijital çalışma düzenleri büyük ölçüde yapılandırılmış; ileri beceriler için gelişim alanı vardır.",
    advanced: "Kapsamlı beceri geliştirme, personel katılımı, esnek çalışma ve dijital destek uygulamaları kurumsallaşmış durumda.",
  },
  data: {
    basic: "Veri yönetimi ve güvenliği erken aşamada. Dijital saklama, politika, yedekleme ve siber güvenlik için temel yapı kurulmalıdır.",
    average: "Veri dijital olarak tutuluyor ve bazı güvenlik uygulamaları var; entegrasyon, analitik ve süreklilik planları geliştirilebilir.",
    moderate: "Veri politikaları, yapılandırılmış dijital veri, analiz ve güvenlik uygulamaları büyük ölçüde mevcut; entegrasyon derinleştirilebilir.",
    advanced: "Veri entegre, erişilebilir ve karar desteğinde etkin kullanılıyor; siber güvenlik, yedekleme ve iş sürekliliği güçlü biçimde uygulanıyor.",
  },
  ai: {
    basic: "Otomasyon ve yapay zekâ kullanımı yok veya çok sınırlı. Uygun süreçlerde küçük ölçekli pilotlar başlanabilir.",
    average: "Otomasyon/analitik uygulamaları kısmi veya belirli görevlerle sınırlı; kullanım alanlarının iş süreçlerine yayılması gerekir.",
    moderate: "Birden çok süreçte otomasyon, analitik veya yapay zekâ uygulanıyor; iş sonuçlarına etkisi görünür hale gelmeye başlamış durumda.",
    advanced: "Otomasyon, analitik ve yapay zekâ iş süreçlerine geniş ölçekte yerleşmiş ve operasyonel olarak kullanılıyor.",
  },
  green: {
    basic: "Dijitalleşme kararlarında çevresel etkiler sınırlı ele alınıyor. Kaynak verimliliği ve çevresel kriterler için başlangıç adımları gereklidir.",
    average: "Bazı sürdürülebilirlik uygulamaları ve çevresel kriterler mevcut; bunların daha fazla iş sürecine yayılması gerekir.",
    moderate: "Dijital teknolojiler sürdürülebilirlik hedeflerine çeşitli alanlarda katkı sağlıyor ve çevresel etkiler karar süreçlerinde dikkate alınıyor.",
    advanced: "Çevresel kriterler dijital strateji ve tedarik kararlarına güçlü biçimde entegre; kaynak/enerji izleme ve döngüsellik uygulamaları yaygın.",
  },
};

export function dimensionInterpretation(dimensionId, score) {
  const level = maturityLevel(score);
  return {
    level,
    text: INTERPRETATIONS[dimensionId][level.key],
  };
}

export function isQuestionComplete(questionId, answers) {
  if (questionId === "q1") {
    const a = answers.q1Invested;
    const p = answers.q1Planned;
    return Boolean((a.none || a.selected.length) && (p.none || p.selected.length));
  }
  const q = QUESTIONS[questionId];
  if (q.type === "multi") {
    const v = answers[questionId];
    return Boolean(v?.none || v?.selected?.length);
  }
  if (q.type === "scale05" || q.type === "partial") {
    return Array.isArray(answers[questionId]) && answers[questionId].every((v) => v !== null && v !== undefined);
  }
  return false;
}
