"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_EMAIL_QUERY, AITOOLS_BY_AUTHOR_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import UserAiTools from "@/components/UserAiTools";
import UserUsefulWebsites from "@/components/UserUsefulWebsites"; // Actually the new UserUsefulWebsites component
import { AiToolCardSkeleton } from "@/components/AiToolCard";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  bio: string;
  isAdmin: boolean;
  role: string;
}

interface AiTool {
  _id: string;
  title: string;
  _createdAt: string;
  author: {
    _id: string;
    name: string;
    image: string;
    bio: string;
  };
  views: number;
  description: string;
  category: string;
  image: string;
  types: string[];
  toolWebsiteURL: string;
  status: string;
}

const Page = ({ params }: { params: { id: string } }) => {
  const email = decodeURIComponent(params.id);
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [aiTools, setAiTools] = useState<AiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch user data and AI tools
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await client.fetch(AUTHOR_BY_EMAIL_QUERY, { email });
      if (!userData) {
        setError("User not found");
        return;
      }
      setUser(userData);

      // Fetch AI tools for this user
      const toolsData = await client.fetch(AITOOLS_BY_AUTHOR_QUERY, { id: userData._id });
      setAiTools(toolsData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // Check if user just submitted a tool (URL parameter)
    if (searchParams.get('newSubmission') === 'true') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('newSubmission');
      window.history.replaceState({}, '', url.toString());
    }
  }, [email, searchParams]);

  // Listen for new AI tool submissions from the current user
  useEffect(() => {
    if (!currentUser || currentUser.email !== email) return;

    // Create a custom event listener for new AI tool submissions
    const handleNewSubmission = (event: CustomEvent) => {
      const newTool = event.detail;
      setAiTools(prevTools => [newTool, ...prevTools]);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000); // Hide after 5 seconds
    };

    window.addEventListener('new-ai-tool-submitted', handleNewSubmission as EventListener);

    return () => {
      window.removeEventListener('new-ai-tool-submitted', handleNewSubmission as EventListener);
    };
  }, [currentUser, email]);

  if (loading) {
    return (
      <div className="section_container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return notFound();
  }

  // Filter tools by status
  const pendingTools = aiTools.filter(tool => tool.status === "pending");
  const approvedTools = aiTools.filter(tool => tool.status === "approved");

  return (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>New AI tool added to your profile!</span>
          </div>
        </div>
      )}
      
      <section className="profile_container">
        <div className="profile_card">
          <div className="profile_title">
            <h3 className="text-24-black uppercase text-center line-clamp-1">
              {user.name}
            </h3>
          </div>

          <Image
            src={user.image}
            alt={user.name}
            width={220}
            height={220}
            className="profile_image"
          />

          <p className="text-30-extrabold mt-7 text-center">
            @{user?.username}
          </p>
          <p className="mt-1 text-center text-14-normal">{user?.bio}</p>
          
          {/* Submission Stats */}
          <div className="mt-4 text-center">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-lg font-bold text-white">
                {aiTools.length} AI Tool{aiTools.length !== 1 ? 's' : ''} Submitted
              </p>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <span className="bg-yellow-500/80 px-2 py-1 rounded">
                  {pendingTools.length} Pending
                </span>
                <span className="bg-green-500/80 px-2 py-1 rounded">
                  {approvedTools.length} Approved
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8 lg:-mt-5">
          {/* My Submissions Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold gradient-text">My Submissions</h1>
            <p className="text-gray-600 mt-2">Track your AI tool submissions and their status</p>
          </div>
          
          {/* Show different sections based on user role */}
          {user.isAdmin ? (
            // Admin users - show only approved tools (since they auto-approve)
            <div>
              <h2 className="text-2xl font-bold mb-4 gradient-text">My AI Tools</h2>
              <ul className="card_grid-sm">
                {approvedTools.length > 0 ? (
                  approvedTools.map((aiTool) => (
                    <li key={aiTool._id} className="animate-fade-in">
                      {/* We'll need to create a client-side AiToolCard component */}
                      <div className="ai-tool-card">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={aiTool.image} alt={aiTool.title} className="ai-tool-card_img" />
                          <div>
                            <h3 className="text-lg font-bold">{aiTool.title}</h3>
                            <p className="text-sm text-gray-600">{aiTool.category}</p>
                          </div>
                        </div>
                        <p className="ai-tool-card_desc">{aiTool.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="ai-tool-card_date">
                            {new Date(aiTool._createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <a
                              href={`/ai-tool/${aiTool._id}`}
                              className="px-3 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </a>
                            <a
                              href={aiTool.toolWebsiteURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ai-tool-card_btn"
                            >
                              Visit Tool
                            </a>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No approved AI Tools found.</p>
                )}
              </ul>
            </div>
          ) : (
            // Regular users - show pending and approved sections
            <>
              {/* Pending AI Tools Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 gradient-text">Pending AI Tools</h2>
                <ul className="card_grid-sm">
                  {pendingTools.length > 0 ? (
                    pendingTools.map((aiTool) => (
                      <li key={aiTool._id} className="animate-fade-in">
                        <div className="ai-tool-card">
                          <div className="flex items-center gap-3 mb-3">
                            <img src={aiTool.image} alt={aiTool.title} className="ai-tool-card_img" />
                            <div>
                              <h3 className="text-lg font-bold">{aiTool.title}</h3>
                              <p className="text-sm text-gray-600">{aiTool.category}</p>
                              <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Pending
                              </span>
                            </div>
                          </div>
                          <p className="ai-tool-card_desc">{aiTool.description}</p>
                                                  <div className="flex items-center justify-between mt-3">
                          <span className="ai-tool-card_date">
                            {new Date(aiTool._createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <a
                              href={`/ai-tool/${aiTool._id}`}
                              className="px-3 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </a>
                            <span className="text-sm text-gray-500">Awaiting approval</span>
                          </div>
                        </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No pending AI Tools found.</p>
                  )}
                </ul>
              </div>

              {/* Approved AI Tools Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 gradient-text">Approved AI Tools</h2>
                <ul className="card_grid-sm">
                  {approvedTools.length > 0 ? (
                    approvedTools.map((aiTool) => (
                      <li key={aiTool._id} className="animate-fade-in">
                        <div className="ai-tool-card">
                          <div className="flex items-center gap-3 mb-3">
                            <img src={aiTool.image} alt={aiTool.title} className="ai-tool-card_img" />
                            <div>
                              <h3 className="text-lg font-bold">{aiTool.title}</h3>
                              <p className="text-sm text-gray-600">{aiTool.category}</p>
                            </div>
                          </div>
                          <p className="ai-tool-card_desc">{aiTool.description}</p>
                                                  <div className="flex items-center justify-between mt-3">
                          <span className="ai-tool-card_date">
                            {new Date(aiTool._createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <a
                              href={`/ai-tool/${aiTool._id}`}
                              className="px-3 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </a>
                            <a
                              href={aiTool.toolWebsiteURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ai-tool-card_btn"
                            >
                              Visit Tool
                            </a>
                          </div>
                        </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No approved AI Tools found.</p>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;
