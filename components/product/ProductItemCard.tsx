"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Product, useCart } from "@/context/ShoppingCartContext";
import { getAssetPath } from "@/lib/getAssetPath";

export default function ProductItemCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const imgSrc = getAssetPath(
    product.images?.[0] ?? "/images/placeholder.png"
  );

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-brand-orange/30 transition-all duration-300 flex flex-col h-full relative cursor-pointer">
        {/* Badge */}
        {product.originalPrice && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              Deal
            </span>
          </div>
        )}

        {/* Image Container */}
        <div className="bg-white rounded-xl overflow-hidden m-2 sm:m-3 mb-0">
          <div className="h-28 sm:h-44 md:h-56 w-full flex items-center justify-center p-2 sm:p-4 bg-white">
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = getAssetPath("/images/placeholder.png");
                e.currentTarget.onerror = null;
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-2 sm:p-4 flex flex-col flex-grow">
          <div className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-1">
            {product.category}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors flex-grow">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{(product.originalPrice || 0).toLocaleString("en-IN")}
                </span>
              )}
              <span
                className={`text-lg sm:text-2xl font-black ${
                  product.originalPrice ? "text-red-500" : "text-brand-orange"
                }`}
              >
                ₹{(product.price || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-brand-orange hover:text-white hover:border-brand-orange hover:scale-110 transition-all duration-200 z-10 relative flex-shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
