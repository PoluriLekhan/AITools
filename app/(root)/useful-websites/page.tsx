"use client";
import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { USEFUL_WEBSITES_QUERY } from "@/sanity/lib/queries";
import UsefulWebsiteCard, { UsefulWebsiteTypeCard } from "@/components/UsefulWebsiteCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Globe, ArrowLeft } from "lucide-react";

export default function UsefulWebsitesPage() {
  const [usefulWebsites, setUsefulWebsites] = useState<UsefulWebsiteTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const data = await client.fetch(USEFUL_WEBSITES_QUERY);
        setUsefulWebsites(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((website: UsefulWebsiteTypeCard) => website.category).filter(Boolean))) as string[];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching useful websites:', error);
        setLoading(false);
      }
    };
    fetchWebsites();
  }, []);

  // Filter by category
  const filteredWebsites = selectedCategory
    ? usefulWebsites.filter(website => website.category === selectedCategory)
    : usefulWebsites;

  if (loading) {
    return (
      <div className="section_container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="pink_container">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-white hover:text-gray-200 transition-colors flex items-center gap-2">
            <ArrowLeft className="size-5" />
            Back to Home
          </Link>
        </div>
        <h1 className="heading gradient-text flex items-center gap-3">
          <Globe className="size-8" />
          Useful Website Links
        </h1>
        <p className="sub-heading !max-w-3xl">
          Discover helpful websites and resources handpicked by our community.
        </p>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white font-semibold">
            <span className="text-2xl">🌐</span>
            <span className="text-lg">{usefulWebsites.length} Useful Websites</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="section_container mt-8">
          <h2 className="text-2xl font-bold mb-4 gradient-text">Categories</h2>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2 rounded-full shadow-md font-semibold border-2 border-black transition-all duration-300 ${!selectedCategory ? 'bg-primary text-white' : 'bg-white text-black'}`}
              onClick={() => setSelectedCategory("")}
            >
              All Categories
            </motion.button>
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2 rounded-full shadow-md font-semibold border-2 border-black transition-all duration-300 ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white text-black'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Useful Websites List */}
      <section className="section_container mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            {selectedCategory ? `${selectedCategory} Websites` : "All Useful Websites"}
          </h2>
          <div className="text-gray-600">
            {filteredWebsites.length} website{filteredWebsites.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {filteredWebsites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">
              {selectedCategory ? `No ${selectedCategory} websites yet` : "No useful websites yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory 
                ? `Be the first to submit a useful ${selectedCategory.toLowerCase()} website!`
                : "Be the first to submit a useful website!"
              }
            </p>
            <Link 
              href="/submit"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Submit Useful Website
            </Link>
          </div>
        ) : (
          <ul className="card_grid-sm">
            {filteredWebsites.map((website, index) => (
              <motion.div 
                key={website._id} 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <UsefulWebsiteCard post={website} />
              </motion.div>
            ))}
          </ul>
        )}
      </section>

      {/* Call to Action */}
      <div className="text-center mt-12 py-8 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Have a useful website to share?</h3>
        <p className="text-gray-600 mb-4">
          Submit useful websites and help others discover great resources!
        </p>
        <Link 
          href="/submit"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Submit Useful Website
        </Link>
      </div>
    </>
  );
} 