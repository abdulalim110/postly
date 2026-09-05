import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { getAvatar } from "../staticAssets.js";
import { Brand } from "./Brand.jsx";
import { UiIcon } from "./UiIcon.jsx";

export function SiteLayout() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    auth.logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />

          <nav className="main-nav" aria-label="Navigasi utama">
            <NavLink to="/feed">Feed</NavLink>
            {auth.user ? <NavLink to="/posts/new">Buat Post</NavLink> : null}
          </nav>

          <div className="session-actions">
            {auth.user ? (
              <details className="session-menu">
                <summary aria-label={`Buka menu akun ${auth.user.name}`}>
                  <img
                    src={getAvatar(auth.user.avatarKey).src}
                    alt=""
                  />
                  <UiIcon name="chevron" size={18} />
                </summary>
                <div className="session-popover">
                  <Link
                    className="session-profile-link"
                    to={`/users/${auth.user.username}`}
                  >
                    <strong>{auth.user.name}</strong>
                    <span>@{auth.user.username}</span>
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    Keluar
                  </button>
                </div>
              </details>
            ) : (
              <>
                <Link className="text-link" to="/login">
                  Masuk
                </Link>
                <Link className="small-primary-link" to="/register">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
