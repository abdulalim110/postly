export const Post = {
  author: (post, _arguments, context) => context.relations.postAuthor(post),
  comments: (post, _arguments, context) =>
    context.relations.postComments(post),
  createdAt: (post) => post.createdAt.toISOString(),
};
