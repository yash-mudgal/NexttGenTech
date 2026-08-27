import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  BrainCircuit,
  Briefcase,
  Bug,
  Building,
  Building2,
  Cloud,
  CloudCog,
  Code2,
  Container,
  Cpu,
  Database,
  Factory,
  FileSearch,
  FlaskConical,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  GraduationCap,
  HeartPulse,
  Image as ImageIcon,
  Landmark,
  Layers,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Megaphone,
  Monitor,
  Network,
  Package,
  Palette,
  PenTool,
  RefreshCw,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Truck,
  UploadCloud,
  UsersRound,
  Users,
  UtensilsCrossed,
  Webhook,
  Workflow,
} from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Registry for icon names that arrive as strings from the data layer.
 *
 * Keep this explicit — importing lucide's full barrel would pull ~1,500 icons
 * into the bundle. Inside a component, import the icon directly instead;
 * this map exists only for `icon: "..."` fields in src/data/*.
 */
export const iconRegistry = {
  activity: Activity,
  "bar-chart-3": BarChart3,
  bot: Bot,
  boxes: Boxes,
  "brain-circuit": BrainCircuit,
  briefcase: Briefcase,
  bug: Bug,
  building: Building,
  "building-2": Building2,
  cloud: Cloud,
  "cloud-cog": CloudCog,
  "code-2": Code2,
  container: Container,
  cpu: Cpu,
  database: Database,
  factory: Factory,
  "file-search": FileSearch,
  "flask-conical": FlaskConical,
  "git-branch": GitBranch,
  "git-commit-horizontal": GitCommitHorizontal,
  "git-pull-request": GitPullRequest,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  image: ImageIcon,
  landmark: Landmark,
  layers: Layers,
  "layout-grid": LayoutGrid,
  lightbulb: Lightbulb,
  "list-checks": ListChecks,
  megaphone: Megaphone,
  monitor: Monitor,
  network: Network,
  package: Package,
  palette: Palette,
  "pen-tool": PenTool,
  "refresh-cw": RefreshCw,
  rocket: Rocket,
  search: Search,
  server: Server,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  smartphone: Smartphone,
  sparkles: Sparkles,
  target: Target,
  terminal: Terminal,
  "trending-up": TrendingUp,
  truck: Truck,
  "upload-cloud": UploadCloud,
  "users-round": UsersRound,
  users: Users,
  "utensils-crossed": UtensilsCrossed,
  webhook: Webhook,
  workflow: Workflow,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconRegistry;

export interface IconProps extends LucideProps {
  name: string;
}

/**
 * Renders a registered icon by name. Unknown names fall back to a neutral
 * glyph rather than crashing the section that referenced them.
 */
export function Icon({ name, ...props }: IconProps) {
  const Component = (iconRegistry as Record<string, LucideIcon>)[name] ?? Sparkles;
  return <Component aria-hidden="true" {...props} />;
}

export default Icon;
