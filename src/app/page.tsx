import { fetchBeers } from "@/actions/fetch-products";
import { LoadMore } from "@/components/load-more";
import { Beers } from "@/components/beers";

const ProductsPage = async () => {
  const beers = await fetchBeers(1);

  return (
    <div className="container min-h-screen px-4 py-5 ">
      <h1 className="text-3xl font-bold mb-4 text-center">الاخبار</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        <Beers beers={beers} />
        <LoadMore />
      </div>
    </div>
  );
};

export default ProductsPage;
