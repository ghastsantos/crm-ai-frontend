import { ApiError } from '@/shared/api/client';

const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
  EMAIL_ALREADY_IN_USE: 'Este e-mail já está cadastrado.',
  UNAUTHORIZED: 'Sessão inválida ou expirada. Faça login novamente.',
  VALIDATION_ERROR: 'Os dados enviados não são válidos.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  RATE_LIMIT: 'Muitas requisições. Aguarde um momento.',
  INTERNAL_ERROR: 'Erro no servidor. Tente mais tarde.',
  UNKNOWN: 'A solicitação falhou.',
  HTTP_ERROR: 'Erro de comunicação com o servidor.',
  INVALID_RESPONSE: 'Resposta inválida do servidor.',
  FORBIDDEN: 'Você não tem acesso a este recurso.',
  CARD_NOT_FOUND: 'Negócio não encontrado.',
  INVALID_REFERENCE: 'Referência inválida nos dados enviados.',
  INVALID_CURRENT_PASSWORD: 'Senha atual incorreta.',
  PASSWORD_UNCHANGED: 'A nova senha precisa ser diferente da atual.',
  ORGANIZATION_NOT_FOUND: 'Organização não encontrada.',
  MEMBER_NOT_FOUND: 'Membro nao encontrado.',
  OWNER_CANNOT_REMOVE_SELF: 'O administrador nao pode remover a si mesmo.',
  OWNER_CANNOT_BE_REMOVED: 'Um administrador nao pode ser removido por aqui.',
};

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const mapped = CODE_MESSAGES[err.code];
    if (mapped) return mapped;
    const msg = err.message.trim();
    if (msg) return msg;
    return 'Não foi possível concluir a operação.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Erro inesperado. Tente novamente.';
}
