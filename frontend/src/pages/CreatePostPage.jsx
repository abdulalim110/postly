import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { UiIcon } from "../components/UiIcon.jsx";
import { CREATE_POST_MUTATION } from "../graphql.js";
import { getRequestErrorMessage } from "../requestError.js";
import { getPostImage, POST_IMAGES } from "../staticAssets.js";

export function CreatePostPage() {
  const navigate = useNavigate();
  const [createPost, { loading: submitting }] = useMutation(
    CREATE_POST_MUTATION,
  );
  const [caption, setCaption] = useState("");
  const [imageKey, setImageKey] = useState(POST_IMAGES[0].key);
  const [error, setError] = useState("");
  const selectedImage = getPostImage(imageKey);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!caption.trim() || submitting) return;

    setError("");
    try {
      await createPost({ variables: { caption, imageKey } });
      navigate("/feed", {
        replace: true,
        state: { notice: "Post berhasil dipublikasikan." },
      });
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    }
  }

  return (
    <main className="page-shell compose-shell">
      <section className="form-card">
        <header className="page-heading compact-heading">
          <div>
            <h1>Buat Post Baru</h1>
            <p>Bagikan momen, ide, atau cerita kamu ke dunia.</p>
          </div>
        </header>

        <form className="create-post-form" onSubmit={handleSubmit}>
          <label>
            Caption
            <textarea
              name="caption"
              value={caption}
              maxLength={280}
              rows={4}
              required
              placeholder="Tulis sesuatu..."
              onChange={(event) => setCaption(event.target.value)}
            />
            <span className="field-hint">{caption.length}/280</span>
          </label>

          <fieldset>
            <legend>Pilih gambar</legend>
            <div className="image-picker">
              {POST_IMAGES.map((image) => (
                <button
                  key={image.key}
                  className="image-option"
                  data-selected={image.key === imageKey}
                  type="button"
                  aria-pressed={image.key === imageKey}
                  aria-label={`Pilih gambar ${image.label}`}
                  onClick={() => setImageKey(image.key)}
                >
                  <img src={image.src} alt="" />
                  <span>{image.label}</span>
                  {image.key === imageKey ? (
                    <span className="image-selected-mark">
                      <UiIcon name="check" size={18} />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="post-compose-preview">
            <p className="preview-label">Preview</p>
            <img src={selectedImage.src} alt={selectedImage.alt} />
            <p>{caption || "Caption kamu akan tampil di sini."}</p>
          </div>

          {error ? (
            <p className="form-alert" role="alert">
              <UiIcon name="alert" size={18} />
              <span>{error}</span>
            </p>
          ) : null}
          <button
            className="primary-button"
            disabled={!caption.trim() || submitting}
            type="submit"
          >
            {submitting ? <span className="button-spinner" /> : null}
            {submitting ? "Mempublikasikan..." : "Publikasikan"}
          </button>
        </form>
      </section>
    </main>
  );
}
