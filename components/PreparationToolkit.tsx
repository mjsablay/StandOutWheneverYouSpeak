import { Download, ArrowUpRight } from "lucide-react";
import { PREPARATION_MATERIALS, CONTEXT_TEMPLATE } from "@/lib/preparation";

export default function PreparationToolkit() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {PREPARATION_MATERIALS.map((item, i) => (
          <a key={item.file} href={`/materials/${item.file}`} download className="group rounded-3xl border border-line bg-white p-6 shadow-card transition hover:border-brand focus-visible:outline-2 focus-visible:outline-brand">
            <div className="mb-5 flex items-center justify-between text-brand"><span className="text-sm font-bold">{String(i + 1).padStart(2, "0")}</span><Download className="h-5 w-5" /></div>
            <h2 className="text-lg font-bold group-hover:text-brand">{item.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
            <span className="mt-5 block text-xs font-semibold text-brand">Download original PDF</span>
          </a>
        ))}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-paper-soft p-6 sm:p-8">
          <h2 className="text-xl font-bold">First, give the AI your context</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">Start a new conversation in ChatGPT or Microsoft Copilot. Assume it knows nothing about you or your presentation. Use these six questions to write your context note.</p>
          <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7">{CONTEXT_TEMPLATE}</pre>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-brand">
            <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">Open ChatGPT <ArrowUpRight className="h-4 w-4" /><span className="sr-only"> (new tab)</span></a>
            <a href="https://copilot.microsoft.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">Open Copilot <ArrowUpRight className="h-4 w-4" /><span className="sr-only"> (new tab)</span></a>
          </div>
        </section>
        <section className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold">Build it. Check it. Practise it.</h2>
          <ol className="mt-5 space-y-5 text-[15px] leading-relaxed">
            <li><strong>1. Frame the message.</strong> Send your context, Prompt 1 and your background material, in that order. Keep the prompt unchanged and add your own instructions separately.</li>
            <li><strong>2. Check the Pyramid.</strong> Review the Conclusion, two to four Main Points, Evidence for each point and Close. Verify facts and make the wording your own before moving on.</li>
            <li><strong>3. Create your notes.</strong> Send Prompt 2 followed by your completed Pyramid. Check for one idea per line, a round bullet on every speaking line, progressive indentation and space between thought groups.</li>
            <li><strong>4. Prepare to speak.</strong> Where formatting is supported, use Arial 14 pt, approximately 1.5 line spacing and half-inch indentation steps, normally no more than five levels. Check the timing aloud.</li>
          </ol>
          <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-ink-soft">The PDFs are Barry&apos;s original instructions, supplied in October 2026. Use them unchanged. You own the final judgment; Katya coaches the work you bring to her.</p>
        </section>
      </div>
    </div>
  );
}
