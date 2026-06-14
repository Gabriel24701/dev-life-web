import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-10 w-full rounded-lg border px-3 text-sm
            bg-white dark:bg-zinc-900
            text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            border-zinc-200 dark:border-zinc-800
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? "border-rose-500 focus:ring-rose-500" : ""}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-rose-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
