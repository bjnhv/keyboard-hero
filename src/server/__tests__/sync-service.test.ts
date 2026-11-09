import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractSessionToken } from '../auth';
import { syncService } from '../services/sync.service';
import { NextRequest } from 'next/server';
import { SyncBatchPayloadDto } from '../dtos/sync.dto';

describe('Server Auth & Token Extraction', () => {
  it('extracts token from Authorization: Bearer header', () => {
    const req = new NextRequest('http://localhost:3000/api/sync/hydrate', {
      headers: {
        authorization: 'Bearer test-bearer-token-123',
      },
    });

    const token = extractSessionToken(req);
    expect(token).toBe('test-bearer-token-123');
  });

  it('extracts token from neon-auth.session_token cookie', () => {
    const req = new NextRequest('http://localhost:3000/api/sync/hydrate', {
      headers: {
        cookie: 'neon-auth.session_token=cookie-session-token-456; other=val',
      },
    });

    const token = extractSessionToken(req);
    expect(token).toBe('cookie-session-token-456');
  });

  it('extracts token from __Secure-neon-auth.session_token cookie', () => {
    const req = new NextRequest('http://localhost:3000/api/sync/hydrate', {
      headers: {
        cookie: '__Secure-neon-auth.session_token=secure-token-789',
      },
    });

    const token = extractSessionToken(req);
    expect(token).toBe('secure-token-789');
  });

  it('returns null if neither header nor cookie are present', () => {
    const req = new NextRequest('http://localhost:3000/api/sync/hydrate');
    const token = extractSessionToken(req);
    expect(token).toBeNull();
  });
});

describe('Sync Service Unit Tests', () => {
  it('gracefully handles session sync in offline / disconnected state', async () => {
    const mockPayload: SyncBatchPayloadDto = {
      sessions: [
        {
          id: 'test-session-1',
          stageId: 2,
          completedAt: new Date().toISOString(),
          syncStatus: 'pending',
          syncRetries: 0,
          createdAt: Date.now(),
          metrics: {
            wpm: 55,
            rawWpm: 60,
            cpm: 300,
            accuracy: 96,
            consistency: 85,
            durationMs: 15000,
            correctCount: 75,
            errorCount: 3,
            totalKeystrokes: 78,
            wpmHistory: [],
            keyMetrics: {
              f: {
                key: 'f',
                hits: 20,
                misses: 1,
                avgDwellTimeMs: 110,
                errorRate: 4.7,
              },
            },
          },
        },
      ],
      clientTimestamp: Date.now(),
    };

    const res = await syncService.syncSessions(mockPayload);
    expect(res.syncedIds).toContain('test-session-1');
    expect(typeof res.serverTimestamp).toBe('number');
  });

  it('provides safe fallback data when hydrating in disconnected environment', async () => {
    // With non-existent user in mock or offline mode
    const data = await syncService.getHydrationData('00000000-0000-0000-0000-000000000000');
    expect(Array.isArray(data.sessions)).toBe(true);
    expect(Array.isArray(data.keyStats)).toBe(true);
  });
});

