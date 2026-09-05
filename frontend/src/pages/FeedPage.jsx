import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { useLocation, useNavigate } from "react-router-dom";
import { PostCard } from "../components/PostCard.jsx";
import { FeedSkeleton, StatusPanel } from "../components/StatusPanel.jsx";
import { FEED_QUERY } from "../graphql.js";
import { getRequestErrorMessage } from "../requestError.js";

export function FeedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(FEED_QUERY, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });
  const posts = data?.feed ?? [];
  const initialLoading = loading && !data;

  useEffect(() => {
    if (!location.state?.notice) return;
    const timeout = window.setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null });
    }, 4200);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, location.state?.notice, navigate]);

  return (
    <main className="page-shell feed-shell">
      <h1 className="sr-only">Feed publik Postly</h1>

      {location.state?.notice ? (
        <p className="notice-banner" role="status">{location.state.notice}</p>
      ) : null}
      {initialLoading ? <FeedSkeleton /> : null}
      {error && !posts.length ? (
        <StatusPanel
          kind="error"
          title="Feed belum dapat dimuat"
          message={getRequestErrorMessage(error)}
          actionLabel="Coba lagi"
          onAction={() => void refetch()}
        />
      ) : null}
      {!initialLoading && !error && !posts.length ? (
        <StatusPanel
          title="Belum ada post"
          message="Post yang dipublikasikan akan muncul di sini."
        />
      ) : null}

      <div className="feed-list" aria-live="polite">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onChanged={refetch}
          />
        ))}
      </div>
    </main>
  );
}
