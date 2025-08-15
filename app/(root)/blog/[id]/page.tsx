import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";

type PageProps = { params: { id: string } };

export default async function BlogPostPage({ params }: PageProps) {
  const id = params?.id;
  if (!id) return notFound();

  // Minimal fetch by id; adjust to your query if needed
  const blog = await client.fetch(
    `*[_type == "blog" && _id == $id][0]{
      _id, title, content, coverImage, category, accessType, _createdAt
    }`,
    { id }
  );

  if (!blog) return notFound();

  return (
    <div className="section_container">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      {blog.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={blog.coverImage} alt={blog.title} className="mb-6 max-h-96 rounded-lg border" />
      ) : null}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content || "" }} />
    </div>
  );
}