import { AppShell } from '@/components/layout/app-shell';
import { HeroOverview } from '@/components/dashboard/hero-overview';
import { SecurityOverview } from '@/components/dashboard/security-overview';
import { SecurityScore } from '@/components/dashboard/security-score';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ThreatDistribution } from '@/components/dashboard/threat-distribution';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="LLM security monitoring and threat intelligence"
    >
      <div className="space-y-6">
        <HeroOverview />
        <SecurityOverview />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SecurityScore />
          </div>
          <div className="lg:col-span-1">
            <ThreatDistribution />
          </div>
        </div>
        <RecentActivity />
        <QuickActions />
      </div>
    </AppShell>
  );
}
