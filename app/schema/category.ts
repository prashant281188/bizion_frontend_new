import z from "zod";

const CategorySchema = z.object({
    categoryName: z.string(),
    categorySymbol: z.string(),
    categoryColor: z.string()
})

export default CategorySchema

export type CategorySchemaType = z.infer<typeof CategorySchema>