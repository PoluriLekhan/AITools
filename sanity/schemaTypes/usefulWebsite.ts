import { defineField, defineType } from "sanity";

export const usefulWebsite = defineType({
  name: "usefulWebsite",
  title: "Useful Website",
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
      name: "websiteURL",
      type: "url",
      title: "Website URL",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "pitch",
      type: "text",
      title: "Pitch",
      description: "Detailed description of the useful website",
    }),
    defineField({
      name: "views",
      type: "number",
      title: "Views",
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