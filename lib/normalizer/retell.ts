import { StandardCall, CallStatus } from "../../types";

/**
 * Maps Retell call_status to our StandardCall CallStatus.
 */
function mapRetellStatus(status: string): CallStatus {
  switch (status) {
    case "started":
      return "started";
    case "connected":
      return "connected";
    case "completed":
      return "completed";
    case "failed":
    case "uncompleted":
      return "failed";
    default:
      return "completed";
  }
}

/**
 * Normalizes a Retell webhook payload into a StandardCall format.
 */
export function normalizeRetell(payload: any): StandardCall {
  if (!payload || !payload.call) {
    throw new Error("Invalid Retell payload: Missing call object");
  }

  const { call } = payload;

  if (!call.call_id) {
    throw new Error("Invalid Retell payload: Missing call_id");
  }

  return {
    provider: "retell",
    providerCallId: call.call_id,
    status: mapRetellStatus(call.call_status),
    durationSeconds: typeof call.duration_ms === "number" ? call.duration_ms / 1000 : undefined,
    transcript: call.transcript || "",
    callType: "unknown", // V1 default
    startedAt: call.start_timestamp ? new Date(call.start_timestamp) : undefined,
    endedAt: call.end_timestamp ? new Date(call.end_timestamp) : undefined,
    rawPayload: payload,
    audioMetadata: {
      recordingUrl: call.recordingURL,
      callSummary: call.callSummary,
      agentId: call.agent_id,
      direction: call.direction,
      fromNumber: call.from_number,
      toNumber: call.to_number,
      metadata: call.metadata // Holds other provider-specific data
    }
  };
}
