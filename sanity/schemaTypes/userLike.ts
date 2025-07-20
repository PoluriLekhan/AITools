import { defineField, defineType } from "sanity";

export const userLike = defineType({
  name: "userLike",
  title: "User Like",
  type: "document",
  fields: [
    defineField({
      name: "userId",
      type: "string",
      title: "User ID",
      description: "Firebase user ID",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "userEmail",
      type: "string",
      title: "User Email",
      description: "User's email address",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "aiToolId",
      type: "reference",
      to: [{ type: "aiTool" }],
      title: "AI Tool",
      description: "The AI tool that was liked",
    }),
    defineField({
      name: "usefulWebsiteId",
      type: "reference",
      to: [{ type: "usefulWebsite" }],
      title: "Useful Website",
      description: "The useful website that was liked",
    }),
    defineField({
      name: "likedAt",
      type: "datetime",
      title: "Liked At",
      description: "When the user liked the tool",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "userEmail",
      subtitle: "aiToolId.title",
      media: "aiToolId.toolImage",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      return {
        title: title || "Unknown User",
        subtitle: subtitle || "Unknown Item",
        media: media,
      };
    },
  },
}); 