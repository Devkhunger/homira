import type { Quote } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";

export default function OrderSummary({ quote }: { quote: Quote }) {
  const saved = quote.mrpTotal - quote.subtotal + quote.discount;
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between"><dt>Total MRP</dt><dd>{formatINR(quote.mrpTotal)}</dd></div>
      {quote.mrpTotal > quote.subtotal && (
        <div className="flex justify-between text-green-700"><dt>Discount on MRP</dt><dd>− {formatINR(quote.mrpTotal - quote.subtotal)}</dd></div>
      )}
      {quote.discount > 0 && (
        <div className="flex justify-between text-green-700"><dt>Coupon ({quote.coupon?.code})</dt><dd>− {formatINR(quote.discount)}</dd></div>
      )}
      <div className="flex justify-between">
        <dt>Shipping</dt>
        <dd>{quote.shipping === 0 ? <span className="text-green-700">FREE</span> : formatINR(quote.shipping)}</dd>
      </div>
      <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(quote.total)}</dd></div>
      {saved > 0 && <p className="bg-green-50 p-2 text-center text-xs font-semibold text-green-800">You save {formatINR(saved)} on this order</p>}
      {quote.shipping > 0 && quote.freeShippingAbove > 0 && (
        <p className="text-center text-xs text-neutral-600">
          Add {formatINR(quote.freeShippingAbove - (quote.subtotal - quote.discount))} more for FREE shipping
        </p>
      )}
    </dl>
  );
}
