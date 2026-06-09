import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log("Cleaning existing calls...");
    await prisma.call.deleteMany();

    console.log("Seeding dummy calls...");

    const dummyCalls = [
      {
        provider: "RETELL",
        providerCallId: "retell_call_1",
        status: "completed",
        callType: "support",
        durationSeconds: 165,
        startedAt: new Date(Date.now() - 3 * 3600 * 1000),
        endedAt: new Date(Date.now() - 3 * 3600 * 1000 + 165000),
        rawPayload: {},
        analysis: {
          create: {
            summary: "Billing dispute regarding overcharge on monthly statement.",
            sentiment: "positive",
            outcome: "resolved"
          }
        }
      },
      {
        provider: "VAPI",
        providerCallId: "vapi_call_1",
        status: "completed",
        callType: "sales",
        durationSeconds: 492,
        startedAt: new Date(Date.now() - 5 * 3600 * 1000),
        endedAt: new Date(Date.now() - 5 * 3600 * 1000 + 492000),
        rawPayload: {},
        analysis: {
          create: {
            summary: "Customer agitated over pricing tiers, agent failed de-escalation.",
            sentiment: "negative",
            outcome: "escalated"
          }
        }
      },
      {
        provider: "RETELL",
        providerCallId: "retell_call_2",
        status: "completed",
        callType: "healthcare",
        durationSeconds: 247,
        startedAt: new Date(Date.now() - 24 * 3600 * 1000),
        endedAt: new Date(Date.now() - 24 * 3600 * 1000 + 247000),
        rawPayload: {},
        analysis: {
          create: {
            summary: "Standard request to reschedule an upcoming dental appointment.",
            sentiment: "neutral",
            outcome: "resolved"
          }
        }
      },
      {
        provider: "VAPI",
        providerCallId: "vapi_call_2",
        status: "completed",
        callType: "sales",
        durationSeconds: 693,
        startedAt: new Date(Date.now() - 25 * 3600 * 1000),
        endedAt: new Date(Date.now() - 25 * 3600 * 1000 + 693000),
        rawPayload: {},
        analysis: {
          create: {
            summary: "Successful enterprise pricing demo walkthrough and deal close.",
            sentiment: "positive",
            outcome: "converted"
          }
        }
      },
      {
        provider: "RETELL",
        providerCallId: "retell_call_3",
        status: "completed",
        callType: "support",
        durationSeconds: 80,
        startedAt: new Date(Date.now() - 48 * 3600 * 1000),
        endedAt: new Date(Date.now() - 48 * 3600 * 1000 + 80000),
        rawPayload: {},
        analysis: {
          create: {
            summary: "Frustration over inflexible return policy, user hung up.",
            sentiment: "negative",
            outcome: "unresolved"
          }
        }
      }
    ];

    for (const callData of dummyCalls) {
      await prisma.call.create({
        data: callData,
      });
    }

    return NextResponse.json({ success: true, count: dummyCalls.length, message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
