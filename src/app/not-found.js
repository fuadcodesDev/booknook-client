import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F8F6F0] px-6 text-center">
      <h1 className="text-8xl font-bold text-[#245C45]">404</h1>

      <h2 className="mt-4 text-3xl font-bold text-[#26352D]">
        Page Not Found
      </h2>

      <p className="mt-3 max-w-md text-gray-600">
        Sorry, the page you're looking for doesn't exist or may have been moved.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#245C45] px-6 py-3 font-semibold text-white transition hover:bg-[#194431]"
      >
        Back to Home
      </Link>
    </div>
  );
}