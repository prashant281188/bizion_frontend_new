import z from "zod";

const UnitSchema = z.object({
    unitName: z.string(),
    unitSymbol: z.string()
})

export default UnitSchema

export type UnitSchemaType = z.infer<typeof UnitSchema>