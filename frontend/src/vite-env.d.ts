/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API, e.g. http://localhost:8000 (defaults to the deployed API). */
  readonly VITE_API_BASE?: string;
  /** Set to "true" to show the demo banner. */
  readonly VITE_IS_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
