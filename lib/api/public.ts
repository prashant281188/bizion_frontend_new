import { z } from "zod";
import { api } from "./axios";

type ApiResponse<T> = {
    success: boolean,
    message: string,
    data: T,
    meta: meta
}

type meta = {
    page: number,
    limit: number,
    total: number,
    totalPages: number
}

/* ---------- Schema ---------- */
export const publicCategoriesSchema = z.object({
    id: z.string(),
    categoryName: z.string(),
    description: z.string().optional().nullable(),
    parentId: z.string().nullable().optional(),
    children: z.array(z.lazy((): z.ZodTypeAny => publicCategoriesSchema)).optional()
});

export const brandSchema = z.object({
    id: z.string(),
    brandName: z.string(),
    brandLogo: z.string().nullable().optional()
})

export const productSchema = z.object({
    id: z.string(),
    model: z.string(),
    metal: z.string().optional().nullable(),
    shortDescription: z.string().optional().nullable(),
    sizeType: z.string().optional().nullable(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    createdAt: z.string().optional(),
    brand: z.object({
        id: z.string(),
        brandName: z.string(),
        brandLogo: z.string().nullable().optional()
    }),
    category: z.object({
        id: z.string(),
        categoryName: z.string()
    }),
    image: z.object({
        url: z.string()
    }).nullable().optional()
})

export const publicProductDetailSchema = z.object({
    id: z.string(),
    model: z.string(),
    metal: z.string().optional().nullable(),
    shortDescription: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    sizeType: z.string().optional().nullable(),
    status: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    brand: z.object({
        id: z.string(),
        brandName: z.string(),
        brandLogo: z.string().nullable().optional()
    }),
    category: z.object({
        id: z.string(),
        categoryName: z.string()
    }),
    hsn: z.object({ hsnCode: z.string() }).optional().nullable(),
    unit: z.object({
        unitName: z.string(),
        unitSymbol: z.string()
    }).optional().nullable(),
    image: z.object({ url: z.string() }).nullable().optional(),
    options: z.object({
        name: z.string(),
        values: z.string().array()
    }).array().optional(),
    variants: z.object({
        id: z.string(),
        sku: z.string(),
        packing: z.number().optional().nullable(),
        mrp: z.string(),
        saleRate: z.string().optional().nullable(),
        purchaseRate: z.string().optional().nullable(),
        options: z.record(z.string()).optional()
    }).array().optional()
})

export const carouselDataSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    image: z.string(),
    isActive: z.boolean()
})

export const catalogProductSchema = z.object({
    id: z.string(),
    model: z.string(),
    metal: z.string().nullable().optional(),
    shortDescription: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    sizeType: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    status: z.string().optional(),
    brand: z.object({
        id: z.string(),
        brandName: z.string(),
        brandLogo: z.string().nullable().optional(),
    }),
    category: z.object({
        id: z.string(),
        categoryName: z.string(),
    }),
    hsn: z.object({
        hsnCode: z.string(),
        description: z.string().nullable().optional(),
    }).nullable().optional(),
    unit: z.object({
        unitName: z.string(),
        unitSymbol: z.string(),
    }).nullable().optional(),
    image: z.object({ path: z.string() }).nullable().optional(),
    variants: z.array(z.object({
        id: z.string(),
        sku: z.string(),
        packing: z.number().nullable().optional(),
        rates: z.array(z.object({
            mrp: z.string(),
            saleRate: z.string().nullable().optional(),
            purchaseRate: z.string().nullable().optional(),
            createdAt: z.string(),
        })),
        optionValues: z.array(z.object({
            optionValue: z.object({
                optionValue: z.string(),
                position: z.number().optional(),
                option: z.object({ optionName: z.string() }),
            }),
        })),
    })),
})

export type CarouselData = z.infer<typeof carouselDataSchema>;
export type Category = z.infer<typeof publicCategoriesSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductDetail = z.infer<typeof publicProductDetailSchema>;
export type CatalogProduct = z.infer<typeof catalogProductSchema>;

/* ---------- API ---------- */
export async function fetchCategories(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>("/public/categories");
    return z.array(publicCategoriesSchema).parse(res.data.data);
}

export async function getBrands(): Promise<Brand[]> {
    const res = await api.get<ApiResponse<Brand[]>>("/public/brands");
    return res.data.data
}

export async function getProducts(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>("/public/products")
    return res.data.data
}

export async function getProduct(id: string): Promise<ProductDetail> {
    const res = await api.get<ApiResponse<ProductDetail>>(`/public/products/${id}`)
    return res.data.data
}

export async function getCarouselData(): Promise<CarouselData[]> {
    const res = await api.get<ApiResponse<CarouselData[]>>("/public/carousel")
    return res.data.data
}

export async function getCatalog(params: {
    brandId?: string;
    categoryId?: string;
} = {}): Promise<CatalogProduct[]> {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== undefined)
    );
    const res = await api.get<ApiResponse<CatalogProduct[]>>("/public/products/catalog", { params: cleanParams });
    return res.data.data;
}

export async function getProductsWithFilter(params: {
    page: number;
    limit: number;
    search?: string;
    brandId?: string;
    categoryId?: string;
    sort?: string;
}) {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );
    const res = await api.get<ApiResponse<Product[]>>("/public/products", { params: cleanParams })
    return res.data
}
