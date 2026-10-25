import { NavLink } from "react-router-dom";

const tab = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-5 py-2 text-sm font-medium transition ${
    isActive ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
  }`;

const AdminTabs = () => (
  <nav aria-label="Admin" className="mb-6 flex gap-2">
    <NavLink to="/admin" end className={tab}>
      Workshops
    </NavLink>
    <NavLink to="/admin/sortiment" className={tab}>
      Sortiment
    </NavLink>
  </nav>
);

export default AdminTabs;
