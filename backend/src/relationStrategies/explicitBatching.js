import {
  findPostsByAuthorIds,
  findRepliesByParentIds,
  findTopLevelCommentsByPostIds,
  findUsersByIds,
} from "./batchQueries.js";
import { createManualBatchLoader } from "./manualBatchLoader.js";

export function createExplicitBatchingStrategy(prisma) {
  const usersById = createManualBatchLoader((userIds) =>
    findUsersByIds(prisma, userIds),
  );
  const commentsByPostId = createManualBatchLoader((postIds) =>
    findTopLevelCommentsByPostIds(prisma, postIds),
  );
  const repliesByParentId = createManualBatchLoader((parentIds) =>
    findRepliesByParentIds(prisma, parentIds),
  );
  const postsByAuthorId = createManualBatchLoader((authorIds) =>
    findPostsByAuthorIds(prisma, authorIds),
  );

  return {
    name: "batch",
    feed: () =>
      prisma.post.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    user: (username) =>
      prisma.user.findUnique({
        where: { username },
      }),
    postAuthor: (post) => usersById.load(post.authorId),
    postComments: (post) => commentsByPostId.load(post.id),
    commentAuthor: (comment) => usersById.load(comment.authorId),
    commentReplies: (comment) => repliesByParentId.load(comment.id),
    userPosts: (user) => postsByAuthorId.load(user.id),
  };
}
