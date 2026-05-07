"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import ProductItemCard from "@/components/product/ProductItemCard";
import productsData from "@/data/products.json";
import { Product } from "@/context/ShoppingCartContext";

const allProducts = productsData as Product[];
const validProducts = allProducts.filter(
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

function ProductsContent() {

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc">("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categories = [
    "",
    ...Array.from(new Set(
      validProducts
        .map((p) => p.category)
        .filter(Boolean)
        .filter((c) => c.trim() !== "")
    ))
  ];
  
  // Calculate max price from data for range slider
  const maxPriceInCatalog = validProducts.length > 0 
    ? Math.max(...validProducts.map(p => p.price)) 
    : 10000;

  const filteredProducts = useMemo(() => {
    return validProducts
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (product.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Safe case-insensitive category matching
        const matchesCategory = selectedCategory === "" || 
                                (product.category && product.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
                                
        const matchesPrice = product.price >= priceRange[0] && (priceRange[1] >= maxPriceInCatalog ? true : product.price <= priceRange[1]);
        
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        return 0; // featured/default
      });
  }, [searchQuery, selectedCategory, priceRange, sortBy, maxPriceInCatalog]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-1">Showing {filteredProducts.length} results</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange bg-white shadow-sm"
            />
          </div>
          
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 font-medium"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`md:w-64 flex-shrink-0 space-y-8 ${isMobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
          {/* Category Filter */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
              Categories
              <ChevronDown size={16} className="text-gray-400" />
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category || "all"} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className="w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300"
                  />
                  <span className={`text-sm ${selectedCategory === category ? 'text-brand-orange font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {category === "" ? "All Categories" : category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
              Price Range
              <ChevronDown size={16} className="text-gray-400" />
            </h3>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max={maxPriceInCatalog}
                value={priceRange[1] >= maxPriceInCatalog ? maxPriceInCatalog : priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>₹0</span>
                <span>{priceRange[1] >= maxPriceInCatalog ? 'Any Price' : `Up to ₹${priceRange[1]}`}</span>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedCategory !== "" || searchQuery !== "" || priceRange[1] < maxPriceInCatalog) && (
            <button
              onClick={() => {
                setSelectedCategory("");
                setSearchQuery("");
                setPriceRange([0, 10000]); // Reset to safe large number
              }}
              className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center font-medium"
            >
              <X size={16} className="mr-1" /> Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm text-gray-500 hidden sm:inline-block">
              {filteredProducts.length === 0 ? "No products found" : `Showing all ${filteredProducts.length} results`}
            </span>
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border-none bg-transparent font-medium text-gray-900 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">A-Z</option>
                <option value="name-desc">Z-A</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductItemCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                We couldn't find anything matching your current filters. Try adjusting your search or categories.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
                className="px-6 py-2 bg-brand-orange text-white font-medium rounded-xl hover:bg-[#ff943d] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
