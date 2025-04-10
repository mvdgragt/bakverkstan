import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/bakverk" element={<App />} />
        <Route path="/pask" element={<App />} />
        <Route path="/presenter" element={<App />} />
        <Route path="/workshops" element={<App />} />
        <Route path="/kontakt" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
