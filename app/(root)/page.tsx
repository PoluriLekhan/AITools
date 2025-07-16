"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import SearchForm from "@/components/SearchForm";
import AiToolCard, { AiToolTypeCard } from "@/components/AiToolCard";
import BlogCard from "@/components/BlogCard";
import { client } from "@/sanity/lib/client";
import { AITOOLS_QUERY, SEARCH_AITOOLS_QUERY, SEARCH_ALL_QUERY, ALL_BLOGS_QUERY } from "@/sanity/lib/queries";
import { motion } from "framer-motion";

export default function Home({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams?.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [aiTools, setAiTools] = useState<AiToolTypeCard[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    aiTools: AiToolTypeCard[];
    blogs: any[];
  } | null>(null);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      if (localStorage.getItem("justLoggedIn")) {
        toast({
          title: `Welcome, ${user.displayName || user.email}!`,
        });
        localStorage.removeItem("justLoggedIn");
      }
    }
  }, [user, toast]);

  useEffect(() => {
    // Fetch AI Tools and Blogs based on search query or all tools
    const fetchData = async () => {
      try {
        if (query) {
          // Search both AI tools and blogs
          const searchData = await client.fetch(SEARCH_ALL_QUERY, { search: `*${query}*` });
          setSearchResults(searchData);
          setAiTools(searchData.aiTools);
          setBlogs(searchData.blogs);
          
          // Combine categories from both AI tools and blogs
          const aiToolCats = searchData.aiTools.map((tool: AiToolTypeCard) => tool.category).filter(Boolean);
          const blogCats = searchData.blogs.map((blog: any) => blog.category).filter(Boolean);
          const allCats = Array.from(new Set([...aiToolCats, ...blogCats]));
          setCategories(allCats);
        } else {
          // Fetch all AI tools and blogs
          const [aiToolsData, blogsData] = await Promise.all([
            client.fetch(AITOOLS_QUERY),
            client.fetch(ALL_BLOGS_QUERY)
          ]);
          setAiTools(aiToolsData);
          setBlogs(blogsData);
          setSearchResults(null);
          
          // Get categories from AI tools only
          const aiToolCats = aiToolsData.map((tool: AiToolTypeCard) => tool.category).filter(Boolean);
          const allCats = Array.from(new Set(aiToolCats));
          setCategories(allCats);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [query]);

  // Trending: sort by likes in descending order
  const trendingTools = [...aiTools]
    .sort((a, b) => {
      const likesA = b.likes || 0;
      const likesB = a.likes || 0;
      return likesA - likesB; // Descending order (highest likes first)
    })
    .slice(0, 5);

  // Most Viewed: sort by views in descending order
  const mostViewedTools = [...aiTools]
    .sort((a, b) => {
      const viewsA = b.views || 0;
      const viewsB = a.views || 0;
      return viewsB - viewsA; // Descending order (highest views first)
    })
    .slice(0, 5);

  // Filter by category
  const filteredTools = selectedCategory
    ? aiTools.filter(tool => tool.category === selectedCategory)
    : aiTools;

  return (
    <>
      <section className="pink_container">
        <h1 className="heading gradient-text">
          Discover & Share AI Tools
        </h1>
        <p className="sub-heading !max-w-3xl">
          Submit, explore, and find the best AI tools for every need.
        </p>
        <SearchForm query={query} />
      </section>

      {/* Categories Section */}
      <section className="section_container mt-8">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2 rounded-full shadow-md font-semibold border-2 border-black transition-all duration-300 ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white text-black'}`}
              onClick={() => window.location.href = `/category/${encodeURIComponent(cat)}`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Search Results Section */}
      {query && searchResults && (
        <section className="section_container mt-8">
          <h2 className="text-2xl font-bold mb-2 gradient-text">Search Results for "{query}"</h2>
          <p className="text-gray-600 mb-4">
            Found {searchResults.aiTools.length} AI tools and {searchResults.blogs.length} blogs
          </p>
          
          {/* AI Tools Results */}
          {searchResults.aiTools.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">AI Tools ({searchResults.aiTools.length})</h3>
              <ul className="card_grid-sm">
                {searchResults.aiTools.map((tool) => (
                  <motion.div key={tool._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <AiToolCard post={tool} />
                  </motion.div>
                ))}
              </ul>
            </div>
          )}
          
          {/* Blogs Results */}
          {searchResults.blogs.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Blog Posts ({searchResults.blogs.length})</h3>
              <ul className="card_grid-sm">
                {searchResults.blogs.map((blog) => (
                  <motion.div key={blog._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <BlogCard blog={blog} />
                  </motion.div>
                ))}
              </ul>
            </div>
          )}
          
          {/* No Results */}
          {searchResults.aiTools.length === 0 && searchResults.blogs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No results found for "{query}"</h3>
              <p className="text-gray-500">
                Try searching with different keywords or browse our categories
              </p>
            </div>
          )}
        </section>
      )}

      {/* Trending Section */}
      <section className="section_container mt-8">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Most Liked AI Tools</h2>
        <p className="text-gray-600 mb-4">Top AI tools ranked by community likes</p>
        <ul className="card_grid-sm">
          {trendingTools.map((tool, index) => (
            <motion.div key={tool._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="relative">
                <AiToolCard post={tool} />
                {/* Show ranking badge for top 3 */}
                {index < 3 && (
                  <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </ul>
        {/* Show total count of trending tools */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Showing top {trendingTools.length} of {aiTools.length} AI tools by likes
          </p>
        </div>
      </section>

      {/* Most Viewed Section */}
      <section className="section_container mt-8">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Most Viewed AI Tools</h2>
        <p className="text-gray-600 mb-4">Top AI tools ranked by total views</p>
        <ul className="card_grid-sm">
          {mostViewedTools.map((tool, index) => (
            <motion.div key={tool._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="relative">
                <AiToolCard post={tool} />
                {/* Show ranking badge for top 3 */}
                {index < 3 && (
                  <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </ul>
        {/* Show total count of most viewed tools */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Showing top {mostViewedTools.length} of {aiTools.length} AI tools by views
          </p>
        </div>
      </section>

      {/* All AI Tools Section */}
      <section className="section_container mt-8">
        <p className="text-30-semibold">
          {query ? `Search results for "${query}"` : "All AI Tools"}
        </p>
        <ul className="card_grid-sm">
          {filteredTools.map(tool => (
            <AiToolCard key={tool._id} post={tool} />
          ))}
        </ul>
      </section>
    </>
  );
}
