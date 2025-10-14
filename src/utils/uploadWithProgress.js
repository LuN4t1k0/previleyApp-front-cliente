import axios from "axios";

export async function uploadFileWithProgress({ url, fileField = "file", file, fields = {}, headers = {}, token, onUploadPercent, signal }) {
  const form = new FormData();
  Object.entries(fields || {}).forEach(([k, v]) => form.append(k, v));
  if (file) form.append(fileField, file);

  const resp = await axios.post(url, form, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    signal,
    onUploadProgress: (evt) => {
      if (!evt || !evt.total) return;
      const percent = Math.round((evt.loaded / evt.total) * 100);
      onUploadPercent?.(percent);
    },
  });
  return resp;
}
