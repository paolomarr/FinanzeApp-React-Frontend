import { Routes, Route, useLocation } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useRef } from "react";
import Header from "./components/Header";
import MovimentiList from "./components/MovimentiList";
import LoginForm from "./components/LoginForm";


const routeMap = [
  { path: "/", title: "Movement list", element: <MovimentiList /> },
  { path: "/login", title: "Login", element: <LoginForm /> },
];

function App() {
  const pageTitle = useRef(routeMap[0].title);
  let location = useLocation();
  for (const route of routeMap) {
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
          {routeMap.map((route, key) => {
            return <Route key={key} path={route.path} element={route.element} />  
          })}
        </Routes>
      </Container>
    </>    
  );
}

export default App;
