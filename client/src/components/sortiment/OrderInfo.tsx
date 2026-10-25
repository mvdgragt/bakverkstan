import { ORDER_EMAIL, PICKUP_ADDRESS } from "../../config/sortiment";
import { useSortimentStore } from "../../stores/sortimentStore";

const card = "scroll-mt-24 rounded-2xl bg-white p-6 shadow-md md:p-8";
const heading = "mb-4 text-2xl font-bold text-gray-800";
const subheading = "mt-6 mb-2 font-semibold text-gray-800";

const OrderInfo = () => {
  const categories = useSortimentStore((state) => state.categories);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section id="bestallning-upphamtning" className={card}>
        <h2 className={heading}>Beställning &amp; upphämtning</h2>
        <ol className="list-decimal space-y-2 pl-5 text-gray-700">
          <li>Välj produkt, storlek och eventuella tillval.</li>
          <li>Lägg till i din beställning och välj dag för upphämtning.</li>
          <li>Skicka beställningen. Vi bekräftar den via e-post eller telefon.</li>
        </ol>

        <h3 className={subheading}>Framförhållning</h3>
        <ul className="space-y-1 text-gray-700">
          {categories.map((category) => (
            <li
              key={category.slug}
              className="flex justify-between gap-4 border-b border-stone-100 py-1"
            >
              <span>{category.name}</span>
              <span className="text-gray-600">
                {category.leadDays} {category.leadDays === 1 ? "dag" : "dagar"}
              </span>
            </li>
          ))}
        </ul>

        <h3 className={subheading}>Upphämtning</h3>
        <p className="text-gray-700">
          Beställningen hämtas hos oss på {PICKUP_ADDRESS}. Ta med kylväska för tårtor och
          smörgåstårtor om du har en längre resa.
        </p>

        <h3 className={subheading}>Större beställningar</h3>
        <p className="text-gray-700">
          Bröllop, företagsevent eller något helt eget? Mejla{" "}
          <a className="underline hover:text-gray-900" href={`mailto:${ORDER_EMAIL}`}>
            {ORDER_EMAIL}
          </a>{" "}
          så tar vi fram ett förslag.
        </p>
      </section>

      <section id="avtalsvillkor" className={card}>
        <h2 className={heading}>Avtalsvillkor</h2>

        <h3 className={subheading}>Bekräftelse</h3>
        <p className="text-gray-700">
          En beställning är bindande först när vi har bekräftat den. Hör du inget från oss inom ett
          dygn, ring oss gärna.
        </p>

        <h3 className={subheading}>Betalning</h3>
        <p className="text-gray-700">
          Betalning sker vid upphämtning med kort eller Swish. Alla priser anges i kronor inklusive
          moms.
        </p>

        <h3 className={subheading}>Ändring och avbokning</h3>
        <p className="text-gray-700">
          Ändringar och avbokningar görs senast 48 timmar före upphämtning. Vid senare avbokning
          debiteras 50 % av beställningens värde, eftersom vi då redan har börjat baka.
        </p>

        <h3 className={subheading}>Allergier</h3>
        <p className="text-gray-700">
          Vi hanterar gluten, mjölk, ägg och nötter i vårt bageri. Även när en produkt saknar en
          allergen kan spår förekomma. Berätta om allergier i din beställning.
        </p>

        <h3 className={subheading}>Hämtning och förvaring</h3>
        <p className="text-gray-700">
          Ej hämtade beställningar debiteras fullt. Ansvaret för produkten övergår till dig vid
          upphämtning. Förvara tårtor kallt och ät dem helst samma dag.
        </p>
      </section>
    </div>
  );
};

export default OrderInfo;
