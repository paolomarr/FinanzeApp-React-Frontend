import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import React, { useRef, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import AssetsManager from "./components/Assets.jsx";
import { t } from "@lingui/macro";
import UserContext from './contexts/UserContext.jsx';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const getRouteMap = () => [
  { path: "/", title: t`Movements overview`, element: <Home /> },
  { path: "/assets", title: t`Balance records`, element: <AssetsManager /> },
  { path: "/login", title: t`Login`, element: <LoginForm /> },
  { path: "/logout", title: t`Logout`, element: <LoginForm logout={true}/> },
];

// Create a client
const queryClient = new QueryClient();

function App() {
  const pageTitle = useRef(getRouteMap()[0].title);
  let location = useLocation();
  const navigate = useNavigate();
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
        <Header title={pageTitle.current} onLogout={() => navigate("/logout")}/>
        <Container fluid="sm">
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
