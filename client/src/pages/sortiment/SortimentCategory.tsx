import { Link, Navigate, useParams } from "react-router-dom";
import { formatPrice } from "../../config/sortiment";
import { lowestPrice, sortimentImage } from "../../services/sortiment";
import { useCategory } from "../../stores/sortimentStore";

const SortimentCategory = () => {
  const category = useCategory(useParams().category);
  if (!category) return <Navigate to="/sortiment" replace />;

  return (
    <>
      <header className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">{category.name}</h2>
        <p className="text-gray-600">{category.description}</p>
        <p className="mt-1 text-sm text-gray-500">
          Beställ minst {category.leadDays} {category.leadDays === 1 ? "dag" : "dagar"} innan
          upphämtning.
        </p>
      </header>

      {category.products.length === 0 && (
        <p className="text-gray-600">Inga produkter i den här kategorin ännu.</p>
      )}

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {category.products.map((product) => (
          <li key={product.slug}>
            <Link
              to={`/sortiment/${category.slug}/${product.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              {sortimentImage(product.image, category.image) ? (
                <img
                  src={sortimentImage(product.image, category.image) ?? undefined}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="aspect-square w-full bg-brand-sand" />
              )}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-1 text-lg font-bold text-gray-800">
                  {product.name}
                  {!product.published && (
                    <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 align-middle text-xs font-medium text-amber-900">
                      Utkast
                    </span>
                  )}
                </h3>
                <p className="mb-4 flex-1 text-gray-600">{product.description}</p>
                <p className="font-semibold text-stone-800">
                  {product.sizes.length > 1 ? "Från " : ""}
                  {formatPrice(lowestPrice(product))}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SortimentCategory;
