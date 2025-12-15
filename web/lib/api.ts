// utils/api.ts
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(
    // ${process.env.NEXT_PUBLIC_API_URL}
  'api/'+
    `${endpoint}`, {
    ...options,
    headers,
  });

    // Detect content type
  const contentType = response.headers.get('content-type') || '';

  // If it's JSON
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      // Try to show detailed error from backend
      const message = data?.message || response.statusText;
      throw new Error(`API Error: ${message}`);
    }
    return data; // ✅ normal API calls work
  }

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ API error [${endpoint}]:`, error);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response;
}
