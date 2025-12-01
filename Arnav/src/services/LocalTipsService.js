// Local tips fetching service
export async function fetchRemoteTips(endpoint) {
  if (!endpoint) throw new Error("No endpoint provided");
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tips: " + res.status);
  const data = await res.json();
  // Expect data to be an array of { text, tags }
  if (!Array.isArray(data)) throw new Error("Invalid tips payload");
  return data.map((t) => ({ text: t.text || "", tags: t.tags || ["default"] }));
}
