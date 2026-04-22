"use client";

import { CatalogProduct } from "@/lib/api/public";
import { parseOptions, titleCase } from "@/utils";

export const VariantTable = ({
  variants,
}: {
  variants: CatalogProduct["variants"];
}) => {
  if (!variants.length) return null;

  const optionNames = [
    ...new Set(
      variants.flatMap((v) =>
        v.optionValues.map((ov) => ov.optionValue.option.optionName)
      )
    ),
  ];

  const hasOptions = optionNames.length > 0;
  const hasPacking = variants.some((v) => v.packing != null);

  return (
    <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-black/5">
      <table className="w-full min-w-[480px] text-xs">
        <thead>
          <tr className="border-b border-black/5 bg-neutral-50 text-left">
            <th className="px-3 py-2 font-semibold text-muted-foreground">SKU</th>
            {hasOptions &&
              optionNames.map((name) => (
                <th key={name} className="px-3 py-2 font-semibold text-muted-foreground">
                  {titleCase(name)}
                </th>
              ))}
            {hasPacking && (
              <th className="px-3 py-2 font-semibold text-muted-foreground">Packing</th>
            )}
            <th className="px-3 py-2 font-semibold text-muted-foreground">MRP</th>
            <th className="px-3 py-2 font-semibold text-muted-foreground">Sale Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 bg-white">
          {variants.map((variant) => {
            const latestRate = variant.rates[0];
            const options = parseOptions(variant.optionValues);
            return (
              <tr key={variant.id} className="transition-colors hover:bg-amber-50/40">
                <td className="px-3 py-2 font-mono font-medium text-gray-700">{variant.sku}</td>
                {hasOptions &&
                  optionNames.map((name) => (
                    <td key={name} className="px-3 py-2 text-gray-600">
                      {options[name] ?? "—"}
                    </td>
                  ))}
                {hasPacking && (
                  <td className="px-3 py-2 text-gray-600">{variant.packing ?? "—"}</td>
                )}
                <td className="px-3 py-2 font-medium text-gray-800">
                  {latestRate ? `₹${latestRate.mrp}` : "—"}
                </td>
                <td className="px-3 py-2 font-medium text-amber-700">
                  {latestRate?.saleRate ? `₹${latestRate.saleRate}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
