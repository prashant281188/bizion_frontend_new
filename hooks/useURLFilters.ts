import { useSearchParams, useRouter } from "next/navigation";

export function useURLFilters() {
  const params = useSearchParams();
  const router = useRouter();

  const filters = {
    search: params.get("search") ?? "",
    category: params.get("category") ?? "",
    brand: params.get("brand") ?? "",
    page: Number(params.get("page") ?? 1),
    limit: Number(params.get("limit") ?? 12),
    sort: params.get("sort") ?? "",
  };

  const setFilter = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(params.toString());

    if (!value) newParams.delete(key);
    else newParams.set(key, String(value));

    if (key !== "page") newParams.set("page", "1");

    router.push(`?${newParams.toString()}`);
  };

  return { filters, setFilter };
}