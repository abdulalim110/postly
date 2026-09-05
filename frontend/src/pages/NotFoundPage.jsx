import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page-state not-found-state">
      <p className="eyebrow">404</p>
      <h1>Halaman tidak ditemukan</h1>
      <Link className="primary-link" to="/feed">
        Kembali ke feed
      </Link>
    </main>
  );
}
