const getYoutubeLive = async (el = {}) => {
  const isYoutubeLive = require("isyoutubelive");
  const live = await isYoutubeLive(el.id);
  if (live) return live;
};

module.exports = getYoutubeLive;
