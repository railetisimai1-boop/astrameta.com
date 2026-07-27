// Astra Meta — Bankful Hosted Payment Page (HPP) service
// Zero-dependency Node.js server: serves a branded checkout form, signs the
// HPP request (HMAC-SHA256, salt = merchant password) and redirects the
// customer to Bankful's hosted page. The salt only ever lives here (env var),
// never in the static site.

const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const BANKFUL_USERNAME = process.env.BANKFUL_USERNAME || "testsandbox8@sanbox.com";
const BANKFUL_SALT = process.env.BANKFUL_SALT || "Testsandbox@8";
const BANKFUL_API_URL =
  process.env.BANKFUL_API_URL ||
  "https://api-dev1.bankfulportal.com/front-calls/go-in/hosted-page-pay";
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "https://pay.astra-meta.com";
const SITE_URL = process.env.SITE_URL || "https://astra-meta.com";
const IS_SANDBOX = BANKFUL_API_URL.includes("api-dev1");

const PACKAGES = {
  consultation: { name: "Consultation & Problem Analysis", amount: "200" },
  starter: { name: "Starter Package", amount: "500" },
  growth: { name: "Growth Package", amount: "2000" },
  scale: { name: "Scale Package", amount: "5000" },
  vip: { name: "VIP Full Package", amount: "10000" },
};

// Unlisted flexible-amount page (/support). Not linked from the site or menus.
const SUPPORT_PRESETS = [20, 50, 100, 200, 500, 1000];
const SUPPORT_MIN = 1;
const SUPPORT_MAX = 25000;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Amounts arrive from a user-controlled query string, so bound and normalise
// before they reach the signed request.
function normaliseAmount(raw) {
  const n = Number.parseFloat(String(raw ?? "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n < SUPPORT_MIN || n > SUPPORT_MAX) return null;
  return String(Math.round(n * 100) / 100);
}

function sign(body) {
  const payloadString = Object.keys(body)
    .sort()
    .filter((k) => k !== "signature" && body[k] !== undefined && body[k] !== null && body[k] !== "")
    .map((k) => `${k}${body[k]}`)
    .join("");
  return crypto.createHmac("sha256", BANKFUL_SALT).update(payloadString).digest("hex");
}

function page(title, inner) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)} — Astra Meta</title>
<style>
  :root{--pink:#ed3aa2;--blue:#50abc5;--dark:#282729}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--dark);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{background:#1f1e20;border:1px solid #3a393b;border-radius:16px;padding:36px;max-width:520px;width:100%}
  h1{font-size:1.4rem;margin-bottom:6px}
  .accent{color:var(--pink)}
  p.sub{color:#b5b3b6;font-size:.95rem;margin-bottom:22px}
  label{display:block;font-size:.8rem;color:#b5b3b6;margin:14px 0 5px}
  input,select{width:100%;padding:11px 12px;border-radius:8px;border:1px solid #4a494b;background:#141314;color:#fff;font-size:.95rem}
  input:focus,select:focus{outline:2px solid var(--blue);border-color:transparent}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  button{margin-top:24px;width:100%;padding:14px;border:0;border-radius:10px;background:linear-gradient(90deg,var(--pink),var(--blue));color:#fff;font-size:1rem;font-weight:700;cursor:pointer}
  .badge{display:inline-block;background:#141314;border:1px solid #4a494b;border-radius:999px;padding:4px 12px;font-size:.75rem;color:#b5b3b6;margin-bottom:18px}
  .total{display:flex;justify-content:space-between;background:#141314;border-radius:10px;padding:14px;margin-top:20px;font-weight:700}
  a{color:var(--blue)}
  .note{font-size:.75rem;color:#8a888b;margin-top:16px;text-align:center}
</style></head><body><div class="card">${inner}</div></body></html>`;
}

function supportPage() {
  const sandboxBadge = IS_SANDBOX ? `<span class="badge">TEST MODE — no real charge</span><br>` : "";
  const presets = SUPPORT_PRESETS.map(
    (a) => `<button type="button" class="amt" data-amount="${a}">$${a.toLocaleString("en-US")}</button>`
  ).join("");
  return page(
    "Make a payment",
    `${sandboxBadge}
<h1>Astra <span class="accent">Meta</span> — Make a payment</h1>
<p class="sub">Pay any amount for agreed work, a deposit or an invoice. Choose an amount below.</p>
<form method="GET" action="/checkout" id="supportForm">
  <input type="hidden" name="package" value="custom">
  <div class="amt-grid">${presets}</div>
  <label>Or enter another amount (USD)</label>
  <input name="amount" id="amountInput" type="number" min="${SUPPORT_MIN}" max="${SUPPORT_MAX}" step="0.01" placeholder="0.00" required>
  <label>What is this payment for? <span style="opacity:.6">(optional)</span></label>
  <input name="note" maxlength="60" placeholder="e.g. Project deposit / Invoice #123">
  <button type="submit">Continue →</button>
</form>
<p class="note">Payments are processed on our provider's secure page.<br>
<a href="${SITE_URL}">← astra-meta.com</a></p>
<style>
  .amt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0 6px}
  .amt{margin:0;padding:12px 0;background:#141314;border:1px solid #4a494b;border-radius:10px;color:#fff;font-weight:600;font-size:.95rem;cursor:pointer}
  .amt:hover{border-color:var(--pink)}
  .amt.sel{background:linear-gradient(90deg,var(--pink),var(--blue));border-color:transparent}
</style>
<script>
  document.querySelectorAll('.amt').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('.amt').forEach(function(x){x.classList.remove('sel')});
      b.classList.add('sel');
      document.getElementById('amountInput').value = b.dataset.amount;
    });
  });
</script>`
  );
}

function checkoutForm(pkgKey, pkg) {
  const sandboxBadge = IS_SANDBOX ? `<span class="badge">TEST MODE — no real charge</span><br>` : "";
  const customFields =
    pkgKey === "custom"
      ? `<input type="hidden" name="amount" value="${esc(pkg.amount)}">
  <input type="hidden" name="note" value="${esc(pkg.note || "")}">`
      : "";
  return page(
    `Checkout — ${pkg.name}`,
    `${sandboxBadge}
<h1>Astra <span class="accent">Meta</span> — Secure Checkout</h1>
<p class="sub">${esc(pkg.name)} · one-time payment</p>
<form method="POST" action="/checkout">
  <input type="hidden" name="package" value="${esc(pkgKey)}">
  ${customFields}
  <div class="row">
    <div><label>First name</label><input name="fname" required maxlength="50" autocomplete="given-name"></div>
    <div><label>Last name</label><input name="lname" required maxlength="50" autocomplete="family-name"></div>
  </div>
  <div class="row">
    <div><label>Email</label><input name="email" type="email" required maxlength="100" autocomplete="email"></div>
    <div><label>Phone</label><input name="phone" required maxlength="20" autocomplete="tel"></div>
  </div>
  <label>Billing address</label><input name="addr" required maxlength="100" autocomplete="address-line1">
  <div class="row">
    <div><label>City</label><input name="city" required maxlength="50" autocomplete="address-level2"></div>
    <div><label>State / Province</label><input name="state" required maxlength="30" autocomplete="address-level1" placeholder="e.g. CA"></div>
  </div>
  <div class="row">
    <div><label>ZIP / Postal code</label><input name="zip" required maxlength="15" autocomplete="postal-code"></div>
    <div><label>Country</label><select name="country">
      <option value="US">United States</option><option value="CA">Canada</option>
      <option value="GB">United Kingdom</option><option value="DE">Germany</option>
      <option value="FR">France</option><option value="NL">Netherlands</option>
      <option value="ES">Spain</option><option value="IT">Italy</option>
      <option value="IE">Ireland</option><option value="SE">Sweden</option>
      <option value="CH">Switzerland</option><option value="BE">Belgium</option>
    </select></div>
  </div>
  <div class="total"><span>Total</span><span>$${Number(pkg.amount).toLocaleString("en-US")}.00 USD</span></div>
  <button type="submit">Continue to secure payment →</button>
</form>
<p class="note">You'll be redirected to our payment provider's secure page.<br>
<a href="${SITE_URL}">← Back to astra-meta.com</a></p>`
  );
}

function resultPage(kind) {
  const map = {
    success: ["Payment received ✔", "Thank you! Your payment was successful. We'll email you within 24 hours to kick off your project."],
    failed: ["Payment failed", "Your payment could not be processed. No charge was made. Please try again or contact us at aydin@astra-meta.com."],
    cancel: ["Payment cancelled", "You cancelled the payment. No charge was made."],
    pending: ["Payment pending", "Your payment is being processed. We'll email you as soon as it's confirmed."],
  };
  const [title, msg] = map[kind];
  return page(title, `<h1>${title}</h1><p class="sub" style="margin-top:12px">${msg}</p>
<p class="note"><a href="${SITE_URL}">← Back to astra-meta.com</a></p>`);
}

async function createHostedPayment(pkgKey, pkg, f) {
  const body = {
    req_username: BANKFUL_USERNAME,
    transaction_type: "CAPTURE",
    amount: pkg.amount,
    request_currency: "USD",
    cust_email: f.email,
    cust_fname: f.fname,
    cust_lname: f.lname,
    cust_phone: f.phone,
    bill_addr: f.addr,
    bill_addr_city: f.city,
    bill_addr_state: f.state,
    bill_addr_zip: f.zip,
    bill_addr_country: f.country,
    xtl_order_id: `ASTRA-${pkgKey.toUpperCase()}-${Date.now()}`,
    cart_name: pkg.note ? String(pkg.note).slice(0, 60) : "Hosted-Page",
    url_cancel: `${PUBLIC_BASE_URL}/payment/cancel`,
    url_complete: `${PUBLIC_BASE_URL}/payment/success`,
    url_failed: `${PUBLIC_BASE_URL}/payment/failed`,
    url_pending: `${PUBLIC_BASE_URL}/payment/pending`,
    url_callback: `${PUBLIC_BASE_URL}/payment/callback`,
    return_redirect_url: "Y",
  };
  body.signature = sign(body);
  const res = await fetch(BANKFUL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Bankful sits behind Cloudflare bot protection; a browser-like UA is required.
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (res.status !== 201) throw new Error(`Bankful ${res.status}: ${text.slice(0, 300)}`);
  const { redirect_url } = JSON.parse(text);
  if (!redirect_url) throw new Error("No redirect_url in Bankful response");
  console.log(JSON.stringify({ evt: "payment_created", order: body.xtl_order_id, pkg: pkgKey, amount: pkg.amount }));
  return redirect_url;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 100_000) { reject(new Error("body too large")); req.destroy(); }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const send = (code, body, type = "text/html; charset=utf-8") => {
    res.writeHead(code, { "Content-Type": type });
    res.end(body);
  };
  try {
    if (req.method === "GET" && url.pathname === "/health") return send(200, "ok", "text/plain");

    if (req.method === "GET" && (url.pathname === "/support" || url.pathname === "/donate")) {
      return send(200, supportPage());
    }

    if (req.method === "GET" && url.pathname === "/checkout") {
      const pkgKey = url.searchParams.get("package");
      let pkg = PACKAGES[pkgKey];
      if (pkgKey === "custom") {
        const amount = normaliseAmount(url.searchParams.get("amount"));
        if (!amount)
          return send(400, page("Invalid amount", `<h1>Enter a valid amount</h1><p class="sub" style="margin-top:12px">Amounts must be between $${SUPPORT_MIN} and $${SUPPORT_MAX.toLocaleString("en-US")}.</p><p class="note"><a href="/support">← Back</a></p>`));
        pkg = { name: "Custom payment", amount, note: (url.searchParams.get("note") || "").slice(0, 60) };
      }
      if (!pkg) return send(404, page("Not found", `<h1>Unknown package</h1><p class="note"><a href="${SITE_URL}">← Back</a></p>`));
      return send(200, checkoutForm(pkgKey, pkg));
    }

    if (req.method === "POST" && url.pathname === "/checkout") {
      const raw = await readBody(req);
      const f = Object.fromEntries(new URLSearchParams(raw));
      let pkg = PACKAGES[f.package];
      if (f.package === "custom") {
        const amount = normaliseAmount(f.amount);
        if (amount) pkg = { name: "Custom payment", amount, note: (f.note || "").slice(0, 60) };
      }
      const required = ["fname", "lname", "email", "phone", "addr", "city", "state", "zip", "country"];
      if (!pkg || required.some((k) => !f[k] || !String(f[k]).trim()))
        return send(400, page("Invalid request", `<h1>Missing information</h1><p class="note"><a href="javascript:history.back()">← Go back</a></p>`));
      const redirectUrl = await createHostedPayment(f.package, pkg, f);
      res.writeHead(302, { Location: redirectUrl });
      return res.end();
    }

    if (req.method === "POST" && url.pathname === "/payment/callback") {
      const raw = await readBody(req);
      console.log(JSON.stringify({ evt: "bankful_callback", ts: new Date().toISOString(), body: raw.slice(0, 2000) }));
      return send(200, "OK", "text/plain");
    }

    const m = url.pathname.match(/^\/payment\/(success|failed|cancel|pending)$/);
    if (m) return send(200, resultPage(m[1]));

    if (url.pathname === "/") { res.writeHead(302, { Location: SITE_URL }); return res.end(); }
    return send(404, page("Not found", `<h1>404</h1><p class="note"><a href="${SITE_URL}">← Back</a></p>`));
  } catch (e) {
    console.error(JSON.stringify({ evt: "error", msg: String(e && e.message) }));
    return send(502, page("Payment error", `<h1>Something went wrong</h1><p class="sub" style="margin-top:12px">We couldn't start the payment. Please try again in a moment or contact aydin@astra-meta.com.</p><p class="note"><a href="javascript:history.back()">← Go back</a></p>`));
  }
});

server.listen(PORT, () => {
  console.log(`astra-pay listening on :${PORT} | env=${IS_SANDBOX ? "SANDBOX" : "PRODUCTION"} | user=${BANKFUL_USERNAME}`);
});
