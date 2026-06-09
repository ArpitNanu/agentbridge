export interface ChatBubbleProps {
  role: "user" | "agent";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[9px] font-black text-zinc-600 mb-2 px-2 uppercase tracking-[0.2em]">
          {isUser ? 'Customer' : 'Agent'}
        </span>
        <div 
          className={`px-6 py-5 rounded-2xl ${
            isUser 
              ? 'bg-surface/50 border border-border-subtle text-zinc-300 rounded-tr-sm' 
              : 'bg-transparent border border-border-subtle text-zinc-300 rounded-tl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}
