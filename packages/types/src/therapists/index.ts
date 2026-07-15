import type { AdminSubRole } from "../auth/index";

export interface TherapistProfile {
  id: string;
  name: string;
  phone: string;
  nationalCode: string;
  birthDate: string;
  cardNumber: string;
  medicalNumber?: string;
  email?: string;
  avatar?: string;
  times?: string;
  days?: string;
  resume?: string;
  profilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistPublicProfile {
  id: string;
  name: string;
  avatar?: string;
  times?: string;
  days?: string;
  profilePath?: string;
}
