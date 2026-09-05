import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth.jsx";
import { SiteLayout } from "./components/SiteLayout.jsx";
import { CreatePostPage } from "./pages/CreatePostPage.jsx";
import { FeedPage } from "./pages/FeedPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<SiteLayout />}>
        <Route index element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/users/:username" element={<ProfilePage />} />
        <Route element={<RequireAuth />}>
          <Route path="/posts/new" element={<CreatePostPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
