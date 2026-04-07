/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_HTTPONLY_COOKIE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
