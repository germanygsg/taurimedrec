import { Patient } from '../types';

const STORAGE_KEY = 'patient_management_data';
const RECORD_COUNTER_KEY = 'patient_record_counter';

// Initialize with template data only if no data exists
// Cache the data to avoid repeated localStorage access
let cachedPatients: Patient[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 1000; // 1 second cache

const getInitialPatients = (): Patient[] => {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedPatients.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedPatients;
  }

  const existingData = localStorage.getItem(STORAGE_KEY);
  if (existingData) {
    cachedPatients = JSON.parse(existingData);
    cacheTimestamp = now;
    return cachedPatients;
  }

  // Template data for first-time users
  const templateData: Patient[] = [
    {
      id: 1,
      record_number: "PT202500001",
      name: "John Doe",
      age: 45,
      address: "123 Main St, City, State 12345",
      phone_number: "+1-555-0123",
      initial_diagnosis: "Hypertension, Type 2 Diabetes",
      created_at: "2025-01-15T10:30:00Z"
    },
    {
      id: 2,
      record_number: "PT202500002",
      name: "Jane Smith",
      age: 32,
      address: "456 Oak Ave, Town, State 67890",
      phone_number: "+1-555-0456",
      initial_diagnosis: "Asthma",
      created_at: "2025-01-16T14:20:00Z"
    }
  ];

  // Save template data to localStorage and cache
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templateData));
  localStorage.setItem(RECORD_COUNTER_KEY, '3');
  cachedPatients = templateData;
  cacheTimestamp = Date.now();

  return templateData;
};

const getNextId = (): number => {
  const patients = getInitialPatients();
  if (patients.length === 0) return 1;
  return Math.max(...patients.map((p: any) => p.id || 0)) + 1;
};

export const databaseService = {
  async getPatients(): Promise<Patient[]> {
    // Removed artificial delay for better performance
    return [...getInitialPatients()].sort((a, b) => b.id! - a.id!);
  },

  async addPatient(patient: Omit<Patient, 'id' | 'created_at'>): Promise<number> {
    // Reduced API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 50));

    const existingPatients = getInitialPatients();
    const newPatient: Patient = {
      ...patient,
      id: getNextId(),
      created_at: new Date().toISOString()
    };

    existingPatients.push(newPatient);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPatients));

    // Update cache and record counter
    cachedPatients = existingPatients;
    cacheTimestamp = Date.now();
    const currentCounter = parseInt(localStorage.getItem(RECORD_COUNTER_KEY) || '3');
    localStorage.setItem(RECORD_COUNTER_KEY, String(currentCounter + 1));

    return newPatient.id;
  },

  async updatePatient(id: number, patient: Omit<Patient, 'id' | 'created_at'>): Promise<string> {
    // Reduced API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 50));

    const existingPatients = getInitialPatients();
    const index = existingPatients.findIndex(p => p.id === id);
    if (index !== -1) {
      existingPatients[index] = {
        ...patient,
        id,
        created_at: existingPatients[index].created_at
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPatients));
      // Update cache
      cachedPatients = existingPatients;
      cacheTimestamp = Date.now();
      return "Patient updated successfully";
    }
    throw new Error("Patient not found");
  },

  async deletePatient(id: number): Promise<string> {
    // Reduced API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 50));

    const existingPatients = getInitialPatients();
    const index = existingPatients.findIndex(p => p.id === id);
    if (index !== -1) {
      existingPatients.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPatients));
      // Update cache
      cachedPatients = existingPatients;
      cacheTimestamp = Date.now();
      return "Patient deleted successfully";
    }
    throw new Error("Patient not found");
  },

  async generateRecordNumber(): Promise<string> {
    // Minimal delay for realism
    await new Promise(resolve => setTimeout(resolve, 10));

    const year = new Date().getFullYear();
    const counter = parseInt(localStorage.getItem(RECORD_COUNTER_KEY) || '3');
    const newCounter = counter + 1;
    localStorage.setItem(RECORD_COUNTER_KEY, String(newCounter));

    return `PT${year}${String(newCounter).padStart(6, '0')}`;
  }
};