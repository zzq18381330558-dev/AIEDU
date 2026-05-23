import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "ok",
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        error: "数据库连接异常，请检查 PostgreSQL 服务和 DATABASE_URL 配置。",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
