import "dotenv/config";
import express from "express";
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { createInstagram } from "./instagram.js";
import { createWorkshops } from "./workshops.js";

const optionalTokenSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional()
);

const environmentSchema = z.object({
  INSTAGRAM_TOKEN: optionalTokenSchema,
  CACHE_SECONDS: z.coerce.number().int().positive().default(300),
  ADMIN_PASSWORD: optionalTokenSchema,
  SESSION_SECRET: optionalTokenSchema,
  PORT: z.coerce.number().int().positive().default(3001),
});

const environment = environmentSchema.parse(process.env);
const directory = path.dirname(fileURLToPath(import.meta.url));
const instagram = environment.INSTAGRAM_TOKEN
  ? createInstagram({
      token: environment.INSTAGRAM_TOKEN,
      tokenFile: path.join(directory, "data", "instagram-token.json"),
      cacheSeconds: environment.CACHE_SECONDS,
    })
  : null;

if (instagram) await instagram.start();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const workshops = createWorkshops({
  dataDir: path.join(directory, "data"),
  adminPassword: environment.ADMIN_PASSWORD,
  sessionSecret: environment.SESSION_SECRET ?? randomBytes(32).toString("hex"),
  secureCookie: process.env.NODE_ENV === "production",
});
app.use("/api", workshops.router);
app.use(
  "/uploads",
  express.static(workshops.uploadDir, { maxAge: "7d", immutable: true, index: false, fallthrough: false })
);

app.get("/healthz", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

const cursorSchema = z.string().min(1).max(1024);

app.get("/api/instagram", async (request, response) => {
  const rawCursor = request.query.after;
  const cursor =
    typeof rawCursor === "string" ? cursorSchema.safeParse(rawCursor) : null;
  if (rawCursor !== undefined && (!cursor || !cursor.success)) {
    response.status(400).json({ error: "Invalid Instagram page cursor." });
    return;
  }

  if (!instagram) {
    response.status(503).json({ error: "Instagram feed is not configured." });
    return;
  }

  try {
    const result = await instagram.getPosts(cursor?.data);
    response.set("Cache-Control", "public, max-age=60");
    response.json(result);
  } catch (error) {
    console.error(`[instagram] Could not fetch posts: ${error.message}`);
    response.status(502).json({ error: "Instagram feed is temporarily unavailable." });
  }
});

const clientBuild = path.resolve(directory, "../client/dist");
if (existsSync(clientBuild)) {
  app.use(express.static(clientBuild, { maxAge: "1h", index: false }));
  app.get(/^(?!\/api\/).*/, (_request, response) => {
    response.sendFile(path.join(clientBuild, "index.html"));
  });
}

app.listen(environment.PORT, () => {
  console.log(`Bakverkstan API listening on port ${environment.PORT}`);
});
