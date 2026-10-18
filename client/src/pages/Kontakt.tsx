import cakeFruit from "../assets/cakeFruit.webp";

// Fill in your Swish number to show the Swish box on the page.
const SWISH_NUMBER = "";

const ADDRESS = "Bäckamansgatan 6, 252 30 Helsingborg";
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=15&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

const card = "rounded-2xl bg-white p-6 shadow-md";

const Kontakt = () => (
  <main className="bg-amber-50/60 px-6 py-12 md:px-10">
    <div className="mx-auto max-w-6xl">
      <header className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">
          Hej och välkommen!
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Har du frågor om tårtor, beställningar eller workshops? Hör av dig så
          hjälper vi dig gärna.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className={card}>
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Bakverkstan
            </h2>
            <address className="mb-5 not-italic text-gray-600">
              Bäckamansgatan 6<br />
              252 30 Helsingborg
            </address>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>Tel:</strong>{" "}
                <a
                  className="underline hover:text-gray-900"
                  href="tel:+46733793913"
                >
                  0733 79 39 13
                </a>
              </li>
              <li>
                <strong>Mail:</strong>{" "}
                <a
                  className="underline hover:text-gray-900"
                  href="mailto:info@bakverkstan.se"
                >
                  info@bakverkstan.se
                </a>
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                className="rounded-lg bg-stone-700 px-4 py-2 font-medium text-white hover:bg-stone-800"
                href="https://instagram.com/bakverkstan.se"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>

              <a
                className="rounded-lg bg-stone-100 px-4 py-2 font-medium text-stone-700 hover:bg-stone-200"
                href={MAP_LINK}
                target="_blank"
                rel="noreferrer"
              >
                Vägbeskrivning
              </a>
            </div>
          </div>

          {SWISH_NUMBER && (
            <div className={card}>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Betala med Swish
              </h2>
              <p className="text-gray-600">
                Swish-nummer:{" "}
                <strong className="text-gray-800">{SWISH_NUMBER}</strong>
              </p>
            </div>
          )}

          <img
            src={cakeFruit}
            alt="Tårta från Bakverkstan"
            loading="lazy"
            className="h-56 w-full rounded-2xl object-cover shadow-md md:flex-1"
          />
        </div>

        <iframe
          title={`Karta över ${ADDRESS}`}
          src={MAP_SRC}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-96 w-full rounded-2xl border-0 shadow-md md:h-full md:min-h-[32rem]"
        />
      </div>
    </div>
  </main>
);

export default Kontakt;
