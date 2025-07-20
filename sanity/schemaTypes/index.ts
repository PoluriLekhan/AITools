import { type SchemaTypeDefinition } from "sanity";

import { author } from "@/sanity/schemaTypes/author";
import { aiTool } from "@/sanity/schemaTypes/aiTool";
import { playlist } from "@/sanity/schemaTypes/playlist";
import { blog } from "@/sanity/schemaTypes/blog";
import { notification } from "@/sanity/schemaTypes/notification";
import { userLike } from "@/sanity/schemaTypes/userLike";
import { usefulWebsite } from "@/sanity/schemaTypes/usefulWebsite";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [author, aiTool, playlist, blog, notification, userLike, usefulWebsite],
};
