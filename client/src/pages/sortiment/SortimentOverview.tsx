import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import OrderInfo from "../../components/sortiment/OrderInfo";
import { sortimentImage } from "../../services/sortiment";
import { useSortimentStore } from "../../stores/sortimentStore";

const SortimentOverview = () => {
  const { hash } = useLocation();
  const categories = useSortimentStore((state) => state.categories);

  // React Router doesn't scroll to #anchors, so the submenu links need this.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <ul className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              to={`/sortiment/${category.slug}`}
              className="group block h-full overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              {category.image ? (
                <img
                  src={sortimentImage(category.image) ?? undefined}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-brand-sand" />
              )}
              <div className="p-5">
                <h2 className="mb-1 text-xl font-bold text-gray-800">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <OrderInfo />
    </>
  );
};

export default SortimentOverview;
