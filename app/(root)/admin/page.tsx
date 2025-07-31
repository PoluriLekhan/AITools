"use client";
import { useEffect, useState, useMemo, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_EMAIL_QUERY } from "@/sanity/lib/queries";
import { ALL_AUTHORS_QUERY } from "@/sanity/lib/queries";
import { ALL_AITOOLS_ADMIN_QUERY } from "@/sanity/lib/queries";
import { 
  toggleUserAdmin, 
  deleteUser, 
  deleteAiTool, 
  updateAiTool, 
  updateAiToolStatus,
  updateBlogStatus,
  deleteBlog
} from "@/lib/actions";
import axios from "axios";
import { useSession } from "next-auth/react";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

// Lazy load components
const AdminLoading = lazy(() => import("@/components/admin/AdminLoading"));
const AdminAccessDenied = lazy(() => import("@/components/admin/AdminAccessDenied"));
const AdminHeader = lazy(() => import("@/components/admin/AdminHeader"));
const AdminSection = lazy(() => import("@/components/admin/AdminSection"));
const AdminTable = lazy(() => import("@/components/admin/AdminTable"));
const AdminButton = lazy(() => import("@/components/admin/AdminButton"));

// Types
type User = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role?: string;
  plan?: string;
};

type AiTool = {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  subCategory: string;
  toolWebsiteURL: string;
  toolImage: string;
  pitch: string;
  types: string[];
  status: string;
  views?: number;
  likes?: number;
  autoIncrementViews?: boolean;
  autoIncrementLikes?: boolean;
  author?: { name: string };
};

type Blog = {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  category: string;
  accessType: string;
  status: string;
  author?: { name: string };
  aiToolLink: string;
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { data: session } = useSession();
  
  // State management
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [aiTools, setAiTools] = useState<AiTool[]>([]);
  const [aiToolsLoading, setAiToolsLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [usefulWebsites, setUsefulWebsites] = useState<any[]>([]);
  const [usefulWebsitesLoading, setUsefulWebsitesLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");
  const [usersWithPurchases, setUsersWithPurchases] = useState<any[]>([]);
  const [usersWithPurchasesLoading, setUsersWithPurchasesLoading] = useState(true);
  const [authorFetchError, setAuthorFetchError] = useState<string | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        try {
          const author = await client.fetch(AUTHOR_BY_EMAIL_QUERY, { email: user.email });
          const isAdminUser = !!author?.isAdmin;
          setIsAdmin(isAdminUser);
        } catch (err) {
          setAuthorFetchError(String(err));
        }
      }
      setChecked(true);
    };
    
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  // Redirect if not admin
  useEffect(() => {
    if (checked && !isAdmin) {
      router.replace("/");
    }
  }, [checked, isAdmin, router]);

  // Fetch data when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAiTools();
      fetchBlogs();
      fetchUsefulWebsites();
      fetchPayments();
      fetchUsersWithPurchases();
    }
  }, [isAdmin]);

  // Data fetching functions
  const fetchUsers = async () => {
    try {
      const data = await client.fetch(ALL_AUTHORS_QUERY);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAiTools = async () => {
    try {
      const data = await client.fetch(ALL_AITOOLS_ADMIN_QUERY);
      setAiTools(data);
    } catch (error) {
      console.error('Error fetching AI tools:', error);
    } finally {
      setAiToolsLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const data = await client.fetch(`*[_type == "blog"]{ _id, title, content, coverImage, category, accessType, status, aiToolLink, author->{name} }`);
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const fetchUsefulWebsites = async () => {
    try {
      const data = await client.fetch(`*[_type == "usefulWebsite"] | order(_createdAt desc) {
        _id, title, description, category, websiteURL, websiteImage, pitch, status, isApproved, views, likes,
        autoIncrementViews, autoIncrementLikes, author -> { _id, name, email }
      }`);
      setUsefulWebsites(data);
    } catch (error) {
      console.error('Error fetching useful websites:', error);
    } finally {
      setUsefulWebsitesLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    setPaymentsError("");
    try {
      const { data } = await axios.get("/api/payment-status", { withCredentials: true, timeout: 15000 });
      setPayments(data.payments || []);
    } catch (err) {
      setPayments([]);
      setPaymentsError("Failed to load payments. Please check your connection or server logs.");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchUsersWithPurchases = async () => {
    setUsersWithPurchasesLoading(true);
    try {
      const { data } = await axios.get("/api/admin/users-with-purchases");
      setUsersWithPurchases(data.users || []);
    } catch (err) {
      setUsersWithPurchases([]);
    } finally {
      setUsersWithPurchasesLoading(false);
    }
  };

  // Action handlers
  const handleToggleAdmin = async (userId: string, current: boolean) => {
    const result = await toggleUserAdmin(userId, current);
    if (result.success) {
      setUsers(users => users.map(u => u._id === userId ? { ...u, isAdmin: !current } : u));
    } else {
      alert("Failed to toggle admin status");
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userEmail === user?.email) {
      alert("You cannot delete yourself.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    
    const result = await deleteUser(userId);
    if (result && result.success) {
      setUsers(users => users.filter(u => u._id !== userId));
      alert("User deleted successfully.");
    } else {
      alert("Failed to delete user.");
    }
  };

  const handleApproveAiTool = async (aiToolId: string) => {
    const result = await updateAiToolStatus(aiToolId, "approved");
    if (result.success) {
      setAiTools(aiTools => aiTools.map(a => a._id === aiToolId ? { ...a, status: "approved" } : a));
    }
  };

  const handleRejectAiTool = async (aiToolId: string) => {
    const result = await updateAiToolStatus(aiToolId, "rejected");
    if (result.success) {
      setAiTools(aiTools => aiTools.map(a => a._id === aiToolId ? { ...a, status: "rejected" } : a));
    }
  };

  const handleDeleteAiTool = async (aiToolId: string) => {
    if (!window.confirm("Are you sure you want to delete this AI Tool? This cannot be undone.")) return;
    
    const result = await deleteAiTool(aiToolId);
    if (result.success) {
      setAiTools(aiTools => aiTools.filter(a => a._id !== aiToolId));
      alert("AI Tool deleted successfully.");
    } else {
      alert("Failed to delete AI Tool.");
    }
  };

  const handleApproveBlog = async (blogId: string) => {
    const result = await updateBlogStatus(blogId, "approved");
    if (result.success) {
      setBlogs(blogs => blogs.map(b => b._id === blogId ? { ...b, status: "approved" } : b));
    }
  };

  const handleRejectBlog = async (blogId: string) => {
    const result = await updateBlogStatus(blogId, "rejected");
    if (result.success) {
      setBlogs(blogs => blogs.map(b => b._id === blogId ? { ...b, status: "rejected" } : b));
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to delete this blog? This cannot be undone.")) return;
    
    const result = await deleteBlog(blogId);
    if (result.success) {
      setBlogs(blogs => blogs.filter(b => b._id !== blogId));
      alert("Blog deleted successfully.");
    } else {
      alert("Failed to delete blog.");
    }
  };

  const handleApproveUsefulWebsite = async (websiteId: string) => {
    try {
      const response = await fetch("/api/admin/manage-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: websiteId,
          action: "update",
          documentType: "usefulWebsite",
          updates: { isApproved: true, status: "approved" },
          adminEmail: user?.email,
        }),
      });
      if (response.ok) {
        setUsefulWebsites(usefulWebsites => usefulWebsites.map(w => w._id === websiteId ? { ...w, isApproved: true, status: "approved" } : w));
      } else {
        alert("Failed to approve useful website.");
      }
    } catch (error) {
      console.error("Error approving useful website:", error);
      alert("Failed to approve useful website.");
    }
  };

  const handleRejectUsefulWebsite = async (websiteId: string) => {
    try {
      const response = await fetch("/api/admin/manage-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: websiteId,
          action: "updateStatus",
          status: "rejected",
          documentType: "usefulWebsite",
          adminEmail: user?.email
        }),
      });
      if (response.ok) {
        setUsefulWebsites(usefulWebsites => usefulWebsites.map(w => w._id === websiteId ? { ...w, status: "rejected" } : w));
      } else {
        alert("Failed to reject useful website.");
      }
    } catch (error) {
      console.error("Error rejecting useful website:", error);
      alert("Failed to reject useful website.");
    }
  };

  const handleDeleteUsefulWebsite = async (websiteId: string) => {
    if (!window.confirm("Are you sure you want to delete this useful website? This cannot be undone.")) return;
    
    try {
      const response = await fetch("/api/admin/manage-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: websiteId,
          action: "delete",
          documentType: "usefulWebsite",
          adminEmail: user?.email
        }),
      });
      if (response.ok) {
        setUsefulWebsites(usefulWebsites => usefulWebsites.filter(w => w._id !== websiteId));
        alert("Useful website deleted successfully.");
      } else {
        alert("Failed to delete useful website.");
      }
    } catch (error) {
      console.error("Error deleting useful website:", error);
      alert("Failed to delete useful website.");
    }
  };

  // Utility functions
  const statusBadge = (status: string) => {
    let color = "bg-gray-400";
    if (status === "pending") color = "bg-yellow-400";
    if (status === "approved") color = "bg-green-500";
    if (status === "rejected") color = "bg-red-500";
    return <span className={`px-2 py-1 rounded text-white text-xs ${color}`}>{status}</span>;
  };

  // Loading state
  if (loading || !checked) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminLoading />
      </Suspense>
    );
  }

  // Error state
  if (authorFetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          <strong>Error fetching author from Sanity:</strong><br />
          {authorFetchError}
        </div>
      </div>
    );
  }

  // Access denied state
  if (!isAdmin) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminAccessDenied userEmail={user?.email} />
      </Suspense>
    );
  }

  // Filtered data
  const pendingAiTools = aiTools.filter(tool => tool.status === 'pending');
  const approvedAiTools = aiTools.filter(tool => tool.status === 'approved');
  const pendingBlogs = blogs.filter(blog => blog.status === 'pending');
  const pendingUsefulWebsites = usefulWebsites.filter(website => website.isApproved === false);
  const approvedUsefulWebsites = usefulWebsites.filter(website => website.status === 'approved');

  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div>Loading header...</div>}>
          <AdminHeader userEmail={user?.email || ''} />
        </Suspense>
        
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
          {/* Users Section */}
          <Suspense fallback={<div>Loading users section...</div>}>
            <AdminSection title="All Users" loading={usersLoading}>
              <AdminTable headers={["Name", "Email", "Plan", "Admin", "Actions"]}>
                {users.map(u => (
                  <tr key={u._id} className="border-t hover:bg-blue-50 transition-colors">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.plan ? u.plan.charAt(0).toUpperCase() + u.plan.slice(1) : "Free"}</td>
                    <td className="p-3">{u.isAdmin ? "Yes" : "No"}</td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <AdminButton
                        onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                        variant="primary"
                        size="sm"
                      >
                        {u.isAdmin ? "Revoke Admin" : "Make Admin"}
                      </AdminButton>
                      <AdminButton
                        onClick={() => handleDeleteUser(u._id, u.email)}
                        variant="danger"
                        size="sm"
                      >
                        Delete
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </AdminTable>
            </AdminSection>
          </Suspense>

          {/* Payment History Section */}
          <Suspense fallback={<div>Loading payments section...</div>}>
            <AdminSection title="User Payment History" loading={paymentsLoading}>
              {paymentsError ? (
                <div className="text-red-600 font-semibold mb-2">{paymentsError}</div>
              ) : payments.length === 0 ? (
                <div className="text-gray-500">No payments found.</div>
              ) : (
                <AdminTable headers={["User", "Email", "Plan", "Status", "Amount", "Date"]}>
                  {payments.map((p, idx) => (
                    <tr key={idx} className="border-t hover:bg-purple-50 transition-colors">
                      <td className="p-3">{p.user?.name || "-"}</td>
                      <td className="p-3">{p.user?.email || "-"}</td>
                      <td className="p-3">{p.plan ? p.plan.charAt(0).toUpperCase() + p.plan.slice(1) : "-"}</td>
                      <td className="p-3">{p.status}</td>
                      <td className="p-3">{p.amount ? `₹${(p.amount / 100).toFixed(2)}` : "-"}</td>
                      <td className="p-3">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminSection>
          </Suspense>

          {/* User Subscriptions Section */}
          <Suspense fallback={<div>Loading subscriptions section...</div>}>
            <AdminSection title="User Subscriptions & Purchases" loading={usersWithPurchasesLoading}>
              {usersWithPurchases.length === 0 ? (
                <div className="text-gray-500">No users found.</div>
              ) : (
                <AdminTable headers={["Name", "Email", "Current Plan", "Purchase History"]}>
                  {usersWithPurchases.map((u, idx) => (
                    <tr key={u.id} className="border-t hover:bg-purple-50 transition-colors">
                      <td className="p-3 font-semibold">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.currentPlan}</td>
                      <td className="p-3">
                        {u.purchaseHistory.length === 0 ? (
                          <span className="text-gray-400">No purchases</span>
                        ) : (
                          <div className="space-y-1">
                            {u.purchaseHistory.map((ph: any, i: number) => (
                              <div key={ph.id || i} className="border-b last:border-b-0 pb-1 mb-1 last:mb-0 last:pb-0">
                                <span className="font-medium text-blue-700">{ph.plan}</span>
                                <span className="mx-2 text-gray-500">|</span>
                                <span className="text-green-700">₹{ph.amount}</span>
                                <span className="mx-2 text-gray-500">|</span>
                                <span className="text-gray-600">{ph.date ? new Date(ph.date).toLocaleString() : "-"}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminSection>
          </Suspense>

          {/* Pending AI Tools Section */}
          <Suspense fallback={<div>Loading AI tools section...</div>}>
            <AdminSection title="Pending AI Tools" loading={aiToolsLoading}>
              {pendingAiTools.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No pending AI Tools.</div>
              ) : (
                <AdminTable headers={["Title", "Category", "Author", "Status", "Actions"]}>
                  {pendingAiTools.map(tool => (
                    <tr key={tool._id} className="border-t hover:bg-blue-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-blue-700">{tool.title}</div>
                        <div className="text-gray-600 text-xs line-clamp-2">{tool.description}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(tool.types))?.slice(0, 2).map(type => (
                            <span key={type} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{type}</span>
                          ))}
                          {tool.types && tool.types.length > 2 && (
                            <span className="text-gray-500 text-xs">+{tool.types.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{tool.author?.name || "Unknown"}</td>
                      <td className="p-3">{statusBadge(tool.status)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <AdminButton
                            onClick={() => handleApproveAiTool(tool._id)}
                            variant="success"
                            size="sm"
                          >
                            Approve
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleRejectAiTool(tool._id)}
                            variant="danger"
                            size="sm"
                          >
                            Reject
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleDeleteAiTool(tool._id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminSection>
          </Suspense>

          {/* Approved AI Tools Section */}
          <Suspense fallback={<div>Loading approved AI tools section...</div>}>
            <AdminSection title="Approved AI Tools" loading={aiToolsLoading}>
              {approvedAiTools.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No approved AI Tools.</div>
              ) : (
                <AdminTable headers={["Title", "Category", "Author", "Status", "Actions"]}>
                  {approvedAiTools.map(tool => (
                    <tr key={tool._id} className="border-t hover:bg-green-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-green-700">{tool.title}</div>
                        <div className="text-gray-600 text-xs line-clamp-2">{tool.description}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(tool.types))?.slice(0, 2).map(type => (
                            <span key={type} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{type}</span>
                          ))}
                          {tool.types && tool.types.length > 2 && (
                            <span className="text-gray-500 text-xs">+{tool.types.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{tool.author?.name || "Unknown"}</td>
                      <td className="p-3">{statusBadge(tool.status)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <AdminButton
                            onClick={() => handleRejectAiTool(tool._id)}
                            variant="warning"
                            size="sm"
                          >
                            Reject
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleDeleteAiTool(tool._id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminSection>
          </Suspense>

          {/* Pending Useful Websites Section */}
          <Suspense fallback={<div>Loading useful websites section...</div>}>
            <AdminSection title="Pending Useful Websites" loading={usefulWebsitesLoading}>
              {pendingUsefulWebsites.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No pending useful websites.</div>
              ) : (
                <AdminTable headers={["Title", "Category", "URL", "Author", "Status", "Actions"]}>
                  {pendingUsefulWebsites.map(website => (
                    <tr key={website._id} className="border-t hover:bg-yellow-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-yellow-700">{website.title}</div>
                        <div className="text-gray-600 text-xs line-clamp-2">{website.description?.slice(0, 100)}...</div>
                      </td>
                      <td className="p-3 text-sm">{website.category}</td>
                      <td className="p-3">
                        <a href={website.websiteURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate block max-w-32">
                          {website.websiteURL}
                        </a>
                      </td>
                      <td className="p-3 text-sm">{website.author?.name || "Unknown"}</td>
                      <td className="p-3">{statusBadge(website.status)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <AdminButton
                            onClick={() => handleApproveUsefulWebsite(website._id)}
                            variant="success"
                            size="sm"
                          >
                            Approve
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleRejectUsefulWebsite(website._id)}
                            variant="danger"
                            size="sm"
                          >
                            Reject
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleDeleteUsefulWebsite(website._id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminSection>
          </Suspense>

          {/* Approved Useful Websites Section */}
          <Suspense fallback={<div>Loading approved useful websites section...</div>}>
            <AdminSection title="Approved Useful Websites" loading={usefulWebsitesLoading}>
              {approvedUsefulWebsites.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No approved useful websites.</div>
              ) : (
                <AdminTable headers={["Title", "Category", "URL", "Author", "Status", "Actions"]}>
                  {approvedUsefulWebsites.map(website => (
                    <tr key={website._id} className="border-t hover:bg-green-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-green-700">{website.title}</div>
                        <div className="text-gray-600 text-xs line-clamp-2">{website.description?.slice(0, 100)}...</div>
                      </td>
                      <td className="p-3 text-sm">{website.category}</td>
                      <td className="p-3">
                        <a href={website.websiteURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate block max-w-32">
                          {website.websiteURL}
                        </a>
                      </td>
                      <td className="p-3 text-sm">{website.author?.name || "Unknown"}</td>
                      <td className="p-3">{statusBadge(website.status)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <AdminButton
                            onClick={() => handleRejectUsefulWebsite(website._id)}
                            variant="warning"
                            size="sm"
                          >
                            Reject
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleDeleteUsefulWebsite(website._id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminSection>
          </Suspense>

          {/* Pending Blogs Section */}
          <Suspense fallback={<div>Loading blogs section...</div>}>
            <AdminSection title="Pending Blogs" loading={blogsLoading}>
              {pendingBlogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No pending blogs.</div>
              ) : (
                <AdminTable headers={["Title", "Category", "Author", "Status", "Actions"]}>
                  {pendingBlogs.map(blog => (
                    <tr key={blog._id} className="border-t hover:bg-blue-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-blue-700">{blog.title}</div>
                        <div className="text-gray-600 text-xs line-clamp-2">{blog.content?.slice(0, 100)}...</div>
                      </td>
                      <td className="p-3 text-sm">{blog.category}</td>
                      <td className="p-3 text-sm">{blog.author?.name || "Unknown"}</td>
                      <td className="p-3">{statusBadge(blog.status)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <AdminButton
                            onClick={() => handleApproveBlog(blog._id)}
                            variant="success"
                            size="sm"
                          >
                            Approve
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleRejectBlog(blog._id)}
                            variant="danger"
                            size="sm"
                          >
                            Reject
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleDeleteBlog(blog._id)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </AdminSection>
          </Suspense>
        </div>
      </div>
    </div>
    </AdminErrorBoundary>
  );
} 