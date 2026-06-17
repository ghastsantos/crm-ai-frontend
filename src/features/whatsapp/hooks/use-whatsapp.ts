import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  connectWhatsAppIntegration,
  fetchWhatsAppConversations,
  fetchWhatsAppIntegration,
  processWhatsAppMessage,
  setupWhatsAppIntegration,
  type WhatsAppMessageInput,
} from '@/features/whatsapp/api/whatsapp-api';

export function useWhatsAppIntegration() {
  return useQuery({
    queryKey: ['whatsapp-integration'],
    queryFn: fetchWhatsAppIntegration,
  });
}

export function useSetupWhatsAppIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => setupWhatsAppIntegration(organizationId),
    onSuccess: (_data, organizationId) => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-integration'] });
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations', organizationId] });
    },
  });
}

export function useConnectWhatsAppIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectWhatsAppIntegration,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-integration'] });
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
