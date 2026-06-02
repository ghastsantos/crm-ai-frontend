import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeMyPassword, updateMyProfile } from '../api/account-api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) => updateMyProfile(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) => changeMyPassword(body),
  });
}
