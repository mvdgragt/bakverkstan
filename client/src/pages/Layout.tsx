import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navigation from "../components/navigation/Navigation";
import SocialMedia from "../components/socialMedia/SocialMedia";

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Hem", href: "/" },
    { name: "Bakverk", href: "/bakverk" },
    { name: "Påsk", href: "/pask" },
    { name: "Presenter", href: "/presenter" },
    { name: "Workshops", href: "/workshops" },
    { name: "Kontakt", href: "/kontakt" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Social Media Icons */}
      <SocialMedia />

      {/* Navigation */}
      <Navigation
        menuItems={menuItems}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default Layout;
