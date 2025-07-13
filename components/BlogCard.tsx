import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  blog: {
    _id: string;
    title: string;
    content: string;
    coverImage: string;
    category: string;
    accessType: string;
    aiToolLink: string;
    _createdAt: string;
    author?: {
      _id: string;
      name: string;
      image?: string;
      bio?: string;
    };
  };
}

const BlogCard = ({ blog }: BlogCardProps) => {
  const { _id, title, content, coverImage, category, accessType, _createdAt, author } = blog;

  // Truncate content for preview
  const truncatedContent = content.length > 150 
    ? content.substring(0, 150) + "..." 
    : content;

  return (
    <li className="ai-tool-card group">
      <div className="flex-between">
        <p className="ai-tool_card_date">{formatDate(_createdAt)}</p>
        <div className="flex gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            accessType === 'Free' 
              ? 'bg-green-100 text-green-800' 
              : accessType === 'Paid' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {accessType}
          </span>
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={`/user/${author?._id}`}>
            <p className="text-16-medium line-clamp-1">{author?.name || "Unknown Author"}</p>
          </Link>
          <Link href={`/blog/${_id}`}>
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
          </Link>
        </div>
        <Link href={`/user/${author?._id}`}>
          {author?.image && author?.name ? (
            <Image
              src={author.image}
              alt={author.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="rounded-full bg-gray-200 w-12 h-12" />
          )}
        </Link>
      </div>

      <div className="mt-5">
        <p className="ai-tool-card_desc">{truncatedContent}</p>
      </div>

      <div className="flex-between mt-5">
        <span className="category-tag">{category}</span>
        <Link href={`/blog/${_id}`}>
          <button className="ai-tool-card_btn">Read More</button>
        </Link>
      </div>
    </li>
  );
};

export default BlogCard; 