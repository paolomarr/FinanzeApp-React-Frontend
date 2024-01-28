const authenticatedFecth = (path, options, headers) => {
  const authToken = sessionStorage.getItem("authToken"); // fetch will fail if this is not set
    return fetch(path, {...options, 
        mode: "cors",
        headers: {...headers,
          'Authorization': authToken ? `Token ${authToken}` : "None",
        }
    });
};

export default authenticatedFecth;