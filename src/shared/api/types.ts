export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

export type ApiFailureEnvelope = {
  success: false;
  error: ApiErrorBody;
};
