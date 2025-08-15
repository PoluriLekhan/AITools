import { client } from "@/sanity/lib/client";
import { PLAYLIST_BY_SLUG_QUERY, AITOOL_BY_ID_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import markdownit from "markdown-it";
import View from "@/components/View";
import { EyeIcon } from "lucide-react";
import Likes from "@/components/Likes";

const md = markdownit();

const Page = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  // Fetch data from Sanity
  const [post, editorData] = await Promise.all([
    client.fetch(AITOOL_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-picks-new",
    }),
  ]);

  if (!post) return notFound();

  const parsedContent = md.render(post?.pitch || "");
  
  // Deduplicate types to prevent duplicates from showing
  const uniqueTypes = Array.isArray(post.types) ? [...new Set(post.types)] as string[] : [];

  // --- Like Button Logic (Client Component) ---
  // This will be rendered as a client component below

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <p className="tag">{formatDate(post?._createdAt)}</p>
        <h1 className="heading">{post.title}</h1>
        {/* Improved Types Section */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {uniqueTypes.map((type: string) => (
            <span 
              key={type} 
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border transition-all duration-200 hover:scale-105 ${
                type === 'Free' 
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                  : type === 'Paid' 
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {type}
            </span>
          ))}
        </div>
        <p className="sub-heading !max-w-5xl mt-4">{post.description}</p>
      </section>

      <section className="section_container">
        <div className="max-w-4xl mx-auto my-8">
          <div
            className="prose max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />
          
          {/* Website URL */}
          {post.toolWebsiteURL && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Website URL</h3>
              <a
                href={post.toolWebsiteURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all text-lg"
              >
                {post.toolWebsiteURL}
              </a>
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-row gap-6 items-center justify-center">
          <div className="flex items-center gap-2 text-lg">
            <EyeIcon className="w-6 h-6 text-blue-500" />
            <View id={post._id} />
          </div>
          <Likes id={post._id} />
        </div>
      </section>
    </>
  );
};

export default Page;
