import { api } from "./axios";

/* ── Types ─────────────────────────────────────────────── */

type ApiResponse<T> = { success: boolean; message: string; data: T };

/* ── Orders ─────────────────────────────────────────── */


/* ── Categories ─────────────────────────────────────────── */
export type Category = {
  id: string;
  categoryName: string;
  description?: string | null;
  parentId?: string | null;
  categoryImage?: string | null;
  isActive?: boolean;
  order?: number | null;
};

export type CreateCategoryPayload = {
  categoryName: string;
  parentId?: string;
  description?: string;
  isActive?: boolean;
  categoryImage?: string;
  order?: number;
};

export type UpdateCategoryPayload = {
  categoryName?: string;
  parentId?: string;
  description?: string;
  categoryImage?: string;
  order?: number;
  isActive?: boolean;
};

export async function adminGetCategories(): Promise<Category[]> {
  const res = await api.get<ApiResponse<Category[]>>("/categories?limit=50");
  return res.data.data;
}

export async function adminCreateCategory(
  payload: CreateCategoryPayload,
  imageFile?: File,
) {
  if (imageFile) {
    const fd = new FormData();
    fd.append("categoryImage", imageFile);
    fd.append("categoryName", payload.categoryName);
    if (payload.description) fd.append("description", payload.description);
    if (payload.parentId) fd.append("parentId", payload.parentId);
    if (payload.isActive !== undefined) fd.append("isActive", String(payload.isActive));
    if (payload.order !== undefined) fd.append("order", String(payload.order));
    const res = await api.post<ApiResponse<Category>>("/categories", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.post<ApiResponse<Category>>("/categories", payload);
  return res.data;
}

export async function adminUpdateCategory(
  id: string,
  payload: UpdateCategoryPayload,
  imageFile?: File,
) {
  if (imageFile) {
    const fd = new FormData();
    fd.append("image", imageFile);
    if (payload.categoryName) fd.append("categoryName", payload.categoryName);
    if (payload.description) fd.append("description", payload.description);
    if (payload.parentId) fd.append("parentId", payload.parentId);
    if (payload.isActive !== undefined) fd.append("isActive", String(payload.isActive));
    if (payload.order !== undefined) fd.append("order", String(payload.order));
    const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
  return res.data;
}

export async function adminDeleteCategory(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
  return res.data;
}

/* ── Options ─────────────────────────────────────────────── */
export type ProductOption = {
  id: string;
  optionName: string;
};

export async function adminGetOptions(): Promise<ProductOption[]> {
  const res = await api.get<ApiResponse<ProductOption[]>>("/options");
  return res.data.data;
}

export async function adminCreateOption(optionName: string): Promise<ProductOption> {
  const res = await api.post<ApiResponse<ProductOption>>("/options", { optionName });
  return res.data.data;
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

export async function adminCreateBrand(
  payload: { brandName: string },
  imageFile?: File,
) {
  if (imageFile) {
    const fd = new FormData();
    fd.append("image", imageFile);
    fd.append("brandName", payload.brandName);
    const res = await api.post<ApiResponse<AdminBrand>>("/brands", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.post<ApiResponse<AdminBrand>>("/brands", payload);
  return res.data;
}

export async function adminUpdateBrand(
  id: string,
  payload: { brandName?: string },
  imageFile?: File,
) {
  if (imageFile) {
    const fd = new FormData();
    fd.append("image", imageFile);
    if (payload.brandName) fd.append("brandName", payload.brandName);
    const res = await api.patch<ApiResponse<AdminBrand>>(`/brands/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.patch<ApiResponse<AdminBrand>>(`/brands/${id}`, payload);
  return res.data;
}

export async function adminDeleteBrand(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/brands/${id}`);
  return res.data;
}

/* ── HSN ─────────────────────────────────────────────────── */
export type HsnCurrentGst = {
  gstHistoryId: string;
  assignedFrom: string;
  groupId: string;
  groupName: string;
  rateId: string;
  cgst: string;
  sgst: string;
  igst: string;
  rateEffectiveFrom: string;
};

export type Hsn = {
  id: string;
  hsnCode: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  currentGst: HsnCurrentGst | null;
};

export type HsnGstHistoryEntry = {
  id: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isCurrent: boolean;
  gstGroup: {
    id: string;
    name: string;
    isActive: boolean;
    currentRate: {
      id: string;
      cgst: string;
      sgst: string;
      igst: string;
      effectiveFrom: string;
    } | null;
  };
};

export type HsnDetail = Hsn & { gstHistory: HsnGstHistoryEntry[] };
export type CreateHsnPayload = { hsnCode: string; description?: string };
export type UpdateHsnPayload = { description?: string; isActive?: boolean };
export type AssignHsnGstPayload = { gstGroupId: string; effectiveFrom: string; effectiveTo?: string | null };
export type ListHsnParams = { page?: number; limit?: number; search?: string; isActive?: boolean };

export async function adminGetHsn(params?: ListHsnParams): Promise<{
  data: Hsn[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await api.get<{ success: boolean; data: Hsn[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/hsn", { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function adminGetHsnDetail(id: string): Promise<HsnDetail> {
  const res = await api.get<ApiResponse<HsnDetail>>(`/hsn/${id}`);
  return res.data.data;
}

export async function adminCreateHsn(payload: CreateHsnPayload) {
  const res = await api.post<ApiResponse<Hsn>>("/hsn", payload);
  return res.data;
}

export async function adminUpdateHsn(id: string, payload: UpdateHsnPayload) {
  const res = await api.patch<ApiResponse<Hsn>>(`/hsn/${id}`, payload);
  return res.data;
}

export async function adminDeleteHsn(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/hsn/${id}`);
  return res.data;
}

export async function adminAssignHsnGst(hsnId: string, payload: AssignHsnGstPayload) {
  const res = await api.post<ApiResponse<HsnGstHistoryEntry>>(`/hsn/${hsnId}/gst`, payload);
  return res.data;
}

export async function adminDeleteHsnGst(hsnId: string, historyId: string) {
  const res = await api.delete<ApiResponse<null>>(`/hsn/${hsnId}/gst/${historyId}`);
  return res.data;
}

/* ── GST Groups & Rates ──────────────────────────────────── */
export type GstRateRow = {
  id: string;
  cgst: string;
  sgst: string;
  igst: string;
  effectiveFrom: string;
  effectiveTo: string | null;
};

export type GstGroup = {
  id: string;
  name: string;
  isActive: boolean;
  rates: GstRateRow[];
};

export async function adminGetGstGroups(params?: { page?: number; limit?: number; search?: string }): Promise<GstGroup[]> {
  const res = await api.get<ApiResponse<GstGroup[]>>("/gst/groups", { params });
  return res.data.data;
}

export async function adminCreateGstGroup(payload: { name: string; isActive?: boolean }) {
  const res = await api.post<ApiResponse<GstGroup>>("/gst/groups", payload);
  return res.data;
}

export async function adminUpdateGstGroup(id: string, payload: { name?: string; isActive?: boolean }) {
  const res = await api.patch<ApiResponse<GstGroup>>(`/gst/groups/${id}`, payload);
  return res.data;
}

export async function adminDeleteGstGroup(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/gst/groups/${id}`);
  return res.data;
}

export async function adminCreateGstRate(payload: { gstGroupId: string; cgst: number; sgst: number; igst: number; effectiveFrom: string; effectiveTo?: string | null }) {
  const res = await api.post<ApiResponse<GstRateRow>>("/gst/rates", payload);
  return res.data;
}

export async function adminUpdateGstRate(id: string, payload: { cgst?: number; sgst?: number; igst?: number; effectiveFrom?: string }) {
  const res = await api.patch<ApiResponse<GstRateRow>>(`/gst/rates/${id}`, payload);
  return res.data;
}

export async function adminDeleteGstRate(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/gst/rates/${id}`);
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
export type Permission = {
  id: string;
  code: string;            // e.g. "products:read"
  description?: string | null;
  createdAt?: string;
};

export type RolePermission = {
  id?: string;
  permissionId?: string;
  code?: string;
  name?: string;
  description?: string | null;
};

export type AdminRole = {
  id: string;
  name: string;
  permissions?: RolePermission[];
};

export async function adminGetPermissions(): Promise<Permission[]> {
  // Fetch all pages
  const first = await api.get<{ success: boolean; data: Permission[]; meta: { totalPages: number } }>("/permissions?limit=100&page=1");
  const { data, meta } = first.data;
  if (meta.totalPages <= 1) return data;
  const rest = await Promise.all(
    Array.from({ length: meta.totalPages - 1 }, (_, i) =>
      api.get<{ success: boolean; data: Permission[] }>(`/permissions?limit=100&page=${i + 2}`)
        .then((r) => r.data.data)
    )
  );
  return [...data, ...rest.flat()];
}

export async function adminCreateRole(payload: { name: string }) {
  const res = await api.post<ApiResponse<AdminRole>>("/roles", payload);
  return res.data;
}

export async function adminUpdateRole(id: string, payload: { name: string }) {
  const res = await api.patch<ApiResponse<AdminRole>>(`/roles/${id}`, payload);
  return res.data;
}

export async function adminAssignPermissions(
  roleId: string,
  payload: { add?: string[]; remove?: string[] },
) {
  const res = await api.patch<ApiResponse<AdminRole>>(`/roles/${roleId}/permissions`, payload);
  return res.data;
}

export async function adminDeleteRole(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/roles/${id}`);
  return res.data;
}

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  roleId: string;
  role: string | { id: string; name: string };
  isActive: boolean;
  createdAt?: string;
};

export async function adminGetRoles(): Promise<AdminRole[]> {
  const res = await api.get<ApiResponse<AdminRole[]>>("/roles");
  return res.data.data;
}

export async function adminGetRole(id: string): Promise<AdminRole> {
  const res = await api.get<ApiResponse<AdminRole>>(`/roles/${id}`);
  return res.data.data;
}

export async function adminGetUsers(): Promise<AdminUser[]> {
  const res = await api.get<ApiResponse<AdminUser[]>>("/users");
  return res.data.data;
}

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
};

export async function adminCreateUser(payload: CreateUserPayload) {
  const res = await api.post<ApiResponse<AdminUser>>("/users", payload);
  return res.data;
}

export async function adminUpdateUser(id: string, payload: UpdateUserPayload) {
  const res = await api.patch<ApiResponse<AdminUser>>(`/users/${id}`, payload);
  return res.data;
}

export async function adminDeleteUser(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/users/${id}`);
  return res.data;
}

/* ── Product types ───────────────────────────────────────── */
export type VariantRate = {
  mrp?: number;
  purchaseRate?: number;
  saleRate?: number;
};

export type CreateVariantPayload = {
  sku?: string;
  barcode?: string;
  packing?: number | null;
  isActive?: boolean;
  rates?: VariantRate;
  optionValueIds?: string[];
};

export type UpdateVariantPayload = CreateVariantPayload & {
  id?: string; // present = update existing; absent = create new
};

export type CreateProductPayload = {
  model: string;
  categoryId: string;
  brandId?: string;
  hsnId?: string;
  unitId?: string;
  metal?: string;
  sizeType?: string;
  shortDescription?: string;
  description?: string;
  slug?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  status?: "draft" | "active" | "archived";
  variants?: CreateVariantPayload[];
};

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "variants">> & {
  variants?: UpdateVariantPayload[];
  deleteVariantIds?: string[];
  deleteVariantImageIds?: string[];
};

export type AdminProductVariant = {
  id: string;
  sku: string | null;
  barcode: string | null;
  packing: string | null;
  isActive: boolean;
  rate: {
    mrp: string | null;
    saleRate: string | null;
    purchaseRate: string | null;
    effectiveFrom: string;
  } | null;
  optionValues: {
    optionValue: {
      optionValue: string;
      position: number;
      option: { optionName: string };
    };
  }[];
  images: {
    id: string;
    url: { url: string };
    alt: string | null;
    position: number;
    isPrimary: boolean;
  }[];
};

export type AdminProductDetail = {
  id: string;
  model: string;
  metal: string | null;
  sizeType: string | null;
  slug: string | null;
  shortDescription: string | null;
  description: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  status: "draft" | "active" | "archived";
  brandId: string | null;
  categoryId: string;
  hsnId: string | null;
  unitId: string | null;
  imageId: string | null;
  brand: { brandName: string; brandLogo?: string | null } | null;
  category: { categoryName: string };
  hsn: { id: string; hsnCode: string; description: string | null; currentGst: HsnCurrentGst | null } | null;
  unit: { unitName: string; unitSymbol: string } | null;
  image: { url: string } | null;
  variants: AdminProductVariant[];
};

/* ── Parties ─────────────────────────────────────────────── */
export type PartyType = "retailer" | "supplier" | "customer" | "distributor";
export type GstRegistrationType = "regular" | "composition" | "unregistered" | "consumer" | "sez" | "overseas";

export type Party = {
  id: string;
  name: string;
  tradeName?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  altPhone?: string | null;
  email?: string | null;
  // Address
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  stateCode?: string | null;
  pincode?: string | null;
  country?: string | null;
  // Party type
  type: PartyType;
  // GST
  gstNo?: string | null;
  gstRegistrationType?: GstRegistrationType | null;
  panNo?: string | null;
  isRcmApplicable?: boolean | null;
  ecomGstin?: string | null;
  // Banking
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  notes?: string | null;
  isActive?: boolean;
  balance?: number | null;
  createdAt?: string;
};

export type CreatePartyPayload = {
  name: string;
  tradeName?: string;
  contactPerson?: string;
  phone?: string;
  altPhone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  country?: string;
  type: PartyType;
  gstNo?: string;
  gstRegistrationType?: GstRegistrationType;
  panNo?: string;
  isRcmApplicable?: boolean;
  ecomGstin?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankBranch?: string;
  notes?: string;
  isActive?: boolean;
};

export type UpdatePartyPayload = Partial<CreatePartyPayload>;

export type ListPartyParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartyType;
  gstRegistrationType?: GstRegistrationType;
  state?: string;
  stateCode?: string;
  isActive?: boolean;
};

export async function adminGetParties(params?: ListPartyParams): Promise<Party[]> {
  const res = await api.get<ApiResponse<Party[]>>("/parties", { params });
  return res.data.data;
}

export async function adminGetParty(id: string): Promise<Party> {
  const res = await api.get<ApiResponse<Party>>(`/parties/${id}`);
  return res.data.data;
}

export async function adminCreateParty(payload: CreatePartyPayload) {
  const res = await api.post<ApiResponse<Party>>("/parties", payload);
  return res.data;
}

export async function adminUpdateParty(id: string, payload: UpdatePartyPayload) {
  const res = await api.patch<ApiResponse<Party>>(`/parties/${id}`, payload);
  return res.data;
}

export async function adminDeleteParty(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/parties/${id}`);
  return res.data;
}

/* ── Carousel ────────────────────────────────────────────── */
export type AdminCarousel = {
  id: string;
  title: string | null;
  description: string | null;
  image: string | null;
  isActive: boolean;
};

export async function adminGetCarousel(): Promise<AdminCarousel[]> {
  const res = await api.get<ApiResponse<AdminCarousel[]>>("/carousel");
  return res.data.data;
}

export async function adminCreateCarousel(formData: FormData) {
  const res = await api.post<ApiResponse<AdminCarousel>>("/carousel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function adminUpdateCarousel(
  id: string,
  payload: { title?: string; description?: string; isActive?: boolean },
  imageFile?: File,
) {
  if (imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (payload.title !== undefined) formData.append("title", payload.title);
    if (payload.description !== undefined) formData.append("description", payload.description);
    if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));
    const res = await api.patch<ApiResponse<AdminCarousel>>(`/carousel/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.patch<ApiResponse<AdminCarousel>>(`/carousel/${id}`, payload);
  return res.data;
}

export async function adminDeleteCarousel(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/carousel/${id}`);
  return res.data;
}

/* ── Inventory ───────────────────────────────────────────── */
export type InventoryItem = {
  id: string;
  productVariantId: string;
  quantity: number;
  updatedAt?: string;
  variant?: {
    id: string;
    sku: string;
    packing?: number | null;
    options?: Record<string, string>;
    product?: {
      id: string;
      model: string;
      brand?: { brandName: string };
      category?: { categoryName: string };
    };
  };
};

export type StockMovement = {
  id: string;
  inventoryId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note?: string | null;
  createdAt: string;
};

export type AdjustStockPayload = {
  productVariantId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note?: string;
};


export type Skus = {
  id: string;
  sku: string;
  productId: string;
}

export type VariantDetail = {
  sku: string | null;
  packing: number | null;
  rates: {
    mrp: string | null;
    purchaseRate: string | null;
    saleRate: string | null;
    createdAt: Date;
  }[];
}

export async function adminGetVariantDetail(variantId: string): Promise<VariantDetail> {
  const res = await api.get<ApiResponse<VariantDetail>>(`/variants/${variantId}/rate_qty`);
  return res.data.data;
}

export async function adminGetSkus(params?: { search?: string }): Promise<Skus[]> {
  const res = await api.get<ApiResponse<Skus[]>>("/variants/skus", { params })
  return res.data.data
}
export async function adminGetInventory(params?: { search?: string }): Promise<InventoryItem[]> {
  const res = await api.get<ApiResponse<InventoryItem[]>>("/inventory", { params });
  return res.data.data;
}

export async function adminAdjustStock(payload: AdjustStockPayload) {
  const res = await api.post<ApiResponse<InventoryItem>>("/inventory/adjust", payload);
  return res.data;
}

export async function adminGetStockMovements(productVariantId: string): Promise<StockMovement[]> {
  const res = await api.get<ApiResponse<StockMovement[]>>(`/inventory/movements/${productVariantId}`);
  return res.data.data;
}

/* ── Orders ──────────────────────────────────────────────── */
export type OrderItem = {
  id: string;
  productVariantId: string;
  sku: string | null;
  packing: string | null;
  boxQty: number;
  orderQty: string | null;
  rate: string;
  amount: string | null;
  variant?: {
    sku: string;
    packing?: number | null;
    options?: Record<string, string>;
    product?: { model: string };
  };
};

export type Order = {
  partyId: string;
  salesmanId: string;
  orderType: "purchase" | "sale";
  status: "draft" | "confirmed" | "partial" | "completed" | "cancelled";
  notes: string | null;
  id: string;
  orderDate: string;
  createdAt: Date;
  updatedAt: Date;
  orderNumber: string;
  totalAmount: string;
  items: OrderItem[];
  party: {
    id: string;
    name: string;
    phone: string | null;
    city: string | null;
  };
  salesman: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export type CreateOrderPayload = {
  orderType: "sale" | "purchase";
  orderDate: string;
  partyId: string;
  notes?: string;
  items: {
    productId: string;
    variantId: string;
    sku: string;
    boxQty: number;
    packing: number;
    orderQty?: number;
    rate: number;
    amount: number;
    notes?: string;
  }[];
};

export async function adminGetNextOrderNumber(orderType: "sale" | "purchase"): Promise<string> {
  const res = await api.get<ApiResponse<{ orderNumber: string }>>(`/orders/next-number?orderType=${orderType}`);
  return res.data.data.orderNumber;
}

export async function adminGetOrders(): Promise<Order[]> {
  const res = await api.get<ApiResponse<Order[]>>("/orders");
  return res.data.data;
}

export async function adminGetOrder(id: string): Promise<Order> {
  const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return res.data.data;
}

export async function adminGetPartyOrders(partyId: string): Promise<Order[]> {
  const res = await api.get<ApiResponse<Order[]>>(`/orders?partyId=${partyId}`);
  return res.data.data;
}

export async function adminCreateOrder(payload: CreateOrderPayload) {
  const res = await api.post<ApiResponse<Order>>("/orders", payload);
  return res.data;
}

export async function adminUpdateOrderStatus(id: string, status: Order["status"]) {
  const res = await api.patch<ApiResponse<Order>>(`/orders/${id}`, { status });
  return res.data.data;
}

export async function adminDeleteOrder(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/orders/${id}`);
  return res.data;
}

/* ── Dispatches ───────────────────────────────────────────── */

export type DispatchItem = {
  id: string;
  dispatchId: string;
  orderItemId: string | null;
  variantId: string | null;
  totalQty: string | null;
  variant?: { sku: string | null; product?: { model: string } | null };
};

export type Dispatch = {
  id: string;
  dispatchNumber: string;
  orderId: string | null;
  dispatchedAt: string | null;
  notes: string | null;
  nop: number | null;
  transport: string | null;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: string | null;
  updatedAt: string | null;
  items: DispatchItem[];
};

export type CreateDispatchPayload = {
  dispatchNumber: string;
  orderId?: string;
  dispatchedAt: string;
  notes?: string;
  nop?: number;
  transport?: string;
  items: { orderItemId: string; variantId?: string; totalQty: number }[];
};

export async function adminGetDispatches(): Promise<Dispatch[]> {
  const res = await api.get<ApiResponse<Dispatch[]>>("/dispatches");
  return res.data.data;
}

export async function adminGetOrderDispatches(orderId: string): Promise<Dispatch[]> {
  const res = await api.get<ApiResponse<Dispatch[]>>(`/dispatches?orderId=${orderId}`);
  return res.data.data;
}

export async function adminCreateDispatch(payload: CreateDispatchPayload): Promise<Dispatch> {
  const res = await api.post<ApiResponse<Dispatch>>("/dispatches", payload);
  return res.data.data;
}

/* ── Purchase Receipts ────────────────────────────────────── */

export type ReceiptItem = {
  id: string;
  receiptId: string;
  variantId: string | null;
  orderId: string | null;
  totalQty: string | null;
  variant?: { sku: string | null; product?: { model: string } | null };
};

export type PurchaseReceipt = {
  id: string;
  orderId: string | null;
  receivedDate: string | null;
  createdAt: string | null;
  items: ReceiptItem[];
  order?: { orderNumber: string };
};

export type CreateReceiptPayload = {
  orderId?: string;
  receivedDate: string;
  items: { variantId: string; orderId?: string; totalQty: number }[];
};

export async function adminGetReceipts(): Promise<PurchaseReceipt[]> {
  const res = await api.get<ApiResponse<PurchaseReceipt[]>>("/receipts");
  return res.data.data;
}

export async function adminGetOrderReceipts(orderId: string): Promise<PurchaseReceipt[]> {
  const res = await api.get<ApiResponse<PurchaseReceipt[]>>(`/receipts?orderId=${orderId}`);
  return res.data.data;
}

export async function adminCreateReceipt(payload: CreateReceiptPayload): Promise<PurchaseReceipt> {
  const res = await api.post<ApiResponse<PurchaseReceipt>>("/receipts", payload);
  return res.data.data;
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
export type AdminProductListItem = {
  id: string;
  model: string;
  metal: string | null;
  sizeType: string | null;
  isActive: boolean;
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  brand: { brandName: string } | null;
  category: { categoryName: string };
  image: { url: string } | null;
};

export type ListProductParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: "draft" | "active" | "archived";
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  sortBy?: "model" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export async function adminListProducts(params?: ListProductParams): Promise<{
  data: AdminProductListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await api.get<{
    success: boolean;
    data: AdminProductListItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>("/products", { params });
  return { data: res.data.data, meta: res.data.meta };
}

export async function adminGetProduct(id: string): Promise<AdminProductDetail> {
  const res = await api.get<ApiResponse<AdminProductDetail>>(`/products/${id}`);
  return res.data.data;
}

function appendProductFields(fd: FormData, payload: CreateProductPayload | UpdateProductPayload) {
  if ("model" in payload && payload.model) fd.append("model", payload.model);
  if (payload.categoryId) fd.append("categoryId", payload.categoryId);
  if (payload.brandId) fd.append("brandId", payload.brandId);
  if (payload.hsnId) fd.append("hsnId", payload.hsnId);
  if (payload.unitId) fd.append("unitId", payload.unitId);
  if (payload.metal) fd.append("metal", payload.metal);
  if (payload.sizeType) fd.append("sizeType", payload.sizeType);
  if (payload.shortDescription) fd.append("shortDescription", payload.shortDescription);
  if (payload.description) fd.append("description", payload.description);
  if (payload.slug) fd.append("slug", payload.slug);
  if (payload.isFeatured !== undefined) fd.append("isFeatured", String(payload.isFeatured));
  if (payload.isNew !== undefined) fd.append("isNew", String(payload.isNew));
  if (payload.isActive !== undefined) fd.append("isActive", String(payload.isActive));
  if (payload.status) fd.append("status", payload.status);
  if (payload.variants?.length) fd.append("variants", JSON.stringify(payload.variants));
}

export async function createProduct(
  payload: CreateProductPayload,
  productFile?: File | null,
  /** Files indexed to match variants array order */
  variantFiles?: (File | null)[],
) {
  const fd = new FormData();
  appendProductFields(fd, payload);
  if (productFile) fd.append("productImage", productFile);
  variantFiles?.forEach((f) => { if (f) fd.append("variantImages", f); });
  const res = await api.post<ApiResponse<{ id: string }>>("/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
  productFile?: File | null,
  /**
   * All variant image files in one flat array.
   * New-variant files come first (matched by creation order on backend).
   * Existing-variant files come after, referenced by `variantImageMappings`.
   */
  variantImageFiles?: File[],
  /** Maps each existing-variant file to its variantId: { variantId, fileIndex } */
  variantImageMappings?: { variantId: string; fileIndex: number }[],
) {
  const fd = new FormData();
  appendProductFields(fd, payload);
  if (payload.deleteVariantIds?.length)
    fd.append("deleteVariantIds", JSON.stringify(payload.deleteVariantIds));
  if (payload.deleteVariantImageIds?.length)
    fd.append("deleteVariantImageIds", JSON.stringify(payload.deleteVariantImageIds));
  if (variantImageMappings?.length)
    fd.append("variantImageMappings", JSON.stringify(variantImageMappings));
  if (productFile) fd.append("productImage", productFile);
  variantImageFiles?.forEach((f) => fd.append("variantImages", f));
  const res = await api.patch<ApiResponse<{ id: string }>>(`/products/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await api.delete<ApiResponse<null>>(`/products/${id}`);
  return res.data;
}
