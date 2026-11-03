"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function BookCover({
  src,
  title = "Book cover",
  className = "",
}) {
  const [imageError, setImageError] = useState(false);

  const showPlaceholder = !src || imageError;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[#eee9df] ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#b58b45]">
          <BookOpen size={48} strokeWidth={1.5} />

          <span className="text-sm font-medium text-[#6b716b]">
            Cover unavailable
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={`${title} book cover`}
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}