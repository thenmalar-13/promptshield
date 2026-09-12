'use client';

import { useState } from 'react';
import { ScanSearch, Eraser, FileText, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { analyzePrompt, type AnalysisResult } from '@/lib/prompt-analyzer';
import { exampleAttacks } from '@/lib/example-attacks';
import { ScanResult } from '@/components/scanner/scan-result';

const MAX_CHARS = 5000;

export function PromptScanner() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const isEmpty = prompt.trim().length === 0;

  const handleAnalyze = () => {
    if (isEmpty) return;
    setResult(analyzePrompt(prompt));
    setHasAnalyzed(true);
  };

  const handleClear = () => {
    setPrompt('');
    setResult(null);
    setHasAnalyzed(false);
  };

  const handleExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setResult(null);
    setHasAnalyzed(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ScanSearch className="h-4 w-4 text-primary" />
            Prompt Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Paste a prompt here to analyze it for security threats..."
              className="min-h-[160px] resize-y border-border bg-background/50 font-mono text-sm leading-relaxed"
              maxLength={MAX_CHARS}
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Rule-based prototype detection engine
              </span>
              <span
                className={cn(
                  'text-[11px] tabular-nums',
                  prompt.length > MAX_CHARS * 0.9
                    ? 'text-warning'
                    : 'text-muted-foreground'
                )}
              >
                {prompt.length} / {MAX_CHARS}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isEmpty}
              className="gap-2"
            >
              <ScanSearch className="h-4 w-4" />
              Analyze Prompt
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={!prompt && !hasAnalyzed}
              className="gap-2"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasAnalyzed && result ? (
        <ScanResult result={result} />
      ) : (
        <Card className="border-border bg-card/30">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ring-1 ring-border">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Paste a prompt above to begin security analysis.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Try an Example Attack
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {exampleAttacks.map((example) => (
            <button
              key={example.id}
              onClick={() => handleExample(example.prompt)}
              className="group flex flex-col gap-2 rounded-lg border border-border bg-card/50 p-4 text-left transition-all hover:border-primary/30 hover:bg-card"
            >
              <span className="text-sm font-semibold text-foreground">
                {example.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {example.description}
              </span>
              <span className="mt-1 truncate font-mono text-[11px] text-muted-foreground/70 group-hover:text-muted-foreground">
                {example.prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
