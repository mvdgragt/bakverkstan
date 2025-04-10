// pages/Bakverk.tsx
import { FC } from "react";
import logoImage from "../assets/Logo_Bakverkstan_Sedan2023_transparent.webp";

const Bakverk: FC = () => {
  return (
    <div className="relative w-full">
      <div className="h-[33vh] bg-stone-400 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={logoImage}
            alt="Bakverkstan Logo"
            className="z-10 w-48 md:w-64"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Bakverk</h1>
        {/* Add your page content here */}
      </div>
    </div>
  );
};

export default Bakverk;
