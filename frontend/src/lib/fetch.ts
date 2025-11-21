/* eslint-disable @typescript-eslint/no-explicit-any */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const createCustomFetch = (
  getAccessToken: () => string | null,
  getRefreshToken: () => string | null,
  logout: () => void,
  apiRefresh: (refreshToken: string) => Promise<{ accessToken: string }>,
  setAccessToken: (token: string) => void
) => {
  return async (url: string, options: RequestInit) => {
    const token = getAccessToken();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, options);

      if (response.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              logout();
              return Promise.reject(new Error("No refresh token available"));
            }
            const { accessToken: newAccessToken } = await apiRefresh(refreshToken);
            setAccessToken(newAccessToken);
            processQueue(null, newAccessToken);
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${newAccessToken}`,
            };
            return await fetch(url, options);
          } catch (error) {
            processQueue(error, null);
            logout();
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise<string | null>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              if (token) {
                options.headers = {
                  ...options.headers,
                  Authorization: `Bearer ${token}`,
                };
                return fetch(url, options);
              }
              return Promise.reject(new Error("Failed to refresh token"));
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }
      }

      return response;
    } catch (error) {
      return Promise.reject(error);
    }
  };
};

export default createCustomFetch;
