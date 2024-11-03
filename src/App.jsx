import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import React, { useState } from "react";
import Footer from "./components/Footer";
import UserContext from './contexts/UserContext.jsx';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import MainNavbar from "./components/MainNavbar.jsx";
// import Header from "./components/Header";

// Create a client
const queryClient = new QueryClient();

function App() {
  // const pageTitle = useRef(getRouteMap()[0].title);
  // let location = useLocation();
  // const navigate = useNavigate();
  const loggedUser = useState(null);
  

  // for (const route of getRouteMap()) {
  //   if(location.pathname === route.path){
  //     pageTitle.current = route.title;
  //     break;
  //   }
  // }
  return (
    <UserContext.Provider value={loggedUser}>
      <QueryClientProvider client={queryClient}>
        {/* <Header title={pageTitle.current} onLogout={() => navigate("/logout")}/> */}
        <MainNavbar />
        <Container fluid="sm">
          <div className="text-center">
            <h1>Titolo</h1>
          </div>
          <Outlet />
        </Container>
        <Footer />
      </QueryClientProvider>
    </UserContext.Provider>    
  );
}

export default App;
