// components/Navigation.tsx
import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import logoImage from "../../assets/Logo_Bakverkstan_Sedan2023_transparent.webp";

interface NavigationProps {
  menuItems: {
    name: string;
    href: string;
  }[];
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

const Navigation: FC<NavigationProps> = ({
  menuItems,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const location = useLocation();

  return (
    <>
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
        <div className="fixed inset-0 z-40 bg-stone-400 transform transition-transform duration-500 ease-in-out">
          <div className="flex justify-between items-center p-4">
            <img src={logoImage} className="h-30 md:h-16" alt="Logo" />
          </div>

          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] -mt-20 space-y-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-2xl md:text-3xl text-gray-800 hover:text-white font-medium transform transition-all duration-300 hover:scale-110"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="absolute top-0 left-0 right-0 z-30 hidden md:block">
        <div
          className={`${
            location.pathname === "/" ? "bg-white/80" : "bg-stone-400"
          } backdrop-blur-sm border-b border-gray-200`}
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-center space-x-8 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-800 hover:text-gray-600 font-medium transition-colors duration-200 uppercase text-sm tracking-wider relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-gray-600 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
