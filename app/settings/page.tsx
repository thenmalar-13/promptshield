'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  UserCheck,
  LockKeyhole,
  Database,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

import { clearSecurityEvents } from '@/lib/security-telemetry';

export default function SettingsPage() {
  const [securityMode, setSecurityMode] = useState('strict');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [defaultPolicy, setDefaultPolicy] = useState('review');
  const [hitlEnabled, setHitlEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('promptshield-settings');

    if (stored) {
      try {
        const settings = JSON.parse(stored);

        setSecurityMode(settings.securityMode ?? 'strict');
        setAiEnabled(settings.aiEnabled ?? true);
        setDefaultPolicy(settings.defaultPolicy ?? 'review');
        setHitlEnabled(settings.hitlEnabled ?? true);
      } catch {
        // Ignore malformed local settings.
      }
    }

    setApiConfigured(Boolean(process.env.NEXT_PUBLIC_GEMINI_CONFIGURED));
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      'promptshield-settings',
      JSON.stringify({
        securityMode,
        aiEnabled,
        defaultPolicy,
        hitlEnabled,
      })
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const clearTelemetry = () => {
    const confirmed = window.confirm(
      'Clear all locally stored PromptShield security telemetry? This cannot be undone.'
    );

    if (!confirmed) return;

    clearSecurityEvents();
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">
              Security Configuration
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure PromptShield gateway policies and protection controls.
          </p>
        </div>

        <Button onClick={saveSettings}>
          {saved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {/* Gateway status */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                PromptShield Gateway
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Security analysis is active before requests reach the LLM.
              </p>
            </div>
          </div>

          <Badge className="w-fit gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Protected
          </Badge>
        </CardContent>
      </Card>

      {/* Detection policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LockKeyhole className="h-4 w-4 text-primary" />
            Detection Policy
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Security Mode</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Controls how aggressively PromptShield responds to threats.
              </p>
            </div>

            <Select value={securityMode} onValueChange={setSecurityMode}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Default Policy</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fallback action for requests requiring a policy decision.
              </p>
            </div>

            <Select value={defaultPolicy} onValueChange={setDefaultPolicy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="block">Block</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-primary" />
            AI Security Analysis
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                Gemini AI Analysis
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the AI security layer for semantic threat analysis and
                reasoning.
              </p>
            </div>

            <Switch
              checked={aiEnabled}
              onCheckedChange={setAiEnabled}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                Human Approval Gate
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Require human review for requests classified as REVIEW.
              </p>
            </div>

            <Switch
              checked={hitlEnabled}
              onCheckedChange={setHitlEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-primary" />
            Telemetry & Privacy
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

              <div>
                <p className="text-sm font-medium">
                  Privacy-preserving telemetry
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  PromptShield stores security metadata such as risk score,
                  decision, threat category, latency, and a prompt hash.
                  Raw prompts are not stored in telemetry.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                Clear Local Telemetry
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Remove all security events stored in this browser.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={clearTelemetry}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Telemetry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" />
            API Configuration
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            {apiConfigured ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            )}

            <div>
              <p className="text-sm font-medium">
                Gemini API
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {apiConfigured
                  ? 'API configuration is available. The secret key is never displayed in the UI.'
                  : 'API configuration status is managed through the server environment. Secret keys are never displayed in the UI.'}
              </p>
            </div>

            <Badge
              variant={apiConfigured ? 'default' : 'secondary'}
              className="ml-auto shrink-0"
            >
              {apiConfigured ? 'Configured' : 'Server-side'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* System information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            System Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">
                Platform
              </p>
              <p className="mt-1 text-sm font-semibold">
                PromptShield
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">
                Security Categories
              </p>
              <p className="mt-1 text-sm font-semibold">
                12
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">
                Security Scenarios
              </p>
              <p className="mt-1 text-sm font-semibold">
                19
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-end border-t border-border pt-5">
        <Button onClick={saveSettings}>
          {saved ? 'Configuration Saved' : 'Save Configuration'}
        </Button>
      </div>
    </main>
  );
}