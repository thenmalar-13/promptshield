export type RiskLevel =
| 'Low'
| 'Medium'
| 'High'
| 'Critical';

export type ScanStatus =
| 'ALLOW'
| 'REVIEW'
| 'BLOCK';

export type ThreatCategoryKey =
| 'direct_injection'
| 'jailbreak'
| 'system_prompt_extraction'
| 'instruction_override'
| 'data_exfiltration'
| 'obfuscation'
| 'roleplay_jailbreak'
| 'multilingual_injection'
| 'unicode_homoglyph'
| 'delimiter_smuggling'
| 'tool_abuse'
| 'context_manipulation';

export interface DetectedIndicator {
category: ThreatCategoryKey;
pattern: string;
matchedText: string;
}

export interface CategoryResult {
key: ThreatCategoryKey;
label: string;
severity: RiskLevel;
indicatorCount: number;
}

export interface AnalysisResult {
score: number;
riskLevel: RiskLevel;
status: ScanStatus;
categories: CategoryResult[];
indicators: DetectedIndicator[];
explanation: string;
recommendedAction: string;
}

interface DetectionRule {
pattern: RegExp;
label: string;
}

interface CategoryDefinition {
key: ThreatCategoryKey;
label: string;
baseSeverity: RiskLevel;
rules: DetectionRule[];
}

/* ============================================================

* UNICODE NORMALIZATION
* ============================================================ */

function normalizeSecurityText(text: string): string {
return text
.normalize('NFKC')
.replace(/[０-９]/g, (char) =>
String.fromCharCode(
char.charCodeAt(0) - 0xff10 + 0x30
)
)
.replace(/[Ａ-Ｚａ-ｚ]/g, (char) => {
const code = char.charCodeAt(0);

  if (code >= 0xff21 && code <= 0xff3a) {
    return String.fromCharCode(
      code - 0xff21 + 0x41
    );
  }

  return String.fromCharCode(
    code - 0xff41 + 0x61
  );
})
.replace(/[аА]/g, 'a')
.replace(/[еЕ]/g, 'e')
.replace(/[оО]/g, 'o')
.replace(/[рР]/g, 'p')
.replace(/[сС]/g, 'c')
.replace(/[хХ]/g, 'x')
.replace(/[уУ]/g, 'y')
.replace(/[іІ]/g, 'i')
.replace(/[јЈ]/g, 'j');

}

const suspiciousUnicodePattern =
/[\u0400-\u04FF\u0370-\u03FF\uFF01-\uFF60]/;

const invisibleUnicodePattern =
/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F]/;

/* ============================================================

* DETECTION RULES
* ============================================================ */

const categoryDefinitions: CategoryDefinition[] = [
{
key: 'direct_injection',
label: 'Direct Prompt Injection',
baseSeverity: 'High',
rules: [
{
pattern: /ignore\s+(all\s+)?previous\s+instructions?/i,
label: 'Ignore previous instructions',
},
{
pattern: /disregard\s+(all\s+)?previous\s+instructions?/i,
label: 'Disregard previous instructions',
},
{
pattern: /forget\s+(your|all|the)\s+instructions?/i,
label: 'Forget instructions',
},
{
pattern: /ignore\s+(the\s+)?above\s+instructions?/i,
label: 'Ignore above instructions',
},
{
pattern: /ignore\s+everything\s+(above|before)/i,
label: 'Ignore previous context',
},
{
pattern: /disregard\s+everything\s+(above|before)/i,
label: 'Disregard previous context',
},
{
pattern: /new\s+instructions?\s*[:-]/i,
label: 'New instruction directive',
},
{
pattern: /override\s+(the\s+)?system\s+prompt/i,
label: 'Override system prompt',
},
{
pattern: /replace\s+(your|the)\s+instructions?/i,
label: 'Replace instructions',
},
{
pattern: /do\s+not\s+follow\s+(the\s+)?original\s+prompt/i,
label: 'Reject original prompt',
},
],
},

{
key: 'jailbreak',
label: 'Jailbreak Attempt',
baseSeverity: 'High',
rules: [
{
pattern: /\bjailbreak\b/i,
label: 'Jailbreak keyword',
},
{
pattern: /\bDAN\b/i,
label: 'DAN mode',
},
{
pattern: /developer\s+mode/i,
label: 'Developer mode',
},
{
pattern: /unrestricted\s+mode/i,
label: 'Unrestricted mode',
},
{
pattern: /uncensored\s+mode/i,
label: 'Uncensored mode',
},
{
pattern: /bypass\s+(your\s+)?safety/i,
label: 'Bypass safety',
},
{
pattern: /bypass\s+(your\s+)?(rules|guardrails|filters)/i,
label: 'Bypass guardrails',
},
{
pattern: /remove\s+(all\s+)?restrictions?/i,
label: 'Remove restrictions',
},
{
pattern: /no\s+restrictions/i,
label: 'No restrictions',
},
{
pattern: /disable\s+(all\s+)?safety/i,
label: 'Disable safety',
},
],
},

{
key: 'system_prompt_extraction',
label: 'System Prompt Extraction',
baseSeverity: 'High',
rules: [
{
pattern: /reveal\s+(your\s+)?system\s+prompt/i,
label: 'Reveal system prompt',
},
{
pattern: /show\s+(me\s+)?(your\s+)?(hidden\s+)?system\s+instructions?/i,
label: 'Show system instructions',
},
{
pattern: /print\s+(your\s+)?system\s+prompt/i,
label: 'Print system prompt',
},
{
pattern: /tell\s+me\s+your\s+hidden\s+instructions?/i,
label: 'Tell hidden instructions',
},
{
pattern: /reveal\s+((your|the)\s+)?hidden\s+(system\s+)?(prompt|instructions?)/i,
label: 'Reveal hidden instructions',
},
{
pattern: /what\s+(is|are)\s+your\s+(initial|original)\s+(prompt|instructions?)/i,
label: 'Ask for original prompt',
},
{
pattern: /output\s+your\s+system\s+prompt/i,
label: 'Output system prompt',
},
{
pattern: /show\s+me\s+(the\s+)?hidden\s+system\s+instructions?/i,
label: 'Show hidden system instructions',
},
{
pattern: /what\s+(is|are)\s+(the\s+)?hidden\s+(system\s+)?(prompt|instructions?)/i,
label: 'Ask for hidden system prompt',
},
{
pattern: /repeat\s+(your\s+)?(system\s+)?instructions?/i,
label: 'Repeat instructions',
},
{
pattern: /reveal\s+the\s+secret\s+prompt/i,
label: 'Reveal secret prompt',
},
{
pattern: /tell\s+me\s+the\s+system\s+prompt/i,
label: 'Request system prompt',
},
],
},

{
key: 'instruction_override',
label: 'Instruction Override',
baseSeverity: 'High',
rules: [
{
pattern: /from\s+now\s+on/i,
label: 'From now on directive',
},
{
pattern: /instead\s+follow\s+(these|my)\s+instructions?/i,
label: 'Follow replacement instructions',
},
{
pattern: /override\s+(your\s+)?instructions?/i,
label: 'Override instructions',
},
{
pattern: /you\s+must\s+obey/i,
label: 'You must obey',
},
{
pattern: /your\s+new\s+instructions?\s+(are|is)/i,
label: 'New instructions',
},
{
pattern: /do\s+not\s+follow\s+(your|the)\s+(previous|original)\s+rules/i,
label: 'Reject previous rules',
},
{
pattern: /ignore\s+(your\s+)?(previous|original)\s+rules/i,
label: 'Ignore previous rules',
},
{
pattern: /follow\s+my\s+instructions\s+instead/i,
label: 'Follow user instructions instead',
},
{
pattern: /my\s+instructions\s+take\s+priority/i,
label: 'User priority override',
},
{
pattern: /treat\s+my\s+instructions\s+as\s+(the\s+)?system/i,
label: 'Fake system authority',
},
{
pattern: /developer\s+instructions?\s+(are|is)\s+now\s+mine/i,
label: 'Developer instruction impersonation',
},
{
pattern: /my\s+message\s+is\s+the\s+new\s+system\s+instruction/i,
label: 'Fake system instruction',
},
],
},

{
key: 'data_exfiltration',
label: 'Data Exfiltration',
baseSeverity: 'High',
rules: [
{
pattern: /(?:reveal|show|expose|leak|output)\b[^.]*?\bAPI\s+keys?\b/i,
label: 'API keys exfiltration',
},
{
pattern: /(?:reveal|show|expose|leak|output)\b[^.]*?\bcredentials\b/i,
label: 'Credentials exfiltration',
},
{
pattern: /(?:reveal|show|expose|leak|output)\b[^.]*?\bpasswords?\b/i,
label: 'Password exfiltration',
},
{
pattern: /(?:reveal|show|expose|leak|output)\b[^.]*?\bsecrets?\b/i,
label: 'Secrets exfiltration',
},
{
pattern: /(?:reveal|show|expose|leak|output)\b[^.]*?\bconfidential\s+information\b/i,
label: 'Confidential information exfiltration',
},
{
pattern: /leak\s+sensitive\s+information/i,
label: 'Sensitive information leak',
},
{
pattern: /output\s+hidden\s+data/i,
label: 'Output hidden data',
},
{
pattern: /share\s+(the\s+)?(secret|private)\s+(key|token|password)/i,
label: 'Share secret material',
},
{
pattern: /dump\s+(all\s+)?(private|secret|internal)\s+data/i,
label: 'Dump internal data',
},
{
pattern: /extract\s+(all\s+)?(?:secrets?|credentials?|API\s+keys?)/i,
label: 'Extract sensitive data',
},
{
pattern: /send\s+(the\s+)?(?:secrets?|credentials?|API\s+keys?)\s+to/i,
label: 'Transmit sensitive data',
},
],
},

{
key: 'obfuscation',
label: 'Obfuscation',
baseSeverity: 'Medium',
rules: [
{
pattern: /\b[A-Za-z0-9+/]{40,}={0,2}\b/,
label: 'Base64-like encoded string',
},
{
pattern: /\x[0-9a-f]{2}/gi,
label: 'Hex escape sequence',
},
{
pattern: /\u[0-9a-f]{4}/gi,
label: 'Unicode escape sequence',
},
{
pattern: /&#\d+;/g,
label: 'HTML entity encoding',
},
{
pattern: /(\n|\t|\r){4,}/g,
label: 'Excessive escape characters',
},
{
pattern: /\b(?:decode|decrypt|base64|encoded|encode)\b/i,
label: 'Encoding or decoding instruction',
},
{
pattern: /spell\s+(it|this)\s+(backwards|in\s+reverse)/i,
label: 'Reverse-text obfuscation',
},
{
pattern: /hidden\s+(message|instruction|text)/i,
label: 'Hidden instruction',
},
],
},

{
key: 'roleplay_jailbreak',
label: 'Role-Play Jailbreak',
baseSeverity: 'High',
rules: [
{
pattern: /pretend\s+(you\s+are|to\s+be)\b/i,
label: 'Pretend role-play request',
},
{
pattern: /act\s+as\s+(if\s+you\s+are|an?\s+|a\s+)?/i,
label: 'Identity role-play request',
},
{
pattern: /roleplay\s+as\b/i,
label: 'Role-play request',
},
{
pattern: /simulate\s+(a\s+)?(jailbroken|unrestricted|uncensored|evil|malicious)/i,
label: 'Unsafe assistant simulation',
},
{
pattern: /pretend\s+you\s+have\s+no\s+(rules|restrictions|filters)/i,
label: 'No-rules role-play',
},
{
pattern: /act\s+as\s+(an?\s+)?(unrestricted|uncensored|evil|malicious)\s+AI/i,
label: 'Malicious AI role-play',
},
{
pattern: /you\s+are\s+now\s+(DAN|jailbroken|unrestricted)/i,
label: 'Identity jailbreak',
},
{
pattern: /fictional\s+scenario.*(?:ignore|bypass|disable).*safety/i,
label: 'Fiction-based safety bypass',
},
],
},

{
key: 'multilingual_injection',
label: 'Multilingual Injection',
baseSeverity: 'High',
rules: [
{
pattern: /ignora\s+(todas\s+las\s+)?instrucciones/i,
label: 'Spanish instruction override',
},
{
pattern: /ignora\s+(todas\s+las\s+)?instrucciones\s+anteriores/i,
label: 'Spanish previous-instruction override',
},
{
pattern: /ignorer\s+(toutes\s+les\s+)?instructions/i,
label: 'French instruction override',
},
{
pattern: /ignorez\s+(toutes\s+les\s+)?instructions/i,
label: 'French instruction override',
},
{
pattern: /ignoriere\s+(alle\s+)?vorherigen\s+anweisungen/i,
label: 'German instruction override',
},
{
pattern: /ignoriere\s+(alle\s+)?vorherigen\s+anweisungen/i,
label: 'German previous-instruction override',
},
{
pattern: /前の指示を無視/i,
label: 'Japanese instruction override',
},
{
pattern: /指示を無視/i,
label: 'Japanese ignore instruction',
},
{
pattern: /忽略之前的指令|忽略以前的指示/i,
label: 'Chinese instruction override',
},
{
pattern: /이전\s*지시를\s*무시/i,
label: 'Korean instruction override',
},
{
pattern: /이전\s*지침을\s*무시/i,
label: 'Korean instruction override',
},
{
pattern: /игнорируй\s+(все\s+)?предыдущие\s+инструкции/i,
label: 'Russian instruction override',
},
{
pattern: /игнорируй\s+предыдущие\s+инструкции/i,
label: 'Russian previous-instruction override',
},
],
},

{
key: 'unicode_homoglyph',
label: 'Unicode / Homoglyph Evasion',
baseSeverity: 'Medium',
rules: [
{
pattern: suspiciousUnicodePattern,
label: 'Suspicious Unicode characters',
},
{
pattern: invisibleUnicodePattern,
label: 'Zero-width or directional Unicode',
},
{
pattern: /[\uFF21-\uFF3A\uFF41-\uFF5A]/,
label: 'Full-width Latin characters',
},
],
},

{
key: 'delimiter_smuggling',
label: 'Delimiter / Prompt Smuggling',
baseSeverity: 'High',
rules: [
{
pattern: /\((system|developer|assistant|admin)\)/i,
label: 'Fake role delimiter',
},
{
pattern: /<(system|developer|assistant|admin)>/i,
label: 'XML-style role injection',
},
{
pattern: /<\/?(system|developer|assistant|instruction)>/i,
label: 'Prompt boundary manipulation',
},
{
pattern: /---\s*(system|developer)\s*(message|prompt)?\s*---/i,
label: 'Fake system delimiter',
},
{
pattern: /BEGIN\s+(SYSTEM|INSTRUCTIONS|PROMPT)/i,
label: 'Fake prompt boundary',
},
{
pattern: /END\s+(USER|SYSTEM|INSTRUCTIONS|PROMPT)/i,
label: 'Fake prompt termination',
},
{
pattern: /(?:system|developer|instruction)/i,
label: 'Code-fence prompt smuggling',
},
{
pattern: /system\s*message\s*:/i,
label: 'Fake system message',
},
{
pattern: /developer\s*message\s*:/i,
label: 'Fake developer message',
},
{
pattern: /\(SYSTEM\)/i,
label: 'SYSTEM role marker',
},
],
},

{
key: 'tool_abuse',
label: 'Tool / Function Abuse',
baseSeverity: 'High',
rules: [
{
pattern: /(?:call|execute|invoke|run)\s+(?:the\s+)?(?:function|tool|command)\b/i,
label: 'Unauthorized tool execution',
},
{
pattern: /execute\s+(?:this\s+)?(?:shell|terminal|system)\s+command/i,
label: 'System command execution',
},
{
pattern: /run\s+(?:this\s+)?(?:bash|powershell|cmd)\s+command/i,
label: 'Shell command execution',
},
{
pattern: /(?:delete|drop|truncate)\s+(?:the\s+)?(?:database|table|files?)/i,
label: 'Destructive tool operation',
},
{
pattern: /send\s+(?:an?\s+)?(?:email|message|request)\s+without\s+(?:asking|confirmation)/i,
label: 'Unauthorized external action',
},
{
pattern: /(?:function_call|tool_call|tool_calls)\s*[:=]/i,
label: 'Injected function call',
},
{
pattern: /use\s+(?:the\s+)?admin\s+tool/i,
label: 'Privileged tool request',
},
{
pattern: /call\s+(?:the\s+)?(?:browser|web|http|search)\s+tool/i,
label: 'Unauthorized external tool',
},
{
pattern: /execute\s+(?:this\s+)?command\b/i,
label: 'Command execution request',
},
{
pattern: /run\s+(?:this\s+)?command\b/i,
label: 'Command execution request',
},
{
pattern: /use\s+the\s+tool\s+to/i,
label: 'Tool-directed instruction',
},
],
},

{
key: 'context_manipulation',
label: 'Context Manipulation',
baseSeverity: 'High',
rules: [
{
pattern: /this\s+is\s+(?:a\s+)?system\s+message/i,
label: 'Fake system message',
},
{
pattern: /the\s+previous\s+message\s+was\s+(?:a\s+)?test/i,
label: 'Previous-message manipulation',
},
{
pattern: /the\s+conversation\s+has\s+been\s+reset/i,
label: 'Fake context reset',
},
{
pattern: /forget\s+everything\s+(?:we|you)\s+(?:said|discussed)/i,
label: 'Conversation memory manipulation',
},
{
pattern: /forget\s+(?:the\s+)?conversation/i,
label: 'Conversation reset manipulation',
},
{
pattern: /reset\s+(?:the\s+)?context/i,
label: 'Context reset request',
},
{
pattern: /reset\s+(?:the\s+)?conversation/i,
label: 'Conversation reset request',
},
{
pattern: /treat\s+the\s+following\s+as\s+(?:trusted|verified)\s+content/i,
label: 'Trust boundary manipulation',
},
{
pattern: /the\s+developer\s+has\s+authorized\s+this/i,
label: 'Fake developer authorization',
},
{
pattern: /security\s+test\s+mode.*(?:ignore|disable).*safety/i,
label: 'Fake security-test bypass',
},
{
pattern: /new\s+conversation\s+context/i,
label: 'Fake context replacement',
},
{
pattern: /start\s+(?:a\s+)?new\s+context/i,
label: 'Context replacement',
},
],
},
];

/* ============================================================

* SCORING
* ============================================================ */

const severityWeight: Record<RiskLevel, number> = {
Low: 0,
Medium: 25,
High: 50,
Critical: 40,
};

const recommendedActions: Record<RiskLevel, string> = {
Low:
'No significant prompt injection indicators detected. This prompt appears safe to send to the model.',

Medium:
'Review before allowing the prompt to reach the model. Potential indicators were detected that warrant manual inspection.',

High:
'Block or sanitize this prompt before sending it to the model. Multiple suspicious indicators were detected.',

Critical:
'Block this prompt and investigate the attempted attack. A high concentration of threat indicators was detected.',
};

const scanStatuses: Record<RiskLevel, ScanStatus> = {
Low: 'ALLOW',
Medium: 'REVIEW',
High: 'BLOCK',
Critical: 'BLOCK',
};

function clampScore(score: number): number {
return Math.max(
0,
Math.min(100, Math.round(score))
);
}

function scoreToLevel(score: number): RiskLevel {
if (score >= 75) return 'Critical';
if (score >= 50) return 'High';
if (score >= 25) return 'Medium';

return 'Low';
}

function escalateSeverity(
base: RiskLevel,
indicatorCount: number
): RiskLevel {
if (indicatorCount >= 3) {
if (base === 'Medium') return 'High';
if (base === 'High') return 'Critical';
}

if (indicatorCount >= 2 && base === 'Medium') {
return 'High';
}

return base;
}

/* ============================================================

* EXPLANATION
* ============================================================ */

function buildExplanation(
categories: CategoryResult[],
riskLevel: RiskLevel
): string {
if (categories.length === 0) {
return (
'No suspicious patterns were detected. The prompt does not contain known prompt injection, jailbreak, extraction, tool-abuse, or prompt-smuggling indicators.'
);
}

const labels = categories
.map((category) => category.label)
.join(', ');

if (categories.length >= 4) {
return `This prompt was flagged across ${categories.length} threat categories: ${labels}. The high concentration of indicators suggests a coordinated or multi-stage prompt attack.`;
}

if (categories.length >= 3) {
return `This prompt was flagged because it contains indicators across ${categories.length} threat categories: ${labels}. The combination of multiple attack patterns significantly increases the risk score.`;
}

if (categories.length === 2) {
return `This prompt was flagged because it contains indicators from 2 threat categories: ${labels}. The presence of multiple attack patterns increases the overall risk.`;
}

const single = categories[0];

return `This prompt was flagged because it contains indicators of ${single.label}. ${single.indicatorCount} suspicious pattern${
    single.indicatorCount > 1 ? 's were' : ' was'
  } detected, resulting in a ${riskLevel} risk level.`;
}

/* ============================================================

* MAIN ANALYZER
* ============================================================ */

export function analyzePrompt(
prompt: string
): AnalysisResult {
const trimmed = prompt.trim();

if (!trimmed) {
return {
score: 0,
riskLevel: 'Low',
status: 'ALLOW',
categories: [],
indicators: [],
explanation:
'No prompt was provided for analysis.',
recommendedAction:
recommendedActions.Low,
};
}

const normalized =
normalizeSecurityText(trimmed);

const indicators: DetectedIndicator[] = [];

const categoryMap = new Map<
ThreatCategoryKey,
DetectedIndicator[]

> ();

/* ------------------------------------------------------------

* Run all rules against normalized text.
* ------------------------------------------------------------ */

for (const category of categoryDefinitions) {
for (const rule of category.rules) {
const match =
normalized.match(rule.pattern);

  if (!match) continue;

  const originalMatch =
    trimmed.match(rule.pattern);

  const indicator: DetectedIndicator = {
    category: category.key,
    pattern: rule.label,
    matchedText:
      originalMatch?.[0] ??
      match[0],
  };

  indicators.push(indicator);

  if (!categoryMap.has(category.key)) {
    categoryMap.set(
      category.key,
      []
    );
  }

  categoryMap
    .get(category.key)!
    .push(indicator);
}

}

/* ------------------------------------------------------------

* Explicit Unicode detection.
*
* This MUST happen on the original prompt because
* normalization can remove homoglyph evidence.
* ------------------------------------------------------------ */

if (
suspiciousUnicodePattern.test(trimmed) ||
invisibleUnicodePattern.test(trimmed)
) {
if (
!categoryMap.has(
'unicode_homoglyph'
)
) {
const unicodeMatch =
trimmed.match(
suspiciousUnicodePattern
) ??
trimmed.match(
invisibleUnicodePattern
);

  const indicator: DetectedIndicator = {
    category:
      'unicode_homoglyph',
    pattern:
      'Unicode evasion detected',
    matchedText:
      unicodeMatch?.[0] ??
      'Suspicious Unicode',
  };

  indicators.push(indicator);

  categoryMap.set(
    'unicode_homoglyph',
    [indicator]
  );
}

}

/* ------------------------------------------------------------

* Build category results.
* ------------------------------------------------------------ */

const categories: CategoryResult[] =
Array.from(
categoryMap.entries()
).map(
([key, categoryIndicators]) => {
const definition =
categoryDefinitions.find(
(item) =>
item.key === key
)!;

    return {
      key,
      label: definition.label,
      severity:
        escalateSeverity(
          definition.baseSeverity,
          categoryIndicators.length
        ),
      indicatorCount:
        categoryIndicators.length,
    };
  }
);

/* ------------------------------------------------------------

* No indicators.
* ------------------------------------------------------------ */

if (indicators.length === 0) {
return {
score: 0,
riskLevel: 'Low',
status: 'ALLOW',
categories: [],
indicators: [],
explanation:
buildExplanation(
[],
'Low'
),
recommendedAction:
recommendedActions.Low,
};
}

/* ------------------------------------------------------------

* Calculate risk score.
* ------------------------------------------------------------ */

let score = 0;

for (const category of categories) {
score +=
severityWeight[
category.severity
];

score +=
  (category.indicatorCount - 1) *
  5;

}

/* Multiple independent threat categories increase risk. */

if (categories.length >= 2) {
score += 10;
}

if (categories.length >= 3) {
score += 10;
}

if (categories.length >= 5) {
score += 10;
}

/* Sensitive security-boundary categories receive extra weight. */

if (
categories.some(
(category) =>
category.key ===
'tool_abuse'
)
) {
score += 10;
}

if (
categories.some(
(category) =>
category.key ===
'system_prompt_extraction'
)
) {
score += 5;
}

if (
categories.some(
(category) =>
category.key ===
'data_exfiltration'
)
) {
score += 5;
}

const finalScore =
clampScore(score);

const riskLevel =
scoreToLevel(finalScore);

return {
score: finalScore,
riskLevel,
status:
scanStatuses[riskLevel],
categories,
indicators,
explanation:
buildExplanation(
categories,
riskLevel
),
recommendedAction:
recommendedActions[
riskLevel
],
};
}