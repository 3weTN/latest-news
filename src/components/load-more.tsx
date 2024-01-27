"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Spinner } from "@/components/ui/spinner";
import { fetchBeers } from "@/actions/fetch-products";
import { Article } from "@/types";
import { Beers } from "@/components/beers";

export function LoadMore() {
  const [beers, setBeers] = useState<Article[]>([]);
  const [page, setPage] = useState(1);

  const { ref, inView } = useInView();

  const loadMoreBeers = async () => {
    // Once the page 8 is reached repeat the process all over again.

    const nextPage = (page % 7) + 1;
    const newProducts = (await fetchBeers(nextPage)) ?? [];
    setBeers((prevProducts: Article[]) => [...prevProducts, ...newProducts]);
    setPage(nextPage);
  };

  useEffect(() => {
    if (inView) {
      loadMoreBeers();
    }
  }, [inView]);

  return (
    <>
      <Beers beers={beers} />
      <div
        className="flex justify-center items-center p-4 col-span-1 sm:col-span-2 md:col-span-3"
        ref={ref}
      >
        <Spinner />
      </div>
    </>
  );
}
