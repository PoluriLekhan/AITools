"use client";
import { useEffect, useState } from "react";
import { HeartIcon } from "lucide-react";

const View = ({ id }: { id: string }) => {
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [totalLikes, setTotalLikes] = useState<number | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch("/api/ai-tools/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setTotalViews(data.views);
          setTotalLikes(data.likes);
          
          // Increment views
          fetch("/api/increment-views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, views: data.views }),
          });
        }
      } catch (error) {
        console.error("Error fetching views:", error);
      }
    };

    fetchViews();
  }, [id]);

  if (totalViews === null) return null; // or a loading spinner

  return (
    <div className="flex gap-4 items-center">
      <span>{totalViews} views</span>
      <div className="flex gap-1 items-center">
        <HeartIcon className="size-4 text-red-500" />
        <span>{totalLikes || 0} likes</span>
      </div>
    </div>
  );
};

export default View;
