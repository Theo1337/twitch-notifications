const isYoutubeLive = require("isyoutubelive");

const DEFAULT_TTL = 60000;

const cache = new Map();
const inflight = new Map();

const getYoutubeLive = async (el = {}) => {
  const id = el.id;
  if (!id) return;

  const hit = cache.get(id);
  if (!el.force && hit && Date.now() < hit.expiresAt) return hit.value;

  const pending = inflight.get(id);
  if (pending) return pending;

  const ttl = Number(el.ttl) > 0 ? Number(el.ttl) : DEFAULT_TTL;

  const promise = Promise.resolve()
    .then(() => isYoutubeLive(id))
    .catch((err) => {
      console.error(`getYoutubeLive error for ${id}:`, err.message || err);
      return undefined;
    })
    .then((value) => {
      if (value) {
        cache.set(id, { value, expiresAt: Date.now() + ttl });
      }
      return value;
    })
    .finally(() => {
      if (inflight.get(id) === promise) inflight.delete(id);
    });

  inflight.set(id, promise);
  return promise;
};

module.exports = getYoutubeLive;