import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import express from "express";
import { z } from "zod";
import { imageName } from "./workshops.js";

// Photos bundled with the website; the client maps these keys to its assets.
export const builtinImages = ["bakverk", "cake", "cakeFruit", "kardemummabullar"];

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Adressen får bara innehålla a–z, 0–9 och bindestreck.")
  .max(60);
const text = (max) => z.string().trim().max(max);
const price = z.number().int().min(0).max(100000);
const image = z.union([imageName, z.enum(builtinImages)]).nullable().default(null);

const addOnSchema = z.object({
  id: z.string().min(1).max(64),
  name: text(80).min(1),
  price,
  description: text(200).default(""),
  // When set, choosing the extra shows a text field with this label (e.g. text on the cake).
  inputLabel: text(80).default(""),
});

const productSchema = z.object({
  id: z.string().min(1).max(64),
  slug,
  name: text(100).min(1),
  description: text(500),
  ingredients: z.array(text(80).min(1)).max(50),
  allergens: z.array(text(60).min(1)).max(20),
  sizes: z.array(z.object({ label: text(40).min(1), price })).min(1).max(10),
  // Category extras that don't apply to this product.
  hiddenAddOns: z.array(z.string()).max(50).default([]),
  image,
  published: z.boolean(),
});

const categorySchema = z.object({
  id: z.string().min(1).max(64),
  slug: slug.refine((value) => value !== "bestallning", "Adressen \"bestallning\" är reserverad."),
  name: text(80).min(1),
  description: text(500),
  image,
  // Minimum number of days between ordering and pickup.
  leadDays: z.number().int().min(0).max(60),
  addOns: z.array(addOnSchema).max(30),
  products: z.array(productSchema).max(100),
});

const sortimentSchema = z.array(categorySchema).max(30).superRefine((categories, context) => {
  const duplicate = (values) => values.find((value, index) => values.indexOf(value) !== index);
  const category = duplicate(categories.map((c) => c.slug));
  if (category) context.addIssue({ code: "custom", message: `Två kategorier har adressen "${category}".` });
  for (const c of categories) {
    const product = duplicate(c.products.map((p) => p.slug));
    if (product) context.addIssue({ code: "custom", message: `${c.name}: två produkter har adressen "${product}".` });
  }
});

const settingsSchema = z.object({ pageLive: z.boolean() });

const fieldLabels = {
  name: "Namn",
  slug: "Adress",
  description: "Beskrivning",
  leadDays: "Framförhållning",
  ingredients: "Ingredienser",
  allergens: "Allergener",
  sizes: "Storlekar",
  label: "Storlek",
  price: "Pris",
  inputLabel: "Textfält",
};

// Turns the first validation problem into something like
// `Tårtor › Prinsesstårta: kontrollera "Pris".` for the admin.
const describeIssue = (issue, categories) => {
  const [categoryIndex, list, itemIndex] = issue.path;
  if (typeof categoryIndex !== "number") return issue.message;
  const category = categories?.[categoryIndex];
  let where = category?.name || `Kategori ${categoryIndex + 1}`;
  if (list === "products" && typeof itemIndex === "number") {
    where += ` › ${category?.products?.[itemIndex]?.name || `produkt ${itemIndex + 1}`}`;
  } else if (list === "addOns") {
    where += " › tillval";
  }
  if (issue.code === "custom" || issue.message.startsWith("Adressen")) return `${where}: ${issue.message}`;
  const field = [...issue.path].reverse().find((part) => typeof part === "string");
  return `${where}: kontrollera "${fieldLabels[field] ?? field}".`;
};

const cakeAddOns = () => [
  { name: "Text på tårtan", price: 45, description: "Skriven med choklad på en marsipanskylt.", inputLabel: "Vilken text vill du ha?" },
  { name: "Färska bär på toppen", price: 65, description: "Jordgubbar, hallon och blåbär efter säsong." },
  { name: "Marsipanblommor", price: 55, description: "Tre handgjorda rosor i valfri färg.", inputLabel: "Önskad färg" },
  { name: "Ätbar tårtbild", price: 125, description: "Skicka bilden till info@bakverkstan.se efter beställningen." },
  { name: "Tårtljus och tomtebloss", price: 30 },
  { name: "Laktosfri", price: 50 },
  { name: "Glutenfri", price: 75 },
];

const cakeSizes = [
  { label: "8 bitar", price: 395 },
  { label: "12 bitar", price: 545 },
  { label: "16 bitar", price: 695 },
  { label: "24 bitar", price: 995 },
];

const sandwichCakeSizes = [
  { label: "6 bitar", price: 495 },
  { label: "10 bitar", price: 795 },
  { label: "16 bitar", price: 1195 },
];

const giftBox = () => [
  { name: "Presentförpackning", price: 35, description: "Fin kartong med band och kort.", inputLabel: "Hälsning på kortet" },
];

const product = (fields) => ({ id: randomUUID(), hiddenAddOns: [], image: null, published: true, ...fields });

const category = ({ addOns = [], ...fields }) => ({
  id: randomUUID(),
  addOns: addOns.map((addOn) => ({ id: randomUUID(), description: "", inputLabel: "", ...addOn })),
  ...fields,
});

// Starting assortment written on first run; after that the admin edits it.
const sampleSortiment = () => {
  const sandwich = category({
    slug: "smorgastarta",
    name: "Smörgåstårta",
    description: "Matiga smörgåstårtor till studenten, dop och födelsedagar.",
    image: "cakeFruit",
    leadDays: 2,
    addOns: [
      { name: "Extra handskalade räkor", price: 95 },
      { name: "Rökta laxrosor", price: 85 },
      { name: "Text på tårtan", price: 45, inputLabel: "Vilken text vill du ha?" },
      { name: "Laktosfri", price: 50 },
    ],
    products: [],
  });
  const [shrimp, salmon] = sandwich.addOns;
  sandwich.products = [
    product({
      slug: "klassisk",
      name: "Klassisk räk- och laxtårta",
      description: "Handskalade räkor, rökt lax, ägg, majonnäs och färska grönsaker.",
      ingredients: ["Formfranska", "Räkor", "Rökt lax", "Ägg", "Majonnäs", "Crème fraiche", "Gurka", "Dill", "Citron"],
      allergens: ["Gluten", "Mjölk", "Ägg", "Fisk", "Kräftdjur", "Senap"],
      sizes: sandwichCakeSizes,
    }),
    product({
      slug: "skagen",
      name: "Skagentårta",
      description: "Krämig skagenröra, löjrom och citron.",
      ingredients: ["Formfranska", "Räkor", "Majonnäs", "Crème fraiche", "Löjrom", "Rödlök", "Dill", "Citron"],
      allergens: ["Gluten", "Mjölk", "Ägg", "Fisk", "Kräftdjur", "Senap"],
      sizes: sandwichCakeSizes,
    }),
    product({
      slug: "vegetarisk",
      name: "Vegetarisk smörgåstårta",
      description: "Fetaost, grillade grönsaker, hummus och färska örter.",
      ingredients: ["Formfranska", "Fetaost", "Hummus", "Paprika", "Zucchini", "Gurka", "Ägg", "Örter"],
      allergens: ["Gluten", "Mjölk", "Ägg", "Sesam"],
      sizes: sandwichCakeSizes,
      hiddenAddOns: [shrimp.id, salmon.id],
    }),
  ];

  return [
    category({
      slug: "sasongens-smaker",
      name: "Säsongens smaker",
      description: "Höstens favoriter med äpple, kanel, kola och pumpa. Finns bara en kort tid.",
      image: "cakeFruit",
      leadDays: 2,
      addOns: cakeAddOns(),
      products: [
        product({
          slug: "kanelbulletarta",
          name: "Kanelbulletårta",
          description: "Saftig kanelbotten med kardemummagrädde och smörig kanelfyllning.",
          ingredients: ["Vetemjöl", "Smör", "Socker", "Grädde", "Ägg", "Kanel", "Kardemumma", "Vaniljkräm"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: cakeSizes,
        }),
        product({
          slug: "appelkaka-kola",
          name: "Äppelkaka med kola",
          description: "Svenska äpplen, mandelbotten och hemkokt kolasås med havssalt.",
          ingredients: ["Äpplen", "Mandel", "Smör", "Socker", "Ägg", "Vetemjöl", "Grädde", "Havssalt"],
          allergens: ["Gluten", "Mjölk", "Ägg", "Mandel"],
          sizes: [
            { label: "6 bitar", price: 295 },
            { label: "10 bitar", price: 445 },
          ],
        }),
        product({
          slug: "pumpa-cheesecake",
          name: "Pumpa-cheesecake",
          description: "Krämig cheesecake med rostad pumpa, ingefära och pepparkaksbotten.",
          ingredients: ["Färskost", "Pumpa", "Pepparkakor", "Smör", "Socker", "Ägg", "Ingefära", "Kanel"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: cakeSizes,
        }),
      ],
    }),
    category({
      slug: "tartor",
      name: "Tårtor",
      description: "Klassiska och moderna tårtor till kalas, fika och fest.",
      image: "cake",
      leadDays: 3,
      addOns: cakeAddOns(),
      products: [
        product({
          slug: "prinsesstarta",
          name: "Prinsesstårta",
          description: "Sockerkaksbotten, hallonsylt, vaniljkräm och grädde under grön marsipan.",
          ingredients: ["Vetemjöl", "Ägg", "Socker", "Grädde", "Vaniljkräm", "Hallonsylt", "Marsipan"],
          allergens: ["Gluten", "Mjölk", "Ägg", "Mandel"],
          sizes: cakeSizes,
        }),
        product({
          slug: "chokladtarta",
          name: "Chokladtårta",
          description: "Mörk chokladbotten, chokladmousse och blank chokladglaze.",
          ingredients: ["Mörk choklad 70 %", "Grädde", "Smör", "Ägg", "Socker", "Vetemjöl", "Kakao"],
          allergens: ["Gluten", "Mjölk", "Ägg", "Soja"],
          sizes: cakeSizes,
        }),
        product({
          slug: "graddtarta-bar",
          name: "Gräddtårta med bär",
          description: "Luftig sockerkaka med vaniljkräm, vispad grädde och färska bär.",
          ingredients: ["Vetemjöl", "Ägg", "Socker", "Grädde", "Vaniljkräm", "Jordgubbar", "Hallon", "Blåbär"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: cakeSizes,
          image: "cakeFruit",
        }),
        product({
          slug: "citrontarta",
          name: "Citrontårta med maräng",
          description: "Frisk citroncurd på mördegsbotten, toppad med flamberad maräng.",
          ingredients: ["Citron", "Smör", "Socker", "Ägg", "Vetemjöl", "Grädde"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: cakeSizes.slice(0, 3),
        }),
      ],
    }),
    category({
      slug: "bakelser",
      name: "Bakelser",
      description: "Små bakverk för en person, perfekta till fikat.",
      image: "bakverk",
      leadDays: 1,
      products: [
        product({
          slug: "prinsessbakelse",
          name: "Prinsessbakelse",
          description: "Prinsesstårtans alla smaker i en bakelse.",
          ingredients: ["Vetemjöl", "Ägg", "Socker", "Grädde", "Vaniljkräm", "Hallonsylt", "Marsipan"],
          allergens: ["Gluten", "Mjölk", "Ägg", "Mandel"],
          sizes: [{ label: "1 st", price: 55 }],
        }),
        product({
          slug: "mazarin",
          name: "Mazarin",
          description: "Mördegsform med mandelmassa och vit glasyr.",
          ingredients: ["Vetemjöl", "Smör", "Mandelmassa", "Ägg", "Socker", "Florsocker"],
          allergens: ["Gluten", "Mjölk", "Ägg", "Mandel"],
          sizes: [{ label: "1 st", price: 35 }],
        }),
        product({
          slug: "napoleonbakelse",
          name: "Napoleonbakelse",
          description: "Smördeg, vaniljkräm, grädde och hallonsylt med glasyr.",
          ingredients: ["Smördeg", "Vaniljkräm", "Grädde", "Hallonsylt", "Florsocker"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: [{ label: "1 st", price: 55 }],
        }),
        product({
          slug: "kladdkakebit",
          name: "Kladdkaka med grädde",
          description: "Kladdig chokladkaka med vispad grädde och bär.",
          ingredients: ["Smör", "Socker", "Ägg", "Vetemjöl", "Kakao", "Grädde", "Bär"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: [{ label: "1 st", price: 45 }],
        }),
      ],
    }),
    category({
      slug: "smakakor",
      name: "Småkakor",
      description: "Hembakade småkakor, gärna i en fin låda som present.",
      image: "bakverk",
      leadDays: 1,
      addOns: giftBox(),
      products: [
        product({
          slug: "sju-sorters",
          name: "Sju sorters kakor",
          description: "En låda med sju klassiska sorter, 28 kakor totalt.",
          ingredients: ["Vetemjöl", "Smör", "Socker", "Ägg", "Mandel", "Hjortronsylt", "Choklad", "Havre"],
          allergens: ["Gluten", "Mjölk", "Ägg", "Mandel"],
          sizes: [{ label: "Låda, 28 st", price: 245 }],
        }),
        product({
          slug: "chokladbollar",
          name: "Chokladbollar",
          description: "Med kaffe och pärlsocker eller kokos.",
          ingredients: ["Havregryn", "Smör", "Socker", "Kakao", "Kaffe", "Kokos", "Pärlsocker"],
          allergens: ["Mjölk", "Havre (kan innehålla gluten)"],
          sizes: [
            { label: "6 st", price: 90 },
            { label: "12 st", price: 170 },
          ],
        }),
        product({
          slug: "havreflarn",
          name: "Havreflarn",
          description: "Krispiga flarn med smör och sirap.",
          ingredients: ["Havregryn", "Smör", "Socker", "Sirap", "Vetemjöl", "Ägg"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: [
            { label: "10 st", price: 75 },
            { label: "20 st", price: 140 },
          ],
        }),
        product({
          slug: "kolasnittar",
          name: "Kolasnittar",
          description: "Sega kolakakor med ljus sirap och vanilj.",
          ingredients: ["Vetemjöl", "Smör", "Socker", "Ljus sirap", "Vaniljsocker", "Bikarbonat"],
          allergens: ["Gluten", "Mjölk"],
          sizes: [
            { label: "10 st", price: 75 },
            { label: "20 st", price: 140 },
          ],
        }),
      ],
    }),
    sandwich,
    category({
      slug: "bullar",
      name: "Bullar",
      description: "Nybakade bullar med riktigt smör, bakade samma morgon.",
      image: "kardemummabullar",
      leadDays: 1,
      products: [
        product({
          slug: "kardemummabulle",
          name: "Kardemummabulle",
          description: "Vår favorit med nymald kardemumma och pärlsocker.",
          ingredients: ["Vetemjöl", "Mjölk", "Smör", "Socker", "Jäst", "Kardemumma", "Ägg", "Pärlsocker"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: [
            { label: "1 st", price: 38 },
            { label: "6 st", price: 210 },
            { label: "12 st", price: 400 },
          ],
        }),
        product({
          slug: "kanelbulle",
          name: "Kanelbulle",
          description: "Klassisk kanelbulle med smörig fyllning.",
          ingredients: ["Vetemjöl", "Mjölk", "Smör", "Socker", "Jäst", "Kanel", "Kardemumma", "Ägg", "Pärlsocker"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: [
            { label: "1 st", price: 35 },
            { label: "6 st", price: 195 },
            { label: "12 st", price: 370 },
          ],
        }),
        product({
          slug: "vaniljbulle",
          name: "Vaniljbulle",
          description: "Fylld med vaniljkräm och doppad i smör och socker.",
          ingredients: ["Vetemjöl", "Mjölk", "Smör", "Socker", "Jäst", "Vaniljkräm", "Ägg"],
          allergens: ["Gluten", "Mjölk", "Ägg"],
          sizes: [
            { label: "1 st", price: 38 },
            { label: "6 st", price: 210 },
          ],
        }),
      ],
    }),
  ];
};

export function createSortiment({ dataDir, isAdmin, requireAdmin }) {
  const router = express.Router();
  const files = {
    sortiment: path.join(dataDir, "sortiment.json"),
    settings: path.join(dataDir, "sortiment-settings.json"),
  };
  const json = express.json({ limit: "1mb" });

  const write = async (file, data) => {
    await mkdir(dataDir, { recursive: true });
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
      await write(file, value);
      return value;
    }
  };

  const load = () => readJson(files.sortiment, sortimentSchema, sampleSortiment);
  // The page stays closed to customers until it is switched on in the admin.
  const loadSettings = () => readJson(files.settings, settingsSchema, () => ({ pageLive: false }));

  // Customers see published products only, and no empty categories; staff see drafts too.
  router.get("/sortiment", async (request, response, next) => {
    try {
      const staff = isAdmin(request);
      const settings = await loadSettings();
      response.set("Cache-Control", "no-store");
      if (!settings.pageLive && !staff) {
        response.json({ pageLive: false, preview: false, categories: [] });
        return;
      }
      const categories = (await load())
        .map((c) => ({ ...c, products: c.products.filter((p) => staff || p.published) }))
        .filter((c) => staff || c.products.length > 0);
      response.json({ pageLive: settings.pageLive, preview: staff, categories });
    } catch (error) {
      next(error);
    }
  });

  router.get("/admin/sortiment", requireAdmin, async (_request, response, next) => {
    try {
      response.json({ categories: await load(), settings: await loadSettings() });
    } catch (error) {
      next(error);
    }
  });

  router.put("/admin/sortiment", requireAdmin, json, async (request, response, next) => {
    const parsed = sortimentSchema.safeParse(request.body?.categories);
    if (!parsed.success) {
      response.status(400).json({ error: describeIssue(parsed.error.issues[0], request.body?.categories) });
      return;
    }
    const settings = settingsSchema.safeParse(request.body?.settings);
    if (!settings.success) {
      response.status(400).json({ error: "Ogiltiga inställningar." });
      return;
    }
    try {
      await write(files.sortiment, parsed.data);
      await write(files.settings, settings.data);
      response.json({ categories: parsed.data, settings: settings.data });
    } catch (error) {
      next(error);
    }
  });

  const usedImages = async () =>
    (await load()).flatMap((c) => [c.image, ...c.products.map((p) => p.image)]).filter(Boolean);

  return { router, usedImages };
}
