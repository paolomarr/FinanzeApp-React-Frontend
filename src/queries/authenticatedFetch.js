const authenticatedFecth = (path) => {
  const authToken = sessionStorage.getItem("authToken"); // fetch will fail if this is not set
    return fetch(path, {
        mode: "cors",
        headers: {
          'Authorization': authToken ? `Token ${authToken}` : "None",
        }
    });
};

export default authenticatedFecth;