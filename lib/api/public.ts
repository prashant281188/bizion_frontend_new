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
    id: z.uuid(),
    name: z.string(),
    description: z.string().optional()
});


export const brandSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    logo: z.string()
})

export const productSchema = z.object({
    id: z.uuid(),
    model: z.string(),
    metal: z.string(),
    brand: z.string(),
    isActive: z.boolean().optional(),
    category: z.object({
        name: z.string()
    }),
    image: z.string().optional(),
    variants: z.object({
        size: z.string().optional(),
        finish: z.string().optional(),
        rates: z.object({
            mrp: z.string()
        }).array().optional()
    }).array().optional()
})


export const carouselDataSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string(),
    image: z.string(),
    isActive: z.boolean()
})

export type CarouselData = z.infer<typeof carouselDataSchema>;
export type Category = z.infer<typeof publicCategoriesSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type Product = z.infer<typeof productSchema>;

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

export async function getProduct(id: string): Promise<Product> {
    const res = await api.get<ApiResponse<Product>>(`/public/products/${id}`)
    return res.data.data
}

export async function getCarouselData(): Promise<CarouselData[]> {
    const res = await api.get<ApiResponse<CarouselData[]>>("/public/carousel")
    return res.data.data
}

export async function getProductsWithFilter(params: {
    page: number;
    limit: number;
    search?: string
}) {
    const res = await api.get<ApiResponse<Product[]>>("/public/products", { params })
    return res.data
}
