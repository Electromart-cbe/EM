const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'products.json');
const fileData = fs.readFileSync(filePath, 'utf-8');
const originalProducts = JSON.parse(fileData);

const totalOriginal = originalProducts.length;

// Step 1: Clean images and count valid images per product
const cleanImages = (images) => {
  return [...new Set(
    (images || [])
      .filter(
        (img) =>
          img &&
          typeof img === "string" &&
          img.trim() !== "" &&
          !img.includes("placeholder")
      )
      .map((img) => img.trim())
  )];
};

originalProducts.forEach(p => {
  p.images = cleanImages(p.images);
});

// Step 2: Remove duplicates (same ID or same normalized name)
// KEEP product with MORE valid images, or first occurrence
const uniqueProductsMap = new Map();

for (const product of originalProducts) {
  const normalizedName = product.name.toLowerCase().trim();
  const id = product.id;
  
  // We'll check both ID and normalizedName to find if it exists
  let existingKey = null;
  for (const [key, val] of uniqueProductsMap.entries()) {
    if (val.id === id || val.normalizedName === normalizedName) {
      existingKey = key;
      break;
    }
  }

  const existingProduct = existingKey ? uniqueProductsMap.get(existingKey) : null;
  
  if (existingProduct) {
    // Duplicate found! Keep the one with MORE valid images
    if ((product.images?.length || 0) > (existingProduct.images?.length || 0)) {
      uniqueProductsMap.set(existingKey, { ...product, normalizedName });
    }
  } else {
    // We use a unique key (id usually, or normalized name if id is somehow duplicated but handled)
    uniqueProductsMap.set(id + '-' + normalizedName, { ...product, normalizedName });
  }
}

// Extract deduplicated products and remove our temporary normalizedName property
const deduplicatedProducts = Array.from(uniqueProductsMap.values()).map(p => {
  const { normalizedName, ...rest } = p;
  return rest;
});

const duplicatesRemoved = totalOriginal - deduplicatedProducts.length;

// Step 3: Sort ENTIRE JSON alphabetically by product name
deduplicatedProducts.sort((a, b) => a.name.localeCompare(b.name));

// Save clean file
fs.writeFileSync(filePath, JSON.stringify(deduplicatedProducts, null, 2), 'utf-8');

// Step 4: Validation Logs
const finalCount = deduplicatedProducts.length;
const withImagesCount = deduplicatedProducts.filter(p => p.images && p.images.length > 0).length;
const withoutImagesCount = finalCount - withImagesCount;

console.log('--- PRODUCT CLEANUP RESULTS ---');
console.log(`Original Products: ${totalOriginal}`);
console.log(`Duplicates Removed: ${duplicatesRemoved}`);
console.log(`Final Product Count: ${finalCount}`);
console.log(`Products With Images: ${withImagesCount}`);
console.log(`Products Without Images: ${withoutImagesCount}`);
