import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoImage from "../../assets/logoBakverkstanWhite.png";
import backgroundImage from "../../assets/kardemummabullar.png";
import bakverkImage from "../../assets/cake.webp";
import hanna from "../../assets/hannacontact.webp";
import easterBackground from "../../assets/easterBackground.webp";
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
          {/* Add your social media icons here */}
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
