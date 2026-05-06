// API error type
interface ApiError {
  message: string;
  status?: number;
}

// Define Api Response
interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Define fetch configuration with query parameters
interface FetchConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number>;
}

export async function fetchData<T>(
  url: string,
  config: FetchConfig = {},
): Promise<ApiResponse<T>> {
  try {
    let finalUrl = url;

    if (config.queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(config.queryParams)) {
        params.append(key, value.toString());
      }
      finalUrl = `${url}?${params.toString()}`;
    }

    const response = await fetch(finalUrl, {
      method: config.method || 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      return {
        error: {
          message: `HTTP error ${response.statusText}`,
          status: response.status,
        },
      };
    }

    // Parse and return data
    const data: T = await response.json();
    return { data };
  } catch (error) {
    // Handle network error or others
    return {
      error: {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
  }
}
