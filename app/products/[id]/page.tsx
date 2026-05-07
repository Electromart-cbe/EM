import React from "react";
import { notFound } from "next/navigation";
import productsData from "@/data/products.json";
import { Product } from "@/context/ShoppingCartContext";
import ProductDetailClient from "./ProductDetailClient";

// Since we are exporting a static site, we need to generate params for all possible products.
export async function generateStaticParams() {
  const products = productsData as Product[];
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
  return validProducts.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const products = productsData as Product[];
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
  const product = validProducts.find((p) => p.id === params.id);

  if (!product) {
    return <h1>Product Not Found</h1>;
  }

  // Get related products from the same category
  const relatedProducts = validProducts
    .filter(
      (p) =>
        p.category &&
        product.category &&
        p.category.trim().toLowerCase() === product.category.trim().toLowerCase() &&
        p.id !== product.id
    )
    .slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
