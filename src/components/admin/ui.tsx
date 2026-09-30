import Link from "next/link";

export function PageHeader({ title, action, subtitle }: { title: string; subtitle?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-sans text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
      </div>
      {action && <Link href={action.href} className="btn-primary py-2.5">{action.label}</Link>}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-neutral-50 text-xs uppercase tracking-wide text-neutral-600">
          <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border bg-white p-10 text-center text-sm text-neutral-500">{text}</p>;
}
