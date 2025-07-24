import { defineField, defineType } from "sanity";

export const aiTool = defineType({
  name: "aiTool",
  title: "AI Tool",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "subCategory",
      type: "string",
      title: "Type",
      description: "The type of AI tool (e.g., Free, Paid, Credit, etc.)",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "types",
      title: "Types",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Free", value: "Free" },
          { title: "Paid", value: "Paid" },
          { title: "Credit-Based", value: "Credit-Based" },
        ],
        layout: "tags"
      },
      validation: Rule => Rule.required().min(1).error("Select at least one type"),
    }),
    defineField({
      name: "toolImage",
      type: "url",
      title: "Tool Image URL",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "toolWebsiteURL",
      type: "url",
      title: "Tool Website URL",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "pitch",
      type: "text",
      title: "Pitch",
      description: "Detailed description of the AI tool",
    }),
    defineField({
      name: "views",
      type: "number",
      title: "Views",
      initialValue: 0,
    }),
    defineField({
      name: "autoIncrementViews",
      type: "boolean",
      title: "Auto Increment Views",
      description: "Automatically increment views when tool is viewed",
      initialValue: true,
    }),
    defineField({
      name: "likes",
      type: "number",
      title: "Likes",
      initialValue: 0,
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      validation: Rule => Rule.required(),
    }),
  ],
});
