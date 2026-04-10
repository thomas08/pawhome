import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-input bg-white px-3.5 py-2.5 text-sm transition-colors outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export interface TextareaFieldProps extends React.ComponentProps<"textarea"> {
  label?: string;
  error?: string;
  hint?: string;
}

function TextareaField({ label, error, hint, className, id, ...props }: TextareaFieldProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Textarea id={inputId} className={cn(error && "border-destructive", className)} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export { Textarea, TextareaField };
