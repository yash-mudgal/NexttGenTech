import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { accentOf } from "@/lib/accent";
import type { Accent } from "@/data/products";
import type { Leader } from "@/data/leadership";
import { externalLinkProps, isConfigured } from "@/config/links";
import Tag from "@/components/ui/Tag";
import { LinkedInGlyph } from "@/components/ui/SocialIcon";
import { MonogramPlate } from "./FounderCard";

const ACCENT_CYCLE: Accent[] = ["brand", "cyan", "violet", "emerald"];

/** How many expertise chips fit the compact card without wrapping to a column. */
const MAX_TAGS = 3;

export interface LeadershipCardProps {
  leader: Leader;
  /** Position within `leadershipTeam` — drives the accent. */
  index: number;
}

/** Compact profile card for `tier: "leadership"` entries. */
export function LeadershipCard({ leader, index }: LeadershipCardProps) {
  const accent = accentOf(ACCENT_CYCLE[index % ACCENT_CYCLE.length] ?? "brand");
  const [imageFailed, setImageFailed] = useState(false);

  const showPhoto = leader.image !== "" && !imageFailed;
  const linkedinLive = isConfigured(leader.linkedin);
  const tags = leader.expertise.slice(0, MAX_TAGS);

  return (
    <article className="ng-card group flex h-full flex-col overflow-hidden rounded-ng-lg p-5">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          accent.bg,
        )}
      />

      <div className="relative rounded-ng bg-gradient-to-br from-ng-brand via-ng-cyan to-ng-violet p-px">
        <div className="overflow-hidden rounded-[calc(0.875rem-1px)] bg-ng-surface">
          {showPhoto ? (
            <img
              src={leader.image}
              alt={`${leader.name} — ${leader.role}`}
              width={640}
              height={640}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="aspect-square w-full object-cover object-center"
            />
          ) : (
            <MonogramPlate name={leader.name} compact className="aspect-square w-full" />
          )}
        </div>
      </div>

      <h4 className="relative mt-4 font-display text-lg font-semibold leading-tight text-ng-fg">
        {leader.name}
      </h4>
      <p className="relative mt-1 text-sm font-medium text-ng-cyan">{leader.role}</p>

      {leader.specification && (
        <p className="relative mt-2 text-xs leading-relaxed text-ng-fg2">{leader.specification}</p>
      )}

      {tags.length > 0 && (
        <ul className="relative mt-4 flex flex-wrap gap-1.5">
          {tags.map((skill) => (
            <li key={skill}>
              <Tag size="xs" dot={accent.hex}>
                {skill}
              </Tag>
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-auto flex items-center pt-5">
        {linkedinLive ? (
          <a
            href={leader.linkedin}
            {...externalLinkProps}
            aria-label={`${leader.name} on LinkedIn`}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full",
              "bg-white/[0.05] text-ng-fg2 ring-1 ring-inset ring-ng-line",
              "transition-all duration-300 hover:bg-white/[0.09] hover:text-ng-fg hover:ring-ng-brand/50",
            )}
          >
            <LinkedInGlyph className="size-4" />
          </a>
        ) : (
          <span
            aria-disabled="true"
            title="LinkedIn profile not configured yet — set it in src/data/leadership.ts"
            className={cn(
              "relative inline-flex size-11 cursor-not-allowed items-center justify-center rounded-full",
              "bg-white/[0.03] text-ng-fg2 ring-1 ring-inset ring-ng-line",
              "opacity-55 saturate-50",
            )}
          >
            <LinkedInGlyph className="size-4" />
            <Lock
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-ng-surface p-px"
            />
            <span className="sr-only">LinkedIn profile not configured yet</span>
          </span>
        )}
      </div>
    </article>
  );
}

export default LeadershipCard;
