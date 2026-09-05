export const User = {
  posts: (user, _arguments, context) => context.relations.userPosts(user),
  createdAt: (user) => user.createdAt.toISOString(),
};
