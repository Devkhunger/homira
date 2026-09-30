#!/usr/bin/env bash
# Local smoke test: starts the production server, checks key pages & flows, stops it.
set -u
cd "$(dirname "$0")/.."
PORT=3100
npx next start -p $PORT > .smoke.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
for i in $(seq 1 30); do curl -s -o /dev/null "http://localhost:$PORT/" && break; sleep 0.5; done
B="http://localhost:$PORT"

echo "== Pages =="
for u in / /collections/sarees /collections/sale /collections/new-arrivals /collections/bestsellers /collections/cushion-covers "/collections/sarees?sort=price-asc&fabric=Cotton" /products/pochampally-ikat-cotton-saree-indigo-diamonds /pages/our-story /pages/faqs /pages/contact /pages/terms "/search?q=ikat" /cart /account/login /account/register /account /admin /checkout /track-order /sitemap.xml /robots.txt /placeholders/fabric-1.svg /collections/nope /products/nope; do
  printf "%-62s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$B$u")"
done

echo "== Quote API =="
PID1=$(sqlite3 prisma/dev.db "select id from Product where slug='pochampally-ikat-cotton-saree-indigo-diamonds'" 2>/dev/null)
echo "product id: $PID1"
curl -s -X POST "$B/api/cart/quote" -H 'content-type: application/json' \
  -d "{\"items\":[{\"productId\":\"$PID1\",\"quantity\":2}],\"coupon\":\"WELCOME10\"}" | head -c 600; echo


echo "== Server errors =="
grep -iE "error|unhandled" .smoke.log | head -20 || true
