
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Books", href: "/books" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e2d6] bg-[#faf9f6]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen size={30} className="text-[#234b3b]" />
          <span className="text-2xl font-bold tracking-tight text-[#234b3b]">
            BookNook<span className="text-[#b58b45]">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#343a35] transition hover:text-[#b58b45]"
            >
              {link.name}
            </Link>
          ))}

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
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[#234b3b] md:hidden"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-[#e8e2d6] bg-[#faf9f6] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-medium text-[#343a35]"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="font-medium text-[#234b3b]"
            >
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="font-medium text-[#234b3b]"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
