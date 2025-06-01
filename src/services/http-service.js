export const ServerURL = `${process.env.PROTOCOL}://${window.location.hostname}${process.env.PROTOCOL == 'http' ? `:${process.env.API_PORT}` : ''}`;
export const SocketURL = 
  `${process.env.PROTOCOL == 'https' ? 'wss' : 'ws'}://` +
  `${window.location.hostname}${process.env.PROTOCOL == 'http' ? `:${process.env.WS_PORT}` : ''}`;

export const defaultHeaders = {
  'Content-Type': 'application/json',
};

export function HttpRequest(route, body, extendedHeaders = {}) {
  const headers = {
    ...defaultHeaders,
    ...extendedHeaders,
  };

  return fetch(`${ServerURL}${route}`, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
    body: JSON.stringify(body),
  })
  .then(response => response.json())
  .catch(error => {
    return {
      message: error.message,
      error: true,
    };
  });
}