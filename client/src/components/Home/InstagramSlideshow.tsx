import { useEffect, useMemo, useState } from "react";
import cake from "../../assets/cake.webp";
import cakeFruit from "../../assets/cakeFruit.webp";
import bakverk from "../../assets/bakverk.webp";
import workshop from "../../assets/workshop.webp";
import { useInstagramStore } from "../../stores/instagramStore";

const FALLBACK_IMAGES = [cake, cakeFruit, workshop, bakverk];
const MAX_IMAGES = 20;

const InstagramSlideshow = ({ className = "" }: { className?: string }) => {
  const posts = useInstagramStore((state) => state.posts);
  const fetchPosts = useInstagramStore((state) => state.fetchPosts);
  const [slide, setSlide] = useState<{
    index: number;
    previous: number | null;
  }>({ index: 0, previous: null });

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const images = useMemo(() => {
    const fromInstagram = posts.slice(0, MAX_IMAGES).map((post) => post.image);
    return fromInstagram.length > 0 ? fromInstagram : FALLBACK_IMAGES;
  }, [posts]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((s) => ({
        index: (s.index + 1) % images.length,
        previous: s.index % images.length,
      }));
    }, 4000);
    return () => window.clearInterval(id);
  }, [images.length]);

  const active = slide.index % images.length;
  const previous = slide.previous;

  return (
    <div className={`overflow-hidden bg-stone-800 ${className}`}>
      {images.map((src, i) => {
        const position =
          i === active
            ? "translate-x-0"
            : i === previous
              ? "-translate-x-full"
              : "translate-x-full";
        const animated = i === active || i === previous;
        return (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover motion-reduce:transition-none ${position} ${
              animated ? "transition-transform duration-1000 ease-in-out" : ""
            }`}
          />
        );
      })}
    </div>
  );
};

export default InstagramSlideshow;
