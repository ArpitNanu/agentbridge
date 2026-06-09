import Link from "next/link";
import { LayoutDashboard, Bot, Phone } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-background border-r border-border-subtle h-screen flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-4 h-4 bg-brand rounded-sm"></div>
          AgentBridge
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link href="/vapi" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
          <Bot className="w-4 h-4" />
          <span className="text-sm font-medium">Vapi</span>
        </Link>
        <Link href="/retell" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Retell</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-blue-200 text-xs font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-medium text-white">Jane Doe</p>
            <p className="text-xs text-zinc-500">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
