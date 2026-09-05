import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import { createAccessToken, requireAuth } from "../auth.js";
import { isAllowedPostImageKey } from "../staticAssets.js";
import {
  normalizeCaption,
  normalizeCommentContent,
  normalizeLoginInput,
  normalizeRegisterInput,
} from "../validation.js";

const PASSWORD_ROUNDS = 12;

function authenticationError() {
  return new GraphQLError("Email, username, atau password salah.", {
    extensions: { code: "UNAUTHENTICATED" },
  });
}

function notFound(message) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}

function badInput(message) {
  return new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT" },
  });
}

export const Mutation = {
  register: async (_parent, { input }, context) => {
    const normalized = normalizeRegisterInput(input);

    const existingUser = await context.prisma.user.findFirst({
      where: {
        OR: [
          { username: normalized.username },
          { email: normalized.email },
        ],
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new GraphQLError("Email atau username sudah digunakan.", {
        extensions: { code: "CONFLICT" },
      });
    }

    const passwordHash = await bcrypt.hash(
      normalized.password,
      PASSWORD_ROUNDS,
    );

    try {
      const user = await context.prisma.user.create({
        data: {
          name: normalized.name,
          username: normalized.username,
          email: normalized.email,
          passwordHash,
          avatarKey: "alex",
          bio: "Baru bergabung di Postly.",
        },
      });

      return { token: createAccessToken(user), user };
    } catch (error) {
      if (error?.code === "P2002") {
        throw new GraphQLError("Email atau username sudah digunakan.", {
          extensions: { code: "CONFLICT" },
        });
      }
      throw error;
    }
  },

  login: async (_parent, { identifier, password }, context) => {
    const normalized = normalizeLoginInput(identifier, password);
    const user = await context.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalized.identifier },
          { username: normalized.identifier },
        ],
      },
    });

    if (!user || !(await bcrypt.compare(normalized.password, user.passwordHash))) {
      throw authenticationError();
    }

    return { token: createAccessToken(user), user };
  },

  createPost: async (_parent, { caption, imageKey }, context) => {
    const auth = requireAuth(context);
    const normalizedCaption = normalizeCaption(caption);

    if (!isAllowedPostImageKey(imageKey)) {
      throw badInput("Gambar post tidak tersedia pada galeri bawaan.");
    }

    return context.prisma.post.create({
      data: {
        authorId: auth.userId,
        caption: normalizedCaption,
        imageKey,
      },
    });
  },

  createComment: async (
    _parent,
    { postId, parentId = null, content },
    context,
  ) => {
    const auth = requireAuth(context);
    const normalizedContent = normalizeCommentContent(content);

    if (parentId) {
      const parent = await context.prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true, parentId: true },
      });

      if (!parent) throw notFound("Komentar induk tidak ditemukan.");
      if (parent.postId !== postId) {
        throw badInput("Komentar induk harus berasal dari post yang sama.");
      }
      if (parent.parentId) {
        throw badInput("Reply hanya dapat dibuat pada komentar utama.");
      }
    } else {
      const postExists = await context.prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });
      if (!postExists) throw notFound("Post tidak ditemukan.");
    }

    return context.prisma.comment.create({
      data: {
        postId,
        authorId: auth.userId,
        parentId,
        content: normalizedContent,
      },
    });
  },
};
