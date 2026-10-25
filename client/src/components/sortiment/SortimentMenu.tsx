import { Link, NavLink, useParams } from "react-router-dom";
import { useSortimentStore } from "../../stores/sortimentStore";

const link = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 transition-colors ${
    isActive ? "bg-stone-800 text-white" : "text-stone-700 hover:bg-stone-100"
  }`;

const subLink = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-1.5 text-sm transition-colors ${
    isActive ? "font-semibold text-stone-900" : "text-stone-600 hover:text-stone-900"
  }`;

// Categories with the products of the open category listed underneath.
const MenuLinks = () => {
  const { category } = useParams();
  const categories = useSortimentStore((state) => state.categories);

  return (
    <ul className="space-y-1">
      {categories.map((item) => (
        <li key={item.slug}>
          <NavLink to={`/sortiment/${item.slug}`} end className={link}>
            {item.name}
          </NavLink>
          {item.slug === category && (
            <ul className="mt-1 mb-2 ml-3 border-l border-stone-200 pl-2">
              {item.products.map((product) => (
                <li key={product.slug}>
                  <NavLink to={`/sortiment/${item.slug}/${product.slug}`} className={subLink}>
                    {product.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
      <li className="border-t border-stone-200 pt-3 mt-3">
        <Link to="/sortiment#bestallning-upphamtning" className={link({ isActive: false })}>
          Beställning &amp; upphämtning
        </Link>
      </li>
      <li>
        <Link to="/sortiment#avtalsvillkor" className={link({ isActive: false })}>
          Avtalsvillkor
        </Link>
      </li>
    </ul>
  );
};

const SortimentMenu = () => (
  <nav aria-label="Sortiment">
    <details className="rounded-2xl bg-white p-4 shadow-md md:hidden">
      <summary className="cursor-pointer font-semibold text-stone-800">Kategorier</summary>
      <div className="mt-3">
        <MenuLinks />
      </div>
    </details>
    <div className="sticky top-20 hidden rounded-2xl bg-white p-4 shadow-md md:block">
      <MenuLinks />
    </div>
  </nav>
);

export default SortimentMenu;
