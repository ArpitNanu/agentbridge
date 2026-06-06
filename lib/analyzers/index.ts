import prisma from "@/lib/db";
import { analyzeTranscript } from "./v1/gemini";

/**
 * Runs the analysis pipeline for a given call ID.
 * Fetches the call, calls the V1 Gemini analyzer, and upserts the result into the CallAnalysis table.
 */
export async function runCallAnalysis(callId: string): Promise<void> {
  try {
    console.log(`[Analyzer Pipeline] Starting analysis for call ID: ${callId}`);

    // 1. Fetch the call from the database
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      console.warn(`[Analyzer Pipeline] Call not found for ID: ${callId}`);
      return;
    }

    if (!call.transcript || call.transcript.trim() === "") {
      console.warn(`[Analyzer Pipeline] Call ${callId} has an empty transcript. Skipping analysis.`);
      return;
    }

    // 2. Call the Gemini V1 Analyzer
    const analysisResult = await analyzeTranscript(call.transcript);

    // 3. Save the results to the CallAnalysis table (using upsert for idempotency)
    await prisma.callAnalysis.upsert({
      where: {
        callId: call.id,
      },
      create: {
        callId: call.id,
        summary: analysisResult.summary,
        outcome: analysisResult.outcome,
        sentiment: analysisResult.sentiment,
        metrics: {}, // V2 compatibility slot (defaults to empty object in V1)
      },
      update: {
        summary: analysisResult.summary,
        outcome: analysisResult.outcome,
        sentiment: analysisResult.sentiment,
      },
    });

    console.log(`[Analyzer Pipeline] Successfully analyzed and saved CallAnalysis for call ID: ${callId}`);
  } catch (error) {
    console.error(`[Analyzer Pipeline] Critical error analyzing call ID ${callId}:`, error);
    // We catch and log the error so background execution does not crash the server process,
    // leaving the raw call intact for future retries.
  }
}
