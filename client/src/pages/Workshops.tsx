import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AUDIENCES,
  AUDIENCE_KEYS,
  createBooking,
  fetchWorkshops,
  formatDate,
  workshopImage,
  type Audience,
  type Workshop,
} from "../services/workshops";

const chip = (selected: boolean) =>
  `rounded-full px-5 py-2 text-sm font-medium transition ${
    selected ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
  }`;

const dateBadge = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return {
    month: d.toLocaleDateString("sv-SE", { month: "short" }).replace(".", ""),
    day: d.getDate(),
  };
};

const field = "w-full rounded border border-gray-300 px-3 py-2";

const BookingForm = ({
  workshop,
  onClose,
  onBooked,
}: {
  workshop: Workshop;
  onClose: () => void;
  onBooked: () => void;
}) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", guests: 1, message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("sending");
    setError(null);
    try {
      await createBooking({ workshopId: workshop.id, ...form });
      setState("done");
      onBooked();
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {state === "done" ? (
          <div className="py-6 text-center">
            <p className="mb-3 text-5xl" aria-hidden="true">🎉</p>
            <h2 id="booking-title" className="mb-2 text-2xl font-bold text-gray-800">Tack för din bokning!</h2>
            <p className="mb-6 text-gray-600">
              Vi har reserverat {form.guests} {form.guests === 1 ? "plats" : "platser"} till{" "}
              <strong>{workshop.title}</strong> ({formatDate(workshop.date, workshop.time)}). Vi hör av oss till{" "}
              {form.email} för att bekräfta.
            </p>
            <button className="rounded bg-stone-700 px-5 py-2 text-white hover:bg-stone-800" onClick={onClose}>
              Stäng
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <div>
              <h2 id="booking-title" className="text-2xl font-bold text-gray-800">Boka plats</h2>
              <p className="text-gray-600">
                {workshop.title} · {formatDate(workshop.date, workshop.time)}
              </p>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Namn
              <input className={field} required maxLength={100} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                E-post
                <input className={field} type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Telefon
                <input className={field} type="tel" required minLength={5} maxLength={30} autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Antal personer (max {workshop.spotsLeft})
              <input
                className={field}
                type="number"
                required
                min={1}
                max={workshop.spotsLeft}
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Meddelande (allergier, önskemål m.m.)
              <textarea className={field} rows={3} maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </label>
            <p className="text-sm text-gray-500">Betalning sker på plats. Du får en bekräftelse från oss.</p>
            {error && <p className="text-red-700" role="alert">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded border border-stone-400 px-4 py-2 text-stone-700 hover:bg-stone-100" onClick={onClose}>
                Avbryt
              </button>
              <button className="rounded bg-stone-700 px-5 py-2 text-white hover:bg-stone-800 disabled:opacity-60" disabled={state === "sending"}>
                {state === "sending" ? "Skickar …" : "Skicka bokning"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Workshops = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [pageLive, setPageLive] = useState(true);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [active, setActive] = useState<Audience | null>(null);
  const [booking, setBooking] = useState<Workshop | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchWorkshops();
      setWorkshops(data.workshops);
      setPageLive(data.pageLive);
      setPreview(data.preview);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return workshops
      .filter((w) => w.date >= today && (!active || w.audience === active))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [workshops, active]);

  const comingSoon = status === "ready" && !pageLive && !preview;

  return (
    <main>
      {preview && (
        <div className="bg-amber-100 px-6 py-2 text-center text-sm text-amber-900" role="status">
          Förhandsvisning – {pageLive ? "sidan är öppen för kunder." : "kunder ser ännu inte den här sidan."}{" "}
          <Link to="/admin" className="font-semibold underline">Till admin</Link>
        </div>
      )}

      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between md:gap-14 md:px-10">
        <h1 className="text-3xl font-bold text-gray-800 md:text-5xl">
          {comingSoon ? "Workshops i Bakverkstan öppnar snart" : "Klassiska bullar och julbak från grunden."}
        </h1>
        <p className="text-lg leading-relaxed text-gray-600">
          {comingSoon
            ? "Vi förbereder något riktigt gott! Följ oss på Instagram så missar du inte starten."
            : "Följ med in i köket och lär dig knepen som gör att kanelbullarna blir perfekta varje gång. Välj om du vill boka plats i en öppen grupp och baka tillsammans med andra, eller om du föredrar en privat bakworkshop där du och dina vänner eller familj är de enda deltagarna. Under advent byter vi kanel mot saffran och nejlika för juligare toner."}
        </p>
      </section>

      {!comingSoon && (
        <section className="bg-amber-50 px-6 py-10 md:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-14">
            <p className="text-lg text-gray-600 md:max-w-2xl">
              Du får förkläde, recept och alla ingredienser. Vi bakar, fikar och du går hem med dina egna nybakade godsaker.
            </p>
            <h2 className="order-first text-2xl font-bold text-gray-800 md:order-last md:whitespace-nowrap md:text-3xl">Välkommen in i köket!</h2>
          </div>
        </section>
      )}

      {!comingSoon && (
        <section className="mx-auto max-w-6xl px-6 py-14 md:px-10">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">Planerade öppna bakworkshops</h2>
          <div className="mb-8 flex flex-wrap justify-center gap-3" role="group" aria-label="Filtrera workshops">
            <button type="button" aria-pressed={active === null} onClick={() => setActive(null)} className={chip(active === null)}>
              Alla
            </button>
            {AUDIENCE_KEYS.map((key) => (
              <button key={key} type="button" aria-pressed={active === key} onClick={() => setActive(active === key ? null : key)} className={chip(active === key)}>
                {AUDIENCES[key].emoji} {AUDIENCES[key].label}
              </button>
            ))}
          </div>

          {status === "loading" && <p className="py-12 text-center text-gray-600" role="status">Hämtar workshops …</p>}
          {status === "error" && (
            <p className="py-12 text-center text-gray-700" role="alert">Workshops kunde inte hämtas just nu. Försök igen senare.</p>
          )}
          {status === "ready" && upcoming.length === 0 && (
            <p className="py-12 text-center text-gray-600">
              Inga kommande workshops just nu – kontakta oss gärna så ordnar vi en egen!
            </p>
          )}

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((workshop) => {
              const meta = AUDIENCES[workshop.audience];
              const image = workshopImage(workshop);
              const full = workshop.spotsLeft === 0;
              return (
                <li key={workshop.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md">
                  <div className="relative">
                    {image ? (
                      <img src={image} alt={workshop.title} loading="lazy" className="h-56 w-full object-cover" />
                    ) : (
                      <div className={`flex h-56 items-center justify-center bg-gradient-to-br ${meta.band} text-6xl`}>
                        <span aria-hidden="true">{meta.emoji}</span>
                      </div>
                    )}
                    <span className="absolute right-3 top-3 rounded-md bg-white/95 px-3 py-1.5 text-center text-sm font-bold leading-tight text-gray-800 shadow">
                      <span className="block text-xs font-semibold uppercase text-amber-700">{dateBadge(workshop.date).month}</span>
                      {dateBadge(workshop.date).day}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.accent}`}>{meta.label}</span>
                      {!workshop.published && (
                        <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">Utkast</span>
                      )}
                    </div>
                    <h2 className="mb-1 text-xl font-bold text-gray-800">{workshop.title}</h2>
                    <p className="mb-3 text-sm font-medium text-amber-800">
                      {formatDate(workshop.date, workshop.time)} · {workshop.durationMinutes} min
                    </p>
                    <p className="mb-4 flex-1 text-gray-600">{workshop.description}</p>
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-lg font-bold text-gray-800">{workshop.price} kr / person</span>
                      <span className={full ? "font-semibold text-red-700" : workshop.spotsLeft <= 3 ? "font-semibold text-orange-700" : "text-gray-500"}>
                        {full ? "Fullbokat" : `${workshop.spotsLeft} platser kvar`}
                      </span>
                    </div>
                    {full ? (
                      <span className="rounded-lg bg-stone-200 px-4 py-2 text-center font-medium text-stone-500">Fullbokat</span>
                    ) : (
                      <button
                        className="rounded-lg bg-stone-700 px-4 py-2 text-center font-medium text-white hover:bg-stone-800"
                        onClick={() => setBooking(workshop)}
                      >
                        Boka plats
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-14 rounded-2xl bg-amber-50 p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Egen grupp eller privat bokning?</h2>
            <p className="mb-4 text-gray-600">
              Barnkalas, möhippa, födelsedag eller föreningsträff – vi anpassar en workshop för just din grupp.
            </p>
            <Link className="inline-block rounded-lg bg-stone-700 px-5 py-2 font-medium text-white hover:bg-stone-800" to="/kontakt">
              Kontakta oss
            </Link>
          </div>
        </section>
      )}

      {booking && <BookingForm workshop={booking} onClose={() => setBooking(null)} onBooked={() => void load()} />}
    </main>
  );
};

export default Workshops;
