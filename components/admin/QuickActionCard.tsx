import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  delay?: number;
};

export function QuickActionCard({ label, description, href, icon: Icon, delay = 0 }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 ring-1 ring-black/5 hover:ring-amber-500/30 hover:shadow-md transition-all group animate-stagger"
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-black group-hover:ring-amber-500 transition-all">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
