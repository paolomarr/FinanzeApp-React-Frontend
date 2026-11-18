import { Outlet, useLocation, useMatches, useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import React, { useEffect, useState } from "react";
import Footer from "./components/Footer";
import UserContext from './contexts/UserContext.jsx';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import MainNavbar from "./components/MainNavbar.jsx";
import { UNAUTHORIZED_EVENT } from "./queries/authenticatedFetch.js";
// import Header from "./components/Header";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // never retry on 401: the user must log in again
      retry: (failureCount, error) => error?.cause !== 401 && failureCount < 3,
    },
  },
});

function App() {
  // const pageTitle = useRef(getRouteMap()[0].title);
  // let location = useLocation();
  // const navigate = useNavigate();
  const loggedUser = useState(null);
  const [, setUser] = loggedUser;
  const navigate = useNavigate();
  useEffect(() => {
    const onUnauthorized = () => {
      queryClient.cancelQueries();
      queryClient.clear(); // drop cached data belonging to the expired session
      setUser(null);
      if (window.location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [navigate, setUser]);
  const matches = useMatches();
  const location = useLocation();
  const pathMatching = matches.findLast((match)=> match.handle && location.pathname.indexOf(match.pathname)>=0);
  let title = "titolo";
  if(pathMatching && pathMatching.handle){
    title = pathMatching.handle.title();
  }else{
    console.log("ERROR: could not find a match object that matches current path");
  }
  return (
    <UserContext.Provider value={loggedUser}>
      <QueryClientProvider client={queryClient}>
        {/* <Header title={pageTitle.current} onLogout={() => navigate("/logout")}/> */}
        <MainNavbar />
        <Container fluid="sm">
          <div className="text-center">
            <h1>{title}</h1>
          </div>
          <Outlet />
        </Container>
        <Footer />
      </QueryClientProvider>
    </UserContext.Provider>    
  );
}

export default App;
