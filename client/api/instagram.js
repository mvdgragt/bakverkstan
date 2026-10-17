import { z } from "zod";

const graphUrl = "https://graph.instagram.com/me/media";
const mediaResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().min(1),
      caption: z.string().nullable().optional(),
      media_type: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
      media_url: z.url().nullable().optional(),
      permalink: z.url(),
      timestamp: z.string().nullable().optional(),
      children: z
        .object({
          data: z.array(
            z.object({
              id: z.string().min(1),
              media_type: z.enum(["IMAGE", "VIDEO"]),
              media_url: z.url().nullable().optional(),
            })
          ),
        })
        .nullable()
        .optional(),
    })
  ),
  paging: z
    .object({
      next: z.string().optional(),
      cursors: z.object({ after: z.string().optional() }).optional(),
    })
    .optional(),
});

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
});

const cursorSchema = z.string().min(1).max(1024);
const cache = new Map();
let accessToken;
let configuredToken;
let lastTokenRefresh = 0;

function toImages(media) {
  if (media.media_type === "IMAGE" && media.media_url) {
    return [{ id: media.id, image: media.media_url }];
  }

  if (media.media_type !== "CAROUSEL_ALBUM" || !media.children) {
    return [];
  }

  return media.children.data
    .filter((child) => child.media_type === "IMAGE" && child.media_url)
    .map((child) => ({ id: child.id, image: child.media_url }));
}

async function getAccessToken() {
  const configuredToken = process.env.INSTAGRAM_TOKEN?.trim();
  if (!configuredToken) {
    throw Object.assign(new Error("Instagram feed is not configured."), {
      statusCode: 503,
    });
  }

  if (configuredToken !== process.env.INSTAGRAM_TOKEN?.trim()) {
    configuredToken = process.env.INSTAGRAM_TOKEN?.trim();
    accessToken = configuredToken;
    lastTokenRefresh = 0;
  }
  if (Date.now() - lastTokenRefresh < 7 * 24 * 60 * 60 * 1000) {
    return accessToken;
  }

  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);
  try {
    const response = await fetch(url);
    const result = await response.json();
    if (response.ok) {
      const parsed = tokenResponseSchema.safeParse(result);
      if (parsed.success) {
        accessToken = parsed.data.access_token;
        lastTokenRefresh = Date.now();
      }
    }
  } catch (error) {
    console.warn(`[instagram] Token refresh failed: ${error.message}`);
  }

  return accessToken;
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  const rawCursor = request.query.after;
  const cursor =
    typeof rawCursor === "string" ? cursorSchema.safeParse(rawCursor) : null;
  if (rawCursor !== undefined && (!cursor || !cursor.success)) {
    response.status(400).json({ error: "Invalid Instagram page cursor." });
    return;
  }

  const after = cursor?.data;
  const cacheKey = after ?? "first";
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    response.status(200).json(cached.data);
    return;
  }

  try {
    const token = await getAccessToken();
    const url = new URL(graphUrl);
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,permalink,timestamp,children{id,media_type,media_url}"
    );
    url.searchParams.set("limit", "25");
    url.searchParams.set("access_token", token);
    if (after) url.searchParams.set("after", after);

    const instagramResponse = await fetch(url);
    const result = await instagramResponse.json();
    if (!instagramResponse.ok || result.error) {
      throw new Error(
        typeof result.error?.message === "string"
          ? result.error.message
          : `Instagram returned HTTP ${instagramResponse.status}.`
      );
    }

    const page = mediaResponseSchema.parse(result);
    const data = {
      posts: page.data.flatMap((media) =>
        toImages(media).map((image) => ({
          ...image,
          caption: media.caption ?? "",
          permalink: media.permalink,
          timestamp: media.timestamp ?? undefined,
        }))
      ),
      next: page.paging?.next ? page.paging.cursors?.after ?? null : null,
    };

    cache.set(cacheKey, { timestamp: Date.now(), data });
    if (cache.size > 50) cache.clear();
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    response.status(200).json(data);
  } catch (error) {
    console.error(`[instagram] ${error.message}`);
    response.status(error.statusCode ?? 502).json({
      error:
        error.statusCode === 503
          ? error.message
          : "Instagram feed is temporarily unavailable.",
    });
  }
}
