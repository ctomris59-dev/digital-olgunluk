import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase henüz kurulmadıysa (env değişkenleri yoksa) uygulama hiçbir hata
// vermeden çalışmaya devam eder — sonuçlar sadece ekranda gösterilir, kaydedilmez.
const supabase = url && key ? createClient(url, key) : null;

export async function saveAssessment({ firmName, answers, scores, overall, levelName, consent }) {
  if (!supabase) {
    console.info(
      "[dijital-olgunluk] Supabase yapılandırılmamış — sonuç kaydedilmedi. " +
        "Kurulum için README.md dosyasındaki 'Veri Kaydı Kurulumu' bölümüne bakın."
    );
    return false;
  }

  const { error } = await supabase.from("assessments").insert({
    firm_name: firmName,
    answers,
    scores,
    overall_score: overall,
    level: levelName,
    consent,
  });

  if (error) {
    console.error("[dijital-olgunluk] Supabase kayıt hatası:", error.message);
    return false;
  }
  return true;
}

export async function saveTrainingSignup({ firmName, email, phone }) {
  if (!supabase) {
    console.info(
      "[dijital-olgunluk] Supabase yapılandırılmamış — eğitim kaydı alınmadı. " +
        "Kurulum için README.md dosyasındaki 'Veri Kaydı Kurulumu' bölümüne bakın."
    );
    return false;
  }

  const { error } = await supabase.from("training_signups").insert({
    firm_name: firmName,
    email,
    phone: phone || null,
  });

  if (error) {
    console.error("[dijital-olgunluk] Eğitim kaydı hatası:", error.message);
    return false;
  }
  return true;
}

export default supabase;
