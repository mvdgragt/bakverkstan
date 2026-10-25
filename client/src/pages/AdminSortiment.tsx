import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLogin from "../components/admin/AdminLogin";
import AdminTabs from "../components/admin/AdminTabs";
import {
  BUILTIN_IMAGES,
  fetchAdminSortiment,
  saveAdminSortiment,
  slugify,
  sortimentImage,
  type AddOn,
  type Product,
  type SortimentCategory,
} from "../services/sortiment";
import { logout, uploadImage } from "../services/workshops";

const input = "w-full rounded border border-gray-300 px-3 py-2";
const smallButton = "rounded border border-stone-400 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-40";
const removeButton = "text-sm text-red-700 underline hover:text-red-900";

const num = (value: string) => (value === "" ? 0 : Number(value));

const move = <T,>(list: T[], index: number, delta: number) => {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + delta, 0, item);
  return next;
};

// Keep the web address in step with the name until someone edits it by hand.
const renamed = <T extends { name: string; slug: string }>(item: T, name: string): T =>
  item.slug === slugify(item.name) ? { ...item, name, slug: slugify(name) } : { ...item, name };

const blankCategory = (): SortimentCategory => ({
  id: crypto.randomUUID(),
  slug: "",
  name: "",
  description: "",
  image: null,
  leadDays: 1,
  addOns: [],
  products: [],
});

const blankProduct = (): Product => ({
  id: crypto.randomUUID(),
  slug: "",
  name: "",
  description: "",
  ingredients: [],
  allergens: [],
  sizes: [{ label: "1 st", price: 0 }],
  hiddenAddOns: [],
  image: null,
  published: false,
});

const blankAddOn = (): AddOn => ({
  id: crypto.randomUUID(),
  name: "",
  price: 0,
  description: "",
  inputLabel: "",
});

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700">
    <span className="mb-1 block">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs font-normal text-gray-500">{hint}</span>}
  </label>
);

// Comma-separated list. Keeps its own text so typing a comma isn't swallowed.
const ListInput = ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => {
  const [text, setText] = useState(value.join(", "));
  return (
    <textarea
      className={input}
      rows={2}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(",").map((part) => part.trim()).filter(Boolean));
      }}
    />
  );
};

const ImagePicker = ({
  image,
  fallback,
  emptyLabel,
  onChange,
  onError,
}: {
  image: string | null;
  fallback?: string | null;
  emptyLabel: string;
  onChange: (image: string | null) => void;
  onError: (message: string) => void;
}) => {
  const preview = sortimentImage(image, fallback);
  const uploaded = image !== null && !(image in BUILTIN_IMAGES);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {preview ? (
        <img src={preview} alt="" className="h-20 w-28 rounded object-cover" />
      ) : (
        <div className="h-20 w-28 rounded bg-stone-100" />
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          className="rounded border border-gray-300 px-2 py-1.5"
          value={image ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">{emptyLabel}</option>
          {uploaded && <option value={image}>Uppladdad bild</option>}
          {Object.entries(BUILTIN_IMAGES).map(([key, { label }]) => (
            <option key={key} value={key}>
              Webbplatsens bild: {label}
            </option>
          ))}
        </select>
        <label className={`${smallButton} cursor-pointer`}>
          Ladda upp foto
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) uploadImage(file).then(onChange, (error: Error) => onError(error.message));
            }}
          />
        </label>
      </div>
    </div>
  );
};

const AddOnsEditor = ({
  addOns,
  onChange,
}: {
  addOns: AddOn[];
  onChange: (addOns: AddOn[]) => void;
}) => {
  const update = (id: string, patch: Partial<AddOn>) =>
    onChange(addOns.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
    <section className="mt-6">
      <h3 className="mb-1 font-semibold text-gray-800">Tillval</h3>
      <p className="mb-3 text-sm text-gray-600">
        Extra saker kunden kan välja till produkterna i kategorin, t.ex. text på tårtan. Du kan
        stänga av enskilda tillval per produkt.
      </p>
      <ul className="space-y-3">
        {addOns.map((a, index) => (
          <li key={a.id} className="rounded border border-gray-200 p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
              <Field label="Namn">
                <input className={input} maxLength={80} value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} />
              </Field>
              <Field label="Pris (kr)">
                <input type="number" min={0} className={input} value={a.price} onChange={(e) => update(a.id, { price: num(e.target.value) })} />
              </Field>
              <Field label="Beskrivning (valfri)">
                <input className={input} maxLength={200} value={a.description} onChange={(e) => update(a.id, { description: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Fråga till kunden (valfri)" hint='Visar ett textfält när tillvalet väljs, t.ex. "Vilken text vill du ha?"'>
                  <input className={input} maxLength={80} value={a.inputLabel} onChange={(e) => update(a.id, { inputLabel: e.target.value })} />
                </Field>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" className={smallButton} disabled={index === 0} onClick={() => onChange(move(addOns, index, -1))} aria-label="Flytta upp">↑</button>
              <button type="button" className={smallButton} disabled={index === addOns.length - 1} onClick={() => onChange(move(addOns, index, 1))} aria-label="Flytta ner">↓</button>
              <button type="button" className={`${removeButton} ml-auto`} onClick={() => onChange(addOns.filter((x) => x.id !== a.id))}>
                Ta bort tillval
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className={`${smallButton} mt-3`} onClick={() => onChange([...addOns, blankAddOn()])}>
        + Nytt tillval
      </button>
    </section>
  );
};

const ProductEditor = ({
  product,
  category,
  onChange,
  onError,
}: {
  product: Product;
  category: SortimentCategory;
  onChange: (product: Product) => void;
  onError: (message: string) => void;
}) => {
  const patch = (fields: Partial<Product>) => onChange({ ...product, ...fields });
  const setSize = (index: number, fields: Partial<Product["sizes"][number]>) =>
    patch({ sizes: product.sizes.map((s, i) => (i === index ? { ...s, ...fields } : s)) });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Namn">
        <input className={input} maxLength={100} value={product.name} onChange={(e) => onChange(renamed(product, e.target.value))} />
      </Field>
      <Field label="Adress" hint={`/sortiment/${category.slug || "…"}/${product.slug || "…"}`}>
        <input className={input} maxLength={60} value={product.slug} onChange={(e) => patch({ slug: slugify(e.target.value) })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Beskrivning">
          <textarea className={input} rows={2} maxLength={500} value={product.description} onChange={(e) => patch({ description: e.target.value })} />
        </Field>
      </div>
      <Field label="Ingredienser" hint="Separera med kommatecken.">
        <ListInput value={product.ingredients} onChange={(ingredients) => patch({ ingredients })} />
      </Field>
      <Field label="Allergener" hint="Separera med kommatecken.">
        <ListInput value={product.allergens} onChange={(allergens) => patch({ allergens })} />
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className="mb-1 text-sm font-medium text-gray-700">Storlekar och priser</legend>
        <ul className="space-y-2">
          {product.sizes.map((size, index) => (
            <li key={index} className="flex flex-wrap items-center gap-2">
              <input className={`${input} max-w-48`} aria-label="Storlek" placeholder="t.ex. 8 bitar" maxLength={40} value={size.label} onChange={(e) => setSize(index, { label: e.target.value })} />
              <input type="number" min={0} className={`${input} max-w-28`} aria-label="Pris (kr)" value={size.price} onChange={(e) => setSize(index, { price: num(e.target.value) })} />
              <span className="text-sm text-gray-600">kr</span>
              {product.sizes.length > 1 && (
                <button type="button" className={removeButton} onClick={() => patch({ sizes: product.sizes.filter((_, i) => i !== index) })}>
                  Ta bort
                </button>
              )}
            </li>
          ))}
        </ul>
        <button type="button" className={`${smallButton} mt-2`} onClick={() => patch({ sizes: [...product.sizes, { label: "", price: 0 }] })}>
          + Ny storlek
        </button>
      </fieldset>

      {category.addOns.length > 0 && (
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-medium text-gray-700">Tillval för den här produkten</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {category.addOns.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!product.hiddenAddOns.includes(a.id)}
                  onChange={(e) =>
                    patch({
                      hiddenAddOns: e.target.checked
                        ? product.hiddenAddOns.filter((id) => id !== a.id)
                        : [...product.hiddenAddOns, a.id],
                    })
                  }
                />
                {a.name || "Namnlöst tillval"}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="sm:col-span-2">
        <span className="mb-1 block text-sm font-medium text-gray-700">Foto</span>
        <ImagePicker
          image={product.image}
          fallback={category.image}
          emptyLabel="Använd kategorins bild"
          onChange={(image) => patch({ image })}
          onError={onError}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
        <input type="checkbox" checked={product.published} onChange={(e) => patch({ published: e.target.checked })} />
        Visa på webbplatsen (annars utkast som bara syns när du är inloggad)
      </label>
    </div>
  );
};

const AdminSortiment = () => {
  const [auth, setAuth] = useState<"checking" | "out" | "in">("checking");
  const [categories, setCategories] = useState<SortimentCategory[]>([]);
  const [pageLive, setPageLive] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  // Bumped after saving so list inputs pick up the cleaned-up values from the server.
  const [revision, setRevision] = useState(0);
  // Items added this session start expanded.
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const markNew = <T extends { id: string }>(item: T) => {
    setNewIds((ids) => new Set(ids).add(item.id));
    return item;
  };

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminSortiment();
      setCategories(data.categories);
      setPageLive(data.settings.pageLive);
      setAuth("in");
    } catch {
      setAuth("out");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const change = (next: SortimentCategory[]) => {
    setCategories(next);
    setDirty(true);
    setMessage(null);
  };

  const updateCategory = (id: string, fields: Partial<SortimentCategory>) =>
    change(categories.map((c) => (c.id === id ? { ...c, ...fields } : c)));

  const showError = (text: string) => setMessage({ type: "error", text });

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveAdminSortiment(categories, { pageLive });
      setCategories(saved.categories);
      setPageLive(saved.settings.pageLive);
      setRevision((r) => r + 1);
      setDirty(false);
      setMessage({ type: "ok", text: "Sparat!" });
    } catch (error) {
      showError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (auth === "checking") return <p className="p-12 text-center text-gray-600">Laddar …</p>;
  if (auth === "out") return <AdminLogin onLoggedIn={load} />;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <AdminTabs />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Hantera sortiment</h1>
        <div className="flex gap-3">
          <Link to="/sortiment" className="rounded border border-stone-400 px-4 py-2 text-stone-700 hover:bg-stone-100">
            Förhandsgranska sidan
          </Link>
          <button
            className="rounded border border-stone-400 px-4 py-2 text-stone-700 hover:bg-stone-100"
            onClick={() => void logout().then(() => setAuth("out"))}
          >
            Logga ut
          </button>
        </div>
      </header>

      <section className={`mb-6 rounded-lg border p-4 ${pageLive ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={pageLive}
            onChange={(e) => {
              setPageLive(e.target.checked);
              setDirty(true);
              setMessage(null);
            }}
          />
          <span>
            <strong>Sortiment-sidan är öppen för kunder</strong>
            <span className="block text-sm text-gray-700">
              {pageLive
                ? "Kunder ser produkter som är markerade \"Visa på webbplatsen\" och kan beställa."
                : "Avstängd: kunder ser bara \"kommer snart\". Du och kollegor som är inloggade ser allt (inklusive utkast) på /sortiment."}
            </span>
          </span>
        </label>
      </section>

      <div className="sticky top-0 z-10 mb-6 flex items-center justify-between gap-3 bg-white/95 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="rounded border border-stone-400 px-4 py-2 text-stone-700 hover:bg-stone-100"
            onClick={() => change([...categories, markNew(blankCategory())])}
          >
            + Ny kategori
          </button>
          <p className={message?.type === "error" ? "text-red-700" : "text-green-700"} role="status">
            {message?.text ?? (dirty ? "Du har osparade ändringar." : "")}
          </p>
        </div>
        <button
          className="rounded bg-stone-700 px-5 py-2 text-white hover:bg-stone-800 disabled:opacity-50"
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
        >
          {saving ? "Sparar …" : "Spara ändringar"}
        </button>
      </div>

      {categories.length === 0 && <p className="text-gray-600">Inga kategorier ännu.</p>}

      <ul className="space-y-5">
        {categories.map((category, index) => {
          const setProducts = (products: Product[]) => updateCategory(category.id, { products });
          return (
            <li key={category.id}>
              <details className="rounded-lg bg-white shadow" open={newIds.has(category.id)}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-5">
                  <span className="text-lg font-bold text-gray-800">{category.name || "Ny kategori"}</span>
                  <span className="text-sm text-gray-500">
                    {category.products.length} produkter · {category.addOns.length} tillval
                  </span>
                </summary>

                <div className="border-t border-gray-200 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Namn">
                      <input
                        className={input}
                        maxLength={80}
                        value={category.name}
                        onChange={(e) => change(categories.map((c) => (c.id === category.id ? renamed(c, e.target.value) : c)))}
                      />
                    </Field>
                    <Field label="Adress" hint={`/sortiment/${category.slug || "…"}`}>
                      <input className={input} maxLength={60} value={category.slug} onChange={(e) => updateCategory(category.id, { slug: slugify(e.target.value) })} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Beskrivning">
                        <textarea className={input} rows={2} maxLength={500} value={category.description} onChange={(e) => updateCategory(category.id, { description: e.target.value })} />
                      </Field>
                    </div>
                    <Field label="Framförhållning (dagar)" hint="Minsta antal dagar mellan beställning och upphämtning.">
                      <input type="number" min={0} max={60} className={input} value={category.leadDays} onChange={(e) => updateCategory(category.id, { leadDays: num(e.target.value) })} />
                    </Field>
                    <div className="sm:col-span-2">
                      <span className="mb-1 block text-sm font-medium text-gray-700">Foto</span>
                      <ImagePicker
                        image={category.image}
                        emptyLabel="Ingen bild"
                        onChange={(image) => updateCategory(category.id, { image })}
                        onError={showError}
                      />
                    </div>
                  </div>

                  <AddOnsEditor addOns={category.addOns} onChange={(addOns) => updateCategory(category.id, { addOns })} />

                  <section className="mt-6">
                    <h3 className="mb-3 font-semibold text-gray-800">Produkter</h3>
                    <ul className="space-y-3">
                      {category.products.map((product, productIndex) => (
                        <li key={product.id}>
                          <details className="rounded border border-gray-200" open={newIds.has(product.id)}>
                            <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3">
                              <span className="font-medium text-gray-800">{product.name || "Ny produkt"}</span>
                              {!product.published && (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Utkast</span>
                              )}
                            </summary>
                            <div className="border-t border-gray-200 p-4">
                              <ProductEditor
                                key={revision}
                                product={product}
                                category={category}
                                onChange={(next) => setProducts(category.products.map((p) => (p.id === product.id ? next : p)))}
                                onError={showError}
                              />
                              <div className="mt-4 flex items-center gap-2">
                                <button type="button" className={smallButton} disabled={productIndex === 0} onClick={() => setProducts(move(category.products, productIndex, -1))} aria-label="Flytta upp">↑</button>
                                <button type="button" className={smallButton} disabled={productIndex === category.products.length - 1} onClick={() => setProducts(move(category.products, productIndex, 1))} aria-label="Flytta ner">↓</button>
                                <button
                                  type="button"
                                  className={`${removeButton} ml-auto`}
                                  onClick={() => {
                                    if (window.confirm(`Ta bort "${product.name || "produkt"}"?`)) {
                                      setProducts(category.products.filter((p) => p.id !== product.id));
                                    }
                                  }}
                                >
                                  Ta bort produkt
                                </button>
                              </div>
                            </div>
                          </details>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className={`${smallButton} mt-3`} onClick={() => setProducts([...category.products, markNew(blankProduct())])}>
                      + Ny produkt
                    </button>
                  </section>

                  <div className="mt-6 flex items-center gap-2 border-t border-gray-200 pt-4">
                    <button type="button" className={smallButton} disabled={index === 0} onClick={() => change(move(categories, index, -1))}>
                      ↑ Flytta upp
                    </button>
                    <button type="button" className={smallButton} disabled={index === categories.length - 1} onClick={() => change(move(categories, index, 1))}>
                      ↓ Flytta ner
                    </button>
                    <button
                      type="button"
                      className={`${removeButton} ml-auto`}
                      onClick={() => {
                        const products = category.products.length;
                        if (window.confirm(`Ta bort "${category.name || "kategori"}"${products ? ` och dess ${products} produkter` : ""}?`)) {
                          change(categories.filter((c) => c.id !== category.id));
                        }
                      }}
                    >
                      Ta bort kategori
                    </button>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </main>
  );
};

export default AdminSortiment;
