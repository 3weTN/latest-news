import { getBlurDataURL } from "@/lib/image-utils";
import Image from "next/image";

// Configure remote domain patterns in next.config.js first
const remotePatterns = [
  "api.mosaiquefm.net",
  "cdn.mosaiquefm.net",
  "www.mosaiquefm.net",
  "mosaiquefm.net",
  "content.mosaiquefm.net",
];

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  /** Whether to show a blur placeholder while loading */
  useBlur?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  fill = false,
  width,
  height,
  useBlur = true,
}: OptimizedImageProps) {
  // Check if the image is from our allowed domains
  const isRemoteImage = remotePatterns.some((pattern) => src.includes(pattern));

  // If it's not from our domain, render a regular img tag with loading="lazy"
  if (!isRemoteImage) {
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }

  // For remote images, use Next.js Image with optimization
  const w = fill ? 1200 : width || 1200; // Default size for blur placeholder
  const h = fill ? 800 : height || 800;
  const blurUrl = useBlur ? getBlurDataURL(w, h) : undefined;

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      sizes={sizes}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      quality={85}
      placeholder={useBlur ? "blur" : undefined}
      blurDataURL={blurUrl}
    />
  );
}
