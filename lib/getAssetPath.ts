/**
 * Returns the correct asset path for both localhost (dev) and GitHub Pages (production).
 *
 * - Development (npm run dev):  /images/logo.jpg
 * - Production (GitHub Pages):  /EM/images/logo.jpg
 *
 * process.env.NODE_ENV is replaced at build time by Next.js, so the correct
 * prefix is baked into the static output — no runtime overhead.
 */
export function getAssetPath(path: string): string {
  const base =
    process.env.NODE_ENV === "production"
      ? "/EM"
      : "";

  if (!path) return `${base}/images/placeholder.png`;

  // External URLs pass through unchanged
  if (path.startsWith("http")) return path;

  // Normalise: lowercase + spaces → hyphens (matches stored filenames)
  const normalised = path.toLowerCase().replace(/\s+/g, "-");

  return `${base}${normalised.startsWith("/") ? normalised : `/${normalised}`}`;
}
