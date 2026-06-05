import { StandardCall, CallStatus } from "../../types";

/**
 * Maps generic status string to CallStatus.
 */
function mapGenericStatus(status?: string): CallStatus {
  if (!status) return "completed";
  const s = status.toString().toLowerCase();

  if (s.includes("start")) return "started";
  if (s.includes("progress") || s.includes("connect") || s.includes("active")) return "connected";
  if (s.includes("fail") || s.includes("error") || s.includes("uncompleted")) return "failed";
  if (s.includes("transfer")) return "transfered";

  return "completed";
}

/**
 * Normalizes a generic webhook payload into a StandardCall format.
 * Dynamically looks for common key aliases.
 */
export function normalizeGeneric(payload: any): StandardCall {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid Generic payload: Payload must be a JSON object");
  }

  // 1. Look for call ID: callId, call_id, id, sid
  const providerCallId =
    payload.callId ||
    payload.call_id ||
    payload.id ||
    payload.sid ||
    payload.call_status_id;

  if (!providerCallId) {
    throw new Error(
      "Invalid Generic payload: Missing call identifier (callId, call_id, id, or sid)"
    );
  }

  // 2. Look for transcript: transcript, text, conversation, body
  const transcript =
    payload.transcript ||
    payload.text ||
    payload.conversation ||
    payload.body ||
    "";

  // 3. Look for duration: durationSeconds, duration_seconds, duration, duration_ms
  let durationSeconds: number | undefined;
  const rawDuration =
    payload.durationSeconds ??
    payload.duration_seconds ??
    payload.duration ??
    payload.duration_ms;

  if (typeof rawDuration === "number") {
    // If it's larger than 10,000, it's highly likely to be milliseconds (10 seconds = 10,000ms)
    if (rawDuration > 10000 && (payload.duration_ms || rawDuration % 1000 === 0)) {
      durationSeconds = rawDuration / 1000;
    } else {
      durationSeconds = rawDuration;
    }
  }

  // 4. Look for dates: startedAt, start_timestamp, createdAt, timestamp, started_at
  const rawStart =
    payload.startedAt ||
    payload.start_timestamp ||
    payload.createdAt ||
    payload.timestamp ||
    payload.started_at;

  const rawEnd =
    payload.endedAt ||
    payload.end_timestamp ||
    payload.ended_at;

  const startedAt = rawStart ? new Date(rawStart) : new Date();
  const endedAt = rawEnd ? new Date(rawEnd) : undefined;

  // 5. Look for status: status, state, call_status
  const status = mapGenericStatus(payload.status || payload.state || payload.call_status);

  return {
    provider: "generic",
    providerCallId: String(providerCallId),
    status,
    durationSeconds,
    transcript,
    callType: "unknown", // V1 default
    startedAt,
    endedAt,
    rawPayload: payload,
    audioMetadata: {
      recordingUrl: payload.recordingUrl || payload.recordingURL || payload.audio_url,
      agentId: payload.agentId || payload.agent_id,
      customer: payload.customer || payload.customer_id
    }
  };
}
