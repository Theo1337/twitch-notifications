const getToken = async () => {
  const TWITCH_CLIENT_ID = '[TWITCH_CLIENT_ID]';
  const TWITCH_SECRET = '[TWITCH_SECRET]';
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
