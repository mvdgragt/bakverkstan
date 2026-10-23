import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import "./index.css";
import App from "./App.js";
import Home from "./pages/Home";
import Bakverk from "./pages/Bakverk";
import Pask from "./pages/Pask";
import Presenter from "./pages/Presenter";
import Workshops from "./pages/Workshops";
import Kontakt from "./pages/Kontakt";
import Admin from "./pages/Admin";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="bakverk" element={<Bakverk />} />
      <Route path="pask" element={<Pask />} />
      <Route path="presenter" element={<Presenter />} />
      <Route path="workshops" element={<Workshops />} />
      <Route path="kontakt" element={<Kontakt />} />
      <Route path="admin" element={<Admin />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
