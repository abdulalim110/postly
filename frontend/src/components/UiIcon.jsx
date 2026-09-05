const paths = {
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.5h.01" />
    </>
  ),
  at: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.4 7" />
    </>
  ),
  check: <path d="m7 12 3.2 3.2L17.5 8" />,
  chevron: <path d="m8 10 4 4 4-4" />,
  eye: (
    <>
      <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="m4 4 16 16" />
      <path d="M10.6 7.2A9.7 9.7 0 0 1 12 7c5.8 0 9 5 9 5a15.7 15.7 0 0 1-2.1 2.6" />
      <path d="M15.7 15.7A6.3 6.3 0 0 1 12 17c-5.8 0-9-5-9-5a15.4 15.4 0 0 1 3.1-3.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m4 17 4.5-4.5 3.2 3.2 2.3-2.3 6 6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
};

export function UiIcon({ name, size = 20 }) {
  return (
    <svg
      aria-hidden="true"
      className="ui-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
