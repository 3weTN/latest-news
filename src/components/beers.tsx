import { Article } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface BeerProps {
  beers: Article[] | null;
}

export function Beers({ beers }: BeerProps) {
  return (
    <>
      {beers ? (
        beers.map((article) => (
          <Card key={article.id}>
            <CardContent className="flex flex-col items-center justify-center ">
              <img
                className="object-cover w-full h-60 rounded"
                height={300}
                style={{
                  aspectRatio: "400/300",
                  objectFit: "cover",
                }}
                width={400}
                src={article.image}
                alt={article.title}
              />
            </CardContent>
            <CardFooter className="text-center flex flex-col p-4">
              <CardTitle className="my-2">{article.title}</CardTitle>
              <CardDescription>{article.intro}</CardDescription>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="text-xl font-bold">No beers available !! </div>
      )}
    </>
  );
}
