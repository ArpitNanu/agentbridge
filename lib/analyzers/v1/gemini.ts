/**
 * Interface representing the structured analysis output from Gemini.
 */
export interface CallAnalysisResult {
  summary: string;
  outcome: "resolved" | "unresolved" | "escalated" | "converted";
  sentiment: "positive" | "neutral" | "negative";
}

/**
 * Calls the Google Gemini API using native fetch to perform structured analysis
 * on a voice call transcript.
 */
export async function analyzeTranscript(transcript: string): Promise<CallAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  if (!transcript || transcript.trim() === "") {
    return {
      summary: "Empty transcript. No conversation occurred.",
      outcome: "unresolved",
      sentiment: "neutral",
    };
  }

  // Google Gemini REST API endpoint (using gemini-2.5-flash)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // JSON Schema defining the exact structure Gemini must return
  const responseSchema = {
    type: "OBJECT",
    properties: {
      summary: {
        type: "STRING",
        description: "A concise 2-3 sentence summary explaining why the customer called and what happened during the call."
      },
      outcome: {
        type: "STRING",
        enum: ["resolved", "unresolved", "escalated", "converted"],
        description: "The final resolution status of the call. resolved = issue fixed, unresolved = issue not fixed, escalated = ticket created or transferred to human, converted = sales call closed successfully."
      },
      sentiment: {
        type: "STRING",
        enum: ["positive", "neutral", "negative"],
        description: "The overall customer sentiment during the call."
      }
    },
    required: ["summary", "outcome", "sentiment"]
  };

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Analyze the following voice call transcript. Pay close attention to the customer's issue, how the agent handled it, and the final state of the call.\n\nTranscript:\n${transcript}`
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: "You are a professional voice call quality auditor. Your job is to read transcripts and extract key business metrics. You must return a valid JSON object matching the requested schema. Do not output any markdown formatting, just raw JSON."
        }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Invalid response from Gemini API: Missing candidate content.");
  }

  try {
    const parsed: CallAnalysisResult = JSON.parse(rawText.trim());
    return parsed;
  } catch (error) {
    console.error("Failed to parse Gemini response text as JSON:", rawText);
    throw new Error("Gemini response did not conform to the expected JSON structure.");
  }
}
