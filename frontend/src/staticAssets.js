export const POST_IMAGES = [
  {
    key: "coffee",
    label: "Kopi",
    alt: "Secangkir latte di atas meja kayu",
    src: "/images/posts/post-coffee.webp",
  },
  {
    key: "workspace",
    label: "Workspace",
    alt: "Laptop dan buku catatan di meja kerja",
    src: "/images/posts/post-workspace.webp",
  },
  {
    key: "city",
    label: "Kota",
    alt: "Pemandangan kota saat matahari terbenam",
    src: "/images/posts/post-city.webp",
  },
  {
    key: "code",
    label: "Kode",
    alt: "Editor kode pada layar laptop",
    src: "/images/posts/post-code.webp",
  },
  {
    key: "mountain",
    label: "Gunung",
    alt: "Gunung dan danau yang tenang",
    src: "/images/posts/post-mountain.webp",
  },
];

export const AVATARS = [
  { key: "alex", label: "Alex", src: "/images/avatars/avatar-alex.webp" },
  { key: "emily", label: "Emily", src: "/images/avatars/avatar-emily.webp" },
  { key: "james", label: "James", src: "/images/avatars/avatar-james.webp" },
  { key: "sarah", label: "Sarah", src: "/images/avatars/avatar-sarah.webp" },
];

export function getPostImage(imageKey) {
  return POST_IMAGES.find((image) => image.key === imageKey) ?? POST_IMAGES[0];
}

export function getAvatar(avatarKey) {
  return AVATARS.find((avatar) => avatar.key === avatarKey) ?? AVATARS[0];
}
