# Çorlu TSO — Dijital Olgunluk Ölçüm Aracı

6 eksen / 30 sorudan oluşan, üye firmaların dijital dönüşüm olgunluğunu
ölçen interaktif değerlendirme aracı. Sonuç ekranında radar grafik,
**eksen bazlı ve genel puan bazlı ayrı ayrı, CMMI'ın 5 seviyeli olgunluk
merdivenine dayanan somut aksiyon önerileri**, acatech Industrie 4.0
Maturity Index'e uyarlanmış 6 aşamalı genel olgunluk seviyesi, zayıf
eksenlere özel destek programı önerileri (KOSGEB, EDIH, TÜBİTAK TÜSSİDE),
tam kaynakçalı bir **Metodoloji** bölümü (ana sayfada ve rapor sonunda) ve
**çok sayfalı, açıklamalı PDF rapor indirme** özelliği sunulur.

## Metodoloji

Araç; acatech Industrie 4.0 Maturity Index, MIT & Capgemini Digital Maturity
Model (Westerman, Bonnet & McAfee) ve Avrupa Komisyonu EDIH Open DMAT
çerçevelerinden esinlenerek özgün olarak geliştirilmiştir. Tam kaynakça ve
yöntem açıklaması, uygulama içindeki "Metodoloji" bağlantısında (giriş
ekranı ve sonuç raporu) ve `src/App.jsx` içindeki `MethodologyModal`
bileşeninde yer alır.

## Yerel geliştirme

```bash
npm install
npm run dev
```

`http://localhost:5173` adresinde açılır.

## Production build

```bash
npm run build
npm run preview   # build'i yerelde test etmek için
```

## GitHub'a yükleme

Bu klasörü zaten `git init` ile hazırladım. Kendi GitHub hesabınla bağlamak için:

```bash
cd dijital-olgunluk
git remote add origin https://github.com/<kullanici-adin>/corlu-tso-dijital-olgunluk.git
git branch -M main
git push -u origin main
```

(Önce GitHub'da boş bir repo oluşturman gerekiyor — README/`.gitignore` eklemeden,
"Create repository" ile.)

## Vercel'e deploy (Hibe Motoru ile aynı akış)

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub reponu seç (`corlu-tso-dijital-olgunluk`)
3. Framework otomatik **Vite** olarak algılanır — ek ayar gerekmez
4. **Deploy** — birkaç dakika içinde `https://corlu-tso-dijital-olgunluk.vercel.app`
   gibi bir adres verir
5. İstersen Vercel proje ayarlarından kendi alan adını (ör. `dijitalolgunluk.corlutso.org.tr`)
   bağlayabilirsin

Her `git push` sonrası Vercel otomatik olarak yeniden deploy eder.

## KVKK / Veri Kaydı Kurulumu

Uygulamada artık:
- Giriş ekranında **zorunlu KVKK onay kutusu** var (metnine tıklayınca tam
  aydınlatma metni açılır); onaylamadan değerlendirmeye başlanamıyor.
- Sonuç ekranına geçildiğinde cevaplar otomatik olarak Supabase'e kaydedilmeye
  çalışılır. **Supabase kurulmamışsa uygulama hata vermez** — sadece kayıt
  yapılmaz, sonuç kullanıcının ekranında görünmeye devam eder.

Gerçek veri kaydını aktif etmek için:

### 1. Supabase projesi oluştur

1. [supabase.com](https://supabase.com) → ücretsiz hesap aç → **New Project**
2. Proje adı: `corlu-tso-dijital-olgunluk`, bölge: Frankfurt (Avrupa'ya en yakın)
3. Proje oluşunca sol menüden **SQL Editor** → bu repodaki `supabase-schema.sql`
   dosyasının içeriğini yapıştır → **Run**. Bu, `assessments` tablosunu ve
   güvenlik kurallarını (RLS) oluşturur — ziyaretçiler sadece kayıt
   ekleyebilir, var olan kayıtları okuyamaz.
4. Sol menüden **Project Settings → API** → `Project URL` ve `anon public`
   anahtarını kopyala

### 2. Yerel geliştirmede kullan (opsiyonel)

`.env.example` dosyasını `.env.local` olarak kopyala, içine yapıştır:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Vercel'de aktif et (canlı site için asıl gereken adım)

1. Vercel proje sayfan → **Settings → Environment Variables**
2. `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini ekle
   (Production + Preview + Development hepsini işaretle)
3. **Deployments → en son deploy → Redeploy** (yeni env değişkenlerinin
   devreye girmesi için yeniden build gerekir)

### 4. Kayıtları görüntüleme

Supabase Dashboard → **Table Editor**. İki tablo oluşur:
- **assessments** — tamamlanan değerlendirmelerin cevap/skor kayıtları
- **training_signups** — "Ücretsiz Eğitimlerden Haberdar Olun" formunu dolduran
  firmaların e-posta/telefon bilgileri (Dijital Dönüşüm, YZ, Dijitalleşme
  eğitim duyuruları için)

Her iki tablo da sadece senin (proje sahibi) hesabınla görülebilir; RLS
sayesinde web sitesi ziyaretçileri veya başka biri bu verilere erişemez.

## PDF Rapor

Sonuç ekranındaki **"Raporu PDF Olarak İndir"** butonu, `src/lib/pdfReport.js`
içindeki motoru kullanarak 4 sayfalık bir rapor üretir: kapak + genel puan,
radar grafik + eksen detayları, öneriler + sonraki adım, ve tam metodoloji +
kaynakça. Ekranda gösterilen sorular/skorlar ile PDF içeriği `src/lib/data.js`
dosyasından beslenir — ikisi arasında tutarsızlık oluşmaz.

## Eğitim Bildirimi E-postası Kurulumu

"Ücretsiz Eğitimlerden Haberdar Olun" formu dolduran firmaların bilgisi
otomatik olarak Supabase'e kaydedilir (`training_signups` tablosu). Ayrıca,
her yeni kayıtta **sana otomatik bir e-posta bildirimi** gönderilmesi için
[EmailJS](https://www.emailjs.com) (ücretsiz, sunucu gerektirmeyen bir
e-posta servisi) kullanılır.

### Kurulum

1. [emailjs.com](https://www.emailjs.com) → ücretsiz hesap aç
2. **Email Services** → **Add New Service** → Gmail (veya kullandığın
   e-posta sağlayıcısı) hesabını bağla → bir **Service ID** oluşur
3. **Email Templates** → **Create New Template**. İçeriği örneğin:
   ```
   Konu: Yeni Eğitim Kaydı — {{firm_name}}

   Firma: {{firm_name}}
   E-posta: {{signup_email}}
   Telefon: {{signup_phone}}
   Tarih: {{sent_at}}
   ```
   Template'in **"To Email"** alanına kendi e-posta adresini yaz (bildirimin
   nereye düşeceğini burada belirliyorsun) → bir **Template ID** oluşur
4. **Account → General** → **Public Key**'i kopyala

### Vercel'de aktif et

Vercel → Settings → Environment Variables → şu üç değişkeni ekle:
```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```
Ardından **Deployments → Redeploy**. Bu değişkenler yoksa form yine
Supabase'e kaydeder, sadece e-posta bildirimi gitmez (hata vermez).

Ücretsiz plan ayda 200 e-postaya kadar yeterlidir — bu araç için fazlasıyla
yeterli.

## Türkçe Karakter Desteği (PDF)

jsPDF'in dahili fontları (Helvetica/Courier) ğ, ş, ı, İ gibi Türkçe'ye özgü
karakterleri desteklemez. Bunun için `public/fonts/` içine, sadece gerekli
karakterlerle küçültülmüş (subset) bir DejaVu Sans fontu gömülüdür ve PDF
motoru bunu çalışma zamanında yükleyip belgeye gömer — böylece PDF'teki tüm
Türkçe karakterler doğru görüntülenir. Bu dosyaları silme/taşıma; silinirse
PDF oluşturma çalışmaz.

## Proje yapısı

```
src/
  App.jsx                → tüm uygulama mantığı (ekranlar, puanlama, radar/gauge grafikleri)
  main.jsx                → React giriş noktası
  index.css               → Tailwind
  lib/data.js              → sorular, eksenler, olgunluk skalası (ekran + PDF ortak kaynağı)
  lib/pdfReport.js         → çok sayfalı PDF rapor motoru (Türkçe font gömülü)
  lib/supabaseClient.js    → değerlendirme + eğitim kaydı veri kaydı (opsiyonel)
  lib/emailNotify.js       → eğitim kaydı e-posta bildirimi (opsiyonel)
public/
  ctso-logo.jpg            → Çorlu TSO logosu
  fonts/                   → PDF için gömülü Türkçe font (DOKUNMA)
index.html                 → Google Fonts + kök HTML
```
