import { LucideIcon, LayoutDashboard, Package, Users, FileText, BarChart3, AlertCircle, Building2, Settings, ShoppingCart, Pill, Calendar, CreditCard, UserCog, Shield } from "lucide-react";

/**
 * Module definition interface
 * Each module represents a feature/section in the application
 */
export interface Module {
  /** Unique identifier for the module */
  id: string;
  /** Display name in the sidebar */
  title: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Route path for the module */
  href: string;
  /** Entity name for permission checking (e.g., "product", "user") */
  entity?: string;
  /** Required permissions (if not using entity-based checking) */
  permissions?: string[];
  /** Required roles to access this module */
  requiredRoles?: string[];
  /** Whether this module is always visible (no permission check) */
  alwaysVisible?: boolean;
  /** Module category for grouping */
  category?: "core" | "operations" | "management" | "admin" | "reports";
  /** Order/priority for display (lower numbers appear first) */
  order?: number;
  /** Whether this module is enabled (for feature flags) */
  enabled?: boolean;
  /** Badge text to display (e.g., "New", "Beta") */
  badge?: string;
  /** Submenu items */
  children?: Omit<Module, "children">[];
}

/**
 * Module Registry
 * Add or remove modules here to control what appears in the sidebar
 * Modules are automatically filtered based on user permissions
 */
export const MODULES: Module[] = [
  // Core Modules
  {
    id: "dashboard",
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
    alwaysVisible: true,
    category: "core",
    order: 1,
    enabled: true,
  },

  // Operations Modules
  {
    id: "inventory",
    title: "Inventory",
    icon: Package,
    href: "/dashboard/inventory",
    entity: "product",
    category: "operations",
    order: 10,
    enabled: true,
  },
  {
    id: "prescriptions",
    title: "Prescriptions",
    icon: Pill,
    href: "/dashboard/prescriptions",
    entity: "prescription",
    category: "operations",
    order: 11,
    enabled: true,
  },
  {
    id: "orders",
    title: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
    entity: "order",
    category: "operations",
    order: 12,
    enabled: true,
  },
  {
    id: "invoices",
    title: "Invoices",
    icon: CreditCard,
    href: "/dashboard/invoices",
    entity: "invoice",
    category: "operations",
    order: 13,
    enabled: true,
  },

  // Management Modules
  {
    id: "customers",
    title: "Customers",
    icon: Users,
    href: "/dashboard/customers",
    entity: "user",
    category: "management",
    order: 20,
    enabled: true,
  },
  {
    id: "branches",
    title: "Branches",
    icon: Building2,
    href: "/dashboard/branches",
    entity: "branch",
    category: "management",
    order: 21,
    enabled: true,
  },
  {
    id: "staff",
    title: "Staff",
    icon: UserCog,
    href: "/dashboard/staff",
    entity: "staff",
    requiredRoles: ["ADMIN", "MANAGER"],
    category: "management",
    order: 22,
    enabled: true,
  },

  // Reports Module
  {
    id: "reports",
    title: "Reports",
    icon: BarChart3,
    href: "/dashboard/reports",
    entity: "report",
    category: "reports",
    order: 30,
    enabled: true,
  },

  // Alerts Module
  {
    id: "alerts",
    title: "Alerts",
    icon: AlertCircle,
    href: "/dashboard/alerts",
    entity: "alert",
    category: "core",
    order: 40,
    enabled: true,
  },

  // Admin Modules
  {
    id: "security",
    title: "Security",
    icon: Shield,
    href: "/dashboard/security",
    requiredRoles: ["ADMIN"],
    category: "admin",
    order: 50,
    enabled: true,
  },

  // Example: Disabled module (won't appear in sidebar)
  // {
  //   id: "analytics",
  //   title: "Analytics",
  //   icon: TrendingUp,
  //   href: "/dashboard/analytics",
  //   entity: "analytics",
  //   category: "reports",
  //   order: 31,
  //   enabled: false, // This module is disabled
  //   badge: "Coming Soon",
  // },
];

/**
 * Settings/Footer modules
 * These appear in the sidebar footer
 */
export const FOOTER_MODULES: Module[] = [
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    alwaysVisible: true,
    entity: "settings",
    enabled: true,
  },
];

/**
 * Helper function to get enabled modules
 */
export function getEnabledModules(): Module[] {
  return MODULES.filter((module) => module.enabled !== false).sort(
    (a, b) => (a.order || 999) - (b.order || 999)
  );
}

/**
 * Helper function to get modules by category
 */
export function getModulesByCategory(category: Module["category"]): Module[] {
  return getEnabledModules().filter((module) => module.category === category);
}

/**
 * Helper function to find a module by ID
 */
export function getModuleById(id: string): Module | undefined {
  return MODULES.find((module) => module.id === id);
}
