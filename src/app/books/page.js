
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, LoaderCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "All Books | BookNook";
  }, []);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch(`${API_URL}/books`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load books.");
        }

        setBooks(Array.isArray(data) ? data : data.books || []);
      } catch (err) {
        setError(err.message || "Something went wrong while loading books.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const categories = [
    "All",
    "Fiction",
    "Science",
    "History",
    "Kids",
    "Others",
  ];

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      book.title?.toLowerCase().includes(searchText) ||
      book.author?.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" || book.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#b58b45]">
            Explore Our Collection
          </p>

          <h1 className="text-3xl font-bold text-[#234b3b] md:text-5xl">
            All Books
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-700">
            Discover your next favorite book from the BookNook community.
          </p>
        </div>

        {/* Search and category filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by book title or author..."
              className="w-full rounded-xl border border-[#d6d0c4] bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-[#d6d0c4] bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-[30vh] items-center justify-center gap-3 text-[#234b3b]">
            <LoaderCircle className="animate-spin" size={25} />
            <p>Loading books...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="rounded-2xl border border-[#e8e2d5] bg-white px-5 py-16 text-center">
            <BookOpen
              className="mx-auto mb-4 text-[#b58b45]"
              size={42}
            />

            <h2 className="text-xl font-bold text-[#234b3b]">
              No Books Found
            </h2>

            <p className="mt-2 text-gray-700">
              Try another search or category.
            </p>
          </div>
        )}

        {/* Book collection */}
        {!loading && !error && filteredBooks.length > 0 && (
          <>
            <p className="mb-5 text-sm text-gray-700">
              Showing {filteredBooks.length} of {books.length} books
            </p>

            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <article
                  key={book._id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e2d5] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Consistent book cover */}
                  <div className="relative flex h-64 items-center justify-center bg-[#eee9df] p-3">
                    <BookOpen
                      size={48}
                      className="absolute text-[#b58b45]/50"
                    />

                    {book.image && (
                      <img
                        src={book.image}
                        alt={`${book.title} book cover`}
                        loading="lazy"
                        className="relative z-10 h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  {/* Book information */}
                  <div className="flex flex-1 flex-col p-5">
                    <div>
                      <span className="inline-block rounded-full bg-[#f3eee3] px-3 py-1 text-xs font-semibold text-[#8c6a31]">
                        {book.category}
                      </span>

                      <h2 className="mt-4 min-h-[3.5rem] line-clamp-2 text-xl font-bold leading-7 text-[#234b3b]">
                        {book.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-700">
                        By {book.author}
                      </p>

                      <p className="mt-3 min-h-[3rem] line-clamp-2 text-sm leading-6 text-gray-700">
                        {book.description}
                      </p>
                    </div>

                    {/* Bottom section */}
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#eee9df] pt-5">
                      <span className="text-sm font-medium text-gray-700">
                        Available copies: {book.totalCopies}
                      </span>

                      <Link
                        href={`/books/${book._id}`}
                        className="shrink-0 rounded-lg bg-[#234b3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#18382c]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
