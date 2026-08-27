import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { externalLinkProps, isConfigured } from "@/config/links";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ng-cyan " +
  "disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-ng-brand-deep via-ng-brand to-ng-cyan text-white " +
    "shadow-[0_10px_36px_-12px_rgba(37,99,235,0.85)] " +
    "hover:shadow-[0_16px_46px_-12px_rgba(34,211,238,0.8)] hover:brightness-110",
  secondary:
    "bg-white/[0.06] text-ng-fg ring-1 ring-inset ring-ng-line2 backdrop-blur-md " +
    "hover:bg-white/[0.1] hover:ring-ng-brand/50",
  outline:
    "text-ng-fg2 ring-1 ring-inset ring-ng-line hover:text-ng-fg hover:ring-ng-cyan/50 " +
    "hover:bg-white/[0.04]",
  ghost: "text-ng-fg2 hover:text-ng-cyan",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Trailing arrow style. "right" nudges →, "up" is for external links. */
  arrow?: "right" | "up" | false;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps> & {
    href: string;
    /** Opens in a new tab with rel="noopener noreferrer". */
    external?: boolean;
    /**
     * When true and `href` is still "#", the control renders inert with a lock
     * hint instead of navigating nowhere. Used by unconfigured product links.
     */
    requireConfigured?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function Arrow({ arrow }: { arrow: "right" | "up" | false }) {
  if (arrow === "right")
    return (
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-1"
      />
    );
  if (arrow === "up")
    return (
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
      />
    );
  return null;
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", arrow = false, className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href !== undefined) {
    const {
      href,
      external,
      requireConfigured,
      variant: _v,
      size: _s,
      arrow: _a,
      className: _c,
      children: _ch,
      ...rest
    } = props;
    void _v;
    void _s;
    void _a;
    void _c;
    void _ch;

    if (requireConfigured && !isConfigured(href)) {
      return (
        <span
          className={cn(classes, "cursor-not-allowed opacity-45 saturate-50")}
          title="Link not configured yet — set it in src/config/links.ts"
          aria-disabled="true"
        >
          {children}
          <Lock aria-hidden="true" className="size-3.5 shrink-0" />
        </span>
      );
    }

    return (
      <a href={href} className={classes} {...(external ? externalLinkProps : {})} {...rest}>
        {children}
        <Arrow arrow={arrow} />
      </a>
    );
  }

  const {
    variant: _v,
    size: _s,
    arrow: _a,
    className: _c,
    children: _ch,
    ...rest
  } = props as ButtonAsButton;
  void _v;
  void _s;
  void _a;
  void _c;
  void _ch;

  return (
    <button type="button" className={cn(classes, "disabled:opacity-45")} {...rest}>
      {children}
      <Arrow arrow={arrow} />
    </button>
  );
}

export default Button;
