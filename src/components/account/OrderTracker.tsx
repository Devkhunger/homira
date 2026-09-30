const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
const LABELS = ["Order placed", "Confirmed", "Shipped", "Delivered"];

export default function OrderTracker({ status }: { status: string }) {
  if (status === "CANCELLED") return <p className="bg-neutral-100 p-4 text-sm font-semibold">This order was cancelled.</p>;
  const idx = STEPS.indexOf(status);
  return (
    <ol className="flex items-start">
      {STEPS.map((s, i) => (
        <li key={s} className="relative flex flex-1 flex-col items-center text-center">
          {i > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full ${i <= idx ? "bg-brand" : "bg-neutral-200"}`} />}
          <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${i <= idx ? "bg-brand text-white" : "bg-neutral-200 text-neutral-500"}`}>
            {i < idx || status === "DELIVERED" ? "✓" : i + 1}
          </span>
          <span className={`mt-2 text-xs ${i <= idx ? "font-semibold" : "text-neutral-500"}`}>{LABELS[i]}</span>
        </li>
      ))}
    </ol>
  );
}
