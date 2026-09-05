import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Comment } from "./resolvers/Comment.js";
import { Mutation } from "./resolvers/Mutation.js";
import { Post } from "./resolvers/Post.js";
import { Query } from "./resolvers/Query.js";
import { User } from "./resolvers/User.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const typeDefs = fs.readFileSync(
  path.join(currentDirectory, "schema.graphql"),
  "utf8",
);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: { Comment, Mutation, Post, Query, User },
});
