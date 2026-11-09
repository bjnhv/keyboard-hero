import { NextRequest, NextResponse } from 'next/server';
import { syncService, HydrationData } from '@/server/services/sync.service';
import { ApiResponse } from '@/types/api';
import { getAuthenticatedUser } from '@/server/auth';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<HydrationData>>> {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to hydrate cloud practice sessions.',
          },
          meta: { timestamp: Date.now() },
        },
        { status: 401 }
      );
    }

    const data = await syncService.getHydrationData(authUser.id);

    return NextResponse.json(
      {
        success: true,
        data,
        meta: { timestamp: Date.now() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unhandled hydration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching cloud progress.',
        },
        meta: { timestamp: Date.now() },
      },
      { status: 500 }
    );
  }
}

