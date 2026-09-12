'use client';

import { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  ChevronRight,
  FileSearch,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzePrompt, type AnalysisResult } from '@/lib/prompt-analyzer';
import { attackScenarios, type AttackScenario } from '@/lib/attack-scenarios';
import { indirectDocuments, type IndirectDocument } from '@/lib/indirect-documents';
import { ScanResult } from '@/components/scanner/scan-result';

interface FullTestResult {
  scenario: AttackScenario;
  result: AnalysisResult;
  passed: boolean;
}

export function AttackLab() {
  const [activeScenario, setActiveScenario] = useState<AttackScenario | null>(
    null
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [activeDoc, setActiveDoc] = useState<IndirectDocument | null>(null);
  const [docResult, setDocResult] = useState<AnalysisResult | null>(null);

  const [fullTestResults, setFullTestResults] = useState<FullTestResult[] | null>(
    null
  );

  const handleRun = (scenario: AttackScenario) => {
    setActiveScenario(scenario);
    setResult(analyzePrompt(scenario.prompt));
    setActiveDoc(null);
    setDocResult(null);
    setFullTestResults(null);
  };

  const handleReset = () => {
    setActiveScenario(null);
    setResult(null);
    setFullTestResults(null);
  };

  const handleInspect = (doc: IndirectDocument) => {
    setActiveDoc(doc);
    setDocResult(analyzePrompt(doc.content));
    setActiveScenario(null);
    setResult(null);
    setFullTestResults(null);
  };

  const handleDocReset = () => {
    setActiveDoc(null);
    setDocResult(null);
    setFullTestResults(null);
  };

  const handleFullSecurityTest = () => {
    const results = attackScenarios.map((scenario) => {
      const analysis = analyzePrompt(scenario.prompt);

      const passed =
      analysis.categories.some(
      (category) => category.key === scenario.expectedCategory
  ) && analysis.status === scenario.expectedStatus;

      return {
        scenario,
        result: analysis,
        passed,
      };
    });

    setFullTestResults(results);
    setActiveScenario(null);
    setResult(null);
    setActiveDoc(null);
    setDocResult(null);
  };

  const showDirectResult = result && activeScenario;
  const showDocResult = docResult && activeDoc;

  const passedCount =
    fullTestResults?.filter((test) => test.passed).length ?? 0;

  const totalTests = fullTestResults?.length ?? 0;

  const detectionRate =
    totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;

  const allTestsPassed =
    totalTests > 0 && passedCount === totalTests;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
        <FlaskConical className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-primary">
          Attack Simulation
        </span>
        <span className="text-xs text-muted-foreground">
          — controlled demo using local deterministic detection
        </span>
      </div>

      {/* Full Security Test */}
      {!showDirectResult && !showDocResult && !fullTestResults && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  Full Security Test
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Run all controlled attack scenarios and measure detection
                performance across the PromptShield test set.
              </p>
            </div>

            <Button
              onClick={handleFullSecurityTest}
              className="shrink-0 gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Run Full Security Test
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Full Security Test Results */}
      {fullTestResults && (
        <div className="space-y-5">
          <Card
            className={cn(
              'border-border bg-card/50 ring-1',
              allTestsPassed
                ? 'ring-success/30'
                : 'ring-warning/30'
            )}
          >
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {allTestsPassed ? (
                      <ShieldCheck className="h-6 w-6 text-success" />
                    ) : (
                      <ShieldAlert className="h-6 w-6 text-warning" />
                    )}

                    <h2 className="text-lg font-bold text-foreground">
                      Full Security Test
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Controlled PromptShield attack test set
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/50 bg-secondary/30 px-5 py-3 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {passedCount}/{totalTests}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Tests Passed
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-secondary/30 px-5 py-3 text-center">
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        allTestsPassed
                          ? 'text-success'
                          : 'text-warning'
                      )}
                    >
                      {detectionRate}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Detection Rate
                    </p>
                  </div>

                  <div className="col-span-2 rounded-lg border border-border/50 bg-secondary/30 px-5 py-3 text-center sm:col-span-1">
                    <p
                      className={cn(
                        'text-sm font-bold',
                        allTestsPassed
                          ? 'text-success'
                          : 'text-warning'
                      )}
                    >
                      {allTestsPassed
                        ? 'ALL TESTS PASSED'
                        : 'REVIEW REQUIRED'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Test Status
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Security Test Results
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-secondary/20">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        Test
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        Category
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        Score
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        Risk
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        Decision
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        Result
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {fullTestResults.map((test) => (
                      <tr
                        key={test.scenario.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {test.scenario.name}
                        </td>

                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {test.scenario.threatType}
                        </td>

                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {test.result.score}/100
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-[10px] font-semibold',
                              test.result.riskLevel === 'Critical' &&
                                'bg-destructive/10 text-destructive',
                              test.result.riskLevel === 'High' &&
                                'bg-destructive/10 text-destructive',
                              test.result.riskLevel === 'Medium' &&
                                'bg-warning/10 text-warning',
                              test.result.riskLevel === 'Low' &&
                                'bg-success/10 text-success'
                            )}
                          >
                            {test.result.riskLevel}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'rounded-md px-2 py-1 text-[10px] font-bold',
                              test.result.status === 'BLOCK' &&
                                'bg-destructive/10 text-destructive',
                              test.result.status === 'REVIEW' &&
                                'bg-warning/10 text-warning',
                              test.result.status === 'ALLOW' &&
                                'bg-success/10 text-success'
                            )}
                          >
                            {test.result.status}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {test.passed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                              <CheckCircle2 className="h-4 w-4" />
                              PASS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                              <XCircle className="h-4 w-4" />
                              FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="flex items-start gap-3 p-5">
              <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Detection rate represents performance on this controlled
                demonstration test set only. It does not represent guaranteed
                real-world protection against all prompt injection attacks.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Run Test Again
            </Button>
          </div>
        </div>
      )}

      {/* Direct Attack Scenarios */}
      {!showDirectResult && !showDocResult && !fullTestResults && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Select an Attack Scenario
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {attackScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="flex flex-col border-border bg-card/50 transition-all hover:border-primary/30 hover:bg-card"
              >
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {scenario.name}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {scenario.description}
                    </p>
                  </div>

                  <div className="rounded-md bg-secondary/40 px-3 py-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Threat Type:{' '}
                    </span>

                    <span className="text-[11px] text-foreground">
                      {scenario.threatType}
                    </span>
                  </div>

                  <p className="mt-auto font-mono text-[11px] leading-relaxed text-muted-foreground/70">
                    {scenario.prompt}
                  </p>

                  <Button
                    onClick={() => handleRun(scenario)}
                    size="sm"
                    className="mt-1 gap-2"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run Attack
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Indirect Injection Demo */}
      {!showDirectResult && !showDocResult && !fullTestResults && (
        <div className="space-y-3 border-t border-border pt-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" />

              <h2 className="text-sm font-semibold text-foreground">
                Indirect Prompt Injection Demo
              </h2>
            </div>

            <p className="text-xs text-muted-foreground">
              Simulates malicious instructions hidden inside untrusted retrieved
              content.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {indirectDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="flex flex-col border-border bg-card/50 transition-all hover:border-primary/30 hover:bg-card"
              >
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {doc.name}
                    </h3>

                    {doc.untrusted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive ring-1 ring-destructive/20">
                        <ShieldAlert className="h-3 w-3" />
                        UNTRUSTED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {doc.description}
                  </p>

                  <pre className="mt-auto max-h-24 overflow-hidden whitespace-pre-wrap rounded-md bg-secondary/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground/70">
                    {doc.content}
                  </pre>

                  <Button
                    onClick={() => handleInspect(doc)}
                    size="sm"
                    variant="outline"
                    className="mt-1 gap-2"
                  >
                    <FileSearch className="h-3.5 w-3.5" />
                    Inspect Content
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Direct Attack Result */}
      {showDirectResult && (
        <div className="space-y-4">
          <Card className="border-border bg-card/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <FlaskConical className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {activeScenario?.name}
                  </p>

                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {activeScenario?.prompt}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Run Another Attack
              </Button>
            </CardContent>
          </Card>

          <ScanResult result={result} />

          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="mx-auto flex gap-2"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to attack scenarios
          </Button>
        </div>
      )}

      {/* Indirect Injection Result */}
      {showDocResult && (
        <div className="space-y-4">
          <Card className="border-border bg-card/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <FileSearch className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {activeDoc?.name}
                    </p>

                    {activeDoc?.untrusted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive ring-1 ring-destructive/20">
                        UNTRUSTED
                      </span>
                    )}
                  </div>

                  <pre className="mt-1 max-h-16 overflow-hidden whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">
                    {activeDoc?.content}
                  </pre>
                </div>
              </div>

              <Button
                onClick={handleDocReset}
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Inspect Another
              </Button>
            </CardContent>
          </Card>

          <ScanResult result={docResult} />

          <Button
            onClick={handleDocReset}
            variant="ghost"
            size="sm"
            className="mx-auto flex gap-2"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to documents
          </Button>
        </div>
      )}
    </div>
  );
}