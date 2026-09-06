import { TelemetryRecord } from './types';

class AIObservabilityPipeline {
  private inMemoryLogs: TelemetryRecord[] = [];
  private readonly maxLogRetention = 200;

  public logStart(requestId: string, task: string, model: string, userId?: string, productId?: string) {
    console.log(`[AI Diagnostics] ▶ START req=${requestId} task=${task} model=${model} user=${userId ? userId.substring(0, 8) + '...' : 'anon'}${productId ? ' prod=' + productId : ''}`);
  }

  public recordTelemetry(record: TelemetryRecord) {
    this.inMemoryLogs.push(record);
    if (this.inMemoryLogs.length > this.maxLogRetention) {
      this.inMemoryLogs.shift();
    }

    const status = record.success ? '✔ SUCCESS' : '✖ FAILURE';
    const fallbackInfo = record.fallbackUsed ? ` (Fallback: ${record.fallbackReason})` : '';
    console.log(
      `[AI Diagnostics] ${status} req=${record.requestId} task=${record.task} model=${record.model} duration=${record.durationMs}ms${fallbackInfo}${record.error ? ' error=' + record.error : ''}`
    );
  }

  public getRecentLogs(limit = 50): TelemetryRecord[] {
    return this.inMemoryLogs.slice(-limit);
  }

  public getHealthSummary(): {
    totalRequests: number;
    successRate: number;
    fallbackCount: number;
    averageDurationMs: number;
  } {
    if (this.inMemoryLogs.length === 0) {
      return { totalRequests: 0, successRate: 100, fallbackCount: 0, averageDurationMs: 0 };
    }

    const total = this.inMemoryLogs.length;
    const successes = this.inMemoryLogs.filter(l => l.success).length;
    const fallbacks = this.inMemoryLogs.filter(l => l.fallbackUsed).length;
    const totalDuration = this.inMemoryLogs.reduce((acc, l) => acc + l.durationMs, 0);

    return {
      totalRequests: total,
      successRate: Math.round((successes / total) * 100),
      fallbackCount: fallbacks,
      averageDurationMs: Math.round(totalDuration / total),
    };
  }
}

export const aiObservability = new AIObservabilityPipeline();
