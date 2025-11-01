// Type declarations for Tauri APIs
declare module '@tauri-apps/plugin-dialog' {
  export function save(options: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
  }): Promise<string | null>;

  export function open(options: {
    title?: string;
    multiple?: boolean;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
  }): Promise<string | null>;
}

declare module '@tauri-apps/plugin-fs' {
  export function writeFile(filePath: string, contents: string): Promise<void>;
  export function readFile(filePath: string): Promise<Uint8Array>;
}

declare global {
  interface Window {
    __TAURI__?: Record<string, unknown>;
  }
}

export {};