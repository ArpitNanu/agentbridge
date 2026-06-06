import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import prisma from "@/lib/db";
import { normalizeVapi } from "@/lib/normalizer/vapi";
import { runCallAnalysis } from "@/lib/analyzers";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify this is an end-of-call-report.
    // If it's a mid-call event, we acknowledge receipt with a 200 but ignore processing.
    if (!payload.message || payload.message.type !== "end-of-call-report") {
      return NextResponse.json(
        { success: true, message: `Ignored message type: ${payload.message?.type || "unknown"}` },
        { status: 200 }
      );
    }

    // Translate the Vapi payload structure into a StandardCall
    const standardCall = normalizeVapi(payload);

    // Save or update the record in our database using upsert
    const callRecord = await prisma.call.upsert({
      where: {
        providerCallId: standardCall.providerCallId,
      },
      create: {
        provider: standardCall.provider,
        providerCallId: standardCall.providerCallId,
        status: standardCall.status,
        durationSeconds: standardCall.durationSeconds,
        transcript: standardCall.transcript,
        callType: standardCall.callType,
        audioMetadata: standardCall.audioMetadata,
        rawPayload: standardCall.rawPayload,
        startedAt: standardCall.startedAt,
        endedAt: standardCall.endedAt,
      },
      update: {
        status: standardCall.status,
        durationSeconds: standardCall.durationSeconds,
        transcript: standardCall.transcript,
        audioMetadata: standardCall.audioMetadata,
        rawPayload: standardCall.rawPayload,
        startedAt: standardCall.startedAt,
        endedAt: standardCall.endedAt,
        updatedAt: new Date(),
      },
    });

    // Run the AI analysis pipeline in the background after the response is sent
    after(async () => {
      await runCallAnalysis(callRecord.id);
    });

    return NextResponse.json(
      { success: true, callId: callRecord.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in Vapi webhook handler:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Bad Request" },
      { status: 400 }
    );
  }
}
