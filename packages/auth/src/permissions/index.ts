import type { AdminSubRole, Permission, UserRole } from "@ebraz/types";

export function hasPermission(
  permissions: Permission[],
  required: Permission | Permission[],
): boolean {
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.every((permission) => permissions.includes(permission));
}

export function hasAnyPermission(
  permissions: Permission[],
  required: Permission[],
): boolean {
  return required.some((permission) => permissions.includes(permission));
}

export class Policy {
  constructor(private readonly permissions: Permission[]) {}

  can(action: Permission): boolean {
    return hasPermission(this.permissions, action);
  }

  canAny(actions: Permission[]): boolean {
    return hasAnyPermission(this.permissions, actions);
  }

  assert(action: Permission): void {
    if (!this.can(action)) {
      throw new Error(`Forbidden: missing permission ${action}`);
    }
  }
}

export function createPolicy(permissions: Permission[]): Policy {
  return new Policy(permissions);
}

/** @deprecated Use resolvePermissionsFromDb from @ebraz/auth/server instead */
export function resolvePermissions(role: UserRole, subRole?: AdminSubRole): Permission[] {
  void role;
  void subRole;
  return [];
}
