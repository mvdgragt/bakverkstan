import { z } from "zod";

const instagramUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    ["instagram.com", "www.instagram.com"].includes(url.hostname)
  );
}, "VITE_INSTAGRAM_URL must be an HTTPS Instagram URL");

const environmentSchema = z.object({
  VITE_INSTAGRAM_URL: instagramUrlSchema.default(
    "https://instagram.com/bakverkstan.se"
  ),
});

export const { VITE_INSTAGRAM_URL: INSTAGRAM_URL } =
  environmentSchema.parse(import.meta.env);
