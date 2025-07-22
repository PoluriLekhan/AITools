import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "id",
      type: "number",
    }),
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "username",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "url",
    }),
    defineField({
      name: "bio",
      type: "text",
    }),
    defineField({
      name: "plan",
      title: "Plan",
      type: "string",
      options: {
        list: [
          { title: "Free", value: "free" },
          { title: "Basic", value: "basic" },
          { title: "Premium", value: "premium" },
        ],
      },
      initialValue: "free",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "User", value: "user" },
          { title: "Admin", value: "admin" },
          { title: "Super Admin", value: "super-admin" },
        ],
      },
      initialValue: "user",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isAdmin",
      title: "Is Admin",
      type: "boolean",
      initialValue: false,
      description: "Set to true for admin users.",
    }),
  ],
  preview: {
    select: {
      title: "name",
    },
  },
});
