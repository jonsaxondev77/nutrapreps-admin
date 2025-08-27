// src/components/form/input/RadioCustom.tsx
import React, { forwardRef, InputHTMLAttributes } from "react";

interface RadioCustomProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RadioCustom = forwardRef<HTMLInputElement, RadioCustomProps>(
  ({ id, label, className = "", disabled = false, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`relative flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
          disabled
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-400"
        } ${className}`}
      >
        <input
          id={id}
          ref={ref}
          type="radio"
          className="sr-only peer"
          disabled={disabled}
          {...props}
        />
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] bg-transparent border-gray-300 dark:border-gray-700 peer-checked:border-brand-500 peer-checked:bg-brand-500 ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700"
              : ""
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-white hidden peer-checked:block"></span>
        </span>
        {label}
      </label>
    );
  }
);

RadioCustom.displayName = "RadioCustom";

export default RadioCustom;
