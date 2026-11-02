
import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#183729] text-[#f7f5ef]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-2">
            <BookOpen size={28} />
            <span className="text-2xl font-bold">
              BookNook<span className="text-[#d5ad67]">.</span>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-7 text-[#d4ddd6]">
            A cozy corner for curious minds. Discover new stories, explore
            knowledge, and make reading part of your everyday life.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-lg font-semibold">Quick Links</h3>
          <div className="flex flex-col gap-3 text-sm text-[#d4ddd6]">
            <Link href="/">Home</Link>
            <Link href="/books">All Books</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-lg font-semibold">Contact Us</h3>
          <div className="flex flex-col gap-4 text-sm text-[#d4ddd6]">
            <p className="flex items-center gap-3">
              <Mail size={17} /> hello@booknook.com
            </p>
            <p className="flex items-center gap-3">
              <Phone size={17} /> +880 1700-000000
            </p>
            <p className="flex items-center gap-3">
              <MapPin size={17} /> Sylhet, Bangladesh
            </p>
          </div>
          <div className="mt-5 flex gap-5 text-sm">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-5 py-5 text-center text-sm text-[#d4ddd6]">
        © {new Date().getFullYear()} BookNook. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
