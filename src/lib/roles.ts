export const COMMITTEE_ROLES = ["chairman", "secretary", "treasurer"] as const;

export function isCommitteeRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return (COMMITTEE_ROLES as readonly string[]).includes(role);
}
