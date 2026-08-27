/* ============================================================================
 * DASHBOARD PARTS
 * ----------------------------------------------------------------------------
 * The individual pieces of the hand-built application mockup: window chrome,
 * sidebar, top bar, KPI tiles, donut readouts and the activity table.
 *
 * Everything here is presentational and lives inside an `aria-hidden` subtree
 * (see DashboardPreview) — the figures are illustrative product mockups, not
 * content a screen reader should ever read out.
 *
 * All responsive variants are CONTAINER queries (`@sm:`, `@md:`, `@min-[40rem]:`)
 * keyed off the `@container` on DashboardPreview's root. The preview sits in a
 * slide that is far narrower than the viewport, so viewport breakpoints lie
 * about how much room these parts actually have.
 * ========================================================================== */

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BedDouble,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  Bus,
  CalendarCheck,
  CalendarDays,
  ChefHat,
  Circle,
  ClipboardList,
  FileText,
  FlaskConical,
  GitBranch,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  Maximize2,
  Minus,
  Package,
  Pill,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  Stethoscope,
  Store,
  Target,
  Ticket,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardSpec, DashboardStat, Product } from "@/data/products";
import type { AccentTheme } from "@/lib/accent";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Icon per sidebar entry. The nav labels are a known, finite set defined in
 * `@/data/products`, so an exact-match map beats fuzzy keyword guessing.
 */
const navIcons: Record<string, LucideIcon> = {
  Overview: LayoutDashboard,
  Students: GraduationCap,
  Attendance: CalendarCheck,
  Fees: Wallet,
  Exams: ClipboardList,
  Staff: Users,
  Transport: Bus,
  Patients: HeartPulse,
  OPD: Stethoscope,
  IPD: BedDouble,
  Pharmacy: Pill,
  Lab: FlaskConical,
  Billing: Receipt,
  Leads: Target,
  Pipeline: GitBranch,
  Accounts: Building2,
  Quotes: FileText,
  Tickets: Ticket,
  Reports: BarChart3,
  People: UsersRound,
  Leave: CalendarDays,
  Payroll: Wallet,
  Performance: TrendingUp,
  Assets: Package,
  Products: Boxes,
  Stock: Warehouse,
  Purchase: ShoppingCart,
  Sales: TrendingUp,
  Warehouses: Warehouse,
  Alerts: Bell,
  Tables: LayoutGrid,
  Orders: Receipt,
  Kitchen: ChefHat,
  Menu: BookOpen,
  Branches: Store,
};

/** "School ERP" → "SE", "CRM" → "CR". */
export function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Status → tone. Kept local to the mockup: the data layer carries plain text,
 * and colour alone never encodes the meaning (the label is always visible).
 */
const statusTones: Record<string, "positive" | "warning"> = {
  approved: "positive",
  paid: "positive",
  published: "positive",
  received: "positive",
  settled: "positive",
  won: "positive",
  reported: "positive",
  issued: "positive",
  ready: "positive",
  posted: "positive",
  admitted: "positive",
  pending: "warning",
  expiring: "warning",
  "in transit": "warning",
  "in kitchen": "warning",
  open: "warning",
  negotiate: "warning",
};

/* ── Window chrome ───────────────────────────────────────────────────────── */

export function TitleBar({ breadcrumb }: { breadcrumb: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-ng-line bg-ng-void/50 px-3 py-2 @sm:gap-3 @sm:px-4">
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="size-2 rounded-full bg-ng-rose/60" />
        <span className="size-2 rounded-full bg-ng-amber/60" />
        <span className="size-2 rounded-full bg-ng-emerald/60" />
      </div>

      <div className="flex min-w-0 flex-1 justify-center">
        <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-ng-line bg-ng-surface/80 px-2.5 py-1">
          <Lock className="size-2.5 shrink-0 text-ng-faint" strokeWidth={2} />
          <span className="truncate font-mono text-[0.625rem] text-ng-muted @sm:text-xs">
            {breadcrumb}
          </span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 text-ng-faint @sm:gap-2">
        <Minus className="size-3" strokeWidth={2} />
        <Maximize2 className="size-2.5" strokeWidth={2} />
        <X className="size-3" strokeWidth={2} />
      </div>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */

export interface ShellProps {
  product: Product;
  accent: AccentTheme;
  className?: string;
}

export function DashboardSidebar({ product, accent, className }: ShellProps) {
  const items = product.dashboard.nav;

  return (
    <div
      className={cn(
        "w-40 shrink-0 flex-col justify-between border-r border-ng-line bg-ng-void/40",
        className,
      )}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 px-1 pb-3">
          <LogoMark className="h-4 w-auto" />
          <span className="truncate font-display text-[0.6875rem] font-semibold text-ng-fg">
            {product.name}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {items.map((item, i) => {
            const NavIcon = navIcons[item] ?? Circle;
            const isActive = i === 0;
            return (
              <span
                key={item}
                className={cn(
                  "relative flex items-center gap-2 rounded-ng-sm px-2 py-[0.3125rem] text-[0.6875rem]",
                  isActive ? cn(accent.bg, accent.text, "font-medium") : "text-ng-muted",
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-3.5 w-[2px] -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: accent.hex }}
                  />
                )}
                <NavIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-ng-line p-3">
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full font-mono text-[0.5625rem] font-semibold",
            accent.chip,
          )}
        >
          {initialsOf(product.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.6875rem] leading-tight text-ng-fg2">
            {product.name}
          </span>
          <span className="block truncate font-mono text-[0.5625rem] leading-tight text-ng-faint">
            {product.category}
          </span>
        </span>
        <Settings className="size-3 shrink-0 text-ng-faint" strokeWidth={1.75} />
      </div>
    </div>
  );
}

/* ── Top bar ─────────────────────────────────────────────────────────────── */

export function DashboardTopBar({ product, accent, className }: ShellProps) {
  const page = product.dashboard.nav[0] ?? "Overview";

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-ng-line px-3 py-2 @sm:gap-4 @sm:px-4",
        className,
      )}
    >
      <div className="min-w-0 shrink">
        <span className="block truncate text-xs font-medium leading-tight text-ng-fg">{page}</span>
        <span className="hidden truncate font-mono text-[0.5625rem] uppercase leading-tight tracking-[0.16em] text-ng-faint @sm:block">
          {product.category}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="hidden min-w-0 max-w-[13rem] flex-1 items-center gap-1.5 rounded-full border border-ng-line bg-ng-void/50 px-2.5 py-1 @md:flex">
          <Search className="size-3 shrink-0 text-ng-faint" strokeWidth={2} />
          <span className="truncate text-[0.6875rem] text-ng-faint">
            Search {page.toLowerCase()}…
          </span>
          <span className="ml-auto shrink-0 rounded border border-ng-line px-1 font-mono text-[0.5625rem] text-ng-faint">
            ⌘K
          </span>
        </span>

        <span className="relative grid size-6 shrink-0 place-items-center rounded-full border border-ng-line bg-ng-void/50">
          <Bell className="size-3 text-ng-muted" strokeWidth={1.75} />
          <span
            className="absolute right-0.5 top-0.5 size-1.5 rounded-full ring-2 ring-ng-surface"
            style={{ backgroundColor: accent.hex }}
          />
        </span>

        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full font-mono text-[0.5625rem] font-semibold",
            accent.chip,
          )}
        >
          {initialsOf(product.name)}
        </span>
      </div>
    </div>
  );
}

/* ── KPI tiles ───────────────────────────────────────────────────────────── */

function DeltaPill({
  delta,
  trend,
  className,
}: {
  delta?: string;
  trend?: DashboardStat["trend"];
  className?: string;
}) {
  const tone =
    trend === "up"
      ? "bg-ng-emerald/12 text-ng-emerald"
      : trend === "down"
        ? "bg-ng-rose/12 text-ng-rose"
        : "bg-white/[0.06] text-ng-muted";
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 rounded-full px-1.5 py-[0.1875rem] font-mono text-[0.5625rem] leading-none",
        tone,
        className,
      )}
    >
      <TrendIcon className="size-2.5 shrink-0" strokeWidth={2.5} />
      <span className="truncate">{delta ?? "—"}</span>
    </span>
  );
}

export function StatTiles({
  stats,
  accent,
  className,
}: {
  stats: DashboardStat[];
  accent: AccentTheme;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 @min-[40rem]:grid-cols-4", className)}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "relative flex-col overflow-hidden rounded-ng border border-ng-line bg-ng-surface2/70 p-2.5",
            /* Only the first two tiles survive the narrowest container. */
            i < 2 ? "flex" : "hidden @sm:flex",
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent.hex}66, transparent)`,
            }}
          />

          {/*
           * Label wraps to two lines rather than truncating — a KPI reading
           * "STUD…" is worse than no tile at all. The value then anchors to the
           * bottom with mt-auto so the numbers line up across tiles whose
           * labels wrapped to different heights.
           */}
          <span className="line-clamp-2 font-mono text-[0.5625rem] uppercase leading-[1.3] tracking-[0.12em] text-ng-faint">
            {stat.label}
          </span>
          <span className="mt-auto pt-2 font-display text-base font-semibold leading-none text-ng-fg @min-[40rem]:text-lg">
            {stat.value}
          </span>
          <DeltaPill delta={stat.delta} trend={stat.trend} className="mt-1.5 self-start" />
        </div>
      ))}
    </div>
  );
}

/* ── Gauges ──────────────────────────────────────────────────────────────── */

const GAUGE_RADIUS = 16;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function Gauge({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent: AccentTheme;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * GAUGE_CIRCUMFERENCE;

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div className="relative size-10 shrink-0">
        <svg viewBox="0 0 40 40" className="size-full -rotate-90" focusable="false">
          <circle
            cx="20"
            cy="20"
            r={GAUGE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-ng-line"
          />
          <circle
            cx="20"
            cy="20"
            r={GAUGE_RADIUS}
            fill="none"
            stroke={accent.hex}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${dash.toFixed(2)} ${(GAUGE_CIRCUMFERENCE - dash).toFixed(2)}`}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-[0.625rem] font-semibold text-ng-fg">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <span className="line-clamp-2 w-full break-words text-center font-mono text-[0.5625rem] leading-[1.2] text-ng-muted">
        {label}
      </span>
    </div>
  );
}

export function GaugeCard({
  gauges,
  accent,
  className,
}: {
  gauges: NonNullable<DashboardSpec["gauges"]>;
  accent: AccentTheme;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex-col justify-center rounded-ng border border-ng-line bg-ng-surface2/60 p-3",
        className,
      )}
    >
      <span className="block font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ng-faint">
        Readouts
      </span>
      {/*
       * A real grid rather than justify-around: equal tracks plus a gap mean the
       * donuts can never ride over each other and the labels can never run
       * together, however narrow the column gets.
       */}
      <div className="mt-3 grid grid-cols-3 gap-2 @md:gap-3">
        {gauges.map((gauge) => (
          <Gauge
            key={gauge.label}
            label={gauge.label}
            value={gauge.value}
            suffix={gauge.suffix}
            accent={accent}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Activity table ──────────────────────────────────────────────────────── */

function StatusPill({ status, accent }: { status: string; accent: AccentTheme }) {
  const tone = statusTones[status.toLowerCase()];

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-1.5 py-[0.1875rem] text-[0.5625rem] leading-none",
        tone === "positive" && "border-ng-emerald/30 bg-ng-emerald/10 text-ng-emerald",
        tone === "warning" && "border-ng-amber/30 bg-ng-amber/10 text-ng-amber",
      )}
      style={
        tone
          ? undefined
          : {
              color: accent.hex,
              borderColor: `${accent.hex}40`,
              backgroundColor: `${accent.hex}14`,
            }
      }
    >
      <span className="size-1 shrink-0 rounded-full bg-current" />
      <span className="truncate">{status}</span>
    </span>
  );
}

export function DataTable({
  table,
  accent,
  className,
}: {
  table: DashboardSpec["table"];
  accent: AccentTheme;
  className?: string;
}) {
  const widths = ["w-[44%]", "w-[30%]", "w-[26%]"] as const;

  return (
    <div
      className={cn("overflow-hidden rounded-ng border border-ng-line bg-ng-surface2/60", className)}
    >
      <div className="flex items-center justify-between gap-2 border-b border-ng-line px-3 py-2">
        <span className="truncate text-[0.6875rem] font-medium text-ng-fg2">{table.title}</span>
        <span className="shrink-0 font-mono text-[0.5625rem] text-ng-faint">
          {table.rows.length} rows
        </span>
      </div>

      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr>
            {table.columns.map((column, i) => (
              <th
                key={column}
                scope="col"
                className={cn(
                  "truncate px-3 py-1.5 font-mono text-[0.5625rem] font-normal uppercase tracking-[0.16em] text-ng-faint",
                  widths[i],
                  i === 2 && "text-right",
                )}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr
              key={row[0]}
              className="border-t border-ng-line/70 transition-colors duration-200 hover:bg-white/[0.025]"
            >
              <td className="truncate px-3 py-[0.4375rem] text-[0.6875rem] text-ng-fg2">{row[0]}</td>
              <td className="truncate px-3 py-[0.4375rem] text-[0.6875rem] text-ng-muted">
                {row[1]}
              </td>
              <td className="px-3 py-[0.4375rem] text-right">
                <StatusPill status={row[2]} accent={accent} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
