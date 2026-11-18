export const UNAUTHORIZED_EVENT = "auth:unauthorized";

const authenticatedFetch = async (path, options, headers) => {
  const authToken = localStorage.getItem("authToken"); // fetch will fail if this is not set
  const response = await fetch(path, {...options,
      mode: "cors",
      headers: {...headers,
        'Authorization': authToken ? `Token ${authToken}` : "None",
      }
  });
  if (response.status === 401) {
    // Token missing, expired (Knox TOKEN_TTL) or revoked: force a new login.
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return response;
};

export default authenticatedFetch;
