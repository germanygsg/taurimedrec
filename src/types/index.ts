export interface Patient {
  id?: number;
  record_number: string;
  name: string;
  age: number;
  address?: string;
  phone_number: string;
  initial_diagnosis?: string;
  created_at?: string;
}

export interface ColumnVisibility {
  record_number: boolean;
  name: boolean;
  age: boolean;
  address: boolean;
  phone_number: boolean;
  initial_diagnosis: boolean;
  date_added: boolean;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  appointmentId: number;
  patientName: string;
  patientId: number;
  operatorName: string;
  operatorId: number;
  date: string;
  appointmentDate: string;
  vitalSigns: {
    bloodPressure: string;
    respirationRate: number;
    heartRate: number;
    borgScale: number;
  };
  treatments: Array<{
    id: number;
    name: string;
    price: number;
    notes?: string;
  }>;
  totalAmount: number;
  status: 'paid' | 'unpaid' | 'void';
  created_at: string;
  updated_at?: string;
}