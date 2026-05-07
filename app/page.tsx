import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Truck, Tag } from "lucide-react";
import ProductItemCard from "@/components/product/ProductItemCard";
import productsData from "@/data/products.json";
import { Product } from "@/context/ShoppingCartContext";

const products = productsData as Product[];

export default function Home() {
  console.log("Total products loaded (Home):", products.length);

  // Filter products: valid products must have valid images
  const validProducts = products.filter(
    (p) =>
      Array.isArray(p.images) &&
      p.images.some(
        (img) =>
          img &&
          typeof img === "string" &&
          img.trim() !== "" &&
          !img.includes("placeholder")
      )
  );

  // Simple logic to get some products for display.
  const trendingProducts = validProducts.slice(0, 10);

  // Derive categories from valid products
  const categories = Array.from(new Set(
    validProducts
      .map((p) => p.category)
      .filter(Boolean)
      .filter((c) => c.trim() !== "")
  ));

  // If no products exist yet (placeholder JSON), show some empty states.
  const hasProducts = validProducts.length > 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-brand-black text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-brand-orange/20 blur-[120px] opacity-50"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-[100px] opacity-50"></div>
        </div>
        
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Fueling <span className="text-brand-orange">Tomorrow's Tech</span> Today.
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
              We provide electronic components at near wholesale prices across Tamil Nadu. Built by students, for students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-brand-black bg-brand-orange hover:bg-[#ff943d] rounded-xl transition-all shadow-[0_0_20px_rgba(245,130,32,0.4)] hover:shadow-[0_0_30px_rgba(245,130,32,0.6)]"
              >
                Shop All Components
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/10 transition-all"
              >
                Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-4">
                <Tag size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Student-First Pricing</h3>
              <p className="text-gray-600 text-sm">Near wholesale prices so you can build without breaking the bank.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Trustworthy Quality</h3>
              <p className="text-gray-600 text-sm">Tested components you can rely on for your critical projects.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-4">
                <Zap size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Wide Range</h3>
              <p className="text-gray-600 text-sm">From resistors to microcontrollers, everything you need in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
              <Link href="/products" className="text-brand-orange font-semibold flex items-center hover:underline">
                View All <ArrowRight className="ml-1" size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-brand-orange/50 hover:shadow-md transition-all text-center group flex flex-col items-center justify-center min-h-[140px]"
                >
                  <span className="font-semibold text-gray-800 group-hover:text-brand-orange transition-colors">
                    {category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trending Components</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Check out the most popular hardware picked by engineering students this week.
            </p>
          </div>
          
          {hasProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {trendingProducts.map((product) => (
                <ProductItemCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">Products are currently being updated. Please check back soon!</p>
            </div>
          )}
          
          {hasProducts && (
            <div className="mt-16 text-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-brand-black bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                View Complete Catalog
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
