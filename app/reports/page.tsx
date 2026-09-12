import { AppShell } from '@/components/layout/app-shell';
import { SecurityReports } from '@/components/reports/security-reports';

export default function ReportsPage() {
  return (
    <AppShell
      title="Security Reports"
      subtitle="Review detected threats, attack patterns, and security decisions."
    >
      <SecurityReports />
    </AppShell>
  );
}
