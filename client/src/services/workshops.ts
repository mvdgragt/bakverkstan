import { z } from "zod";
import barnkalasImage from "../assets/workshopBarnkalas.jpeg";

export const AUDIENCES = {
  barnkalas: { label: "Barnkalas", emoji: "🎈", accent: "bg-sky-100 text-sky-800", band: "from-sky-200 to-sky-50" },
  seniorer: { label: "Fika för seniorer", emoji: "☕", accent: "bg-amber-100 text-amber-800", band: "from-amber-200 to-amber-50" },
  mohippa: { label: "Möhippa", emoji: "🥂", accent: "bg-pink-100 text-pink-800", band: "from-pink-200 to-pink-50" },
  svenskt: { label: "Svenskt bakverk", emoji: "🥐", accent: "bg-emerald-100 text-emerald-800", band: "from-emerald-200 to-emerald-50" },
} as const;

export type Audience = keyof typeof AUDIENCES;
export const AUDIENCE_KEYS = Object.keys(AUDIENCES) as Audience[];

export const workshopSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  audience: z.enum(["barnkalas", "seniorer", "mohippa", "svenskt"]),
  date: z.string(),
  time: z.string(),
  durationMinutes: z.number(),
  price: z.number(),
  spots: z.number(),
  reserved: z.number().optional(),
  booked: z.number().optional(),
  spotsLeft: z.number(),
  image: z.string().nullable(),
  published: z.boolean(),
});

export type Workshop = z.infer<typeof workshopSchema>;

const bookingSchema = z.object({
  id: z.string(),
  workshopId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  guests: z.number(),
  message: z.string(),
  createdAt: z.string(),
});

export type Booking = z.infer<typeof bookingSchema>;

const publicSchema = z.object({
  pageLive: z.boolean(),
  preview: z.boolean(),
  workshops: z.array(workshopSchema),
});

const adminSchema = z.object({
  workshops: z.array(workshopSchema),
  bookings: z.array(bookingSchema),
  settings: z.object({ pageLive: z.boolean() }),
});

export type AdminData = z.infer<typeof adminSchema>;

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    /* non-JSON response */
  }
  if (!response.ok) {
    const parsed = z.object({ error: z.string() }).safeParse(body);
    throw Object.assign(new Error(parsed.success ? parsed.data.error : "Något gick fel."), {
      status: response.status,
    });
  }
  return body;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export async function fetchWorkshops() {
  return publicSchema.parse(await request("/api/workshops"));
}

export async function fetchAdminData() {
  return adminSchema.parse(await request("/api/admin/workshops"));
}

export async function saveAdminData(workshops: Workshop[], settings: { pageLive: boolean }) {
  const result = adminSchema.parse(
    await request("/api/admin/workshops", jsonInit("PUT", { workshops, settings }))
  );
  await request("/api/admin/cleanup-images", { method: "POST" }).catch(() => undefined);
  return result;
}

export async function deleteBooking(id: string) {
  return adminSchema.parse(await request(`/api/admin/bookings/${id}`, { method: "DELETE" }));
}

export async function uploadImage(file: File) {
  const body = z
    .object({ image: z.string() })
    .parse(
      await request("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      })
    );
  return body.image;
}

export interface BookingInput {
  workshopId: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  message: string;
}

export const createBooking = (input: BookingInput) =>
  request("/api/bookings", jsonInit("POST", input));

export const login = (password: string) =>
  request("/api/admin/login", jsonInit("POST", { password }));

export const logout = () => request("/api/admin/logout", { method: "POST" });

// Uploaded photo, or the bundled photo for kids' parties when none is set.
export function workshopImage(workshop: Pick<Workshop, "image" | "audience">) {
  if (workshop.image) return `/uploads/${workshop.image}`;
  return workshop.audience === "barnkalas" ? barnkalasImage : null;
}

export function formatDate(date: string, time: string) {
  const parsed = new Date(`${date}T${time}`);
  const day = new Intl.DateTimeFormat("sv-SE", { weekday: "long", day: "numeric", month: "long" }).format(parsed);
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} kl. ${time}`;
}
