"use client";
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-outline w-full">
      Print packing slip / invoice
    </button>
  );
}
