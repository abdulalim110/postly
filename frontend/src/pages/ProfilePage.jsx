import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import { formatRelativeTime } from "../format.js";
import { PROFILE_QUERY } from "../graphql.js";
import { getRequestErrorMessage } from "../requestError.js";
import { getAvatar, getPostImage } from "../staticAssets.js";
import { StatusPanel } from "../components/StatusPanel.jsx";

export function ProfilePage() {
  const { username } = useParams();
  const { data, loading, error, refetch } = useQuery(PROFILE_QUERY, {
    variables: { username },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });
  const profile = data?.user ?? null;
  const initialLoading = loading && !data;

  if (initialLoading) {
    return (
      <main className="page-shell profile-shell">
        <StatusPanel
          kind="loading"
          title="Memuat profil"
          message="Menyiapkan profil dan post pengguna."
        />
      </main>
    );
  }
  if (error && !data) {
    return (
      <main className="page-shell profile-shell">
        <StatusPanel
          kind="error"
          title="Profil belum dapat dimuat"
          message={getRequestErrorMessage(error)}
          actionLabel="Coba lagi"
          onAction={() => void refetch()}
        />
      </main>
    );
  }
  if (!profile) {
    return (
      <main className="page-shell profile-shell">
        <StatusPanel
          title="Pengguna tidak ditemukan"
          message={`Tidak ada profil untuk @${username}.`}
        />
      </main>
    );
  }

  return (
    <main className="page-shell profile-shell">
      <section className="profile-card">
        <img
          className="profile-avatar"
          src={getAvatar(profile.avatarKey).src}
          alt={`Avatar ${profile.name}`}
          decoding="async"
        />
        <div>
          <h1>{profile.name}</h1>
          <p className="profile-username">@{profile.username}</p>
          <p className="profile-bio">{profile.bio}</p>
        </div>
      </section>

      <section className="profile-posts">
        <h2>Post {profile.name.split(" ")[0]}</h2>
        {profile.posts.length ? (
          <div className="profile-grid">
            {profile.posts.map((post) => {
              const image = getPostImage(post.imageKey);
              return (
                <article key={post.id} className="profile-post-card">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p>{post.caption}</p>
                    <time dateTime={post.createdAt}>
                      {formatRelativeTime(post.createdAt)}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <StatusPanel
            compact
            title="Belum ada post"
            message={`@${profile.username} belum membagikan momen.`}
          />
        )}
      </section>
    </main>
  );
}
