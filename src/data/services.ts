/* ============================================================================
 * SERVICES
 * ========================================================================== */

export type ServiceGroup = "engineering" | "intelligence" | "platform" | "design";

export interface Service {
  id: string;
  title: string;
  body: string;
  /** Lucide icon name. */
  icon: string;
  group: ServiceGroup;
  /** Short capability chips shown on hover. */
  points: string[];
}

export const serviceGroups: { id: ServiceGroup; label: string }[] = [
  { id: "engineering", label: "Engineering" },
  { id: "intelligence", label: "AI & Data" },
  { id: "platform", label: "Platform & Cloud" },
  { id: "design", label: "Design & Brand" },
];

export const services: Service[] = [
  {
    id: "custom-software",
    title: "Custom Software Development",
    body: "Enterprise-grade systems built around the way your business actually runs, not around a template.",
    icon: "code-2",
    group: "engineering",
    points: ["Requirement engineering", "Domain modelling", "Long-term maintainability"],
  },
  {
    id: "erp-development",
    title: "ERP Development",
    body: "Industry-specific ERP platforms for education, healthcare, retail, manufacturing and hospitality.",
    icon: "layout-grid",
    group: "engineering",
    points: ["Module architecture", "Role-based access", "Multi-branch support"],
  },
  {
    id: "crm-development",
    title: "CRM Development",
    body: "Modern sales and customer management systems that sales teams are willing to use every day.",
    icon: "target",
    group: "engineering",
    points: ["Pipeline design", "Automation rules", "Revenue reporting"],
  },
  {
    id: "hrms-development",
    title: "HRMS Development",
    body: "Complete employee lifecycle management — recruitment and onboarding through payroll and appraisal.",
    icon: "users-round",
    group: "engineering",
    points: ["Payroll engines", "Statutory reporting", "Self-service portals"],
  },
  {
    id: "saas-development",
    title: "SaaS Development",
    body: "Scalable subscription products with multi-tenancy, metering and billing designed in from day one.",
    icon: "cloud-cog",
    group: "platform",
    points: ["Multi-tenant design", "Subscription billing", "Usage analytics"],
  },
  {
    id: "ai-development",
    title: "AI Development",
    body: "AI-powered business applications — assistants, document processing and intelligent workflows.",
    icon: "sparkles",
    group: "intelligence",
    points: ["LLM integration", "Retrieval pipelines", "Evaluation & guardrails"],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    body: "ML-based analytics and intelligent systems built on your own operational data.",
    icon: "brain-circuit",
    group: "intelligence",
    points: ["Forecasting", "Classification", "Anomaly detection"],
  },
  {
    id: "cloud-solutions",
    title: "Cloud Solutions",
    body: "Cloud architecture, deployment and cost-aware infrastructure that scales with demand.",
    icon: "cloud",
    group: "platform",
    points: ["Architecture review", "Containerised deploys", "Monitoring & alerts"],
  },
  {
    id: "api-development",
    title: "API Development",
    body: "Secure, versioned and well-documented API ecosystems that other systems can rely on.",
    icon: "webhook",
    group: "platform",
    points: ["REST & webhooks", "Auth & rate limiting", "OpenAPI documentation"],
  },
  {
    id: "mobile-development",
    title: "Mobile Development",
    body: "Cross-platform iOS and Android applications built with React Native from a single codebase.",
    icon: "smartphone",
    group: "engineering",
    points: ["Offline-first", "Push notifications", "Store deployment"],
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    body: "Modern product experiences — information architecture, interface design and design systems.",
    icon: "pen-tool",
    group: "design",
    points: ["User flows", "Design systems", "Prototyping"],
  },
  {
    id: "brand-development",
    title: "Brand Development",
    body: "Digital identity and brand systems: logo, typography, colour and the rules that hold them together.",
    icon: "palette",
    group: "design",
    points: ["Identity design", "Brand guidelines", "Collateral"],
  },
  {
    id: "social-media",
    title: "Social Media Management",
    body: "Digital content and social presence planned, produced and published on a consistent rhythm.",
    icon: "megaphone",
    group: "design",
    points: ["Content calendar", "Creative production", "Performance reporting"],
  },
  {
    id: "graphic-design",
    title: "Graphic Design",
    body: "Creative and marketing design for campaigns, product launches and sales material.",
    icon: "image",
    group: "design",
    points: ["Campaign creative", "Presentations", "Print & digital"],
  },
];
