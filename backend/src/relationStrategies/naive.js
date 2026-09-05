export function createNaiveStrategy(prisma) {
  return {
    name: "naive",
    feed: () =>
      prisma.post.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    user: (username) =>
      prisma.user.findUnique({
        where: { username },
      }),
    postAuthor: (post) =>
      prisma.user.findUniqueOrThrow({ where: { id: post.authorId } }),
    postComments: (post) =>
      prisma.comment.findMany({
        where: { postId: post.id, parentId: null },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
    commentAuthor: (comment) =>
      prisma.user.findUniqueOrThrow({ where: { id: comment.authorId } }),
    commentReplies: (comment) =>
      prisma.comment.findMany({
        where: { parentId: comment.id },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
    userPosts: (user) =>
      prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
  };
}
