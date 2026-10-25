import { z } from "zod";
import bakverkImage from "../assets/bakverk.webp";
import cakeImage from "../assets/cake.webp";
import cakeFruitImage from "../assets/cakeFruit.webp";
import kardemummabullarImage from "../assets/kardemummabullar.webp";

// Photos bundled with the website that the admin can pick without uploading.
export const BUILTIN_IMAGES = {
  bakverk: { label: "Bakelser", src: bakverkImage },
  cake: { label: "Tårta", src: cakeImage },
  cakeFruit: { label: "Bärtårta", src: cakeFruitImage },
  kardemummabullar: { label: "Bullar", src: kardemummabullarImage },
} as const;

const addOnSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  inputLabel: z.string(),
});

const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()),
  sizes: z.array(z.object({ label: z.string(), price: z.number() })),
  hiddenAddOns: z.array(z.string()),
  image: z.string().nullable(),
  published: z.boolean(),
});

const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  leadDays: z.number(),
  addOns: z.array(addOnSchema),
  products: z.array(productSchema),
});

export type AddOn = z.infer<typeof addOnSchema>;
export type Product = z.infer<typeof productSchema>;
export type SortimentCategory = z.infer<typeof categorySchema>;

const settingsSchema = z.object({ pageLive: z.boolean() });

export type SortimentSettings = z.infer<typeof settingsSchema>;

const publicSchema = z.object({
  pageLive: z.boolean(),
  preview: z.boolean(),
  categories: z.array(categorySchema),
});
const adminSchema = z.object({ categories: z.array(categorySchema), settings: settingsSchema });

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = z.object({ error: z.string() }).safeParse(body);
    throw Object.assign(new Error(parsed.success ? parsed.data.error : "Något gick fel."), {
      status: response.status,
    });
  }
  return body;
}

export const fetchSortiment = async () => publicSchema.parse(await request("/api/sortiment"));

export const fetchAdminSortiment = async () =>
  adminSchema.parse(await request("/api/admin/sortiment"));

export async function saveAdminSortiment(
  categories: SortimentCategory[],
  settings: SortimentSettings,
) {
  const result = adminSchema.parse(
    await request("/api/admin/sortiment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories, settings }),
    }),
  );
  await request("/api/admin/cleanup-images", { method: "POST" }).catch(() => undefined);
  return result;
}

// Uploaded photo, bundled photo, or the category's photo when a product has none.
export function sortimentImage(image: string | null, fallback?: string | null): string | null {
  if (!image) return fallback ? sortimentImage(fallback) : null;
  if (image in BUILTIN_IMAGES) return BUILTIN_IMAGES[image as keyof typeof BUILTIN_IMAGES].src;
  return `/uploads/${image}`;
}

export const productAddOns = (category: SortimentCategory, product: Product) =>
  category.addOns.filter((addOn) => !product.hiddenAddOns.includes(addOn.id));

export const lowestPrice = (product: Product) =>
  Math.min(...product.sizes.map((size) => size.price));

// "Säsongens smaker" -> "sasongens-smaker"
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
