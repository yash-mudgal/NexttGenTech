import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/cn";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

const OFFSET = 22;

const offsets: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: OFFSET },
  down: { x: 0, y: -OFFSET },
  left: { x: OFFSET, y: 0 },
  right: { x: -OFFSET, y: 0 },
  none: { x: 0, y: 0 },
};

export interface RevealProps {
  children: ReactNode;
  /** Direction the element travels *from*. */
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  /** Also scale up slightly on entry. */
  scale?: boolean;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span" | "header" | "figure";
}

/**
 * Scroll-triggered entrance. Plays once.
 *
 * Framer Motion resolves `prefers-reduced-motion` internally and skips the
 * transform, so reduced-motion visitors land straight on the final state.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  scale = false,
  className,
  as = "div",
}: RevealProps) {
  const from = offsets[direction];
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      initial={{ opacity: 0, x: from.x, y: from.y, scale: scale ? 0.96 : 1 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      // `amount: "some"` rather than a ratio: a container taller than the
      // viewport can never reach a fractional threshold, which would leave its
      // contents stuck at opacity 0 on small screens.
      viewport={{ once: true, amount: "some", margin: "0px 0px -80px 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

/* ── Stagger helpers ─────────────────────────────────────────────────────────
 * Wrap a list in <Stagger> and each child in <StaggerItem> to cascade a grid
 * in without hand-tuning a delay per card.
 * -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: OFFSET },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export interface StaggerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
  /** Seconds between children. */
  gap?: number;
}

export function Stagger({ children, className, as = "div", gap = 0.07 }: StaggerProps) {
  const Component = motion[as];
  return (
    <Component
      className={cn(className)}
      variants={{
        ...containerVariants,
        show: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
      }}
      initial="hidden"
      whileInView="show"
      // See the note in Reveal — a tall grid must not depend on a ratio it can
      // never satisfy, or the whole list stays invisible on a phone.
      viewport={{ once: true, amount: "some", margin: "0px 0px -60px 0px" }}
    >
      {children}
    </Component>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const Component = motion[as];
  return (
    <Component className={cn(className)} variants={itemVariants}>
      {children}
    </Component>
  );
}

export default Reveal;
