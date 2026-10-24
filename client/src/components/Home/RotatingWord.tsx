import { useEffect, useState } from "react";

const WORDS = [
  "kakor",
  "smörgåstårtor",
  "bullar",
  "bakelser",
  "småkakor",
  "tårtor",
];

const RotatingWord = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % WORDS.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      key={index}
      aria-hidden="true"
      className="word-in block text-amber-500"
    >
      {WORDS[index]}
    </span>
  );
};

export default RotatingWord;
