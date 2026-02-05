import { z } from 'zod'

const ProductSchema = z.object({
    brand: z.string().min(1, "Not Empty"),
    model: z.string().min(12, "Model name should not be empty"),
    variants: z.array(z.object({
        size: z.string(),
        finish: z.string(),
        packing: z.string(),
        mrp: z.string(),
        salePrice: z.string(),
        purchasePrice: z.string(),
    })).min(2, "At lease 2 variant is necessary"),
    categoryId: z.string().min(1, "not empty"),
    unitId: z.string(),
    hsnId: z.string().min(1),
    taxId: z.string().min(1),
    metal: z.string(),
    manufactureId: z.string()

})



export default ProductSchema

export type ProductSchemaType = z.infer<typeof ProductSchema>