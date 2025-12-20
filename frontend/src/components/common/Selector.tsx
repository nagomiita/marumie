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
    sm: "px-2 py-1 text-xs",
    md: "px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm",
    lg: "px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-xs md:text-sm",
    lg: "text-sm md:text-base",
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // 数値型の場合は数値に変換
    const convertedValue = (
      typeof value === "number" ? Number(newValue) : newValue
    ) as T;
    onChange(convertedValue);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`font-semibold ${labelSizeClasses[size]} ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={String(value)}
        onChange={handleChange}
        className={`border rounded ${sizeClasses[size]} ${selectClassName}`}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
