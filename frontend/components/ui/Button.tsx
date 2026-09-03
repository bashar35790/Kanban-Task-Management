import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "pill" | "pink";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200/50 active:scale-[0.98]",
  pink:
    "bg-pink-500 text-white hover:bg-pink-600 shadow-md shadow-pink-200/50 active:scale-[0.98]",
  secondary:
    "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:scale-[0.98]",
  ghost: "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70",
  danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-200/50 active:scale-[0.98]",
  pill: "bg-indigo-600 text-white hover:bg-indigo-700 rounded-full font-bold shadow-md shadow-indigo-200/50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-xs font-bold rounded-xl",
  md: "h-11 px-5 text-xs font-bold rounded-2xl",
  lg: "h-12 px-6 text-sm font-bold rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
        {...props}
      >
        {loading ? <Spinner className="h-4 w-4" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

