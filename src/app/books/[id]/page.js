
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  LoaderCircle,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultReturnDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowDate, setBorrowDate] = useState(getToday());
  const [returnDate, setReturnDate] = useState(getDefaultReturnDate());
  const [borrowing, setBorrowing] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState("");
  const [borrowError, setBorrowError] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        if (!API_URL) {
          throw new Error("Backend API URL is missing.");
        }

        const response = await fetch(`${API_URL}/books/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load book details.");
        }

        setBook(data.book || data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchBook();
    }
  }, [params.id]);

  async function handleBorrow(event) {
    event.preventDefault();

    setBorrowError("");
    setBorrowMessage("");

    if (!borrowDate || !returnDate) {
      setBorrowError("Please select both borrowing dates.");
      return;
    }

    if (returnDate <= borrowDate) {
      setBorrowError("Return date must be after the borrow date.");
      return;
    }

    if (Number(book.totalCopies) <= 0) {
      setBorrowError("No copies are currently available.");
      return;
    }

    setBorrowing(true);

    try {
      // Get the authenticated user's JWT.
      const tokenResponse = await fetch("/api/auth/token", {
        method: "GET",
        credentials: "include",
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error("Your login session may have expired. Please log in again.");
      }

      // Send the borrowing information to the backend.
      const response = await fetch(`${API_URL}/borrows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({
          bookId: params.id,
          borrowDate,
          returnDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not borrow this book.");
      }

      // Update the available copies on the page.
      setBook((previousBook) => ({
        ...previousBook,
        totalCopies: Number(previousBook.totalCopies) - 1,
      }));

      setBorrowMessage("Book borrowed successfully!");
      setShowBorrowModal(false);

    } catch (err) {
      setBorrowError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBorrowing(false);
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-[#234b3b]">
        <LoaderCircle size={28} className="animate-spin" />
        <p className="font-medium">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <BookOpen size={48} className="mb-4 text-[#b58b45]" />

        <h1 className="text-2xl font-bold text-[#234b3b]">
          Book Not Found
        </h1>

        <p className="mt-2 text-gray-700">
          {error || "We could not find this book."}
        </p>

        <Link
          href="/books"
          className="mt-6 rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white hover:bg-[#18382c]"
        >
          Back to All Books
        </Link>
      </section>
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
          Please log in to view book details and borrow books.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white hover:bg-[#18382c]"
        >
          Go to Login
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-12">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/books"
          className="mb-8 inline-flex items-center gap-2 font-semibold text-[#234b3b] hover:text-[#b58b45]"
        >
          <ArrowLeft size={18} />
          Back to All Books
        </Link>

        {borrowMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            {borrowMessage}
            <Link
              href="/my-borrows"
              className="ml-2 font-semibold underline"
            >
              View My Borrows
            </Link>
          </div>
        )}

        <div className="grid gap-10 rounded-2xl border border-[#e8e2d5] bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">

          <div className="flex items-center justify-center rounded-xl bg-[#f3eee3] p-5">
            <img
              src={book.image}
              alt={book.title}
              className="max-h-[520px] w-full rounded-lg object-contain"
            />
          </div>

          <div className="flex flex-col justify-center">

            <span className="w-fit rounded-full bg-[#f3eee3] px-4 py-2 text-sm font-semibold text-[#8c6a31]">
              {book.category}
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-[#234b3b] md:text-4xl">
              {book.title}
            </h1>

            <p className="mt-3 text-lg text-gray-700">
              By <span className="font-semibold">{book.author}</span>
            </p>

            <div className="my-7 h-px bg-[#e8e2d5]" />

            <h2 className="text-xl font-bold text-[#234b3b]">
              About This Book
            </h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
              {book.description}
            </p>

            <div className="mt-7 rounded-xl bg-[#f8f6f0] p-5">
              <p className="text-sm font-medium text-gray-600">
                Available Copies
              </p>

              <p className="mt-1 text-2xl font-bold text-[#234b3b]">
                {book.totalCopies}
              </p>
            </div>

            {borrowError && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {borrowError}
              </p>
            )}

            <button
              type="button"
              disabled={Number(book.totalCopies) <= 0}
              onClick={() => {
                setBorrowError("");
                setBorrowMessage("");
                setBorrowDate(getToday());
                setReturnDate(getDefaultReturnDate());
                setShowBorrowModal(true);
              }}
              className="mt-7 w-full rounded-lg bg-[#234b3b] px-6 py-4 font-semibold text-white transition hover:bg-[#18382c] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {Number(book.totalCopies) > 0
                ? "Borrow Book"
                : "Currently Unavailable"}
            </button>

          </div>
        </div>
      </div>

      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#234b3b]">
                Borrow This Book
              </h2>

              <button
                type="button"
                onClick={() => setShowBorrowModal(false)}
                disabled={borrowing}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Close borrowing form"
              >
                <X size={22} />
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-700">
              You are borrowing <strong>{book.title}</strong>.
              Choose your borrowing and return dates.
            </p>

            <form onSubmit={handleBorrow} className="space-y-5">

              <div>
                <label
                  htmlFor="borrowDate"
                  className="mb-2 block font-semibold text-gray-800"
                >
                  Borrow Date
                </label>

                <input
                  id="borrowDate"
                  type="date"
                  value={borrowDate}
                  min={getToday()}
                  onChange={(event) => setBorrowDate(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="returnDate"
                  className="mb-2 block font-semibold text-gray-800"
                >
                  Return Date
                </label>

                <input
                  id="returnDate"
                  type="date"
                  value={returnDate}
                  min={borrowDate || getToday()}
                  onChange={(event) => setReturnDate(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  disabled={borrowing}
                  className="w-1/2 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={borrowing}
                  className="flex w-1/2 items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-4 py-3 font-semibold text-white hover:bg-[#18382c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {borrowing ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Borrowing...
                    </>
                  ) : (
                    "Confirm Borrow"
                  )}
                </button>
              </div>

              {borrowError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {borrowError}
                </p>
              )}

            </form>
          </div>
        </div>
      )}
    </section>
  );
}
