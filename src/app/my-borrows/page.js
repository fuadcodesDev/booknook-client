
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { LoaderCircle, BookOpen, RotateCcw } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyBorrowsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [returningId, setReturningId] = useState("");

useEffect(() => {
  document.title = "My Borrow | BookNook";
}, []);

  const fetchBorrows = useCallback(async () => {
    try {
      setError("");

      const tokenResponse = await fetch("/api/auth/token", {
        credentials: "include",
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error("Could not verify your login session.");
      }

      const response = await fetch(`${API_URL}/borrows`, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load borrowing records.");
      }

      setBorrows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session?.user) {
      fetchBorrows();
    } else if (!isPending && !session?.user) {
      setLoading(false);
    }
  }, [isPending, session, fetchBorrows]);

  async function handleReturn(borrowId) {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmed) return;

    setReturningId(borrowId);
    setError("");
    setMessage("");

    try {
      const tokenResponse = await fetch("/api/auth/token", {
        credentials: "include",
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error("Could not verify your login session.");
      }

      const response = await fetch(`${API_URL}/borrows/${borrowId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not return this book.");
      }

      setBorrows((previous) =>
        previous.map((borrow) =>
          borrow._id === borrowId
            ? { ...borrow, status: "returned" }
            : borrow
        )
      );

      setMessage("Book returned successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setReturningId("");
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-[#234b3b]">
        <LoaderCircle size={28} className="animate-spin" />
        <p className="font-medium">Loading your borrowed books...</p>
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
          Please log in to see your borrowed books.
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

  const activeBorrows = borrows.filter(
    (borrow) => borrow.status === "borrowed"
  );

  const returnedBorrows = borrows.filter(
    (borrow) => borrow.status === "returned"
  );

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-12">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="font-semibold uppercase tracking-wider text-[#b58b45]">
            Your Reading Journey
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#234b3b] md:text-4xl">
            My Borrowed Books
          </h1>
          <p className="mt-3 text-gray-700">
            Manage your borrowed books and keep track of returns.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e8e2d5] bg-white p-6">
            <p className="text-sm font-medium text-gray-600">
              Currently Borrowed
            </p>
            <p className="mt-2 text-3xl font-bold text-[#234b3b]">
              {activeBorrows.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#e8e2d5] bg-white p-6">
            <p className="text-sm font-medium text-gray-600">
              Returned Books
            </p>
            <p className="mt-2 text-3xl font-bold text-[#234b3b]">
              {returnedBorrows.length}
            </p>
          </div>
        </div>

        {borrows.length === 0 ? (
          <div className="rounded-2xl border border-[#e8e2d5] bg-white px-6 py-16 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-[#b58b45]" />
            <h2 className="text-xl font-bold text-[#234b3b]">
              No Borrowed Books Yet
            </h2>
            <p className="mt-2 text-gray-700">
              Explore our library and borrow your first book.
            </p>
            <Link
              href="/books"
              className="mt-6 inline-block rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white hover:bg-[#18382c]"
            >
              Explore Books
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e8e2d5] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-[#234b3b] text-white">
                  <tr>
                    <th className="px-5 py-4">Book</th>
                    <th className="px-5 py-4">Borrow Date</th>
                    <th className="px-5 py-4">Return Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {borrows.map((borrow) => (
                    <tr
                      key={borrow._id}
                      className="border-b border-[#eee9df] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {borrow.bookImage && (
                            <img
                              src={borrow.bookImage}
                              alt={borrow.bookTitle}
                              className="h-16 w-12 rounded object-cover"
                            />
                          )}
                          <span className="font-semibold text-[#234b3b]">
                            {borrow.bookTitle}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {new Date(borrow.borrowDate).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {new Date(borrow.returnDate).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            borrow.status === "borrowed"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {borrow.status === "borrowed"
                            ? "Borrowed"
                            : "Returned"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {borrow.status === "borrowed" ? (
                          <button
                            type="button"
                            onClick={() => handleReturn(borrow._id)}
                            disabled={returningId === borrow._id}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#234b3b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#18382c] disabled:opacity-60"
                          >
                            {returningId === borrow._id ? (
                              <LoaderCircle size={16} className="animate-spin" />
                            ) : (
                              <RotateCcw size={16} />
                            )}
                            Return
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Completed
                          </span>
                        )}
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
