// Çorlu TSO Dijital Olgunluk Ölçüm Aracı — Paylaşılan Veri Modeli
// Hem ekran (App.jsx) hem PDF rapor motoru (pdfReport.js) bu dosyayı kullanır.

const CMMI_LEVEL_NAMES = ["Başlangıç", "Tekrarlanabilir", "Tanımlı", "Ölçülüyor", "Optimize Ediliyor"];

const AXES = [
  {
    id: "process",
    no: "01",
    short: "Süreç",
    title: "Süreç Dijitalleşmesi",
    intro: "İş süreçlerinizin kağıt/manuel mi, yoksa yazılım destekli mi yürüdüğünü ölçer.",
    framework: "acatech — Bilgi Sistemleri / ISO/IEC 33001 — Süreç Yetkinliği",
    questions: [
      "Muhasebe, stok, satış gibi temel iş süreçlerimiz kağıt/Excel yerine bir yazılım üzerinden yürütülür.",
      "Departmanlar arası bilgi akışı, manuel tekrar girişi gerektirmeden dijital bir sistem üzerinden aktarılır.",
      "Süreçlerde bir sapma veya hata tespit edildiğinde, kök nedenini bulup düzeltici aksiyon almak için tanımlı bir yöntemimiz vardır.",
      "Yeni bir dijital araç devreye alma kararı, tanımlı bir sorumlu/süreç üzerinden yürütülür.",
      "İş süreçlerimize ait performans göstergeleri (KPI) düzenli olarak tanımlanır, ölçülür ve raporlanır.",
    ],
    resources: [
      { name: "KOSGEB İşletme Geliştirme Destek Programı", url: "https://www.kosgeb.gov.tr" },
    ],
    levelGuide: [
      {
        description: "Süreçler kişilere bağımlı, kâğıt/Excel tabanlı veya anlık (ad-hoc) yürütülüyor.",
        action: "1. Odak: En kritik 2-3 çekirdek süreci (satın alma, fatura onayı vb.) haritalandırın. 2. Araç: Kâğıt/WhatsApp üzerinden yürüyen işleri bulut tabanlı form ve onay araçlarına (MS Forms, Google Workspace vb.) aktarın. 3. Çıktı: Süreçlerde ilk dijital kayıt ve izlenebilirlik altyapısını kurun."
      },
      {
        description: "Departman bazında kısmen yazılım kullanılıyor ancak sistemler izole ve veri aktarımı manuel.",
        action: "1. Odak: Departmanlar arası bilgi kopukluğunu gidermek için standart veri alanları belirleyin. 2. Araç: Manuel Excel takibini sonlandırıp temel bir ERP veya modüler iş süreç yönetim (BPM) yazılımına geçin. 3. Çıktı: Süreç sorumlularını tanımlayarak iş akışı onay mekanizmalarını standardize edin."
      },
      {
        description: "Kurumsal süreçler tanımlanmış, dokümante edilmiş ve ERP/CRM ile entegre yürütülüyor.",
        action: "1. Odak: Süreçler arası darboğazları ve bekleme sürelerini analiz edin. 2. Araç: Departmanlar arası veri entegrasyonu için REST API ve webhook mimarilerini devreye alın. 3. Çıktı: Süreç dokümantasyonu ile fiili yürütme arasındaki sapmaları sıfırlayarak kurumsal süreç standardizasyonunu tamamlayın."
      },
      {
        description: "Süreç performans göstergeleri (KPI/SLA) sayısal olarak takip ediliyor ve kontrol altında.",
        action: "1. Odak: Süreç verimliliğini geçmişe dönük değil canlı olarak denetleyin. 2. Araç: İş zekası (Power BI, Tableau) panoları kurarak hedef sapmalarına otomatik eşik uyarıları (threshold alerts) tanımlayın. 3. Çıktı: Öngörülebilir süreç performansı ve sayısal kalite kontrolü elde edin."
      },
      {
        description: "Süreçler analitik veriler ve yapay zeka desteğiyle sürekli olarak kendi kendini iyileştiriyor.",
        action: "1. Odak: Süreçlerdeki insan müdahalesi gerektiren karmaşık karar noktalarını otomatize edin. 2. Araç: Süreç madenciliği (Process Mining) ve kural tabanlı yapay zeka motorlarını entegre edin. 3. Çıktı: Dinamik kaynak tahsisi yapan, değişkenliklere anında adapte olabilen otonom süreç yapısına ulaşın."
      },
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
    resources: [
      { name: "EDIH West Marmara — Veri Yönetimi Danışmanlığı", url: "https://european-digital-innovation-hubs.ec.europa.eu" },
      { name: "TÜBİTAK TEYDEB 1501 — Sanayi Ar-Ge Destek Programı (veri/yazılım projeleri)", url: "https://tubitak.gov.tr" },
    ],
    levelGuide: [
      {
        description: "Veriler dağınık, yerel bilgisayarlarda/Excel dosyalarında saklanıyor; veri güvenliği ve bütünlüğü yok.",
        action: "1. Odak: Kurumsal veri envanterini çıkararak veri kirliliğini tespit edin. 2. Araç: Ortak bulut depolama veya NAS (Network Attached Storage) yapısı kurup rol tabanlı erişim yetkilendirmesi (RBAC) uygulayın. 3. Çıktı: Otomatik günlük yedekleme ve merkezi veri güvenliği altyapısını kurun."
      },
      {
        description: "Veriler merkezi veritabanlarında tutuluyor fakat analizler düzensiz ve manuel raporlamaya dayanıyor.",
        action: "1. Odak: Veri giriş alanlarında doğrulama kuralları (data validation) belirleyin. 2. Araç: SQL sorguları veya standart rapor şablonları ile haftalık/aylık yönetim raporlarını otomatize edin. 3. Çıktı: Departmanlar arası veri çelişkilerini azaltıp güvenilir raporlama alışkanlığı kazanın."
      },
      {
        description: "Veri yönetişimi kuralları tanımlı; tek doğru veri kaynağı (Single Source of Truth) mevcut.",
        action: "1. Odak: Farklı veri kaynaklarını birleştirerek çapraz analiz imkânı yaratın. 2. Araç: Veri Ambarı (Data Warehouse) ve Merkezi İş Zekası (BI) platformu kurun. 3. Çıktı: Yönetim kararlarının tamamını anlık ve tek merkezden doğrulanan verilere dayandırın."
      },
      {
        description: "Veri analitiği proaktif kararlar almak için kullanılıyor; kestirimci modeller deneniyor.",
        action: "1. Odak: Geçmiş verileri kullanarak gelecek dönem senaryoları ve tahminler üretin. 2. Araç: Kestirimci analitik ve Makine Öğrenmesi (ML) kütüphaneleri kullanın. 3. Çıktı: Talep tahmini, stok optimizasyonu ve müşteri terk (churn) riskini sayısal olarak öngörün."
      },
      {
        description: "Veri, organizasyonun en değerli stratejik varlığı; gerçek zamanlı veri akışı ve otonom karar sistemleri aktif.",
        action: "1. Odak: Veri işleme gecikmesini (latency) milisaniyeler seviyesine indirin. 2. Araç: Gerçek zamanlı veri akış mimarileri (Apache Kafka vb.) ve yapay zeka ajanı entegrasyonları sağlayın. 3. Çıktı: Kendi kendini kalibre eden, anomali anında otomatik aksiyon alan veri odaklı kurumsal yapı oluşturun."
      },
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
    resources: [
      { name: "KOSGEB E-Ticaret Destek Programı", url: "https://www.kosgeb.gov.tr" },
      { name: "Ticaret Bakanlığı — E-İhracat ve Dijital Pazaryerleri Destek Programı", url: "https://www.ticaret.gov.tr" },
      { name: "TİM — Türkiye İhracatçılar Meclisi Dijital İhracat Destekleri", url: "https://tim.org.tr" },
    ],
    levelGuide: [
      {
        description: "Dijital varlık minimal veya güncel değil; müşteri iletişimi geleneksel yöntemlerle yürütülüyor.",
        action: "1. Odak: Dijital vitrininizi oluşturun ve kurumsal güvenilirliği dijital mecralara taşıyın. 2. Araç: Mobil uyumlu, SEO optimize web sitesi, Google İşletme Profili ve aktif sosyal medya hesapları açın. 3. Çıktı: Potansiyel müşterilerin firmanıza dijital kanallardan ulaşmasını sağlayın."
      },
      {
        description: "Dijital kanallar aktif ancak müşteri talepleri kişisel e-posta/telefon üzerinden takipsiz kalıyor.",
        action: "1. Odak: Gelen tüm talep (lead) ve müşteri etkileşimlerini kayıt altına alın. 2. Araç: Giriş seviyesi Müşteri İlişkileri Yönetimi (CRM) yazılımına geçin. 3. Çıktı: Satış fırsatlarının kaybolmasını önleyin, talep dönüş sürelerini kısaltın."
      },
      {
        description: "Online satış ve dijital pazarlama kanalları tanımlı; CRM ve e-ticaret altyapısı entegre.",
        action: "1. Odak: Müşteri yolculuğunu çok kanallı (Omnichannel) yapıya dönüştürün. 2. Araç: Pazarlama otomasyonu, e-posta pazarlama ve pazar yeri API entegrasyonlarını devreye alın. 3. Çıktı: Müşteri segmentasyonu ve hedefli kampanya yönetimi ile e-ihracat/online satış hacmini büyütün."
      },
      {
        description: "Dijital pazarlama yatırımlarının geri dönüşü (ROAS) ve müşteri edinim maliyeti (CAC) anlık ölçülüyor.",
        action: "1. Odak: Müşteri yaşam boyu değerini (CLV) artıracak kişiselleştirilmiş stratejiler geliştirin. 2. Araç: Web analitiği ve A/B test araçları ile dönüşüm oranı optimizasyonu (CRO) yapın. 3. Çıktı: Pazarlama bütçesini en yüksek dönüşüm getiren kanallara veri temelli tahsis edin."
      },
      {
        description: "Yapay zeka destekli kişiselleştirme, proaktif müşteri yönetimi ve otonom satış kanalları mevcut.",
        action: "1. Odak: Müşterinin ihtiyacını ortaya çıkmadan tahmin eden hiper-kişiselleştirilmiş deneyim sunun. 2. Araç: Üreteç Yapay Zeka (GenAI) destekli akıllı satış asistanları ve öneri motorları kullanın. 3. Çıktı: 7/24 kesintisiz, otonom ve yüksek sadakat üreten dijital müşteri ekosistemi yaratın."
      },
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
    resources: [
      { name: "EDIH — Test-Before-Invest Hizmetleri", url: "https://european-digital-innovation-hubs.ec.europa.eu" },
      { name: "TÜBİTAK TEYDEB 1501/1507 — Ar-Ge ve Yenilik Destek Programları", url: "https://tubitak.gov.tr" },
      { name: "KOSGEB Ar-Ge, İnovasyon ve Endüstriyel Uygulama Destek Programı", url: "https://www.kosgeb.gov.tr" },
    ],
    levelGuide: [
      {
        description: "Operasyonlar büyük ölçüde manuel iş gücü ve kâğıt/Excel takibiyle yürütülüyor.",
        action: "1. Odak: Yüksek hacimli, kurala dayalı rutin işleri belirleyin. 2. Araç: Temel idari süreçlerde masaüstü RPA (Robotik Süreç Otomasyonu) veya Excel otomasyon şablonları kullanın. 3. Çıktı: Çalışanların üzerindeki angarya yükünü hafifletip veri giriş hatalarını sıfırlayın."
      },
      {
        description: "Noktasal otomasyonlar (PLC, adil yazılımlar) var fakat adalar halinde, entegre değil.",
        action: "1. Odak: Yazılımlar ve makineler arası veri kopukluğunu ortadan kaldırın. 2. Araç: API entegrasyonları, endüstriyel haberleşme protokolleri (Modbus, OPC UA vb.) kullanın. 3. Çıktı: Üretim/operasyon verisinin manuel müdahale olmadan bilgi sistemlerine akışını sağlayın."
      },
      {
        description: "Otomasyon kurumsal süreçlerin standart parçası; sahadan veri toplama otomatize edilmiş.",
        action: "1. Odak: Saha ve üretim ortamındaki tüm varlıkların anlık durumunu izlenebilir kılın. 2. Araç: Endüstriyel IoT (IIoT) sensörleri, MES (Üretim Yürütme Sistemi) ve kurumsal RPA araçları kurun. 3. Çıktı: Ekipman Verimliliği (OEE) ve operasyonel performansı anlık olarak görünür yapın."
      },
      {
        description: "Makine ve süreç verileri düzenli analiz edilerek arıza ve duruşlar öngörülebiliyor.",
        action: "1. Odak: Reaktif bakımdan ve plansız duruşlardan koruyucu/kestirimci yaklaşıma geçin. 2. Araç: Kestirimci Bakım (Predictive Maintenance) ve Yapay Zeka destekli Kalite Kontrol kameraları kullanın. 3. Çıktı: Ekipman ömrünü uzatın, arıza maliyetlerini ve iskarta oranlarını düşürün."
      },
      {
        description: "Yapay zeka ve otonom sistemler operasyonel kararları insan müdahalesiz optimize ediyor.",
        action: "1. Odak: Üretim/hizmet hattında uçtan uca esnek ve otonom çalışan sistemler kurun. 2. Araç: Dijital İkiz (Digital Twin), GenAI süreç asistanları ve otonom karar verici yapay zeka ajanları entegre edin. 3. Çıktı: Kendi kendini kalibre eden, talep değişikliklerine anında uyum sağlayan otonom yapıya ulaşın."
      },
    ],
  },
  {
    id: "people",
    no: "05",
    short: "Yetkinlik",
    title: "Dijital Yetkinlik ve İnsan Kaynağı",
    intro: "Çalışan yetkinliği, organizasyonel yapı ve yönetimin dijital dönüşüme verdiği önceliği ölçer.",
    framework: "acatech — Organizasyonel Yapı ve Kültür / MIT & Capgemini — Dönüşüm Yönetimi / OECD — Nitelikli İşler",
    questions: [
      "Çalışanlarımız günlük işlerinde kullandıkları dijital araçlar konusunda yeterli eğitim almıştır.",
      "Firmamızda dijital dönüşüm/yeni teknoloji konularında düzenli eğitim faaliyetleri yürütülür.",
      "Yönetim, dijital dönüşümü stratejik öncelik olarak görür ve kaynak ayırır.",
      "Dijitalleşme sürecinde çalışanlarımız için yeni roller/pozisyonlar tanımlanmış veya mevcut iş tanımları güncellenmiştir.",
      "Firmamızda dijital dönüşüm sürecini yürüten veya bu konuda sorumluluk üstlenen tanımlı bir kişi/ekip vardır.",
    ],
    resources: [
      { name: "Çorlu TSO Eğitim Programları", url: null },
    ],
    levelGuide: [
      {
        description: "Dijital okuryazarlık düşük; teknoloji kullanımına karşı kurumsal direnç gözleniyor.",
        action: "1. Odak: Dijitalleşme kültürünü başlatın ve çalışan kaygılarını giderin. 2. Araç: Personel dijital yetkinlik envanteri çıkarın; temel siber hijyen ve dijital araç kullanım eğitimleri düzenleyin. 3. Çıktı: Kurumsal dijital farkındalığı artırıp teknoloji adaptasyon katsayısını yükseltin."
      },
      {
        description: "Bazı kilit personel gelişmiş araçları kullanıyor ancak eğitim ve rol tanımları kişisel çabaya bağlı.",
        action: "1. Odak: Dijital becerileri bireysel olmaktan çıkarıp kurumsal yetkinlik planına dönüştürün. 2. Araç: Departman bazlı Dijital Beceri Geliştirme (Reskilling/Upskilling) takvimi ve rol tanımları oluşturun. 3. Çıktı: Dijital araçların doğru kullanımını tüm departmanlara yayın."
      },
      {
        description: "Yönetim dijitalleşmeyi stratejik hedef olarak benimsemiş; dönüşüm sorumluları ve bütçe tanımlı.",
        action: "1. Odak: Değişim yönetimini (Change Management) sistematik hale getirin. 2. Araç: Çapraz fonksiyonlu Dijital Dönüşüm Komitesi kurun ve 'Dijital Elçiler' (Digital Champions) belirleyin. 3. Çıktı: Yıllık dijitalleşme bütçesi ve somut kurumsal Hedef ve Anahtar Sonuçlar (OKR) ile ilerleyin."
      },
      {
        description: "Dijital kültür organizasyona yayılmış; çalışanların dijital katkısı sayısal takip ediliyor.",
        action: "1. Odak: Dijital araç kullanım verimliliğini insan kaynakları performans sistemine bağlayın. 2. Araç: İnsan Kaynakları Analitiği (People Analytics) ve Eğitim Takip Sistemleri (LMS) devreye alın. 3. Çıktı: Çalışanların dijital yetkinlik gelişimini ve performans artışını sayısal olarak kanıtlayın."
      },
      {
        description: "Çevik (Agile), sürekli öğrenen ve yapay zekayı günlük iş yapış biçimine oturtmuş inovatif organizasyon.",
        action: "1. Odak: İç girişimcilik ve sürekli inovasyon kültürünü kurumun merkezine koyun. 2. Araç: Çevik Takımlar (Agile Squads) yapısı ve Yapay Zeka Yardımcıları (AI Copilots) kullanımını yayın. 3. Çıktı: Teknolojik değişimlere ışık hızında adapte olan dijital yerli kurumsal kültür yaratın."
      },
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
    resources: [
      { name: "KOSGEB Bilgi Yönetimi Destek Programı", url: "https://www.kosgeb.gov.tr" },
      { name: "KVKK Kurumu — Veri Sorumluları Sicili (VERBİS) Rehberlik Kaynakları", url: "https://verbis.kvkk.gov.tr" },
      { name: "TSE — Bilgi Güvenliği Yönetim Sistemi (ISO/IEC 27001) Danışmanlığı", url: "https://www.tse.org.tr" },
    ],
    levelGuide: [
      {
        description: "Temel siber güvenlik önlemleri ve veri yedekleme yetersiz; veri kaybı ve siber saldırı riski yüksek.",
        action: "1. Odak: Temel siber hijyeni ve veri emniyetini acilen sağlayın. 2. Araç: Lisanslı kurumsal Antivirüs, UTM Firewall edinin; 3-2-1 kuralına uygun otomatik veri yedekleme kurun ve Çok Faktörlü Doğrulamayı (MFA) zorunlu yapın. 3. Çıktı: İşletmeyi fidye yazılımları ve veri kaybı felaketlerinden koruyun."
      },
      {
        description: "Temel güvenlik araçları var ancak yazılı güvenlik politikası, KVKK uyumu ve yetkilendirme eksik.",
        action: "1. Odak: Bilgi güvenliği kurallarını ve erişim sınırlarını resmileştirin. 2. Araç: Bilgi Güvenliği Politikası hazırlayın; En Az Yetki (Least Privilege) prensibi uygulayın ve çalışanlara Oltalama (Phishing) simülasyon eğitimleri verin. 3. Çıktı: İnsan kaynaklı siber güvenlik zafiyetlerini ve yetkisiz veri erişim risklerini minimize edin."
      },
      {
        description: "Siber güvenlik ve altyapı politikaları tanımlı; KVKK/GDPR ve ISO 27001 standartlarına uyum var.",
        action: "1. Odak: Sistem zafiyetlerini proaktif olarak tespit edin ve iş sürekliliğini garantiye alın. 2. Araç: Yılda en az bir kez profesyonel Sızma Testi (Penetration Test) yaptırın; Felaket Kurtarma (Disaster Recovery) merkezini aktif edin. 3. Çıktı: Olası bir kesinti durumunda iş süreçlerinin kesintisiz devamını sağlayın."
      },
      {
        description: "Ağ trafiği ve sistem olayları 7/24 izleniyor; güvenlik ihlallerine anlık müdahale ediliyor.",
        action: "1. Odak: Siber tehditleri gerçekleşmeden veya yayılmadan ağ seviyesinde engelleyin. 2. Araç: SIEM (Güvenlik Bilgileri ve Olay Yönetimi) ve EDR (Uç Nokta Tehdit Algılama & Yanıt) çözümleri kurun. 3. Çıktı: Şüpheli aktivitelerin ortalama tespit (MTTD) ve müdahale (MTTR) sürelerini dakikalar seviyesine indirin."
      },
      {
        description: "Sıfır Güven (Zero Trust) mimarisi ve yapay zeka destekli otonom tehdit avcılığı aktif.",
        action: "1. Odak: Hiçbir kullanıcıya veya cihaza varsayılan olarak güvenmeyen bütünsel koruma sağlayın. 2. Araç: Sıfır Güven (Zero Trust Network Access), Tehdit İstihbaratı ve SOAR (Güvenlik Otomasyonu) entegre edin. 3. Çıktı: Karmaşık siber tehditlere karşı otonom savunan dayanıklı dijital altyapı oluşturun."
      },
    ],
  },
];

const SCALE_LABELS = ["Hiç yok", "Başlangıç", "Kısmen var", "Sistematik", "Tam entegre"];

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
