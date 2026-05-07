const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

const MASTER_CATEGORIES = [
  "Components",
  "3D Printing",
  "Tools",
  "Sensors",
  "Arduino",
  "Development Boards",
  "Motors",
  "Modules",
  "Displays",
  "Kits",
  "RC"
];

const ALIAS_MAP = {
  "sensor": "Sensors",
  "sensors": "Sensors",
  "module": "Modules",
  "modules": "Modules",
  "display": "Displays",
  "displays": "Displays",
  "arduino boards": "Arduino",
  "microcontroller": "Arduino",
  "dev board": "Development Boards",
  "development board": "Development Boards",
  "development boards": "Development Boards",
  "motor": "Motors",
  "motors": "Motors",
  "kit": "Kits",
  "kits": "Kits",
  "component": "Components",
  "components": "Components"
};

function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return "Components";
  
  const trimmed = cat.trim();
  const lower = trimmed.toLowerCase();

  // Check alias map
  if (ALIAS_MAP[lower]) {
    return ALIAS_MAP[lower];
  }

  // Check if it exactly matches a master category (case-insensitive)
  const masterMatch = MASTER_CATEGORIES.find(m => m.toLowerCase() === lower);
  if (masterMatch) {
    return masterMatch;
  }

  // Default fallback if unknown
  console.warn(`Unknown category: "${cat}". Defaulting to "Components".`);
  return "Components";
}

function normalizeCategories() {
  console.log('Reading products.json...');
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  let products = JSON.parse(data);

  let updatedCount = 0;

  products = products.map(product => {
    const originalCategory = product.category;
    const normalized = normalizeCategory(originalCategory);

    if (originalCategory !== normalized) {
      console.log(`Normalizing [${product.id}]: "${originalCategory}" -> "${normalized}"`);
      updatedCount++;
    }

    return { ...product, category: normalized };
  });

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  console.log(`\nNormalization complete! Updated ${updatedCount} products.`);
  
  // Validation: Check category counts
  const categoryCounts = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  
  console.log('\nFinal Category Distribution:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count} products`);
    });
}

normalizeCategories();
