import { create } from "zustand";
import {
  fetchInstagramPage,
  type InstagramPost,
} from "../services/instagram";

type FeedStatus = "idle" | "loading" | "ready" | "error";

interface InstagramState {
  posts: InstagramPost[];
  next: string | null;
  status: FeedStatus;
  error: string | null;
  loadingMore: boolean;
  fetchPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useInstagramStore = create<InstagramState>((set, get) => ({
  posts: [],
  next: null,
  status: "idle",
  error: null,
  loadingMore: false,
  fetchPosts: async () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading", error: null });

    try {
      const page = await fetchInstagramPage();
      set({ posts: page.posts, next: page.next, status: "ready" });
    } catch (error) {
      set({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Instagram feed is temporarily unavailable.",
      });
    }
  },
  loadMore: async () => {
    const { next, loadingMore } = get();
    if (!next || loadingMore) return;

    set({ loadingMore: true, error: null });
    try {
      const page = await fetchInstagramPage(next);
      const existingIds = new Set(get().posts.map((post) => post.id));
      set((state) => ({
        posts: [
          ...state.posts,
          ...page.posts.filter((post) => !existingIds.has(post.id)),
        ],
        next: page.next,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Could not load more Instagram images.",
      });
    } finally {
      set({ loadingMore: false });
    }
  },
}));
