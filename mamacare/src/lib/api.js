function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function callChatAgent(userText, _ctx) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: userText }),
  });
  const data = await res.json();
  return data.reply || "Не удалось получить ответ.";
}

export async function callSummaryAgent(entries, ctx) {
  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries, week: ctx?.week }),
  });
  const data = await res.json();
  return data.summary;
}

export async function apiFetchMe(token) {
  const res = await fetch("/api/users/me", { headers: authHeaders(token) });
  if (!res.ok) throw new Error("failed to load user");
  return res.json();
}

export async function apiSaveProfile(token, profileData, doctorData) {
  const res = await fetch("/api/users/profile", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ ...profileData, doctor: doctorData }),
  });
  if (!res.ok) throw new Error("failed to save profile");
  return res.json();
}

export async function apiSaveEntry(token, body) {
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: authHeaders(token),
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
