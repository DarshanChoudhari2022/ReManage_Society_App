/**
 * Centralized Role-Based Access Control (RBAC)
 *
 * Defines which dashboard routes each role can access.
 * Used by middleware (server-side) and sidebar/nav (client-side).
 */

export type UserRole =
  | "chairman"
  | "secretary"
  | "treasurer"
  | "member"
  | "tenant"
  | "watchman"
  | "guard"
  | "vendor_staff"
  | "facility_manager";

// Routes that ALL authenticated users can access (login, dashboard shell, API auth)
const UNIVERSAL_ROUTES = [
  "/dashboard",
  "/api/auth",
  "/api/dashboard",
  "/api/mobile",
  "/api/notifications",
  "/api/push",
  "/api/search",
];

/**
 * Per-role allowed route prefixes.
 * If a role is not listed here, they get UNIVERSAL_ROUTES only.
 */
const ROLE_ROUTES: Record<string, string[]> = {
  // ── Admin roles: full access ──────────────────────────
  chairman: ["*"], // wildcard = everything
  secretary: ["*"],
  treasurer: ["*"],

  // ── Watchman / Guard: visitors + packages only ────────
  watchman: [
    "/visitors",
    "/packages",
    "/api/visitors",
    "/api/packages",
    "/api/guard",
  ],
  guard: [
    "/visitors",
    "/packages",
    "/api/visitors",
    "/api/packages",
    "/api/guard",
  ],

  // ── Society Member: community + personal features ─────
  member: [
    "/my-society",
    "/services",
    "/profile",
    "/my-bills",
    "/receipts",
    "/my-visitors",
    "/complaints",
    "/notices",
    "/directory",
    "/forum",
    "/events",
    "/amenities",
    "/facilities",
    "/marketplace",
    "/parking",
    "/emergency",
    "/meetings",
    "/polls",
    "/documents",
    "/packages",
    "/staff",
    // API routes
    "/api/maintenance",
    "/api/my-bills",
    "/api/rent-invoices",
    "/api/receipts",
    "/api/my-visitors",
    "/api/complaints",
    "/api/notices",
    "/api/directory",
    "/api/forum",
    "/api/events",
    "/api/amenities",
    "/api/facilities",
    "/api/marketplace",
    "/api/parking",
    "/api/emergency",
    "/api/meetings",
    "/api/polls",
    "/api/documents",
    "/api/packages",
    "/api/staff",
    "/api/visitors",
  ],

  // ── Tenant: same as member ────────────────────────────
  tenant: [
    "/my-society",
    "/services",
    "/profile",
    "/my-bills",
    "/receipts",
    "/my-visitors",
    "/complaints",
    "/notices",
    "/directory",
    "/forum",
    "/events",
    "/amenities",
    "/facilities",
    "/marketplace",
    "/parking",
    "/emergency",
    "/meetings",
    "/polls",
    "/documents",
    "/packages",
    "/staff",
    // API routes
    "/api/maintenance",
    "/api/my-bills",
    "/api/rent-invoices",
    "/api/receipts",
    "/api/my-visitors",
    "/api/complaints",
    "/api/notices",
    "/api/directory",
    "/api/forum",
    "/api/events",
    "/api/amenities",
    "/api/facilities",
    "/api/marketplace",
    "/api/parking",
    "/api/emergency",
    "/api/meetings",
    "/api/polls",
    "/api/documents",
    "/api/packages",
    "/api/staff",
    "/api/visitors",
  ],
};

/**
 * Check if a role can access a given pathname.
 */
export function canAccess(role: string, pathname: string): boolean {
  // Universal routes are always accessible
  if (UNIVERSAL_ROUTES.some((r) => pathname.startsWith(r))) {
    return true;
  }

  const allowed = ROLE_ROUTES[role];
  if (!allowed) return false;

  // Wildcard = full access
  if (allowed.includes("*")) return true;

  return allowed.some((route) => pathname.startsWith(route));
}

/**
 * Get the default landing page for a role after login.
 */
export function getDefaultRoute(role: string): string {
  switch (role) {
    case "watchman":
    case "guard":
      return "/visitors";
    case "member":
    case "tenant":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

/**
 * Roles considered "admin" — full management access.
 */
export function isAdminRole(role: string): boolean {
  return ["chairman", "secretary", "treasurer"].includes(role);
}

/**
 * Roles that are watchman/guard type.
 */
export function isWatchmanRole(role: string): boolean {
  return ["watchman", "guard"].includes(role);
}
