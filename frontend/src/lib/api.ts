export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SSR safe
  }

  try {
    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }

    if (!res.ok) {
      let data;
      try {
        data = await res.json();
      } catch {
        throw new ApiError(res.status, 'UNKNOWN_ERROR', 'An unexpected error occurred');
      }
      throw new ApiError(
        res.status,
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unexpected error occurred',
        data.error?.details
      );
    }
    
    if (res.status === 204) return null;
    return res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'NETWORK_ERROR', 'Network error. Please check your connection.');
  }
}
