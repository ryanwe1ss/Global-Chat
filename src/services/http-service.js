export const absoluteURL = process.env.BACKEND_SERVER;
export const defaultHeaders = {
  'Content-Type': 'application/json',
};

export function HttpRequest(route, body, extendedHeaders = {}) {
  const headers = {
    ...defaultHeaders,
    ...extendedHeaders,
  };

  return fetch(absoluteURL + route, {
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