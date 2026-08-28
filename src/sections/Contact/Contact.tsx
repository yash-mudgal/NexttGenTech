import type { ComponentType, ReactNode } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal } from "@/components/ui/Reveal";
import { SocialRow } from "@/components/ui/SocialIcon";
import { company } from "@/config/company";
import { externalLinkProps, sectionIds } from "@/config/links";
import ContactForm from "./ContactForm";

interface DetailRowProps {
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  children: ReactNode;
}

function DetailRow({ Icon, label, children }: DetailRowProps) {
  return (
    <li className="flex gap-4 border-t border-ng-line py-4 first:border-t-0 first:pt-0">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-ng border border-ng-line bg-ng-surface2/60"
      >
        <Icon className="size-[1.0625rem] text-ng-cyan" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ng-faint">
          {label}
        </span>
        <div className="mt-1 text-[0.9375rem] leading-relaxed text-ng-fg2">{children}</div>
      </div>
    </li>
  );
}

const detailLink =
  "break-words transition-colors duration-300 hover:text-ng-cyan focus-visible:text-ng-cyan";

/**
 * Contact — the direct lines on the left, the enquiry form on the right.
 *
 * Nothing here promises a response time or invents an office: every value is
 * read straight out of `company.contact`.
 */
export function Contact() {
  const { contact } = company;
  const whatsapp = contact.whatsapp.trim();
  const whatsappDigits = whatsapp.replace(/\D/g, "");

  return (
    <Section
      id={sectionIds.contact}
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop />
          <Aura
            tone="cyan"
            size="size-[38rem]"
            opacity={13}
            className="-top-40 right-[6%]"
          />
          <Aura
            tone="brand"
            size="size-[34rem]"
            opacity={12}
            className="-bottom-48 left-[2%]"
          />
        </>
      }
    >
      <SectionHeader
        align="left"
        eyebrow="17 — Contact"
        title="Let’s Build Something"
        highlight="Next-Gen."
        description="Send an enquiry with the form, or use any of the direct lines below — both reach the same team."
      />

      <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[0.85fr_1.15fr]">
        {/* ── Direct lines ───────────────────────────────────────────────── */}
        <Reveal direction="up">
          <div className="ng-glass rounded-ng-lg p-6 sm:p-8">
            <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ng-cyan">
              Direct lines
            </h3>

            <ul className="mt-6">
              <DetailRow Icon={Mail} label="Email">
                <a href={`mailto:${contact.email}`} className={detailLink}>
                  {contact.email}
                </a>
              </DetailRow>

              <DetailRow Icon={Phone} label="Phone">
                <a href={`tel:${contact.phoneHref}`} className={detailLink}>
                  {contact.phone}
                </a>
              </DetailRow>

              {whatsappDigits !== "" && (
                <DetailRow Icon={MessageCircle} label="WhatsApp">
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    {...externalLinkProps}
                    className={detailLink}
                  >
                    Message us on WhatsApp
                  </a>
                </DetailRow>
              )}

              <DetailRow Icon={MapPin} label="Address">
                <address className="not-italic">
                  {contact.address.line1}
                  <br />
                  {contact.address.line2}
                  <br />
                  {contact.address.country}
                </address>
              </DetailRow>

              <DetailRow Icon={Clock} label="Hours">
                {contact.hours}
              </DetailRow>
            </ul>

            <div className="mt-8 border-t border-ng-line pt-7">
              <h4 className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ng-faint">
                Follow
              </h4>
              <SocialRow className="mt-4" />
            </div>

            <p className="mt-7 text-sm leading-relaxed text-ng-muted">
              Email is the fastest route — write to{" "}
              <a
                href={`mailto:${contact.salesEmail}`}
                className="text-ng-fg2 underline decoration-ng-line underline-offset-4 transition-colors duration-300 hover:text-ng-cyan hover:decoration-ng-cyan/60"
              >
                {contact.salesEmail}
              </a>{" "}
              and it reaches the team directly, no form required.
            </p>
          </div>
        </Reveal>

        {/* ── Enquiry form ───────────────────────────────────────────────── */}
        <Reveal direction="up" delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}

export default Contact;
