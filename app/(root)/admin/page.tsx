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
  const isSuperAdmin = users.find(u => u.email === user?.email)?.role === "super-admin";

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
    if (result.success) {
      setUsers(users => users.filter(u => u._id !== userId));
      alert("User deleted successfully.");
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

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAiTool || !editForm) return;
    
    const result = await updateAiTool(editAiTool._id, {
      title: editForm.title,
      description: editForm.description,
      coverImage: editForm.coverImage,
      category: editForm.category,
      subCategory: editForm.subCategory,
      toolWebsiteURL: editForm.toolWebsiteURL,
      toolImage: editForm.toolImage,
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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">All Users</h2>
        {usersLoading ? (
          <div>Loading users...</div>
        ) : (
          <table className="w-full bg-white rounded shadow text-left">
            <thead>
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Admin</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.isAdmin ? "Yes" : "No"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                      onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                    >
                      {u.isAdmin ? "Revoke Admin" : "Make Admin"}
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDeleteUser(u._id, u.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Pending AI Tools</h2>
        <div className="flex gap-2 mb-2">
          <input
            className="border p-1 rounded"
            placeholder="Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="border p-1 rounded" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {[...new Set(aiTools.map(a => a.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select className="border p-1 rounded" value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)}>
            <option value="">All Authors</option>
            {[...new Set(aiTools.map(a => a.author?.name).filter(Boolean))].map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {selectedRequests.length > 0 && (
            <>
              <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={handleBulkApprove}>Bulk Approve</button>
              <button className="px-2 py-1 bg-gray-600 text-white rounded" onClick={handleBulkReject}>Bulk Reject</button>
            </>
          )}
        </div>
        {aiToolsLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full bg-white rounded shadow text-left">
            <thead>
              <tr>
                <th className="p-2"></th>
                <th className="p-2">Title</th>
                <th className="p-2">Author</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAiTools.filter(a => a.status === "pending").map(a => (
                <tr key={a._id} className="border-t">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedRequests.includes(a._id)} onChange={() => handleSelectRequest(a._id)} />
                  </td>
                  <td className="p-2 cursor-pointer underline" onClick={() => setDetailsAiTool(a)}>{a.title}</td>
                  <td className="p-2">{a.author?.name || "-"}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2">{statusBadge(a.status)}</td>
                  <td className="p-2 flex gap-2">
                    <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => handleApproveAiTool(a._id)}>Approve</button>
                    <button className="px-2 py-1 bg-gray-600 text-white rounded" onClick={() => handleRejectAiTool(a._id)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Approved AI Tools</h2>
        {aiToolsLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full bg-white rounded shadow text-left">
            <thead>
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Author</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAiTools.filter(a => a.status === "approved").map(a => (
                <tr key={a._id} className="border-t">
                  <td className="p-2 cursor-pointer underline" onClick={() => setDetailsAiTool(a)}>{a.title}</td>
                  <td className="p-2">{a.author?.name || "-"}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2">{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Rejected AI Tools</h2>
        {aiToolsLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full bg-white rounded shadow text-left">
            <thead>
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Author</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAiTools.filter(a => a.status === "rejected").map(a => (
                <tr key={a._id} className="border-t">
                  <td className="p-2 cursor-pointer underline" onClick={() => setDetailsAiTool(a)}>{a.title}</td>
                  <td className="p-2">{a.author?.name || "-"}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2">{statusBadge(a.status)}</td>
                  <td className="p-2 flex gap-2">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => handleApproveAiTool(a._id)}>Restore</button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleDeleteAiTool(a._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Edit AI Tools</h2>
        {aiToolsLoading ? (
          <div>Loading AI Tools...</div>
        ) : (
          <table className="w-full bg-white rounded shadow text-left">
            <thead>
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Author</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {aiTools.map(a => (
                <tr key={a._id} className="border-t">
                  <td className="p-2">{a.title}</td>
                  <td className="p-2">{a.author?.name || "-"}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2">{statusBadge(a.status)}</td>
                  <td className="p-2 flex gap-2 flex-wrap">
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                      onClick={() => handleEditAiTool(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDeleteAiTool(a._id)}
                    >
                      Delete
                    </button>
                    {(isAdmin || isSuperAdmin) && a.status === "pending" && (
                      <>
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded"
                          onClick={() => handleApproveAiTool(a._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-2 py-1 bg-gray-600 text-white rounded"
                          onClick={() => handleRejectAiTool(a._id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {editAiTool && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form onSubmit={handleEditFormSubmit} className="bg-white p-6 rounded shadow w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4">Edit AI Tool</h3>
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
              <input
                className="w-full p-2 mb-2 border rounded"
                name="toolImage"
                value={editForm?.toolImage || ""}
                onChange={handleEditFormChange}
                placeholder="Tool Image URL"
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
        )}
      </section>
      {detailsAiTool && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{detailsAiTool.title}</h3>
            <p className="mb-2"><b>Author:</b> {detailsAiTool.author?.name || "-"}</p>
            <p className="mb-2"><b>Category:</b> {detailsAiTool.category}</p>
            <p className="mb-2"><b>Status:</b> {statusBadge(detailsAiTool.status)}</p>
            <p className="mb-2"><b>Description:</b></p>
            <div className="mb-2 p-2 border rounded bg-gray-50" style={{ maxHeight: 200, overflow: 'auto' }}>{detailsAiTool.description}</div>
            <button className="px-4 py-2 bg-gray-400 text-white rounded mt-2" onClick={() => setDetailsAiTool(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Notifications Management Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Notifications Management</h2>
          <button
            onClick={() => setShowNotificationForm(!showNotificationForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showNotificationForm ? "Cancel" : "Send New Notification"}
          </button>
        </div>

        {/* Notification Form */}
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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Send Notification
              </button>
            </form>
          </div>
        )}

        {/* Notifications List */}
        {notificationsLoading ? (
          <div>Loading notifications...</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const seenCount = notification.userStatuses.filter(s => s.seen).length;
              const totalUsers = notification.userStatuses.length;
              
              return (
                <div key={notification._id} className="bg-white p-4 rounded-lg shadow">
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
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
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
      </section>
    </div>
  );
} 