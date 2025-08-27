// src/components/form/input/RadioSmCustom.tsx
import React, { forwardRef, InputHTMLAttributes } from "react";

interface RadioSmCustomProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RadioSmCustom = forwardRef<HTMLInputElement, RadioSmCustomProps>(
  ({ id, label, className = "", ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`flex cursor-pointer select-none items-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
      >
        <span className="relative">
          <input
            type="radio"
            id={id}
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <span
            className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border bg-transparent border-gray-300 dark:border-gray-700 peer-checked:border-brand-500 peer-checked:bg-brand-500`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white hidden peer-checked:block"></span>
          </span>
        </span>
        {label}
      </label>
    );
  }
);

RadioSmCustom.displayName = "RadioSmCustom";

export default RadioSmCustom;
