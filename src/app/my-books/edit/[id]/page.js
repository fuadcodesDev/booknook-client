
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  LoaderCircle,
  Save,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Fiction");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        if (!API_URL) {
          throw new Error("Backend API URL is missing.");
        }

        const response = await fetch(`${API_URL}/books/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load book.");
        }

        const foundBook = data.book || data;

        setBook(foundBook);
        setTitle(foundBook.title || "");
        setAuthor(foundBook.author || "");
        setCategory(foundBook.category || "Fiction");
        setDescription(foundBook.description || "");
        setTotalCopies(String(foundBook.totalCopies ?? ""));
        setPreview(foundBook.image || "");
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

  useEffect(() => {
    if (!imageFile) return;

    const imageUrl = URL.createObjectURL(imageFile);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [imageFile]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
  }

  async function getToken() {
    const response = await fetch("/api/auth/token", {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error("Your login session may have expired. Please log in again.");
    }

    return data.token;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const copies = Number(totalCopies);

    if (
      !title.trim() ||
      !author.trim() ||
      !category ||
      !description.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!Number.isInteger(copies) || copies < 1) {
      setError("Available copies must be a whole number greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const token = await getToken();

      let imageUrl = book.image;

      // Upload a replacement image only if the user selected one.
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await fetch(`${API_URL}/upload-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Image upload failed.");
        }

        imageUrl = uploadData.imageUrl;
      }

      const response = await fetch(`${API_URL}/books/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category,
          description: description.trim(),
          totalCopies: copies,
          image: imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update this book.");
      }

      setMessage("Book updated successfully!");

      router.push("/my-books");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-[#234b3b]">
        <LoaderCircle size={28} className="animate-spin" />
        <p className="font-medium">Loading book information...</p>
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
          Please log in to edit your books.
        </p>
        <Link
          href="/login"
          className="mt-6 rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white"
        >
          Go to Login
        </Link>
      </section>
    );
  }

  if (error && !book) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <BookOpen size={48} className="mb-4 text-[#b58b45]" />
        <h1 className="text-2xl font-bold text-[#234b3b]">
          Could Not Load Book
        </h1>
        <p className="mt-2 text-gray-700">{error}</p>
        <Link
          href="/my-books"
          className="mt-6 rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white"
        >
          Back to My Books
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-12">
      <div className="mx-auto max-w-3xl">

        <Link
          href="/my-books"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-[#234b3b] hover:text-[#b58b45]"
        >
          <ArrowLeft size={18} />
          Back to My Books
        </Link>

        <div className="rounded-2xl border border-[#e8e2d5] bg-white p-6 shadow-sm md:p-9">
          <div className="mb-8">
            <p className="font-semibold uppercase tracking-wider text-[#b58b45]">
              Manage Your Library
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#234b3b]">
              Edit Book
            </h1>
            <p className="mt-2 text-gray-700">
              Update your book information below.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Book Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-500"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-500"
                placeholder="Enter author name"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Category
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-500"
                placeholder="Write a short description of the book"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Available Copies
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={totalCopies}
                onChange={(event) => setTotalCopies(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />
              <p className="mt-2 text-sm text-gray-600">
                Enter the number of copies currently available.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Book Cover Image
              </label>

              {preview && (
                <div className="mb-4 flex justify-center rounded-lg bg-[#f8f6f0] p-4">
                  <img
                    src={preview}
                    alt="Book cover preview"
                    className="max-h-64 rounded-lg object-contain"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#234b3b] file:px-4 file:py-2 file:font-semibold file:text-white"
              />
              <p className="mt-2 text-sm text-gray-600">
                Select a new image only if you want to replace the current cover. Maximum 5 MB.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-6 py-4 font-semibold text-white hover:bg-[#18382c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}
