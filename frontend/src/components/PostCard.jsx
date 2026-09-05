import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { formatRelativeTime } from "../format.js";
import { CREATE_COMMENT_MUTATION } from "../graphql.js";
import { getRequestErrorMessage } from "../requestError.js";
import { getAvatar, getPostImage } from "../staticAssets.js";
import { UiIcon } from "./UiIcon.jsx";

function Author({ user, compact = false, subtitle = null }) {
  return (
    <Link className="author-link" to={`/users/${user.username}`}>
      <img
        className={compact ? "avatar avatar-small" : "avatar"}
        src={getAvatar(user.avatarKey).src}
        alt=""
      />
      <span>
        <strong>@{user.username}</strong>
        {!compact ? <small>{subtitle ?? user.name}</small> : null}
      </span>
    </Link>
  );
}

function CommentItem({ comment, canReply, onReply }) {
  return (
    <div className="comment-thread">
      <article className="comment-item">
        <Author user={comment.author} compact />
        <div className="comment-copy">
          <Link className="comment-author" to={`/users/${comment.author.username}`}>
            @{comment.author.username}
          </Link>
          <p>{comment.content}</p>
          <div className="comment-meta">
            <time dateTime={comment.createdAt}>
              {formatRelativeTime(comment.createdAt)}
            </time>
            {canReply ? (
              <button type="button" onClick={() => onReply(comment)}>
                Balas
              </button>
            ) : null}
          </div>
        </div>
      </article>

      {comment.replies?.length ? (
        <div className="reply-list">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              canReply={false}
              onReply={onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PostCard({ post, onChanged }) {
  const auth = useAuth();
  const [createComment, { loading: submitting }] = useMutation(
    CREATE_COMMENT_MUTATION,
  );
  const [content, setContent] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [error, setError] = useState("");
  const postImage = getPostImage(post.imageKey);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim() || submitting) return;

    setError("");
    try {
      await createComment({
        variables: {
          postId: post.id,
          parentId: replyTarget?.id ?? null,
          content,
        },
      });
      setContent("");
      setReplyTarget(null);
      await onChanged();
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  }

  return (
    <article className="post-card">
      <header className="post-header">
        <Author
          user={post.author}
          subtitle={(
            <time dateTime={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </time>
          )}
        />
      </header>

      <img
        className="post-image"
        src={postImage.src}
        alt={postImage.alt}
        loading="lazy"
        decoding="async"
      />
      <p className="post-caption">{post.caption}</p>

      <section className="comments-section" aria-label="Komentar">
        <h2>Komentar</h2>
        {post.comments.length ? (
          <div className="comment-list">
            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canReply={Boolean(auth.user)}
                onReply={(selectedComment) => {
                  setReplyTarget(selectedComment);
                  setError("");
                }}
              />
            ))}
          </div>
        ) : (
          <p className="empty-inline">Belum ada komentar.</p>
        )}

        {auth.user ? (
          <form className="comment-form" onSubmit={handleSubmit}>
            {replyTarget ? (
              <div className="replying-to">
                <span>Membalas @{replyTarget.author.username}</span>
                <button type="button" onClick={() => setReplyTarget(null)}>
                  Batal
                </button>
              </div>
            ) : null}
            <label className="sr-only" htmlFor={`comment-${post.id}`}>
              {replyTarget ? "Tulis balasan" : "Tulis komentar"}
            </label>
            <div className="comment-input-row">
              <input
                id={`comment-${post.id}`}
                value={content}
                maxLength={500}
                onChange={(event) => setContent(event.target.value)}
                placeholder={replyTarget ? "Tulis balasan..." : "Tulis komentar..."}
                aria-describedby={error ? `comment-error-${post.id}` : undefined}
              />
              <button disabled={!content.trim() || submitting} type="submit">
                {submitting ? "Mengirim..." : "Kirim"}
              </button>
            </div>
            {content.length >= 420 ? (
              <span className="comment-count">{content.length}/500</span>
            ) : null}
            {error ? (
              <p className="form-alert form-alert-compact" id={`comment-error-${post.id}`} role="alert">
                <UiIcon name="alert" size={17} />
                <span>{error}</span>
              </p>
            ) : null}
          </form>
        ) : (
          <p className="login-prompt">
            <Link to="/login">Masuk</Link> untuk menulis komentar.
          </p>
        )}
      </section>
    </article>
  );
}
