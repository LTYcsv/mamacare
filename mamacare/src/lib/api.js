let _accessToken = null;
let _onAuthFailure = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function setAuthFailureHandler(fn) {
  _onAuthFailure = fn;
}

function buildOptions(options) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (_accessToken) headers.Authorization = `Bearer ${_accessToken}`;
  return { ...options, headers };
}

async function apiFetch(url, options = {}) {
  let res = await fetch(url, buildOptions(options));
  if (res.status !== 401) return res;

  const newToken = await apiRefresh();
  if (!newToken) {
    _onAuthFailure?.();
    return res;
  }
  _accessToken = newToken;

  res = await fetch(url, buildOptions(options));
  if (res.status === 401) _onAuthFailure?.();
  return res;
}

export async function callChatAgent(userText) {
  const res = await apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ input: userText }),
  });
  const data = await res.json();
  return data.reply || "Не удалось получить ответ.";
}

export async function callSummaryAgent() {
  const res = await apiFetch("/api/summary", { method: "POST" });
  const data = await res.json();
  return data.summary;
}

export async function apiFetchMe() {
  const res = await apiFetch("/api/users/me");
  if (!res.ok) throw new Error("failed to load user");
  return res.json();
}

export async function apiSaveProfile(profileData, doctorData) {
  const res = await apiFetch("/api/users/profile", {
    method: "POST",
    body: JSON.stringify({ ...profileData, doctor: doctorData }),
  });
  if (!res.ok) throw new Error("failed to save profile");
  return res.json();
}

export async function apiSaveEntry(body) {
  const res = await apiFetch("/api/entries", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("failed to save entry");
  return res.json();
}

export async function apiRefresh() {
  const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

export async function apiLogout() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}
