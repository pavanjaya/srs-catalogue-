import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Real brochure PDFs run several MB — well past Vercel's fixed 4.5MB
// request-body limit for Functions, which no config can raise. The file
// goes straight from the browser to Blob storage; this route only issues
// the short-lived upload token, never touches the file itself. Also
// issues tokens for the companion cover-page thumbnail (small, but same
// client-upload path for one consistent flow).
const PDF_RE = /^brochures\/[a-zA-Z0-9_-]+--.+\.pdf$/;
const THUMB_RE = /^brochure-thumbs\/[a-zA-Z0-9_-]+\.png$/;

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
        const isThumb = THUMB_RE.test(pathname);
        if (!PDF_RE.test(pathname) && !isThumb) {
          throw new Error("Invalid brochure path.");
        }

        return {
          allowedContentTypes: isThumb ? ["image/png"] : ["application/pdf"],
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {
        revalidatePath("/");
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
