import { useEffect } from "react";
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

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

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

      {posts.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
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
