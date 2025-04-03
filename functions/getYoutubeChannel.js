const API_KEY = process.env.YOUTUBE_API_KEY;

const setIdForChannel = async ({ c, channels }) => {
  const channelName = c.name?.toLowerCase();
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelName}&key=${API_KEY}&maxResults=1`;

  try {
    const res = await fetch(url);
    const channelData = await res.json();

    if (channelData.items && channelData.items.length > 0) {
      const channelInfo = channelData.items[0];
      const channelToUpdate = channels.find((e) => e.name === c.name);

      if (channelToUpdate) {
        channelToUpdate.id = channelInfo.id;
        channelToUpdate.profile_image_url =
          channelInfo.snippet.thumbnails.default.url;

        const fs = require("fs");
        fs.writeFileSync(
          "./public/yt_channels_list.txt",
          JSON.stringify(channels),
          "utf-8"
        );
      }
    }
  } catch (error) {
    console.error("Error fetching channel ID:", error);
  }
};

const getChannelLive = async (c) => {
  const users = c.channels;
  const channels = [];

  for (const e of users) {
    // Use for...of for proper async handling
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${e.id}&eventType=live&type=video&key=${API_KEY}`;
    const user_id = e.id;

    try {
      const res = await fetch(url);
      const channelLive = await res.json();

      if (channelLive.items?.length > 0) {
        const live = channelLive.items[0].snippet;

        channels.push({
          user_name: live.channelTitle,
          name: live.channelTitle,
          id: user_id,
          title: live.title,
          profile_image_url: e.profile_image_url,
          thumbnail_url: live.thumbnails.high.url,
          video_id: channelLive.items[0].id.videoId,
          platform: "yt",
        });
      }
    } catch (error) {
      console.error("Error fetching live channel:", error);
    }
  }

  return channels;
};

module.exports = { setIdForChannel, getChannelLive };
