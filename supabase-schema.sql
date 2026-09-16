-- Çorlu TSO — EDIH / DMAT Dijital Olgunluk Değerlendirmesi
-- Supabase SQL Editor'de çalıştırılabilir.

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

-- Önceki deployment'larda eksik olabilecek iletişim sütunlarını güvenli biçimde ekler.
alter table assessments add column if not exists contact_name text;
alter table assessments add column if not exists email text;
alter table assessments add column if not exists phone text;

-- Web ziyaretçileri yalnızca yeni DMAT değerlendirmesi ekleyebilir;
-- kayıtları anonim olarak okuyamaz, değiştiremez veya silemez.
alter table assessments enable row level security;

drop policy if exists "Anonim kullanıcı sadece ekleyebilir" on assessments;
create policy "Anonim kullanıcı sadece ekleyebilir"
  on assessments
  for insert
  to anon
  with check (true);
