import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle, Settings, ChevronDown, Download, Share2, Clock } from "lucide-react";
import prisma from "@/lib/db";
import { ChatBubble } from "@/components/calls/ChatBubble";
import { ProviderBadge, SentimentBadge, OutcomeBadge, Badge } from "@/components/ui/Badge";

// Helper to format duration
function formatDuration(seconds: number | null) {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}M ${secs}S` : `${secs}S`;
}

// Helper to parse the raw transcript string into ChatBubble format
function parseTranscript(rawTranscript: string | null) {
  if (!rawTranscript) return [];
  const lines = rawTranscript.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map(line => {
    if (line.toLowerCase().startsWith('agent:')) {
      return { role: "agent" as const, content: line.substring(6).trim() };
    } else if (line.toLowerCase().startsWith('user:')) {
      return { role: "user" as const, content: line.substring(5).trim() };
    }
    // Fallback if no prefix is found
    return { role: "agent" as const, content: line };
  });
}

export default async function CallDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const call = await prisma.call.findUnique({
    where: { id: params.id },
    include: { analysis: true },
  });

  if (!call) {
    notFound();
  }

  // Parse the real transcript from the database
  const messages = parseTranscript(call.transcript);

  return (
    <div className="flex flex-col h-screen w-full overflow-y-auto bg-background p-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          AGENTBRIDGE
        </Link>
        <span>/</span>
        <Link href={`/${call.provider.toLowerCase()}`} className="hover:text-white transition-colors">
          {call.provider}
        </Link>
        <span>/</span>
        <span className="text-zinc-400">CALL {call.id.split('_').pop()?.toUpperCase() || call.id.toUpperCase()}</span>
      </div>

      {/* Header Area */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{call.id}</h1>
          <div className="text-xs text-zinc-500 font-mono mb-4">
            {call.startedAt ? new Date(call.startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'} • {call.startedAt ? new Date(call.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </div>
          
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <ProviderBadge provider={call.provider} />
            <Badge variant="neutral" className="uppercase text-[10px]">{call.callType}</Badge>
            {call.analysis?.outcome && <OutcomeBadge outcome={call.analysis.outcome} />}
            {call.analysis?.sentiment && <SentimentBadge sentiment={call.analysis.sentiment} />}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-subtle bg-surface text-zinc-400 text-[10px] font-bold tracking-wider">
              <Clock className="w-3 h-3" />
              {formatDuration(call.durationSeconds)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl border border-border-subtle hover:bg-surface text-zinc-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-xl border border-border-subtle hover:bg-surface text-zinc-400 hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column (Metadata Cards) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0">
          
          {/* AI Summary Card */}
          <div className="bg-transparent border border-border-subtle rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 text-brand" />
              AI Summary
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {call.analysis?.summary || "The customer called expressing frustration about opaque pricing on their enterprise plan. The agent attempted to route them to pricing documentation but failed to address their specific concern."}
            </p>
          </div>

          {/* Intervention Status Card */}
          <div className="bg-transparent border border-border-subtle rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              <AlertCircle className="w-4 h-4 text-negative" />
              Intervention Status
            </div>
            
            {call.analysis?.outcome?.toLowerCase() === 'escalated' ? (
              <div className="border border-negative/30 bg-negative/5 text-negative text-xs font-bold text-center py-3 rounded-lg uppercase tracking-widest mb-4">
                Human Handoff Required
              </div>
            ) : (
              <div className="border border-positive/30 bg-positive/5 text-positive text-xs font-bold text-center py-3 rounded-lg uppercase tracking-widest mb-4">
                Resolved Successfully
              </div>
            )}

            {/* Reason for escalation will be added in Phase 2 via AI verdicts */}
          </div>

          {/* System Metadata Card */}
          <div className="bg-transparent border border-border-subtle rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              <Settings className="w-4 h-4" />
              System Metadata
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
                <span className="text-xs text-zinc-500 font-mono">Provider Call ID</span>
                <span className="text-xs text-zinc-300 font-mono">{call.providerCallId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
                <span className="text-xs text-zinc-500 font-mono">Status</span>
                <span className="text-xs text-zinc-300 capitalize">{call.status}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
                <span className="text-xs text-zinc-500 font-mono">Call Rate</span>
                <span className="text-xs text-zinc-300 font-mono">$0.05 / min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">Latency (avg)</span>
                <span className="text-xs text-zinc-300 font-mono">320ms</span>
              </div>
            </div>
          </div>

          {/* Raw Webhook Payload Card */}
          <div className="bg-transparent border border-border-subtle rounded-xl p-5">
            <div className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <span>{'< >'}</span>
                Raw Webhook Payload
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
            
            <div className="mt-4 bg-[#0a0a0a] border border-border-subtle rounded-lg p-4 overflow-x-auto">
              <pre className="text-[10px] text-zinc-500 font-mono">
{JSON.stringify(call.rawPayload, null, 2)}
              </pre>
            </div>
          </div>

        </div>

        {/* Right Column (Transcript) */}
        <div className="flex-1 flex flex-col bg-transparent border border-border-subtle rounded-xl overflow-hidden min-h-[600px]">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface/30">
            <h2 className="text-sm font-bold text-white">Conversation Transcript</h2>
            <div className="px-2.5 py-1 rounded-full border border-border-subtle bg-background text-zinc-500 text-[10px] font-bold tracking-widest uppercase">
              {messages.length} Turns
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex flex-col max-w-3xl mx-auto">
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} role={msg.role} content={msg.content} />
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
