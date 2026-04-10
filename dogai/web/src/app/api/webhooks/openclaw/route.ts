import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";


/**
 * OpenClaw webhook — triggered after dog data changes.
 * Revalidates relevant Next.js pages on-demand.
 *
 * Note: On Cloudflare Pages, ISR requires a KV namespace binding named
 * NEXT_CACHE_WORKERS_KV (see wrangler.toml). Without it, pages still refresh
 * every `revalidate` seconds automatically.
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-openclaw-token");
  if (token !== process.env.OPENCLAW_GATEWAY_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const event = body.event as string | undefined;
  const dogId = body.dogId as string | undefined;

  try {
    if (event === "dog.created" || event === "dog.updated") {
      revalidatePath("/");
      revalidatePath("/dogs");
      if (dogId) revalidatePath(`/dogs/${dogId}`);
    } else if (event === "dog.update.created") {
      revalidatePath("/");
      revalidatePath("/updates");
      if (dogId) revalidatePath(`/dogs/${dogId}`);
    } else {
      revalidatePath("/", "layout");
    }
  } catch {
    // revalidatePath requires KV cache store; if not configured, pages
    // will still auto-refresh based on their revalidate interval.
  }

  return NextResponse.json({ revalidated: true });
}
