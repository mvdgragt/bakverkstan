export interface BakverkCategory {
  label: string;
  // Matched case-insensitively against the Instagram caption (words and #hashtags).
  keywords: string[];
}

// Edit this list to change the filter circles shown above the Bakverk images.
export const BAKVERK_CATEGORIES: BakverkCategory[] = [
  { label: "Tårtor", keywords: ["tårta", "tårtor", "tårt"] },
  { label: "Barntårtor", keywords: ["barntårta", "barntårtor", "barnkalas"] },
  { label: "Jul", keywords: ["jul", "julbak", "pepparkak"] },
  { label: "Catering", keywords: ["catering"] },
  { label: "Bullar", keywords: ["bulle", "bullar", "kanelbullar"] },
  { label: "Bröllop", keywords: ["bröllop", "brudpar", "bröllopstårta"] },
  { label: "Kulla", keywords: ["kulla"] },
  { label: "Studenten", keywords: ["studen", "student"] },
  { label: "Praliner", keywords: ["praliner", "pralin", "choklad"] },
  { label: "Påsk", keywords: ["påsk"] },
  { label: "Prinsesstårta", keywords: ["prinsesstårta", "prinsesstårtor"] },
  { label: "Krooks", keywords: ["krooks", "krook"] },
  { label: "Tävling", keywords: ["tävling", "vinn"] },
  { label: "Semlor", keywords: ["semla", "semlor"] },
  { label: "Alla hjärtansdag", keywords: ["hjärtansdag", "alla hjärtans"] },
  { label: "Marknad", keywords: ["marknad", "maknad"] },
  { label: "Smörgåstårtor", keywords: ["smörgåstårta", "smörgåstårtor"] },
  { label: "Fars dag", keywords: ["fars dag", "farsdag"] },
];

export function matchesCategory(caption: string, category: BakverkCategory) {
  const text = caption.toLowerCase();
  return category.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}
