import type React from "react";
import Button from "./Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "color"
  | "date"
  | "checkbox"
  | "select"
  | "textarea";

export interface FormField<T> {
  name: keyof T;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  pattern?: string;
  title?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  rows?: number;
  className?: string;
}

export interface FormProps<T> {
  fields: FormField<T>[];
  formData: T;
  onChange: (data: T) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export default function Form<T extends Record<string, any>>({
  fields,
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "送信",
  cancelLabel = "キャンセル",
  className = "",
}: FormProps<T>) {
  const handleFieldChange = (
    name: keyof T,
    value: string | number | boolean,
  ) => {
    onChange({
      ...formData,
      [name]: value,
    });
  };

  const renderField = (field: FormField<T>) => {
    const fieldValue = formData[field.name];

    switch (field.type) {
      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={String(field.name)}
              checked={!!fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={field.disabled}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor={String(field.name)}
              className="ml-2 block text-sm text-gray-900"
            >
              {field.label}
            </label>
          </div>
        );

      case "select":
        return (
          <div>
            <label
              htmlFor={String(field.name)}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <Select
              value={String(fieldValue ?? "")}
              onValueChange={(value) => handleFieldChange(field.name, value)}
              disabled={field.disabled}
              name={String(field.name)}
              required={field.required}
            >
              <SelectTrigger
                id={String(field.name)}
                className={field.className}
              >
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem
                    key={String(option.value)}
                    value={String(option.value)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "textarea":
        return (
          <div>
            <label
              htmlFor={String(field.name)}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <Textarea
              id={String(field.name)}
              value={String(fieldValue ?? "")}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={field.className}
              required={field.required}
              disabled={field.disabled}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              rows={field.rows || 3}
            />
          </div>
        );

      case "number":
        return (
          <div>
            <label
              htmlFor={String(field.name)}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <Input
              type="number"
              id={String(field.name)}
              value={fieldValue ?? ""}
              onChange={(e) =>
                handleFieldChange(field.name, Number(e.target.value))
              }
              className={field.className}
              required={field.required}
              disabled={field.disabled}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
            />
          </div>
        );

      case "color":
        return (
          <div>
            <label
              htmlFor={String(field.name)}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <Input
              type="color"
              id={String(field.name)}
              value={fieldValue || "#000000"}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`h-10 px-1 py-1 ${field.className || ""}`}
              required={field.required}
              disabled={field.disabled}
            />
          </div>
        );

      default:
        return (
          <div>
            <label
              htmlFor={String(field.name)}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <Input
              type={field.type}
              id={String(field.name)}
              value={String(fieldValue ?? "")}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={field.className}
              required={field.required}
              disabled={field.disabled}
              placeholder={field.placeholder}
              pattern={field.pattern}
              title={field.title}
              minLength={field.minLength}
              maxLength={field.maxLength}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={String(field.name)}>{renderField(field)}</div>
      ))}

      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
