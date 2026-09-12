export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type EventStatus = 'Blocked' | 'Detected' | 'Analyzed' | 'Flagged';

export interface SecurityActivity {
  id: string;
  threatType: string;
  severity: Severity;
  timestamp: string;
  status: EventStatus;
}

export interface ThreatCategory {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export const securityStats = {
  securityScore: 92,
  promptsScanned: 1284,
  threatsBlocked: 347,
  highRiskDetected: 26,
};

export const recentActivity: SecurityActivity[] = [
  {
    id: '1',
    threatType: 'Direct prompt injection detected',
    severity: 'Critical',
    timestamp: '2 min ago',
    status: 'Blocked',
  },
  {
    id: '2',
    threatType: 'Jailbreak attempt blocked',
    severity: 'High',
    timestamp: '14 min ago',
    status: 'Blocked',
  },
  {
    id: '3',
    threatType: 'Suspicious instruction pattern detected',
    severity: 'Medium',
    timestamp: '38 min ago',
    status: 'Flagged',
  },
  {
    id: '4',
    threatType: 'System prompt extraction attempt detected',
    severity: 'High',
    timestamp: '1 hr ago',
    status: 'Detected',
  },
  {
    id: '5',
    threatType: 'Safe prompt analyzed',
    severity: 'Low',
    timestamp: '2 hr ago',
    status: 'Analyzed',
  },
  {
    id: '6',
    threatType: 'Instruction override attempt blocked',
    severity: 'Critical',
    timestamp: '3 hr ago',
    status: 'Blocked',
  },
  {
    id: '7',
    threatType: 'Data exfiltration pattern flagged',
    severity: 'High',
    timestamp: '5 hr ago',
    status: 'Flagged',
  },
];

export const threatDistribution: ThreatCategory[] = [
  { label: 'Prompt Injection', count: 142, percentage: 41, color: 'hsl(152 65% 45%)' },
  { label: 'Jailbreak', count: 98, percentage: 28, color: 'hsl(38 92% 55%)' },
  { label: 'System Prompt Extraction', count: 54, percentage: 16, color: 'hsl(0 72% 55%)' },
  { label: 'Instruction Override', count: 33, percentage: 9, color: 'hsl(200 80% 60%)' },
  { label: 'Data Exfiltration', count: 20, percentage: 6, color: 'hsl(270 60% 65%)' },
];
