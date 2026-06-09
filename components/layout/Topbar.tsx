import { Bell, HelpCircle } from "lucide-react";

export function Topbar() {
  return (
    <div className="h-16 border-b border-border-subtle flex items-center justify-between px-8 shrink-0 w-full bg-background/50 backdrop-blur-sm z-10 sticky top-0">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
        <div className="w-2 h-2 rounded-full bg-positive"></div>
        <span className="text-[10px] font-mono font-medium text-zinc-400 tracking-wider">SYSTEM_ONLINE</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="bg-brand hover:bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors">
          Register Webhook
        </button>
        <button className="text-zinc-400 hover:text-white transition-colors p-1">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-zinc-400 hover:text-white transition-colors p-1">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
