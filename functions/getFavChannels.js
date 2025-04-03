const getFavChannels = async (el) => {
  const options = {
    method: "GET",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: "Bearer " + el.token,
    },
  };

  const users = el.channels;
  let offlineChannelsArr = [];
  users.forEach((e, i) => {
    offlineChannelsArr.push(`${i === 0 ? "?" : "&"}login=${e.name}`);
  });
  const channels_string = offlineChannelsArr.toString().replaceAll(",", "");

  const CHANNELS_URL = `https://api.twitch.tv/helix/users${channels_string}`;
  const channels = await fetch(CHANNELS_URL, options);
  const offlineChannels = await channels.json();

  return offlineChannels;
};

module.exports = getFavChannels;
