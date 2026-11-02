
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        image: photo.trim() || undefined,
      });

      if (result.error) {
        throw new Error(result.error.message || "Registration failed.");
      }

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-[#f8f6f0] px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-[#e8e2d5] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#234b3b]">
            Create Your Account
          </h1>
          <p className="mt-2 text-gray-600">
            Join BookNook and share your love of reading.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Profile Photo URL (Optional)
            </label>
            <input
              type="url"
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
            />
            <p className="mt-1 text-xs text-gray-500">
              Include an uppercase and a lowercase letter.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#234b3b] px-5 py-3 font-semibold text-white hover:bg-[#18382c] disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#234b3b] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
