"use client";
import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { AITOOL_VIEWS_QUERY } from "@/sanity/lib/queries";
import { HeartIcon } from "lucide-react";

const View = ({ id }: { id: string }) => {
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [totalLikes, setTotalLikes] = useState<number | null>(null);

  useEffect(() => {
    client.fetch(AITOOL_VIEWS_QUERY, { id }).then((data) => {
      setTotalViews(data.views);
      setTotalLikes(data.likes);
      fetch("/api/increment-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, views: data.views }),
      });
    });
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
