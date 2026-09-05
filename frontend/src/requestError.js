export function getRequestErrorMessage(error) {
  const message = error?.message?.trim();

  if (
    !message ||
    /failed to fetch|fetch failed|network error|load failed|econnrefused/i.test(
      message,
    )
  ) {
    return "Tidak dapat terhubung ke server. Coba lagi.";
  }

  return message;
}
