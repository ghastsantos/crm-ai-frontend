export function membershipRoleLabel(role: string): string {
  if (role === 'OWNER') return 'Proprietário';
  if (role === 'MEMBER') return 'Membro';
  return role;
}
