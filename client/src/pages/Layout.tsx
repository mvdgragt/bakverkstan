import { Outlet } from "react-router-dom";
import Navigation from "../components/navigation/Navigation";
import SocialMedia from "../components/socialMedia/SocialMedia";

const Layout = () => {
  return (
    <div className="relative min-h-screen">
      {/* Social Media Icons */}
      <SocialMedia />

      {/* Navigation */}
      <Navigation />

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default Layout;
