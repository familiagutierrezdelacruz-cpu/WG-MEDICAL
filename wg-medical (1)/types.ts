// FIX: Implemented the missing type definitions used throughout the application.

export interface Doctor {
  id: string;
  name: string;
  professionalLicense: string;
  university: string;
  diplomados?: string;
  hasSpecialty: boolean;
  specialtyName?: string;
  specialtyLicense?: string;
  password?: string;
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'Masculino' | 'Femenino' | 'Otro';
  contact: string;
  allergies?: string;
  familyHistory?: string;
  pathologicalHistory?: string;
  nonPathologicalHistory?: string;
  surgicalHistory?: string;
  // Gynecological fields
  gynecologicalHistory?: string;
  lastPapanicolaou?: string; // YYYY-MM-DD
  lastColposcopy?: string; // YYYY-MM-DD
}

export interface VitalSigns {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  glucose?: number;
  weight?: number;
  height?: number;
  bmi?: string;
  bmiInterpretation?: string;
}

export interface Medication {
  name: string;
  indication: string;
  route: 'ORAL' | 'INTRAMUSCULAR' | 'INTRAVENOSA' | 'TÓPICA' | 'SUBLINGUAL' | 'OFTÁLMICA' | 'ÓTICA' | 'NASAL' | 'VAGINAL' | 'RECTAL';
}

export interface Prescription {
  medications: Medication[];
  instructions?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO string
  reason: string;
  vitalSigns?: VitalSigns;
  physicalExam?: string;
  diagnosis: string;
  prescription: Prescription;
  labStudies?: string;
  nextAppointment?: string; // YYYY-MM-DD
  cost?: number;
  ultrasoundReportType?: string;
  ultrasoundReportFindings?: string;
  ultrasoundReportImpression?: string;
  ultrasoundImages?: string[]; // Array of base64 strings
}

export interface ClinicInfo {
    name: string;
    address: string;
    phone: string;
    slogan?: string;
    logo?: string; // base64 string
}

export interface AppSettings {
  medicationsUrl: string;
  clinicInfo?: ClinicInfo;
}