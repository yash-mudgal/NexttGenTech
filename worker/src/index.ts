/* ============================================================================
 * ENQUIRY WORKER — sends the contact form as info@nexttgentech.com
 * ----------------------------------------------------------------------------
 * The website is a static build on GitHub Pages. A static site has nowhere to
 * keep a secret: anything shipped in the JS bundle is readable by every
 * visitor, so it can never hold SMTP or API credentials. That is the entire
 * reason this file exists — it is somewhere a credential can live.
 *
 * The form POSTs JSON here; this Worker validates it, then calls the Resend API
 * with a key stored as an encrypted Worker secret. Because nexttgentech.com is
 * DKIM-verified with Resend, the mail is genuinely signed as our own domain
 * rather than arriving from a third-party relay.
 *
 *   Deploy + DNS steps:  worker/README.md
 *
 * Nothing here is bundled into the website. This directory is deployed
 * separately with `wrangler deploy` and is excluded from the Vite build.
 * ========================================================================== */

export interface Env {
  /** Encrypted secret. Set with `wrangler secret put RESEND_API_KEY`. */
  RESEND_API_KEY: string;
  /** Inbox that receives enquiries. */
  TO_EMAIL: string;
  /** Verified sender, e.g. `NextGen <info@nexttgentech.com>`. */
  FROM_EMAIL: string;
  /** Comma-separated origins allowed to POST here. */
  ALLOWED_ORIGINS: string;
}

/* ── Limits ──────────────────────────────────────────────────────────────────
 * Caps are enforced here rather than trusting the browser: anyone can POST to
 * this URL directly with curl, so client-side validation is a convenience for
 * real visitors and nothing more.
 * -------------------------------------------------------------------------- */

const MAX_BODY_BYTES = 16 * 1024;

const LIMITS = {
  name: 120,
  company: 160,
  email: 200,
  phone: 40,
  solution: 80,
  message: 5000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ── Throttle ────────────────────────────────────────────────────────────────
 * A deliberately modest in-memory throttle, scoped to one Worker isolate.
 *
 * Be clear about what this is: Cloudflare runs many isolates and recycles them,
 * so a determined flood spread across colos will slip past it. It exists to
 * stop the ordinary case — a stuck retry loop, someone leaning on the button,
 * a naive script — from burning the monthly send quota.
 *
 * If real abuse ever shows up, the answer is a WAF rate-limiting rule on this
 * route in the Cloudflare dashboard, or a Turnstile token checked below. Both
 * are free; neither is worth the setup cost until it's actually needed.
 * -------------------------------------------------------------------------- */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

function throttled(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound across a long-lived isolate.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * CORS headers for a given request origin.
 *
 * An origin that isn't on the list simply gets no allow-origin header, which
 * the browser then blocks. We don't echo arbitrary origins back — that would
 * make the allow-list decorative.
 */
function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (allowedOrigins(env).includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

/** Visitor input lands inside an HTML email, so it must be escaped. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strip anything that could inject a second header if a value ever reaches a
 * header position — a subject line, a Reply-To. Cheap, and it removes a whole
 * category of mistake regardless of what the mail provider does downstream.
 */
function singleLine(value: string, max: number): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

function field(raw: unknown, max: number): string {
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

/* ── Message building ────────────────────────────────────────────────────── */

interface Enquiry {
  name: string;
  company: string;
  email: string;
  phone: string;
  solution: string;
  message: string;
}

function buildRows(enquiry: Enquiry): Array<[string, string]> {
  const rows: Array<[string, string]> = [["Name", enquiry.name]];
  if (enquiry.company) rows.push(["Company", enquiry.company]);
  rows.push(["Email", enquiry.email]);
  if (enquiry.phone) rows.push(["Phone", enquiry.phone]);
  rows.push(["Interested solution", enquiry.solution || "Not specified"]);
  return rows;
}

function buildText(enquiry: Enquiry): string {
  const rows = buildRows(enquiry)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  return `${rows}\n\nMessage:\n${enquiry.message}\n`;
}

/**
 * Inline styles, a table layout and no external assets — the three things mail
 * clients still force on us. Kept plain on purpose: this is an internal
 * notification, not a campaign.
 */
function buildHtml(enquiry: Enquiry): string {
  const rows = buildRows(enquiry)
    .map(
      ([label, value]) =>
        `<tr>` +
        `<td style="padding:8px 16px 8px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>` +
        `<td style="padding:8px 0;color:#0f172a;font-size:14px">${escapeHtml(value)}</td>` +
        `</tr>`,
    )
    .join("");

  return (
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px">` +
    `<p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2563eb">New website enquiry</p>` +
    `<h1 style="margin:0 0 20px;font-size:20px;color:#0f172a">${escapeHtml(enquiry.name)}</h1>` +
    `<table style="border-collapse:collapse;width:100%">${rows}</table>` +
    `<div style="margin:20px 0;border-top:1px solid #e2e8f0"></div>` +
    `<p style="margin:0 0 8px;font-size:13px;color:#64748b">Message</p>` +
    `<div style="white-space:pre-wrap;font-size:14px;line-height:1.6;color:#0f172a">${escapeHtml(enquiry.message)}</div>` +
    `<p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Sent from the contact form at nexttgentech.com. Reply to this email to answer ${escapeHtml(enquiry.email)} directly.</p>` +
    `</div>`
  );
}

/* ── Handler ─────────────────────────────────────────────────────────────── */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // A plain GET is how someone checks the Worker is alive after deploying.
    if (request.method === "GET") {
      return json({ ok: true, service: "nexttgentech-enquiry" }, 200, cors);
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405, cors);
    }

    /*
     * Reject cross-origin POSTs from anywhere but our own site. CORS alone
     * doesn't do this — it stops the browser reading the *response*, but the
     * request still arrives and would still send mail. Requests with no Origin
     * header at all (curl, server-side) are allowed through so the endpoint
     * stays testable; the throttle and validation are what guard those.
     */
    const origin = request.headers.get("Origin");
    if (origin && !allowedOrigins(env).includes(origin)) {
      return json({ ok: false, error: "Origin not allowed." }, 403, cors);
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (throttled(ip, Date.now())) {
      return json(
        { ok: false, error: "Too many enquiries in a short time. Please try again in a minute." },
        429,
        cors,
      );
    }

    const declared = Number(request.headers.get("Content-Length") ?? "0");
    if (declared > MAX_BODY_BYTES) {
      return json({ ok: false, error: "That message is too long." }, 413, cors);
    }

    let payload: Record<string, unknown>;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) {
        return json({ ok: false, error: "That message is too long." }, 413, cors);
      }
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return json({ ok: false, error: "Malformed request." }, 400, cors);
    }

    // Honeypot. Silently accept so a bot learns nothing from the response.
    if (field(payload.website, 200)) {
      return json({ ok: true }, 200, cors);
    }

    const enquiry: Enquiry = {
      name: singleLine(field(payload.name, LIMITS.name), LIMITS.name),
      company: singleLine(field(payload.company, LIMITS.company), LIMITS.company),
      email: singleLine(field(payload.email, LIMITS.email), LIMITS.email),
      phone: singleLine(field(payload.phone, LIMITS.phone), LIMITS.phone),
      solution: singleLine(field(payload.solution, LIMITS.solution), LIMITS.solution),
      message: field(payload.message, LIMITS.message),
    };

    if (!enquiry.name || !enquiry.message || !EMAIL_PATTERN.test(enquiry.email)) {
      return json(
        { ok: false, error: "Please provide your name, a valid email address and a message." },
        422,
        cors,
      );
    }

    const subject = singleLine(
      `[NextGen Enquiry] ${enquiry.solution || "General"} — ${enquiry.name}`,
      160,
    );

    let response: Response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL,
          to: [env.TO_EMAIL],
          // The visitor is never the From address — that would fail DMARC and
          // land the mail in spam. Reply-To gives the same convenience safely.
          reply_to: enquiry.email,
          subject,
          text: buildText(enquiry),
          html: buildHtml(enquiry),
        }),
      });
    } catch {
      return json(
        { ok: false, error: "We couldn't reach the mail service. Please email us directly." },
        502,
        cors,
      );
    }

    if (!response.ok) {
      // Log the provider's reason for `wrangler tail`, but never return it —
      // it can echo account details back to whoever is probing the endpoint.
      console.error("resend failed", response.status, await response.text());
      return json(
        { ok: false, error: "We couldn't send that just now. Please email us directly." },
        502,
        cors,
      );
    }

    return json({ ok: true }, 200, cors);
  },
} satisfies ExportedHandler<Env>;
