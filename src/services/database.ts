// Check if running in Tauri environment
// const isTauriEnvironment = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Use mock service for web development
// Note: When building for Tauri, comment out the line below and uncomment the Tauri implementation
export { databaseService } from './databaseMock';

/*
// Real Tauri implementation for desktop builds
// Uncomment this section and comment out the line above when building for Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { Patient } from '../types';

export const databaseService = {
  async getPatients(): Promise<Patient[]> {
    return await invoke<Patient[]>('get_patients');
  },

  async addPatient(patient: Omit<Patient, 'id' | 'created_at'>): Promise<number> {
    return await invoke<number>('add_patient', { patient });
  },

  async updatePatient(id: number, patient: Omit<Patient, 'id' | 'created_at'>): Promise<string> {
    return await invoke<string>('update_patient', { id, patient });
  },

  async deletePatient(id: number): Promise<string> {
    return await invoke<string>('delete_patient', { id });
  },

  async generateRecordNumber(): Promise<string> {
    return await invoke<string>('generate_record_number');
  }
};
*/