import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireApiUser } from "@/lib/api";
import { buildReservedPushPayload } from "@/lib/student-service";

export async function POST(request: NextRequest) {
  const auth = await requireApiUser("/student-service");
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const reservedPayload = buildReservedPushPayload({
      title: String(body.title || "学员服务提醒"),
      content: String(body.content || ""),
      receiver: body.receiver ? String(body.receiver) : null,
      channel: body.channel ? String(body.channel) : undefined
    });

    return NextResponse.json({
      status: "RESERVED",
      message: "企业微信/OpenClaw 推送接口已预留，接入密钥和回调后即可替换为真实发送。",
      reservedPayload
    });
  } catch (error) {
    return jsonError(error);
  }
}
