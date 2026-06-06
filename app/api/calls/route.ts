import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { interpretQuery } from "@/lib/search";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    // If query is empty or missing, fetch all calls sorted by newest first
    if (!query) {
      const calls = await prisma.call.findMany({
        include: {
          analysis: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ success: true, calls }, { status: 200 });
    }

    // 1. Run the Gemini query interpreter
    const filters = await interpretQuery(query);
    console.log(`[Search API] User query "${query}" interpreted as:`, filters);

    // 2. Build the dynamic Prisma filter object
    const whereClause: any = {};

    // Apply exact sentiment matching (on CallAnalysis relation)
    if (filters.sentiment) {
      whereClause.analysis = {
        sentiment: filters.sentiment,
      };
    }

    // Apply exact callType matching
    if (filters.callType && filters.callType !== "unknown") {
      whereClause.callType = filters.callType;
    }

    // Apply absolute date ranges based on starting timestamps
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (filters.dateRange === "today") {
        whereClause.startedAt = {
          gte: startOfToday,
        };
      } else if (filters.dateRange === "yesterday") {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        whereClause.startedAt = {
          gte: startOfYesterday,
          lt: startOfToday,
        };
      } else if (filters.dateRange === "this_week") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        whereClause.startedAt = {
          gte: sevenDaysAgo,
        };
      } else if (filters.dateRange === "older") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        whereClause.startedAt = {
          lt: sevenDaysAgo,
        };
      }
    }

    // Apply FTS search logic on standard keywords/phrases extracted by Gemini
    if (filters.keywords && filters.keywords.trim() !== "") {
      const formattedKeywords = filters.keywords
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0)
        .map((term) => term.replace(/[^a-zA-Z0-9]/g, "")) // Avoid search character injection syntax errors
        .filter((term) => term.length > 0)
        .join(" & ");

      if (formattedKeywords) {
        whereClause.AND = [
          {
            OR: [
              {
                transcript: {
                  search: formattedKeywords,
                },
              },
              {
                analysis: {
                  summary: {
                    search: formattedKeywords,
                  },
                },
              },
            ],
          },
        ];
      }
    }

    // 3. Execute query with dynamic filters
    const calls = await prisma.call.findMany({
      where: whereClause,
      include: {
        analysis: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, calls, interpretedFilters: filters }, { status: 200 });
  } catch (error: any) {
    console.error("Error executing semantic search:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
