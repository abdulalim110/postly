function hasLoaded(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}

export function createPrismaRelationQueryStrategy(prisma) {
  return {
    name: "prisma",
    feed: () =>
      prisma.post.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          author: true,
          comments: {
            where: { parentId: null },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            include: {
              author: true,
              replies: {
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
                include: { author: true },
              },
            },
          },
        },
      }),
    user: (username) =>
      prisma.user.findUnique({
        where: { username },
        include: {
          posts: {
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          },
        },
      }),
    postAuthor: (post) =>
      hasLoaded(post, "author")
        ? post.author
        : prisma.user.findUniqueOrThrow({ where: { id: post.authorId } }),
    postComments: (post) =>
      hasLoaded(post, "comments")
        ? post.comments
        : prisma.comment.findMany({
            where: { postId: post.id, parentId: null },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          }),
    commentAuthor: (comment) =>
      hasLoaded(comment, "author")
        ? comment.author
        : prisma.user.findUniqueOrThrow({ where: { id: comment.authorId } }),
    commentReplies: (comment) =>
      hasLoaded(comment, "replies")
        ? comment.replies
        : prisma.comment.findMany({
            where: { parentId: comment.id },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          }),
    userPosts: (user) =>
      hasLoaded(user, "posts")
        ? user.posts
        : prisma.post.findMany({
            where: { authorId: user.id },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          }),
  };
}
