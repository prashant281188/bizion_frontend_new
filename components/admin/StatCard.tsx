import React from "react";
import Link from "next/link";

type Props = {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
  href?: string;
};

export function StatCard({ label, value, icon: Icon, color, isLoading, href }: Props) {
  const content = (
    <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-5 ring-1 ring-black/5 hover:ring-amber-500/30 hover:shadow-md transition-all group">
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        {isLoading ? (
          <div className="mt-2 h-8 w-16 rounded-lg bg-neutral-100 animate-pulse" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="animate-fade-up block">
      {content}
    </Link>
  ) : (
    <div className="animate-fade-up">{content}</div>
  );
}
