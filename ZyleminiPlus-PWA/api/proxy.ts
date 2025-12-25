// Vercel serverless function
type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  query?: Record<string, string | string[]>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

// Handle CORS preflight
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-target-url, x-target-method, LoginId, Password, ClientCode, DeviceId, authheader, FcmToken, LogUserId, AppApiVersion');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get HTTP method from header or use request method
  const httpMethod = (req.headers['x-target-method'] as string) || req.method || 'GET';
  
  // Validate method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  if (!allowedMethods.includes(httpMethod.toUpperCase())) {
    return res.status(405).json({ error: `Method ${httpMethod} not allowed` });
  }

  // Get the target URL from header
  let targetUrl = req.headers['x-target-url'] as string;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing x-target-url header' });
  }

  try {
    // Extract headers from request, preserving case-sensitive headers
    const headers: Record<string, string> = {};
    
    // Copy all headers except host, x-target-url, x-target-method, and content-length (will be set by fetch)
    Object.keys(req.headers).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'host' && 
          lowerKey !== 'x-target-url' && 
          lowerKey !== 'x-target-method' &&
          lowerKey !== 'content-length' &&
          lowerKey !== 'connection' &&
          lowerKey !== 'accept-encoding') {
        const value = req.headers[key];
        if (typeof value === 'string') {
          headers[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          headers[key] = value[0];
        }
      }
    });

    // Determine target host from URL
    const url = new URL(targetUrl);
    const targetHost = url.hostname;
    
    // Set Host header
    headers['Host'] = targetHost;

    // Get request body - Vercel automatically parses JSON, but we need to send it as string
    let body: string | null = null;
    if (req.body !== undefined && req.body !== null) {
      // If body is already a string, use it; otherwise stringify
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (Object.keys(req.body).length === 0) {
        // Empty object means no body (for POST with null body)
        body = '';
      } else {
        body = JSON.stringify(req.body);
      }
    }

    // For GET requests, append query params to URL if present
    if (httpMethod.toUpperCase() === 'GET' && req.query) {
      const urlObj = new URL(targetUrl);
      Object.keys(req.query).forEach(key => {
        const value = req.query![key];
        if (value) {
          urlObj.searchParams.append(key, Array.isArray(value) ? value[0] : value);
        }
      });
      targetUrl = urlObj.toString();
    }

    // Make the proxied request with the specified method
    const fetchOptions: RequestInit = {
      method: httpMethod,
      headers: headers,
    };
    
    // Only include body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(httpMethod.toUpperCase()) && body !== null) {
      fetchOptions.body = body;
    }
    
    const response = await fetch(targetUrl, fetchOptions);

    // Get response data
    const data = await response.text();
    let parsedData: any;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }

    // Forward response
    res.status(response.status).json(parsedData);
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      message: error.message 
    });
  }
}

