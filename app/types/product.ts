export type ProductModel = {
    id: string

    model: string
    brand?: string
    metal?: string
    description?: string

    categoryId?: string
    taxId: string
    hsnId: string

    images?: string[]

    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

export type ProductVariant = {
    id: string
    productModelId: string

    unitId: string

    size?: string
    sizeType?: string
    packing?: number
    finish?: string

    sku?: string
    images?: string[]

    isActive: boolean
}

export type ProductVariantRate = {
    id: string
    productVariantId: string

    mrp?: number

    purchaseRate?: number

    saleRate?: number
    saleDiscountPercent?: number

    isActive: boolean
}

export type ProductModelImage = {
    product_model_id: string
    image: string
}

export type ProductVariantImage = {
    product_variant_id: string
    image: string
}


export type CreateProductModelDTO = {
    model: string
    brand?: string
    metal?: string
    description?: string
    categoryId?: string
    taxId: string
    hsnId: string
}

export type CreateProductVariantDTO = {
    productModelId: string
    unitId: string
    size?: string
    sizeType?: string
    packing?: number
    finish?: string
}

export type CreateProductVariantRateDTO = {
    productVariantId: string
    mrp?: number
    purchaseRate?: number
    saleRate?: number
    saleDiscountPercent?: number
}
