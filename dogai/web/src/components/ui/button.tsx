"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
        coral:       "bg-coral-500 hover:bg-coral-600 text-white shadow-sm",
        outline:     "border-2 border-primary text-primary hover:bg-primary/10",
        ghost:       "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
      },
      size: {
        sm:        "px-3 py-1.5 text-sm rounded-lg",
        md:        "px-5 py-2.5 text-sm rounded-xl",
        lg:        "px-7 py-3 text-base rounded-xl",
        pill:      "px-6 py-2.5 text-sm rounded-full",
        "pill-lg": "px-8 py-3.5 text-base rounded-full",
        icon:      "size-9 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

function Button({
  className,
  variant,
  size,
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin size-4" />}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
