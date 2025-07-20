import { defineQuery } from "next-sanity";

export const AITOOLS_QUERY =
  defineQuery(`*[_type == "aiTool" && status == "approved"] | order(_createdAt desc) {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  likes,
  description,
  category,
  "image": toolImage,
  types,
  toolWebsiteURL,
  status,
  autoIncrementViews,
  autoIncrementLikes,
}`);



export const TOTAL_TOOLS_COUNT_QUERY =
  defineQuery(`count(*[_type == "aiTool" && status == "approved"])`);

export const TOTAL_WEBSITES_COUNT_QUERY =
  defineQuery(`count(*[_type == "usefulWebsite" && status == "approved"])`);

export const SEARCH_AITOOLS_QUERY =
  defineQuery(`*[_type == "aiTool" && status == "approved" && (title match $search || description match $search || category match $search || author->name match $search)] | order(_createdAt desc) {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  likes,
  description,
  category,
  "image": toolImage,
  types,
  toolWebsiteURL,
  status,
}`);

export const SEARCH_BLOGS_QUERY =
  defineQuery(`*[_type == "blog" && status == "approved" && (title match $search || content match $search || category match $search)] | order(_createdAt desc) {
  _id,
  title,
  content,
  coverImage,
  category,
  accessType,
  aiToolLink,
  _createdAt,
  author -> {
    _id,
    name,
    image,
    bio
  }
}`);

export const SEARCH_ALL_QUERY =
  defineQuery(`{
    "aiTools": *[_type == "aiTool" && status == "approved" && (title match $search || description match $search || category match $search || author->name match $search)] | order(_createdAt desc) {
      _id, 
      title, 
      _createdAt,
      author -> {
        _id, name, image, bio
      }, 
      views,
      likes,
      description,
      category,
      "image": toolImage,
      types,
      toolWebsiteURL,
      status,
      _type
    },
    "blogs": *[_type == "blog" && status == "approved" && (title match $search || content match $search || category match $search)] | order(_createdAt desc) {
      _id,
      title,
      content,
      coverImage,
      category,
      accessType,
      aiToolLink,
      _createdAt,
      author -> {
        _id,
        name,
        image,
        bio
      },
      _type
    }
  }`);

export const AITOOL_BY_ID_QUERY =
  defineQuery(`*[_type == "aiTool" && _id == $id][0]{
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, name, username, image, bio
  }, 
  views,
  likes,
  description,
  category,
  "image": toolImage,
  types,
  toolWebsiteURL,
  pitch,
}`);

export const AITOOL_VIEWS_QUERY = defineQuery(`
    *[_type == "aiTool" && _id == $id][0]{
        _id, views, likes
    }
`);

export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`
*[_type == "author" && id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
}
`);

export const AUTHOR_BY_ID_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
}
`);

export const AUTHOR_BY_EMAIL_QUERY = defineQuery(`
*[_type == "author" && email == $email][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio,
    isAdmin,
    role
}
`);

export const AITOOLS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "aiTool" && author._ref == $id] | order(_createdAt desc) {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  "image": toolImage,
  types,
  toolWebsiteURL,
  status,
}`);

export const USEFUL_WEBSITES_QUERY =
  defineQuery(`*[_type == "usefulWebsite" && status == "approved"] | order(_createdAt desc) {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  likes,
  description,
  category,
  "image": websiteImage,
  websiteURL,
  status,
  autoIncrementViews,
  autoIncrementLikes,
}`);



export const USEFUL_WEBSITES_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "usefulWebsite" && author._ref == $id] | order(_createdAt desc) {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  "image": websiteImage,
  websiteURL,
  status,
}`);

export const PLAYLIST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "playlist" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  select[]->{
    _id,
    _createdAt,
    title,
    slug,
    author->{
      _id,
      name,
      slug,
      image,
      bio
    },
    views,
    description,
    category,
    image,
    pitch
  }
}`);

export const ALL_AUTHORS_QUERY = defineQuery(`
*[_type == "author"]{
  _id,
  id,
  name,
  username,
  email,
  image,
  bio,
  isAdmin,
  role
}
`);

export const ALL_BLOGS_QUERY = `*[_type == "blog" && status == "approved"]{ _id, title, content, coverImage, category, accessType, aiToolLink }`;

// Query for admin dashboard - shows all AI tools regardless of status
export const ALL_AITOOLS_ADMIN_QUERY = defineQuery(`
*[_type == "aiTool"] | order(_createdAt desc) {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  likes,
  description,
  category,
  subCategory,
  "image": toolImage,
  types,
  toolWebsiteURL,
  status,
  pitch,
  isTrending,
  trendingOrder,
  autoIncrementViews,
  autoIncrementLikes,
}
`);

// Notification queries
export const NOTIFICATIONS_BY_USER_QUERY = defineQuery(`
*[_type == "notification" && isActive == true] {
  _id,
  title,
  content,
  type,
  _createdAt,
  expiresAt,
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
}
`);

export const UNSEEN_NOTIFICATIONS_COUNT_QUERY = defineQuery(`
count(*[_type == "notification" && isActive == true && 
  (userStatuses[userEmail == $userEmail && seen == false] || 
   !defined(userStatuses[userEmail == $userEmail]))
])
`);

export const ALL_NOTIFICATIONS_ADMIN_QUERY = defineQuery(`
*[_type == "notification"] | order(_createdAt desc) {
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
}
`);
