import { Routes, Route, useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import React, { useRef, useState } from "react";
import Footer from "./components/Footer";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import AssetsManager from "./components/Assets.jsx";
import { t } from "@lingui/macro";
import UserContext from './contexts/UserContext.jsx';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import MainNavbar from "./components/MainNavbar.jsx";
import Trading from "./components/Trading.jsx";
import CategoryManager from "./components/CategoryManager.jsx";
// import Header from "./components/Header";

const getRouteMap = () => [
  { path: "/", title: t`Movements overview`, element: <Home /> },
  { path: "/assets", title: t`Balance records`, element: <AssetsManager /> },
  { path: "/login", title: t`Login`, element: <LoginForm /> },
  { path: "/logout", title: t`Login`, element: <LoginForm logout={true}/> },
  { path: "/trading", title: t`Trading`, element: <Trading /> },
  { path: "/categories", title: t`Manage categories`, element: <CategoryManager /> },
];

// Create a client
const queryClient = new QueryClient();

function App() {
  const pageTitle = useRef(getRouteMap()[0].title);
  let location = useLocation();
  // const navigate = useNavigate();
  const loggedUser = useState(null);
  

  for (const route of getRouteMap()) {
    if(location.pathname === route.path){
      pageTitle.current = route.title;
      break;
    }
  }
  return (
    <UserContext.Provider value={loggedUser}>
      <QueryClientProvider client={queryClient}>
        {/* <Header title={pageTitle.current} onLogout={() => navigate("/logout")}/> */}
        <MainNavbar />
        <Container fluid="sm">
          <div className="text-center">
            <h1>{pageTitle.current}</h1>
          </div>
          <Routes>
            {getRouteMap().map((route, key) => {
              return <Route key={key} path={route.path} element={route.element} />
            })}
          </Routes>
        </Container>
        <Footer />
      </QueryClientProvider>
    </UserContext.Provider>    
  );
}

export default App;
