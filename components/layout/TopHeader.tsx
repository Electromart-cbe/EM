"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { useCart } from "@/context/ShoppingCartContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 flex-shrink-0">
            <img
              src="/images/logo.jpg"
              className="h-12 md:h-16 w-auto object-contain logo"
              alt="Electromart Logo"
            />
            <span className="font-black text-2xl md:text-3xl xl:text-4xl tracking-tight text-brand-black leading-none">
              ELECTROMART
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-brand-orange ${
                  isActive(link.href) ? "text-brand-orange" : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right section (Search + Cart) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/products"
              className="text-gray-500 hover:text-brand-orange transition-colors"
            >
              <Search size={22} />
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-brand-orange transition-colors group"
            >
              <ShoppingCart size={26} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-brand-orange rounded-full group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex items-center md:hidden space-x-3">
            <Link href="/cart" className="relative p-2 text-gray-600">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-brand-orange rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-brand-orange focus:outline-none p-1"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glassmorphism border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive(link.href)
                    ? "text-brand-orange bg-brand-orange/10"
                    : "text-gray-700 hover:text-brand-orange hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
