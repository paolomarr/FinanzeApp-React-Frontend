import { API_URL } from "../constants";
import authenticatedFetch from "./authenticatedFetch";

const fetchCategories = async ({ queryKey }) => {
  const path = queryKey[0];
  const apiRes = await authenticatedFetch(new URL(path, API_URL));

  if (!apiRes.ok) {
    if(apiRes.status >= 400){ // unauthenticated
      throw new Error("forbidden", {cause: apiRes.status});
    }else{
      throw new Error("unknown", {cause: `${path} list could not be fetched`});
    }
  }

  return apiRes.json();
};

export default fetchCategories;