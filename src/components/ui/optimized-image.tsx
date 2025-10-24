import Image from "next/image";

// Configure remote domain patterns in next.config.js first
const remotePatterns = [
  "api.mosaiquefm.net",
  "cdn.mosaiquefm.net",
  "www.mosaiquefm.net",
  "mosaiquefm.net",
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
}: OptimizedImageProps) {
  // Check if the image is from our allowed domains
  const isRemoteImage = remotePatterns.some((pattern) => src.includes(pattern));

  // If it's not from our domain, render a regular img tag with loading="lazy"
  if (!isRemoteImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  // For remote images, use Next.js Image with optimization
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
      loading={priority ? "eager" : "lazy"}
    />
  );
}
