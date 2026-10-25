import { create } from "zustand";
import { fetchSortiment, type SortimentCategory } from "../services/sortiment";

interface SortimentState {
  categories: SortimentCategory[];
  pageLive: boolean;
  preview: boolean;
  status: "idle" | "loading" | "ready" | "error";
  fetch: () => Promise<void>;
}

// Refetched each time the Sortiment pages open so admin edits show up; the
// previous data stays on screen meanwhile.
export const useSortimentStore = create<SortimentState>((set) => ({
  categories: [],
  pageLive: false,
  preview: false,
  status: "idle",
  fetch: async () => {
    set((state) => ({ status: state.status === "ready" ? "ready" : "loading" }));
    try {
      const { categories, pageLive, preview } = await fetchSortiment();
      set({ categories, pageLive, preview, status: "ready" });
    } catch {
      set((state) => ({ status: state.status === "ready" ? "ready" : "error" }));
    }
  },
}));

export const useCategory = (slug: string | undefined) =>
  useSortimentStore((state) => state.categories.find((category) => category.slug === slug));
