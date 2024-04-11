import { API_URL } from "../constants";
import authenticatedFetch from "./authenticatedFetch";

const mutateMovement = async ({ movement, _delete }) => {
  const path = "movements/";
  let url = `${API_URL}${path}`;
  let fetch_options = {
    method: "POST"
  }
  let headers = {};
  if(movement.id){
    url += `${movement.id}`;
    if(!_delete){ // PUT
      fetch_options.method = "PUT";
      fetch_options.body = JSON.stringify(movement);
      headers["Content-Type"] = "application/json";
    }else{
      fetch_options.method = "DELETE";
    }
  }else{
    headers["Content-Type"] = "application/json";
  }
  const apiRes = await authenticatedFetch(url, fetch_options, headers);
  
  if (!apiRes.ok) {
    if(apiRes.status == 400){ // bad request
      throw new Error("bad request", {cause: await apiRes.json()});
    }else if(apiRes.status > 400){
      throw new Error("forbidden", {cause: apiRes.status});
    }else{
      throw new Error("unknown", {cause: `${path} list could not be fetched`});
    }
  }

  return apiRes.json();
};

export default mutateMovement;