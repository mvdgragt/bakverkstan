import heroImage from "../assets/804.25102-Header_Pasen_04_Desktop.png";
import logoImage from "../assets/Logo_Bakverkstan_Sedan2023_transparent.webp";

const Hero = () => {
  return (
    <div className="h-screen w-screen relative">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
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
