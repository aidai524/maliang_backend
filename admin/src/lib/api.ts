// API 配置和请求函数

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// 获取 Admin Key
function getAdminKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminKey') || '';
  }
  return '';
}

// 设置 Admin Key
export function setAdminKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminKey', key);
  }
}

// 通用请求函数
async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Key': getAdminKey(),
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ========== 用户管理 ==========

export interface User {
  id: number;
  openid: string;
  unionid: string | null;
  phone: string | null;
  nickName: string | null;
  avatarUrl: string | null;
  vipLevel: 'NORMAL' | 'VIP' | 'SVIP';
  vipExpireAt: string | null;
  pointsBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export async function getUsers(page = 1, limit = 20, search = ''): Promise<UsersResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  return request<UsersResponse>('GET', `/v1/admin/users?${params}`);
}

export async function getUser(userId: number): Promise<{ user: User }> {
  return request<{ user: User }>('GET', `/v1/admin/users/${userId}`);
}

export async function updateUser(userId: number, data: Partial<User>): Promise<{ user: User }> {
  return request<{ user: User }>('PUT', `/v1/admin/users/${userId}`, data);
}

export async function deleteUser(userId: number): Promise<{ message: string }> {
  return request<{ message: string }>('DELETE', `/v1/admin/users/${userId}`);
}

export async function setUserVip(
  userId: number,
  data: { vipLevel: string; days?: number; vipExpireAt?: string }
): Promise<{ user: User; message: string }> {
  return request<{ user: User; message: string }>('PUT', `/v1/admin/users/${userId}/vip`, data);
}

export async function cancelUserVip(userId: number): Promise<{ user: User; message: string }> {
  return request<{ user: User; message: string }>('DELETE', `/v1/admin/users/${userId}/vip`);
}

// ========== 统计 ==========

export interface AdminStats {
  totalUsers: number;
  vipUsers: number;
  freeUsers: number;
  totalOrders: number;
  todayNewUsers: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  return request<AdminStats>('GET', '/v1/admin/stats');
}

// ========== 模板管理 ==========

export interface PromptTemplate {
  id: number;
  templateId: string;
  title: string;
  description: string | null;
  prompt: string;
  category: string | null;
  thumbnailUrl: string | null;
  previewImages: string[] | null;
  isHot: boolean;
  usageCount: number;
  createdAt: string;
}

export interface ParamTemplate {
  id: number;
  templateId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  mode: string | null;
  resolution: string | null;
  aspectRatio: string | null;
  sampleCount: number | null;
}

export async function getPromptTemplates(): Promise<{ templates: PromptTemplate[] }> {
  return request<{ templates: PromptTemplate[] }>('GET', '/v1/templates/prompts');
}

export async function getParamTemplates(): Promise<{ templates: ParamTemplate[] }> {
  return request<{ templates: ParamTemplate[] }>('GET', '/v1/templates/params');
}

export async function createPromptTemplate(data: Partial<PromptTemplate>): Promise<{ template: PromptTemplate }> {
  return request<{ template: PromptTemplate }>('POST', '/v1/templates/prompts', data);
}

export async function updatePromptTemplate(
  templateId: string,
  data: Partial<PromptTemplate>
): Promise<{ template: PromptTemplate }> {
  return request<{ template: PromptTemplate }>('PUT', `/v1/templates/prompts/${templateId}`, data);
}

export async function deletePromptTemplate(templateId: string): Promise<{ message: string }> {
  return request<{ message: string }>('DELETE', `/v1/templates/prompts/${templateId}`);
}

export async function createParamTemplate(data: Partial<ParamTemplate>): Promise<{ template: ParamTemplate }> {
  return request<{ template: ParamTemplate }>('POST', '/v1/templates/params', data);
}

export async function updateParamTemplate(
  templateId: string,
  data: Partial<ParamTemplate>
): Promise<{ template: ParamTemplate }> {
  return request<{ template: ParamTemplate }>('PUT', `/v1/templates/params/${templateId}`, data);
}

export async function deleteParamTemplate(templateId: string): Promise<{ message: string }> {
  return request<{ message: string }>('DELETE', `/v1/templates/params/${templateId}`);
}

// ========== 图片上传 ==========

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/v1/upload/image`, {
    method: 'POST',
    headers: {
      'X-Admin-Key': getAdminKey(),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '上传失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ========== 验证 Admin Key ==========

export async function verifyAdminKey(): Promise<boolean> {
  try {
    await getAdminStats();
    return true;
  } catch {
    return false;
  }
}
