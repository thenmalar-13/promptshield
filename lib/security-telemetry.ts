
export type TelemetryDecision =
  | 'ALLOW'
  | 'REVIEW'
  | 'BLOCK';

export type SecurityEvent = {
  id: string;
  timestamp: string;

  // Security scores
  ruleScore: number;
  aiScore: number | null;
  finalScore: number;

  // Decision
  decision: TelemetryDecision;

  // Threat information
  primaryThreat: string;
  threatCount: number;

  // AI information
  aiConfidence: number | null;
  aiModel: string | null;

  // Gateway information
  llmForwarded: boolean;
  llmModel: string | null;
  llmSuccess: boolean;

  // Performance
  latencyMs: number;

  // Privacy-preserving prompt information
  promptLength: number;
  promptHash: string;
};

const STORAGE_KEY = 'promptshield-security-events';

const MAX_EVENTS = 500;

/**
 * Create a privacy-preserving hash.
 *
 * We intentionally do NOT store the raw prompt in telemetry.
 * Only a lightweight fingerprint is stored so the same request
 * can be recognized without exposing its contents.
 */
export async function hashPrompt(
  prompt: string
): Promise<string> {
  try {
    if (
      typeof window !== 'undefined' &&
      window.crypto?.subtle
    ) {
      const encoder = new TextEncoder();

      const data = encoder.encode(prompt);

      const hashBuffer =
        await window.crypto.subtle.digest(
          'SHA-256',
          data
        );

      const hashArray = Array.from(
        new Uint8Array(hashBuffer)
      );

      return hashArray
        .map((byte) =>
          byte.toString(16).padStart(2, '0')
        )
        .join('');
    }
  } catch (error) {
    console.error(
      'Prompt hashing failed:',
      error
    );
  }

  // Fallback fingerprint for environments where
  // Web Crypto is unavailable.
  let hash = 0;

  for (let i = 0; i < prompt.length; i++) {
    hash =
      (hash << 5) -
      hash +
      prompt.charCodeAt(i);

    hash |= 0;
  }

  return `fallback-${Math.abs(hash)}`;
}

/**
 * Read all telemetry events.
 */
export function getSecurityEvents(): SecurityEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as SecurityEvent[];
  } catch (error) {
    console.error(
      'Failed to read security telemetry:',
      error
    );

    return [];
  }
}

/**
 * Store a new security event.
 */
export function saveSecurityEvent(
  event: SecurityEvent
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing =
      getSecurityEvents();

    const updated = [
      event,
      ...existing,
    ].slice(0, MAX_EVENTS);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error(
      'Failed to save security telemetry:',
      error
    );
  }
}

/**
 * Remove all locally stored telemetry.
 */
export function clearSecurityEvents(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(
      STORAGE_KEY
    );
  } catch (error) {
    console.error(
      'Failed to clear security telemetry:',
      error
    );
  }
}

/**
 * Create a telemetry event.
 */
export async function createSecurityEvent({
  prompt,
  ruleScore,
  aiScore,
  finalScore,
  decision,
  primaryThreat,
  threatCount,
  aiConfidence,
  aiModel,
  llmForwarded,
  llmModel,
  llmSuccess,
  latencyMs,
}: {
  prompt: string;
  ruleScore: number;
  aiScore: number | null;
  finalScore: number;
  decision: TelemetryDecision;
  primaryThreat: string;
  threatCount: number;
  aiConfidence: number | null;
  aiModel: string | null;
  llmForwarded: boolean;
  llmModel: string | null;
  llmSuccess: boolean;
  latencyMs: number;
}): Promise<SecurityEvent> {
  const promptHash =
    await hashPrompt(prompt);

  const event: SecurityEvent = {
    id:
      typeof crypto !== 'undefined' &&
      'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,

    timestamp:
      new Date().toISOString(),

    ruleScore,
    aiScore,
    finalScore,

    decision,

    primaryThreat,
    threatCount,

    aiConfidence,
    aiModel,

    llmForwarded,
    llmModel,
    llmSuccess,

    latencyMs,

    promptLength: prompt.length,
    promptHash,
  };

  saveSecurityEvent(event);

  return event;
}
