/** Renders owner-written page text: "## Heading" lines become headings, blank lines split paragraphs. No HTML is allowed. */
export default function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className="space-y-4 leading-relaxed text-neutral-700">
      {blocks.map((b, i) => {
        const lines = b.trim().split("\n");
        const out: React.ReactNode[] = [];
        let para: string[] = [];
        const flush = () => {
          if (para.length) out.push(<p key={out.length} className="whitespace-pre-line">{para.join("\n")}</p>);
          para = [];
        };
        for (const l of lines) {
          if (l.startsWith("## ")) {
            flush();
            out.push(<h2 key={out.length} className="pt-4 font-serif text-2xl font-semibold text-ink">{l.slice(3)}</h2>);
          } else para.push(l);
        }
        flush();
        return <div key={i} className="space-y-2">{out}</div>;
      })}
    </div>
  );
}
