import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, leftIcon, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-bold tracking-wide text-slate-700"
          >
            {label}
          </label>
        ) : null}
        <div className="relative flex items-center w-full">
          {leftIcon ? (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={`h-11 w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-xs transition-all duration-150 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100/60 ${
              leftIcon ? "pl-9" : ""
            } ${error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : ""} ${className ?? ""}`}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-xs text-rose-500 font-medium">{error}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

