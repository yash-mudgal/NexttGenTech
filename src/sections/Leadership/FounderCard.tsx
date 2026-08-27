import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useSpring } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { cn } from "@/lib/cn";
import { accentOf } from "@/lib/accent";
import type { Accent } from "@/data/products";
import { monogram } from "@/data/leadership";
import type { Leader } from "@/data/leadership";
import { externalLinkProps, isConfigured } from "@/config/links";
import { LinkedInGlyph } from "@/components/ui/SocialIcon";
import Tag from "@/components/ui/Tag";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { usePointer } from "@/hooks";

/** Founding cards read as a designed pair: brand, then violet, then cyan. */
const ACCENT_CYCLE: Accent[] = ["brand", "violet", "cyan"];

/** Degrees of tilt at the far edge of the portrait. Deliberately restrained. */
const MAX_TILT = 7;

const SPRING = { stiffness: 140, damping: 20, mass: 0.45 } as const;

/**
 * Designed stand-in for a missing photograph.
 *
 * Shared with the compact leadership card so both tiers degrade identically —
 * a monogram over a blueprint texture, captioned honestly.
 */
export function MonogramPlate({
  name,
  compact = false,
  className,
}: {
  name: string;
  /** Smaller type + tighter caption for the compact leadership card. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${name} — photograph pending`}
      className={cn(
        "relative grid place-items-center overflow-hidden",
        "bg-gradient-to-br from-ng-surface3 via-ng-surface2 to-ng-void",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 ng-grid-fine opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1/3 left-1/2 size-[130%] -translate-x-1/2 ng-aura-brand opacity-25 blur-[60px]"
      />
      <div className="relative flex flex-col items-center gap-2 px-3 text-center">
        <span
          className={cn(
            "ng-gradient-text font-display font-semibold leading-none",
            compact ? "text-[2rem]" : "text-[clamp(2.75rem,1.5rem+5vw,5rem)]",
          )}
        >
          {monogram(name)}
        </span>
        <span
          className={cn(
            "font-mono uppercase tracking-[0.22em] text-ng-faint",
            compact ? "text-[0.5625rem]" : "text-[0.625rem]",
          )}
        >
          photo pending
        </span>
      </div>
    </div>
  );
}

/** "Founder & CEO" → "Founder" · "Co-Founder" → "Co-Founder". */
function tierLabel(role: string): string {
  const normalised = role.toLowerCase().replace(/[\s-]/g, "");
  if (normalised.includes("cofounder")) return "Co-Founder";
  if (normalised.includes("founder")) return "Founder";
  return role;
}

export interface FounderCardProps {
  leader: Leader;
  /** Position within `foundingTeam` — drives the accent and the corner index. */
  index: number;
}

/** Large profile card for `tier: "founding"` entries. */
export function FounderCard({ leader, index }: FounderCardProps) {
  const accent = accentOf(ACCENT_CYCLE[index % ACCENT_CYCLE.length] ?? "brand");
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const pointer = usePointer(portraitRef);
  const [imageFailed, setImageFailed] = useState(false);

  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const sheenX = useSpring(50, SPRING);
  const sheenY = useSpring(50, SPRING);
  const sheenOpacity = useSpring(0, SPRING);

  useEffect(() => {
    rotateX.set(pointer.inside ? -pointer.y * MAX_TILT : 0);
    rotateY.set(pointer.inside ? pointer.x * MAX_TILT : 0);
    sheenX.set(pointer.inside ? (pointer.x + 1) * 50 : 50);
    sheenY.set(pointer.inside ? (pointer.y + 1) * 50 : 50);
    sheenOpacity.set(pointer.inside ? 1 : 0);
  }, [pointer, rotateX, rotateY, sheenX, sheenY, sheenOpacity]);

  const sheen = useMotionTemplate`radial-gradient(110% 80% at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.20), rgba(255,255,255,0) 62%)`;

  const showPhoto = leader.image !== "" && !imageFailed;
  const linkedinLive = isConfigured(leader.linkedin);
  const counter = String(index + 1).padStart(2, "0");

  return (
    <article className="group relative h-full">
      {/* Accent bloom that lifts on hover / keyboard focus. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-2 rounded-[3rem] opacity-0 blur-2xl",
          "transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:opacity-70 group-focus-within:opacity-70",
          accent.bg,
        )}
      />

      <div className="ng-card relative flex h-full flex-col overflow-hidden rounded-ng-xl p-6 sm:p-8">
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
            "group-hover:opacity-100 group-focus-within:opacity-100",
            accent.bg,
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-3 select-none font-mono text-[3.25rem] font-semibold leading-none text-white/[0.04] sm:right-7 sm:text-[4.5rem]"
        >
          {counter}
        </span>

        <div className="relative flex flex-col gap-7 sm:flex-row sm:gap-8">
          {/* ── Portrait ─────────────────────────────────────────────── */}
          <div
            ref={portraitRef}
            className="ng-perspective mx-auto w-full max-w-[15rem] shrink-0 sm:mx-0 sm:w-[40%] sm:max-w-none"
          >
            <motion.div
              style={{ rotateX, rotateY }}
              className="ng-preserve-3d relative rounded-ng-lg bg-gradient-to-br from-ng-brand via-ng-cyan to-ng-violet p-[1.5px] shadow-ng-card"
            >
              <div className="relative overflow-hidden rounded-[1.7rem] bg-ng-surface p-1.5">
                {showPhoto ? (
                  <img
                    src={leader.image}
                    alt={`${leader.name} — ${leader.role}`}
                    width={1000}
                    height={1250}
                    loading="lazy"
                    decoding="async"
                    onError={() => setImageFailed(true)}
                    className="aspect-[4/5] w-full rounded-[1.35rem] object-cover object-center"
                  />
                ) : (
                  <MonogramPlate name={leader.name} className="aspect-[4/5] w-full rounded-[1.35rem]" />
                )}

                {/* Specular sheen tracking the pointer. */}
                <motion.div
                  aria-hidden="true"
                  style={{ backgroundImage: sheen, opacity: sheenOpacity }}
                  className="pointer-events-none absolute inset-1.5 rounded-[1.35rem] mix-blend-plus-lighter"
                />
              </div>
            </motion.div>
          </div>

          {/* ── Content ──────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="ng-glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ng-fg2">
              <span aria-hidden="true" className={cn("size-1.5 rounded-full", accent.text, "bg-current")} />
              {tierLabel(leader.role)}
            </span>

            <h3 className="mt-4 font-display text-[clamp(1.5rem,1.15rem+1.4vw,2rem)] font-semibold leading-tight text-ng-fg">
              {leader.name}
            </h3>
            <p className="mt-1.5 font-medium text-ng-cyan">{leader.role}</p>

            {leader.specification && (
              <p className="mt-3 text-sm leading-relaxed text-ng-fg2">{leader.specification}</p>
            )}

            {leader.bio && (
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ng-muted">{leader.bio}</p>
            )}

            {leader.expertise.length > 0 && (
              <Stagger as="ul" gap={0.05} className="mt-6 flex flex-wrap gap-2">
                {leader.expertise.map((skill, i) => (
                  <StaggerItem key={skill} as="li">
                    {/* The inline delay cascades the lift across the row on hover. */}
                    <span
                      style={{ transitionDelay: `${i * 40}ms` }}
                      className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5"
                    >
                      <Tag size="xs" dot={accent.hex}>
                        {skill}
                      </Tag>
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            {leader.experience && (
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-ng-line bg-white/[0.03] px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ng-fg2">
                {leader.experience}
              </span>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {linkedinLive ? (
                <a
                  href={leader.linkedin}
                  {...externalLinkProps}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium",
                    "bg-white/[0.06] text-ng-fg ring-1 ring-inset ring-ng-line2 backdrop-blur-md",
                    "transition-all duration-300 hover:bg-white/[0.1] hover:ring-ng-brand/50",
                  )}
                >
                  <LinkedInGlyph className="size-4 shrink-0" />
                  LinkedIn
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  title="LinkedIn profile not configured yet — set it in src/data/leadership.ts"
                  className={cn(
                    "inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-full px-5 text-sm font-medium",
                    "bg-white/[0.04] text-ng-fg2 ring-1 ring-inset ring-ng-line",
                    "opacity-55 saturate-50",
                  )}
                >
                  <LinkedInGlyph className="size-4 shrink-0" />
                  LinkedIn
                  <Lock aria-hidden="true" className="size-3.5 shrink-0" />
                </span>
              )}

              {leader.email && (
                <a
                  href={`mailto:${leader.email}`}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium",
                    "text-ng-fg2 ring-1 ring-inset ring-ng-line",
                    "transition-all duration-300 hover:bg-white/[0.04] hover:text-ng-fg hover:ring-ng-cyan/50",
                  )}
                >
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FounderCard;
