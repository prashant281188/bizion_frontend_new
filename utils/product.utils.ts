import { CatalogProduct } from "@/lib/api/public";

export function parseOptions(
  optionValues: CatalogProduct["variants"][number]["optionValues"]
): Record<string, string> {
  return Object.fromEntries(
    [...optionValues]
      .sort((a, b) => (a.optionValue.position ?? 0) - (b.optionValue.position ?? 0))
      .map((ov) => [ov.optionValue.option.optionName, ov.optionValue.optionValue])
  );
}
