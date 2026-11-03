
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Library,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const slides = [
  {
    eyebrow: "WELCOME TO BOOKNOOK",
    title: "Every book opens a new world.",
    description:
      "Discover stories, explore ideas, and find your next favorite read in our growing library.",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000",
  },
  {
    eyebrow: "EXPLORE. DISCOVER. READ.",
    title: "Find the story waiting for you.",
    description:
      "From timeless classics to fascinating discoveries, your next adventure starts here.",
    image:
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=2000",
  },
  {
    eyebrow: "YOUR READING JOURNEY",
    title: "Make room for more stories.",
    description:
      "Borrow books, build your collection, and make every reading moment count.",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=2000",
  },
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "BookNook | Your Cozy Reading Corner";
  }, []);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch(`${API_URL}/books`);

        if (!response.ok) {
          throw new Error("Unable to load books.");
        }

        const data = await response.json();
        const bookList = Array.isArray(data) ? data : data.books || [];

        setBooks(bookList.slice(0, 6));
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  return (
    <div className="bg-[#faf9f6]">
      {/* Hero Slider */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-[480px] sm:h-[540px] md:h-[650px]"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative flex h-full items-center bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black/55" />

                <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-white lg:px-8">
                  <p className="mb-5 text-xs font-semibold tracking-[0.3em] text-[#e2bd7c] sm:text-sm">
                    {slide.eyebrow}
                  </p>

                  <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    {slide.title}
                  </h1>

                  <p className="mt-6 max-w-xl text-base leading-8 text-white/85 md:text-lg">
                    {slide.description}
                  </p>

                  <Link
                    href="/books"
                    className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#d5ad67] px-8 py-4 font-semibold text-[#183729] transition hover:bg-white"
                  >
                    Browse Books <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Latest Books */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-bold tracking-[0.2em] text-[#b58b45]">
              THE COLLECTION
            </p>

            <h2 className="font-serif text-3xl font-bold text-[#234b3b] md:text-5xl">
              Recently Added Books
            </h2>

            <p className="mt-4 text-[#6b716b]">
              Fresh discoveries waiting to become your next favorite.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 font-semibold text-[#234b3b] transition hover:text-[#b58b45]"
          >
            See All Books <ArrowRight size={18} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[30vh] items-center justify-center gap-3 text-[#234b3b]">
            <LoaderCircle className="animate-spin" size={25} />
            <p>Loading our collection...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">
            {error} Please check that the backend server is running.
          </div>
        )}

        {/* Empty collection */}
        {!loading && !error && books.length === 0 && (
          <div className="rounded-2xl bg-[#f0eee7] px-5 py-16 text-center">
            <BookOpen
              size={45}
              className="mx-auto mb-4 text-[#b58b45]"
            />

            <h3 className="text-xl font-bold text-[#234b3b]">
              Our Library Is Waiting
            </h3>

            <p className="mt-2 text-[#6b716b]">
              No books have been added yet. Check back soon!
            </p>
          </div>
        )}

        {/* Book cards */}
        {!loading && !error && books.length > 0 && (
          <>
            <p className="mb-5 text-sm text-[#6b716b]">
              Showing {books.length} recently added books
            </p>

            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <article
                  key={book._id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e9e4d9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Book cover */}
                  <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#f0eee7] p-3 sm:h-72">
                    <BookOpen
                      size={48}
                      className="absolute text-[#b58b45]/50"
                    />

                    {book.image && (
                      <img
                        src={book.image}
                        alt={`${book.title} book cover`}
                        loading="lazy"
                        className="relative z-10 h-full w-full object-contain transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  {/* Book information */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div>
                      <span className="inline-block rounded-full bg-[#edf2ed] px-3 py-1 text-xs font-semibold text-[#234b3b]">
                        {book.category}
                      </span>

                      <h3 className="mt-4 min-h-[3.5rem] line-clamp-2 font-serif text-xl font-bold leading-7 text-[#234b3b] sm:text-2xl">
                        {book.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#777d76]">
                        By {book.author}
                      </p>

                      <p className="mt-3 min-h-[3rem] line-clamp-2 text-sm leading-6 text-[#6b716b]">
                        {book.description || "Discover this book in our library."}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-col gap-4 border-t border-[#eee9df] pt-5">
                      <p className="text-sm font-medium text-[#6b716b]">
                        Available copies: {book.totalCopies ?? 0}
                      </p>

                      <Link
                        href={`/books/${book._id}`}
                        className="inline-flex w-fit items-center gap-2 font-bold text-[#234b3b] transition hover:text-[#b58b45]"
                      >
                        View Details <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Why BookNook */}
      <section className="bg-[#eef0e9] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold tracking-[0.2em] text-[#b58b45]">
              MORE THAN A LIBRARY
            </p>

            <h2 className="font-serif text-3xl font-bold text-[#234b3b] md:text-5xl">
              A little space for big ideas.
            </h2>

            <p className="mt-5 leading-7 text-[#6b716b]">
              BookNook makes it easier to discover books, share your
              collection, and keep your reading journey moving.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <BookOpen size={30} />,
                title: "Discover Stories",
                text: "Explore books across different subjects and genres.",
              },
              {
                icon: <Library size={30} />,
                title: "Build Your Library",
                text: "Add books and manage your personal collection.",
              },
              {
                icon: <Sparkles size={30} />,
                title: "Keep Exploring",
                text: "Borrow books and discover something new every day.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-9 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2ed] text-[#234b3b]">
                  {item.icon}
                </div>

                <h3 className="font-serif text-xl font-bold text-[#234b3b]">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-[#777d76]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reading Call to Action */}
      <section className="bg-[#234b3b] px-5 py-16 text-center text-white sm:py-20">
        <p className="mb-4 text-sm font-bold tracking-[0.2em] text-[#e2bd7c]">
          YOUR NEXT CHAPTER STARTS HERE
        </p>

        <h2 className="mx-auto max-w-2xl font-serif text-3xl font-bold md:text-5xl">
          Ready to find your next favorite book?
        </h2>

        <p className="mx-auto mt-5 max-w-xl leading-7 text-white/75">
          Explore our collection and discover where your next reading
          adventure takes you.
        </p>

        <Link
          href="/books"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d5ad67] px-8 py-4 font-semibold text-[#183729] transition hover:bg-white"
        >
          Explore the Library <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
