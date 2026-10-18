import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import express from "express";
import { z } from "zod";

export const audiences = ["barnkalas", "seniorer", "mohippa", "svenskt"];

const imageName = z.string().regex(/^[a-f0-9-]{36}\.(jpg|png|webp)$/);

// What the admin edits. Available places are never stored: they are derived
// from `spots`, `reserved` and the bookings, so edits can't clash with bookings.
export const workshopSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000),
  audience: z.enum(audiences),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().min(15).max(600),
  price: z.number().int().min(0).max(100000),
  spots: z.number().int().min(1).max(200),
  reserved: z.number().int().min(0).max(200).default(0),
  image: imageName.nullable().default(null),
  published: z.boolean(),
});

const listSchema = z.array(workshopSchema).max(500);

const settingsSchema = z.object({ pageLive: z.boolean() });

const bookingSchema = z.object({
  id: z.string(),
  workshopId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  guests: z.number().int(),
  message: z.string(),
  createdAt: z.string(),
});

const bookingInputSchema = z.object({
  workshopId: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  phone: z.string().trim().min(5).max(30),
  guests: z.number().int().min(1).max(100),
  message: z.string().trim().max(1000).default(""),
});

const futureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const sample = (fields) => ({
  id: randomUUID(),
  reserved: 0,
  image: null,
  published: true,
  ...fields,
});

const sampleWorkshops = () => [
  sample({
    title: "Barnkalas i bakverkstan",
    description:
      "Barnen bakar och dekorerar sina egna cupcakes och får ta med sig en låda hem. Perfekt för födelsedagar!",
    audience: "barnkalas",
    date: futureDate(7),
    time: "13:00",
    durationMinutes: 120,
    price: 295,
    spots: 12,
    reserved: 7,
  }),
  sample({
    title: "Kanelbullens dag – baka som mormor",
    description:
      "Vi gör kanel- och kardemummabullar från grunden med tid för fika och prat. Alla recept får du med dig hem.",
    audience: "seniorer",
    date: futureDate(10),
    time: "10:00",
    durationMinutes: 150,
    price: 350,
    spots: 10,
    reserved: 7,
  }),
  sample({
    title: "Möhippa med tårtdekorering",
    description:
      "Dekorera varsin tårta, skåla i bubbel och ha en riktigt söt eftermiddag tillsammans. Grupper från 6 personer.",
    audience: "mohippa",
    date: futureDate(14),
    time: "15:00",
    durationMinutes: 180,
    price: 695,
    spots: 12,
    reserved: 4,
  }),
  sample({
    title: "Prinsesstårta från grunden",
    description:
      "Lär dig knepen bakom den klassiska svenska prinsesstårtan: sockerkaka, vaniljkräm och marsipan.",
    audience: "svenskt",
    date: futureDate(21),
    time: "17:30",
    durationMinutes: 180,
    price: 595,
    spots: 10,
    reserved: 10,
  }),
  sample({
    title: "Semlor och fettisdagsbak",
    description:
      "Baka vetebullar, mandelmassa och vispad grädde. Vi går igenom historien bakom semlan.",
    audience: "svenskt",
    date: futureDate(28),
    time: "11:00",
    durationMinutes: 150,
    price: 450,
    spots: 10,
  }),
];

const sign = (secret, value) =>
  createHmac("sha256", secret).update(value).digest("base64url");

const safeEqual = (a, b) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

const detectImage = (buffer) => {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.toString("latin1", 0, 4) === "RIFF" && buffer.toString("latin1", 8, 12) === "WEBP") return "webp";
  return null;
};

export function createWorkshops({ dataDir, adminPassword, sessionSecret, secureCookie }) {
  const router = express.Router();
  const files = {
    workshops: path.join(dataDir, "workshops.json"),
    bookings: path.join(dataDir, "bookings.json"),
    settings: path.join(dataDir, "settings.json"),
  };
  const uploadDir = path.join(dataDir, "uploads");
  const cookieName = "bv_admin";
  const sessionMs = 1000 * 60 * 60 * 12;

  // One lock serialises every read-modify-write so concurrent bookings can't oversell.
  let lock = Promise.resolve();
  const exclusive = (task) => {
    const run = lock.then(task, task);
    lock = run.catch(() => undefined);
    return run;
  };

  const writeJson = async (file, data) => {
    await mkdir(path.dirname(file), { recursive: true });
    const temp = `${file}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 2));
    await rename(temp, file);
  };

  const readJson = async (file, schema, fallback) => {
    try {
      return schema.parse(JSON.parse(await readFile(file, "utf8")));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const value = fallback();
      await writeJson(file, value);
      return value;
    }
  };

  const loadWorkshops = () => readJson(files.workshops, listSchema, sampleWorkshops);
  const loadBookings = () => readJson(files.bookings, z.array(bookingSchema), () => []);
  // The page stays closed to customers until it is switched on in the admin.
  const loadSettings = () => readJson(files.settings, settingsSchema, () => ({ pageLive: false }));

  const withAvailability = (workshops, bookings) =>
    workshops.map((w) => {
      const booked = bookings
        .filter((b) => b.workshopId === w.id)
        .reduce((sum, b) => sum + b.guests, 0);
      return { ...w, booked, spotsLeft: Math.max(0, w.spots - w.reserved - booked) };
    });

  const createToken = () => {
    const expires = String(Date.now() + sessionMs);
    return `${expires}.${sign(sessionSecret, expires)}`;
  };

  const isValidToken = (token) => {
    if (typeof token !== "string") return false;
    const [expires, signature] = token.split(".");
    if (!expires || !signature) return false;
    return safeEqual(signature, sign(sessionSecret, expires)) && Number(expires) > Date.now();
  };

  const readCookie = (request) => {
    for (const part of (request.headers.cookie ?? "").split(";")) {
      const [name, ...rest] = part.trim().split("=");
      if (name === cookieName) return rest.join("=");
    }
    return undefined;
  };

  const isAdmin = (request) => isValidToken(readCookie(request));

  const requireAdmin = (request, response, next) => {
    if (!isAdmin(request)) {
      response.status(401).json({ error: "Inte inloggad." });
      return;
    }
    next();
  };

  const limiter = (max, windowMs) => {
    const hits = new Map();
    return {
      allowed(key) {
        const entry = hits.get(key);
        return !entry || entry.resetAt < Date.now() || entry.count < max;
      },
      record(key) {
        const entry = hits.get(key);
        if (!entry || entry.resetAt < Date.now()) hits.set(key, { count: 1, resetAt: Date.now() + windowMs });
        else entry.count += 1;
      },
    };
  };
  const loginLimit = limiter(8, 15 * 60 * 1000);
  const bookingLimit = limiter(10, 60 * 60 * 1000);

  const json = express.json({ limit: "1mb" });
  const cookieOptions = `Path=/; HttpOnly; SameSite=Strict${secureCookie ? "; Secure" : ""}`;

  const adminPayload = async (workshops) => {
    const bookings = await loadBookings();
    return {
      workshops: withAvailability(workshops ?? (await loadWorkshops()), bookings),
      bookings,
      settings: await loadSettings(),
    };
  };

  // ---- Public ----

  router.get("/workshops", async (request, response, next) => {
    try {
      const staff = isAdmin(request);
      const settings = await loadSettings();
      response.set("Cache-Control", "no-store");
      if (!settings.pageLive && !staff) {
        response.json({ pageLive: false, preview: false, workshops: [] });
        return;
      }
      const all = withAvailability(await loadWorkshops(), await loadBookings());
      const visible = all
        .filter((w) => staff || w.published)
        .map(({ reserved, booked, ...rest }) => rest);
      response.json({ pageLive: settings.pageLive, preview: staff, workshops: visible });
    } catch (error) {
      next(error);
    }
  });

  router.post("/bookings", json, async (request, response, next) => {
    if (!bookingLimit.allowed(request.ip)) {
      response.status(429).json({ error: "För många bokningar. Försök igen senare." });
      return;
    }
    const parsed = bookingInputSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Kontrollera att alla fält är korrekt ifyllda." });
      return;
    }
    bookingLimit.record(request.ip);
    const input = parsed.data;
    const staff = isAdmin(request);

    try {
      const result = await exclusive(async () => {
        const settings = await loadSettings();
        const workshops = await loadWorkshops();
        const bookings = await loadBookings();
        const workshop = workshops.find((w) => w.id === input.workshopId);
        if (!workshop || (!staff && (!settings.pageLive || !workshop.published))) {
          return { status: 404, error: "Workshopen hittades inte." };
        }
        if (workshop.date < new Date().toISOString().slice(0, 10)) {
          return { status: 409, error: "Workshopen har redan varit." };
        }
        const [{ spotsLeft }] = withAvailability([workshop], bookings);
        if (input.guests > spotsLeft) {
          return {
            status: 409,
            error: spotsLeft === 0 ? "Tyvärr är workshopen fullbokad." : `Det finns bara ${spotsLeft} plats(er) kvar.`,
          };
        }
        const booking = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
        await writeJson(files.bookings, [...bookings, booking]);
        return { status: 201, spotsLeft: spotsLeft - input.guests };
      });
      if (result.error) {
        response.status(result.status).json({ error: result.error });
        return;
      }
      response.status(201).json({ ok: true, spotsLeft: result.spotsLeft });
    } catch (error) {
      next(error);
    }
  });

  // ---- Admin auth ----

  router.post("/admin/login", json, (request, response) => {
    if (!adminPassword) {
      response.status(503).json({ error: "Admin är inte konfigurerat (ADMIN_PASSWORD saknas)." });
      return;
    }
    if (!loginLimit.allowed(request.ip)) {
      response.status(429).json({ error: "För många försök. Försök igen senare." });
      return;
    }
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (!safeEqual(sign(sessionSecret, password), sign(sessionSecret, adminPassword))) {
      loginLimit.record(request.ip);
      response.status(401).json({ error: "Fel lösenord." });
      return;
    }
    response.append("Set-Cookie", `${cookieName}=${createToken()}; Max-Age=${sessionMs / 1000}; ${cookieOptions}`);
    response.json({ ok: true });
  });

  router.post("/admin/logout", (_request, response) => {
    response.append("Set-Cookie", `${cookieName}=; Max-Age=0; ${cookieOptions}`);
    response.json({ ok: true });
  });

  // ---- Admin data ----

  router.get("/admin/workshops", requireAdmin, async (_request, response, next) => {
    try {
      response.json(await adminPayload());
    } catch (error) {
      next(error);
    }
  });

  router.put("/admin/workshops", requireAdmin, json, async (request, response, next) => {
    const parsed = listSchema.safeParse(request.body?.workshops);
    const settings = settingsSchema.safeParse(request.body?.settings);
    if (!parsed.success || !settings.success) {
      response.status(400).json({ error: "Ogiltiga workshopdata. Kontrollera alla fält." });
      return;
    }
    const tooMany = parsed.data.find((w) => w.reserved > w.spots);
    if (tooMany) {
      response.status(400).json({ error: `"${tooMany.title}": reserverade platser kan inte överstiga antal platser.` });
      return;
    }
    try {
      await exclusive(async () => {
        await writeJson(files.workshops, parsed.data);
        await writeJson(files.settings, settings.data);
      });
      response.json(await adminPayload(parsed.data));
    } catch (error) {
      next(error);
    }
  });

  router.delete("/admin/bookings/:id", requireAdmin, async (request, response, next) => {
    try {
      await exclusive(async () => {
        const bookings = await loadBookings();
        await writeJson(files.bookings, bookings.filter((b) => b.id !== request.params.id));
      });
      response.json(await adminPayload());
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/admin/upload",
    requireAdmin,
    express.raw({ type: "application/octet-stream", limit: "6mb" }),
    async (request, response, next) => {
      const extension = Buffer.isBuffer(request.body) ? detectImage(request.body) : null;
      if (!extension) {
        response.status(400).json({ error: "Ladda upp en JPG-, PNG- eller WebP-bild (max 6 MB)." });
        return;
      }
      try {
        const name = `${randomUUID()}.${extension}`;
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, name), request.body);
        response.json({ image: name });
      } catch (error) {
        next(error);
      }
    }
  );

  // Uploads that no saved workshop references any more are deleted after saving.
  router.post("/admin/cleanup-images", requireAdmin, async (_request, response, next) => {
    try {
      const used = new Set((await loadWorkshops()).map((w) => w.image));
      for (const name of await readdir(uploadDir).catch(() => [])) {
        if (!imageName.safeParse(name).success || used.has(name)) continue;
        const file = path.join(uploadDir, name);
        if (Date.now() - (await stat(file)).mtimeMs > 60 * 60 * 1000) await unlink(file);
      }
      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  return { router, uploadDir };
}
