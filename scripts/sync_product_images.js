/**
 * scripts/sync_product_images.js
 * 
 * Scans /public/products, compares with data/products.json,
 * repairs missing/stale/placeholder image arrays, removes broken references,
 * and ensures ALL valid saved products appear in the storefront.
 * 
 * Usage: node scripts/sync_product_images.js
 */

const fs = require("fs");
const path = require("path");

const PRODUCTS_JSON_PATH = path.join(process.cwd(), "data", "products.json");
const PUBLIC_PRODUCTS_DIR = path.join(process.cwd(), "public", "products");
const PLACEHOLDER_PATTERNS = ["placeholder", "via.placeholder", "dummyimage"];

// ---- helpers ----

function isPlaceholder(url) {
  if (!url || typeof url !== "string") return true;
  const lower = url.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function isValidImageString(img) {
  return (
    img &&
    typeof img === "string" &&
    img.trim() !== "" &&
    !isPlaceholder(img)
  );
}

function localFileExists(imgPath) {
  // Only check local /products/ paths
  if (!imgPath.startsWith("/products/")) return true; // remote URLs — skip fs check
  const absPath = path.join(process.cwd(), "public", imgPath);
  return fs.existsSync(absPath);
}

function isValidImage(img) {
  if (!isValidImageString(img)) return false;
  // Remote HTTP(S) images — consider valid (cannot check existence easily)
  if (img.startsWith("http://") || img.startsWith("https://")) return true;
  // Local paths — must exist
  return localFileExists(img);
}

// ---- load data ----

function loadProducts() {
  const raw = fs.readFileSync(PRODUCTS_JSON_PATH, "utf-8");
  return JSON.parse(raw);
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), "utf-8");
}

// ---- get all local product image files ----

function getLocalProductImages() {
  if (!fs.existsSync(PUBLIC_PRODUCTS_DIR)) {
    fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });
    return [];
  }
  return fs
    .readdirSync(PUBLIC_PRODUCTS_DIR)
    .filter((f) => /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(f))
    .map((f) => `/products/${f}`);
}

// ---- main sync ----

function syncProductImages() {
  console.log("=================================================");
  console.log("  ELECTROMART — Product Image Sync");
  console.log("=================================================\n");

  const products = loadProducts();
  const localImages = getLocalProductImages();
  const localImageSet = new Set(localImages);

  console.log(`📦 Total products in JSON   : ${products.length}`);
  console.log(`🖼️  Local images found       : ${localImages.length}\n`);

  let fixedCount = 0;
  let removedCount = 0;

  const updatedProducts = products.map((product) => {
    const originalImages = product.images || [];

    // Filter: keep only truly valid images
    const cleanedImages = originalImages.filter((img) => isValidImage(img));
    
    // Deduplicate
    const uniqueImages = [...new Set(cleanedImages)].slice(0, 4);

    const wasFixed =
      JSON.stringify(uniqueImages) !== JSON.stringify(originalImages);

    if (wasFixed) {
      if (originalImages.length !== uniqueImages.length) {
        const removed = originalImages.length - uniqueImages.length;
        removedCount += removed;
        console.log(
          `🔧 Fixed: "${product.name.substring(0, 50)}" — removed ${removed} invalid/missing image(s)`
        );
      }
      fixedCount++;
    }

    return { ...product, images: uniqueImages };
  });

  // Stats
  const validAfterSync = updatedProducts.filter((p) =>
    p.images.some(isValidImage)
  );
  const invalidAfterSync = updatedProducts.filter(
    (p) => !p.images.some(isValidImage)
  );

  console.log("\n📊 SYNC RESULTS:");
  console.log(`   Products fixed          : ${fixedCount}`);
  console.log(`   Images removed          : ${removedCount}`);
  console.log(`   Products with valid imgs: ${validAfterSync.length}`);
  console.log(`   Products without imgs   : ${invalidAfterSync.length}`);

  if (invalidAfterSync.length > 0) {
    console.log("\n⚠️  Products missing valid images (need manual image pick):");
    invalidAfterSync.slice(0, 20).forEach((p) => {
      console.log(`   - [${p.id}] ${p.name.substring(0, 60)}`);
    });
    if (invalidAfterSync.length > 20) {
      console.log(`   ... and ${invalidAfterSync.length - 20} more`);
    }
  }

  // Check for local images not referenced in any product
  const referencedImages = new Set(
    updatedProducts.flatMap((p) =>
      (p.images || []).filter((img) => img && img.startsWith("/products/"))
    )
  );

  const orphanedImages = localImages.filter((img) => !referencedImages.has(img));
  if (orphanedImages.length > 0) {
    console.log(`\n📁 Orphaned local images (not referenced in JSON): ${orphanedImages.length}`);
    orphanedImages.slice(0, 10).forEach((img) => console.log(`   - ${img}`));
  }

  // Save
  saveProducts(updatedProducts);
  console.log("\n✅ products.json has been updated and saved.");
  console.log(`\n🚀 Storefront will now show: ${validAfterSync.length} products`);
  console.log("=================================================\n");
}

syncProductImages();
