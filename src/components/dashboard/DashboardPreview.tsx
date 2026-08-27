/* ============================================================================
 * DASHBOARD PREVIEW
 * ----------------------------------------------------------------------------
 * A convincing enterprise application shell — window chrome, sidebar, top bar,
 * KPI tiles, chart, donut readouts and an activity table — built entirely from
 * React + CSS + inline SVG. No images, no screenshots.
 *
 * Every figure comes from `product.dashboard` in @/data/products and is an
 * illustrative product mockup. The whole subtree is `aria-hidden`: streaming
 * fake table rows to a screen reader would be noise, so the *calling* card
 * carries a short text description instead.
 *
 * Responsive strategy: **container queries, not viewport breakpoints**, and no
 * transform: scale() hacks. This preview lives inside a product slide, so at a
 * 1280px viewport it has roughly 480px to work with — keying off `lg:` would
 * render the full desktop layout into half the space. `@container` is declared
 * twice on purpose: once on the window, which decides whether the sidebar and
 * the chart/gauge split fit, and once on the main column, so the tiles, chart
 * and table respond to the space actually left after the sidebar.
 *
 *   < 24rem  chrome + top bar + 2 KPI tiles + chart
 *   ≥ 24rem  ↑ plus the remaining tiles (2×2), the gauges and the table
 *   ≥ 36rem  ↑ plus tiles in one row of four
 *   ≥ 42rem  ↑ plus the sidebar, gauges beside the chart
 * ========================================================================== */

import type { Product } from "@/data/products";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";
import { DashboardChart } from "./DashboardChart";
import {
  DashboardSidebar,
  DashboardTopBar,
  DataTable,
  GaugeCard,
  StatTiles,
  TitleBar,
} from "./DashboardParts";

export interface DashboardPreviewProps {
  product: Product;
  className?: string;
  /** Play the chart's scroll-into-view entrance. */
  animate?: boolean;
}

export function DashboardPreview({ product, className, animate = true }: DashboardPreviewProps) {
  const accent = accentOf(product.accent);
  const dashboard = product.dashboard;
  const page = (dashboard.nav[0] ?? "Overview").toLowerCase();
  const breadcrumb = `nextgen · ${product.id} / ${page}`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "@container ng-glass relative isolate overflow-hidden rounded-ng-card shadow-ng-lift",
        className,
      )}
    >
      {/* Accent hairline along the top edge of the window. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.hex}, transparent)` }}
      />

      <TitleBar breadcrumb={breadcrumb} />

      <div className="flex bg-ng-surface/70">
        <DashboardSidebar product={product} accent={accent} className="hidden @2xl:flex" />

        {/* Second container: everything below responds to the width left over
            once the sidebar has taken its share, not to the window's width. */}
        <div className="@container flex min-w-0 flex-1 flex-col">
          <DashboardTopBar product={product} accent={accent} />

          <div className="space-y-2.5 p-2.5 @sm:space-y-3 @sm:p-3.5">
            <StatTiles stats={dashboard.stats} accent={accent} />

            <div className="grid gap-2.5 @sm:gap-3 @2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <DashboardChart chart={dashboard.chart} accent={accent} animate={animate} />
              {dashboard.gauges && dashboard.gauges.length > 0 && (
                <GaugeCard gauges={dashboard.gauges} accent={accent} className="hidden @sm:flex" />
              )}
            </div>

            <DataTable table={dashboard.table} accent={accent} className="hidden @sm:block" />
          </div>
        </div>
      </div>

      {/* Inner light — reads as glass rather than a flat rectangle. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-ng-card ring-1 ring-inset ring-white/[0.04]"
      />
    </div>
  );
}

export default DashboardPreview;
