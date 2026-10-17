import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const GRAPH_URL = "https://graph.instagram.com";
const MEDIA_FIELDS =
  "id,caption,media_type,media_url,permalink,timestamp,children{id,media_type,media_url}";
const REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TIMER_MS = 6 * 60 * 60 * 1000;

const nullableUrlSchema = z.url().nullable().optional();

const childMediaSchema = z.object({
  id: z.string().min(1),
  media_type: z.enum(["IMAGE", "VIDEO"]),
  media_url: nullableUrlSchema,
});

const mediaSchema = z.object({
  id: z.string().min(1),
  caption: z.string().nullable().optional(),
  media_type: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
  media_url: nullableUrlSchema,
  permalink: z.url(),
  timestamp: z.string().nullable().optional(),
  children: z.object({ data: z.array(childMediaSchema) }).nullable().optional(),
});

const mediaResponseSchema = z.object({
  data: z.array(mediaSchema),
  paging: z
    .object({
      next: z.string().optional(),
      cursors: z.object({ after: z.string().optional() }).optional(),
    })
    .optional(),
});

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
});

const storedTokenSchema = z.object({
  token: z.string().min(1),
  sourceTokenHash: z.string().min(1),
  refreshedAt: z.string().datetime(),
});

const normalizeMedia = (item) => {
  if (item.media_type === "CAROUSEL_ALBUM" && item.children) {
    return item.children.data
      .filter((child) => child.media_type === "IMAGE" && child.media_url)
      .map((child) => ({
        id: child.id,
        image: child.media_url,
        caption: item.caption ?? "",
        permalink: item.permalink,
        timestamp: item.timestamp ?? undefined,
      }))
  }

  return item.media_type === "IMAGE" && item.media_url
    ? [
        {
          id: item.id,
          image: item.media_url,
          caption: item.caption ?? "",
          permalink: item.permalink,
          timestamp: item.timestamp ?? undefined,
        },
      ]
    : [];
};

export function createInstagram({ token, tokenFile, cacheSeconds = 300 }) {
  const sourceTokenHash = createHash("sha256").update(token).digest("hex");
  let accessToken = token;
  let refreshedAt = null;
  const cache = new Map();

  async function loadToken() {
    try {
      const stored = storedTokenSchema.parse(
        JSON.parse(await fs.readFile(tokenFile, "utf8"))
      );
      if (stored.sourceTokenHash === sourceTokenHash) {
        accessToken = stored.token;
        refreshedAt = stored.refreshedAt;
      }
    } catch (error) {
      if (error.code !== "ENOENT" && !(error instanceof z.ZodError)) {
        console.warn("[instagram] Could not load saved access token.");
      }
    }
  }

  async function refreshTokenIfDue() {
    if (refreshedAt && Date.now() - Date.parse(refreshedAt) < REFRESH_INTERVAL_MS) {
      return;
    }

    const url = new URL(`${GRAPH_URL}/refresh_access_token`);
    url.searchParams.set("grant_type", "ig_refresh_token");
    url.searchParams.set("access_token", accessToken);

    try {
      const response = await fetch(url);
      const result = tokenResponseSchema.parse(await response.json());
      if (!response.ok) {
        throw new Error(`Instagram token refresh returned HTTP ${response.status}`);
      }

      accessToken = result.access_token;
      refreshedAt = new Date().toISOString();
      await fs.mkdir(path.dirname(tokenFile), { recursive: true });
      await fs.writeFile(
        tokenFile,
        JSON.stringify({ token: accessToken, sourceTokenHash, refreshedAt }),
        { mode: 0o600 }
      );
    } catch (error) {
      console.warn(`[instagram] Token refresh failed: ${error.message}`);
    }
  }

  async function getPosts(after) {
    const cacheKey = after ?? "first";
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheSeconds * 1000) {
      return cached.data;
    }

    const url = new URL(`${GRAPH_URL}/me/media`);
    url.searchParams.set("fields", MEDIA_FIELDS);
    url.searchParams.set("limit", "25");
    url.searchParams.set("access_token", accessToken);
    if (after) url.searchParams.set("after", after);

    const response = await fetch(url);
    const result = await response.json();
    if (!response.ok || result.error) {
      const message = z
        .object({ error: z.object({ message: z.string().optional() }).optional() })
        .safeParse(result).data?.error?.message;
      throw new Error(message ?? `Instagram API returned HTTP ${response.status}`);
    }

    const data = mediaResponseSchema.parse(result);
    const payload = {
      posts: data.data.flatMap(normalizeMedia),
      next: data.paging?.next ? data.paging.cursors?.after ?? null : null,
    };
    cache.set(cacheKey, { timestamp: Date.now(), data: payload });
    if (cache.size > 50) cache.clear();
    return payload;
  }

  async function start() {
    await loadToken();
    await refreshTokenIfDue();
    const timer = setInterval(refreshTokenIfDue, REFRESH_TIMER_MS);
    timer.unref();
  }

  return { start, getPosts };
}
