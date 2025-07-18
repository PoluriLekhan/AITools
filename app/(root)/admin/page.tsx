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

type Notification = {
  _id: string;
  title: string;
  content: string;
  type: string;
  _createdAt: string;
  expiresAt: string;
  isActive: boolean;
  sentBy: {
    _id: string;
    name: string;
    email: string;
  };
  userStatuses: Array<{
    userId: string;
    userEmail: string;
    seen: boolean;
    seenAt?: string;
    deleted: boolean;
  }>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    content: "",
    type: "general"
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  const [editImageUrlInput, setEditImageUrlInput] = useState<string>("");
  const isSuperAdmin = users.find(u => u.email === user?.email)?.role === "super-admin";
  // Remove activeTab, Tabs, and Card usage
  // Restore original section stacking and layout

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
    const fetchUsers = async () => {
      const data = await client.fetch(ALL_AUTHORS_QUERY);
      setUsers(data);
      setUsersLoading(false);
    };
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    const fetchAiTools = async () => {
      const data = await client.fetch(ALL_AITOOLS_ADMIN_QUERY);
      setAiTools(data);
      setAiToolsLoading(false);
    };
    if (isAdmin) fetchAiTools();
  }, [isAdmin]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const data = await client.fetch(`*[_type == "blog"]{ _id, title, content, coverImage, category, accessType, status, aiToolLink, author->{name} }`);
      setBlogs(data);
      setBlogsLoading(false);
    };
    if (isAdmin) fetchBlogs();
  }, [isAdmin]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await client.fetch(`*[_type == "notification"] | order(_createdAt desc) {
        _id,
        title,
        content,
        type,
        _createdAt,
        expiresAt,
        isActive,
        sentBy -> {
          _id,
          name,
          email
        },
        userStatuses[] {
          userId,
          userEmail,
          seen,
          seenAt,
          deleted,
          deletedAt
        }
      }`);
      setNotifications(data);
      setNotificationsLoading(false);
    };
    if (isAdmin) fetchNotifications();
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

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    const currentUser = users.find(u => u.email === user.email);
    if (!currentUser) return;

    try {
      const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notificationForm.title,
          content: notificationForm.content,
          type: notificationForm.type,
          sentByUserId: currentUser._id,
        }),
      });

      if (response.ok) {
        setNotificationForm({ title: "", content: "", type: "general" });
        setShowNotificationForm(false);
        
        // Refresh notifications
        const data = await client.fetch(`*[_type == "notification"] | order(_createdAt desc) {
          _id,
          title,
          content,
          type,
          _createdAt,
          expiresAt,
          isActive,
          sentBy -> {
            _id,
            name,
            email
          },
          userStatuses[] {
            userId,
            userEmail,
            seen,
            seenAt,
            deleted,
            deletedAt
          }
        }`);
        setNotifications(data);
        
        alert("Notification sent successfully! All users will see a glowing red dot on their notification bell.");
      } else {
        alert("Failed to send notification");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Failed to send notification");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!window.confirm("Are you sure you want to delete this notification? This cannot be undone.")) return;
    
    try {
      const response = await fetch("/api/notifications/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n._id !== notificationId));
        alert("Notification deleted successfully!");
      } else {
        alert("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    }
  };


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
              <div className="flex items-center mb-2">
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
                  className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={selectedRequests.length === 0}
                  onClick={handleBulkApprove}
                >
                  Bulk Approve Selected
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredAiTools.filter(tool => tool.status === 'pending').map(tool => (
                  <div key={tool._id} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col gap-2 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-blue-700 line-clamp-1">{tool.title}</div>
                      {statusBadge(tool.status)}
                    </div>
                    <div className="text-gray-600 line-clamp-2 mb-2">{tool.description}</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Array.from(new Set(tool.types))?.map(type => (
                        <span key={type} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{type}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(tool._id)}
                        onChange={() => handleSelectRequest(tool._id)}
                        className="mr-2"
                      />
                      <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all" onClick={() => handleApproveAiTool(tool._id)}>Approve</button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all" onClick={() => handleRejectAiTool(tool._id)}>Reject</button>
                      <button className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all" onClick={() => handleEditAiTool(tool)}>Edit</button>
                      <button className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all" onClick={() => handleDeleteAiTool(tool._id)}>Delete</button>
                    </div>
                  </div>
                ))}
                {filteredAiTools.filter(tool => tool.status === 'pending').length === 0 && <div className="text-gray-500 col-span-full text-center py-8">No pending AI Tools.</div>}
              </div>
            </>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Approved AI Tools</h2>
          {aiToolsLoading ? (
            <div className="animate-pulse text-gray-500">Loading AI Tools...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredAiTools.filter(tool => tool.status === 'approved').map(tool => (
                <div key={tool._id} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col gap-2 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-blue-700 line-clamp-1">{tool.title}</div>
                    {statusBadge(tool.status)}
                  </div>
                  {/* Tool Image or Placeholder */}
                  <div className="flex justify-center my-2">
                    <img
                      src={tool.toolImage ? tool.toolImage : "/logo.png"}
                      alt={tool.title + " image"}
                      className="w-24 h-24 object-cover rounded border"
                      onError={e => { e.currentTarget.src = "/logo.png"; }}
                    />
                  </div>
                  <div className="text-gray-600 line-clamp-2 mb-2">{tool.description}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Array.from(new Set(tool.types))?.map(type => (
                      <span key={type} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{type}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-all" onClick={() => handleEditAiTool(tool)}>Edit</button>
                    <button className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all" onClick={() => handleDeleteAiTool(tool._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {filteredAiTools.filter(tool => tool.status === 'approved').length === 0 && <div className="text-gray-500 col-span-full text-center py-8">No approved AI Tools.</div>}
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

        {/* Blogs Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Pending Blogs</h2>
          {blogsLoading ? (
            <div className="animate-pulse text-gray-500">Loading blogs...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredBlogs.map(blog => (
                <div key={blog._id} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col gap-2 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-blue-700 line-clamp-1">{blog.title}</div>
                    {statusBadge(blog.status)}
                  </div>
                  <div className="text-gray-600 line-clamp-2 mb-2">{blog.content?.slice(0, 100)}...</div>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all" onClick={() => handleApproveBlog(blog._id)}>Approve</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all" onClick={() => handleRejectBlog(blog._id)}>Reject</button>
                    <button className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-black transition-all" onClick={() => handleDeleteBlog(blog._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {filteredBlogs.length === 0 && <div className="text-gray-500 col-span-full text-center py-8">No pending blogs.</div>}
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-600">Notifications Management</h2>
            <button
              onClick={() => setShowNotificationForm(!showNotificationForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
            >
              {showNotificationForm ? "Cancel" : "Send New Notification"}
            </button>
          </div>
          {showNotificationForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-semibold mb-4">Send Notification to All Users</h3>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={notificationForm.content}
                    onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })}
                    className="w-full p-2 border rounded h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="general">General</option>
                    <option value="important">Important</option>
                    <option value="update">Update</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                >
                  Send Notification
                </button>
              </form>
            </div>
          )}
          {notificationsLoading ? (
            <div className="animate-pulse text-gray-500">Loading notifications...</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const seenCount = notification.userStatuses.filter(s => s.seen).length;
                const totalUsers = notification.userStatuses.length;
                return (
                  <div key={notification._id} className="bg-gray-50 p-4 rounded-lg shadow flex flex-col gap-2 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            notification.type === 'important' ? 'bg-red-100 text-red-800' :
                            notification.type === 'update' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'announcement' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type}
                          </span>
                          {!notification.isActive && (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.content}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Sent by: {notification.sentBy?.name || "Unknown"}</p>
                          <p>Sent: {new Date(notification._createdAt).toLocaleString()}</p>
                          <p>Expires: {new Date(notification.expiresAt).toLocaleString()}</p>
                          <p>Seen by: {seenCount} of {totalUsers} users</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <p className="text-gray-500 text-center py-8">No notifications sent yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 