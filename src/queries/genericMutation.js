import authenticatedFetch from "./authenticatedFetch";

const mutateObjectWithPath = async ({ basepath, path, object, _delete }) => {
  let url = `${basepath.replace(/\/+$/, "")}/${path}`;
  let fetch_options = {}
  let headers = {};
  if(object.id){
    url += `${object.id}`;
    if(!_delete){ // PUT
      fetch_options.method = "PUT";
      fetch_options.body = JSON.stringify(object);
      headers["Content-Type"] = "application/json";
    }else{ // DELETE. No body
      fetch_options.method = "DELETE";
    }
  }else{ // POST
    fetch_options.method = "POST";
    fetch_options.body = JSON.stringify(object);
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

  const contentLenString = apiRes.headers.get("Content-Length");
  if(contentLenString && parseInt(contentLenString)>0){
    return apiRes.json();
  }else{
    return apiRes;
  }
};

export default mutateObjectWithPath;