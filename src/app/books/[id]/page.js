
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        if (!API_URL) {
          throw new Error("Backend API URL is missing.");
        }

        const response = await fetch(
          `${API_URL}/books/${params.id}`
        );

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

            <button
              type="button"
              disabled={Number(book.totalCopies) <= 0}
              onClick={() => {
                router.push(`/books/${params.id}?borrow=true`);
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
    </section>
  );
}
