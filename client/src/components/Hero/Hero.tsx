import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoImage from "../../assets/logoBakverkstanWhite.png";
import backgroundImage from "../../assets/kardemummabullar.png";
import bakverkImage from "../../assets/cake.webp";
import hanna from "../../assets/hannacontact.webp";
import easterBackground from "../../assets/EasterBackground1.webp";
import presentBackground from "../../assets/cakeFruit.webp";
import workshopImage from "../../assets/workshop.webp";

const Hero = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const heroImages = {
    "/": backgroundImage,
    "/bakverk": bakverkImage,
    "/pask": easterBackground,
    "/presenter": presentBackground,
    "/workshops": workshopImage,
    "/kontakt": hanna,
  } as const;

  const menuItems = [
    { name: "Hem", href: "/" },
    { name: "Bakverk", href: "/bakverk" },
    { name: "Påsk", href: "/pask" },
    { name: "Presenter", href: "/presenter" },
    { name: "Workshops", href: "/workshops" },
    { name: "Kontakt", href: "/kontakt" },
  ] as const;

  const currentHeroImage =
    heroImages[location.pathname as keyof typeof heroImages] || heroImages["/"];

  const maxScroll = window.innerHeight / 2;
  const heightPercentage = isHomePage
    ? Math.max(50, 100 - (scrollPosition / maxScroll) * 50)
    : 50;
  const parallaxOffset = isHomePage ? scrollPosition * 0.5 : 0;

  return (
    <div
      className="relative w-full overflow-hidden transition-[height] duration-300 ease-out"
      style={{ height: `${heightPercentage}vh` }}
    >
      {/* Social Media Icons */}
      {!isMenuOpen && (
        <div className="fixed top-8 md:top-20 left-8 md:right-8 md:left-auto z-50 flex space-x-6">
          {/* Social Media Icons - Adjusted for mobile left alignment */}
          <div className="fixed top-8 md:top-20 left-8 md:right-8 md:left-auto z-50 flex space-x-6">
            <a
              href="https://instagram.com/bagare79"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors duration-200 transform hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/hanna.vandergragt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors duration-200 transform hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-md md:hidden backdrop-blur-sm"
        aria-label="Toggle menu"
      >
        <svg
          className="w-8 h-10 text-gray-200"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-stone-400 transform transition-all duration-500 ease-in-out">
          <div className="flex justify-between items-center p-4">
            <img src={logoImage} className="h-30 md:h-16" alt="Logo" />
          </div>
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] -mt-20 space-y-8">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `text-2xl md:text-3xl font-medium transform transition-all duration-300 hover:scale-110 ${
                    isActive ? "text-white" : "text-gray-800 hover:text-white"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="absolute top-0 left-0 right-0 z-30 hidden md:block">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-center space-x-8 py-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `text-gray-800 font-medium transition-colors duration-200 uppercase text-sm tracking-wider relative 
                    after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gray-600 
                    after:transition-transform after:duration-300 
                    ${
                      isActive
                        ? "after:scale-x-100"
                        : "after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image with Parallax */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
        }}
      >
        <img
          src={currentHeroImage}
          alt="Hero"
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Logo */}
      <div
        className="relative flex items-center justify-center transition-all duration-300"
        style={{ height: `${heightPercentage}vh` }}
      >
        <img
          src={logoImage}
          alt="Bakverkstan Logo"
          className={`z-10 ${
            isHomePage ? "w-64 md:w-96" : "w-64 md:w-96"
          } transition-all duration-300`}
          style={{
            transform: isHomePage
              ? `scale(${Math.max(
                  0.5,
                  1 - (scrollPosition / maxScroll) * 0.5
                )})`
              : "scale(0.5)",
          }}
        />
      </div>
    </div>
  );
};

export default Hero;
