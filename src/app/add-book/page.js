
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
      setError("Backend API URL is missing. Please check your .env.local file.");
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
      }, 1200);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">Checking your login...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Login Required
        </h1>

        <p className="text-gray-600">
          Please log in to add a book to BookNook.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white hover:bg-[#18382c]"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#b58b45]">
            Share the joy of reading
          </p>

          <h1 className="text-3xl font-bold text-[#234b3b] md:text-4xl">
            Add a New Book
          </h1>

          <p className="mt-3 text-gray-600">
            Add a book to your BookNook collection.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-[#e8e2d5] bg-white p-6 shadow-sm md:p-9"
        >
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Book Title *
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter book title"
              maxLength={150}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Author *
            </label>

            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Enter author's name"
              maxLength={100}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-[#234b3b]"
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
              <label className="mb-2 block font-semibold text-gray-700">
                Total Copies *
              </label>

              <input
                type="number"
                name="totalCopies"
                value={form.totalCopies}
                onChange={handleChange}
                min="1"
                step="1"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#234b3b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Book Cover Image *
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700"
            />

            <p className="mt-2 text-xs text-gray-500">
              Choose an image from your computer. Maximum size: 5 MB.
            </p>

            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Selected book cover preview"
                  className="h-52 w-40 rounded-lg border object-cover shadow-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Description *
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write a short description of the book..."
              rows={5}
              maxLength={2000}
              required
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-500 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Added By
            </label>

            <input
              type="text"
              value={session.user.name || session.user.email}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700"
            />

            <p className="mt-1 text-xs text-gray-500">
              Your account is automatically associated with this book.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#234b3b] px-6 py-4 font-semibold text-white transition hover:bg-[#18382c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Uploading Image & Saving Book..." : "Add Book"}
          </button>
        </form>
      </div>
    </section>
  );
}
