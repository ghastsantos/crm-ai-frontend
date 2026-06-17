export type PublicUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type MembershipSummary = {
  id: string;
  role: string;
  organizationId: string;
  organizationName: string;
  organizationNiche: string;
};

export type UserWithMemberships = PublicUser & {
  memberships: MembershipSummary[];
};

export type AuthPayload = {
  user: PublicUser;
  token?: string;
};
