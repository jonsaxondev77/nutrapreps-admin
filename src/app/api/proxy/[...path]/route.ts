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

// Helper function to handle reading the request body safely
async function readRequestBody(request: NextRequest): Promise<any | null> {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 0) {
      return await request.json();
    }
  } catch (error) {
    // An empty body is expected for some requests, so we can ignore this error.
    console.warn('Could not parse request body as JSON. Assuming empty body.');
  }
  return null;
}

// Helper function to handle responses from the upstream API, including no-content status codes
async function handleResponse(response: Response) {
  const isNoContent = response.status === 204 || response.headers.get('content-length') === '0';

  if (!response.ok && !isNoContent) {
    try {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    } catch (e) {
      return NextResponse.json(
        { error: `API responded with status: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
  }

  // If there is no content, return an empty response with the correct status.
  if (isNoContent) {
    return new NextResponse(null, { status: response.status });
  }

  // All other cases will have a body to parse.
  try {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy JSON parse error:', error);
    return NextResponse.json({ error: 'Failed to parse JSON response from API.' }, { status: 500 });
  }
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
    return handleResponse(response);
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

  const body = await readRequestBody(request);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: request.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
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
  
  const body = await readRequestBody(request);

  try {
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: request.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
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

  const body = await readRequestBody(request);

  try {
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: request.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Proxy DELETE error:', error);
    return NextResponse.json({ error: 'Failed to proxy DELETE request.' }, { status: 500 });
  }
}