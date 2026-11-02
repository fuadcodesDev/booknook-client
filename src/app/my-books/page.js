
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  LoaderCircle,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyBooksPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchMyBooks = useCallback(async () => {
    try {
      setError("");

      const tokenResponse = await fetch("/api/auth/token", {
        credentials: "include",
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error("Could not verify your login session.");
      }

      const response = await fetch(`${API_URL}/books/my-books`, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load your books.");
      }

      setBooks(Array.isArray(data) ? data : data.books || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session?.user) {
      fetchMyBooks();
    } else if (!isPending && !session?.user) {
      setLoading(false);
    }
  }, [isPending, session, fetchMyBooks]);

  async function handleDelete(bookId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(bookId);
    setError("");

    try {
      const tokenResponse = await fetch("/api/auth/token", {
        credentials: "include",
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error("Could not verify your login session.");
      }

      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete this book.");
      }

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book._id !== bookId)
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setDeletingId("");
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-[#234b3b]">
        <LoaderCircle size={28} className="animate-spin" />
        <p className="font-medium">Loading your books...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <BookOpen size={48} className="mb-4 text-[#b58b45]" />

        <h1 className="text-2xl font-bold text-[#234b3b]">
          Login Required
        </h1>

        <p className="mt-2 text-gray-700">
          Please log in to manage your books.
        </p>

        <Link
          href="/login"
          className="mt-6 rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white hover:bg-[#18382c]"
        >
          Go to Login
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold uppercase tracking-wider text-[#b58b45]">
              Your Library
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#234b3b] md:text-4xl">
              My Books
            </h1>

            <p className="mt-3 text-gray-700">
              Manage the books you have added to BookNook.
            </p>
          </div>

          <Link
            href="/add-book"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 font-semibold text-white hover:bg-[#18382c]"
          >
            <Plus size={19} />
            Add New Book
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-xl border border-[#e8e2d5] bg-white p-5">
          <p className="text-sm font-medium text-gray-600">
            Total Books Added
          </p>

          <p className="mt-2 text-3xl font-bold text-[#234b3b]">
            {books.length}
          </p>
        </div>

        {books.length === 0 ? (
          <div className="rounded-2xl border border-[#e8e2d5] bg-white px-6 py-16 text-center">
            <BookOpen
              size={48}
              className="mx-auto mb-4 text-[#b58b45]"
            />

            <h2 className="text-xl font-bold text-[#234b3b]">
              You Haven't Added Any Books
            </h2>

            <p className="mt-2 text-gray-700">
              Start building your library by adding your first book.
            </p>

            <Link
              href="/add-book"
              className="mt-6 inline-block rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white hover:bg-[#18382c]"
            >
              Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e8e2d5] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#234b3b] text-white">
                  <tr>
                    <th className="px-5 py-4">Book</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Available Copies</th>
                    <th className="px-5 py-4">Added Date</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr
                      key={book._id}
                      className="border-b border-[#eee9df] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.image}
                            alt={book.title}
                            className="h-16 w-12 rounded object-cover"
                          />

                          <div>
                            <p className="font-semibold text-[#234b3b]">
                              {book.title}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {book.category}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {book.totalCopies}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {book.createdAt
                          ? new Date(book.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/my-books/edit/${book._id}`)
                            }
                            title="Edit book"
                            className="rounded-lg bg-[#f3eee3] p-2 text-[#234b3b] hover:bg-[#e8dfce]"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(book._id)}
                            disabled={deletingId === book._id}
                            title="Delete book"
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            {deletingId === book._id ? (
                              <LoaderCircle
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
