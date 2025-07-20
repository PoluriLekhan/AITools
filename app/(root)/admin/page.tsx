"use client";
import { useEffect, useState } from "react";
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
  deleteBlog,
  createNotification,
  deleteNotification
} from "@/lib/actions";
import { useRef } from "react";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { writeClient } from "@/sanity/lib/write-client";

// Define types for User and Blog

type User = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role?: string;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [aiTools, setAiTools] = useState<AiTool[]>([]);
  const [aiToolsLoading, setAiToolsLoading] = useState(true);
  const [editAiTool, setEditAiTool] = useState<AiTool | null>(null);
  const [editForm, setEditForm] = useState<Partial<AiTool> | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [detailsAiTool, setDetailsAiTool] = useState<AiTool | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [selectedBlogRequests, setSelectedBlogRequests] = useState<string[]>([]);
  const [usefulWebsites, setUsefulWebsites] = useState<any[]>([]);
  const [usefulWebsitesLoading, setUsefulWebsitesLoading] = useState(true);
  const [selectedUsefulWebsiteRequests, setSelectedUsefulWebsiteRequests] = useState<string[]>([]);
  const [editUsefulWebsite, setEditUsefulWebsite] = useState<any | null>(null);
  const [editUsefulWebsiteForm, setEditUsefulWebsiteForm] = useState<Partial<any>>({});
  const isSuperAdmin = users.find(u => u.email === user?.email)?.role === "super-admin";
  // Remove activeTab, Tabs, and Card usage
  // Restore original section stacking and layout

  const fetchUsers = async () => {
    const data = await client.fetch(ALL_AUTHORS_QUERY);
    setUsers(data);
    setUsersLoading(false);
  };

  const fetchAiTools = async () => {
    const data = await client.fetch(ALL_AITOOLS_ADMIN_QUERY);
    setAiTools(data);
    setAiToolsLoading(false);
  };

  const fetchBlogs = async () => {
    const data = await client.fetch(`*[_type == "blog"]{ _id, title, content, coverImage, category, accessType, status, aiToolLink, author->{name} }`);
    setBlogs(data);
    setBlogsLoading(false);
  };

  const fetchUsefulWebsites = async () => {
    const data = await client.fetch(`*[_type == "usefulWebsite"] | order(_createdAt desc) {
      _id,
      title,
      description,
      category,
      websiteURL,
      websiteImage,
      pitch,
      status,
      views,
      likes,

      autoIncrementViews,
      autoIncrementLikes,
      author -> {
        _id,
        name,
        email
      }
    }`);
    setUsefulWebsites(data);
    setUsefulWebsitesLoading(false);
  };


  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        const author = await client.fetch(AUTHOR_BY_EMAIL_QUERY, { email: user.email });
        setIsAdmin(!!author?.isAdmin);
      }
      setChecked(true);
    };
    if (!loading) checkAdmin();
  }, [user, loading]);

  useEffect(() => {
    if (checked && !isAdmin) router.replace("/");
  }, [checked, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchAiTools();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchBlogs();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchUsefulWebsites();
  }, [isAdmin]);


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
    } else if (result && result.error === "REFERENCED") {
      alert(
        result.message +
        (result.referencingIDs && result.referencingIDs.length
          ? `\nReferencing document IDs: ${result.referencingIDs.join(", ")}`
          : "")
      );
    } else {
      alert("Failed to delete user.");
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

  const handleEditAiTool = (aiTool: AiTool) => {
    setEditAiTool(aiTool);
    setEditForm({ ...aiTool });
    setEditImageFile(null);
    setEditImageUrl("");
    setEditImageUrlInput("");
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === "types") {
      // Handle types as comma-separated string
      const typesArray = e.target.value.split(",").map(t => t.trim()).filter(t => t);
      setEditForm({ ...editForm, [e.target.name]: typesArray });
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };

  // Handle image upload to Sanity for edit modal
  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    // Upload to Sanity
    const formData = new FormData();
    formData.append("file", file);
    formData.append("_type", "image");
    const res = await fetch("/api/sanity-upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.url) setEditImageUrl(data.url);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAiTool || !editForm) return;
    
    const toolImageToUpdate = editImageUrl || editImageUrlInput || editForm.toolImage;

    const result = await updateAiTool(editAiTool._id, {
      title: editForm.title,
      description: editForm.description,
      coverImage: editForm.coverImage,
      category: editForm.category,
      subCategory: editForm.subCategory,
      toolWebsiteURL: editForm.toolWebsiteURL,
      toolImage: toolImageToUpdate,
      pitch: editForm.pitch,
      types: editForm.types,
    });
    
    if (result.success) {
      setAiTools(aiTools => aiTools.map(a => a._id === editAiTool._id ? { ...a, ...editForm } : a));
      setEditAiTool(null);
      setEditForm(null);
      alert("AI Tool updated successfully.");
    } else {
      alert("Failed to update AI Tool.");
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


  const filteredAiTools = useMemo(() => {
    return aiTools.filter(a =>
      (a.title?.toLowerCase().includes(search.toLowerCase()) || !search) &&
      (a.category === filterCategory || !filterCategory) &&
      (a.author?.name === filterAuthor || !filterAuthor)
    );
  }, [aiTools, search, filterCategory, filterAuthor]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b =>
      (b.title?.toLowerCase().includes(search.toLowerCase()) || !search) &&
      (b.category === filterCategory || !filterCategory) &&
      (b.author?.name === filterAuthor || !filterAuthor)
    );
  }, [blogs, search, filterCategory, filterAuthor]);


  const handleSelectRequest = (aiToolId: string) => {
    setSelectedRequests(selected =>
      selected.includes(aiToolId)
        ? selected.filter(id => id !== aiToolId)
        : [...selected, aiToolId]
    );
  };

  const handleBulkApprove = async () => {
    for (const id of selectedRequests) {
      await handleApproveAiTool(id);
    }
    setSelectedRequests([]);
  };
  const handleBulkReject = async () => {
    for (const id of selectedRequests) {
      await handleRejectAiTool(id);
    }
    setSelectedRequests([]);
  };

  const handleSelectBlogRequest = (blogId: string) => {
    setSelectedBlogRequests(selected =>
      selected.includes(blogId)
        ? selected.filter(id => id !== blogId)
        : [...selected, blogId]
    );
  };

  const handleBulkApproveBlogs = async () => {
    for (const id of selectedBlogRequests) {
      await handleApproveBlog(id);
    }
    setSelectedBlogRequests([]);
  };

  const handleBulkRejectBlogs = async () => {
    for (const id of selectedBlogRequests) {
      await handleRejectBlog(id);
    }
    setSelectedBlogRequests([]);
  };

  const handleApproveUsefulWebsite = async (websiteId: string) => {
    try {
      const response = await fetch("/api/admin/manage-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: websiteId,
          action: "updateStatus",
          status: "approved",
          documentType: "usefulWebsite",
          adminEmail: user?.email
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUsefulWebsites(usefulWebsites => usefulWebsites.map(w => w._id === websiteId ? { ...w, status: "approved" } : w));
          alert("Useful website approved successfully");
        } else {
          alert("Failed to approve useful website: " + (result.error || "Unknown error"));
        }
      } else {
        const errorData = await response.json();
        alert("Failed to approve useful website: " + (errorData.error || "Server error"));
      }
    } catch (error) {
      console.error("Error approving useful website:", error);
      alert("Failed to approve useful website");
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
        const result = await response.json();
        if (result.success) {
          setUsefulWebsites(usefulWebsites => usefulWebsites.map(w => w._id === websiteId ? { ...w, status: "rejected" } : w));
          alert("Useful website rejected successfully");
        } else {
          alert("Failed to reject useful website: " + (result.error || "Unknown error"));
        }
      } else {
        const errorData = await response.json();
        alert("Failed to reject useful website: " + (errorData.error || "Server error"));
      }
    } catch (error) {
      console.error("Error rejecting useful website:", error);
      alert("Failed to reject useful website");
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

  const handleEditUsefulWebsite = (website: any) => {
    setEditUsefulWebsite(website);
    setEditUsefulWebsiteForm({ ...website });
  };

  const handleEditUsefulWebsiteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditUsefulWebsiteForm({ ...editUsefulWebsiteForm, [e.target.name]: e.target.value });
  };

  const handleEditUsefulWebsiteFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsefulWebsiteForm || !editUsefulWebsite) return;

    try {
      const response = await fetch("/api/admin/manage-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: editUsefulWebsite._id,
          action: "update",
          documentType: "usefulWebsite",
          updates: {
            title: editUsefulWebsiteForm.title || "",
            description: editUsefulWebsiteForm.description || "",
            category: editUsefulWebsiteForm.category || "",
            websiteURL: editUsefulWebsiteForm.websiteURL || "",
            pitch: editUsefulWebsiteForm.pitch || "",
          },
          adminEmail: user?.email
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUsefulWebsites(websites => websites.map(website => 
          website._id === editUsefulWebsite._id 
            ? { ...website, ...editUsefulWebsiteForm }
            : website
        ));
        setEditUsefulWebsite(null);
        setEditUsefulWebsiteForm({});
        alert("Useful Website updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update Useful Website.");
      }
    } catch (error) {
      console.error("Error updating Useful Website:", error);
      alert("Failed to update Useful Website.");
    }
  };

  const handleSelectUsefulWebsiteRequest = (websiteId: string) => {
    setSelectedUsefulWebsiteRequests(prev => 
      prev.includes(websiteId) 
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const handleBulkApproveUsefulWebsites = async () => {
    if (selectedUsefulWebsiteRequests.length === 0) {
      alert("Please select useful websites to approve.");
      return;
    }
    for (const websiteId of selectedUsefulWebsiteRequests) {
      await handleApproveUsefulWebsite(websiteId);
    }
    setSelectedUsefulWebsiteRequests([]);
  };

  const handleBulkRejectUsefulWebsites = async () => {
    if (selectedUsefulWebsiteRequests.length === 0) {
      alert("Please select useful websites to reject.");
      return;
    }
    for (const websiteId of selectedUsefulWebsiteRequests) {
      await handleRejectUsefulWebsite(websiteId);
    }
    setSelectedUsefulWebsiteRequests([]);
  };


  // Views and likes are now tracked automatically based on user interaction
  // No manual controls needed in admin panel


  const statusBadge = (status: string) => {
    let color = "bg-gray-400";
    if (status === "pending") color = "bg-yellow-400";
    if (status === "approved") color = "bg-green-500";
    if (status === "rejected") color = "bg-red-500";
    return <span className={`px-2 py-1 rounded text-white text-xs ${color}`}>{status}</span>;
  };

  if (loading || !checked) return <div>Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Admin Dashboard</h1>
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <a
          href="/admin/bulk-upload"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 text-center w-full sm:w-auto"
        >
          Bulk Upload AI Tools (CSV)
        </a>
        <button
          onClick={() => {
            setAiToolsLoading(true);
            setUsefulWebsitesLoading(true);
            setBlogsLoading(true);
            setUsersLoading(true);
            // Refetch all data
            fetchAiTools();
            fetchUsefulWebsites();
            fetchBlogs();
            fetchUsers();
          }}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 text-center w-full sm:w-auto"
        >
          Refresh All Data
        </button>
      </div>
      {/* Remove Tabs */}
      <div className="space-y-6">
        {/* Users Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">All Users</h2>
          {usersLoading ? (
            <div className="animate-pulse text-gray-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full bg-white rounded-lg shadow text-left text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Admin</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-t hover:bg-blue-50 transition-colors">
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.isAdmin ? "Yes" : "No"}</td>
                      <td className="p-3 flex flex-wrap gap-2">
                        <button
                          className="px-2 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-all"
                          onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                        >
                          {u.isAdmin ? "Revoke Admin" : "Make Admin"}
                        </button>
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-all"
                          onClick={() => handleDeleteUser(u._id, u.email)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Tools Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-600">Pending AI Tools</h2>
          {aiToolsLoading ? (
            <div className="animate-pulse text-gray-500">Loading AI Tools...</div>
          ) : (
            <>
              <div className="flex items-center mb-4 gap-2">
                <input
                  type="checkbox"
                  id="select-all-pending"
                  checked={filteredAiTools.filter(t => t.status === 'pending').length > 0 && filteredAiTools.filter(t => t.status === 'pending').every(t => selectedRequests.includes(t._id))}
                  ref={el => {
                    if (el) {
                      const valid = filteredAiTools.filter(t => t.status === 'pending');
                      const all = valid.length > 0 && valid.every(t => selectedRequests.includes(t._id));
                      const some = valid.some(t => selectedRequests.includes(t._id));
                      el.indeterminate = some && !all;
                    }
                  }}
                  onChange={e => {
                    const valid = filteredAiTools.filter(t => t.status === 'pending');
                    if (e.target.checked) {
                      setSelectedRequests(prev => Array.from(new Set([...prev, ...valid.map(t => t._id)])));
                    } else {
                      setSelectedRequests(prev => prev.filter(id => !valid.map(t => t._id).includes(id)));
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor="select-all-pending" className="text-sm font-medium">Select All Pending</label>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                  disabled={selectedRequests.length === 0}
                  onClick={handleBulkApprove}
                >
                  Bulk Approve ({selectedRequests.length})
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 font-medium">Select</th>
                      <th className="p-3 font-medium">Title</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">Author</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAiTools.filter(tool => tool.status === 'pending').map(tool => (
                      <tr key={tool._id} className="border-t hover:bg-blue-50 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(tool._id)}
                            onChange={() => handleSelectRequest(tool._id)}
                          />
                        </td>
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
                            <button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all text-xs" onClick={() => handleApproveAiTool(tool._id)}>Approve</button>
                            <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all text-xs" onClick={() => handleRejectAiTool(tool._id)}>Reject</button>
                            <button className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all text-xs" onClick={() => handleEditAiTool(tool)}>Edit</button>
                            <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all text-xs" onClick={() => handleDeleteAiTool(tool._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAiTools.filter(tool => tool.status === 'pending').length === 0 && (
                  <div className="text-gray-500 text-center py-8">No pending AI Tools.</div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Approved AI Tools</h2>
          {aiToolsLoading ? (
            <div className="animate-pulse text-gray-500">Loading AI Tools...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow text-left text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Author</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAiTools.filter(tool => tool.status === 'approved').map(tool => (
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
                          <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all text-xs" onClick={() => handleRejectAiTool(tool._id)}>Reject</button>
                          <button className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all text-xs" onClick={() => handleEditAiTool(tool)}>Edit</button>
                          <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all text-xs" onClick={() => handleDeleteAiTool(tool._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAiTools.filter(tool => tool.status === 'approved').length === 0 && (
                <div className="text-gray-500 text-center py-8">No approved AI Tools.</div>
              )}
            </div>
          )}
        </div>



        {/* Edit AI Tool Modal */}
        {editAiTool && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4">Edit AI Tool</h3>
              <form onSubmit={handleEditFormSubmit}>
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="title"
                  value={editForm?.title || ""}
                  onChange={handleEditFormChange}
                  placeholder="Title"
                  required
                />
                <textarea
                  className="w-full p-2 mb-2 border rounded"
                  name="description"
                  value={editForm?.description || ""}
                  onChange={handleEditFormChange}
                  placeholder="Description"
                  required
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="coverImage"
                  value={editForm?.coverImage || ""}
                  onChange={handleEditFormChange}
                  placeholder="Cover Image URL"
                  required
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="category"
                  value={editForm?.category || ""}
                  onChange={handleEditFormChange}
                  placeholder="Category"
                  required
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="subCategory"
                  value={editForm?.subCategory || ""}
                  onChange={handleEditFormChange}
                  placeholder="Sub-Category"
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="toolWebsiteURL"
                  value={editForm?.toolWebsiteURL || ""}
                  onChange={handleEditFormChange}
                  placeholder="Tool Website URL"
                />
                {/* Tool Image Preview and Edit */}
                <div className="my-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center gap-3">
                  <div className="w-full">
                    <label htmlFor="editToolImageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      id="editToolImageUrl"
                      name="editToolImageUrl"
                      type="url"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      placeholder="https://example.com/image.png"
                      value={editImageUrlInput}
                      onChange={e => setEditImageUrlInput(e.target.value)}
                    />
                  </div>
                  {(editImageUrlInput || editForm?.toolImage) && (
                    <div className="flex justify-center mt-3 w-full">
                      <img
                        src={editImageUrlInput || editForm?.toolImage || "/logo.png"}
                        alt={editForm?.title + " image"}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-sm bg-white"
                        onError={e => { e.currentTarget.src = "/logo.png"; }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2 text-center">Recommended: Square image, at least 256x256px. Supported: JPG, PNG, GIF, WEBP, SVG.</p>
                </div>
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="toolImage"
                  value={editImageUrl || editImageUrlInput || editForm?.toolImage || ""}
                  onChange={handleEditFormChange}
                  placeholder="Tool Image URL"
                  style={{ display: 'none' }}
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="pitch"
                  value={editForm?.pitch || ""}
                  onChange={handleEditFormChange}
                  placeholder="Pitch"
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="types"
                  value={editForm?.types?.join(", ") || ""}
                  onChange={handleEditFormChange}
                  placeholder="Types (comma-separated)"
                />
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                  <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setEditAiTool(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Useful Website Modal */}
        {editUsefulWebsite && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4">Edit Useful Website</h3>
              <form onSubmit={handleEditUsefulWebsiteFormSubmit}>
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="title"
                  value={editUsefulWebsiteForm?.title || ""}
                  onChange={handleEditUsefulWebsiteFormChange}
                  placeholder="Website Title"
                  required
                />
                <textarea
                  className="w-full p-2 mb-2 border rounded"
                  name="description"
                  value={editUsefulWebsiteForm?.description || ""}
                  onChange={handleEditUsefulWebsiteFormChange}
                  placeholder="Description"
                  required
                  rows={3}
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="category"
                  value={editUsefulWebsiteForm?.category || ""}
                  onChange={handleEditUsefulWebsiteFormChange}
                  placeholder="Category"
                  required
                />
                <input
                  className="w-full p-2 mb-2 border rounded"
                  name="websiteURL"
                  value={editUsefulWebsiteForm?.websiteURL || ""}
                  onChange={handleEditUsefulWebsiteFormChange}
                  placeholder="Website URL"
                  required
                />
                <textarea
                  className="w-full p-2 mb-2 border rounded"
                  name="pitch"
                  value={editUsefulWebsiteForm?.pitch || ""}
                  onChange={handleEditUsefulWebsiteFormChange}
                  placeholder="Why is this website useful?"
                  rows={3}
                />
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                  <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setEditUsefulWebsite(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pending Useful Websites Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-600">Pending Useful Websites</h2>
          {usefulWebsitesLoading ? (
            <div className="animate-pulse text-gray-500">Loading useful websites...</div>
          ) : (
            <>
              <div className="flex items-center mb-4 gap-2">
                <input
                  type="text"
                  placeholder="Search useful websites..."
                  className="flex-1 p-2 border rounded"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all text-sm"
                  onClick={handleBulkApproveUsefulWebsites}
                >
                  Bulk Approve ({selectedUsefulWebsiteRequests.length})
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-sm"
                  onClick={handleBulkRejectUsefulWebsites}
                >
                  Bulk Reject ({selectedUsefulWebsiteRequests.length})
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 font-medium">Select</th>
                      <th className="p-3 font-medium">Title</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">URL</th>
                      <th className="p-3 font-medium">Author</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usefulWebsites
                      .filter(website => 
                        website.status === 'pending' &&
                        (website.title.toLowerCase().includes(search.toLowerCase()) ||
                        website.description.toLowerCase().includes(search.toLowerCase()) ||
                        website.category.toLowerCase().includes(search.toLowerCase()))
                      )
                      .map(website => (
                        <tr key={website._id} className="border-t hover:bg-yellow-50 transition-colors">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedUsefulWebsiteRequests.includes(website._id)}
                              onChange={() => handleSelectUsefulWebsiteRequest(website._id)}
                            />
                          </td>
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
                              <button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all text-xs" onClick={() => handleApproveUsefulWebsite(website._id)}>Approve</button>
                              <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all text-xs" onClick={() => handleRejectUsefulWebsite(website._id)}>Reject</button>
                              <button className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all text-xs" onClick={() => handleEditUsefulWebsite(website)}>Edit</button>
                              <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all text-xs" onClick={() => handleDeleteUsefulWebsite(website._id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {usefulWebsites.filter(website => 
                  website.status === 'pending' &&
                  (website.title.toLowerCase().includes(search.toLowerCase()) ||
                  website.description.toLowerCase().includes(search.toLowerCase()) ||
                  website.category.toLowerCase().includes(search.toLowerCase()))
                ).length === 0 && (
                  <div className="text-gray-500 text-center py-8">No pending useful websites.</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Approved Useful Websites Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Approved Useful Websites</h2>
          {usefulWebsitesLoading ? (
            <div className="animate-pulse text-gray-500">Loading useful websites...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow text-left text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">URL</th>
                    <th className="p-3 font-medium">Author</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usefulWebsites
                    .filter(website => 
                      website.status === 'approved' &&
                      (website.title.toLowerCase().includes(search.toLowerCase()) ||
                      website.description.toLowerCase().includes(search.toLowerCase()) ||
                      website.category.toLowerCase().includes(search.toLowerCase()))
                    )
                    .map(website => (
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
                            <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all text-xs" onClick={() => handleRejectUsefulWebsite(website._id)}>Reject</button>
                            <button className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all text-xs" onClick={() => handleEditUsefulWebsite(website)}>Edit</button>
                            <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all text-xs" onClick={() => handleDeleteUsefulWebsite(website._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {usefulWebsites.filter(website => 
                website.status === 'approved' &&
                (website.title.toLowerCase().includes(search.toLowerCase()) ||
                website.description.toLowerCase().includes(search.toLowerCase()) ||
                website.category.toLowerCase().includes(search.toLowerCase()))
              ).length === 0 && (
                <div className="text-gray-500 text-center py-8">No approved useful websites.</div>
              )}
            </div>
          )}
        </div>

        {/* Blogs Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Pending Blogs</h2>
          {blogsLoading ? (
            <div className="animate-pulse text-gray-500">Loading blogs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow text-left text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Author</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map(blog => (
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
                          <button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all text-xs" onClick={() => handleApproveBlog(blog._id)}>Approve</button>
                          <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all text-xs" onClick={() => handleRejectBlog(blog._id)}>Reject</button>
                          <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all text-xs" onClick={() => handleDeleteBlog(blog._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBlogs.length === 0 && (
                <div className="text-gray-500 text-center py-8">No pending blogs.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 