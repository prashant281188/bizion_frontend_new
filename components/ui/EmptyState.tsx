import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className ?? ""}`}>
      <Icon className="h-10 w-10 text-neutral-300 mb-3" />
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
