import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  
  const wahaBaseUrl = process.env.WAHA_BASE_URL || 'http://178.104.127.220:3000';
  const apiKey = process.env.WAHA_API_KEY || 'key_Z9s561T3AdkBlkciQ73wt7oag2yEurGA';
  
  const targetUrl = `${wahaBaseUrl}/api/files/${path}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': request.headers.get('accept') || '*/*',
      },
      // Ensure we don't cache 401s or 404s in fetch
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Proxy error for WAHA API file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
