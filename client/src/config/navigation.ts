import { z } from "zod";

const navigationItemSchema = z.object({
  name: z.string().trim().min(1),
  href: z.string().regex(/^\/(?:[a-z0-9-]+)?$/i),
});

export const menuItems = z.array(navigationItemSchema).parse([
  { name: "Hem", href: "/" },
  { name: "Bakverk", href: "/bakverk" },
  { name: "Sortiment", href: "/sortiment" },
  // { name: "Påsk", href: "/pask" },
  // { name: "Presenter", href: "/presenter" },
  { name: "Workshops", href: "/workshops" },
  { name: "Kontakt", href: "/kontakt" },
]);
