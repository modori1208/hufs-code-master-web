/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SSO_AUTHORIZE_URL: string;
  readonly VITE_SSO_CLIENT_ID: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
