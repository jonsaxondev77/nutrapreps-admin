import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

function getApiUrl(request: NextRequest): string | null {
  if (!API_URL) {
    return null;
  }
  const { pathname, search } = new URL(request.url);
  const apiPath = pathname.replace('/api/proxy', '');
  return `${API_URL}${apiPath}${search}`;
}

export async function GET(request: NextRequest) {
  const fullUrl = getApiUrl(request);
  if (!fullUrl) {
    return NextResponse.json({ error: 'API_URL is not configured on the server.' }, { status: 500 });
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: request.headers,
    });

    if (!response.ok) {
      // If the response is not OK, return a descriptive error message from the proxy.
      return NextResponse.json({ error: `API responded with status: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy GET error:', error);
    return NextResponse.json({ error: 'Failed to proxy GET request.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const fullUrl = getApiUrl(request);
  if (!fullUrl) {
    return NextResponse.json({ error: 'API_URL is not configured on the server.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // If the response is not OK, return a descriptive error message from the proxy.
      return NextResponse.json({ error: `API responded with status: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json({ error: 'Failed to proxy POST request.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const fullUrl = getApiUrl(request);
  if (!fullUrl) {
    return NextResponse.json({ error: 'API_URL is not configured on the server.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: request.headers,
      body: JSON.stringify(body),
    });

    // Handle responses with no content (204) immediately.
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Check if the response is not OK.
    if (!response.ok) {
      // Return a descriptive error from the proxy.
      return NextResponse.json(
        { error: `API responded with status: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Attempt to parse JSON only if the response is OK and not 204.
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Proxy PUT error:', error);
    return NextResponse.json({ error: 'Failed to proxy PUT request.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const fullUrl = getApiUrl(request);
  if (!fullUrl) {
    return NextResponse.json({ error: 'API_URL is not configured on the server.' }, { status: 500 });
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: request.headers,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!response.ok) {
      // Return a descriptive error from the proxy.
      return NextResponse.json(
        { error: `API responded with status: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy DELETE error:', error);
    return NextResponse.json({ error: 'Failed to proxy DELETE request.' }, { status: 500 });
  }
}