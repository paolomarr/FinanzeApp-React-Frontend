import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Header from "./components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MovimentiList from "./components/MovimentiList";
import LoginForm from "./components/LoginForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

// import Home from "./components/Home";

function App() {
  return (
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Header />
          <Routes>
            <Route path="/" element={<MovimentiList />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </QueryClientProvider>
        {/* <Home /> */}
    </BrowserRouter>
  );
}

export default App;
