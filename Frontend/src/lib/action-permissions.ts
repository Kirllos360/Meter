import type { UserRole } from './types';

export type BillingAction =
  | 'invoice:create'
  | 'invoice:edit'
  | 'invoice:issue'
  | 'invoice:cancel'
  | 'payment:record'
  | 'payment:edit'
  | 'payment:delete'
  | 'payment:reverse'
  | 'reading:create'
  | 'reading:edit'
  | 'reading:approve'
  | 'reading:reject'
  | 'admin:access';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  project_admin: 80,
  operator: 60,
  technician: 50,
  finance: 40,
  support: 30,
  customer: 0,
};

const ACTION_MINIMUM_ROLE: Record<BillingAction, UserRole> = {
  'invoice:create': 'operator',
  'invoice:edit': 'operator',
  'invoice:issue': 'operator',
  'invoice:cancel': 'project_admin',
  'payment:record': 'finance',
  'payment:edit': 'operator',
  'payment:delete': 'project_admin',
  'payment:reverse': 'project_admin',
  'reading:create': 'technician',
  'reading:edit': 'technician',
  'reading:approve': 'operator',
  'reading:reject': 'operator',
  'admin:access': 'super_admin',
};

export function canPerform(role: UserRole | undefined | null, action: BillingAction): boolean {
  if (!role) return false;
  const userLevel = ROLE_HIERARCHY[role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[ACTION_MINIMUM_ROLE[action]];
  return userLevel >= requiredLevel;
}
