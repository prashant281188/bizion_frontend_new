import z from "zod";

const HSNSchema = z.object({
    hsnCode: z.string(),
    hsnDescription: z.string()
})

export default HSNSchema

export type HSNSchemaType = z.infer<typeof HSNSchema>