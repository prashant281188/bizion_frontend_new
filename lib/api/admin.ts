import { api } from "./axios";

/* ── Types ─────────────────────────────────────────────── */
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

type ApiResponse<T> = { success: boolean; message: string; data: T };

/* ── Upload ────────────────────────────────────────────── */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<ApiResponse<{ url: string }>>("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.url;
}

/* ── Products ──────────────────────────────────────────── */
export async function createProduct(payload: CreateProductPayload) {
  const res = await api.post<ApiResponse<{ id: string }>>("/admin/products", payload);
  return res.data;
}

export async function updateProduct(id: string, payload: Partial<CreateProductPayload>) {
  const res = await api.patch<ApiResponse<{ id: string }>>(`/admin/products/${id}`, payload);
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/admin/products/${id}`);
  return res.data;
}
