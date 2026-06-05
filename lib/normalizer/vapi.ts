import { StandardCall, CallStatus } from "../../types";

/**
 * Maps Vapi call status to our StandardCall CallStatus.
 */
function mapVapiStatus(status: string): CallStatus {
  switch (status) {
    case "ringing":
      return "started";
    case "in-progress":
      return "connected";
    case "ended":
      return "completed";
    case "failed":
      return "failed";
    default:
      return "completed";
  }
}

/**
 * Normalizes a Vapi webhook payload into a StandardCall format.
 */
export function normalizeVapi(payload: any): StandardCall {
  if (!payload || !payload.message) {
    throw new Error("Invalid Vapi payload: Missing message object");
  }

  const { message } = payload;

  if (message.type !== "end-of-call-report") {
    throw new Error(`Invalid Vapi payload: Expected end-of-call-report, got ${message.type}`);
  }

  const { call, artifact } = message;

  if (!call || !call.id) {
    throw new Error("Invalid Vapi payload: Missing call object or call ID");
  }

  return {
    provider: "vapi",
    providerCallId: call.id,
    status: mapVapiStatus(call.status),
    durationSeconds: typeof call.duration === "number" ? call.duration : undefined,
    transcript: (artifact && artifact.transcript) || "",
    callType: "unknown", // V1 default
    startedAt: call.startedAt ? new Date(call.startedAt) : undefined,
    endedAt: call.endedAt ? new Date(call.endedAt) : undefined,
    rawPayload: payload,
    audioMetadata: {
      recordingUrl: artifact?.recordingUrl,
      cost: call.cost,
      assistantId: call.assistantId,
      customer: call.customer,
      phoneNumberId: call.phoneNumberId,
      messages: artifact?.messages // Useful for message-level timestamps in V2
    }
  };
}
