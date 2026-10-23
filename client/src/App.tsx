import "./App.css";
import Hero from "./components/Hero/Hero";
import { Outlet, ScrollRestoration } from "react-router-dom";

function App() {
  return (
    <>
      <ScrollRestoration />
      <Hero />
      <Outlet />
    </>
  );
}

export default App;
