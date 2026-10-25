import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLogin from "../components/admin/AdminLogin";
import AdminTabs from "../components/admin/AdminTabs";
import {
  AUDIENCES,
  AUDIENCE_KEYS,
  deleteBooking,
  fetchAdminData,
  formatDate,
  logout,
  saveAdminData,
  uploadImage,
  workshopImage,
  type AdminData,
  type Workshop,
} from "../services/workshops";

const input = "w-full rounded border border-gray-300 px-3 py-2";

const blankWorkshop = (): Workshop => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  audience: "barnkalas",
  date: new Date().toISOString().slice(0, 10),
  time: "13:00",
  durationMinutes: 120,
  price: 295,
  spots: 10,
  reserved: 0,
  booked: 0,
  spotsLeft: 10,
  image: null,
  published: false,
});

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700">
    <span className="mb-1 block">{label}</span>
    {children}
  </label>
);

const Admin = () => {
  const [auth, setAuth] = useState<"checking" | "out" | "in">("checking");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [data, setData] = useState<AdminData | null>(null);
  const [pageLive, setPageLive] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const apply = (next: AdminData) => {
    setData(next);
    setWorkshops(next.workshops);
    setPageLive(next.settings.pageLive);
  };

  const load = useCallback(async () => {
    try {
      const next = await fetchAdminData();
      setData(next);
      setWorkshops(next.workshops);
      setPageLive(next.settings.pageLive);
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

  const update = (id: string, patch: Partial<Workshop>) => {
    setWorkshops((list) => list.map((w) => (w.id === id ? { ...w, ...patch } : w)));
    setDirty(true);
    setMessage(null);
  };

  const num = (value: string) => (value === "" ? 0 : Number(value));

  const handleSave = async () => {
    setSaving(true);
    try {
      apply(await saveAdminData(workshops, { pageLive }));
      setDirty(false);
      setMessage({ type: "ok", text: "Sparat!" });
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (id: string, file: File | undefined) => {
    if (!file) return;
    try {
      update(id, { image: await uploadImage(file) });
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Ta bort bokningen? Platserna blir lediga igen.")) return;
    try {
      const next = await deleteBooking(id);
      setData(next);
      // Keep unsaved edits but refresh the computed availability.
      setWorkshops((list) =>
        list.map((w) => {
          const fresh = next.workshops.find((x) => x.id === w.id);
          return fresh ? { ...w, booked: fresh.booked, spotsLeft: fresh.spotsLeft } : w;
        })
      );
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    }
  };

  if (auth === "checking") return <p className="p-12 text-center text-gray-600">Laddar …</p>;

  if (auth === "out") return <AdminLogin onLoggedIn={load} />;

  const sorted = [...workshops].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const bookings = [...(data?.bookings ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const titleOf = (id: string) => data?.workshops.find((w) => w.id === id)?.title ?? "Borttagen workshop";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <AdminTabs />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Hantera workshops</h1>
        <div className="flex gap-3">
          <Link to="/workshops" className="rounded border border-stone-400 px-4 py-2 text-stone-700 hover:bg-stone-100">
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
            <strong>Workshop-sidan är öppen för kunder</strong>
            <span className="block text-sm text-gray-700">
              {pageLive
                ? "Kunder ser workshops som är markerade \"Visa på webbplatsen\"."
                : "Avstängd: kunder ser bara \"kommer snart\". Du och kollegor som är inloggade ser allt (inklusive utkast) på /workshops."}
            </span>
          </span>
        </label>
      </section>

      <div className="sticky top-0 z-10 mb-6 flex items-center justify-between gap-3 bg-white/95 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="rounded border border-stone-400 px-4 py-2 text-stone-700 hover:bg-stone-100"
            onClick={() => {
              setWorkshops((list) => [blankWorkshop(), ...list]);
              setDirty(true);
            }}
          >
            + Ny workshop
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

      {sorted.length === 0 && <p className="text-gray-600">Inga workshops ännu.</p>}

      <ul className="space-y-5">
        {sorted.map((w) => {
          const image = workshopImage(w);
          return (
            <li key={w.id} className="rounded-lg bg-white p-5 shadow">
              <div className="mb-4 flex flex-wrap items-center gap-4">
                {image ? (
                  <img src={image} alt="" className="h-24 w-36 rounded object-cover" />
                ) : (
                  <div className="flex h-24 w-36 items-center justify-center rounded bg-stone-100 text-3xl">{AUDIENCES[w.audience].emoji}</div>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <label className="cursor-pointer rounded border border-stone-400 px-3 py-1.5 text-stone-700 hover:bg-stone-100">
                    {w.image ? "Byt foto" : "Ladda upp foto"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        void handleUpload(w.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {w.image && (
                    <button className="text-red-700 underline" onClick={() => update(w.id, { image: null })}>
                      Ta bort foto
                    </button>
                  )}
                  <span className="text-gray-500">JPG, PNG eller WebP, max 6 MB</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Titel">
                  <input className={input} value={w.title} maxLength={100} onChange={(e) => update(w.id, { title: e.target.value })} />
                </Field>
                <Field label="Målgrupp">
                  <select className={input} value={w.audience} onChange={(e) => update(w.id, { audience: e.target.value as Workshop["audience"] })}>
                    {AUDIENCE_KEYS.map((key) => (
                      <option key={key} value={key}>{AUDIENCES[key].label}</option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Beskrivning">
                    <textarea className={input} rows={3} maxLength={1000} value={w.description} onChange={(e) => update(w.id, { description: e.target.value })} />
                  </Field>
                </div>
                <Field label="Datum">
                  <input type="date" className={input} value={w.date} onChange={(e) => update(w.id, { date: e.target.value })} />
                </Field>
                <Field label="Starttid">
                  <input type="time" className={input} value={w.time} onChange={(e) => update(w.id, { time: e.target.value })} />
                </Field>
                <Field label="Längd (minuter)">
                  <input type="number" min={15} className={input} value={w.durationMinutes} onChange={(e) => update(w.id, { durationMinutes: num(e.target.value) })} />
                </Field>
                <Field label="Pris per person (kr)">
                  <input type="number" min={0} className={input} value={w.price} onChange={(e) => update(w.id, { price: num(e.target.value) })} />
                </Field>
                <Field label="Totalt antal platser">
                  <input type="number" min={1} className={input} value={w.spots} onChange={(e) => update(w.id, { spots: num(e.target.value) })} />
                </Field>
                <Field label="Reserverade manuellt (t.ex. bokat via telefon)">
                  <input type="number" min={0} className={input} value={w.reserved ?? 0} onChange={(e) => update(w.id, { reserved: num(e.target.value) })} />
                </Field>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Onlinebokade: <strong>{w.booked ?? 0}</strong> · Lediga platser:{" "}
                <strong>{Math.max(0, w.spots - (w.reserved ?? 0) - (w.booked ?? 0))}</strong>
              </p>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={w.published} onChange={(e) => update(w.id, { published: e.target.checked })} />
                  Visa på webbplatsen (annars utkast som bara syns när du är inloggad)
                </label>
                <button
                  className="text-sm text-red-700 underline hover:text-red-900"
                  onClick={() => {
                    if (window.confirm(`Ta bort "${w.title || "workshop"}"?`)) {
                      setWorkshops((list) => list.filter((x) => x.id !== w.id));
                      setDirty(true);
                    }
                  }}
                >
                  Ta bort
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Bokningar ({bookings.length})</h2>
        {bookings.length === 0 && <p className="text-gray-600">Inga onlinebokningar ännu.</p>}
        <ul className="space-y-3">
          {bookings.map((b) => {
            const workshop = data?.workshops.find((w) => w.id === b.workshopId);
            return (
              <li key={b.id} className="rounded-lg bg-white p-4 shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {b.name} · {b.guests} {b.guests === 1 ? "person" : "personer"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {titleOf(b.workshopId)}
                      {workshop ? ` – ${formatDate(workshop.date, workshop.time)}` : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      <a className="underline" href={`mailto:${b.email}`}>{b.email}</a> ·{" "}
                      <a className="underline" href={`tel:${b.phone}`}>{b.phone}</a>
                    </p>
                    {b.message && <p className="mt-1 text-sm text-gray-700">"{b.message}"</p>}
                    <p className="mt-1 text-xs text-gray-400">{new Date(b.createdAt).toLocaleString("sv-SE")}</p>
                  </div>
                  <button className="text-sm text-red-700 underline hover:text-red-900" onClick={() => void handleDeleteBooking(b.id)}>
                    Avboka
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
};

export default Admin;
