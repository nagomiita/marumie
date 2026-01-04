import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectorOption<T = string | number> {
  value: T;
  label: string;
}

export interface SelectorProps<T = string | number> {
  id?: string;
  label?: string;
  value: T;
  options: SelectorOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  size?: "sm" | "md" | "lg";
}

export default function Selector<T extends string | number = string | number>({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
  labelClassName = "",
  selectClassName = "",
  size = "md",
}: SelectorProps<T>) {
  const sizeClasses = {
    sm: "h-7 text-xs",
    md: "h-9 text-xs md:text-sm",
    lg: "h-11 text-sm md:text-base",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-xs md:text-sm",
    lg: "text-sm md:text-base",
  };

  const handleChange = (newValue: string) => {
    const convertedValue = (
      typeof value === "number" ? Number(newValue) : newValue
    ) as T;
    onChange(convertedValue);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "font-semibold",
            labelSizeClasses[size],
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <Select value={String(value)} onValueChange={handleChange}>
        <SelectTrigger
          id={id}
          className={cn(sizeClasses[size], selectClassName)}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
