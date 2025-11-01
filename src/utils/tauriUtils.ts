// Utility functions for Tauri plugin access with error handling
declare global {
  interface Window {
    __TAURI__?: Record<string, unknown>;
  }
}

export async function importTauriDialog() {
  if (!(window as Record<string, unknown>).__TAURI__) {
    throw new Error('Not in Tauri environment');
  }

  try {
    // Use dynamic import with type assertion to bypass TypeScript checking
    const dialogModule = await Function('return import("@tauri-apps/plugin-dialog")')() as Record<string, unknown>;
    return dialogModule;
  } catch {
    throw new Error('Failed to import Tauri dialog plugin');
  }
}

export async function importTauriFs() {
  if (!(window as Record<string, unknown>).__TAURI__) {
    throw new Error('Not in Tauri environment');
  }

  try {
    // Use dynamic import with type assertion to bypass TypeScript checking
    const fsModule = await Function('return import("@tauri-apps/plugin-fs")')() as Record<string, unknown>;
    return fsModule;
  } catch {
    throw new Error('Failed to import Tauri fs plugin');
  }
}

export function isTauriEnvironment(): boolean {
  return !!(window as Record<string, unknown>).__TAURI__;
}