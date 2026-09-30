import { db } from "@/lib/db";
import { getSettings, type Settings } from "@/lib/settings";
import { razorpayEnabled } from "@/lib/razorpay";
import { requireAdmin } from "@/lib/auth";
import { addOwner, removeOwner, saveSettings } from "../actions";
import InlineForm from "@/components/admin/InlineForm";
import { PageHeader } from "@/components/admin/ui";

function T({ s, k, label, placeholder, span = false }: { s: Settings; k: keyof Settings; label: string; placeholder?: string; span?: boolean }) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input name={k} defaultValue={s[k]} placeholder={placeholder} className="input" />
    </div>
  );
}
function Area({ s, k, label, rows = 5 }: { s: Settings; k: keyof Settings; label: string; rows?: number }) {
  return (
    <div className="sm:col-span-2">
      <label className="label">{label}</label>
      <textarea name={k} defaultValue={s[k]} rows={rows} className="input font-mono text-[13px]" />
    </div>
  );
}
function Img({ s, k, label }: { s: Settings; k: keyof Settings; label: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {s[k] && (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="mb-2 flex items-center gap-3"><img src={s[k]} alt="" className="h-16 rounded border object-contain" /><label className="text-xs"><input type="checkbox" name={`remove_${k}`} /> remove</label></div>
      )}
      <input type="file" name={k} accept="image/*" className="text-sm" />
    </div>
  );
}
function Color({ s, k, label }: { s: Settings; k: keyof Settings; label: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type="color" name={k} defaultValue={s[k]} className="h-10 w-24 cursor-pointer" />
    </div>
  );
}
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="font-sans font-semibold">{title}</h2>
      {hint && <p className="mb-4 text-xs text-neutral-500">{hint}</p>}
      <InlineForm action={saveSettings} className="mt-4 grid gap-4 sm:grid-cols-2">{children}</InlineForm>
    </section>
  );
}

export default async function AdminSettings() {
  const me = await requireAdmin();
  const [s, owners] = await Promise.all([
    getSettings(),
    db.user.findMany({ where: { role: "ADMIN" }, select: { id: true, name: true, email: true } }),
  ]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Everything customers see — brand, colours, contact details, story and policies." />
      <div className="space-y-6">
        <Section title="Brand & colours" hint="Colours update across the whole website instantly.">
          <T s={s} k="brandName" label="Brand name" />
          <T s={s} k="tagline" label="Tagline" />
          <T s={s} k="parentCompany" label="Parent company (shown in footer)" />
          <Img s={s} k="logoUrl" label="Logo (PNG with transparent background works best)" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:col-span-2">
            <Color s={s} k="colorBrand" label="Main colour" />
            <Color s={s} k="colorAccent" label="Accent colour" />
            <Color s={s} k="colorSoft" label="Top bar & footer" />
            <Color s={s} k="colorCream" label="Soft background" />
          </div>
        </Section>

        <Section title="Contact & social media">
          <T s={s} k="whatsapp" label="WhatsApp number" />
          <T s={s} k="phone" label="Phone" />
          <T s={s} k="email" label="Email" />
          <T s={s} k="hours" label="Working hours" />
          <T s={s} k="address" label="Address" span />
          <T s={s} k="instagram" label="Instagram URL" />
          <T s={s} k="facebook" label="Facebook URL" />
          <T s={s} k="youtube" label="YouTube URL" />
          <T s={s} k="pinterest" label="Pinterest URL" />
          <T s={s} k="gstin" label="GSTIN (optional, shown in footer)" />
        </Section>

        <Section title="Our Story page">
          <T s={s} k="storyTitle" label="Section 1 heading" span />
          <Area s={s} k="storyText" label="Section 1 text" rows={6} />
          <Img s={s} k="storyImage" label="Section 1 photo (founders)" />
          <div />
          <T s={s} k="story2Title" label="Section 2 heading" span />
          <Area s={s} k="story2Text" label="Section 2 text" rows={4} />
          <Img s={s} k="story2Image" label="Section 2 photo (workshop / craft)" />
        </Section>

        <Section title="Shipping, delivery & payments" hint={razorpayEnabled() ? "Online payments: Razorpay is connected ✓" : "Online payments: add your Razorpay keys to the server .env file to accept UPI/cards."}>
          <T s={s} k="freeShippingAbove" label="Free shipping above ₹" />
          <T s={s} k="shippingFee" label="Shipping fee ₹ (below that amount)" />
          <T s={s} k="deliveryDays" label="Normal delivery (days)" />
          <T s={s} k="expressDays" label="Fast delivery (days)" />
          <T s={s} k="expressPincodes" label="Fast-delivery pincode prefixes (comma separated, e.g. 110,400)" span />
          <input type="hidden" name="__codEnabled" value="1" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="codEnabled" defaultChecked={s.codEnabled === "true"} /> Allow Cash on Delivery</label>
          <T s={s} k="codFee" label="COD fee ₹ (0 for none)" />
        </Section>

        <Section title="Information pages" hint='Write in plain text. Start a line with "## " for a heading. Leave a blank line between paragraphs.'>
          <Area s={s} k="pageFaqs" label="FAQs" rows={10} />
          <Area s={s} k="pageShipping" label="Shipping & Returns" rows={10} />
          <Area s={s} k="pagePrivacy" label="Privacy Policy" rows={8} />
          <Area s={s} k="pageTerms" label="Terms of Use" rows={8} />
        </Section>

        <Section title="Search engines (SEO)">
          <Area s={s} k="metaDescription" label="Short description of your store for Google" rows={2} />
        </Section>

        <section className="card">
          <h2 className="font-sans font-semibold">Owners (admin access)</h2>
          <p className="mb-4 text-xs text-neutral-500">Only these people can open this dashboard and add products. Customers can never access it.</p>
          <ul className="mb-5 divide-y text-sm">
            {owners.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2">
                <span>{o.name} · {o.email}</span>
                {o.id !== me.id && owners.length > 1 && (
                  <form action={removeOwner}><input type="hidden" name="id" value={o.id} /><button className="text-xs text-sale hover:underline">Remove access</button></form>
                )}
              </li>
            ))}
          </ul>
          <InlineForm action={addOwner} resetOnSuccess submitLabel="Add owner" className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Name</label><input name="name" className="input" /></div>
            <div><label className="label">Email *</label><input name="email" type="email" required className="input" /></div>
            <div><label className="label">Password (for a new account)</label><input name="password" type="password" minLength={8} className="input" /></div>
          </InlineForm>
        </section>
      </div>
    </>
  );
}
