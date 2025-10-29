// Utility functions for Tauri plugin access with error handling
declare global {
  interface Window {
    __TAURI__?: any;
  }
}

export async function importTauriDialog() {
  if (!(window as any).__TAURI__) {
    throw new Error('Not in Tauri environment');
  }

  try {
    // Use dynamic import with type assertion to bypass TypeScript checking
    const dialogModule = await Function('return import("@tauri-apps/plugin-dialog")')() as any;
    return dialogModule;
  } catch (error) {
    throw new Error('Failed to import Tauri dialog plugin');
  }
}

export async function importTauriFs() {
  if (!(window as any).__TAURI__) {
    throw new Error('Not in Tauri environment');
  }

  try {
    // Use dynamic import with type assertion to bypass TypeScript checking
    const fsModule = await Function('return import("@tauri-apps/plugin-fs")')() as any;
    return fsModule;
  } catch (error) {
    throw new Error('Failed to import Tauri fs plugin');
  }
}

export function isTauriEnvironment(): boolean {
  return !!(window as any).__TAURI__;
}