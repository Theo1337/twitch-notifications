const getToken = async () => {
<<<<<<< HEAD
  const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
  const TWITCH_SECRET = process.env.TWITCH_SECRET;
=======
  const TWITCH_CLIENT_ID = '[TWITCH_CLIENT_ID]';
  const TWITCH_SECRET = '[TWITCH_SECRET]';
>>>>>>> 2147360174b6b301681588b8e11d8506fe301f4e
  const TOKEN_URL = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_SECRET}&grant_type=client_credentials`;

  const options = {
    method: "POST",
    json: true,
  };

  const token = await fetch(TOKEN_URL, options);
  const res = await token.json();

  return res;
};

<<<<<<< HEAD
module.exports = getToken;
=======
module.exports = getToken
>>>>>>> 2147360174b6b301681588b8e11d8506fe301f4e
