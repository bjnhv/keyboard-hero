import { NextRequest, NextResponse } from 'next/server';
import { SyncBatchPayloadSchema } from '@/server/dtos/sync.dto';
import { syncService } from '@/server/services/sync.service';
import { ApiResponse } from '@/types/api';
import { SyncBatchResponse } from '@/types/sync';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SyncBatchResponse>>> {
  try {
    const rawBody = await req.json();
    const parseResult = SyncBatchPayloadSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid sync payload',
            details: parseResult.error.errors.map((err) => ({
              field: err.path.join('.'),
              code: err.code,
              message: err.message,
            })),
          },
          meta: { timestamp: Date.now() },
        },
        { status: 400 }
      );
    }

    const result = await syncService.syncSessions(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: { timestamp: Date.now() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unhandled sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while processing sync.',
        },
        meta: { timestamp: Date.now() },
      },
      { status: 500 }
    );
  }
}
