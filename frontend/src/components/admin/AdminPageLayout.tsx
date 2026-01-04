import type { ReactNode } from "react";
import Button from "@/components/common/Button";

interface AdminPageLayoutProps {
  title: string;
  children: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function AdminPageLayout({
  title,
  children,
  action,
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {action && (
          <Button onClick={action.onClick} variant="primary">
            {action.label}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
