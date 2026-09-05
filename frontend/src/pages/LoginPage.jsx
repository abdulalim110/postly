import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Brand } from "../components/Brand.jsx";
import { PasswordField } from "../components/PasswordField.jsx";
import { StatusPanel } from "../components/StatusPanel.jsx";
import { UiIcon } from "../components/UiIcon.jsx";

export function LoginPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (auth.booting) {
    return (
      <main className="auth-page">
        <div className="auth-layout">
          <Brand showTagline />
          <StatusPanel kind="loading" title="Memeriksa sesi" />
        </div>
      </main>
    );
  }
  if (auth.user) return <Navigate to="/feed" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");

    try {
      await auth.login(form.get("identifier"), form.get("password"));
      navigate(location.state?.from ?? "/feed", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <Brand showTagline />
        <section className="auth-card">
          <header className="auth-card-header">
            <h1>Masuk</h1>
            <p className="auth-intro">Selamat datang kembali di Postly.</p>
          </header>

          <form className="stack-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Email atau username</span>
              <span className="input-shell">
                <UiIcon name="mail" />
                <input
                  name="identifier"
                  autoComplete="username"
                  required
                  placeholder="Email atau username"
                />
              </span>
            </label>
            <PasswordField
              label="Kata sandi"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Kata sandi"
            />
            {error ? (
              <p className="form-alert" role="alert">
                <UiIcon name="alert" size={18} />
                <span>{error}</span>
              </p>
            ) : null}
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? <span className="button-spinner" /> : null}
              {submitting ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="auth-divider"><span>atau</span></div>
          <p className="auth-switch">
            Belum punya akun? <Link to="/register">Buat akun</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
