export interface CompanionProfile {
  id: string;
  name: string;
  phone: string;
  birthDate?: string;
  address?: string;
}

export interface RecordImageProfile {
  id: string;
  filePath: string;
}

export interface MedicalRecordProfile {
  id: string;
  recordNumber: string;
  clientId: string;
  therapistId?: string;
  supervisorId?: string;
  adminId?: string;
  referenceSource?: string;
  admissionDate: string;
  visitDate: string;
  chiefComplaints?: string;
  presentIllness?: string;
  pastHistory?: string;
  familyHistory?: string;
  personalHistory?: string;
  mse?: string;
  diagnosis?: string;
  companion?: CompanionProfile;
  images: RecordImageProfile[];
  createdAt: string;
  updatedAt: string;
}
