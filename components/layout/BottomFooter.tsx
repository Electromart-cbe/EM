import React from "react";
import Link from "next/link";
import { Mail, MapPin, Heart, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-black text-gray-300 pt-14 pb-8 border-t border-gray-800 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/images/logo.jpg"
                className="h-10 w-auto logo object-contain"
                alt="Electromart Logo"
              />
              <span className="font-black text-xl tracking-tight text-white">
                ELECTROMART
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Fueling Tomorrow's Tech Today. Providing affordable electronic
              components for students across Tamil Nadu to innovate without
              limits.
            </p>
            <p className="text-xs text-gray-500">
              Built with{" "}
              <Heart
                size={10}
                className="inline text-brand-orange mx-0.5"
                fill="currentColor"
              />{" "}
              for engineering students
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "All Products", href: "/products" },
                { label: "About Us", href: "/about" },
                { label: "Shopping Cart", href: "/cart" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-brand-orange transition-colors text-sm text-gray-400 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <Mail
                  size={16}
                  className="text-brand-orange shrink-0 mt-0.5"
                />
                <a
                  href="mailto:electromart.cbe@gmail.com"
                  className="hover:text-white transition-colors break-all text-gray-400 text-xs"
                >
                  electromart.cbe@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <MapPin
                  size={16}
                  className="text-brand-orange shrink-0 mt-0.5"
                />
                <span className="text-gray-400 text-xs">Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ELECTROMART. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Electronic components at student-friendly prices.
          </p>
        </div>
      </div>
    </footer>
  );
}
