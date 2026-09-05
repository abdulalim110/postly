import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";

const SEED_PASSWORD = "PostlyDemo123!";
const PASSWORD_ROUNDS = 12;

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60_000);
}

const users = [
  {
    id: "seed-user-alex",
    name: "Alex Morgan",
    username: "alex.morgan",
    email: "alex@postly.local",
    avatarKey: "alex",
    bio: "Membangun produk kecil yang berguna.",
  },
  {
    id: "seed-user-emily",
    name: "Emily Chen",
    username: "emily.chen",
    email: "emily@postly.local",
    avatarKey: "emily",
    bio: "Berbagi momen sederhana.",
  },
  {
    id: "seed-user-james",
    name: "James Kim",
    username: "james.kim",
    email: "james@postly.local",
    avatarKey: "james",
    bio: "Kode, kopi, dan catatan dari perjalanan.",
  },
  {
    id: "seed-user-sarah",
    name: "Sarah Miller",
    username: "sarah.miller",
    email: "sarah@postly.local",
    avatarKey: "sarah",
    bio: "Menemukan cerita di tengah kesibukan kota.",
  },
];

const posts = [
  {
    id: "seed-post-01",
    authorId: "seed-user-emily",
    caption: "Bersyukur untuk pemandangan setenang ini.",
    imageKey: "mountain",
    createdAt: minutesAgo(95),
  },
  {
    id: "seed-post-02",
    authorId: "seed-user-alex",
    caption: "Mulai pagi dengan kopi dan satu target yang jelas.",
    imageKey: "coffee",
    createdAt: minutesAgo(170),
  },
  {
    id: "seed-post-03",
    authorId: "seed-user-james",
    caption: "Refactor kecil hari ini, lebih mudah dibaca besok.",
    imageKey: "code",
    createdAt: minutesAgo(360),
  },
  {
    id: "seed-post-04",
    authorId: "seed-user-sarah",
    caption: "Kota selalu punya warna berbeda menjelang malam.",
    imageKey: "city",
    createdAt: minutesAgo(540),
  },
  {
    id: "seed-post-05",
    authorId: "seed-user-emily",
    caption: "Meja rapi, pikiran ikut lega.",
    imageKey: "workspace",
    createdAt: minutesAgo(1_120),
  },
  {
    id: "seed-post-06",
    authorId: "seed-user-alex",
    caption: "Menutup hari sambil melihat kota bergerak.",
    imageKey: "city",
    createdAt: minutesAgo(1_440),
  },
  {
    id: "seed-post-07",
    authorId: "seed-user-james",
    caption: "Teman debugging terbaik malam ini.",
    imageKey: "coffee",
    createdAt: minutesAgo(2_100),
  },
  {
    id: "seed-post-08",
    authorId: "seed-user-sarah",
    caption: "Pemandangan yang membuat langkah terasa ringan.",
    imageKey: "mountain",
    createdAt: minutesAgo(2_880),
  },
];

const comments = [
  {
    id: "seed-comment-01",
    postId: "seed-post-01",
    authorId: "seed-user-james",
    content: "Indah sekali! Ini di mana?",
    createdAt: minutesAgo(80),
  },
  {
    id: "seed-comment-02",
    postId: "seed-post-01",
    authorId: "seed-user-sarah",
    content: "Masuk daftar perjalanan saya!",
    createdAt: minutesAgo(70),
  },
  {
    id: "seed-comment-03",
    postId: "seed-post-02",
    authorId: "seed-user-emily",
    content: "Target pagi ini apa?",
    createdAt: minutesAgo(150),
  },
  {
    id: "seed-comment-04",
    postId: "seed-post-02",
    authorId: "seed-user-sarah",
    content: "Latte art-nya rapi banget.",
    createdAt: minutesAgo(140),
  },
  {
    id: "seed-comment-05",
    postId: "seed-post-03",
    authorId: "seed-user-alex",
    content: "Perubahan kecil yang dampaknya panjang.",
    createdAt: minutesAgo(320),
  },
  {
    id: "seed-comment-06",
    postId: "seed-post-03",
    authorId: "seed-user-emily",
    content: "Bagian mana yang paling terbantu?",
    createdAt: minutesAgo(300),
  },
  {
    id: "seed-comment-07",
    postId: "seed-post-04",
    authorId: "seed-user-james",
    content: "Cahayanya bagus sekali.",
    createdAt: minutesAgo(500),
  },
  {
    id: "seed-comment-08",
    postId: "seed-post-04",
    authorId: "seed-user-alex",
    content: "Kota mana pun terasa tenang dari atas.",
    createdAt: minutesAgo(490),
  },
  {
    id: "seed-comment-09",
    postId: "seed-post-05",
    authorId: "seed-user-sarah",
    content: "Setup minimal memang paling nyaman.",
    createdAt: minutesAgo(1_050),
  },
  {
    id: "seed-comment-10",
    postId: "seed-post-05",
    authorId: "seed-user-alex",
    content: "Tanamannya bikin meja terasa hidup.",
    createdAt: minutesAgo(1_030),
  },
  {
    id: "seed-comment-11",
    postId: "seed-post-06",
    authorId: "seed-user-emily",
    content: "Bagus untuk jeda setelah kerja.",
    createdAt: minutesAgo(1_360),
  },
  {
    id: "seed-comment-12",
    postId: "seed-post-06",
    authorId: "seed-user-james",
    content: "Langitnya pas sekali.",
    createdAt: minutesAgo(1_340),
  },
  {
    id: "seed-comment-13",
    postId: "seed-post-07",
    authorId: "seed-user-sarah",
    content: "Semoga bug-nya cepat ketemu.",
    createdAt: minutesAgo(2_000),
  },
  {
    id: "seed-comment-14",
    postId: "seed-post-07",
    authorId: "seed-user-emily",
    content: "Jangan lupa istirahat juga.",
    createdAt: minutesAgo(1_980),
  },
  {
    id: "seed-comment-15",
    postId: "seed-post-08",
    authorId: "seed-user-alex",
    content: "Udara paginya pasti segar.",
    createdAt: minutesAgo(2_760),
  },
  {
    id: "seed-comment-16",
    postId: "seed-post-08",
    authorId: "seed-user-james",
    content: "Refleksi danaunya keren.",
    createdAt: minutesAgo(2_700),
  },
];

const replies = [
  {
    id: "seed-reply-01",
    postId: "seed-post-01",
    authorId: "seed-user-emily",
    parentId: "seed-comment-01",
    content: "Di Banff. Tempatnya luar biasa.",
    createdAt: minutesAgo(75),
  },
  {
    id: "seed-reply-02",
    postId: "seed-post-02",
    authorId: "seed-user-alex",
    parentId: "seed-comment-03",
    content: "Merapikan flow auth dulu.",
    createdAt: minutesAgo(145),
  },
  {
    id: "seed-reply-03",
    postId: "seed-post-03",
    authorId: "seed-user-james",
    parentId: "seed-comment-06",
    content: "Resolver-nya sekarang lebih mudah diikuti.",
    createdAt: minutesAgo(295),
  },
  {
    id: "seed-reply-04",
    postId: "seed-post-04",
    authorId: "seed-user-sarah",
    parentId: "seed-comment-07",
    content: "Kebetulan datang tepat sebelum matahari turun.",
    createdAt: minutesAgo(495),
  },
  {
    id: "seed-reply-05",
    postId: "seed-post-05",
    authorId: "seed-user-emily",
    parentId: "seed-comment-09",
    content: "Lebih sedikit barang, lebih mudah fokus.",
    createdAt: minutesAgo(1_040),
  },
  {
    id: "seed-reply-06",
    postId: "seed-post-07",
    authorId: "seed-user-james",
    parentId: "seed-comment-13",
    content: "Sudah ketemu. Ternyata kondisi edge case.",
    createdAt: minutesAgo(1_995),
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, PASSWORD_ROUNDS);

  await prisma.comment.deleteMany({
    where: { id: { startsWith: "seed-" } },
  });
  await prisma.post.deleteMany({
    where: { id: { startsWith: "seed-" } },
  });

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { ...user, passwordHash },
      create: { ...user, passwordHash },
    });
  }

  await prisma.post.createMany({ data: posts });
  await prisma.comment.createMany({ data: comments });
  await prisma.comment.createMany({ data: replies });

  const [userCount, postCount, commentCount] = await Promise.all([
    prisma.user.count({ where: { id: { startsWith: "seed-" } } }),
    prisma.post.count({ where: { id: { startsWith: "seed-" } } }),
    prisma.comment.count({ where: { id: { startsWith: "seed-" } } }),
  ]);

  console.log(
    `Seed complete: ${userCount} users, ${postCount} posts, ${commentCount} comments/replies.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
