import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: string;
  centered?: boolean;
  className?: string;
};

export function SectionHeader({ title, subtitle, centered, className }: Props) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className ?? ""}`}>
      <span className={`mb-3 block h-1 w-12 rounded-full bg-amber-500 ${centered ? "mx-auto" : ""}`} />
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
