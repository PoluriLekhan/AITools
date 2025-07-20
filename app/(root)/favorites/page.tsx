"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchUserFavorites } from "@/lib/sanity-client";
import AiToolCard from "@/components/AiToolCard";
import UsefulWebsiteCard from "@/components/UsefulWebsiteCard";
import { useToast } from "@/hooks/use-toast";

const FavoritesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      setLoading(true);
      const result = await fetchUserFavorites(user.uid);
      if (result.success) {
        setFavorites(result.data);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  if (!user) {
    return (
      <div className="section_container">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-600">Please log in to view your favorites.</p>
        </div>
      </div>
    );
  }

  const handleUnfavorite = async (fav: any) => {
    if (!user) return;
    try {
      const res = await fetch("/api/check-user-like", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          aiToolId: fav.aiToolId?._id,
          usefulWebsiteId: fav.usefulWebsiteId?._id,
        }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f._id !== fav._id));
        window.dispatchEvent(new Event('favorite-removed'));
        toast({
          title: "Removed from Favorites",
          description: "This item has been removed from your favorites.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data?.error || "Failed to remove from favorites.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="section_container">
      <h1 className="text-3xl font-bold gradient-text mb-6 text-center">My Favorites</h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : favorites.length === 0 ? (
        <p className="text-gray-500 text-center py-4">You have not favorited any AI tools or useful websites yet.</p>
      ) : (
        <ul className="card_grid-sm">
          {favorites.map((fav) => (
            <li key={fav._id + (fav.aiToolId ? "-aiTool" : "-website")}>
              {fav.aiToolId ? (
                <AiToolCard post={fav.aiToolId} onUnfavorite={() => handleUnfavorite(fav)} />
              ) : fav.usefulWebsiteId ? (
                <UsefulWebsiteCard post={fav.usefulWebsiteId} onUnfavorite={() => handleUnfavorite(fav)} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage; 