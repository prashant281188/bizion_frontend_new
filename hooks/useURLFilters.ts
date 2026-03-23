import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useURLFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = {
    search: params.get("search") ?? "",
    categoryId: params.get("categoryId") ?? "",
    brandId: params.get("brandId") ?? "",
    page: Number(params.get("page") ?? 1),
    limit: Number(params.get("limit") ?? 12),
    sort: params.get("sort") ?? "",
  };

  const setFilter = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(params.toString());

    if (value === "" || value === 0) newParams.delete(key);
    else newParams.set(key, String(value));

    if (key !== "page") newParams.set("page", "1");

    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return { filters, setFilter };
}
