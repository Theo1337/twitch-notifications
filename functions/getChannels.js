const getChannels = async (el) => {
  // Get offline channels
  const options = {
    method: "GET",
    headers: {
      "Client-ID": "[TOKEN]",
      "Authorization": 'Bearer ' + el.token,
    }
  }

  const users = el.channels;
  let offlineChannelsArr = []
  users.forEach((e, i) => {
    offlineChannelsArr.push(`${i === 0 ? "?" : "&"}login=${e.name}`)
  })
  const channels_string = offlineChannelsArr.toString().replaceAll(",", "")

  const CHANNELS_URL = `https://api.twitch.tv/helix/users${channels_string}`;
  const channels = await fetch(CHANNELS_URL, options)
  const offlineChannels = await channels.json();


  // Get live channels
  const channelsArr = []

  el.channels?.forEach((c, i) => {
    channelsArr.push(`${i === 0 ? "?" : "&"}user_login=${c.name}`)
  })

  const live_channels_string = channelsArr.toString().replaceAll(",", "")
  const url = `https://api.twitch.tv/helix/streams${live_channels_string}`
  const channels_request_options = {
    method: "GET",
    headers: {
      "Client-ID": "[TOKEN]",
      "Authorization": 'Bearer ' + el.token,
    }
  }

  const streams = [];

  if (offlineChannels.data) {
    await fetch(url, channels_request_options).then(async (ch) => {
      const live_res = await ch.json()
      const liveChannels = live_res.data;

      offlineChannels.data?.forEach(c => {
        liveChannels?.filter(u => u.user_id === c.id).forEach(e => {
          e.profile_image_url = c.profile_image_url
          e.thumbnail_url = e.thumbnail_url.replaceAll("{width}x{height}", "1280x720") + "?" + Math.random().toString(36)
        })
      })

      liveChannels.forEach((channel) => {
        streams.push(channel);
      })
    })
  }
  return streams
}

module.exports = getChannels;
