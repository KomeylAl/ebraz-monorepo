import type { AdminSubRole, Permission, UserRole } from "./index";

export interface AuthUserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  subRole?: AdminSubRole;
  permissions: Permission[];
  birthDate?: string;
  nationalCode?: string;
  address?: string;
}
