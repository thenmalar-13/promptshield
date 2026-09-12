import { AppShell } from '@/components/layout/app-shell';
import { AttackLab } from '@/components/attack-lab/attack-lab';

export default function AttackLabPage() {
  return (
    <AppShell
      title="Attack Lab"
      subtitle="Safely simulate common prompt-injection attacks against PromptShield."
    >
      <AttackLab />
    </AppShell>
  );
}
