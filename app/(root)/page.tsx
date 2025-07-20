"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import SearchForm from "@/components/SearchForm";
import AiToolCard, { AiToolTypeCard } from "@/components/AiToolCard";
import BlogCard from "@/components/BlogCard";
import { client } from "@/sanity/lib/client";
import { AITOOLS_QUERY, SEARCH_AITOOLS_QUERY, SEARCH_ALL_QUERY, ALL_BLOGS_QUERY, TOTAL_TOOLS_COUNT_QUERY, TOTAL_WEBSITES_COUNT_QUERY } from "@/sanity/lib/queries";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams?.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [aiTools, setAiTools] = useState<AiToolTypeCard[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  const [totalToolsCount, setTotalToolsCount] = useState<number>(0);
  const [totalWebsitesCount, setTotalWebsitesCount] = useState<number>(0);
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
          const aiToolCats = searchData.aiTools.map((tool: AiToolTypeCard) => tool.category).filter(Boolean) as string[];
          const blogCats = searchData.blogs.map((blog: any) => blog.category).filter(Boolean) as string[];
          const allCats = Array.from(new Set([...aiToolCats, ...blogCats]));
          setCategories(allCats);
        } else {
          // Fetch all AI tools, blogs, and total counts
          const [aiToolsData, blogsData, totalToolsCount, totalWebsitesCount] = await Promise.all([
            client.fetch(AITOOLS_QUERY),
            client.fetch(ALL_BLOGS_QUERY),
            client.fetch(TOTAL_TOOLS_COUNT_QUERY),
            client.fetch(TOTAL_WEBSITES_COUNT_QUERY)
          ]);
          setAiTools(aiToolsData);
          setBlogs(blogsData);
          setTotalToolsCount(totalToolsCount);
          setTotalWebsitesCount(totalWebsitesCount);
          setSearchResults(null);
          
          // Get categories from AI tools only
          const aiToolCats = aiToolsData.map((tool: AiToolTypeCard) => tool.category).filter(Boolean) as string[];
          const allCats = Array.from(new Set(aiToolCats));
          setCategories(allCats);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [query]);



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



      {/* All AI Tools Section */}
      <section className="section_container mt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-30-semibold">
            {query ? `Search results for "${query}"` : "All AI Tools"}
          </p>
          {!query && (
            <div className="text-gray-600 text-sm">
              Showing {filteredTools.length} of {totalToolsCount} AI Tools
            </div>
          )}
        </div>
        <ul className="card_grid-sm">
          {filteredTools.map(tool => (
            <AiToolCard key={tool._id} post={tool} />
          ))}
        </ul>
      </section>
    </>
  );
}
