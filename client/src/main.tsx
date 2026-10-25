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
import AdminSortiment from "./pages/AdminSortiment";
import SortimentLayout from "./pages/sortiment/SortimentLayout";
import SortimentOverview from "./pages/sortiment/SortimentOverview";
import SortimentCategory from "./pages/sortiment/SortimentCategory";
import SortimentProduct from "./pages/sortiment/SortimentProduct";
import SortimentOrder from "./pages/sortiment/SortimentOrder";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="bakverk" element={<Bakverk />} />
      <Route path="sortiment" element={<SortimentLayout />}>
        <Route index element={<SortimentOverview />} />
        <Route path="bestallning" element={<SortimentOrder />} />
        <Route path=":category" element={<SortimentCategory />} />
        <Route path=":category/:product" element={<SortimentProduct />} />
      </Route>
      <Route path="pask" element={<Pask />} />
      <Route path="presenter" element={<Presenter />} />
      <Route path="workshops" element={<Workshops />} />
      <Route path="kontakt" element={<Kontakt />} />
      <Route path="admin" element={<Admin />} />
      <Route path="admin/sortiment" element={<AdminSortiment />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
