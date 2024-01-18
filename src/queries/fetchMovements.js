import { API_URL } from "../constants";

const fetchMovements = async ({ queryKey }) => {
  const path = queryKey[0];
  const authToken = sessionStorage.getItem("authToken"); // fetch will fail if this is not set
  const apiRes = await fetch(`${API_URL}${path}`, {
    mode: "cors",
    headers: {
      'Authorization': authToken ? `Token ${authToken}` : "None",
    }
  });

  if (!apiRes.ok) {
    if(apiRes.status >= 400){ // unauthenticated
      throw new Error("forbidden", {cause: apiRes.status});
    }else{
      throw new Error("unknown", {cause: `${path} list could not be fetched`});
    }
  }

  return apiRes.json();
};

export default fetchMovements;