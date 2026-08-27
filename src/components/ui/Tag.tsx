import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TagProps {
  children: ReactNode;
  className?: string;
  /** Slightly larger, used for module chips. */
  size?: "xs" | "sm";
  /** Renders with a coloured dot prefix. */
  dot?: string;
  /** Escape hatch for per-chip stagger delays and inline tints. */
  style?: CSSProperties;
  /** Allow the label to wrap instead of forcing a single line. */
  wrap?: boolean;
}

/** Small pill used for feature, module and capability chips. */
export function Tag({ children, className, size = "sm", dot, style, wrap = false }: TagProps) {
  return (
    <span
      style={style}
      className={cn(
        "ng-tag transition-colors duration-300",
        size === "xs" && "px-2 py-[0.1875rem] text-[0.6875rem]",
        wrap && "min-w-0 whitespace-normal",
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="mr-1.5 size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </span>
  );
}

export default Tag;
