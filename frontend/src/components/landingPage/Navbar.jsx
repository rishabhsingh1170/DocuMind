import { BrainCircuit, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "How it Works", href: "#how-it-works" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <BrainCircuit className="h-5 w-5" />
            <Lock className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-indigo-700" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            DocuMind AI
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-xl border border-slate-300 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:border-slate-400 hover:bg-indigo-500 sm:inline-flex"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="hidden rounded-xl bg-white border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:inline-flex"
          >
            Get Started
          </Link>
          {/* <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-500">
            Book a Demo
          </button> */}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
