import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Brand } from "../components/Brand.jsx";
import { PasswordField } from "../components/PasswordField.jsx";
import { StatusPanel } from "../components/StatusPanel.jsx";
import { UiIcon } from "../components/UiIcon.jsx";

export function RegisterPage() {
  const auth = useAuth();
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
    const password = form.get("password");

    if (password !== form.get("passwordConfirmation")) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await auth.register({
        name: form.get("name"),
        username: form.get("username"),
        email: form.get("email"),
        password,
      });
      navigate("/feed", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page-register">
      <div className="auth-layout auth-layout-register">
        <Brand showTagline />
        <section className="auth-card">
          <header className="auth-card-header">
            <h1>Buat akun</h1>
            <p className="auth-intro">Mulai berbagi cerita di Postly.</p>
          </header>

          <form className="stack-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Nama lengkap</span>
              <span className="input-shell">
                <UiIcon name="user" />
                <input
                  name="name"
                  minLength={2}
                  maxLength={80}
                  required
                  autoComplete="name"
                  placeholder="Nama lengkap Anda"
                />
              </span>
            </label>
            <label className="form-field">
              <span>Username</span>
              <span className="input-shell">
                <UiIcon name="at" />
                <input
                  name="username"
                  minLength={3}
                  maxLength={24}
                  pattern="[a-z0-9._]+"
                  autoComplete="username"
                  aria-describedby="username-hint"
                  required
                  placeholder="Pilih username"
                />
              </span>
              <small id="username-hint" className="field-help">
                Gunakan huruf kecil, angka, titik, atau garis bawah.
              </small>
            </label>
            <label className="form-field">
              <span>Email</span>
              <span className="input-shell">
                <UiIcon name="mail" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email Anda"
                />
              </span>
            </label>
            <PasswordField
              label="Kata sandi"
              name="password"
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
              placeholder="Buat kata sandi"
            />
            <PasswordField
              label="Konfirmasi kata sandi"
              name="passwordConfirmation"
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
              placeholder="Ulangi kata sandi"
            />
            {error ? (
              <p className="form-alert" role="alert">
                <UiIcon name="alert" size={18} />
                <span>{error}</span>
              </p>
            ) : null}
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? <span className="button-spinner" /> : null}
              {submitting ? "Membuat akun..." : "Daftar"}
            </button>
          </form>

          <div className="auth-divider"><span>atau</span></div>
          <p className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
