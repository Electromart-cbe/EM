/**
 * scripts/relink_orphan_images.js
 * 
 * Re-links orphaned images in /public/products to their products in products.json
 * by matching filenames to product names/IDs.
 * 
 * Usage: node scripts/relink_orphan_images.js
 */

const fs = require("fs");
const path = require("path");

const PRODUCTS_JSON_PATH = path.join(process.cwd(), "data", "products.json");
const PUBLIC_PRODUCTS_DIR = path.join(process.cwd(), "public", "products");
const PLACEHOLDER_PATTERNS = ["placeholder", "via.placeholder", "dummyimage"];

function isValidImage(img) {
  if (!img || typeof img !== "string") return false;
  const lower = img.trim().toLowerCase();
  return lower !== "" && !PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function hasValidImages(product) {
  return Array.isArray(product.images) && product.images.some(isValidImage);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadProducts() {
  const raw = fs.readFileSync(PRODUCTS_JSON_PATH, "utf-8");
  return JSON.parse(raw);
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), "utf-8");
}

function getLocalProductImages() {
  if (!fs.existsSync(PUBLIC_PRODUCTS_DIR)) return [];
  return fs
    .readdirSync(PUBLIC_PRODUCTS_DIR)
    .filter((f) => /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(f))
    .map((f) => `/products/${f}`);
}

function relink() {
  console.log("=================================================");
  console.log("  ELECTROMART — Orphan Image Relinker");
  console.log("=================================================\n");

  const products = loadProducts();
  const localImages = getLocalProductImages();

  // Build set of already-referenced images
  const referencedImages = new Set(
    products.flatMap((p) =>
      (p.images || []).filter((img) => img && img.startsWith("/products/"))
    )
  );

  // Get orphaned images
  const orphaned = localImages.filter((img) => !referencedImages.has(img));
  console.log(`📁 Orphaned images found: ${orphaned.length}`);

  if (orphaned.length === 0) {
    console.log("✅ No orphaned images found!");
    return;
  }

  // Build a slug-to-orphan map
  // Orphan filename pattern: {slug}-{n}.ext
  const orphanMap = new Map(); // slug -> [paths]
  for (const imgPath of orphaned) {
    const filename = path.basename(imgPath);
    // Remove trailing -N.ext to get slug
    const withoutExt = filename.replace(/\.[^.]+$/, "");
    // Remove trailing -1, -2, etc.
    const baseSlug = withoutExt.replace(/-\d+$/, "");
    if (!orphanMap.has(baseSlug)) orphanMap.set(baseSlug, []);
    orphanMap.get(baseSlug).push(imgPath);
  }

  let linkedCount = 0;
  let productsFixed = 0;

  // For each product without valid images, try to match orphaned images
  const updatedProducts = products.map((product) => {
    // Skip products that already have valid images
    if (hasValidImages(product)) return product;

    // Try to match by product ID slug
    const idSlug = slugify(product.id);
    // Try to match by product name slug
    const nameSlug = slugify(product.name);

    let matched = [];

    // Check by ID first
    for (const [slug, paths] of orphanMap) {
      if (idSlug === slug || nameSlug === slug) {
        matched = paths.slice(0, 4);
        break;
      }
    }

    // If no exact match, try prefix match
    if (matched.length === 0) {
      for (const [slug, paths] of orphanMap) {
        if (
          slug.startsWith(idSlug.substring(0, Math.min(idSlug.length, 20))) ||
          slug.startsWith(nameSlug.substring(0, Math.min(nameSlug.length, 20)))
        ) {
          matched = paths.slice(0, 4);
          break;
        }
      }
    }

    if (matched.length > 0) {
      // Sort: -1 first, -2 second etc.
      matched.sort();
      console.log(
        `🔗 Linked: "${product.name.substring(0, 50)}" → ${matched.map((m) => path.basename(m)).join(", ")}`
      );
      linkedCount += matched.length;
      productsFixed++;
      return {
        ...product,
        images: matched,
      };
    }

    return product;
  });

  console.log(`\n📊 RELINK RESULTS:`);
  console.log(`   Products fixed  : ${productsFixed}`);
  console.log(`   Images linked   : ${linkedCount}`);

  const validAfter = updatedProducts.filter((p) => hasValidImages(p));
  const invalidAfter = updatedProducts.filter((p) => !hasValidImages(p));

  console.log(`   Now with images : ${validAfter.length}`);
  console.log(`   Still missing   : ${invalidAfter.length}`);

  if (productsFixed > 0) {
    saveProducts(updatedProducts);
    console.log("\n✅ products.json updated and saved.");
  } else {
    console.log("\n⚠️  No matches found. No changes made.");
    console.log("   Tip: Use the Image Picker or Auto Image Picker to add images.");
  }

  console.log(`\n🚀 Storefront will now show: ${validAfter.length} products`);
  console.log("=================================================\n");
}

relink();
