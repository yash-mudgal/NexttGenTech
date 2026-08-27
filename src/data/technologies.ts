/* ============================================================================
 * TECHNOLOGY STACK
 * ----------------------------------------------------------------------------
 * `glyph` maps to a hand-drawn mark in @/components/ui/TechGlyph — we draw our
 * own simplified marks rather than redistributing third-party brand logos.
 * `tint` is the brand-adjacent colour used for the glyph and its glow.
 * ========================================================================== */

export type TechCategoryId =
  | "frontend"
  | "backend"
  | "mobile"
  | "ai"
  | "database"
  | "cloud";

export interface TechCategory {
  id: TechCategoryId;
  label: string;
  blurb: string;
  icon: string; // lucide name
}

export interface Technology {
  name: string;
  category: TechCategoryId;
  glyph: string; // key in TechGlyph
  tint: string; // hex, used for glow + glyph fill
  description: string;
}

export const techCategories: TechCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    blurb: "Interfaces that stay fast and legible under real operational load.",
    icon: "monitor",
  },
  {
    id: "backend",
    label: "Backend",
    blurb: "Business logic, transactions and integrations that have to be correct.",
    icon: "server",
  },
  {
    id: "mobile",
    label: "Mobile",
    blurb: "One codebase, both stores, offline-aware by design.",
    icon: "smartphone",
  },
  {
    id: "ai",
    label: "AI / ML",
    blurb: "Intelligence layered into products where it measurably helps.",
    icon: "sparkles",
  },
  {
    id: "database",
    label: "Database",
    blurb: "Relational and document stores modelled for the domain, not the demo.",
    icon: "database",
  },
  {
    id: "cloud",
    label: "Cloud / Infra",
    blurb: "Containerised, observable deployments with a repeatable pipeline.",
    icon: "cloud",
  },
];

export const technologies: Technology[] = [
  /* Frontend */
  { name: "React", category: "frontend", glyph: "react", tint: "#61DAFB", description: "Component-driven UI for dashboards and product surfaces." },
  { name: "TypeScript", category: "frontend", glyph: "typescript", tint: "#3178C6", description: "Type-safe application code across web and mobile." },
  { name: "JavaScript", category: "frontend", glyph: "javascript", tint: "#F7DF1E", description: "The runtime foundation of every browser build we ship." },
  { name: "Tailwind CSS", category: "frontend", glyph: "tailwind", tint: "#38BDF8", description: "Design-token-driven styling with a consistent visual system." },
  { name: "HTML", category: "frontend", glyph: "html", tint: "#E34F26", description: "Semantic, accessible document structure." },
  { name: "CSS", category: "frontend", glyph: "css", tint: "#2965F1", description: "Modern layout, animation and responsive behaviour." },

  /* Backend */
  { name: ".NET", category: "backend", glyph: "dotnet", tint: "#8B5CF6", description: "Enterprise application platform for ERP-scale workloads." },
  { name: "ASP.NET Core", category: "backend", glyph: "aspnet", tint: "#7C4DFF", description: "High-performance web APIs and server-side services." },
  { name: "Node.js", category: "backend", glyph: "node", tint: "#5FA04E", description: "Event-driven services, gateways and real-time features." },
  { name: "Python", category: "backend", glyph: "python", tint: "#4B8BBE", description: "Data processing, automation and ML workloads." },

  /* Mobile */
  { name: "React Native", category: "mobile", glyph: "reactnative", tint: "#61DAFB", description: "Cross-platform iOS and Android apps from one codebase." },

  /* AI / ML */
  { name: "Artificial Intelligence", category: "ai", glyph: "ai", tint: "#22D3EE", description: "AI capability designed into business applications." },
  { name: "Machine Learning", category: "ai", glyph: "ml", tint: "#34D399", description: "Models trained on operational data for forecasting and scoring." },
  { name: "Generative AI", category: "ai", glyph: "genai", tint: "#A855F7", description: "Drafting, summarisation and content generation inside workflows." },
  { name: "LLM Integration", category: "ai", glyph: "llm", tint: "#8B5CF6", description: "Language models wired into products with retrieval and guardrails." },
  { name: "AI APIs", category: "ai", glyph: "aiapi", tint: "#2563EB", description: "Third-party intelligence services integrated securely." },

  /* Database */
  { name: "SQL Server", category: "database", glyph: "sqlserver", tint: "#CC2927", description: "Transactional backbone for ERP and finance modules." },
  { name: "PostgreSQL", category: "database", glyph: "postgres", tint: "#4169E1", description: "Open-source relational engine for complex, query-heavy systems." },
  { name: "MongoDB", category: "database", glyph: "mongodb", tint: "#47A248", description: "Document storage for flexible, fast-evolving schemas." },
  { name: "Oracle", category: "database", glyph: "oracle", tint: "#F80000", description: "Enterprise database estates and legacy integration." },

  /* Cloud / Infra */
  { name: "Microsoft Azure", category: "cloud", glyph: "azure", tint: "#0089D6", description: "Managed hosting, identity and platform services." },
  { name: "AWS", category: "cloud", glyph: "aws", tint: "#FF9900", description: "Compute, storage and managed data services at scale." },
  { name: "Cloudflare", category: "cloud", glyph: "cloudflare", tint: "#F38020", description: "Edge delivery, DNS and protection for public endpoints." },
  { name: "Docker", category: "cloud", glyph: "docker", tint: "#2496ED", description: "Reproducible builds and containerised deployments." },
  { name: "CI/CD", category: "cloud", glyph: "cicd", tint: "#22D3EE", description: "Automated build, test and release pipelines." },
  { name: "Git", category: "cloud", glyph: "git", tint: "#F05032", description: "Version control, review workflow and release history." },
];

/** Names shown in the infinite hero marquee. */
export const marqueeTech: string[] = [
  ".NET",
  "React",
  "React Native",
  "Node.js",
  "Python",
  "TypeScript",
  "AI",
  "ML",
  "SQL Server",
  "PostgreSQL",
  "MongoDB",
  "Oracle",
  "Azure",
  "AWS",
  "Docker",
  "Cloud",
  "SaaS",
];

export function technologiesIn(category: TechCategoryId): Technology[] {
  return technologies.filter((t) => t.category === category);
}

/* ── Databases (detailed, for the data-layer section) ─────────────────────── */

export interface DatabaseEngine {
  name: string;
  kind: "Relational" | "Document";
  glyph: string;
  tint: string;
  role: string;
  strengths: string[];
}

export const databases: DatabaseEngine[] = [
  {
    name: "SQL Server",
    kind: "Relational",
    glyph: "sqlserver",
    tint: "#CC2927",
    role: "Core transactional store for .NET-based ERP modules.",
    strengths: ["ACID transactions", "Stored procedures", "Reporting services"],
  },
  {
    name: "PostgreSQL",
    kind: "Relational",
    glyph: "postgres",
    tint: "#4169E1",
    role: "Query-heavy analytical and multi-tenant SaaS workloads.",
    strengths: ["JSONB + relational", "Row-level security", "Extensions"],
  },
  {
    name: "MongoDB",
    kind: "Document",
    glyph: "mongodb",
    tint: "#47A248",
    role: "Fast-evolving schemas, event logs and content services.",
    strengths: ["Flexible schema", "Horizontal scaling", "Aggregation pipeline"],
  },
  {
    name: "Oracle",
    kind: "Relational",
    glyph: "oracle",
    tint: "#F80000",
    role: "Enterprise estates and integration with existing systems.",
    strengths: ["Enterprise scale", "PL/SQL", "Legacy interoperability"],
  },
];

/* ── Cloud & DevOps capabilities ──────────────────────────────────────────── */

export interface CloudCapability {
  title: string;
  body: string;
  icon: string; // lucide name
}

export const cloudCapabilities: CloudCapability[] = [
  { title: "Cloud Architecture", body: "Environment topology, networking and service boundaries designed before deployment.", icon: "network" },
  { title: "Cloud Deployment", body: "Repeatable releases to managed cloud platforms with staged environments.", icon: "upload-cloud" },
  { title: "API Integration", body: "Connecting ERP, payment, messaging and third-party systems reliably.", icon: "webhook" },
  { title: "CI/CD", body: "Automated build, test and deploy pipelines on every merge.", icon: "git-branch" },
  { title: "Docker", body: "Containerised services so local, staging and production behave alike.", icon: "container" },
  { title: "Version Control", body: "Reviewed, traceable change history across every repository.", icon: "git-commit-horizontal" },
  { title: "Application Monitoring", body: "Health checks, logs and alerting so problems surface before users report them.", icon: "activity" },
  { title: "Scalable Infrastructure", body: "Capacity that grows with branches, users and data volume.", icon: "trending-up" },
  { title: "Secure Deployment", body: "Least-privilege access, secret management and encrypted transport.", icon: "shield-check" },
];
