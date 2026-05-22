import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { exportFileName, renderExportHtml, renderPdfUnavailableHtml } from "@/lib/teaching-content";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;

  try {
    const { id } = await context.params;
    const format = (new URL(request.url).searchParams.get("format") === "pdf" ? "PDF" : "WORD") as "WORD" | "PDF";
    const content = await prisma.teachingContent.findUniqueOrThrow({ where: { id } });
    if (format === "PDF") {
      return new NextResponse(renderPdfUnavailableHtml(content.title), {
        status: 501,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    const html = renderExportHtml(content);
    const fileName = exportFileName(content.title, "WORD");
    await prisma.teachingContentExport.create({ data: { contentId: id, format, fileName } });
    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
