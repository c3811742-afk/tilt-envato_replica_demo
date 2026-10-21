export type AdminRole = 'superAdmin' | 'reviewer' | 'content' | 'finance' | 'support';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string; // ISO date
}

export interface NewAdminInput {
  name: string;
  email: string;
  role: AdminRole;
}
