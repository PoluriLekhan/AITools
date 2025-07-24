'use client';
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LikeButton({ toolId, initialLikes }: { toolId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  const handleLike = async () => {
    if (loading || liked) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          action: 'incrementLikes',
          documentType: 'aiTool',
          adminEmail: 'public@like', // dummy, backend should allow public increment for likes
        }),
      });
      if (res.ok) {
        setLikes(likes + 1);
        setLiked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-pink-50 transition-all duration-200 text-pink-600 font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${liked ? 'bg-pink-100' : ''}`}
      onClick={handleLike}
      disabled={loading || liked}
      aria-label="Like this tool"
      style={{ minWidth: 80 }}
    >
      <Heart className={`w-5 h-5 ${liked ? 'fill-pink-500 text-pink-500' : 'text-pink-600'}`} />
      <span>{likes}</span>
      <span className="hidden sm:inline">Like{likes !== 1 ? 's' : ''}</span>
    </button>
  );
} 