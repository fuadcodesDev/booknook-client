
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  ChevronDown,
  User,
  LogOut,
  Library,
  PlusCircle,
  BookMarked,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const Navbar = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isLoggedIn = !!session?.user;
  const user = session?.user;

  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "All Books", href: "/books" },
  ];

  const privateLinks = [
    { name: "Add Book", href: "/add-book", icon: PlusCircle },
    { name: "My Books", href: "/my-books", icon: Library },
    { name: "My Borrows", href: "/my-borrows", icon: BookMarked },
  ];

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message || "Logout failed.");
      }

      setProfileOpen(false);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e2d6] bg-[#faf9f6]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2"
        >
          <BookOpen size={30} className="text-[#234b3b]" />
          <span className="text-2xl font-bold tracking-tight text-[#234b3b]">
            BookNook<span className="text-[#b58b45]">.</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#343a35] transition hover:text-[#b58b45]"
            >
              {link.name}
            </Link>
          ))}

          {!isPending && isLoggedIn && (
            <>
              {privateLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[#343a35] transition hover:text-[#b58b45]"
                >
                  {link.name}
                </Link>
              ))}

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#e8e2d6] px-3 py-2 transition hover:bg-[#f0eee7]"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#234b3b] font-semibold text-white">
                      {avatarText}
                    </span>
                  )}

                  <span className="max-w-28 truncate text-sm font-semibold text-[#234b3b]">
                    {user?.name || "My Account"}
                  </span>

                  <ChevronDown size={16} className="text-[#234b3b]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-xl border border-[#e8e2d6] bg-white p-2 shadow-xl">
                    <div className="border-b border-gray-100 px-3 py-3">
                      <p className="truncate text-sm font-semibold text-[#234b3b]">
                        {user?.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-[#f8f6f0]"
                    >
                      <User size={17} />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <LogOut size={17} />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!isPending && !isLoggedIn && (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[#234b3b] px-6 py-2.5 text-sm font-semibold text-[#234b3b] transition hover:bg-[#234b3b] hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#234b3b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183729]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[#234b3b] md:hidden"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-[#e8e2d6] bg-[#faf9f6] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="font-medium text-[#343a35]"
              >
                {link.name}
              </Link>
            ))}

            {!isPending && isLoggedIn && (
              <>
                {privateLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 font-medium text-[#343a35]"
                    >
                      <Icon size={18} />
                      {link.name}
                    </Link>
                  );
                })}

                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 font-medium text-[#343a35]"
                >
                  <User size={18} />
                  My Profile
                </Link>

                <div className="border-t border-[#e8e2d6] pt-4">
                  <p className="mb-3 text-sm text-gray-500">
                    {user?.name || user?.email}
                  </p>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 font-semibold text-red-600 disabled:opacity-50"
                  >
                    <LogOut size={18} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </>
            )}

            {!isPending && !isLoggedIn && (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="font-medium text-[#234b3b]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="font-medium text-[#234b3b]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
