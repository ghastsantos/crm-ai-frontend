import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  connectWhatsAppIntegration,
  disconnectWhatsAppIntegration,
  fetchWhatsAppConversations,
  fetchWhatsAppIntegration,
  processWhatsAppMessage,
  setupWhatsAppIntegration,
  type WhatsAppMessageInput,
} from '@/features/whatsapp/api/whatsapp-api';

export function useWhatsAppIntegration(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['whatsapp-integration', organizationId],
    queryFn: () => fetchWhatsAppIntegration(organizationId as string),
    enabled: Boolean(organizationId),
    refetchInterval: (query) => {
      const integration = query.state.data;
      if (!integration) return false;
      if (!integration.id) return false;
      return integration.status === 'CONNECTED' ? false : 3000;
    },
  });
}

export function useSetupWhatsAppIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => setupWhatsAppIntegration(organizationId),
    onSuccess: (_data, organizationId) => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-integration', organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations', organizationId] });
    },
  });
}

export function useConnectWhatsAppIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => connectWhatsAppIntegration(organizationId),
    onSuccess: (integration, organizationId) => {
      queryClient.setQueryData(['whatsapp-integration', organizationId], integration);
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-integration', organizationId] });
    },
  });
}

export function useDisconnectWhatsAppIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => disconnectWhatsAppIntegration(organizationId),
    onSuccess: (integration, organizationId) => {
      queryClient.setQueryData(['whatsapp-integration', organizationId], integration);
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-integration', organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations', organizationId] });
    },
  });
}

export function useWhatsAppConversations(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['whatsapp-conversations', organizationId],
    queryFn: () => fetchWhatsAppConversations(organizationId as string),
    enabled: Boolean(organizationId),
  });
}

export function useWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WhatsAppMessageInput) => processWhatsAppMessage(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cards', variables.organizationId] });
      void queryClient.invalidateQueries({ queryKey: ['pipeline-logs', variables.organizationId] });
      void queryClient.invalidateQueries({
        queryKey: ['whatsapp-conversations', variables.organizationId],
      });
    },
  });
}
