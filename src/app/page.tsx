import { ChatPanel } from '@/components/chat-panel';
import { MonitoringPanel } from '@/components/monitoring-panel';
import { TrinityLogo } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center h-16 px-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <TrinityLogo className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight font-headline">
            TrinityGen
          </h1>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
        <div className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
          <ChatPanel />
        </div>
        <aside className="hidden md:flex flex-col h-full gap-4">
          <MonitoringPanel />
        </aside>
      </main>
    </div>
  );
}
