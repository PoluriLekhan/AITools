"use client";
import { useEffect, useState } from "react";

const View = ({ id }: { id: string }) => {
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const incrementViews = async (id: string, currentViews: number) => {
    if (loading || !id) return;
    setLoading(true);
    try {
      await fetch("/api/increment-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id, views: currentViews }),
      });
    } finally {
      setLoading(false);
    }
  };

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
          // Increment views
          incrementViews(id, data.views || 0);
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
    </div>
  );
};

export default View;
