// Centralized API client. Configure VITE_API_URL to point at the HelScan backend.
export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("helscan_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiPost(path, body, auth = false) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function apiGet(path, auth = false) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...(auth ? authHeaders() : {}) },
  });
  return handle(res);
}

export async function apiPatch(path, body, auth = false) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  });
  return handle(res);
}

// Cloudinary upload for photos
export async function uploadImage(file) {
  const preset = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!preset || !cloud) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_PRESET_NAME and VITE_CLOUDINARY_CLOUD_NAME.",
    );
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url;
}

export function downloadQrUrl(id) {
  const base = import.meta.env.VITE_QR_DOWNLOAD_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/download-qr/${id}`;
}
