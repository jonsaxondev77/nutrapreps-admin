// src/components/form/input/Checkbox.tsx
import React, { forwardRef, InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", disabled = false, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`flex items-center space-x-3 group cursor-pointer ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <div className="relative w-5 h-5">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            className={`peer w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60 ${className}`}
            disabled={disabled}
            {...props}
          />
          <svg
            className="absolute hidden w-3.5 h-3.5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none peer-checked:block"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
