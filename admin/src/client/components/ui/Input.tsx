"use client";
import "client-only";

import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

interface BaseInputProps {
  error?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  onChange?: (value: string) => void;
}

interface SingleLineInputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  multiline?: false;
}

interface MultiLineInputProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  multiline: true;
}

type InputProps = SingleLineInputProps | MultiLineInputProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      className = "",
      error,
      label,
      id,
      multiline = false,
      rows = 3,
      onChange,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "bg-primary-input text-white border border-primary-border rounded-lg px-3 py-2.5 w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-primary-accent";
    const errorClasses = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "";

    const classes = `${baseClasses} ${errorClasses} ${className}`.trim();

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        {multiline ? (
          <textarea
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            id={id}
            className={classes}
            rows={rows}
            onChange={handleChange}
            {...Object.fromEntries(
              Object.entries(props as MultiLineInputProps).filter(
                ([key]) => key !== "onChange",
              ),
            )}
          />
        ) : (
          <input
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            className={classes}
            onChange={handleChange}
            {...Object.fromEntries(
              Object.entries(props as SingleLineInputProps).filter(
                ([key]) => key !== "onChange",
              ),
            )}
          />
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
