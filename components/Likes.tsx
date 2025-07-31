"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function Likes({ id }: { id: string }) {
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch likes on mount
  useEffect(() => {
    const fetchLikes = async () => {
      const res = await fetch("/api/ai-tools/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
      }
    };
    fetchLikes();

    // Check if already liked
    const likedTools = JSON.parse(localStorage.getItem("likedTools") || "{}");
    setLiked(!!likedTools[id]);
  }, [id]);

  const handleLike = async () => {
    if (loading || liked) return;
    setLiked(true);
    setLikes((prev) => (prev !== null ? prev + 1 : 1));
    setLoading(true);
    try {
      const res = await fetch("/api/admin/manage-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: id,
          action: "incrementLikes",
          documentType: "aiTool",
          adminEmail: "public@like",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.document?.likes !== undefined) {
          setLikes(data.document.likes);
        }
        const likedTools = JSON.parse(localStorage.getItem("likedTools") || "{}");
        likedTools[id] = true;
        localStorage.setItem("likedTools", JSON.stringify(likedTools));
      } else {
        setLiked(false);
        setLikes((prev) => (prev !== null ? prev - 1 : 0));
      }
    } finally {
      setLoading(false);
    }
  };

  if (likes === null) return null; // or a spinner

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={handleLike}
        disabled={liked || loading}
        aria-label="Like this tool"
        className={`focus:outline-none ${liked ? "text-pink-500" : "text-pink-600"}`}
        style={{ background: "none", border: "none", padding: 0, margin: 0 }}
      >
        <Heart className={`w-6 h-6 ${liked ? "fill-pink-500" : ""}`} />
      </button>
      <span>{likes} likes</span>
    </div>
  );
} 