let configs = {
  token: "",
};

const getChannels = async (e) => {
  const TWITCH_CLIENT_ID = "g23nf3u0ej1o7jkzi04q93n735jawx";
  const TWITCH_SECRET = "ir8jymwkw9xlf0u9moj0hochqry2z0";
  const TOKEN_URL = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_SECRET}&grant_type=client_credentials`;

  const options = {
    method: "POST",
    json: true,
  };

  const token = await fetch(TOKEN_URL, options);
  const res = await token.json();

  configs.token = res.access_token;

  if (configs.token) {
    const get_channels_options = {
      method: "GET",
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: "Bearer " + configs.token,
      },
    };

    const channels = await fetch(e.url, get_channels_options);
    const channels_res = await channels.json();

    return channels_res.data;
  }
};

export { getChannels };
