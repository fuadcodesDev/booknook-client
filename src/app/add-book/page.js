"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function AddBookPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    totalCopies: "1",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Add Book | BookNook";
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      setImageFile(null);
      setPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      setImageFile(null);
      setPreview("");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      setImageFile(null);
      setPreview("");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!session?.user) {
      setError("Please log in before adding a book.");
      return;
    }

    if (!API_URL) {
      setError(
        "Backend API URL is missing. Please check your .env.local file."
      );
      return;
    }

    if (!imageFile) {
      setError("Please select a book-cover image.");
      return;
    }

    const copies = Number(form.totalCopies);

    if (!Number.isInteger(copies) || copies < 1) {
      setError("Total copies must be a whole number greater than zero.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.category ||
      !form.description.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. Get a JWT from Better Auth.
      const tokenResponse = await fetch("/api/auth/token", {
        credentials: "include",
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error("Your login session expired. Please log in again.");
      }

      const token = tokenData.token;

      // 2. Upload the selected image to ImgBB.
      const imageFormData = new FormData();
      imageFormData.append("image", imageFile);

      const uploadResponse = await fetch(`${API_URL}/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.imageUrl) {
        throw new Error(uploadData.message || "Image upload failed.");
      }

      // 3. Save book details and image URL in MongoDB.
      const bookResponse = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          author: form.author.trim(),
          category: form.category,
          description: form.description.trim(),
          totalCopies: copies,
          image: uploadData.imageUrl,
        }),
      });

      const bookData = await bookResponse.json();

      if (!bookResponse.ok) {
        throw new Error(bookData.message || "Could not add the book.");
      }

      setMessage("Your book was added successfully!");

      setForm({
        title: "",
        author: "",
        category: "",
        description: "",
        totalCopies: "1",
      });

      setImageFile(null);
      setPreview("");

      event.target.reset();

      setTimeout(() => {
        router.push("/books");
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <LoaderCircle className="animate-spin text-[#234b3b]" size={26} />
        <p className="font-medium text-gray-600">
          Checking your login...
        </p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Login Required
        </h1>

        <p className="max-w-md text-gray-600">
          Please log in to add a book to BookNook.
        </p>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white transition hover:bg-[#18382c]"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Page heading */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b58b45] sm:text-sm">
            Share the joy of reading
          </p>

          <h1 className="text-3xl font-bold text-[#234b3b] sm:text-4xl">
            Add a New Book
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
            Add a book to your BookNook collection and share it with other
            readers.
          </p>
        </div>

        {/* Book form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-[#e8e2d5] bg-white p-5 shadow-sm sm:p-7 md:p-9"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Book Title *
            </label>

            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter book title"
              maxLength={150}
              required
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10 disabled:bg-gray-100"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {form.title.length}/150 characters
            </p>
          </div>

          {/* Author */}
          <div>
            <label
              htmlFor="author"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Author *
            </label>

            <input
              id="author"
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Enter author's name"
              maxLength={100}
              required
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10 disabled:bg-gray-100"
            />
          </div>

          {/* Category and copies */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category *
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10 disabled:bg-gray-100"
              >
                <option value="">Choose a category</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="totalCopies"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Total Copies *
              </label>

              <input
                id="totalCopies"
                type="number"
                name="totalCopies"
                value={form.totalCopies}
                onChange={handleChange}
                min="1"
                step="1"
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label
              htmlFor="bookImage"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Book Cover Image *
            </label>

            <label
              htmlFor="bookImage"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d6d0c4] bg-[#faf9f6] px-5 py-7 text-center transition hover:border-[#234b3b] hover:bg-[#f5f4ed] ${
                loading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <ImagePlus size={32} className="mb-3 text-[#b58b45]" />

              <span className="font-semibold text-[#234b3b]">
                {imageFile ? "Change selected image" : "Choose a book cover"}
              </span>

              <span className="mt-2 text-xs text-gray-500">
                JPG, PNG, WEBP or other image formats · Maximum 5 MB
              </span>

              <input
                id="bookImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                disabled={loading}
                className="sr-only"
              />
            </label>

            {imageFile && (
              <p className="mt-2 break-all text-sm text-gray-600">
                Selected: {imageFile.name}
              </p>
            )}

            {/* Image preview */}
            {preview && (
              <div className="mt-5 rounded-xl border border-[#e8e2d5] bg-[#eee9df] p-4">
                <p className="mb-3 text-sm font-semibold text-[#234b3b]">
                  Image Preview
                </p>

                <img
                  src={preview}
                  alt="Selected book cover preview"
                  className="mx-auto h-64 w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write a short description of the book..."
              rows={5}
              maxLength={2000}
              required
              disabled={loading}
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10 disabled:bg-gray-100"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {form.description.length}/2000 characters
            </p>
          </div>

          {/* Added by */}
          <div>
            <label
              htmlFor="addedBy"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Added By
            </label>

            <input
              id="addedBy"
              type="text"
              value={session.user.name || session.user.email}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700"
            />

            <p className="mt-1 text-xs text-gray-500">
              Your account is automatically associated with this book.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !!message}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#234b3b] px-6 py-4 font-semibold text-white transition hover:bg-[#18382c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={20} className="animate-spin" />
                Uploading Image & Saving Book...
              </>
            ) : message ? (
              <>
                <CheckCircle2 size={20} />
                Book Added Successfully
              </>
            ) : (
              "Add Book"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}