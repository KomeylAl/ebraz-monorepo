import type { AdminSubRole } from "../auth/index";

export interface AdminProfile {
  id: string;
  name: string;
  phone: string;
  subRole: AdminSubRole;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
}
