"use client";

import { fetchPosts } from "@/actions/fetch-posts";
import { Posts } from "@/components/posts";
import { Spinner } from "@/components/ui/spinner";
import { ArticleSummary } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

export function LoadMore() {
  const [posts, setPosts] = useState<ArticleSummary[]>([]);
  const [page, setPage] = useState(1);
  const pageRef = useRef(page);

  const { ref, inView } = useInView();

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const loadMorePosts = useCallback(async () => {
    // Once the page 8 is reached repeat the process all over again.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const nextPage = (pageRef.current % 7) + 1;
    const newPosts =
      (await fetchPosts(nextPage, { fields: "summary" })) ?? [];
    setPosts((prevProducts) => [...prevProducts, ...newPosts]);
    setPage(nextPage);
  }, []);

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView, loadMorePosts]);

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
