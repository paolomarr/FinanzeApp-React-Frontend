import { Routes, Route, useLocation } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useRef } from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import { t } from "@lingui/macro";

const getRouteMap = () => [
  { path: "/", title: t`Movement list`, element: <Home /> },
  { path: "/login", title: t`Login`, element: <LoginForm /> },
];

function App() {
  const pageTitle = useRef(getRouteMap()[0].title);
  let location = useLocation();
  for (const route of getRouteMap()) {
    if(location.pathname === route.path){
      pageTitle.current = route.title;
      break;
    }
  }
  return (
    <>
      <Header title={pageTitle.current}/>
      <Container >
        <Routes>
          {getRouteMap().map((route, key) => {
            return <Route key={key} path={route.path} element={route.element} />  
          })}
        </Routes>
      </Container>
    </>    
  );
}

export default App;
