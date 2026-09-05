export const POST_IMAGE_KEYS = Object.freeze([
  "coffee",
  "workspace",
  "city",
  "code",
  "mountain",
]);

const postImageKeySet = new Set(POST_IMAGE_KEYS);

export function isAllowedPostImageKey(imageKey) {
  return postImageKeySet.has(imageKey);
}
