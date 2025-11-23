const authenticatedFetch = (path, options, headers) => {
  const authToken = localStorage.getItem("authToken"); // fetch will fail if this is not set
  return fetch(path, {...options, 
      mode: "cors",
      headers: {...headers,
        'Authorization': authToken ? `Token ${authToken}` : "None",
      }
  });
};

export default authenticatedFetch;