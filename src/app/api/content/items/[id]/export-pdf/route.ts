import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildTeachingContentPdf, exportPdfFileName } from "@/lib/pdf-export";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;

  try {
    const { id } = await context.params;
    const content = await prisma.teachingContent.findUniqueOrThrow({ where: { id } });
    const fileName = exportPdfFileName(content.title);
    const pdf = await buildTeachingContentPdf({
      title: content.title,
      category: content.category,
      summary: content.summary,
      body: content.body,
      brandName: "教资教研中心",
      year: new Date().getFullYear()
    });
    await prisma.teachingContentExport.create({ data: { contentId: id, format: "PDF", fileName } });
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
