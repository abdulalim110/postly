export const Comment = {
  author: (comment, _arguments, context) =>
    context.relations.commentAuthor(comment),
  replies: (comment, _arguments, context) =>
    context.relations.commentReplies(comment),
  createdAt: (comment) => comment.createdAt.toISOString(),
};
