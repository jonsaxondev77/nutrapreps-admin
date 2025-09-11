// src/components/form/input/InputField.tsx

"use client";
import React, { forwardRef, InputHTMLAttributes } from "react";
import CloseIcon from "@/icons/CloseIcon";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  hint?: string;
  onClear?: () => void;
  isFetching?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      disabled = false,
      error = false,
      hint,
      onClear,
      isFetching = false,
      ...props
    },
    ref
  ) => {
    const isClearable = onClear && props.value && !isFetching;

    return (
      <div className="relative">
        <input
          ref={ref}
          disabled={disabled || isFetching} // Disable the input while fetching
          className={clsx(
            `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3`,
            {
                "text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700": disabled,
                "text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500": error,
                "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800": !disabled && !error && !isFetching,
                // Updated class for fetching state
                "border-blue-500 shadow-input-glow dark:text-white": isFetching,
                "pr-8": isClearable || isFetching,
            },
          className
          )}
          {...props}
        />
        {(isClearable || isFetching) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isFetching ? (
              <span className="h-4 w-4 text-gray-400 animate-spin">
                {/* Your loader SVG/icon goes here. You can use a dedicated LoaderIcon component as suggested previously. */}
              </span>
            ) : (
              <button
                type="button"
                onClick={onClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                aria-label="Clear search"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {hint && (
          <p
            className={`mt-1.5 text-xs ${
              error ? "text-error-500" : "text-gray-500"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;