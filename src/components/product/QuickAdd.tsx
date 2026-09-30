"use client";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";
import { PlusIcon } from "@/components/ui/Icons";

export default function QuickAdd({ item, needsOptions }: { item: CartItem; needsOptions: boolean }) {
  const { add } = useCart();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={needsOptions ? `Choose options for ${item.name}` : `Add ${item.name} to cart`}
      onClick={() => {
        if (needsOptions) return router.push(`/products/${item.slug}`);
        add(item);
        toast(`Added "${item.name}" to cart`);
      }}
      className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center border border-neutral-300 bg-white text-ink shadow-sm transition hover:bg-ink hover:text-white"
    >
      <PlusIcon className="h-4 w-4" />
    </button>
  );
}
