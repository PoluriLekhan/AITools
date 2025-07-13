import { defineField, defineType } from "sanity";
import { BellIcon } from "lucide-react";

export const notification = defineType({
  name: "notification",
  title: "Notification",
  type: "document",
  icon: BellIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "content",
      type: "text",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Notification Type",
      type: "string",
      options: {
        list: [
          { title: "General", value: "general" },
          { title: "Important", value: "important" },
          { title: "Update", value: "update" },
          { title: "Announcement", value: "announcement" },
        ],
      },
      initialValue: "general",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "sentBy",
      title: "Sent By",
      type: "reference",
      to: [{ type: "author" }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "userStatuses",
      title: "User Statuses",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "userId",
              type: "string",
              title: "User ID",
            },
            {
              name: "userEmail",
              type: "string",
              title: "User Email",
            },
            {
              name: "seen",
              type: "boolean",
              title: "Seen",
              initialValue: false,
            },
            {
              name: "seenAt",
              type: "datetime",
              title: "Seen At",
            },
            {
              name: "deleted",
              type: "boolean",
              title: "Deleted",
              initialValue: false,
            },
            {
              name: "deletedAt",
              type: "datetime",
              title: "Deleted At",
            },
          ],
        },
      ],
      description: "Track seen/unseen status for each user",
    }),
    defineField({
      name: "expiresAt",
      title: "Expires At",
      type: "datetime",
      description: "When this notification should be automatically deleted (24 hours after creation)",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
      description: "Whether this notification is still active",
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      sentBy: "sentBy.name",
    },
    prepare(selection) {
      const { title, type, sentBy } = selection;
      return {
        title: title,
        subtitle: `${type} • Sent by ${sentBy || "Unknown"}`,
      };
    },
  },
}); 