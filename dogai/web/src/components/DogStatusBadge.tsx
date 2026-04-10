import { Badge } from "@/components/ui/badge";
import { dogStatusLabel } from "@/lib/utils";

type DogStatus = "AVAILABLE" | "ADOPTED" | "IN_CARE" | "PENDING_ADOPTION";

const variantMap: Record<DogStatus, "available" | "adopted" | "in_care" | "pending"> = {
  AVAILABLE:        "available",
  ADOPTED:          "adopted",
  IN_CARE:          "in_care",
  PENDING_ADOPTION: "pending",
};

export function DogStatusBadge({ status }: { status: string }) {
  const variant = variantMap[status as DogStatus] ?? "gray";
  return <Badge variant={variant}>{dogStatusLabel(status)}</Badge>;
}
