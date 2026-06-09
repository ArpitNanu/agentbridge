import { HeroSearch } from "@/components/dashboard/HeroSearch";
import { CallCard } from "@/components/calls/CallCard";
import prisma from "@/lib/db";
import { interpretQuery } from "@/lib/search";

export default async function Dashboard(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  // Extract searchParams
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";

  // Step 2: Semantic Search (Translate natural language to filters)
  const filters = await interpretQuery(q);

  // Build Prisma Where Clause dynamically
  const whereClause: any = {};
  
  if (filters.sentiment) {
    whereClause.analysis = { ...whereClause.analysis, sentiment: filters.sentiment };
  }
  if (filters.callType && filters.callType !== 'unknown') {
    whereClause.callType = filters.callType;
  }
  
  // Date range handling
  if (filters.dateRange === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    whereClause.startedAt = { gte: today };
  } else if (filters.dateRange === 'yesterday') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    whereClause.startedAt = { gte: yesterday, lt: today };
  }

  // Keyword search (looks in summary and transcript)
  if (filters.keywords) {
    whereClause.OR = [
      { analysis: { summary: { contains: filters.keywords, mode: 'insensitive' } } },
      { transcript: { contains: filters.keywords, mode: 'insensitive' } }
    ];
  }

  // Execute database query with our AI-powered filters
  const calls = await prisma.call.findMany({
    where: whereClause,
    orderBy: {
      startedAt: 'desc',
    },
    take: 50,
    include: {
      analysis: true,
    },
  });

  return (
    <div className="flex flex-col flex-1 pb-12 w-full">
      <HeroSearch />
      
      <div className="max-w-5xl w-full mx-auto px-4 mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Recent Calls</h2>
            <span className="px-2 py-0.5 rounded bg-surface border border-border-subtle text-[10px] font-mono text-zinc-400">
              {calls.length}_CALLS
            </span>
          </div>
          
          <div className="flex items-center rounded-md bg-surface border border-border-subtle p-1">
            <button className="px-4 py-1 rounded bg-white/10 text-white text-sm font-medium">All</button>
            <button className="px-4 py-1 rounded text-zinc-400 hover:text-white text-sm transition-colors">Support</button>
            <button className="px-4 py-1 rounded text-zinc-400 hover:text-white text-sm transition-colors">Sales</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {calls.length === 0 ? (
            <div className="text-zinc-500 text-sm py-16 text-center border border-dashed border-border-subtle rounded-xl">
              No calls found. Send a webhook from Retell or Vapi to populate this list.
            </div>
          ) : (
            calls.map((call) => (
              <CallCard 
                key={call.id} 
                id={call.id}
                provider={call.provider}
                callType={call.callType}
                durationSeconds={call.durationSeconds}
                startedAt={call.startedAt}
                summary={call.analysis?.summary}
                sentiment={call.analysis?.sentiment}
                outcome={call.analysis?.outcome}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
