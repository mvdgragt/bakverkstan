import { z } from "zod";

const instagramPostSchema = z.object({
  id: z.string().min(1),
  image: z.url(),
  caption: z.string(),
  permalink: z.url(),
  timestamp: z.string().optional(),
});

const instagramPageSchema = z.object({
  posts: z.array(instagramPostSchema),
  next: z.string().nullable(),
});

export type InstagramPost = z.infer<typeof instagramPostSchema>;
export type InstagramPage = z.infer<typeof instagramPageSchema>;

export async function fetchInstagramPage(cursor?: string): Promise<InstagramPage> {
  const url = new URL("/api/instagram", window.location.origin);
  if (cursor) url.searchParams.set("after", cursor);

  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      response.status === 404
        ? "The Instagram API route is not deployed. Deploy the site's API function and set INSTAGRAM_TOKEN in the hosting environment."
        : `The Instagram API returned a non-JSON response (HTTP ${response.status}).`
    );
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("The Instagram API returned invalid JSON.");
  }

  if (!response.ok) {
    const errorResponse = z
      .object({ error: z.string() })
      .safeParse(result);
    throw new Error(
      errorResponse.success
        ? errorResponse.data.error
        : "Instagram feed is temporarily unavailable."
    );
  }

  return instagramPageSchema.parse(result);
}
