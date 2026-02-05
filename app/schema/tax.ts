import z from "zod";

const TaxSchema = z.object({
    taxName: z.string(),
    taxValue: z.string()
})

export default TaxSchema

export type TaxSchemaType = z.infer<typeof TaxSchema>