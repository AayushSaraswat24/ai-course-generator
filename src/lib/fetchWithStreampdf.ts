type StreamFetchOptions = {
  path: string;
  method?: 'GET' | 'POST';
  data: File;
};

export async function fetchStreamPdf({
  path,
  method = 'POST',
  data,
}: StreamFetchOptions): Promise<{
  error: any;
  statusCode: number;
  stream: ReadableStream<Uint8Array> | null;
}> {
  try {
      const formData = new FormData();
      formData.append('file', data as File);
    // First request
    let res = await fetch(path, {
      method,
      body: formData,
      credentials: 'include',
    });

    // Handle session expired
    if (res.status === 401) {
      try {
        const errData = await res.clone().json().catch(() => null);
        if (errData?.message === 'Session Expired') {
          const refreshRes = await fetch('/api/auth/refresh-token', {
            method: 'POST',
            credentials: 'include',
          });

          const refreshJson = await refreshRes.json();
          if (!refreshJson.success) {
            return { stream: null, error: refreshJson, statusCode: 401 };
          }

          // Retry original request after refresh
          res = await fetch(path, {
            method,
            body: formData,
            credentials: 'include',
          });
        }
      } catch (refreshErr) {
        return {
          stream: null,
          error: { message: 'Retry failed after refresh' },
          statusCode: 401,
        };
      }
    }

    // If non-streaming error
    if (!res.ok && res.status !== 200) {
      const errJson = await res.clone().json().catch(() => null);
      return {
        stream: null,
        error: errJson || { message: 'Unknown error' },
        statusCode: res.status,
      };
    }

    // At this point, success => return the stream
    return {
      stream: res.body, 
      error: null,
      statusCode: res.status,
    };
  } catch (err: any) {
    return {
      stream: null,
      error: { message: err?.message || 'Network or unexpected error' },
      statusCode: 500,
    };
  }
}
