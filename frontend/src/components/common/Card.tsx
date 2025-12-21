import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export default function Card({ title, className = "", children }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-3 md:p-4 ${className}`}>
      {title && (
        <h3 className="text-base md:text-lg font-semibold mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
