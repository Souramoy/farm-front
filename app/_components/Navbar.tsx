"use client";
import { useState } from "react";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="backdrop-blur-xl border-b border-green-300/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold tracking-wide text-green-500">
                  Spektr
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 items-center text-white">
              <Link
                href="/dashboard"
                className="hover:text-slate-400 hover:underline hover:underline-offset-2 transition"
              >
                Home
              </Link>
              <Link
                href="/dashboard/training"
                className="hover:text-slate-400 hover:underline hover:underline-offset-2 transition"
              >
                Training
              </Link>
              <Link
                href="/dashboard/compliance"
                className="hover:text-slate-400 hover:underline hover:underline-offset-2 transition"
              >
                Compliance
              </Link>
              <Link
                href="/dashboard/alerts"
                className="hover:text-slate-400 hover:underline hover:underline-offset-2 transition"
              >
                Alerts
              </Link>

              <Link
                href="/dashboard/scan"
                className="ml-4 bg-green-400/30 backdrop-blur-sm border border-green-200/40 px-4 py-2 rounded-xl font-semibold hover:bg-green-400/50 text-white transition"
              >
                Scan
              </Link>

              {/* Auth Buttons */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 font-semibold hover:bg-red-500/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30 text-green-300 font-semibold hover:bg-green-500/30 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden text-green-100">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden backdrop-blur-md bg-green-800/40 border-t border-green-200/20 px-4 py-3 space-y-2 text-green-100">
          <Link href="/dashboard" className="block hover:text-green-200">
            Home
          </Link>
          <Link
            href="/dashboard/training"
            className="block hover:text-green-200"
          >
            Training
          </Link>
          <Link
            href="/dashboard/compliance"
            className="block hover:text-green-200"
          >
            Compliance
          </Link>
          <Link href="/dashboard/alerts" className="block hover:text-green-200">
            Alerts
          </Link>
          <Link
            href="/dashboard/scan"
            className="block bg-green-400/30 backdrop-blur-sm border border-green-200/40 text-green-900 px-4 py-2 rounded-lg font-semibold text-center hover:bg-green-400/50 transition"
          >
            Scan
          </Link>

          {/* Auth in mobile */}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 font-semibold hover:bg-red-500/30 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30 text-green-300 font-semibold hover:bg-green-500/30 transition"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
