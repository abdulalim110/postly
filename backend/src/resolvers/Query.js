import { requireAuth } from "../auth.js";
import { normalizeUsername } from "../validation.js";

export const Query = {
  health: () => "ok",
  feed: (_parent, _arguments, context) => context.relations.feed(),
  user: (_parent, { username }, context) =>
    context.relations.user(normalizeUsername(username)),
  me: async (_parent, _arguments, context) => {
    const auth = requireAuth(context);
    return context.prisma.user.findUniqueOrThrow({
      where: { id: auth.userId },
    });
  },
};
