import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { ChevronDown, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { company } from "@/config/company";
import { contactForm, resolveContactTransport } from "@/config/links";
import { site } from "@/config/site";
import { products } from "@/data/products";

/*
 * Resolved once at module scope: this is build-time configuration, not state.
 * `transport` is "worker" when our own Cloudflare Worker URL has been filled
 * in, "relay" while it hasn't, and "mailto" if both are switched off.
 */
const { transport, url: submitUrl } = resolveContactTransport();

/* ── Options ─────────────────────────────────────────────────────────────────
 * The first six come straight from the product catalogue so a rename there
 * carries through. "Inventory Management" is shortened because this select is a
 * category picker, not a product page.
 * -------------------------------------------------------------------------- */

const shortenedNames: Record<string, string> = {
  "Inventory Management": "Inventory",
};

const solutionOptions: string[] = [
  ...products.map((product) => shortenedNames[product.name] ?? product.name),
  "Custom Software",
  "AI / ML",
  "Cloud",
  "Other",
];

/* ── Form state ──────────────────────────────────────────────────────────── */

type FieldKey = "name" | "companyName" | "email" | "phone" | "solution" | "message";

type Values = Record<FieldKey, string>;

const emptyValues: Values = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  solution: "",
  message: "",
};

/** Focus order, used to jump to the first field that failed validation. */
const fieldOrder: FieldKey[] = ["name", "companyName", "email", "phone", "solution", "message"];

/** Deliberately permissive — the mail client is the real validator. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Values): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};

  if (!values.name.trim()) errors.name = "Please tell us your name.";

  const email = values.email.trim();
  if (!email) errors.email = "We need an email address to reply to.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "That doesn't look like a valid email address.";

  if (!values.message.trim()) errors.message = "Tell us a little about what you need.";

  return errors;
}

/** Plain-text body containing every field the visitor actually filled in. */
function buildMailtoHref(values: Values): string {
  const solution = values.solution || "General Enquiry";
  const subject = `${contactForm.subjectPrefix} ${solution} — ${values.name.trim()}`;

  const lines: string[] = [`Name: ${values.name.trim()}`];
  if (values.companyName.trim()) lines.push(`Company: ${values.companyName.trim()}`);
  lines.push(`Email: ${values.email.trim()}`);
  if (values.phone.trim()) lines.push(`Phone: ${values.phone.trim()}`);
  lines.push(`Interested solution: ${solution}`, "", "Message:", values.message.trim());

  return (
    `mailto:${company.contact.salesEmail}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(lines.join("\n"))}`
  );
}

/* ── Field primitives ────────────────────────────────────────────────────── */

/**
 * No text colour here on purpose: preflight gives form controls `color: inherit`,
 * so they pick up `--color-ng-fg` from the page. That leaves the select free to
 * apply `text-ng-faint` for its placeholder state without two colour utilities
 * fighting over stylesheet order.
 */
const controlBase =
  "w-full rounded-ng border bg-ng-surface2/60 px-4 text-[0.9375rem] " +
  "placeholder:text-ng-faint transition-[border-color,box-shadow] duration-300 " +
  "focus:outline-none focus:ring-2";

const controlIdle = "border-ng-line focus:border-ng-cyan/60 focus:ring-ng-cyan/25";
const controlError = "border-ng-rose/60 focus:border-ng-rose focus:ring-ng-rose/25";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  errorId: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

function Field({ id, label, required, error, errorId, hint, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label
        htmlFor={id}
        className="mb-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ng-faint"
      >
        {label}
        {required && (
          <span className="ml-1 text-ng-cyan" aria-hidden="true">
            *
          </span>
        )}
        {hint && <span className="ml-2 normal-case tracking-normal">{hint}</span>}
      </label>

      {children}

      <p
        id={errorId}
        className={cn(
          "mt-1.5 text-xs text-ng-rose transition-opacity duration-200",
          error ? "opacity-100" : "sr-only opacity-0",
        )}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

/* ── Form ────────────────────────────────────────────────────────────────── */

type Status = "idle" | "sending" | "sent" | "failed" | "mail-client-opened";

/**
 * Enquiry form.
 *
 * Three submission paths, chosen by `resolveContactTransport()`:
 *
 *   worker — POSTs JSON to our own Cloudflare Worker via fetch, so the visitor
 *            stays on the page and gets a real success or failure. The Worker
 *            sends the mail as info@nexttgentech.com.
 *   relay  — an ordinary HTML form the browser POSTs natively to a third-party
 *            relay, which then redirects back to `?sent=1`.
 *   mailto — validates here, then hands a pre-filled draft to the visitor's own
 *            mail client. It never claims to have sent anything.
 */
export function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  /** Server-supplied failure text, shown verbatim so it stays actionable. */
  const [failure, setFailure] = useState("");

  const honeypotRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});

  /*
   * The relay returns the visitor to `?sent=1` after a successful POST, so the
   * confirmation is shown here rather than on a third-party thank-you page.
   * Read once on mount: this is a full navigation back to the site, not a
   * client-side state change.
   */
  const [justSent, setJustSent] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("sent") !== "1") return;
    setJustSent(true);
    // Drop the flag so a refresh doesn't re-announce a delivery that isn't happening.
    const url = new URL(window.location.href);
    url.searchParams.delete("sent");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  /** True for the native browser POST used by the third-party relay only. */
  const postsNatively = transport === "relay";

  const fieldId = (key: FieldKey) => `${uid}-${key}`;
  const errorId = (key: FieldKey) => `${uid}-${key}-error`;

  const setField = (key: FieldKey, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
    // Editing clears a previous outcome, but must never cancel one in flight.
    if (status !== "idle" && status !== "sending") setStatus("idle");
  };

  /** Everything a control needs bar its type: identity, value, error wiring. */
  const controlProps = (key: FieldKey, extraClasses: string) => ({
    id: fieldId(key),
    name: key === "companyName" ? "company" : key,
    value: values[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? errorId(key) : undefined,
    className: cn(controlBase, errors[key] ? controlError : controlIdle, extraClasses),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setField(key, event.target.value),
  });

  /** POSTs to our Worker and reports what actually happened. */
  async function sendToWorker() {
    setStatus("sending");
    setFailure("");

    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          company: values.companyName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          solution: values.solution,
          message: values.message.trim(),
        }),
      });

      // The Worker always answers with JSON, but a proxy or an outage in front
      // of it might not — so a parse failure is treated as a failed send rather
      // than crashing the handler.
      const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !body?.ok) {
        setFailure(body?.error ?? "Something went wrong while sending your enquiry.");
        setStatus("failed");
        return;
      }

      setValues(emptyValues);
      setStatus("sent");
    } catch {
      // Network-level failure: offline, DNS, blocked request.
      setFailure("We couldn't reach our server. Please check your connection and try again.");
      setStatus("failed");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // A filled honeypot means a bot: drop the submission without a word.
    if (honeypotRef.current?.value) {
      event.preventDefault();
      return;
    }

    // Relay mode: let the browser POST the form the way it normally would.
    if (postsNatively) return;

    event.preventDefault();
    if (status === "sending") return;

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = fieldOrder.find((key) => nextErrors[key]);
    if (firstInvalid) {
      setStatus("idle");
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    if (transport === "worker") {
      void sendToWorker();
      return;
    }

    window.location.href = buildMailtoHref(values);
    setStatus("mail-client-opened");
  }

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        method={postsNatively ? "POST" : undefined}
        action={postsNatively ? submitUrl : undefined}
        // When we own the submit (worker / mailto) our own validation writes the
        // messages, so the native bubbles are suppressed — the `required`
        // attributes stay for semantics. Only the native relay POST, which
        // leaves the page before we could intervene, is guarded by the browser.
        noValidate={!postsNatively}
        className="ng-glass rounded-ng-lg p-6 sm:p-8"
      >
        {/*
          Relay configuration, sent only on the fallback path.

          These are FormSubmit's control parameters, and they only apply while
          the Worker URL in `contactForm.workerEndpoint` is unset. Once it is
          filled in, the form fetches JSON instead and none of this is rendered:

            _subject  — the subject line that lands in the inbox
            _template — render the fields as a readable table, not raw JSON
            _captcha  — we already screen bots with the honeypot above
            _next     — where the visitor is returned afterwards, so they see
                        our own confirmation instead of the relay's page

          `_replyto` is set from the visitor's email field further down, so
          hitting reply in the inbox answers the enquirer directly.
        */}
        {postsNatively && (
          <>
            <input type="hidden" name="_subject" value={`${contactForm.subjectPrefix} New website enquiry`} />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={`${site.url}/?sent=1#contact`} />
            <input type="hidden" name="_replyto" value={values.email} />
          </>
        )}

        {/* Honeypot — off-screen, unreachable by keyboard, ignored on submit. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
          <label htmlFor={`${uid}-website`}>Website</label>
          <input
            ref={honeypotRef}
            id={`${uid}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldId("name")}
            label="Name"
            required
            error={errors.name}
            errorId={errorId("name")}
          >
            <input
              {...controlProps("name", "h-12")}
              ref={(node) => {
                fieldRefs.current.name = node;
              }}
              type="text"
              required
              aria-required="true"
              autoComplete="name"
              placeholder="Your full name"
            />
          </Field>

          <Field
            id={fieldId("companyName")}
            label="Company"
            error={errors.companyName}
            errorId={errorId("companyName")}
          >
            <input
              {...controlProps("companyName", "h-12")}
              ref={(node) => {
                fieldRefs.current.companyName = node;
              }}
              type="text"
              autoComplete="organization"
              placeholder="Organisation name"
            />
          </Field>

          <Field
            id={fieldId("email")}
            label="Email"
            required
            error={errors.email}
            errorId={errorId("email")}
          >
            <input
              {...controlProps("email", "h-12")}
              ref={(node) => {
                fieldRefs.current.email = node;
              }}
              type="email"
              required
              aria-required="true"
              autoComplete="email"
              inputMode="email"
              placeholder="you@company.com"
            />
          </Field>

          <Field
            id={fieldId("phone")}
            label="Phone"
            error={errors.phone}
            errorId={errorId("phone")}
          >
            <input
              {...controlProps("phone", "h-12")}
              ref={(node) => {
                fieldRefs.current.phone = node;
              }}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91 00000 00000"
            />
          </Field>

          <Field
            id={fieldId("solution")}
            label="Interested Solution"
            error={errors.solution}
            errorId={errorId("solution")}
            className="sm:col-span-2"
          >
            <div className="relative">
              <select
                {...controlProps(
                  "solution",
                  cn("h-12 appearance-none pr-11", !values.solution && "text-ng-faint"),
                )}
                ref={(node) => {
                  fieldRefs.current.solution = node;
                }}
                style={{ colorScheme: "dark" }}
              >
                <option value="" className="bg-ng-surface2 text-ng-fg">
                  Select a solution
                </option>
                {solutionOptions.map((option) => (
                  <option key={option} value={option} className="bg-ng-surface2 text-ng-fg">
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ng-muted"
              />
            </div>
          </Field>

          <Field
            id={fieldId("message")}
            label="Message"
            required
            error={errors.message}
            errorId={errorId("message")}
            className="sm:col-span-2"
          >
            <textarea
              {...controlProps("message", "min-h-[9.5rem] resize-y py-3.5 leading-relaxed")}
              ref={(node) => {
                fieldRefs.current.message = node;
              }}
              required
              aria-required="true"
              rows={6}
              placeholder="What are you trying to build, replace or fix?"
            />
          </Field>
        </div>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            arrow={status === "sending" ? false : "right"}
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send Enquiry"}
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-ng-muted sm:max-w-xs">
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-ng-faint" />
            {transport === "mailto" ? (
              <span>
                Sending opens your email client with the enquiry pre-filled — nothing leaves your
                device until you send it there.
              </span>
            ) : (
              <span>
                Your enquiry goes straight to our inbox. We&rsquo;ll reply to the email address you
                give us.
              </span>
            )}
          </p>
        </div>

        <div role="status" aria-live="polite" className="mt-4 empty:mt-0">
          {(justSent || status === "sent") && (
            <p className="rounded-ng border border-ng-emerald/30 bg-ng-emerald/[0.07] px-4 py-3 text-sm leading-relaxed text-ng-fg2">
              Thanks — your enquiry has been sent. We&rsquo;ll reply to the email address you gave
              us.
            </p>
          )}

          {status === "failed" && (
            <p className="rounded-ng border border-ng-rose/40 bg-ng-rose/[0.07] px-4 py-3 text-sm leading-relaxed text-ng-fg2">
              {failure} You can also email us directly at{" "}
              <a
                href={`mailto:${company.contact.salesEmail}`}
                className="text-ng-cyan underline underline-offset-2"
              >
                {company.contact.salesEmail}
              </a>
              .
            </p>
          )}
          {status === "mail-client-opened" && (
            <p className="rounded-ng border border-ng-cyan/30 bg-ng-cyan/[0.06] px-4 py-3 text-sm leading-relaxed text-ng-fg2">
              Your email client should now be open with this enquiry pre-filled.{" "}
              <strong className="font-semibold text-ng-fg">It hasn&rsquo;t been sent yet</strong> —
              press send there to deliver it. If nothing opened, write to{" "}
              <a
                href={`mailto:${company.contact.salesEmail}`}
                className="text-ng-cyan underline underline-offset-2"
              >
                {company.contact.salesEmail}
              </a>{" "}
              directly.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
