import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset";
  
  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-positive/10 text-positive ring-positive/20",
    error: "bg-negative/10 text-negative ring-negative/20",
    warning: "bg-warning/10 text-warning ring-warning/20",
    info: "bg-brand/10 text-brand ring-brand/20",
    purple: "bg-converted/10 text-converted ring-converted/20",
    neutral: "bg-neutral/10 text-neutral ring-neutral/20"
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Helper components for specific domain logic so we don't have to map colors everywhere
export function SentimentBadge({ sentiment }: { sentiment: string }) {
  const normalized = sentiment.toLowerCase();
  if (normalized === 'positive') return <Badge variant="success">Positive</Badge>;
  if (normalized === 'negative') return <Badge variant="error">Negative</Badge>;
  return <Badge variant="neutral">Neutral</Badge>;
}

export function OutcomeBadge({ outcome }: { outcome: string }) {
  const normalized = outcome.toLowerCase();
  if (normalized === 'resolved') return <Badge variant="info">Resolved</Badge>;
  if (normalized === 'escalated') return <Badge variant="warning">Escalated</Badge>;
  if (normalized === 'converted') return <Badge variant="purple">Converted</Badge>;
  if (normalized === 'unresolved') return <Badge variant="neutral">Unresolved</Badge>;
  return <Badge variant="neutral">{outcome}</Badge>;
}

export function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className="inline-flex items-center rounded bg-surface px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider border border-white/5">
      {provider}
    </span>
  );
}
