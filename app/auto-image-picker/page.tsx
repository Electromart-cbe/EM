"use client";

import React, { useState, useCallback, useRef } from "react";
import productsData from "@/data/products.json";
import {
  ImageIcon,
  Search,
  Save,
  Check,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Eye,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductEntry {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
}

interface ProductState {
  id: string;
  name: string;
  category: string;
  price: number;
  existingImages: string[];
  fetchedImages: string[];
  selectedImages: string[];
  status: "idle" | "loading" | "done" | "error" | "saved";
  error?: string;
  expanded: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_PATTERNS = ["placeholder", "via.placeholder", "dummyimage"];

function isValidImage(img: string | undefined | null): boolean {
  if (!img || typeof img !== "string") return false;
  const lower = img.trim().toLowerCase();
  if (lower === "") return false;
  return !PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function hasValidImages(product: ProductEntry): boolean {
  return (
    Array.isArray(product.images) && product.images.some((img) => isValidImage(img))
  );
}

// Products that need images (no valid image)
const allProducts = productsData as ProductEntry[];
const needsImages = allProducts.filter((p) => !hasValidImages(p));
const hasImages = allProducts.filter((p) => hasValidImages(p));

// ─── Component ───────────────────────────────────────────────────────────────

export default function AutoImagePickerPage() {
  const [productStates, setProductStates] = useState<ProductState[]>(() =>
    needsImages.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      existingImages: p.images || [],
      fetchedImages: [],
      selectedImages: [],
      status: "idle",
      expanded: false,
    }))
  );

  const [globalStatus, setGlobalStatus] = useState<
    "idle" | "fetching" | "saving"
  >("idle");
  const [globalMessage, setGlobalMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // ─── Fetch images for one product ────────────────────────────────────────

  const fetchForProduct = useCallback(async (productId: string) => {
    setProductStates((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, status: "loading", error: undefined, fetchedImages: [], selectedImages: [] }
          : p
      )
    );

    const product = productStates.find((p) => p.id === productId);
    if (!product) return;

    try {
      const res = await fetch(
        `/api/images?q=${encodeURIComponent(product.name + " electronic component")}`
      );
      const data = await res.json();
      const fetched: string[] = (data.images || []).filter(
        (url: string) => url && url.startsWith("http")
      );

      // Auto-select first 2
      const autoSelected = fetched.slice(0, 2);

      setProductStates((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                status: "done",
                fetchedImages: fetched,
                selectedImages: autoSelected,
                expanded: true,
              }
            : p
        )
      );
    } catch (e: any) {
      setProductStates((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, status: "error", error: "Failed to fetch images" }
            : p
        )
      );
    }
  }, [productStates]);

  // ─── Fetch ALL missing products ───────────────────────────────────────────

  const fetchAll = async () => {
    setGlobalStatus("fetching");
    setGlobalMessage("Fetching images for all missing products…");

    for (const product of productStates) {
      if (product.status === "saved") continue;
      await fetchForProduct(product.id);
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 600));
    }

    setGlobalStatus("idle");
    setGlobalMessage("All images fetched. Review and save below.");
  };

  // ─── Toggle image selection ───────────────────────────────────────────────

  const toggleImage = (productId: string, url: string) => {
    setProductStates((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const isSelected = p.selectedImages.includes(url);
        if (isSelected) {
          return { ...p, selectedImages: p.selectedImages.filter((u) => u !== url) };
        } else {
          if (p.selectedImages.length >= 4) return p;
          return { ...p, selectedImages: [...p.selectedImages, url] };
        }
      })
    );
  };

  // ─── Save one product ─────────────────────────────────────────────────────

  const saveProduct = async (productId: string) => {
    const product = productStates.find((p) => p.id === productId);
    if (!product || product.selectedImages.length === 0) return;

    setProductStates((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: "loading" } : p))
    );

    try {
      // 1. Download & optimize images
      const saveRes = await fetch("/api/save-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          images: product.selectedImages,
        }),
      });
      const saveData = await saveRes.json();

      if (!saveData.success || !saveData.images?.length) {
        throw new Error("Failed to download images");
      }

      // 2. Update product in JSON
      const updateRes = await fetch("/api/update-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, images: saveData.images }),
      });

      if (!updateRes.ok) throw new Error("Failed to update product database");

      setProductStates((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, status: "saved", expanded: false }
            : p
        )
      );
    } catch (e: any) {
      setProductStates((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, status: "error", error: e.message }
            : p
        )
      );
    }
  };

  // ─── Save All ─────────────────────────────────────────────────────────────

  const saveAll = async () => {
    setGlobalStatus("saving");
    setGlobalMessage("Saving all selected images…");

    const toSave = productStates.filter(
      (p) => p.selectedImages.length > 0 && p.status !== "saved"
    );

    for (const p of toSave) {
      await saveProduct(p.id);
      await new Promise((r) => setTimeout(r, 300));
    }

    setGlobalStatus("idle");
    setGlobalMessage(`Done! Saved images for ${toSave.length} products.`);
  };

  // ─── Stats ────────────────────────────────────────────────────────────────

  const savedCount = productStates.filter((p) => p.status === "saved").length;
  const fetchedCount = productStates.filter((p) => p.fetchedImages.length > 0).length;
  const selectedTotal = productStates.reduce(
    (acc, p) => acc + p.selectedImages.length,
    0
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                <Zap size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">
                  Auto Image Preview
                </h1>
                <p className="text-xs text-gray-500">
                  Fetch → Preview → Confirm → Save
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                {allProducts.length} total
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                ✅ {hasImages.length} have images
              </span>
              <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                ⚠️ {needsImages.length} need images
              </span>
              {savedCount > 0 && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                  💾 {savedCount} saved this session
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={fetchAll}
              disabled={globalStatus !== "idle"}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {globalStatus === "fetching" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Fetch All Missing Images
            </button>

            <button
              onClick={saveAll}
              disabled={globalStatus !== "idle" || selectedTotal === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white text-sm font-bold rounded-xl hover:bg-[#ff943d] transition-colors disabled:opacity-50"
            >
              {globalStatus === "saving" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save All ({selectedTotal} images)
            </button>

            <a
              href="/image-picker"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ImageIcon size={16} />
              Manual Picker
            </a>
          </div>

          {globalMessage && (
            <p className="mt-3 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              {globalMessage}
            </p>
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-4">
        {productStates.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
            <Check size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              All products have images!
            </h2>
            <p className="text-gray-500">
              Every product in your catalog has at least one valid image.
            </p>
          </div>
        )}

        {productStates.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onFetch={() => fetchForProduct(product.id)}
            onToggle={(url) => toggleImage(product.id, url)}
            onSave={() => saveProduct(product.id)}
            onToggleExpand={() =>
              setProductStates((prev) =>
                prev.map((p) =>
                  p.id === product.id ? { ...p, expanded: !p.expanded } : p
                )
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

// ─── ProductCard Sub-Component ────────────────────────────────────────────────

function ProductCard({
  product,
  onFetch,
  onToggle,
  onSave,
  onToggleExpand,
}: {
  product: ProductState;
  onFetch: () => void;
  onToggle: (url: string) => void;
  onSave: () => void;
  onToggleExpand: () => void;
}) {
  const isSaved = product.status === "saved";
  const isLoading = product.status === "loading";
  const hasFetched = product.fetchedImages.length > 0;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
        isSaved
          ? "border-green-200 bg-green-50/30"
          : product.status === "error"
          ? "border-red-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Product Header */}
      <div className="p-4 flex items-center gap-4">
        {/* Status Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSaved
              ? "bg-green-100 text-green-600"
              : isLoading
              ? "bg-brand-orange/10 text-brand-orange"
              : product.status === "error"
              ? "bg-red-100 text-red-500"
              : hasFetched
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {isSaved ? (
            <Check size={20} />
          ) : isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : product.status === "error" ? (
            <AlertCircle size={20} />
          ) : hasFetched ? (
            <Eye size={20} />
          ) : (
            <ImageIcon size={20} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-brand-orange font-semibold">
              {product.category}
            </span>
            <span className="text-xs text-gray-500">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {hasFetched && (
              <span className="text-xs text-gray-400">
                {product.selectedImages.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isSaved && (
            <button
              onClick={onFetch}
              disabled={isLoading}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              {hasFetched ? "Re-fetch" : "Fetch"}
            </button>
          )}

          {hasFetched && !isSaved && (
            <button
              onClick={onSave}
              disabled={product.selectedImages.length === 0 || isLoading}
              className="px-3 py-1.5 bg-brand-orange text-white text-xs font-bold rounded-lg hover:bg-[#ff943d] transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save size={12} />
              Save
            </button>
          )}

          {isSaved && (
            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
              ✅ Saved
            </span>
          )}

          {hasFetched && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {product.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {product.error && (
        <div className="px-4 pb-3">
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {product.error}
          </p>
        </div>
      )}

      {/* Expanded Image Grid */}
      {product.expanded && hasFetched && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-600">
              Select 1–4 images (
              <span className="text-green-600 font-bold">green border</span> =
              auto-selected,{" "}
              <span className="text-brand-orange font-bold">orange border</span> =
              manually selected)
            </p>
            {product.selectedImages.length > 0 && (
              <span className="text-xs bg-brand-orange/10 text-brand-orange font-bold px-2 py-0.5 rounded-full">
                {product.selectedImages.length}/4 selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {product.fetchedImages.map((url, idx) => {
              const isSelected = product.selectedImages.includes(url);
              const isAutoSelected = idx < 2 && isSelected;

              return (
                <button
                  key={idx}
                  onClick={() => onToggle(url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                    isSelected
                      ? isAutoSelected
                        ? "border-green-500 shadow-md scale-[0.97] ring-2 ring-green-200"
                        : "border-brand-orange shadow-md scale-[0.97] ring-2 ring-brand-orange/20"
                      : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Option ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover bg-gray-100"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.png";
                      e.currentTarget.onerror = null;
                    }}
                  />
                  {isSelected && (
                    <div
                      className={`absolute inset-0 flex items-end justify-end p-1 ${
                        isAutoSelected ? "bg-green-500/20" : "bg-brand-orange/20"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isAutoSelected ? "bg-green-500" : "bg-brand-orange"
                        }`}
                      >
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                  {idx < 2 && !isSelected && (
                    <div className="absolute top-1 left-1">
                      <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        AUTO
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
