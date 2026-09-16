# Çorlu TSO — EDIH / DMAT Dijital Olgunluk Değerlendirmesi

Bu sürüm yalnızca **European Digital Innovation Hubs (EDIH) Digital Maturity Assessment Tool (DMAT)** KOBİ soru setini ve DMAT puanlama yaklaşımını kullanır. Önceki özel dijital olgunluk soruları, karma metodolojiler ve özel 1–5 olgunluk modeli kaldırılmıştır.

## Kapsam

- Modül 1: İşletme / katılımcı temel bilgileri
- Modül 2: DMAT'ın 6 boyutu ve 11 ana sorusu
  1. Dijital İş Stratejisi — Q1, Q2
  2. Dijital Hazırlıklılık — Q3, Q4
  3. İnsan Odaklı Dijitalleşme — Q5, Q6
  4. Veri Yönetimi ve Bağlanabilirliği — Q7, Q8
  5. Otomasyon ve Yapay Zekâ — Q9
  6. Yeşil Dijitalleşme — Q10, Q11

## Puanlama

Uygulama, JRC'nin DMAT çerçevesindeki puanlama kurallarını uygular:

- Her ana soru 0–10 aralığına normalize edilir.
- Her boyut 0–100 aralığında hesaplanır.
- Q1'in “halihazırda yatırım” ve “yatırım planı” sütunları ayrı alt-sorular gibi değerlendirilir ve Q2 ile birlikte Boyut 1'i oluşturur.
- Q4 ve Q9'daki 0–5 yanıtları 0, .2, .4, .6, .8 ve 1'e karşılık gelecek şekilde normalize edilir.
- Q11 için Hayır=0, Kısmen=1, Evet=2 kullanılır.
- Genel DMAT skoru altı boyut skorunun aritmetik ortalamasıdır.
- Sonuç raporu genel skor, altı boyut puanı, soru puanları, verilen yanıtlar ve DMAT metodoloji/kaynak notlarını içerir.

## Önemli veri düzeltmeleri

Yüklenen çalışma dokümanındaki biçim hatalarına karşı resmî EDIH Türkçe formu esas alınmıştır:

- 4. boyut: **Veri Yönetimi ve Bağlanabilirliği**
- Q9: resmî formdaki **5 teknoloji grubu** kullanılır; yinelenen satırlar kaldırılmıştır.

## Resmî kaynaklar

1. European Commission JRC — *Digital Maturity Assessment (DMA) Framework & Questionnaires for SMEs/PSOs*, JRC133234 (2023)
2. European Digital Innovation Hubs Network — Türkçe DMAT KOBİ soru formu
3. EDIH Network — Open DMAT

Kaynak bağlantıları uygulamanın **Metodoloji & Kaynaklar** ekranında ve PDF raporunda yer alır.

> Bu yerel uygulama, resmî EDIH portalına veya benchmark veritabanına otomatik veri aktarımı yapmaz. Soru seti ve yerel skor hesaplaması DMAT metodolojisine göre tasarlanmıştır.

## Çalıştırma

```bash
npm install
npm run dev
```

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## Ortam değişkenleri

Supabase veya e-posta bildirimleri kullanılacaksa mevcut `.env` yapılandırması korunabilir. Temel DMAT soru/puanlama akışı bunlardan bağımsızdır.
