"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/lib/actions";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BlogCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      const result = await createBlogPost(formData);
      if (result.success && result.id) {
        router.push(`/blog/${result.id}`);
        // Reset form fields after successful submission
        // (Assuming you have state for each field, otherwise this is a placeholder)
        // setTitle(""); setContent(""); setCategory(""); setAccessType("public"); setAiToolLink("");
      } else {
        alert(result.error || "Failed to create blog post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert("Failed to create blog post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter blog post title"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Write your blog post content here..."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a category</option>
            <option value="AI Tools">AI Tools</option>
            <option value="Tutorials">Tutorials</option>
            <option value="News">News</option>
            <option value="Reviews">Reviews</option>
            <option value="Tips & Tricks">Tips & Tricks</option>
          </select>
        </div>

        <div>
          <label htmlFor="accessType" className="block text-sm font-medium text-gray-700 mb-2">
            Access Type
          </label>
          <select
            id="accessType"
            name="accessType"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div>
          <label htmlFor="aiToolLink" className="block text-sm font-medium text-gray-700 mb-2">
            Related AI Tool Link (Optional)
          </label>
          <input
            type="url"
            id="aiToolLink"
            name="aiToolLink"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com/ai-tool"
          />
        </div>

        <div className="flex gap-4 pt-6">
          <motion.button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Creating..." : "Create Blog Post"}
          </motion.button>
          
          <Link
            href="/"
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
} 