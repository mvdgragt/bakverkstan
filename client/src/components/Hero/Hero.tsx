const Hero = () => {
  return (
    <div className="h-screen w-screen relative">
      {/* Image container with dark overlay */}
      <div className="absolute inset-0">
        <img
          src="src/assets/804.25102-Header_Pasen_04_Desktop.png"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Centered logo */}
      <div className="relative h-full flex items-center justify-center">
        <img
          src="src/assets/Logo_Bakverkstan_Sedan2023_transparent.webp"
          alt="Bakverkstan Logo"
          className="z-10 w-64 md:w-96" // Adjust the width (w-64 md:w-96) as needed for your logo
        />
      </div>
    </div>
  );
};

export default Hero;
