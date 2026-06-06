export interface SearchFilters {
  sentiment?: "positive" | "neutral" | "negative";
  callType?: "sales" | "support" | "debt" | "healthcare" | "unknown";
  dateRange?: "today" | "yesterday" | "this_week" | "older" | "all";
  keywords?: string;
}

/**
 * Uses Google Gemini 2.5 Flash to translate a natural language search query
 * into structured database filters.
 */
export async function interpretQuery(query: string): Promise<SearchFilters> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Search Interpreter] Missing GEMINI_API_KEY. Falling back to basic keyword search.");
    return { keywords: query };
  }

  if (!query || query.trim() === "") {
    return {};
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // JSON schema directing Gemini exactly how to classify and extract search fields
  const responseSchema = {
    type: "OBJECT",
    properties: {
      sentiment: {
        type: "STRING",
        enum: ["positive", "neutral", "negative"],
        description: "Filter by customer sentiment if explicitly or implicitly requested. E.g. 'angry', 'unhappy', 'frustrated' -> 'negative'; 'happy', 'satisfied', 'pleased' -> 'positive'; 'calm', 'ordinary' -> 'neutral'."
      },
      callType: {
        type: "STRING",
        enum: ["sales", "support", "debt", "healthcare", "unknown"],
        description: "Filter by call category. support/troubleshooting/issues -> 'support'; sales/pitch/lead/buy -> 'sales'; collection/bill/debt -> 'debt'; clinic/doctor/medical -> 'healthcare'."
      },
      dateRange: {
        type: "STRING",
        enum: ["today", "yesterday", "this_week", "older", "all"],
        description: "Filter by date context. today = calls from today, yesterday = calls from yesterday, this_week = calls in the last 7 days, older = calls older than 7 days, all = no date filter specified."
      },
      keywords: {
        type: "STRING",
        description: "Any other keywords, names, or search phrases that are NOT filters. Do not include structural words like 'calls', 'show me', 'find', 'from yesterday', 'angry' which are captured by other filters. E.g. for 'angry support calls from yesterday mentioning pricing', keywords should be 'pricing'."
      }
    }
  };

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Analyze this search query and extract structured database filters:\n\nSearch Query: "${query}"`
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: "You are a professional database search query interpreter. Your job is to translate a user's natural language request into a clean JSON filter object matching the schema. Return ONLY the JSON object. Do not wrap in markdown formatting."
        }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`[Search Interpreter] Gemini API error: ${response.status}`);
      return { keywords: query };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return { keywords: query };
    }

    const parsed: SearchFilters = JSON.parse(rawText.trim());
    return parsed;
  } catch (error) {
    console.error("[Search Interpreter] Failed to parse search terms using Gemini, falling back:", error);
    return { keywords: query };
  }
}
