import { useState } from "react";
import { UiIcon } from "./UiIcon.jsx";

export function PasswordField({ label, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="form-field">
      <span>{label}</span>
      <span className="input-shell">
        <UiIcon name="lock" />
        <input {...inputProps} type={visible ? "text" : "password"} />
        <button
          className="input-action"
          type="button"
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          onClick={() => setVisible((current) => !current)}
        >
          <UiIcon name={visible ? "eye-off" : "eye"} />
        </button>
      </span>
    </label>
  );
}
