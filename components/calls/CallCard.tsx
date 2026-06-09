import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SentimentBadge, OutcomeBadge, ProviderBadge } from '../ui/Badge';

// Interface defining the exact data the card needs to render
export interface CallCardProps {
  id: string;
  provider: string;
  callType: string;
  durationSeconds: number | null;
  startedAt: Date | null;
  summary?: string;
  sentiment?: string;
  outcome?: string;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatTimeAgo(date: Date | null) {
  if (!date) return 'Unknown';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 3600) return `${Math.floor(seconds / 60)}M_AGO`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}H_AGO`;
  if (seconds < 172800) return 'YESTERDAY';
  return new Date(date).toLocaleDateString();
}

export function CallCard({ 
  id, 
  provider, 
  callType, 
  durationSeconds, 
  startedAt, 
  summary, 
  sentiment, 
  outcome 
}: CallCardProps) {
  return (
    <Link 
      href={`/calls/${id}`}
      className="group flex items-center justify-between p-5 rounded-xl border border-border-subtle bg-background hover:bg-surface transition-all duration-200"
    >
      {/* Left Column: Metadata */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          <ProviderBadge provider={provider} />
          <span>•</span>
          <span>{formatTimeAgo(startedAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-white capitalize">{callType}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-xs text-zinc-400 font-mono">
            {formatDuration(durationSeconds)}
          </span>
        </div>
      </div>

      {/* Middle Column: Snippet */}
      <div className="flex-1 px-8">
        <p className="text-sm text-zinc-400 line-clamp-1">
          {summary || "No summary available for this call."}
        </p>
      </div>

      {/* Right Column: Badges & Action */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          {sentiment && <SentimentBadge sentiment={sentiment} />}
          {outcome && <OutcomeBadge outcome={outcome} />}
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}
