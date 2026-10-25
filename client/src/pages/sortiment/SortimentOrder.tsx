import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, ORDER_EMAIL, PICKUP_ADDRESS } from "../../config/sortiment";
import type { SortimentCategory } from "../../services/sortiment";
import { itemTotal, orderTotal, useOrderStore, type OrderItem } from "../../stores/orderStore";
import { useSortimentStore } from "../../stores/sortimentStore";

const field = "w-full rounded border border-gray-300 px-3 py-2";

// The earliest pickup day is set by the item that needs the most notice.
const earliestPickup = (items: OrderItem[], categories: SortimentCategory[]) => {
  const leadDays = (slug: string) => categories.find((c) => c.slug === slug)?.leadDays ?? 1;
  const days = Math.max(1, ...items.map((item) => leadDays(item.categorySlug)));
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("sv-SE");
};

const describeItem = (item: OrderItem) =>
  [
    `${item.quantity} × ${item.productName}, ${item.sizeLabel} – ${formatPrice(itemTotal(item))}`,
    ...item.addOns.map(
      (addOn) =>
        `   + ${addOn.name}${addOn.note ? `: "${addOn.note}"` : ""} (${formatPrice(addOn.price)})`,
    ),
  ].join("\n");

const SortimentOrder = () => {
  const items = useOrderStore((state) => state.items);
  const setQuantity = useOrderStore((state) => state.setQuantity);
  const removeItem = useOrderStore((state) => state.removeItem);
  const clear = useOrderStore((state) => state.clear);
  const categories = useSortimentStore((state) => state.categories);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const minDate = earliestPickup(items, categories);
  const update =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = [
      "Hej! Jag vill beställa:",
      "",
      ...items.map(describeItem),
      "",
      `Totalt: ${formatPrice(orderTotal(items))}`,
      "",
      `Upphämtning: ${form.date}${form.time ? ` kl. ${form.time}` : ""}`,
      `Namn: ${form.name}`,
      `E-post: ${form.email}`,
      `Telefon: ${form.phone}`,
      ...(form.message ? ["", `Meddelande / allergier: ${form.message}`] : []),
    ].join("\n");
    const subject = `Beställning ${form.date} – ${form.name}`;
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-md">
        <h2 className="mb-3 text-2xl font-bold text-gray-800">Nästan klart!</h2>
        <p className="mx-auto mb-6 max-w-lg text-gray-600">
          Ditt e-postprogram har öppnats med beställningen ifylld. Skicka mejlet så bekräftar vi
          beställningen. Öppnades inget? Mejla oss på{" "}
          <a className="underline" href={`mailto:${ORDER_EMAIL}`}>
            {ORDER_EMAIL}
          </a>
          .
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white hover:bg-stone-700"
            onClick={clear}
          >
            Jag har skickat den – töm beställningen
          </button>
          <button
            type="button"
            className="rounded-lg border border-stone-300 px-5 py-3 font-semibold text-stone-800 hover:bg-stone-50"
            onClick={() => setSent(false)}
          >
            Tillbaka
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-md">
        <h2 className="mb-3 text-2xl font-bold text-gray-800">Din beställning är tom</h2>
        <p className="mb-6 text-gray-600">Välj något gott ur sortimentet för att komma igång.</p>
        <Link
          to="/sortiment"
          className="rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white hover:bg-stone-700"
        >
          Till sortimentet
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <section className="rounded-2xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Din beställning</h2>
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <Link
                  className="font-semibold text-gray-800 hover:underline"
                  to={`/sortiment/${item.categorySlug}/${item.productSlug}`}
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-gray-600">
                  {item.sizeLabel} · {formatPrice(item.unitPrice)}
                </p>
                {item.addOns.length > 0 && (
                  <ul className="mt-1 text-sm text-gray-600">
                    {item.addOns.map((addOn) => (
                      <li key={addOn.id}>
                        + {addOn.name}
                        {addOn.note && <> – ”{addOn.note}”</>} ({formatPrice(addOn.price)})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={50}
                  aria-label={`Antal ${item.productName}`}
                  className="w-16 rounded border border-gray-300 px-2 py-1"
                  value={item.quantity}
                  onChange={(event) => setQuantity(item.id, Number(event.target.value) || 1)}
                />
                <span className="w-20 text-right font-semibold">
                  {formatPrice(itemTotal(item))}
                </span>
                <button
                  type="button"
                  className="text-sm text-red-700 hover:underline"
                  onClick={() => removeItem(item.id)}
                >
                  Ta bort
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-xl font-bold text-gray-800">
          <span>Totalt</span>
          <span>{formatPrice(orderTotal(items))}</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Betalning sker vid upphämtning på {PICKUP_ADDRESS}.
        </p>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Upphämtning och kontakt</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Datum *
            <input
              type="date"
              required
              min={minDate}
              className={`${field} mt-1`}
              value={form.date}
              onChange={update("date")}
            />
          </label>
          <label className="block text-sm">
            Tid
            <input
              type="time"
              className={`${field} mt-1`}
              value={form.time}
              onChange={update("time")}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Tidigaste upphämtning för din beställning: {minDate}.
        </p>
        <label className="block text-sm">
          Namn *
          <input required className={`${field} mt-1`} value={form.name} onChange={update("name")} />
        </label>
        <label className="block text-sm">
          E-post *
          <input
            type="email"
            required
            className={`${field} mt-1`}
            value={form.email}
            onChange={update("email")}
          />
        </label>
        <label className="block text-sm">
          Telefon *
          <input
            type="tel"
            required
            className={`${field} mt-1`}
            value={form.phone}
            onChange={update("phone")}
          />
        </label>
        <label className="block text-sm">
          Meddelande eller allergier
          <textarea
            rows={3}
            className={`${field} mt-1`}
            value={form.message}
            onChange={update("message")}
          />
        </label>
        <p className="text-xs text-gray-500">
          Genom att skicka godkänner du våra{" "}
          <Link className="underline" to="/sortiment#avtalsvillkor">
            avtalsvillkor
          </Link>
          .
        </p>
        <button
          type="submit"
          className="w-full rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white transition-colors hover:bg-stone-700"
        >
          Skicka beställning
        </button>
      </form>
    </div>
  );
};

export default SortimentOrder;
