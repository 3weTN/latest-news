import { fetchPosts } from "@/actions/fetch-posts";
import PostsClient from "@/components/posts-client";

export const dynamic = "force-dynamic";

const PostsPage = async () => {
  const posts = await fetchPosts(1, { fields: "summary" });

  return (
    <main className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6 text-right">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            تغطية فورية لأبرز العناوين التونسية على مدار اليوم.
          </p>
          <h1 className="text-3xl font-bold leading-tight">أحدث الأخبار التونسية</h1>
        </div>
      </div>

      {/* Client component that renders initial posts and handles infinite loading in one grid */}
      <PostsClient initialPosts={posts} />
    </main>
  );
};

export default PostsPage;
