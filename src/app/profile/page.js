
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  CalendarDays,
  BookOpen,
  PlusCircle,
  Library,
  BookMarked,
  Pencil,
  Save,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session?.user]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  const user = session.user;

  const accountDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const quickLinks = [
    {
      title: "Add a Book",
      description: "Share a new book with the community.",
      href: "/add-book",
      icon: PlusCircle,
    },
    {
      title: "My Books",
      description: "Manage the books you've added.",
      href: "/my-books",
      icon: Library,
    },
    {
      title: "My Borrows",
      description: "View your borrowed books.",
      href: "/my-borrows",
      icon: BookMarked,
    },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const trimmedName = name.trim();
    const trimmedImage = image.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (trimmedImage) {
      try {
        const parsedUrl = new URL(trimmedImage);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid image URL");
        }
      } catch {
        setError("Please enter a valid image URL starting with https:// or http://.");
        return;
      }
    }

    setSaving(true);

    try {
      const result = await authClient.updateUser({
        name: trimmedName,
        image: trimmedImage || null,
      });

      if (result.error) {
        throw new Error(result.error.message || "Could not update your profile.");
      }

      setIsEditing(false);
      setMessage("Your profile was updated successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setName(user.name || "");
    setImage(user.image || "");
    setError("");
    setMessage("");
    setIsEditing(false);
  };

  return (
    <section className="min-h-screen bg-[#f8f6f0] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#b58b45]">
            Your BookNook Account
          </p>
          <h1 className="text-3xl font-bold text-[#234b3b] md:text-4xl">
            My Profile
          </h1>
          <p className="mt-3 text-gray-600">
            Your personal reading account and activity.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e8e2d5] bg-white shadow-sm">
          <div className="h-32 bg-[#234b3b]" />

          <div className="px-6 pb-8 md:px-10">
            <div className="-mt-14 mb-5 flex flex-col items-center sm:flex-row sm:items-end sm:gap-5">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-md"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#b58b45] text-4xl font-bold text-white shadow-md">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div className="mt-3 text-center sm:mb-2 sm:mt-0 sm:text-left">
                <h2 className="text-2xl font-bold text-[#234b3b]">
                  {user.name || "BookNook Reader"}
                </h2>
                <p className="text-sm text-gray-500">BookNook Member</p>
              </div>
            </div>

            <div className="mt-6">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setMessage("");
                    setError("");
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 font-semibold text-white transition hover:bg-[#19392c]"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              ) : (
                <form onSubmit={handleSave} className="rounded-xl bg-[#f8f6f0] p-5">
                  <h3 className="mb-5 text-lg font-bold text-[#234b3b]">
                    Update Your Information
                  </h3>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    required
                    className="mb-4 w-full rounded-lg border border-[#e8e2d5] bg-white px-4 py-3 text-gray-800 outline-none focus:border-[#234b3b]"
                    placeholder="Enter your name"
                  />

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="mb-5 w-full rounded-lg border border-[#e8e2d5] bg-white px-4 py-3 text-gray-800 outline-none focus:border-[#234b3b]"
                    placeholder="https://example.com/photo.jpg"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 font-semibold text-white transition hover:bg-[#19392c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={17} />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {message && (
                <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  {message}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl bg-[#f8f6f0] p-5">
                <div className="rounded-full bg-white p-3 text-[#234b3b]">
                  <User size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="break-words font-semibold text-gray-800">
                    {user.name || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-[#f8f6f0] p-5">
                <div className="rounded-full bg-white p-3 text-[#234b3b]">
                  <Mail size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="break-all font-semibold text-gray-800">
                    {user.email || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl bg-[#f8f6f0] p-5 md:col-span-2">
                <div className="rounded-full bg-white p-3 text-[#234b3b]">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-semibold text-gray-800">{accountDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-5 text-2xl font-bold text-[#234b3b]">
            Your BookNook Activities
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-[#e8e2d5] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Icon size={28} className="mb-4 text-[#b58b45]" />
                  <h3 className="font-bold text-[#234b3b]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-[#234b3b] hover:text-[#b58b45]"
          >
            <BookOpen size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
