"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils";
import slugify from "slugify";
import { writeClient } from "@/sanity/lib/write-client";
import { AUTHOR_BY_EMAIL_QUERY } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "@/sanity/lib/queries";

interface PitchActionState {
  error: string;
  status: string;
  _id?: string;
}
export const createAiTool = async (
  state: PitchActionState,
  form: FormData,
  pitch: string,
  user: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null }
) => {
  if (!user?.uid) {
    return parseServerActionResponse({
      error: "User not authenticated",
      status: "ERROR",
    });
  }

  const { title, description, category, website, thumbnail } = Object.fromEntries(
    Array.from(form.entries()).filter(([key]) => key !== "pitch")
  );
  // Get types as array
  const types = form.getAll("types[]");
  // Use the first type as subCategory
  const subCategory = types.length > 0 ? types[0] as string : "";

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    // First, ensure the user exists in Sanity
    const existingUser = await client
      .withConfig({ useCdn: false })
      .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: user.uid });
    
    let authorId = existingUser?._id;
    
    // If user doesn't exist, we need to create them first
    if (!existingUser) {
      const newUser = await writeClient.create({
        _type: "author",
        id: user.uid,
        name: user.displayName || "Unknown User",
        username: user.email?.split("@")[0] || user.uid,
        email: user.email || "",
        image: user.photoURL || "",
        bio: "",
        isAdmin: false,
        role: "user",
      });
      authorId = newUser._id;
    }

    // Backend duplicate check
    const allTools = await client.fetch(`*[_type == 'aiTool']{title, toolWebsiteURL}`);
    const newTitle = (title as string)?.trim().toLowerCase();
    const newURL = (website as string)?.trim().toLowerCase();
    const duplicate = allTools.find((tool: any) =>
      (tool.title && tool.title.trim().toLowerCase() === newTitle) ||
      (tool.toolWebsiteURL && tool.toolWebsiteURL.trim().toLowerCase() === newURL)
    );
    if (duplicate) {
      return parseServerActionResponse({
        error: `This AI tool already exists with the same name or URL.\nTool already exists: ${duplicate.title} – ${duplicate.toolWebsiteURL}`,
        status: "ERROR",
      });
    }

    // Always set status to 'pending' on submission
    const status = "pending";

    const aiTool = {
      title,
      description,
      category,
      subCategory,
      toolWebsiteURL: website,
      toolImage: thumbnail,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: authorId,
      },
      pitch,
      status,
      types,
    };

    const result = await writeClient.create({ _type: "aiTool", ...aiTool });
    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR",
    });
  }
};

export const syncFirebaseUserToSanity = async (firebaseUser: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}) => {
  if (!firebaseUser.email) return null;
  const existingUser = await client
    .withConfig({ useCdn: false })
    .fetch(AUTHOR_BY_EMAIL_QUERY, { email: firebaseUser.email });
  if (existingUser) return existingUser;
  // Set admin email(s) here
  const adminEmails = ["lekhan2009visit@gmail.com"]; // Replace with your Gmail
  let role = "user";
  if (adminEmails.includes(firebaseUser.email)) role = "admin";
  const isAdmin = role === "admin";
  const newUser = await writeClient.create({
    _type: "author",
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email,
    username: firebaseUser.email?.split("@") [0] || firebaseUser.uid,
    email: firebaseUser.email,
    image: firebaseUser.photoURL,
    bio: "",
    isAdmin,
    role,
  });
  return newUser;
};

// Function to update existing user's role to admin
export const updateUserToAdmin = async (email: string) => {
  try {
    const existingUser = await client
      .withConfig({ useCdn: false })
      .fetch(AUTHOR_BY_EMAIL_QUERY, { email });
    
    if (!existingUser) {
      console.log("User not found:", email);
      return { success: false, error: "User not found" };
    }

    // Set admin email(s) here (same as above)
    const adminEmails = ["lekhan2009visit@gmail.com"];
    
    let role = "user";
    if (adminEmails.includes(email)) role = "admin";
    
    const isAdmin = role === "admin";

    // Update the user's role and admin status
    const updatedUser = await writeClient
      .patch(existingUser._id)
      .set({ 
        isAdmin, 
        role 
      })
      .commit();

    console.log("User updated successfully:", updatedUser);
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

// Admin actions
export const toggleUserAdmin = async (userId: string, current: boolean) => {
  try {
    await writeClient.patch(userId).set({ isAdmin: !current }).commit();
    return { success: true };
  } catch (error) {
    console.error("Error toggling admin status:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export async function deleteUser(userId: string) {
  try {
    await writeClient.delete(userId);
  } catch (error: any) {
    if (
      error?.details?.type === "mutationError" &&
      error?.details?.items?.[0]?.error?.type === "documentHasExistingReferencesError"
    ) {
      return {
        success: false,
        error: "REFERENCED",
        message: "Cannot delete user: This user is still referenced by other content. Please remove or reassign those references first.",
        referencingIDs: error.details.items[0].error.referencingIDs,
      };
    }
    return { success: false, error: "GENERIC", message: "Failed to delete user." };
  }
}

export const deleteAiTool = async (aiToolId: string) => {
  try {
    await writeClient.delete(aiToolId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting AI tool:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export const updateAiTool = async (aiToolId: string, updates: {
  title?: string;
  description?: string;
  coverImage?: string;
  category?: string;
  subCategory?: string;
  toolWebsiteURL?: string;
  toolImage?: string;
  pitch?: string;
  types?: string[];
}) => {
  try {
    // Map the field names to match Sanity schema
    const sanityUpdates: any = {};
    if (updates.title) sanityUpdates.title = updates.title;
    if (updates.description) sanityUpdates.description = updates.description;
    if (updates.category) sanityUpdates.category = updates.category;
    if (updates.subCategory) sanityUpdates.subCategory = updates.subCategory;
    if (updates.toolWebsiteURL) sanityUpdates.toolWebsiteURL = updates.toolWebsiteURL;
    if (updates.toolImage) sanityUpdates.toolImage = updates.toolImage;
    if (updates.pitch) sanityUpdates.pitch = updates.pitch;
    if (updates.types) sanityUpdates.types = updates.types;
    
    await writeClient.patch(aiToolId).set(sanityUpdates).commit();
    return { success: true };
  } catch (error) {
    console.error("Error updating AI tool:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export const updateAiToolStatus = async (aiToolId: string, status: "pending" | "approved" | "rejected") => {
  try {
    await writeClient.patch(aiToolId).set({ status }).commit();
    return { success: true };
  } catch (error) {
    console.error("Error updating AI tool status:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export const updateBlogStatus = async (blogId: string, status: "pending" | "approved" | "rejected") => {
  try {
    await writeClient.patch(blogId).set({ status }).commit();
    return { success: true };
  } catch (error) {
    console.error("Error updating blog status:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export const deleteBlog = async (blogId: string) => {
  try {
    await writeClient.delete(blogId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

// Notification actions
export const createNotification = async (
  title: string,
  content: string,
  type: string,
  sentByUserId: string,
  allUsers: Array<{ _id: string; email: string }>
) => {
  try {
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create user statuses for all users
    const userStatuses = allUsers.map(user => ({
      userId: user._id,
      userEmail: user.email,
      seen: false,
      deleted: false,
    }));

    const notification = {
      _type: "notification",
      title,
      content,
      type,
      sentBy: {
        _type: "reference",
        _ref: sentByUserId,
      },
      userStatuses,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    };

    const result = await writeClient.create(notification);
    return { success: true, notificationId: result._id };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export const markNotificationAsSeen = async (notificationId: string, userEmail: string) => {
  try {
    const notification = await client.fetch(
      `*[_type == "notification" && _id == $notificationId][0]`,
      { notificationId }
    );

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    // Update or add user status
    const updatedUserStatuses = [...(notification.userStatuses || [])];
    const existingUserIndex = updatedUserStatuses.findIndex(
      (status: any) => status.userEmail === userEmail
    );

    if (existingUserIndex >= 0) {
      updatedUserStatuses[existingUserIndex] = {
        ...updatedUserStatuses[existingUserIndex],
        seen: true,
        seenAt: new Date().toISOString(),
      };
    } else {
      updatedUserStatuses.push({
        userEmail,
        seen: true,
        seenAt: new Date().toISOString(),
        deleted: false,
      });
    }

    await writeClient
      .patch(notificationId)
      .set({ userStatuses: updatedUserStatuses })
      .commit();

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    await writeClient.delete(notificationId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export const cleanupExpiredNotifications = async () => {
  try {
    const now = new Date().toISOString();
    const expiredNotifications = await client.fetch(
      `*[_type == "notification" && expiresAt < $now]`,
      { now }
    );

    for (const notification of expiredNotifications) {
      await writeClient.delete(notification._id);
    }

    return { success: true, deletedCount: expiredNotifications.length };
  } catch (error) {
    console.error("Error cleaning up expired notifications:", error);
    return { success: false, error: JSON.stringify(error) };
  }
};

export async function createBlogPost(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const accessType = formData.get("accessType") as string;
    const aiToolLink = formData.get("aiToolLink") as string;

    if (!title || !content || !category) {
      throw new Error("Missing required fields");
    }

    const doc = {
      _type: "blog",
      title,
      content,
      category,
      accessType: accessType || "public",
      aiToolLink: aiToolLink || null,
      publishedAt: new Date().toISOString(),
    };

    const result = await writeClient.create(doc);
    return { success: true, id: result._id };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return { success: false, error: "Failed to create blog post" };
  }
}
