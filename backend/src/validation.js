import { GraphQLError } from "graphql";

function badInput(message) {
  return new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT" },
  });
}

export function normalizeRegisterInput(input) {
  const name = input.name.trim();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (name.length < 2 || name.length > 80) {
    throw badInput("Nama harus terdiri dari 2–80 karakter.");
  }

  if (!/^[a-z0-9._]{3,24}$/.test(username)) {
    throw badInput(
      "Username harus terdiri dari 3–24 huruf kecil, angka, titik, atau garis bawah.",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badInput("Email tidak valid.");
  }

  if (password.length < 8 || password.length > 72) {
    throw badInput("Password harus terdiri dari 8–72 karakter.");
  }

  return { name, username, email, password };
}

export function normalizeLoginInput(identifier, password) {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (!normalizedIdentifier || !password) {
    throw badInput("Identifier dan password wajib diisi.");
  }

  return { identifier: normalizedIdentifier, password };
}

export function normalizeCaption(caption) {
  const normalizedCaption = caption.trim();

  if (normalizedCaption.length < 1 || normalizedCaption.length > 280) {
    throw badInput("Caption harus terdiri dari 1–280 karakter.");
  }

  return normalizedCaption;
}

export function normalizeCommentContent(content) {
  const normalizedContent = content.trim();

  if (normalizedContent.length < 1 || normalizedContent.length > 500) {
    throw badInput("Komentar harus terdiri dari 1–500 karakter.");
  }

  return normalizedContent;
}

export function normalizeUsername(username) {
  const normalizedUsername = username.trim().toLowerCase();

  if (!/^[a-z0-9._]{3,24}$/.test(normalizedUsername)) {
    throw badInput("Username tidak valid.");
  }

  return normalizedUsername;
}
