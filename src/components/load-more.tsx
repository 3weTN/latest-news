"use client";

import { fetchPosts } from "@/actions/fetch-posts";
import { Posts } from "@/components/posts";
import { Spinner } from "@/components/ui/spinner";
import { Article } from "@/types";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export function LoadMore() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [page, setPage] = useState(1);

  const { ref, inView } = useInView();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const loadMorePosts = async () => {
    // Once the page 8 is reached repeat the process all over again.
    await delay(2000);
    const nextPage = (page % 7) + 1;
    const newPosts = (await fetchPosts(nextPage)) ?? [];
    setPosts((prevProducts: Article[]) => [...prevProducts, ...newPosts]);
    setPage(nextPage);
  };

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  return (
    <>
      {/* Render loaded batches only when there are posts (avoid showing 'No posts available' initially) */}
      {posts.length > 0 && <Posts posts={posts} showFeatured={false} />}
      <div
        className="flex justify-center items-center p-4 col-span-1 sm:col-span-2 md:col-span-3"
        ref={ref}
      >
        <Spinner />
      </div>
    </>
  );
}
