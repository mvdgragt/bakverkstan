import { useState } from "react";
import heroImage from "../../assets/EasterBackground.png";
import logoImage from "../../assets/Logo_Bakverkstan_Sedan2023_transparent.webp";

const Hero = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Hem", href: "/" },
    { name: "Bakverk", href: "/bakverk" },
    { name: "Påsk", href: "/pask" },
    { name: "Presenter", href: "/presenter" },
    { name: "Workshops", href: "/workshops" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "Kontakt", href: "/kontakt" },
  ];

  return (
    <div className="relative h-screen w-full max-w-full overflow-hidden">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-md md:hidden backdrop-blur-sm"
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
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-400 transform transition-transform duration-500 ease-in-out"
          style={{
            animation: isMenuOpen
              ? "slideIn 0.5s ease-in-out forwards"
              : "slideOut 0.5s ease-in-out forwards",
          }}
        >
          <div className="flex justify-between items-center p-4">
            <img src={logoImage} className="h-30 md:h-16" />
          </div>

          {/* Menu Items */}
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] -mt-20 space-y-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-2xl md:text-3xl text-gray-800 hover:text-white font-medium transform transition-all duration-300 hover:scale-110"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
      ;{/* Desktop Navigation */}
      <div className="absolute top-0 left-0 right-0 z-30 hidden md:block">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-center space-x-8 py-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 uppercase text-sm tracking-wider relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-gray-600 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Hero Image and Logo */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="relative h-full flex items-center justify-center">
        <img
          src={logoImage}
          alt="Bakverkstan Logo"
          className="z-10 w-64 md:w-96"
        />
      </div>
    </div>
  );
};

export default Hero;
