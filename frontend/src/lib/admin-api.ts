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

// ── User Management types ──

export interface ManagedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  user_type: string;
  role_name: string | null;
  permissions: string[];
  is_active: boolean;
  account_status: string;
  approval_status: string;
  rejection_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  last_login_at: string | null;
  handle: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  youtube: string | null;
  niche: string | null;
  city: string | null;
  state: string | null;
  follower_count: string | null;
  payout_upi: string | null;
  payout_bank_name: string | null;
  payout_account_number: string | null;
  payout_ifsc: string | null;
  documents: string[];
  created_at: string | null;
}

export interface UserListResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserListParams {
  page?: number;
  page_size?: number;
  search?: string;

  approval_status?: string;
  account_status?: string;
  date_from?: string;
  date_to?: string;
  include_deleted?: boolean;
}

export interface UserStats {
  total_users: number;
  pending_approvals: number;
  approved_creators: number;
  active_users: number;
  suspended_users: number;
  rejected_users: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  actor_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string | null;
}

export interface UpdateManagedUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  handle?: string;
  bio?: string;
  instagram?: string;
  youtube?: string;
  niche?: string;
  city?: string;
  state?: string;
  follower_count?: string;
  payout_upi?: string;
  payout_bank_name?: string;
  payout_account_number?: string;
  payout_ifsc?: string;
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

  // ── Admin User Management (paginated) ──
  getAdminUsersList: (params: { page?: number; page_size?: number; search?: string; role_filter?: string; account_status?: string; include_deleted?: boolean } = {}) =>
    api.get("/admin/users-list", { params }).then((r) => r.data.data as UserListResponse),
  getAdminStats: () =>
    api.get("/admin/users-stats").then((r) => r.data.data as { total_admins: number; active_admins: number; inactive_admins: number }),
  changeAdminStatus: (id: string, account_status: string) =>
    api.post(`/admin/users/${id}/status`, { account_status }).then((r) => r.data.data as AdminUser),
  restoreAdminUser: (id: string) =>
    api.post(`/admin/users/${id}/restore`).then((r) => r.data.data as AdminUser),
  getAdminActivity: (id: string, page = 1) =>
    api.get(`/admin/users/${id}/activity`, { params: { page } }).then((r) => r.data.data as { logs: ActivityLog[]; total: number; page: number; page_size: number }),

  // ── Creator Management ──
  createCreator: (payload: { first_name: string; last_name: string; email: string; password: string; phone?: string; handle?: string; instagram?: string; youtube?: string; niche?: string; city?: string; state?: string; approval_status?: string }) =>
    api.post("/admin/creator-management/creators", payload).then((r) => r.data.data as ManagedUser),
  getUserStats: () =>
    api.get("/admin/creator-management/stats").then((r) => r.data.data as UserStats),
  getManagedUsers: (params: UserListParams = {}) =>
    api.get("/admin/creator-management/users", { params }).then((r) => r.data.data as UserListResponse),
  getManagedUser: (id: string) =>
    api.get(`/admin/creator-management/users/${id}`).then((r) => r.data.data as ManagedUser),
  updateManagedUser: (id: string, payload: UpdateManagedUserPayload) =>
    api.put(`/admin/creator-management/users/${id}`, payload).then((r) => r.data.data as ManagedUser),
  changeUserStatus: (id: string, account_status: string) =>
    api.post(`/admin/creator-management/users/${id}/status`, { account_status }).then((r) => r.data.data as ManagedUser),
  handleApproval: (id: string, action: "approve" | "reject", reason?: string) =>
    api.post(`/admin/creator-management/users/${id}/approval`, { action, reason }).then((r) => r.data.data as ManagedUser),
  softDeleteUser: (id: string) =>
    api.delete(`/admin/creator-management/users/${id}`).then((r) => r.data.data),
  restoreUser: (id: string) =>
    api.post(`/admin/creator-management/users/${id}/restore`).then((r) => r.data.data as ManagedUser),
  bulkAction: (user_ids: string[], action: string, reason?: string) =>
    api.post("/admin/creator-management/bulk", { user_ids, action, reason }).then((r) => r.data.data),
  getUserActivity: (id: string, page = 1) =>
    api.get(`/admin/creator-management/users/${id}/activity`, { params: { page } }).then((r) => r.data.data as { logs: ActivityLog[]; total: number; page: number; page_size: number }),
  exportUsers: (params: UserListParams = {}) =>
    api.get("/admin/creator-management/export", { params, responseType: "blob" }).then((r) => r.data),

  // ── Waitlist ──
  getWaitlist: (params: { page?: number; page_size?: number; search?: string } = {}) =>
    api.get("/admin/waitlist", { params }).then((r) => r.data.data as WaitlistListResponse),
  deleteWaitlistEntry: (id: string) =>
    api.delete(`/admin/waitlist/${id}`).then((r) => r.data.data),
};

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  instagram_link: string;
  platforms: string | null;
  social_links: string | null;
  additional_info: string | null;
  created_at: string | null;
}

export interface WaitlistListResponse {
  entries: WaitlistEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
