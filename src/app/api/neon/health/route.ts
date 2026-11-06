import { NextResponse } from 'next/server';
import { checkNeonServices } from '@/server/neon';

export async function GET() {
  const status = await checkNeonServices();
  return NextResponse.json({
    status: status.postgres.connected ? 'healthy' : 'degraded',
    services: status,
    timestamp: new Date().toISOString(),
  });
}

