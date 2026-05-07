"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, Zap, Package } from "lucide-react";
import { Product, useCart } from "@/context/ShoppingCartContext";
import ProductItemCard from "@/components/product/ProductItemCard";
import AddToCartButton from "@/components/product/AddToCartButton";

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addRecentlyViewed, recentlyViewed } = useCart();

  const formatUrl = (url?: string) => {
    if (!url) return `/images/placeholder.png`;
    if (url.startsWith("http")) return url;
    return url.toLowerCase().replace(/\s+/g, "-");
  };

  const validImages = (product.images || [])
    .filter(
      (img) =>
        img &&
        typeof img === "string" &&
        img.trim() !== "" &&
        !img.includes("placeholder")
    )
    .map(formatUrl);

  const displayImages =
    validImages.length > 0 ? validImages : ["/images/placeholder.png"];

  const [mainImage, setMainImage] = useState(displayImages[0]);
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    setMainImage(displayImages[0]);
    setActiveThumb(0);
  }, [product]);

  useEffect(() => {
    addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  const otherRecentlyViewed = recentlyViewed
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleThumbClick = (url: string, idx: number) => {
    setMainImage(url);
    setActiveThumb(idx);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-orange mb-6 transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Products
        </Link>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14 mb-16">
          {/* LEFT — Sticky Image Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
            {/* Main Image Viewer */}
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden aspect-square max-h-[550px] flex items-center justify-center p-6">
              {product.originalPrice && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow">
                    Student Deal
                  </span>
                </div>
              )}
              <img
                src={mainImage}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.png";
                  e.currentTarget.onerror = null;
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbClick(img, idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden bg-white transition-all duration-200 flex items-center justify-center p-2 ${
                      activeThumb === idx
                        ? "border-brand-orange shadow-md scale-105"
                        : "border-gray-200 hover:border-brand-orange/50 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.png";
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Product Info */}
          <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {/* Category */}
            <div className="text-xs font-bold text-brand-orange uppercase tracking-widest mb-3">
              {product.category}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span
                className={`text-3xl md:text-4xl font-black ${
                  product.originalPrice ? "text-red-500" : "text-gray-900"
                }`}
              >
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through mb-0.5">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-0.5">
                  Save ₹
                  {(
                    product.originalPrice - product.price
                  ).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                {product.description}
              </p>
            )}

            {/* Tags */}
            {(product.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {(product.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 hover:bg-brand-orange/10 text-gray-600 hover:text-brand-orange text-xs font-medium rounded-full transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-3 mb-8 py-5 border-y border-gray-100">
              {[
                { icon: ShieldCheck, label: "Quality Tested" },
                { icon: Truck, label: "Fast Shipping" },
                { icon: Zap, label: "Student Pricing" },
                { icon: Package, label: "Secure Packaging" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Add to Cart */}
            <AddToCartButton product={product} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
              Related Components
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductItemCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {otherRecentlyViewed.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {otherRecentlyViewed.map((p) => (
                <ProductItemCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Add to Cart */}
      <AddToCartButton product={product} isMobileSticky={true} />
    </div>
  );
}
