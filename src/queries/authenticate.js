import { API_URL } from "../constants";

const authenticate = async (user, password) => {
  const fd = new FormData();
  fd.set("username", user);
  fd.set("password", password);
  let url = `${API_URL}api-token-auth/`;

  const result = await fetch(url, {
      method: "POST",
      body: fd,
      // credentials: "include",
      // redirect: "manual"
  })
      .then((response) => {
      if(response.ok){
          return response;
      }else{
          throw new Error("Login failed");
      }
      });
  return result;
};

export default authenticate;
