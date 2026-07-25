import { api } from "@/lib/axios";

export interface Permission {
  key: string;
  label: string;
  group: string;
}

export interface Role {
  name: string;
  label: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
}

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  user_type: string;
  role_name: string | null;
  permissions: string[];
  is_active: boolean;
}

export interface CreateRolePayload {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  label?: string;
  description?: string;
  permissions?: string[];
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string | null;
  role_name: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  role_name?: string;
  is_active?: boolean;
  password?: string;
}

export const adminApi = {
  getPermissions: () => api.get("/admin/permissions").then((r) => r.data.data as Permission[]),
  getRoles: () => api.get("/admin/roles").then((r) => r.data.data as Role[]),
  getUsers: () => api.get("/admin/users").then((r) => r.data.data as AdminUser[]),
  createUser: (payload: CreateUserPayload) =>
    api.post("/admin/users", payload).then((r) => r.data.data as AdminUser),
  updateUser: (id: string, payload: UpdateUserPayload) =>
    api.put(`/admin/users/${id}`, payload).then((r) => r.data.data as AdminUser),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data.data),
  createRole: (payload: CreateRolePayload) =>
    api.post("/admin/roles", payload).then((r) => r.data.data as Role),
  updateRole: (name: string, payload: UpdateRolePayload) =>
    api.put(`/admin/roles/${name}`, payload).then((r) => r.data.data as Role),
  deleteRole: (name: string) => api.delete(`/admin/roles/${name}`).then((r) => r.data.data),
};
