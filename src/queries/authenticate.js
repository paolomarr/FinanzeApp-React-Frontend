import { API_URL_MOVEMENTS } from "../constants";

const authenticate = async (user, password, what) => {
  if(!what){
    what = API_URL_MOVEMENTS;
  }
  const fd = new FormData();
  fd.set("username", user);
  fd.set("password", password);
  let url = `${what}api-token-auth/`;

  const result = await fetch(url, {
      method: "POST",
      body: fd,
      // credentials: "include",
      // redirect: "manual"
  }).then((response) => {
      if(response.ok){
          return response;
      }else{
          throw new Error("Login failed");
      }
      });
  return result;
};

export default authenticate;
