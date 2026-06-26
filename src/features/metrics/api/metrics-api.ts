import { apiRequest } from '@/shared/api/client';

export type MetricsRangeDays = 7 | 14 | 30 | 90;

export type MetricsOverview = {
  range: {
    days: MetricsRangeDays;
    startsAt: string;
    endsAt: string;
  };
  pipeline: {
    totalDeals: number;
    totalValue: string;
    averageTicket: string | null;
    dealsWithValue: number;
    dealsWithoutValue: number;
    createdInRange: number;
    updatedInRange: number;
    byStage: Array<{
      columnId: string;
      title: string;
      position: number;
      dealCount: number;
      value: string;
    }>;
  };
  activity: {
    totalLogsInRange: number;
    created: number;
    moved: number;
    updated: number;
    deleted: number;
    daily: Array<{
      date: string;
      dealsCreated: number;
      movements: number;
      updates: number;
      deletions: number;
      whatsappMessages: number;
    }>;
    recent: Array<{
      id: string;
      action: string;
      description: string;
      createdAt: string;
      dealTitle: string | null;
      userName: string | null;
    }>;
  };
  whatsapp: {
    status: string;
    connectedPhone: string | null;
    conversations: number;
    activeConversationsInRange: number;
    inboundMessagesInRange: number;
    outboundMessagesInRange: number;
    failedMessagesInRange: number;
    lastMessageAt: string | null;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
    averagePrice: string | null;
  };
  team: {
    totalMembers: number;
    owners: number;
    members: number;
  };
};

export type MetricsOverviewParams = {
  organizationId: string;
  rangeDays: MetricsRangeDays;
};

export async function fetchMetricsOverview(
  params: MetricsOverviewParams
): Promise<MetricsOverview> {
  const search = new URLSearchParams();
  search.set('organizationId', params.organizationId);
  search.set('rangeDays', String(params.rangeDays));

  return apiRequest<MetricsOverview>(`/api/v1/metrics/overview?${search.toString()}`, {
    method: 'GET',
  });
}
