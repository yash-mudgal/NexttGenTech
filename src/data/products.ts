/* ============================================================================
 * PRODUCTS / CORE SOLUTIONS
 * ----------------------------------------------------------------------------
 * One entry per platform. Consumed by the Solutions grid, the Product slider,
 * the ERP ecosystem map, the Industries section and the Footer.
 *
 * `link` is a KEY into src/config/links.ts — never a URL. Change the URL there.
 * ========================================================================== */

import type { ProductLinkKey } from "@/config/links";

/** Accent used for the product's gradients, glows and dashboard chrome. */
export type Accent = "brand" | "cyan" | "violet" | "emerald" | "amber" | "rose";

export interface DashboardStat {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

export interface DashboardSpec {
  /** Left-hand nav items shown in the mock application chrome. */
  nav: string[];
  /** Headline KPI tiles. */
  stats: DashboardStat[];
  /** Bar/area chart series (0–100, rendered as relative heights). */
  chart: { title: string; series: number[]; labels: string[] };
  /** Recent-activity / table rows: [primary, secondary, status]. */
  table: { title: string; columns: [string, string, string]; rows: [string, string, string][] };
  /** Small donut/progress readouts. */
  gauges?: { label: string; value: number; suffix?: string }[];
}

export interface Product {
  id: string;
  /** Marketing name. */
  name: string;
  /** e.g. "ERP / Education" — shown as the card's category chip. */
  category: string;
  /** One line for cards. */
  tagline: string;
  /** Two–three sentences for the detail panel. */
  description: string;
  /** Lucide icon name (resolved by @/components/ui/Icon). */
  icon: string;
  accent: Accent;
  /** Short highlight tags shown on the card face. */
  tags: string[];
  /** Full module list — rendered as the expandable module matrix. */
  modules: string[];
  /** CTA label, e.g. "Explore School ERP". */
  cta: string;
  /** Key into productLinks in src/config/links.ts. */
  link: ProductLinkKey;
  /** True for the five flagship platforms; false for secondary products. */
  flagship: boolean;
  /** Data driving the hand-built dashboard mockup. */
  dashboard: DashboardSpec;
}

export const products: Product[] = [
  /* ─────────────────────────────────────────────── 01 · SCHOOL ERP ── */
  {
    id: "school-erp",
    name: "School ERP",
    category: "ERP / Education",
    tagline: "A complete digital ecosystem for educational institutions.",
    description:
      "Runs the whole institution from a single system — admissions through to alumni. Students, staff, academics, finance and communication stay in sync, with dedicated portals so parents, teachers and students each see exactly what they need.",
    icon: "graduation-cap",
    accent: "brand",
    tags: ["Attendance", "Fees", "Examination", "HRMS"],
    modules: [
      "Student Management",
      "Admission",
      "Enquiry",
      "Attendance",
      "Fees",
      "Examination",
      "Timetable",
      "Teacher Management",
      "Parent Management",
      "Employee Management",
      "HRMS",
      "Payroll",
      "Library",
      "Transport",
      "Hostel",
      "Inventory",
      "Communication",
      "Notifications",
      "Reports",
      "Student Portal",
      "Parent Portal",
      "Teacher Portal",
      "Mobile App",
    ],
    cta: "Explore School ERP",
    link: "schoolERP",
    flagship: true,
    dashboard: {
      nav: ["Overview", "Students", "Attendance", "Fees", "Exams", "Staff", "Transport"],
      stats: [
        { label: "Students", value: "1,842", delta: "+36", trend: "up" },
        { label: "Attendance", value: "94.2%", delta: "+1.4%", trend: "up" },
        { label: "Fees Collected", value: "82%", delta: "+7%", trend: "up" },
        { label: "Teachers", value: "126", delta: "+3", trend: "up" },
      ],
      chart: {
        title: "Fee collection · this term",
        series: [48, 62, 55, 71, 66, 84, 78, 92],
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
      },
      table: {
        title: "Recent activity",
        columns: ["Student", "Class", "Status"],
        rows: [
          ["Admission #2291", "Grade VI", "Approved"],
          ["Term-II Fee Receipt", "Grade IX-B", "Paid"],
          ["Unit Test Results", "Grade XI", "Published"],
          ["Transport Route 04", "Mixed", "Updated"],
        ],
      },
      gauges: [
        { label: "Exams graded", value: 78, suffix: "%" },
        { label: "Library issued", value: 64, suffix: "%" },
        { label: "Hostel occupancy", value: 88, suffix: "%" },
      ],
    },
  },

  /* ───────────────────────────────────────────── 02 · HOSPITAL ERP ── */
  {
    id: "hospital-erp",
    name: "Hospital ERP",
    category: "ERP / Healthcare",
    tagline: "Clinical, administrative and financial operations in one system.",
    description:
      "Connects the front desk, the wards, the labs, the pharmacy and the billing counter. OPD and IPD flows, diagnostics, inventory and insurance move through one record, so clinicians and administrators work from the same source of truth.",
    icon: "heart-pulse",
    accent: "cyan",
    tags: ["OPD / IPD", "Pharmacy", "Laboratory", "Billing"],
    modules: [
      "Patient Management",
      "OPD",
      "IPD",
      "Appointment",
      "Doctor Management",
      "Nursing",
      "Pharmacy",
      "Laboratory",
      "Radiology",
      "Billing",
      "Insurance",
      "OT Management",
      "Blood Bank",
      "Bed Management",
      "Inventory",
      "Purchase",
      "Vendors",
      "HRMS",
      "Payroll",
      "Reports",
      "Patient Portal",
      "Doctor Portal",
      "Hospital Dashboard",
    ],
    cta: "Explore Hospital ERP",
    link: "hospitalERP",
    flagship: true,
    dashboard: {
      nav: ["Overview", "Patients", "OPD", "IPD", "Pharmacy", "Lab", "Billing"],
      stats: [
        { label: "Patients Today", value: "318", delta: "+24", trend: "up" },
        { label: "Appointments", value: "142", delta: "+11", trend: "up" },
        { label: "Beds Occupied", value: "76%", delta: "-3%", trend: "down" },
        { label: "Doctors On Duty", value: "38", trend: "flat" },
      ],
      chart: {
        title: "OPD vs IPD admissions",
        series: [40, 58, 46, 72, 61, 80, 69],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      table: {
        title: "Ward activity",
        columns: ["Record", "Department", "Status"],
        rows: [
          ["IPD #4471", "General Medicine", "Admitted"],
          ["Lab Panel · CBC", "Pathology", "Reported"],
          ["OT Slot 14:30", "Orthopaedics", "Scheduled"],
          ["Pharmacy Indent", "Stores", "Dispatched"],
        ],
      },
      gauges: [
        { label: "ICU capacity", value: 62, suffix: "%" },
        { label: "Lab turnaround", value: 91, suffix: "%" },
        { label: "Claims cleared", value: 74, suffix: "%" },
      ],
    },
  },

  /* ────────────────────────────────────────────────────── 03 · CRM ── */
  {
    id: "crm",
    name: "CRM",
    category: "Sales / Customer",
    tagline: "Modern sales pipeline and customer relationship management.",
    description:
      "Every lead, conversation and deal in one pipeline. Sales teams see what to do next, managers see where revenue actually sits, and support tickets stay attached to the customer record rather than a separate inbox.",
    icon: "target",
    accent: "violet",
    tags: ["Leads", "Pipeline", "Quotations", "Support"],
    modules: [
      "Lead Management",
      "Contact Management",
      "Company Management",
      "Opportunities",
      "Sales Pipeline",
      "Follow-ups",
      "Tasks",
      "Activities",
      "Customer Communication",
      "Quotations",
      "Sales",
      "Customer Support",
      "Tickets",
      "Reports",
      "Dashboard",
      "Notifications",
      "Analytics",
    ],
    cta: "Explore CRM",
    link: "crm",
    flagship: true,
    dashboard: {
      nav: ["Overview", "Leads", "Pipeline", "Accounts", "Quotes", "Tickets", "Reports"],
      stats: [
        { label: "Open Leads", value: "486", delta: "+52", trend: "up" },
        { label: "Pipeline Value", value: "₹4.7 Cr", delta: "+12%", trend: "up" },
        { label: "Win Rate", value: "31%", delta: "+2%", trend: "up" },
        { label: "Activities", value: "1,204", delta: "+96", trend: "up" },
      ],
      chart: {
        title: "Pipeline by stage",
        series: [88, 70, 54, 38, 22, 14],
        labels: ["New", "Qualify", "Demo", "Proposal", "Negotiate", "Won"],
      },
      table: {
        title: "Hot opportunities",
        columns: ["Opportunity", "Owner", "Stage"],
        rows: [
          ["Enterprise ERP rollout", "A. Sharma", "Proposal"],
          ["HRMS · 400 seats", "R. Nair", "Negotiate"],
          ["Inventory migration", "P. Desai", "Demo"],
          ["Support renewal", "K. Iyer", "Won"],
        ],
      },
      gauges: [
        { label: "Quota attained", value: 68, suffix: "%" },
        { label: "Follow-ups on time", value: 83, suffix: "%" },
        { label: "Tickets resolved", value: 95, suffix: "%" },
      ],
    },
  },

  /* ───────────────────────────────────────────────────── 04 · HRMS ── */
  {
    id: "hrms",
    name: "HRMS",
    category: "People / Payroll",
    tagline: "The complete employee lifecycle, hire to exit.",
    description:
      "Recruitment, onboarding, attendance, leave, payroll, performance and assets in one place. Employee self-service removes the paperwork loop, and every approval leaves an audit trail.",
    icon: "users-round",
    accent: "emerald",
    tags: ["Payroll", "Attendance", "Leave", "Appraisal"],
    modules: [
      "Employee Management",
      "Recruitment",
      "Candidate Management",
      "Onboarding",
      "Attendance",
      "Leave",
      "Payroll",
      "Employee Documents",
      "Performance",
      "Appraisal",
      "Timesheet",
      "Expense",
      "Assets",
      "Training",
      "Organization Structure",
      "Reports",
      "Employee Self Service",
    ],
    cta: "Explore HRMS",
    link: "hrms",
    flagship: true,
    dashboard: {
      nav: ["Overview", "People", "Attendance", "Leave", "Payroll", "Performance", "Assets"],
      stats: [
        { label: "Employees", value: "742", delta: "+18", trend: "up" },
        { label: "Present Today", value: "689", delta: "92.9%", trend: "up" },
        { label: "On Leave", value: "31", delta: "-4", trend: "down" },
        { label: "Payroll Run", value: "Ready", trend: "flat" },
      ],
      chart: {
        title: "Attendance · last 8 days",
        series: [86, 90, 88, 93, 91, 95, 89, 93],
        labels: ["01", "02", "03", "04", "05", "06", "07", "08"],
      },
      table: {
        title: "Pending approvals",
        columns: ["Request", "Employee", "Status"],
        rows: [
          ["Casual leave · 2d", "Engineering", "Pending"],
          ["Expense claim", "Field Sales", "Approved"],
          ["Asset handover", "Design", "Issued"],
          ["Appraisal cycle Q3", "All units", "Open"],
        ],
      },
      gauges: [
        { label: "Onboarding done", value: 72, suffix: "%" },
        { label: "Docs verified", value: 87, suffix: "%" },
        { label: "Reviews submitted", value: 59, suffix: "%" },
      ],
    },
  },

  /* ────────────────────────────────────────────── 05 · INVENTORY ── */
  {
    id: "inventory",
    name: "Inventory Management",
    category: "Supply Chain",
    tagline: "Stock, purchase and warehouse control with full traceability.",
    description:
      "Track every unit across warehouses with batch, serial and expiry awareness. Purchase orders, transfers, adjustments and barcode workflows keep physical stock and system stock honest with each other.",
    icon: "boxes",
    accent: "amber",
    tags: ["Warehouses", "Batches", "Barcode", "Purchase"],
    modules: [
      "Products",
      "Categories",
      "Brands",
      "Warehouses",
      "Stock",
      "Purchase",
      "Purchase Orders",
      "Sales",
      "Vendors",
      "Customers",
      "Stock Transfer",
      "Stock Adjustment",
      "Serial Numbers",
      "Batch Management",
      "Expiry",
      "Low Stock Alerts",
      "Barcode",
      "Inventory Reports",
      "Dashboard",
    ],
    cta: "Explore Inventory",
    link: "inventory",
    flagship: true,
    dashboard: {
      nav: ["Overview", "Products", "Stock", "Purchase", "Sales", "Warehouses", "Alerts"],
      stats: [
        { label: "SKUs", value: "12,480", delta: "+240", trend: "up" },
        { label: "Stock Value", value: "₹3.2 Cr", delta: "+5%", trend: "up" },
        { label: "Low Stock", value: "47", delta: "+9", trend: "down" },
        { label: "Warehouses", value: "6", trend: "flat" },
      ],
      chart: {
        title: "Inward vs outward movement",
        series: [55, 68, 49, 76, 63, 81, 72],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      table: {
        title: "Stock movement",
        columns: ["Document", "Warehouse", "Status"],
        rows: [
          ["PO #8842", "Central WH", "Received"],
          ["Transfer #331", "North → East", "In transit"],
          ["Batch B-2291", "Cold Store", "Expiring"],
          ["Adjustment #77", "Central WH", "Posted"],
        ],
      },
      gauges: [
        { label: "Stock accuracy", value: 96, suffix: "%" },
        { label: "PO fulfilment", value: 81, suffix: "%" },
        { label: "Space utilised", value: 67, suffix: "%" },
      ],
    },
  },

  /* ──────────────────────────────────────────── 06 · RESTAURANT ── */
  {
    id: "restaurant-erp",
    name: "Restaurant ERP",
    category: "ERP / Hospitality",
    tagline: "POS, kitchen and multi-branch operations in one platform.",
    description:
      "From table to kitchen to bill. Orders, KOTs, menus, delivery and stock consumption stay connected across branches, so owners can see performance per outlet without exporting a single spreadsheet.",
    icon: "utensils-crossed",
    accent: "rose",
    tags: ["POS", "KOT", "Menu", "Multi-branch"],
    modules: [
      "Table Management",
      "POS",
      "Orders",
      "Kitchen Management",
      "KOT",
      "Menu Management",
      "Inventory",
      "Purchase",
      "Vendors",
      "Customers",
      "Staff",
      "Billing",
      "Offers",
      "Reports",
      "Delivery",
      "Multi-branch",
    ],
    cta: "Explore Restaurant ERP",
    link: "restaurantERP",
    flagship: false,
    dashboard: {
      nav: ["Overview", "Tables", "Orders", "Kitchen", "Menu", "Billing", "Branches"],
      stats: [
        { label: "Orders Today", value: "364", delta: "+41", trend: "up" },
        { label: "Tables Active", value: "22/30", delta: "73%", trend: "up" },
        { label: "Avg Ticket", value: "₹684", delta: "+₹42", trend: "up" },
        { label: "Branches", value: "4", trend: "flat" },
      ],
      chart: {
        title: "Covers by hour",
        series: [18, 34, 62, 88, 54, 71, 96, 44],
        labels: ["11", "13", "15", "17", "19", "20", "21", "23"],
      },
      table: {
        title: "Live orders",
        columns: ["Order", "Channel", "Status"],
        rows: [
          ["KOT #1182 · T-07", "Dine-in", "In kitchen"],
          ["Order #4410", "Delivery", "Dispatched"],
          ["Order #4411", "Takeaway", "Ready"],
          ["Bill #9930 · T-12", "Dine-in", "Settled"],
        ],
      },
      gauges: [
        { label: "Kitchen on time", value: 89, suffix: "%" },
        { label: "Table turnover", value: 76, suffix: "%" },
        { label: "Wastage control", value: 93, suffix: "%" },
      ],
    },
  },
];

/** The five flagship platforms, in the order the business ranks them. */
export const flagshipProducts = products.filter((p) => p.flagship);

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
