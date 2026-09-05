import { Link } from "react-router-dom";

export function Brand({ showTagline = false }) {
  return (
    <div className="brand-lockup">
      <Link className="brand-link" to="/feed" aria-label="Postly — buka feed">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </span>
        <span>Postly</span>
      </Link>
      {showTagline ? (
        <p className="brand-tagline">Berbagi cerita, lebih dekat dengan dunia.</p>
      ) : null}
    </div>
  );
}
