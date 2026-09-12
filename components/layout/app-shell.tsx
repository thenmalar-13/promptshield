import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/30 lg:flex lg:flex-col">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
