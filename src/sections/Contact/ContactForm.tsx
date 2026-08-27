import { useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { ChevronDown, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { company } from "@/config/company";
import { contactForm } from "@/config/links";
import { products } from "@/data/products";

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

type Status = "idle" | "mail-client-opened";

/**
 * Enquiry form.
 *
 * There is no backend behind this site. In `mailto` mode the form validates in
 * the browser and then hands a pre-filled draft to the visitor's mail client —
 * it never claims to have sent anything. In `endpoint` mode it is an ordinary
 * HTML form that the browser POSTs natively to whatever service is configured.
 */
export function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const honeypotRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});

  const endpoint = contactForm.endpoint.trim();
  /** Falls back to mailto when the mode is "endpoint" but no URL was set. */
  const postsToEndpoint = contactForm.mode === "endpoint" && endpoint !== "";

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
    if (status !== "idle") setStatus("idle");
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // A filled honeypot means a bot: drop the submission without a word.
    if (honeypotRef.current?.value) {
      event.preventDefault();
      return;
    }

    // Endpoint mode: let the browser POST the form the way it normally would.
    if (postsToEndpoint) return;

    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = fieldOrder.find((key) => nextErrors[key]);
    if (firstInvalid) {
      setStatus("idle");
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    window.location.href = buildMailtoHref(values);
    setStatus("mail-client-opened");
  }

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        method={postsToEndpoint ? "POST" : undefined}
        action={postsToEndpoint ? endpoint : undefined}
        // In mailto mode our own validation owns the messaging, so the native
        // bubbles are suppressed. The `required` attributes stay for semantics.
        // In endpoint mode the browser guards the real POST.
        noValidate={!postsToEndpoint}
        className="ng-glass rounded-ng-lg p-6 sm:p-8"
      >
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
          <Button type="submit" variant="primary" size="lg" arrow="right">
            Send Enquiry
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-ng-muted sm:max-w-xs">
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-ng-faint" />
            {postsToEndpoint ? (
              <span>
                This site has no server of its own — the form posts straight to the configured form
                service.
              </span>
            ) : (
              <span>
                This is a static site with no backend. Sending opens your email client with the
                enquiry pre-filled — nothing leaves your device until you send it there.
              </span>
            )}
          </p>
        </div>

        <div role="status" aria-live="polite" className="mt-4 empty:mt-0">
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
