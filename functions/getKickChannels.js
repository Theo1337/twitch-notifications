let cachedToken = null;
let tokenExpiresAt = 0;
let inflightToken = null;

const getKickToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  if (!inflightToken) {
    inflightToken = (async () => {
      const client_secret = process.env.KICK_CLIENT_SECRET;
      const client_id = process.env.KICK_CLIENT_ID;

      const res = await fetch("https://id.kick.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id,
          client_secret,
        }),
      });

      const data = await res.json();
      if (!data || !data.access_token) {
        throw new Error("Kick token request failed");
      }

      const expiresIn = Number(data.expires_in) || 3600;
      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + Math.max(expiresIn - 60, 30) * 1000;
      return cachedToken;
    })().finally(() => {
      inflightToken = null;
    });
  }

  return inflightToken;
};

const DEFAULT_TTL = 30000;

let cache = null;
let cacheExpiresAt = 0;
let inflight = null;

const fetchKickChannels = async (slugs) => {
  const token = await getKickToken();

  const res = await fetch(
    `https://api.kick.com/public/v1/channels?slug=${slugs.join("&slug=")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
};

const getKickChannels = async (el = {}) => {
  const channels = el.channels || [];
  const kChannels = channels
    .map((c) => c && c.kick)
    .filter((s) => typeof s === "string" && s.trim());

  if (kChannels.length === 0) return [];

  const key = kChannels.slice().sort().join(",");
  const fresh =
    cache && cache.key === key && Date.now() < cacheExpiresAt && !el.force;

  if (fresh) return cache.data;

  if (inflight && inflight.key === key) return inflight.promise;

  const promise = fetchKickChannels(kChannels).catch((err) => {
    console.error("getKickChannels error:", err.message || err);
    return cache && cache.key === key ? cache.data : [];
  });

  inflight = { key, promise };

  try {
    const data = await promise;
    if (data && data.length) {
      const ttl = Number(el.ttl) > 0 ? Number(el.ttl) : DEFAULT_TTL;
      cache = { key, data };
      cacheExpiresAt = Date.now() + ttl;
    }
    return data;
  } finally {
    if (inflight && inflight.promise === promise) inflight = null;
  }
};

module.exports = getKickChannels;