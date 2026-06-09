import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
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
      transcript: "User: Hi, I'm calling about a billing dispute regarding an overcharge on my monthly statement.\nAgent: I can certainly help with that. Let me look up your account...",
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
      transcript: "User: The pricing tiers are way too expensive for what you offer!\nAgent: We believe our value proposition justifies the cost, sir. Let me explain the features.",
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
      transcript: "User: I need to reschedule an upcoming dental appointment for next Tuesday.\nAgent: Sure thing, let me find an available slot.",
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
      transcript: "User: How does the enterprise integration work?\nAgent: I'd be happy to walk you through our enterprise demo...",
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
      transcript: "User: You guys won't let me return this after 30 days? That's ridiculous! *hangs up*",
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

  console.log(`Successfully seeded ${dummyCalls.length} calls!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
