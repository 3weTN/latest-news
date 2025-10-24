import { fetchPosts } from "@/actions/fetch-posts";
import PostsClient from "@/components/posts-client";

const PostsPage = async () => {
  const posts = await fetchPosts(1);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen ">
      <h1 className="text-3xl font-bold mb-4 text-center">عناوين الأخبار</h1>

      {/* Client component that renders initial posts and handles infinite loading in one grid */}
      <PostsClient initialPosts={posts} />
    </div>
  );
};

export default PostsPage;
