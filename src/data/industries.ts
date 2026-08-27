/* ============================================================================
 * INDUSTRIES
 * ----------------------------------------------------------------------------
 * `products` holds product ids from @/data/products — the Industries section
 * resolves them so every card links to the platforms that actually apply.
 * ========================================================================== */

export interface Industry {
  id: string;
  name: string;
  icon: string; // lucide name
  blurb: string;
  /** Operational problems this vertical typically brings to us. */
  challenges: string[];
  /** Product ids from @/data/products. */
  products: string[];
}

export const industries: Industry[] = [
  {
    id: "education",
    name: "Education",
    icon: "graduation-cap",
    blurb: "Schools, colleges and coaching institutes running admissions, academics and fees on one system.",
    challenges: ["Fragmented student records", "Manual fee follow-up", "Parent communication gaps"],
    products: ["school-erp", "hrms", "inventory"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "heart-pulse",
    blurb: "Hospitals, clinics and diagnostic centres coordinating clinical and billing workflows.",
    challenges: ["Disconnected OPD/IPD flows", "Pharmacy stock leakage", "Slow insurance claims"],
    products: ["hospital-erp", "hrms", "inventory"],
  },
  {
    id: "retail",
    name: "Retail",
    icon: "shopping-bag",
    blurb: "Single and multi-store retailers needing accurate stock and clean point-of-sale data.",
    challenges: ["Stock mismatches", "Multi-store visibility", "Customer retention"],
    products: ["inventory", "crm", "hrms"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: "factory",
    blurb: "Production units tracking materials, purchase orders and finished-goods movement.",
    challenges: ["Raw material planning", "Batch traceability", "Vendor coordination"],
    products: ["inventory", "hrms", "crm"],
  },
  {
    id: "hospitality",
    name: "Hospitality",
    icon: "utensils-crossed",
    blurb: "Restaurants, cafés and cloud kitchens operating across multiple branches.",
    challenges: ["Kitchen delays", "Menu and pricing drift", "Branch-level reporting"],
    products: ["restaurant-erp", "inventory", "hrms"],
  },
  {
    id: "real-estate",
    name: "Real Estate",
    icon: "building-2",
    blurb: "Developers and brokerages managing enquiries, site visits and long sales cycles.",
    challenges: ["Lead leakage", "Long follow-up cycles", "Documentation load"],
    products: ["crm", "hrms"],
  },
  {
    id: "distribution",
    name: "Distribution",
    icon: "truck",
    blurb: "Distributors and wholesalers moving stock across warehouses and territories.",
    challenges: ["Warehouse transfers", "Expiry and batch control", "Route-wise sales"],
    products: ["inventory", "crm", "hrms"],
  },
  {
    id: "professional-services",
    name: "Professional Services",
    icon: "briefcase",
    blurb: "Consultancies and agencies tracking clients, engagements and billable time.",
    challenges: ["Timesheet accuracy", "Client reporting", "Resource planning"],
    products: ["crm", "hrms"],
  },
  {
    id: "finance",
    name: "Finance",
    icon: "landmark",
    blurb: "Finance and lending teams that need auditable processes and controlled access.",
    challenges: ["Audit trails", "Role-based control", "Regulatory reporting"],
    products: ["crm", "hrms"],
  },
  {
    id: "startups",
    name: "Startups",
    icon: "rocket",
    blurb: "Founding teams taking a first product from idea to a shipped, scalable platform.",
    challenges: ["Speed to market", "Scalable foundations", "Lean engineering budget"],
    products: ["crm", "inventory"],
  },
  {
    id: "enterprises",
    name: "Enterprises",
    icon: "building",
    blurb: "Established organisations modernising legacy systems without stopping operations.",
    challenges: ["Legacy migration", "System integration", "Multi-entity structure"],
    products: ["school-erp", "hospital-erp", "crm", "hrms", "inventory"],
  },
];
