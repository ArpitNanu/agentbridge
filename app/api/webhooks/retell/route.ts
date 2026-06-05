import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { normalizeRetell } from "@/lib/normalizer/retell";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify this is a call_ended event.
    // If it's a call_started or other event, we acknowledge it with 200 but ignore processing.
    if (payload.event !== "call_ended") {
      return NextResponse.json(
        { success: true, message: `Ignored event type: ${payload.event}` },
        { status: 200 }
      );
    }

    // Translate the Retell payload structure into a StandardCall
    const standardCall = normalizeRetell(payload);

    // Save or update the record in our database
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

    return NextResponse.json(
      { success: true, callId: callRecord.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in Retell webhook handler:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Bad Request" },
      { status: 400 }
    );
  }
}
