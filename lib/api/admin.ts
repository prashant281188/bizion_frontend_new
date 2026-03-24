import { api } from "./axios";

/* ── Types ─────────────────────────────────────────────── */

type ApiResponse<T> = { success: boolean; message: string; data: T };

/* ── Categories ─────────────────────────────────────────── */
export type Category = {
  id: string;
  categoryName: string;
  description?: string | null;
  parentId?: string | null;
};

export async function adminGetCategories(): Promise<Category[]> {
  const res = await api.get<ApiResponse<Category[]>>("/categories?limit=50");
  return res.data.data;
}

export async function adminCreateCategory(payload: { categoryName: string; description?: string; parentId?: string }) {
  const res = await api.post<ApiResponse<Category>>("/categories", payload);
  return res.data;
}

export async function adminUpdateCategory(id: string, payload: { categoryName?: string; description?: string; parentId?: string }) {
  const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
  return res.data;
}

export async function adminDeleteCategory(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
  return res.data;
}

/* ── Brands ─────────────────────────────────────────────── */
export type AdminBrand = {
  id: string;
  brandName: string;
  brandLogo?: string | null;
};

export async function adminGetBrands(): Promise<AdminBrand[]> {
  const res = await api.get<ApiResponse<AdminBrand[]>>("/brands");
  return res.data.data;
}

export async function adminCreateBrand(payload: { brandName: string; brandLogo?: string }) {
  const res = await api.post<ApiResponse<AdminBrand>>("/brands", payload);
  return res.data;
}

export async function adminUpdateBrand(id: string, payload: { brandName?: string; brandLogo?: string }) {
  const res = await api.patch<ApiResponse<AdminBrand>>(`/brands/${id}`, payload);
  return res.data;
}

export async function adminDeleteBrand(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/brands/${id}`);
  return res.data;
}

/* ── HSN ─────────────────────────────────────────────────── */
export type Hsn = {
  id: string;
  hsnCode: string;
  description?: string | null;
  gstRate?: number | null;
};

export async function adminGetHsn(): Promise<Hsn[]> {
  const res = await api.get<ApiResponse<Hsn[]>>("/hsn");
  return res.data.data;
}

export async function adminCreateHsn(payload: { hsnCode: string; description?: string; gstRate?: number }) {
  const res = await api.post<ApiResponse<Hsn>>("/hsn", payload);
  return res.data;
}

export async function adminUpdateHsn(id: string, payload: { hsnCode?: string; description?: string; gstRate?: number }) {
  const res = await api.patch<ApiResponse<Hsn>>(`/hsn/${id}`, payload);
  return res.data;
}

export async function adminDeleteHsn(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/hsn/${id}`);
  return res.data;
}

/* ── GST ─────────────────────────────────────────────────── */
export type GstRate = {
  id: string;
  name: string;
  rate: number;
  description?: string | null;
};

export async function adminGetGst(): Promise<GstRate[]> {
  const res = await api.get<ApiResponse<GstRate[]>>("/gst/rates");
  return res.data.data;
}

export async function adminCreateGst(payload: { name: string; rate: number; description?: string }) {
  const res = await api.post<ApiResponse<GstRate>>("/gst", payload);
  return res.data;
}

export async function adminUpdateGst(id: string, payload: { name?: string; rate?: number; description?: string }) {
  const res = await api.patch<ApiResponse<GstRate>>(`/gst/${id}`, payload);
  return res.data;
}

export async function adminDeleteGst(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/gst/${id}`);
  return res.data;
}

/* ── Units ───────────────────────────────────────────────── */
export type Unit = {
  id: string;
  unitName: string;
  unitSymbol: string;
};

export async function adminGetUnits(): Promise<Unit[]> {
  const res = await api.get<ApiResponse<Unit[]>>("/units");
  return res.data.data;
}

export async function adminCreateUnit(payload: { unitName: string; unitSymbol: string }) {
  const res = await api.post<ApiResponse<Unit>>("/units", payload);
  return res.data;
}

export async function adminUpdateUnit(id: string, payload: { unitName?: string; unitSymbol?: string }) {
  const res = await api.patch<ApiResponse<Unit>>(`/units/${id}`, payload);
  return res.data;
}

export async function adminDeleteUnit(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/units/${id}`);
  return res.data;
}

/* ── Users ───────────────────────────────────────────────── */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
};

export async function adminGetUsers(): Promise<AdminUser[]> {
  const res = await api.get<ApiResponse<AdminUser[]>>("/users");
  return res.data.data;
}

export async function adminCreateUser(payload: { name: string; email: string; password: string; role: string }) {
  const res = await api.post<ApiResponse<AdminUser>>("/users", payload);
  return res.data;
}

export async function adminUpdateUser(id: string, payload: { name?: string; role?: string; isActive?: boolean }) {
  const res = await api.patch<ApiResponse<AdminUser>>(`/users/${id}`, payload);
  return res.data;
}

export async function adminDeleteUser(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/users/${id}`);
  return res.data;
}

export type CreateProductPayload = {
  model: string;
  brandId: string;
  categoryId: string;
  metal?: string;
  sizeType?: string;
  shortDescription?: string;
  description?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  imageUrl?: string;
  options?: { name: string; values: string[] }[];
  variants?: {
    sku: string;
    options?: Record<string, string>;
    packing?: number | null;
    mrp: string;
    saleRate?: string;
    purchaseRate?: string;
    imageUrl?: string;
  }[];
};

/* ── Parties ─────────────────────────────────────────────── */
export type Party = {
  id: string;
  name: string;
  gstin?: string | null;
  contact?: string | null;
  address?: string | null;
  city?: string | null;
  type: string;
  balance?: number | null;
  createdAt?: string;
};

export async function adminGetParties(params?: { search?: string; type?: string }): Promise<Party[]> {
  const res = await api.get<ApiResponse<Party[]>>("/parties", { params });
  return res.data.data;
}

export async function adminGetParty(id: string): Promise<Party> {
  const res = await api.get<ApiResponse<Party>>(`/parties/${id}`);
  return res.data.data;
}

export async function adminCreateParty(payload: Omit<Party, "id" | "createdAt" | "balance">) {
  const res = await api.post<ApiResponse<Party>>("/parties", payload);
  return res.data;
}

export async function adminUpdateParty(id: string, payload: Partial<Omit<Party, "id" | "createdAt">>) {
  const res = await api.patch<ApiResponse<Party>>(`/parties/${id}`, payload);
  return res.data;
}

export async function adminDeleteParty(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/parties/${id}`);
  return res.data;
}

/* ── Upload ────────────────────────────────────────────── */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<ApiResponse<{ url: string }>>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.url;
}

/* ── Products ──────────────────────────────────────────── */
export async function createProduct(payload: CreateProductPayload) {
  const res = await api.post<ApiResponse<{ id: string }>>("/products", payload);
  return res.data;
}

export async function updateProduct(id: string, payload: Partial<CreateProductPayload>) {
  const res = await api.patch<ApiResponse<{ id: string }>>(`/products/${id}`, payload);
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/products/${id}`);
  return res.data;
}
