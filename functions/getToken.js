const getToken = async () => {
  const TWITCH_CLIENT_ID = 'g23nf3u0ej1o7jkzi04q93n735jawx';
  const TWITCH_SECRET = 'ir8jymwkw9xlf0u9moj0hochqry2z0';
  const TOKEN_URL = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_SECRET}&grant_type=client_credentials`;

  const options = {
    method: "POST",
    json: true,
  };

  const token = await fetch(TOKEN_URL, options)
  const res = await token.json()

  return res
}

module.exports = getToken