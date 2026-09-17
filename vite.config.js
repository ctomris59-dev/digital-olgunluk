import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function dmatAlignmentPlugin() {
  return {
    name: "dmat-official-alignment",
    enforce: "pre",
    transform(source, id) {
      let code = source;

      if (id.endsWith("/src/App.jsx") || id.endsWith("\\src\\App.jsx")) {
        code = code.replace(
          "onChange({ selected: next, none: false });",
          "onChange({ selected: next });",
        );

        code = code.replace(
          /\n\s*<button type="button" onClick=\{\(\) => onChange\(\{ selected: \[\], none: true \}\)\}[\s\S]*?<span className="text-\[11px\] font-extrabold">Yukarıdakilerin hiçbiri<\/span>\s*<\/button>/,
          `\n      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-semibold leading-5 text-slate-500">\n        Size uyan bir seçenek yoksa herhangi bir kutuyu işaretlemeden devam edebilirsiniz.\n      </div>`,
        );

        code = code.replace(
          "setAnswers((a) => ({ ...a, [key]: { selected, none: false } }));",
          "setAnswers((a) => ({ ...a, [key]: { selected } }));",
        );
        code = code.replace(
          /\n\s*const setNone = \(key\) => setAnswers\(\(a\) => \(\{ \.\.\.a, \[key\]: \{ selected: \[\], none: true \} \}\)\);/,
          "",
        );
        code = code.replace(
          /\n\s*<div className="grid gap-2 border-t border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">[\s\S]*?Halihazırda hiçbirine yatırım yapılmadı<\/button>[\s\S]*?Hiçbirine yatırım planlanmıyor<\/button>\s*<\/div>/,
          `\n      <div className="border-t border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-semibold leading-5 text-slate-500">\n        İlgili sütunda yatırım yapılan veya planlanan bir alan yoksa o sütunda seçim yapmadan devam edebilirsiniz.\n      </div>`,
        );

        code = code.replace(
          "Devam etmek için bu ekrandaki zorunlu alanları tamamlayın. Çoklu seçim sorularında hiçbir seçenek geçerli değilse “Yukarıdakilerin hiçbiri”ni seçin.",
          "Devam etmek için bu ekrandaki zorunlu ölçek değerlendirmelerini tamamlayın. Çoklu seçim sorularında size uyan seçenek yoksa seçim yapmadan devam edebilirsiniz.",
        );

        const resultView = '<ResultView profile={profile} answers={answers} result={result} onRestart={restart} onMethodology={() => setShowMethodology(true)} />';
        if (code.includes(resultView) && !code.includes("Detaylı Dijital Olgunluk Analizi raporunuz Çorlu TSO tarafından")) {
          code = code.replace(
            resultView,
            `<div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-blue-950">\n              <div className="flex items-start gap-3">\n                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white"><FileText size={15}/></div>\n                <div>\n                  <div className="text-[11px] font-black">Detaylı Dijital Olgunluk Analizi</div>\n                  <p className="mt-1 text-[10.5px] font-semibold leading-5 text-blue-900/75">Detaylı Dijital Olgunluk Analizi raporunuz Çorlu TSO tarafından hazırlanarak kayıtlı e-posta adresinize iletilecektir.</p>\n                </div>\n              </div>\n            </div>\n            ${resultView}`,
          );
        }
      }

      if (id.endsWith("/src/lib/data.js") || id.endsWith("\\src\\lib\\data.js")) {
        code = code.replace(/\{ selected: \[\], none: false \}/g, "{ selected: [] }");
        code = code.replace(
          /  if \(questionId === "q1"\) \{[\s\S]*?  const q = QUESTIONS\[questionId\];\n  if \(q\.type === "multi"\) \{[\s\S]*?\n  \}/,
          `  if (questionId === "q1") {\n    // Resmî DMAT'ta “hiçbiri” diye ayrı bir cevap yoktur; 0 seçim geçerli yanıttır.\n    return true;\n  }\n  const q = QUESTIONS[questionId];\n  if (q.type === "multi") {\n    // “Uygun tüm seçenekleri işaretleyin” sorularında 0 seçim geçerli bir yanıttır.\n    return true;\n  }`,
        );
      }

      if (id.endsWith("/src/lib/pdfReport.js") || id.endsWith("\\src\\lib\\pdfReport.js")) {
        code = code.replace('  if (value?.none) return "Yukarıdakilerin hiçbiri";\n', "");
        code = code.replace('  if (!value?.selected?.length) return "Yanıt yok";', '  if (!value?.selected?.length) return "Seçim yapılmadı";');
        code = code.replace(
          'const invested = answers.q1Invested.none ? "Hayır" : answers.q1Invested.selected.includes(i) ? "Evet" : "Hayır";',
          'const invested = answers.q1Invested.selected.includes(i) ? "Evet" : "Hayır";',
        );
        code = code.replace(
          'const planned = answers.q1Planned.none ? "Hayır" : answers.q1Planned.selected.includes(i) ? "Evet" : "Hayır";',
          'const planned = answers.q1Planned.selected.includes(i) ? "Evet" : "Hayır";',
        );
      }

      return code === source ? null : { code, map: null };
    },
  };
}

export default defineConfig({
  plugins: [dmatAlignmentPlugin(), react()],
});
