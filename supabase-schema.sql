-- Çorlu TSO Dijital Olgunluk Ölçüm Aracı — Supabase tablo kurulumu
-- Supabase projende SQL Editor'e yapıştırıp çalıştır.

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  firm_name text,
  contact_name text,
  email text,
  phone text,
  answers jsonb not null,
  scores jsonb not null,
  overall_score numeric not null,
  level text not null,
  consent boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bu proje daha önce "assessments" tablosu oluşturulmuş olarak deploy edilmiş
-- olabilir (contact_name/email/phone sütunları olmadan). Aşağıdaki satırlar,
-- tablo zaten varsa ve bu sütunlar eksikse, MEVCUT KAYITLARA DOKUNMADAN
-- sadece eksik sütunları ekler. Tablo sıfırdan oluşturulduysa bu satırlar
-- zaten no-op olur (sütunlar yukarıda mevcut).
alter table assessments add column if not exists contact_name text;
alter table assessments add column if not exists email text;
alter table assessments add column if not exists phone text;

-- Row Level Security açık: anonim kullanıcılar (web sitesindeki ziyaretçiler)
-- SADECE yeni kayıt ekleyebilir (insert). Var olan kayıtları okuyamaz/değiştiremez/silemez.
-- Bu sayede firma cevapları yalnızca Supabase Dashboard üzerinden, senin (proje sahibi)
-- girişinle görülebilir — KVKK'daki "yalnızca yetkili personel erişimi" ilkesine uygundur.
alter table assessments enable row level security;

create policy "Anonim kullanıcı sadece ekleyebilir"
  on assessments
  for insert
  to anon
  with check (true);

-- Not: select/update/delete için hiçbir policy tanımlanmadı,
-- yani anon rolü bu tabloyu okuyamaz. Sadece Supabase Dashboard'daki
-- "Table Editor" üzerinden (senin hesabınla) kayıtları görebilirsin.

-- ---------------------------------------------------------------
-- Eğitim bildirimi kayıt formu (sonuç ekranındaki "Ücretsiz
-- Eğitimlerden Haberdar Olun" formu için)
-- ---------------------------------------------------------------

create table if not exists training_signups (
  id uuid primary key default gen_random_uuid(),
  firm_name text,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

alter table training_signups enable row level security;

create policy "Anonim kullanıcı sadece ekleyebilir (eğitim kaydı)"
  on training_signups
  for insert
  to anon
  with check (true);
