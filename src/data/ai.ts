/* ============================================================================
 * AI & MACHINE LEARNING
 * ----------------------------------------------------------------------------
 * Content rule: these describe capabilities the engineering team works with.
 * No claim is made to proprietary models, and no AI vendor is named.
 * ========================================================================== */

/** Capability chips listed beside the neural visualisation. */
export const aiCapabilities: string[] = [
  "Artificial Intelligence",
  "Machine Learning",
  "Generative AI",
  "AI APIs",
  "LLM Integration",
  "Intelligent Automation",
  "AI-Powered Analytics",
  "AI-Assisted Workflows",
  "AI Business Applications",
];

/** Nodes orbiting the "AI ENGINE" core in the neural network visual. */
export interface AiNode {
  id: string;
  label: string;
  detail: string;
  /** Position on the unit circle, in degrees, 0° = right. */
  angle: number;
}

export const aiNodes: AiNode[] = [
  { id: "data", label: "Data", detail: "Operational data from ERP, CRM and HRMS modules.", angle: -90 },
  { id: "ml", label: "ML", detail: "Models trained for classification, scoring and forecasting.", angle: -38 },
  { id: "llm", label: "LLM", detail: "Language models grounded in your own business content.", angle: 14 },
  { id: "automation", label: "Automation", detail: "Rule and model driven workflows that remove manual steps.", angle: 66 },
  { id: "analytics", label: "Analytics", detail: "Metrics and cohorts surfaced where decisions are made.", angle: 118 },
  { id: "prediction", label: "Prediction", detail: "Forward-looking signals: demand, churn, load and risk.", angle: 170 },
  { id: "bi", label: "Business Intelligence", detail: "Consolidated reporting across every connected system.", angle: 222 },
];

/** AI integration use cases. */
export interface AiUseCase {
  title: string;
  body: string;
  icon: string; // lucide name
  /** Illustrative in-product example. */
  example: string;
}

export const aiUseCases: AiUseCase[] = [
  {
    title: "AI Assistants",
    body: "Intelligent assistants integrated directly into business applications, working on the data already in the system.",
    icon: "bot",
    example: "\"Show me every fee defaulter in Grade IX and draft the reminder.\"",
  },
  {
    title: "AI Analytics",
    body: "Turn business data into useful insights, explained in language the person reading it actually uses.",
    icon: "bar-chart-3",
    example: "Automatic weekly summary of what moved, and why it likely moved.",
  },
  {
    title: "Predictive Intelligence",
    body: "ML-based approaches for forecasting and analysis, trained on your own historical operations.",
    icon: "trending-up",
    example: "Stock-out risk for the next 30 days, per warehouse and per SKU.",
  },
  {
    title: "Intelligent Automation",
    body: "Automate repetitive workflows — routing, approvals, reminders and data entry that never needed a human.",
    icon: "workflow",
    example: "Route each incoming lead to the right owner by region and product fit.",
  },
  {
    title: "Document Intelligence",
    body: "Extract and process useful information from documents so records populate themselves.",
    icon: "file-search",
    example: "Read a supplier invoice and pre-fill the purchase entry for approval.",
  },
  {
    title: "AI-Powered Search",
    body: "Natural language search across business systems, instead of remembering which report holds the answer.",
    icon: "search",
    example: "\"Which patients missed a follow-up after discharge last month?\"",
  },
];

/** The AI-assisted engineering workflow. */
export interface WorkflowStage {
  id: string;
  label: string;
  detail: string;
  icon: string; // lucide name
}

export const aiWorkflow: WorkflowStage[] = [
  { id: "idea", label: "Idea", detail: "Business problem framed with the people who live with it.", icon: "lightbulb" },
  { id: "planning", label: "AI-Assisted Planning", detail: "Requirements explored and structured with AI support.", icon: "list-checks" },
  { id: "cli", label: "CLI Development", detail: "Engineering driven from CLI coding tools inside the repository.", icon: "terminal" },
  { id: "generation", label: "Code Generation", detail: "Scaffolding and boilerplate generated, then reviewed by engineers.", icon: "code-2" },
  { id: "testing", label: "Testing", detail: "AI-assisted test authoring alongside human-designed test plans.", icon: "flask-conical" },
  { id: "debugging", label: "Debugging", detail: "Faster root-cause analysis with AI-assisted investigation.", icon: "bug" },
  { id: "review", label: "Review", detail: "Every change read by an engineer before it merges.", icon: "git-pull-request" },
  { id: "deployment", label: "Deployment", detail: "Automated pipeline to staging and production.", icon: "rocket" },
];

/** Short statements shown around the AI workflow diagram. */
export const aiEngineeringPractices: string[] = [
  "CLI coding models",
  "AI coding assistants",
  "AI-assisted development",
  "AI-assisted testing",
  "AI-assisted debugging",
  "AI-generated documentation",
  "Developer automation",
];
