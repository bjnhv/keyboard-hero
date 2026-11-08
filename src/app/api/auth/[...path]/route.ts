import { NextRequest, NextResponse } from 'next/server';

const NEON_AUTH_BASE_URL =
  process.env.NEON_AUTH_BASE_URL ??
  'https://ep-dry-dream-b9mjiwyf.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth';

/**
 * Handles all Next.js API requests directed to /api/auth/*
 * and securely proxies them to the managed Neon Auth endpoint.
 */
async function handleAuthProxy(request: NextRequest, pathParams: { path: string[] }) {
  const subpath = pathParams.path.join('/');
  const targetUrl = `${NEON_AUTH_BASE_URL}/${subpath}${request.nextUrl.search}`;

  const forwardHeaders = new Headers();

  // Forward Content-Type and Authorization if present
  const contentType = request.headers.get('content-type');
  if (contentType) forwardHeaders.set('content-type', contentType);

  const authHeader = request.headers.get('authorization');
  if (authHeader) forwardHeaders.set('authorization', authHeader);

  // Forward incoming cookies (session token, challenge cookies)
  const incomingCookieHeader = request.headers.get('cookie');
  if (incomingCookieHeader) {
    // If incoming cookies have neon-auth.*, also supply __Secure-neon-auth.* so Neon Auth recognizes it
    const parts = incomingCookieHeader.split(';').map((p) => p.trim());
    const upstreamCookies: string[] = [];
    for (const part of parts) {
      upstreamCookies.push(part);
      if (part.startsWith('neon-auth.')) {
        upstreamCookies.push(`__Secure-${part}`);
      }
    }
    forwardHeaders.set('cookie', upstreamCookies.join('; '));
  }

  // Inject allowed origin for Neon Auth backend acceptance
  forwardHeaders.set('origin', 'http://localhost:3000');

  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: body ? body : undefined,
    });

    const responseData = await upstreamResponse.text();

    const response = new NextResponse(responseData, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });

    // Copy Content-Type
    const resContentType = upstreamResponse.headers.get('content-type');
    if (resContentType) {
      response.headers.set('content-type', resContentType);
    }

    // Forward ALL Set-Cookie headers from Neon Auth to browser client
    const isHttps = request.nextUrl.protocol === 'https:';
    const rawSetCookies =
      typeof upstreamResponse.headers.getSetCookie === 'function'
        ? upstreamResponse.headers.getSetCookie()
        : [upstreamResponse.headers.get('set-cookie')].filter(Boolean) as string[];

    for (const cookieStr of rawSetCookies) {
      if (!isHttps) {
        // Over plain HTTP (e.g. localhost), browsers strictly reject __Secure- prefix and SameSite=None without Secure
        const localhostCookie = cookieStr
          .replace(/__Secure-/g, '')
          .replace(/;\s*Secure/gi, '')
          .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
          .replace(/;\s*Partitioned/gi, '');
        response.headers.append('set-cookie', localhostCookie);
      } else {
        response.headers.append('set-cookie', cookieStr);
      }
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Auth proxy error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleAuthProxy(request, resolvedParams);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleAuthProxy(request, resolvedParams);
}
