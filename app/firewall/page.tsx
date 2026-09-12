import { AppShell } from '@/components/layout/app-shell';
import { AIFirewall } from '@/components/firewall/ai-firewall';

export default function FirewallPage() {
  return (
    <AppShell
      title="AI Firewall"
      subtitle="Inspect and control LLM requests before they reach the model."
    >
      <AIFirewall />
    </AppShell>
  );
}
