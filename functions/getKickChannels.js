const getKickChannels = async (el) => {
  const client_secret = process.env.KICK_CLIENT_SECRET;
  const client_id = process.env.KICK_CLIENT_ID;

  const kChannels = [];
  const channels = el.channels;
  channels.forEach((c) => {
    if (c.kick) {
      kChannels.push(c.kick);
    }
  });

  let token;
  let kickChannels = [];

  await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id,
      client_secret,
    }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      token = data.access_token;
      const channels = kChannels;

      await fetch(
        `https://api.kick.com/public/v1/channels?slug=${channels.join(
          "&slug="
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          kickChannels = data.data;
        });
    });

  return kickChannels;
};

module.exports = getKickChannels;
