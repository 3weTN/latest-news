/**
 * v0 by Vercel.
 * @see https://v0.dev/t/EFryRv5fotm
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";

export default function latestNews() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
      <div className="relative group overflow-hidden rounded-lg">
        <Link className="absolute inset-0 z-10" href="#">
          <span className="sr-only">View</span>
        </Link>
        <img
          alt="Article 1"
          className="object-cover w-full h-60"
          height={300}
          src="/placeholder.svg"
          style={{
            aspectRatio: "400/300",
            objectFit: "cover",
          }}
          width={400}
        />
        <div className="bg-white p-4 dark:bg-gray-950">
          <h3 className="font-semibold text-lg md:text-xl">Article Title</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Author Name
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Publication Date
          </p>
        </div>
      </div>
      <div className="relative group overflow-hidden rounded-lg">
        <Link className="absolute inset-0 z-10" href="#">
          <span className="sr-only">View</span>
        </Link>
        <img
          alt="Article 2"
          className="object-cover w-full h-60"
          height={300}
          src="/placeholder.svg"
          style={{
            aspectRatio: "400/300",
            objectFit: "cover",
          }}
          width={400}
        />
        <div className="bg-white p-4 dark:bg-gray-950">
          <h3 className="font-semibold text-lg md:text-xl">Article Title</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Author Name
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Publication Date
          </p>
        </div>
      </div>
      <div className="relative group overflow-hidden rounded-lg">
        <Link className="absolute inset-0 z-10" href="#">
          <span className="sr-only">View</span>
        </Link>
        <img
          alt="Article 3"
          className="object-cover w-full h-60"
          height={300}
          src="/placeholder.svg"
          style={{
            aspectRatio: "400/300",
            objectFit: "cover",
          }}
          width={400}
        />
        <div className="bg-white p-4 dark:bg-gray-950">
          <h3 className="font-semibold text-lg md:text-xl">Article Title</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Author Name
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Publication Date
          </p>
        </div>
      </div>
    </div>
  );
}
