import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Real brochure PDFs run several MB — well past Vercel's fixed 4.5MB
// request-body limit for Functions, which no config can raise. The file
// goes straight from the browser to Blob storage; this route only issues
// the short-lived upload token, never touches the file itself.
const PATHNAME_RE = /^brochures\/[a-zA-Z0-9_-]+--.+\.pdf$/;

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
        if (!PATHNAME_RE.test(pathname)) {
          throw new Error("Invalid brochure path.");
        }

        return {
          allowedContentTypes: ["application/pdf"],
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
