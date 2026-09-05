function groupBy(items, keyOf) {
  const groups = new Map();

  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return groups;
}

export async function findUsersByIds(prisma, userIds) {
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
  });
  const usersById = new Map(users.map((user) => [user.id, user]));

  return userIds.map(
    (userId) =>
      usersById.get(userId) ?? new Error(`User ${userId} was not found.`),
  );
}

export async function findTopLevelCommentsByPostIds(prisma, postIds) {
  const comments = await prisma.comment.findMany({
    where: {
      postId: { in: [...postIds] },
      parentId: null,
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const commentsByPostId = groupBy(comments, (comment) => comment.postId);

  return postIds.map((postId) => commentsByPostId.get(postId) ?? []);
}

export async function findRepliesByParentIds(prisma, parentIds) {
  const replies = await prisma.comment.findMany({
    where: { parentId: { in: [...parentIds] } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const repliesByParentId = groupBy(replies, (reply) => reply.parentId);

  return parentIds.map((parentId) => repliesByParentId.get(parentId) ?? []);
}

export async function findPostsByAuthorIds(prisma, authorIds) {
  const posts = await prisma.post.findMany({
    where: { authorId: { in: [...authorIds] } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const postsByAuthorId = groupBy(posts, (post) => post.authorId);

  return authorIds.map((authorId) => postsByAuthorId.get(authorId) ?? []);
}
