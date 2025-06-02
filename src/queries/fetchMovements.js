import { API_ENDPOINTS } from "../constants";
import authenticatedFetch from "./authenticatedFetch";

const fetchMovements = async ({ queryKey }) => {
  const path = queryKey[0];
  let query = "";
  if(queryKey.length>1){
    let queryParamsObject = queryKey[1];
    query = new URLSearchParams({all: true});
    if(queryParamsObject.datefrom){
      queryParamsObject.datefrom = new Date(queryParamsObject.datefrom).toISOString().slice(0, 10);
      query.append("datefrom", queryParamsObject.datefrom);
    }
    if(queryParamsObject.dateto){
      queryParamsObject.dateto = new Date(queryParamsObject.dateto).toISOString().slice(0, 10);
      query.append("dateto", queryParamsObject.dateto);
    }
    if(queryParamsObject.category){
      query.append("category", queryParamsObject.category);
    }
    if(queryParamsObject.subcategory){
      query.append("subcategory", queryParamsObject.subcategory);
    }
    if(queryParamsObject.description){
      query.append("description", queryParamsObject.description); 
    }
    if(queryParamsObject.sort_field){
      query.append("sort_field", queryParamsObject.sort_field);
    }
    if(queryParamsObject.sort_dir){
      query.append("sort_dir", queryParamsObject.sort_dir);
    }
  }
  const movementsBase = API_ENDPOINTS.movements().toString();
  const queryString = query.toString();
  const fetchUrl = `${movementsBase}/${path}?${queryString}`;
  /* remove double slashes, except the one after the protocol */
  const cleanFetchUrl = fetchUrl.replace(/([^:]\/)\/+/g, "$1");
  console.debug(`fetchMovements: fetching ${cleanFetchUrl}`);
  const apiRes = await authenticatedFetch(cleanFetchUrl);
  
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