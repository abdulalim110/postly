import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  return secret;
}

export function createAccessToken(user) {
  return jwt.sign(
    { username: user.username },
    getJwtSecret(),
    {
      subject: user.id,
      expiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
    },
  );
}

export function readAccessToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") return null;

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  try {
    const payload = jwt.verify(match[1], getJwtSecret());
    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
      username: typeof payload.username === "string" ? payload.username : null,
    };
  } catch {
    return null;
  }
}

export function requireAuth(context) {
  if (!context.auth?.userId) {
    throw new GraphQLError("Autentikasi diperlukan.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.auth;
}
