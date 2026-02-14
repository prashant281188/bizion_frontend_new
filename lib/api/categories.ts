import { z } from "zod";
import { api } from "./axios";


/* ---------- Schema ---------- */
export const categorySchema = z.object({
  id: z.uuid(),
  category: z.string(),
  description: z.string(),
});

export type Category = z.infer<typeof categorySchema>;

/* ---------- API ---------- */
export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get("/api/categories");
  return z.array(categorySchema).parse(res.data);
}
