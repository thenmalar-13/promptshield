import { AppShell } from '@/components/layout/app-shell';
import { PromptScanner } from '@/components/scanner/prompt-scanner';

export default function ScannerPage() {
  return (
    <AppShell
      title="Prompt Scanner"
      subtitle="Analyze LLM inputs for prompt injection and security threats."
    >
      <PromptScanner />
    </AppShell>
  );
}
