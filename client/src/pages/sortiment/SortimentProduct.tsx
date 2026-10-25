import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatPrice } from "../../config/sortiment";
import {
  productAddOns,
  sortimentImage,
  type Product,
  type SortimentCategory,
} from "../../services/sortiment";
import { useOrderStore } from "../../stores/orderStore";
import { useCategory } from "../../stores/sortimentStore";

const field = "w-full rounded border border-gray-300 px-3 py-2";

const ProductDetails = ({
  category,
  product,
}: {
  category: SortimentCategory;
  product: Product;
}) => {
  const addItem = useOrderStore((state) => state.addItem);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // Selected extras keyed by id, with the text the customer typed (if any).
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const size = product.sizes[sizeIndex];
  const addOns = productAddOns(category, product);
  const chosenAddOns = addOns.filter((addOn) => addOn.id in selected);
  const total = (size.price + chosenAddOns.reduce((sum, addOn) => sum + addOn.price, 0)) * quantity;

  const toggle = (id: string) => {
    setAdded(false);
    setSelected((current) => {
      const next = { ...current };
      if (id in next) delete next[id];
      else next[id] = "";
      return next;
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    addItem({
      categorySlug: category.slug,
      productSlug: product.slug,
      productName: product.name,
      sizeLabel: size.label,
      unitPrice: size.price,
      quantity,
      addOns: chosenAddOns.map(({ id, name, price }) => ({
        id,
        name,
        price,
        note: selected[id].trim() || undefined,
      })),
    });
    setAdded(true);
  };

  return (
    <article>
      <p className="mb-4 text-sm text-gray-500">
        <Link className="hover:underline" to="/sortiment">
          Sortiment
        </Link>{" "}
        /{" "}
        <Link className="hover:underline" to={`/sortiment/${category.slug}`}>
          {category.name}
        </Link>
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {sortimentImage(product.image, category.image) && (
            <img
              src={sortimentImage(product.image, category.image) ?? undefined}
              alt={product.name}
              className="mb-6 aspect-square w-full rounded-2xl object-cover shadow-md"
            />
          )}
          <section className="rounded-2xl bg-white p-6 shadow-md">
            {product.ingredients.length > 0 && (
              <>
                <h3 className="mb-2 font-semibold text-gray-800">Ingredienser</h3>
                <p className="mb-5 text-gray-700">{product.ingredients.join(", ")}.</p>
              </>
            )}
            <h3 className="mb-2 font-semibold text-gray-800">Allergener</h3>
            {product.allergens.length === 0 && <p className="text-gray-700">Inga angivna.</p>}
            <ul className="flex flex-wrap gap-2">
              {product.allergens.map((allergen) => (
                <li
                  key={allergen}
                  className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-900 ring-1 ring-amber-200"
                >
                  {allergen}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">{product.name}</h2>
          <p className="mb-6 text-gray-600">{product.description}</p>

          <fieldset className="mb-6">
            <legend className="mb-2 font-semibold text-gray-800">Storlek och pris</legend>
            <div className="space-y-2">
              {product.sizes.map((option, index) => (
                <label
                  key={option.label}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 ${
                    index === sizeIndex ? "border-stone-800 bg-stone-50" : "border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="size"
                      checked={index === sizeIndex}
                      onChange={() => {
                        setSizeIndex(index);
                        setAdded(false);
                      }}
                    />
                    {option.label}
                  </span>
                  <span className="font-semibold">{formatPrice(option.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {addOns.length > 0 && (
            <fieldset className="mb-6">
              <legend className="mb-2 font-semibold text-gray-800">Tillval</legend>
              <div className="space-y-2">
                {addOns.map((addOn) => {
                  const checked = addOn.id in selected;
                  return (
                    <div
                      key={addOn.id}
                      className={`rounded-lg border px-4 py-3 ${
                        checked ? "border-stone-800 bg-stone-50" : "border-gray-200"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start justify-between gap-4">
                        <span className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            onChange={() => toggle(addOn.id)}
                          />
                          <span>
                            {addOn.name}
                            {addOn.description && (
                              <span className="block text-sm text-gray-500">
                                {addOn.description}
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="whitespace-nowrap">+ {formatPrice(addOn.price)}</span>
                      </label>
                      {checked && addOn.inputLabel && (
                        <label className="mt-3 block text-sm">
                          {addOn.inputLabel}
                          <input
                            className={`${field} mt-1`}
                            maxLength={60}
                            value={selected[addOn.id]}
                            onChange={(event) =>
                              setSelected((current) => ({
                                ...current,
                                [addOn.id]: event.target.value,
                              }))
                            }
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          )}

          <label className="mb-6 block">
            <span className="mb-2 block font-semibold text-gray-800">Antal</span>
            <input
              type="number"
              min={1}
              max={50}
              className={`${field} max-w-28`}
              value={quantity}
              onChange={(event) => {
                setQuantity(Math.max(1, Number(event.target.value) || 1));
                setAdded(false);
              }}
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-5">
            <p className="text-2xl font-bold text-gray-800">{formatPrice(total)}</p>
            <button
              type="submit"
              className="rounded-lg bg-stone-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-stone-700"
            >
              Lägg till i beställningen
            </button>
          </div>

          {added && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-green-900" role="status">
              Tillagd!{" "}
              <Link className="font-semibold underline" to="/sortiment/bestallning">
                Gå till din beställning
              </Link>
            </p>
          )}
        </form>
      </div>
    </article>
  );
};

const SortimentProduct = () => {
  const params = useParams();
  const category = useCategory(params.category);
  const product = category?.products.find((item) => item.slug === params.product);
  if (!category || !product) return <Navigate to="/sortiment" replace />;

  // The key resets the form when the customer picks another product in the submenu.
  return <ProductDetails key={product.slug} category={category} product={product} />;
};

export default SortimentProduct;
