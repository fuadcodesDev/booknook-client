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
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <BookOpen
            size={28}
            className="shrink-0 text-[#234b3b] sm:h-8 sm:w-8"
          />

          <span className="text-xl font-bold tracking-tight text-[#234b3b] sm:text-2xl">
            BookNook<span className="text-[#b58b45]">.</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-[#343a35] transition hover:text-[#b58b45]"
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
                  className="whitespace-nowrap text-sm font-medium text-[#343a35] transition hover:text-[#b58b45]"
                >
                  {link.name}
                </Link>
              ))}

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  className="flex max-w-[220px] items-center gap-2 rounded-full border border-[#e8e2d6] px-3 py-2 transition hover:bg-[#f0eee7]"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#234b3b] font-semibold text-white">
                      {avatarText}
                    </span>
                  )}

                  <span className="max-w-28 truncate text-sm font-semibold text-[#234b3b]">
                    {user?.name || "My Account"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#234b3b] transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl border border-[#e8e2d6] bg-white p-2 shadow-xl">
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
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-[#f8f6f0]"
                    >
                      <User size={17} />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
                className="whitespace-nowrap rounded-full border border-[#234b3b] px-5 py-2.5 text-sm font-semibold text-[#234b3b] transition hover:bg-[#234b3b] hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="whitespace-nowrap rounded-full bg-[#234b3b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183729]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#234b3b] transition hover:bg-[#f0eee7] lg:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </nav>

      {/* Mobile and tablet navigation */}
      {menuOpen && (
        <div className="max-h-[calc(100vh-65px)] overflow-y-auto border-t border-[#e8e2d6] bg-[#faf9f6] px-5 py-5 sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-5">

            {/* Public links */}
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="rounded-lg py-1 font-medium text-[#343a35] transition hover:text-[#b58b45]"
              >
                {link.name}
              </Link>
            ))}

            {/* Logged-in navigation */}
            {!isPending && isLoggedIn && (
              <>
                <div className="border-t border-[#e8e2d6] pt-4">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#b58b45]">
                    My Library
                  </p>

                  <div className="flex flex-col gap-5">
                    {privateLinks.map((link) => {
                      const Icon = link.icon;

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 font-medium text-[#343a35] transition hover:text-[#b58b45]"
                        >
                          <Icon size={19} />
                          {link.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile profile */}
                <div className="border-t border-[#e8e2d6] pt-4">
                  <div className="mb-4 flex items-center gap-3">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#234b3b] font-semibold text-white">
                        {avatarText}
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#234b3b]">
                        {user?.name || "My Account"}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="mb-5 flex items-center gap-3 font-medium text-[#343a35] transition hover:text-[#b58b45]"
                  >
                    <User size={19} />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-50"
                  >
                    <LogOut size={19} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </>
            )}

            {/* Logged-out navigation */}
            {!isPending && !isLoggedIn && (
              <div className="flex flex-col gap-4 border-t border-[#e8e2d6] pt-4">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-full border border-[#234b3b] px-5 py-3 text-center font-semibold text-[#234b3b] transition hover:bg-[#234b3b] hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="rounded-full bg-[#234b3b] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#183729]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;