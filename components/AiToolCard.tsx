"use client";
import { cn, formatDate } from "@/lib/utils";
import { EyeIcon, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Author, AiTool } from "@/sanity/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import Likes from "@/components/Likes";

export type AiToolTypeCard = Omit<AiTool, "author"> & { author?: Author };

interface AiToolCardProps {
  post: AiToolTypeCard;
}

const AiToolCard = ({ post }: AiToolCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  
  const { _createdAt, views, author, title, category, _id, description, types, toolWebsiteURL, toolImage } = post;

  // Deduplicate types to prevent duplicates from showing
  const uniqueTypes = Array.isArray(types) ? [...new Set(types)] : [];
  
  // Use toolImage as the display image, fallback to image if not present
  const displayImage = toolImage || (post as any).image;

  // Debug logging
  console.log("AiToolCard Debug:", {
    title,
    toolImage,
    displayImage,
    hasToolImage: !!toolImage
  });

  // Check if the image URL is valid
  const isValidImageUrl = (url: string | undefined) => {
    if (!url || typeof url !== 'string') return false;
    const trimmedUrl = url.trim();
    if (trimmedUrl === '') return false;
    
    // Basic URL validation
    try {
      new URL(trimmedUrl);
      return true;
    } catch {
      return false;
    }
  };

  const shouldShowImage = isValidImageUrl(displayImage) && !imageError;

  return (
    <li className="ai-tool-card group">
      <div className="flex-between">
        <p className="ai-tool_card_date">{formatDate(_createdAt)}</p>
        <div className="flex gap-3 items-center">
          <div className="flex gap-1.5 items-center">
            <EyeIcon className="size-5 text-primary" />
            <span className="text-14-medium">{views || 0}</span>
          </div>
          <Likes id={_id} />
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={`/user/${author?._id}`}>
            <p className="text-16-medium line-clamp-1">{author?.name}</p>
          </Link>
          <Link href={`/ai-tool/${_id}`}>
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
          </Link>
        </div>
        <Link href={`/user/${author?._id}`}>
          {author?.image && author?.name ? (
            <Image
              src={author.image || "/logo.png"}
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

      {/* Improved Types Section */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {uniqueTypes.map((type) => (
          <span 
            key={type} 
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all duration-200 hover:scale-105 ${
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

      <Link href={`/ai-tool/${_id}`}>
        <p className="ai-tool-card_desc">{description}</p>

        {/* Improved image handling with better debugging */}
        {shouldShowImage ? (
          <>
            {/* Try Next.js Image first */}
            <Image 
              src={displayImage!} 
              alt={title || "AI Tool"} 
              width={400} 
              height={200} 
              className="ai-tool-card_img"
              onError={(e) => {
                console.error("Next.js Image failed to load:", displayImage);
                setImageError(true);
              }}
              onLoad={() => {
                console.log("Next.js Image loaded successfully:", displayImage);
              }}
              unoptimized={true} // This allows external images without domain configuration
            />
            {/* Fallback to regular img tag if Next.js Image fails */}
            {imageError && (
              <img 
                src={displayImage!} 
                alt={title || "AI Tool"} 
                className="ai-tool-card_img"
                onError={(e) => {
                  console.error("Regular img tag also failed:", displayImage);
                }}
                onLoad={() => {
                  console.log("Regular img tag loaded successfully:", displayImage);
                }}
              />
            )}
          </>
        ) : (
          <div className="ai-tool-card_img bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-medium">
            <div className="text-center">
              <div className="text-4xl mb-2">🖼️</div>
              <div className="text-sm">
                {displayImage ? "Image failed to load" : "No Image"}
              </div>
              {displayImage && (
                <div className="text-xs mt-1 text-gray-400 max-w-full truncate px-2">
                  <div>URL: {displayImage}</div>
                  <div>Valid URL: {isValidImageUrl(displayImage) ? "Yes" : "No"}</div>
                  <div>Error: {imageError ? "Yes" : "No"}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Link>

      <div className="mt-4 flex justify-end">
        {/* Removed LikeButton component */}
      </div>

      <div className="flex-between gap-3 mt-5">
        <Link href={`/?query=${category?.toLowerCase()}`}>
          <p className="text-16-medium">{category}</p>
        </Link>
        <div className="flex gap-2">
          <Button className="ai-tool-card_btn" asChild>
            <Link href={`/ai-tool/${_id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </li>
  );
};

export const AiToolCardSkeleton = () => (
  <Skeleton className="ai-tool-card_skeleton" />
);

export default AiToolCard;
