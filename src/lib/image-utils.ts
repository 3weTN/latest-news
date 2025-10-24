/**
 * Generates a tiny placeholder image that can be used as a blur placeholder
 * before the main image loads.
 */
export function getBlurDataURL(
  w: number,
  h: number,
  dominantColor = "#E2E8F0"
): string {
  const svg = `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="${dominantColor}"/>
      <defs>
        <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stop-color="${dominantColor}" stop-opacity="0.7"/>
          <stop offset=".5" stop-color="${dominantColor}" stop-opacity="0.2"/>
          <stop offset="1" stop-color="${dominantColor}" stop-opacity="0.4"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>
  `;
  const toBase64 =
    typeof window === "undefined"
      ? (str: string) => Buffer.from(str).toString("base64")
      : (str: string) => window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(svg.trim())}`;
}

/**
 * A map to cache dominant colors for images to avoid recalculating
 */
const colorCache = new Map<string, string>();

/**
 * Extracts the dominant color from an image URL. Uses a cache to avoid
 * recalculating for the same image.
 */
export async function getDominantColor(imageUrl: string): Promise<string> {
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  try {
    const defaultColor = "#E2E8F0"; // Tailwind gray-200

    // Only run color extraction on the server
    if (typeof window !== "undefined") {
      return defaultColor;
    }

    // Using require for node-vibrant due to ESM/CommonJS compatibility
    const Vibrant = require("node-vibrant");
    const v = new Vibrant(imageUrl);
    const palette = await v.getPalette();

    // Use the most prominent color from the palette
    const color =
      palette.Vibrant?.hex ||
      palette.Muted?.hex ||
      palette.DarkVibrant?.hex ||
      defaultColor;
    colorCache.set(imageUrl, color);
    return color;
  } catch (error) {
    console.error("Error extracting dominant color:", error);
    return "#E2E8F0";
  }
}
