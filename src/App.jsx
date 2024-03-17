import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useRef } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import { t } from "@lingui/macro";

const getRouteMap = () => [
  { path: "/", title: t`Movement list`, element: <Home /> },
  { path: "/login", title: t`Login`, element: <LoginForm /> },
  { path: "/logout", title: t`Logout`, element: <LoginForm logout={true}/> },
];

function App() {
  const pageTitle = useRef(getRouteMap()[0].title);
  let location = useLocation();
  const navigate = useNavigate();
  for (const route of getRouteMap()) {
    if(location.pathname === route.path){
      pageTitle.current = route.title;
      break;
    }
  }
  return (
    <>
      <Container >
        <Header title={pageTitle.current} onLogout={() => navigate("/logout")}/>
        <Routes>
          {getRouteMap().map((route, key) => {
            return <Route key={key} path={route.path} element={route.element} />  
          })}
        </Routes>
      </Container>
      <Footer />
    </>    
  );
}

export default App;
