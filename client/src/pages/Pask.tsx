import React from "react";
import instagramLogo from "../assets/instagram.png";

const Pask: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-20">
      <h1 className="text-2xl font-bold mb-4">
        This website is updated soon. Please follow us on Instagram for now!
      </h1>
      <a
        href="https://instagram.com/bagare79"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
      >
        <img
          src={instagramLogo}
          alt="Instagram"
          className="w-6 h-6 object-contain"
        />
        <span>instagram.com/bagare79</span>
      </a>
    </div>
  );
};

export default Pask;
