"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const suggestions = [
    "Angry support",
    "Sales yesterday",
    "Healthcare resolved",
    "Under 60s",
    "Escalated",
    "Converted"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-8 px-4">
      {/* Title Area */}
      <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
        Semantic Call Intelligence
      </h1>
      <p className="text-base text-zinc-400 mb-8 text-center max-w-2xl">
        Query thousands of AI voice agent interactions in plain English...
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface border border-border-subtle rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-xl shadow-black/20"
          placeholder="e.g., Show me angry support calls from yesterday..."
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-semibold text-zinc-500 bg-background rounded border border-border-subtle">
            Enter ↵
          </kbd>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            type="button"
            className="px-4 py-1.5 rounded-full border border-border-subtle bg-background hover:bg-surface text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
