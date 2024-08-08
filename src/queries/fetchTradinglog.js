import { API_URL_TRADINGLOG } from "../constants";
import authenticatedFetch from "./authenticatedFetch";

const fetchTradinglog = async ({ queryKey }) => {
  const path = queryKey[0];
  let query = "";
  if(queryKey.length>1){
    query = new URLSearchParams(queryKey[1]);
  }
  const apiRes = await authenticatedFetch(`${API_URL_TRADINGLOG}${path}?${query.toString()}`);
  
  if (!apiRes.ok) {
    if(apiRes.status >= 400){ // unauthenticated
      throw new Error("forbidden", {cause: apiRes.status});
    }else{
      throw new Error("unknown", {cause: `${path} list could not be fetched`});
    }
  }

  return apiRes.json();
};

export default fetchTradinglog;