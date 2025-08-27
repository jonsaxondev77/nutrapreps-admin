// src/components/form/SelectCustom.tsx
import React, { forwardRef, SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectCustomProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
  error?: boolean;
  hint?: string;
}

const SelectCustom = forwardRef<HTMLSelectElement, SelectCustomProps>(
  ({ options, placeholder = "Select an option", className = "", error = false, hint, ...props }, ref) => {
    
    let selectClasses = `h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

    if (error) {
      selectClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/10`;
    }

    return (
      <div>
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          <option value="" disabled className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {option.label}
            </option>
          ))}
        </select>
        {hint && (
          <p className={`mt-1.5 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

SelectCustom.displayName = "SelectCustom";

export default SelectCustom;
