import type { PixKeyType } from '@/entities/organization/types';

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
  organizationPixKey: string | null;
  organizationPixKeyType: PixKeyType | null;
};

export type UserWithMemberships = PublicUser & {
  memberships: MembershipSummary[];
};

export type AuthPayload = {
  user: PublicUser;
  token?: string;
};
