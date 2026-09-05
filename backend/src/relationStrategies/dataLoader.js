import DataLoader from "dataloader";
import {
  findPostsByAuthorIds,
  findRepliesByParentIds,
  findTopLevelCommentsByPostIds,
  findUsersByIds,
} from "./batchQueries.js";

export function createDataLoaderStrategy(prisma) {
  const usersById = new DataLoader((userIds) =>
    findUsersByIds(prisma, userIds),
  );
  const commentsByPostId = new DataLoader((postIds) =>
    findTopLevelCommentsByPostIds(prisma, postIds),
  );
  const repliesByParentId = new DataLoader((parentIds) =>
    findRepliesByParentIds(prisma, parentIds),
  );
  const postsByAuthorId = new DataLoader((authorIds) =>
    findPostsByAuthorIds(prisma, authorIds),
  );

  return {
    name: "dataloader",
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
