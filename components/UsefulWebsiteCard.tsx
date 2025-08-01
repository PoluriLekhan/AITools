"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export interface UsefulWebsiteTypeCard {
  _id: string;
  title: string;
  description: string;
  category: string;
  websiteURL: string;
  image: string;
  views?: number;
  _createdAt: string;
  author?: {
    _id: string;
    name: string;
    image?: string;
    bio?: string;
  };
}

interface UsefulWebsiteCardProps {
  post: UsefulWebsiteTypeCard;
}

const UsefulWebsiteCard = ({ post }: UsefulWebsiteCardProps) => {
  const [views, setViews] = useState(post.views || 0);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleView = async () => {
    try {
      await fetch("/api/increment-views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: post._id,
          userId: user?.uid,
          userEmail: user?.email,
          documentType: "usefulWebsite",
          views: post.views || 0
        }),
      });
      setViews(prev => prev + 1);
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                  {post.description}
                </p>
              </div>
              <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold ml-3 flex-shrink-0">
                {post.category}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post._createdAt)}
                </div>
                {post.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author.name}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {views}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex items-center gap-1 flex-1"
                asChild
              >
                <Link href={`/useful-website/${post._id}`}>
                  Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default UsefulWebsiteCard; 