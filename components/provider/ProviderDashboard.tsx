import { MetricCard } from "./MetricCard";
import { CallCard } from "../calls/CallCard";
import { ProviderBadge } from "../ui/Badge";
import prisma from "@/lib/db";
import { Activity, Clock, PhoneCall, AlertTriangle } from "lucide-react";

export async function ProviderDashboard({ provider }: { provider: string }) {
  // Fetch calls specific to this provider
  const calls = await prisma.call.findMany({
    where: {
      provider: provider.toUpperCase(),
    },
    orderBy: {
      startedAt: 'desc',
    },
    take: 50,
    include: {
      analysis: true,
    },
  });

  // Calculate Metrics dynamically
  const totalCalls = calls.length;
  
  // Calculate average duration
  const callsWithDuration = calls.filter(c => c.durationSeconds !== null);
  const avgDurationSeconds = callsWithDuration.length > 0 
    ? Math.round(callsWithDuration.reduce((acc, call) => acc + (call.durationSeconds || 0), 0) / callsWithDuration.length)
    : 0;
  
  const avgMins = Math.floor(avgDurationSeconds / 60);
  const avgSecs = avgDurationSeconds % 60;
  const avgDurationFormatted = avgMins > 0 ? `${avgMins}m ${avgSecs}s` : `${avgSecs}s`;

  // Calculate success rate (Resolved vs anything else)
  const resolvedCalls = calls.filter(c => c.analysis?.outcome.toLowerCase() === 'resolved' || c.analysis?.outcome.toLowerCase() === 'converted').length;
  const successRate = totalCalls > 0 ? Math.round((resolvedCalls / totalCalls) * 100) : 0;

  // Calculate escalations
  const escalations = calls.filter(c => c.analysis?.outcome.toLowerCase() === 'escalated').length;

  return (
    <div className="flex flex-col flex-1 p-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-white capitalize tracking-tight">{provider.toLowerCase()} Integration</h1>
        <ProviderBadge provider={provider.toUpperCase()} />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard 
          title="Total Calls" 
          value={totalCalls.toLocaleString()} 
          icon={<PhoneCall className="w-5 h-5" />}
          trend={{ value: "+14%", isPositive: true }}
        />
        <MetricCard 
          title="Avg Duration" 
          value={avgDurationFormatted} 
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard 
          title="Success Rate" 
          value={`${successRate}%`} 
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: "+2.1%", isPositive: true }}
        />
        <MetricCard 
          title="Escalations" 
          value={escalations.toLocaleString()} 
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={{ value: "-4%", isPositive: true }}
        />
      </div>

      {/* Call History */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">Call History</h2>
        <div className="flex flex-col gap-3">
          {calls.length === 0 ? (
            <div className="text-zinc-500 text-sm py-16 text-center border border-dashed border-border-subtle rounded-xl">
              No calls found for {provider}. Send a webhook to populate this list.
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
