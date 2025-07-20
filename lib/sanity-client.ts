import { client } from "@/sanity/lib/client";
import {
  AITOOLS_QUERY,
  AITOOL_BY_ID_QUERY,
  AITOOL_VIEWS_QUERY,
  SEARCH_ALL_QUERY,
  NOTIFICATIONS_BY_USER_QUERY,
  UNSEEN_NOTIFICATIONS_COUNT_QUERY,
  AITOOLS_BY_AUTHOR_QUERY,
  AUTHOR_BY_EMAIL_QUERY,
  ALL_BLOGS_QUERY,
  USEFUL_WEBSITES_BY_AUTHOR_QUERY,
} from "@/sanity/lib/queries";

// Reusable function to fetch AI tools
export async function fetchAITools() {
  try {
    const aiTools = await client.fetch(AITOOLS_QUERY);
    return { success: true, data: aiTools };
  } catch (error) {
    console.error("Error fetching AI tools:", error);
    return { success: false, error: "Failed to fetch AI tools" };
  }
}

// Fetch AI tool by ID
export async function fetchAIToolById(id: string) {
  try {
    const aiTool = await client.fetch(AITOOL_BY_ID_QUERY, { id });
    return { success: true, data: aiTool };
  } catch (error) {
    console.error("Error fetching AI tool:", error);
    return { success: false, error: "Failed to fetch AI tool" };
  }
}

// Fetch AI tool views and likes
export async function fetchAIToolViews(id: string) {
  try {
    const data = await client.fetch(AITOOL_VIEWS_QUERY, { id });
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching AI tool views:", error);
    return { success: false, error: "Failed to fetch AI tool views" };
  }
}

// Search across AI tools and blogs
export async function searchAll(searchTerm: string) {
  try {
    const results = await client.fetch(SEARCH_ALL_QUERY, { search: `*${searchTerm}*` });
    return { success: true, data: results };
  } catch (error) {
    console.error("Error searching:", error);
    return { success: false, error: "Failed to search" };
  }
}

// Fetch notifications for a user
export async function fetchUserNotifications(userEmail: string) {
  try {
    const notifications = await client.fetch(NOTIFICATIONS_BY_USER_QUERY);
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

// Fetch unseen notifications count
export async function fetchUnseenNotificationsCount(userEmail: string) {
  try {
    const count = await client.fetch(UNSEEN_NOTIFICATIONS_COUNT_QUERY, { userEmail });
    return { success: true, data: count };
  } catch (error) {
    console.error("Error fetching unseen notifications count:", error);
    return { success: false, error: "Failed to fetch unseen notifications count" };
  }
}

// Fetch AI tools by author
export async function fetchAIToolsByAuthor(authorId: string) {
  try {
    const aiTools = await client.fetch(AITOOLS_BY_AUTHOR_QUERY, { id: authorId });
    return { success: true, data: aiTools };
  } catch (error) {
    console.error("Error fetching AI tools by author:", error);
    return { success: false, error: "Failed to fetch AI tools by author" };
  }
}

// Fetch author by email
export async function fetchAuthorByEmail(email: string) {
  try {
    const author = await client.fetch(AUTHOR_BY_EMAIL_QUERY, { email });
    if (!author) {
      console.warn(`No author found for email: ${email}`);
      return { success: false, error: "Author not found" };
    }
    return { success: true, data: author };
  } catch (error) {
    console.error("Error fetching author:", error);
    return { success: false, error: "Failed to fetch author" };
  }
}

// Fetch all blogs
export async function fetchAllBlogs() {
  try {
    const blogs = await client.fetch(ALL_BLOGS_QUERY);
    return { success: true, data: blogs };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { success: false, error: "Failed to fetch blogs" };
  }
}

// Fetch pending blogs count
export async function fetchPendingBlogsCount() {
  try {
    const count = await client.fetch(`count(*[_type == "blog" && status == "pending"])`);
    return { success: true, data: count };
  } catch (error) {
    console.error("Error fetching pending blogs count:", error);
    return { success: false, error: "Failed to fetch pending blogs count" };
  }
}

// Fetch all AI tool titles and URLs for duplicate checking
export async function fetchAIToolTitlesAndURLs() {
  try {
    const aiTools = await client.fetch(`*[_type == "aiTool"]{title, toolWebsiteURL}`);
    return { success: true, data: aiTools };
  } catch (error) {
    console.error("Error fetching AI tool titles and URLs:", error);
    return { success: false, error: "Failed to fetch AI tool titles and URLs" };
  }
}

// Fetch useful websites by author
export async function fetchUsefulWebsitesByAuthor(authorId: string) {
  try {
    const websites = await client.fetch(USEFUL_WEBSITES_BY_AUTHOR_QUERY, { id: authorId });
    return { success: true, data: websites };
  } catch (error) {
    console.error("Error fetching useful websites by author:", error);
    return { success: false, error: "Failed to fetch useful websites by author" };
  }
} 