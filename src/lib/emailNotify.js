import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const isConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// Eğitim kaydı formu doldurulduğunda Çorlu TSO'ya otomatik bildirim e-postası
// gönderir. EmailJS kurulmamışsa (env değişkenleri yoksa) sessizce atlanır —
// kayıt yine de Supabase'e düşer, sadece e-posta bildirimi gitmez.
// Kurulum: README.md → "Eğitim Bildirimi E-postası Kurulumu" bölümü.
export async function notifyTrainingSignup({ firmName, email, phone }) {
  if (!isConfigured) {
    console.info(
      "[dijital-olgunluk] EmailJS yapılandırılmamış — e-posta bildirimi gönderilmedi. " +
        "Kurulum için README.md dosyasındaki 'Eğitim Bildirimi E-postası Kurulumu' bölümüne bakın."
    );
    return false;
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        firm_name: firmName || "Belirtilmedi",
        signup_email: email,
        signup_phone: phone || "Belirtilmedi",
        sent_at: new Date().toLocaleString("tr-TR"),
      },
      { publicKey: PUBLIC_KEY }
    );
    return true;
  } catch (err) {
    console.error("[dijital-olgunluk] EmailJS gönderim hatası:", err);
    return false;
  }
}
