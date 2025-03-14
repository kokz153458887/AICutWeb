/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_LOGGING: string;
  readonly VITE_SHOW_DEBUG_CONSOLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}