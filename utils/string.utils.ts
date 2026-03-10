export function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function titleCase(value?: string) {
  if (!value) return "";

  return value
    .trim()
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function truncate(value: string, length: number) {
  if (value.length <= length) return value;
  return value.slice(0, length) + "...";
}