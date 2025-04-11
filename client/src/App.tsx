import "./App.css";
import Hero from "./components/Hero/Hero";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Hero />
      <Outlet />
    </>
  );
}

export default App;
