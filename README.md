# Çorlu TSO — Dijital Olgunluk Ölçüm Aracı

6 eksen / 30 sorudan oluşan, üye firmaların dijital dönüşüm olgunluğunu
ölçen interaktif değerlendirme aracı. Sonuç ekranında radar grafik, eksen
bazlı skorlar, acatech Industrie 4.0 Maturity Index'e uyarlanmış 6 aşamalı
olgunluk seviyesi, zayıf eksenlere özel destek programı önerileri (KOSGEB,
EDIH, TÜBİTAK TÜSSİDE) ve tam kaynakçalı bir **Metodoloji** bölümü sunulur.

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

Supabase Dashboard → **Table Editor → assessments**. Sadece senin (proje
sahibi) hesabınla görülebilir; RLS sayesinde web sitesi ziyaretçileri veya
başka biri bu verilere erişemez.

## Proje yapısı

```
src/
  App.jsx        → tüm uygulama mantığı (sorular, puanlama, radar/gauge grafikleri)
  main.jsx       → React giriş noktası
  index.css      → Tailwind
index.html       → Google Fonts + kök HTML
```
