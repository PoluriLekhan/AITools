"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { searchAll } from "@/lib/sanity-client";
import AiToolCard, { AiToolTypeCard } from "@/components/AiToolCard";
import BlogCard from "@/components/BlogCard";
import { motion } from "framer-motion";
import SearchForm from "@/components/SearchForm";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [searchResults, setSearchResults] = useState<{
    aiTools: AiToolTypeCard[];
    blogs: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "aiTools" | "blogs">("all");

  useEffect(() => {
    const performSearch = async () => {
      if (!query?.trim()) {
        setSearchResults(null);
        return;
      }

      setLoading(true);
      try {
        const result = await searchAll(query);
        if (result.success) {
          setSearchResults(result.data);
        } else {
          console.error("Search error:", result.error);
          setSearchResults({ aiTools: [], blogs: [] });
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({ aiTools: [], blogs: [] });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const totalResults = searchResults 
    ? searchResults.aiTools.length + searchResults.blogs.length 
    : 0;

  return (
    <>
      <section className="pink_container">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
        <h1 className="heading gradient-text">
          Search Results
        </h1>
        <p className="sub-heading">
          Find AI tools and blog posts across our platform
        </p>
        <SearchForm query={query || undefined} />
      </section>

      <section className="section_container mt-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : query ? (
          <>
            {/* Search Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 gradient-text">
                Search Results for "{query}"
              </h2>
              <p className="text-gray-600 mb-4">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} 
                ({searchResults?.aiTools?.length || 0} AI tools, {searchResults?.blogs?.length || 0} blogs)
              </p>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200 ${
                    activeTab === "all" 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  All ({totalResults})
                </button>
                <button
                  onClick={() => setActiveTab("aiTools")}
                  className={`px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200 ${
                    activeTab === "aiTools" 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  AI Tools ({searchResults?.aiTools?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("blogs")}
                  className={`px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200 ${
                    activeTab === "blogs" 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  Blogs ({searchResults?.blogs?.length || 0})
                </button>
              </div>
            </div>

            {/* Search Results */}
            {totalResults === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No results found for "{query}"</h3>
                <p className="text-gray-500 mb-4">
                  Try searching with different keywords or browse our categories
                </p>
                <Link 
                  href="/" 
                  className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Browse All Content
                </Link>
              </div>
            ) : (
              <>
                {/* AI Tools Results */}
                {(activeTab === "all" || activeTab === "aiTools") && searchResults?.aiTools?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      AI Tools ({searchResults.aiTools?.length})
                    </h3>
                    <ul className="card_grid-sm">
                      {searchResults.aiTools.map((tool) => (
                        <motion.div 
                          key={tool._id} 
                          initial={{ opacity: 0, y: 30 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ duration: 0.4 }}
                        >
                          <AiToolCard post={tool} />
                        </motion.div>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Blogs Results */}
                {(activeTab === "all" || activeTab === "blogs") && searchResults?.blogs?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      Blog Posts ({searchResults.blogs?.length})
                    </h3>
                    <ul className="card_grid-sm">
                      {searchResults.blogs.map((blog) => (
                        <motion.div 
                          key={blog._id} 
                          initial={{ opacity: 0, y: 30 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ duration: 0.4 }}
                        >
                          <BlogCard blog={blog} />
                        </motion.div>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Enter a search term above</h3>
            <p className="text-gray-500">
              Search across AI tools and blog posts by title, description, content, category, or author
            </p>
          </div>
        )}
      </section>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
} 