import { NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildTeachingContentPpt, exportPptFileName } from "@/lib/ppt-export";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser("/content");
  if ("response" in auth) return auth.response;

  try {
    const { id } = await context.params;
    const content = await prisma.teachingContent.findUniqueOrThrow({ where: { id } });
    const fileName = exportPptFileName(content.category, content.title);
    const buffer = await buildTeachingContentPpt({
      courseName: content.category,
      chapterName: content.title,
      body: content.body,
      summary: content.summary
    });

    await prisma.teachingContentExport.create({ data: { contentId: id, format: "PPT", fileName } });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Content-Length": String(buffer.length)
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
