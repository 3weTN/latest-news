import { Article } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface PostProps {
  posts: Article[] | null;
}

export function Posts({ posts }: PostProps) {
  return (
    <>
      {posts ? (
        posts.map((article) => (
          <Card key={article.id}>
            <CardContent className="flex flex-col items-center justify-center p-2">
              <img src={article.image} alt={article.title} />
            </CardContent>
            <CardFooter className="text-center flex flex-col p-2">
              <CardTitle className="my-2">{article.title}</CardTitle>
              <CardDescription>{article.intro}</CardDescription>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="text-xl font-bold">No posts available !! </div>
      )}
    </>
  );
}
