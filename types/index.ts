export type Provider = "retell" | "vapi" | "generic";

export type CallStatus =
  | "started"
  | "connected"
  | "completed"
  | "failed"
  | "transfered";

export interface StandardCall {
  providerCallId: string;
  provider: Provider;
  status: CallStatus;
  durationSeconds?: number;
  transcript?: string;
  callType: string; // Defaults to 'unknown' in V1
  startedAt?: Date;
  endedAt?: Date;
  rawPayload: any; // Entire raw webhook JSON
  audioMetadata?: any; // Raw provider audio/timing metadata
}