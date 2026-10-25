import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import SortimentMenu from "../../components/sortiment/SortimentMenu";
import { formatPrice } from "../../config/sortiment";
import { orderTotal, useOrderStore } from "../../stores/orderStore";
import { useSortimentStore } from "../../stores/sortimentStore";

const SortimentLayout = () => {
  const items = useOrderStore((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const status = useSortimentStore((state) => state.status);
  const pageLive = useSortimentStore((state) => state.pageLive);
  const preview = useSortimentStore((state) => state.preview);
  const fetchSortiment = useSortimentStore((state) => state.fetch);

  useEffect(() => {
    void fetchSortiment();
  }, [fetchSortiment]);

  const comingSoon = status === "ready" && !pageLive && !preview;

  return (
    <main className="min-h-screen bg-brand-cream px-6 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        {preview && (
          <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
            Förhandsvisning –{" "}
            {pageLive ? "sidan är öppen för kunder." : "kunder ser ännu inte den här sidan."} Du
            ser även utkast.{" "}
            <Link className="font-semibold underline" to="/admin/sortiment">
              Redigera sortimentet
            </Link>
          </p>
        )}

        {comingSoon ? (
          <header className="py-12 text-center">
            <h1 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">
              Beställning online kommer snart
            </h1>
            <p className="mx-auto max-w-xl text-lg text-gray-600">
              Vi förbereder vårt sortiment för beställning. Tills dess är du välkommen att höra av
              dig till oss.
            </p>
            <Link
              to="/kontakt"
              className="mt-6 inline-block rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white transition-colors hover:bg-stone-700"
            >
              Kontakta oss
            </Link>
          </header>
        ) : (
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">Sortiment</h1>
              <p className="mt-2 text-gray-600">
                Beställ tårtor, bakelser och bullar för upphämtning hos oss.
              </p>
            </div>
            <Link
              to="/sortiment/bestallning"
              className="rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white transition-colors hover:bg-stone-700"
            >
              Din beställning
              {count > 0 && ` (${count}) · ${formatPrice(orderTotal(items))}`}
            </Link>
          </header>
        )}

        {status === "loading" && (
          <p className="py-12 text-center text-gray-600" role="status">
            Hämtar sortimentet …
          </p>
        )}

        {status === "error" && (
          <div className="py-12 text-center" role="alert">
            <p className="mb-4 text-gray-700">Sortimentet kunde inte hämtas just nu.</p>
            <button
              className="rounded bg-stone-700 px-5 py-2 text-white hover:bg-stone-800"
              onClick={() => void fetchSortiment()}
            >
              Försök igen
            </button>
          </div>
        )}

        {status === "ready" && !comingSoon && (
          <div className="grid gap-8 md:grid-cols-[15rem_1fr]">
            <aside>
              <SortimentMenu />
            </aside>
            <div className="min-w-0">
              <Outlet />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default SortimentLayout;
