# Çorlu TSO — Dijital Olgunluk Ölçüm Aracı

6 eksen / 24 sorudan oluşan, üye firmaların dijital dönüşüm olgunluğunu
ölçen interaktif değerlendirme aracı. Sonuç ekranında radar grafik, eksen
bazlı skorlar ve zayıf eksenlere özel destek programı önerileri (KOSGEB,
EDIH, TÜBİTAK TÜSSİDE) sunulur.

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

## Sonraki adımlar (KVKK / veri kaydı)

Şu anki sürüm **veri kaydetmiyor** — sonuçlar sadece kullanıcının tarayıcısında
kalıyor, kimseye gönderilmiyor. Firma bazlı sonuçları kaydetmek istersen:

1. Giriş ekranına aydınlatma metni + açık rıza onay kutusu eklenmeli
2. Bir backend/veritabanı seçilmeli (Supabase önerilir — Hibe Motoru'nda
   kullandığın yaklaşıma benzer şekilde)
3. Ham cevaplara erişim sadece yetkili personelle sınırlı tutulmalı
4. Toplu/istatistiksel görünüm (ör. "Çorlu sanayisi ortalama olgunluk puanı")
   ayrı ve anonimleştirilmiş tutulmalı

## Proje yapısı

```
src/
  App.jsx        → tüm uygulama mantığı (sorular, puanlama, radar/gauge grafikleri)
  main.jsx       → React giriş noktası
  index.css      → Tailwind
index.html       → Google Fonts + kök HTML
```
