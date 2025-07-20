"use client";
import { useEffect, useState, useMemo } from "react";
import { client } from "@/sanity/lib/client";
import { AITOOLS_QUERY } from "@/sanity/lib/queries";
import AiToolCard, { AiToolTypeCard } from "@/components/AiToolCard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category);
  const [aiTools, setAiTools] = useState<AiToolTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await client.fetch(AITOOLS_QUERY);
        // Filter tools by the selected category
        const filteredTools = data.filter((tool: AiToolTypeCard) => 
          tool.category && category && tool.category.toLowerCase() === category.toLowerCase()
        );
        setAiTools(filteredTools);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching AI tools:', error);
        setLoading(false);
      }
    };
    fetchTools();
  }, [category]);

  // Compute counts for each tab
  const counts = useMemo(() => {
    return ["Free", "Paid", "Credit-Based"].reduce((acc, t) => {
      acc[t] = aiTools.filter(tool => 
        Array.isArray(tool.types) && [...new Set(tool.types)].includes(t)
      ).length;
      return acc;
    }, {} as Record<string, number>);
  }, [aiTools]);

  // Filtered items by tab and search
  const filteredAiTools = useMemo(() => {
    let filtered = aiTools;
    
    // Filter by subcategory (types)
    if (tab !== "All") {
      filtered = filtered.filter(tool => 
        Array.isArray(tool.types) && [...new Set(tool.types)].includes(tab)
      );
    }
    
    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(tool => 
        (tool.title && tool.title.toLowerCase().includes(searchLower)) || 
        (tool.description && tool.description.toLowerCase().includes(searchLower)) ||
        (tool.category && tool.category.toLowerCase().includes(searchLower)) ||
        (tool.author?.name && tool.author.name.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [aiTools, tab, search]);



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
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
        <h1 className="heading gradient-text">
          {category} AI Tools
        </h1>
        <p className="sub-heading">
          Discover the best {category.toLowerCase()} AI tools
        </p>
      </section>

      <section className="section_container mt-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search AI tools by title, description, or category..."
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        
        {/* Improved Types Filter Section */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {["All", "Free", "Paid", "Credit-Based"].map((t) => (
            <button
              key={t}
              className={`px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 ${
                tab === t 
                  ? 'bg-primary text-white border-primary shadow-lg' 
                  : 'bg-white text-black border-black hover:bg-gray-50'
              }`}
              onClick={() => setTab(t)}
            >
              {t} 
              {t !== "All" && (
                <span className={`text-xs rounded-full px-2 py-0.5 ${
                  tab === t ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'
                }`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* AI Tools Grid */}
        <motion.ul layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAiTools.map(tool => (
            <motion.li
              key={tool._id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="cursor-pointer group hover:shadow-lg hover:scale-105 transition-transform rounded-xl bg-white relative list-none"
            >
              <AiToolCard post={tool} />
            </motion.li>
          ))}
        </motion.ul>
        
        {/* No Results */}
        {filteredAiTools.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              {search.trim() 
                ? `No ${category} AI tools found for "${search}"`
                : `No ${category} AI tools found`
              }
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </section>
    </>
  );
} 