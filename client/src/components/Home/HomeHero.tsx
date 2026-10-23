import { Link } from "react-router-dom";
import { menuItems } from "../../config/navigation";
import RotatingWord from "./RotatingWord";
import logo from "../../assets/BakverstandLogoBlack.png";
import InstagramSlideshow from "./InstagramSlideshow";
import bakverkImage from "../../assets/kardemummabullar.webp";
import workshopImage from "../../assets/workshopCard.webp";
import kontaktImage from "../../assets/SeniorOnPhone.webp";

const descriptions: Record<string, string> = {
  "/bakverk": "Tårtor, kakor och bröd",
  "/workshops": "Baka tillsammans med oss",
  "/kontakt": "Hör av dig",
};

const images: Record<string, string> = {
  "/bakverk": bakverkImage,
  "/workshops": workshopImage,
  "/kontakt": kontaktImage,
};

const links = menuItems.filter((item) => item.href !== "/");

const HomeHero = () => (
  <>
    <section
      id="hero"
      className="relative overflow-hidden bg-brand-sand font-outfit text-white"
    >
      <div className="relative z-10 grid min-h-screen items-center gap-6 px-15 pb-44 pt-24 md:grid-cols-2 md:gap-10 md:pb-24">
        <div>
          <h1 className="max-w-full text-5xl font-bold leading-tight sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl text-stone-600">
            <span className="sr-only">Vi bakar med hjärtat</span>
            <span aria-hidden="true" className="block pt-4 md:pt-6">
              Vi bakar
            </span>
            <span className="block min-h-[1.2em]">
              <RotatingWord />
            </span>
            <span aria-hidden="true" className="block">
              med hjärtat
            </span>
          </h1>

          <h2 className="mt-8 max-w-full font-outfit text-xl  leading-tight sm:text-2xl md:text-xl lg:text-xl xl:text-2xl text-stone-600">
            <span aria-hidden="true" className="block">
              Bakverkstan är specialiserad i konditori och catering. Vi utgår
              från Helsingborg och vår bageri. Vi skapar allt från grunden med
              mycket passion och kunskap.
            </span>
          </h2>
        </div>

        <InstagramSlideshow className="relative aspect-square w-full rounded-2xl md:hidden" />
      </div>

      <InstagramSlideshow className="absolute inset-y-0 right-0 hidden w-1/2 [clip-path:url(#slideshow-curve)] md:block" />

      <svg aria-hidden="true" className="absolute h-0 w-0">
        <clipPath id="slideshow-curve" clipPathUnits="objectBoundingBox">
          <path d="M0.09 0 H1 V1 H0.09 Q-0.09 0.5 0.09 0 Z" />
        </clipPath>
      </svg>

      <img
        src={logo}
        alt="Bakverkstan"
        className="absolute left-15 top-6 z-20 h-20 w-auto md:h-30"
      />

      <a
        href="#vad-vi-gor"
        aria-label="Vad vi gör"
        className="absolute bottom-28 left-8 z-20 text-amber-500 transition-transform hover:translate-y-1 md:bottom-10 md:left-15"
      >
        <svg
          aria-hidden="true"
          className="h-8 w-12 animate-bounce"
          viewBox="0 0 48 32"
          fill="currentColor"
        >
          <path d="M0 4 24 24 48 4v8L24 32 0 12z" />
        </svg>
      </a>

      <a
        href="#vad-vi-gor"
        aria-label="Scrolla till Vad vi gör"
        className="absolute inset-x-0 bottom-0 z-10 h-24 md:hidden focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-amber-400"
      >
        <svg
          aria-hidden="true"
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="M0 0 50 100 100 0v100H0z" className="fill-brand-cream" />
        </svg>
      </a>
    </section>

    <section
      id="vad-vi-gor"
      className="bg-white px-6 pb-20 pt-6 text-center sm:bg-stone-900"
    >
      <h2 className="text-3xl font-bold text-stone-900 md:text-4xl">
        Vad vi gör
      </h2>
      <ul className="mx-auto mt-10 grid max-w-6xl grid-cols-3 gap-3 sm:gap-6">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-stone-900 sm:rounded-3xl text-left"
            >
              <img
                src={images[item.href]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 via-35% to-transparent to-60%"
              />
              <span className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-6">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-amber-300 sm:text-sm sm:tracking-widest">
                  {item.name}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-tight sm:mt-2 sm:text-2xl md:text-3xl">
                  {descriptions[item.href]}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  </>
);

export default HomeHero;
