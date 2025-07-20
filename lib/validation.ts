import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20).max(500),
  category: z.string().min(2).max(50),
  website: z.string().url({ message: "Must be a valid website URL" }),
  thumbnail: z
    .string()
    .url({ message: "Must be a valid image URL" })
    .refine((url) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url), {
      message: "URL must end with a valid image extension (jpg, png, gif, webp, svg)",
    })
    .optional(),
  pitch: z.string().min(10),
  types: z.array(z.string()).min(1, "Select at least one type"),
});
