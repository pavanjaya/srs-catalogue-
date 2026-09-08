import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { productCategories } from "@/lib/products";
import { categorySlug } from "@/lib/categorySlug";

// Real brochure PDFs (several MB, real photography) blow past Vercel's
// hard 4.5MB request-body limit for Functions — that limit can't be
// raised, so the file has to go straight from the browser to Blob storage
// instead of through a Server Action / API route body. This route only
// issues the short-lived upload token; the file itself never touches it.
const validPathnames = new Set(productCategories.map((c) => `brochures/${categorySlug(c)}.pdf`));

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Defense in depth — proxy.ts already gates every non-public route
        // behind the admin cookie, but verify again here since this route
        // hands out a write token.
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("srs_admin_session")?.value;
        if (!adminSession || adminSession !== process.env.ADMIN_PASSWORD) {
          throw new Error("Not authenticated.");
        }
        if (!validPathnames.has(pathname)) {
          throw new Error("Unknown category.");
        }

        return {
          allowedContentTypes: ["application/pdf"],
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {
        revalidatePath("/catalogues");
        revalidatePath("/");
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
