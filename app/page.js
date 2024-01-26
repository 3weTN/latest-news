import Link from "next/link";
import styles from "./page.module.css";

async function getData() {
  const res = await fetch("https://api.mosaiquefm.net/api/ar/200/1/articles");
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
export default async function Home() {
  const data = await getData();
  console.log("data", data);
  return (
    <main className={styles.main}>
      <h1 className="font-bold text-5xl">الاخبار</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6">
        {data &&
          data?.items?.map((item) => (
            <div
              key={item?.id}
              className="relative group overflow-hidden rounded-lg"
            >
              <Link
                className="absolute inset-0 z-10"
                href={`https://www.mosaiquefm.net/${item?.link}`}
                target="_blank"
              >
                <span className="sr-only">View</span>
              </Link>
              <img
                alt="Article 1"
                className="object-cover w-full h-60"
                height={300}
                src={item?.image}
                style={{
                  aspectRatio: "400/300",
                  objectFit: "cover",
                }}
                width={400}
              />
              <div className="bg-white p-4 dark:bg-gray-950">
                <h3 className="font-semibold text-lg md:text-xl">
                  {item?.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item?.startPublish?.date}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item?.intro}
                </p>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
