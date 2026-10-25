// Products, prices and extras are edited by the admin at /admin/sortiment.

export const ORDER_EMAIL = "info@bakverkstan.se";
export const PICKUP_ADDRESS = "Bäckamansgatan 6, 252 30 Helsingborg";

const priceFormat = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export const formatPrice = (price: number) => priceFormat.format(price);
