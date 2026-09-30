# Handloom Store

A full e-commerce website for a handloom business. The storefront layout follows chumbak.com, but the brand, colours, content and illustrations are your own. Owners run the store from a built-in dashboard, similar to a Meesho or Amazon seller panel.

**Tech:** Next.js 15, Prisma (PostgreSQL), Tailwind CSS, Razorpay.

## Run it locally

```bash
npm install
cp .env.example .env          # then edit the values
npm run setup                 # creates the database, your owner account and sample products
npm run build && npm start    # open http://localhost:3000
```

Owner login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env` (default `owner@example.com` / `ChangeMe@123`). Change this password straight away under **Account → Profile & Password**. The dashboard is at `/admin`.

To add another owner, go to **Admin → Settings → Owners**, or run `npm run create-admin -- email@x.com "password" "Name"`.

## What owners can do (`/admin`)

| Section | What it does |
|---|---|
| Dashboard | Sales for the last 30 days, orders waiting to ship, low stock, recent orders |
| Products | Add, edit or delete products: multiple photos (drag and drop, reorder, choose the cover), price/MRP with automatic % OFF, stock, fabric, weave, origin, colours, sizes, badges (New Arrival, Fast Moving…), hide or show |
| Categories | Menu items and sub-menus, category tiles, collection banners (image, or text with "starting at ₹___" worked out automatically) |
| Orders | Move orders through Pending → Confirmed → Shipped → Delivered; add courier, AWB and tracking link; WhatsApp the customer; print a packing slip. Cancelling puts the items back into stock |
| Customers | List of customers with order count and total spent |
| Home Banners / Announcement Bar | Hero slider on the home page and the sliding offers bar at the top |
| Coupons & Offers | Discount codes (% or ₹, minimum order, maximum discount); these appear in the "Best offers for you" box |
| Settings | Brand name, logo, **colours** (the whole site updates), contact details, social links, Our Story text and photos, shipping fees, COD on/off, fast-delivery pincodes, FAQ/policy pages, owner accounts |

## What customers get

- Sign up or log in with email and password, mobile OTP, or Google
- Cart, wishlist, coupons, saved addresses, checkout with Razorpay (UPI, cards, netbanking) or Cash on Delivery
- My Orders with a status tracker, cancelling COD orders before they ship, product reviews
- A Track Order page that works without logging in (order number + mobile number)

## Going live

1. **Database:** PostgreSQL. Set `DATABASE_URL`. `npm start` creates the tables and your owner account automatically on every deploy (safe to repeat).
2. **Payments:** put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the Razorpay dashboard in `.env`. Until then, only COD is offered.
3. **Google login:** create an OAuth client and add the redirect URI `https://yourdomain/api/auth/google/callback`.
4. **SMS OTP:** add MSG91 keys. Without them, OTPs are printed in the server console (development only).
5. **Hosting:** uploaded images are saved in `UPLOAD_DIR` on the server. Use a host with a persistent disk (a VPS, Railway volume or Render disk). Serverless hosts such as Vercel need cloud storage (S3/Cloudinary) plugged into `src/lib/uploads.ts`.
6. Set `SITE_URL` to your domain (optional on Railway) and use a long random `AUTH_SECRET`.

## Security notes

- Customers are always created with the `CUSTOMER` role. Only existing owners (or the CLI script) can create owners.
- `/admin` is checked in middleware, again in the admin layout, and again inside **every** admin server action.
- Prices, stock and coupons are recalculated on the server at checkout. Razorpay payments are verified with the HMAC signature.
- Passwords are hashed with bcrypt. Sessions use HTTP-only signed cookies. Uploads are checked by file content (magic bytes) and limited to 8 MB. Login and OTP attempts are rate-limited.

`./scripts/smoke.sh` starts the built app and checks the main pages and the pricing API.
