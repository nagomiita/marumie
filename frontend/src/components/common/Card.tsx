import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export default function CardComponent({
  title,
  className = "",
  children,
}: CardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : undefined}>
        {children}
      </CardContent>
    </Card>
  );
}
