import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground",
        secondary:   "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline:     "border border-border text-foreground",
        // Domain-specific variants
        available:   "bg-teal-100 text-teal-700",
        adopted:     "bg-gray-100 text-gray-500",
        in_care:     "bg-amber-100 text-amber-700",
        pending:     "bg-amber-100 text-amber-700",
        teal:        "bg-teal-100 text-teal-700",
        amber:       "bg-amber-100 text-amber-700",
        coral:       "bg-coral-100 text-coral-600",
        gray:        "bg-gray-100 text-gray-600",
        white:       "bg-white/80 text-gray-700 border border-gray-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
