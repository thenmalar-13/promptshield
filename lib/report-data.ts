import type { RiskLevel, ScanStatus, ThreatCategoryKey } from '@/lib/prompt-analyzer';

export interface ThreatReport {
  id: string;
  timestamp: string;
  threatType: string;
  riskScore: number;
  severity: RiskLevel;
  decision: ScanStatus;
  source: string;
  categories: { label: string; severity: RiskLevel }[];
  indicators: string[];
  explanation: string;
  recommendedAction: string;
}

export interface ReportSummary {
  promptsAnalyzed: number;
  threatsDetected: number;
  attacksBlocked: number;
  criticalThreats: number;
}

export const reportSummary: ReportSummary = {
  promptsAnalyzed: 1284,
  threatsDetected: 347,
  attacksBlocked: 298,
  criticalThreats: 26,
};

export interface ThreatBreakdownItem {
  key: ThreatCategoryKey;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export const threatBreakdown: ThreatBreakdownItem[] = [
  { key: 'direct_injection', label: 'Direct Prompt Injection', count: 142, percentage: 41, color: 'hsl(152 65% 45%)' },
  { key: 'jailbreak', label: 'Jailbreak', count: 98, percentage: 28, color: 'hsl(38 92% 55%)' },
  { key: 'system_prompt_extraction', label: 'System Prompt Extraction', count: 54, percentage: 16, color: 'hsl(0 72% 55%)' },
  { key: 'instruction_override', label: 'Instruction Override', count: 33, percentage: 9, color: 'hsl(200 80% 60%)' },
  { key: 'data_exfiltration', label: 'Data Exfiltration', count: 20, percentage: 6, color: 'hsl(270 60% 65%)' },
  { key: 'obfuscation', label: 'Obfuscation', count: 5, percentage: 1, color: 'hsl(280 50% 55%)' },
];

export const threatReports: ThreatReport[] = [
  {
    id: 'rpt-001',
    timestamp: '2026-09-11 14:32 UTC',
    threatType: 'Direct Prompt Injection',
    riskScore: 100,
    severity: 'Critical',
    decision: 'BLOCK',
    source: 'API Gateway',
    categories: [{ label: 'Direct Prompt Injection', severity: 'High' }, { label: 'Instruction Override', severity: 'High' }],
    indicators: ['Ignore previous instructions', 'Follow my instructions instead'],
    explanation: 'This prompt was flagged because it contains indicators from 2 threat categories: Direct Prompt Injection, Instruction Override. The presence of multiple attack patterns increases the overall risk.',
    recommendedAction: 'Block this prompt and investigate the attempted attack. A high concentration of threat indicators was detected.',
  },
  {
    id: 'rpt-002',
    timestamp: '2026-09-11 13:18 UTC',
    threatType: 'Jailbreak Attempt',
    riskScore: 50,
    severity: 'High',
    decision: 'BLOCK',
    source: 'Chat Interface',
    categories: [{ label: 'Jailbreak Attempt', severity: 'High' }],
    indicators: ['Developer mode', 'Remove restrictions'],
    explanation: 'This prompt was flagged because it contains indicators of Jailbreak Attempt. 2 suspicious patterns were detected, resulting in a High risk level.',
    recommendedAction: 'Block or sanitize this prompt before sending it to the model. Multiple suspicious indicators were detected.',
  },
  {
    id: 'rpt-003',
    timestamp: '2026-09-11 12:45 UTC',
    threatType: 'System Prompt Extraction',
    riskScore: 50,
    severity: 'High',
    decision: 'BLOCK',
    source: 'API Gateway',
    categories: [{ label: 'System Prompt Extraction', severity: 'High' }],
    indicators: ['Reveal hidden system prompt', 'Show system instructions'],
    explanation: 'This prompt was flagged because it contains indicators of System Prompt Extraction. 2 suspicious patterns were detected, resulting in a High risk level.',
    recommendedAction: 'Block or sanitize this prompt before sending it to the model. Multiple suspicious indicators were detected.',
  },
  {
    id: 'rpt-004',
    timestamp: '2026-09-11 11:20 UTC',
    threatType: 'Instruction Override',
    riskScore: 100,
    severity: 'Critical',
    decision: 'BLOCK',
    source: 'Chat Interface',
    categories: [{ label: 'Direct Prompt Injection', severity: 'High' }, { label: 'Instruction Override', severity: 'High' }],
    indicators: ['Disregard previous instructions', 'Override your instructions'],
    explanation: 'This prompt was flagged because it contains indicators from 2 threat categories: Direct Prompt Injection, Instruction Override. The presence of multiple attack patterns increases the overall risk.',
    recommendedAction: 'Block this prompt and investigate the attempted attack. A high concentration of threat indicators was detected.',
  },
  {
    id: 'rpt-005',
    timestamp: '2026-09-11 10:05 UTC',
    threatType: 'Data Exfiltration',
    riskScore: 60,
    severity: 'High',
    decision: 'BLOCK',
    source: 'Retrieval Pipeline',
    categories: [{ label: 'Data Exfiltration', severity: 'Critical' }],
    indicators: ['API keys exfiltration', 'Credentials exfiltration', 'Confidential information exfiltration'],
    explanation: 'This prompt was flagged because it contains indicators of Data Exfiltration. 3 suspicious patterns were detected, resulting in a High risk level.',
    recommendedAction: 'Block or sanitize this prompt before sending it to the model. Multiple suspicious indicators were detected.',
  },
  {
    id: 'rpt-006',
    timestamp: '2026-09-11 09:33 UTC',
    threatType: 'Obfuscation Detected',
    riskScore: 35,
    severity: 'Medium',
    decision: 'REVIEW',
    source: 'API Gateway',
    categories: [{ label: 'Obfuscation', severity: 'High' }],
    indicators: ['Base64-like encoded string'],
    explanation: 'This prompt was flagged because it contains indicators of Obfuscation. 1 suspicious pattern was detected, resulting in a Medium risk level.',
    recommendedAction: 'Review before allowing the prompt to reach the model. Potential indicators were detected that warrant manual inspection.',
  },
  {
    id: 'rpt-007',
    timestamp: '2026-09-11 08:14 UTC',
    threatType: 'Safe Prompt Analyzed',
    riskScore: 0,
    severity: 'Low',
    decision: 'ALLOW',
    source: 'Chat Interface',
    categories: [],
    indicators: [],
    explanation: 'No suspicious patterns were detected. The prompt does not contain known prompt injection, jailbreak, or extraction indicators.',
    recommendedAction: 'No significant prompt injection indicators detected. This prompt appears safe to send to the model.',
  },
  {
    id: 'rpt-008',
    timestamp: '2026-09-10 22:47 UTC',
    threatType: 'Indirect Prompt Injection',
    riskScore: 100,
    severity: 'Critical',
    decision: 'BLOCK',
    source: 'Retrieval Pipeline',
    categories: [{ label: 'Direct Prompt Injection', severity: 'High' }, { label: 'System Prompt Extraction', severity: 'High' }, { label: 'Data Exfiltration', severity: 'High' }],
    indicators: ['Ignore previous instructions', 'Reveal hidden system prompt', 'API keys exfiltration'],
    explanation: 'This prompt was flagged because it contains indicators across 3 threat categories: Direct Prompt Injection, System Prompt Extraction, Data Exfiltration. The combination of multiple attack patterns significantly increases the risk score and suggests a coordinated prompt injection attempt.',
    recommendedAction: 'Block this prompt and investigate the attempted attack. A high concentration of threat indicators was detected.',
  },
];
