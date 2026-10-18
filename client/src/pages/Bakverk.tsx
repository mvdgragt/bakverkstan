import { useEffect, useMemo, useState } from "react";
import { BAKVERK_CATEGORIES, matchesCategory } from "../config/bakverkCategories";
import { INSTAGRAM_URL } from "../config/environment";
import { useInstagramStore } from "../stores/instagramStore";

const Bakverk = () => {
  const posts = useInstagramStore((state) => state.posts);
  const next = useInstagramStore((state) => state.next);
  const status = useInstagramStore((state) => state.status);
  const error = useInstagramStore((state) => state.error);
  const loadingMore = useInstagramStore((state) => state.loadingMore);
  const fetchPosts = useInstagramStore((state) => state.fetchPosts);
  const loadMore = useInstagramStore((state) => state.loadMore);

  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const categories = useMemo(
    () =>
      BAKVERK_CATEGORIES.flatMap((category) => {
        const match = posts.find((post) => matchesCategory(post.caption, category));
        return match ? [{ category, cover: match.image }] : [];
      }),
    [posts]
  );

  const visiblePosts = useMemo(() => {
    const active = BAKVERK_CATEGORIES.find((c) => c.label === activeLabel);
    return active ? posts.filter((post) => matchesCategory(post.caption, active)) : posts;
  }, [posts, activeLabel]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <header className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold text-gray-800">Bakverk</h1>
        <p className="text-gray-600">
          Se våra senaste bakverk från Instagram.
        </p>
      </header>

      {status === "loading" && (
        <p className="py-12 text-center text-gray-600" role="status">
          Hämtar bilder från Instagram …
        </p>
      )}

      {status === "error" && posts.length === 0 && (
        <div className="py-12 text-center" role="alert">
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            className="rounded bg-stone-700 px-5 py-2 text-white hover:bg-stone-800"
            onClick={() => void fetchPosts()}
          >
            Försök igen
          </button>
        </div>
      )}

      {error && posts.length > 0 && (
        <p className="mb-5 text-center text-red-700" role="alert">
          {error}
        </p>
      )}

      {status === "ready" && posts.length === 0 && (
        <p className="py-12 text-center text-gray-600">
          Inga bilder kunde hittas på Instagram.
        </p>
      )}

      {categories.length > 0 && (
        <nav aria-label="Filtrera bakverk" className="mb-8">
          <ul className="flex gap-5 overflow-x-auto px-2 py-3 sm:justify-center">
            {categories.map(({ category, cover }) => {
              const active = category.label === activeLabel;
              return (
                <li key={category.label} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveLabel(active ? null : category.label)}
                    className="flex w-24 flex-col items-center gap-2"
                  >
                    <span
                      className={`rounded-full p-1 ring-4 transition ${
                        active ? "ring-stone-800" : "ring-stone-300 hover:ring-stone-500"
                      }`}
                    >
                      <img
                        src={cover}
                        alt=""
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    </span>
                    <span
                      className={`text-sm ${active ? "font-semibold text-gray-900" : "text-gray-700"}`}
                    >
                      {category.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {activeLabel && visiblePosts.length === 0 && (
        <p className="py-8 text-center text-gray-600">Inga bilder i denna kategori.</p>
      )}

      {visiblePosts.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => {
            return (
              <li key={post.id} className="overflow-hidden rounded-lg bg-white shadow">
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Öppna inlägget på Instagram"
                  className="group block"
                >
                  <img
                    src={post.image}
                    alt="Bakverk från Bakverkstan"
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {next && (
        <div className="mt-8 text-center">
          <button
            className="rounded bg-stone-700 px-5 py-2 text-white hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
            onClick={() => void loadMore()}
            disabled={loadingMore}
          >
            {loadingMore ? "Hämtar bilder …" : "Visa fler bilder"}
          </button>
        </div>
      )}

      <p className="mt-8 text-center">
        <a
          className="text-blue-700 underline hover:text-blue-900"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Följ Bakverkstan på Instagram
        </a>
      </p>
    </main>
  );
};

export default Bakverk;
