export type OrganizationMemberRole = 'OWNER' | 'MEMBER';

export type OrganizationMember = {
  id: string;
  role: OrganizationMemberRole;
  createdAt: string;
  organizationId: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
};
