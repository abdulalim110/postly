import { UiIcon } from "./UiIcon.jsx";

export function StatusPanel({
  kind = "empty",
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <section
      className={`status-panel status-${kind}${compact ? " status-compact" : ""}`}
      aria-live="polite"
    >
      <span className="status-icon" aria-hidden="true">
        {kind === "loading" ? <span className="spinner" /> : null}
        {kind === "error" ? <UiIcon name="alert" size={24} /> : null}
        {kind === "empty" ? <UiIcon name="image" size={24} /> : null}
      </span>
      <div>
        <h2>{title}</h2>
        {message ? <p>{message}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export function FeedSkeleton() {
  return (
    <div className="post-card post-skeleton" aria-label="Memuat feed" aria-busy="true">
      <div className="skeleton-header">
        <span className="skeleton-circle" />
        <span className="skeleton-lines">
          <span />
          <span />
        </span>
      </div>
      <span className="skeleton-image" />
      <span className="skeleton-caption" />
      <span className="skeleton-caption skeleton-caption-short" />
    </div>
  );
}
