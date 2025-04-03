const notifyUser = (c) => {
  const XMLHttpRequest = require("xhr2");
  const request = new XMLHttpRequest();

  const content =
    c.type === "reset"
      ? {
          embeds: [
            {
              description: `**Resetting channels!**`,
              color: 5814783,
            },
          ],
        }
      : {
          embeds: [
            {
              description: `**${c.user_name}** is playing: ${
                c.game_name ? `***${c.game_name}***` : "__**NO GAME**__"
              }`,
              color: 5814783,
              fields: [
                {
                  name: `**${c.title}**`,
                  value: `${
                    c.platform === "yt"
                      ? "https://youtube.com/watch?v="
                      : "https://twitch.tv/"
                  }${c.platform === "yt" ? c.video_id : c.user_name}`,
                },
              ],
              author: {
                name: `${c.user_name} is live!`,
                url: `${
                  c.platform === "yt"
                    ? "https://youtube.com/watch?v="
                    : "https://twitch.tv/"
                }${c.platform === "yt" ? c.video_id : c.user_name}`,
                icon_url: c.profile_image_url,
              },
              footer: {
                text: "NIGHT NOTIFICATIONS",
                icon_url: "https://pbs.twimg.com/media/FwNLjk7XgAABXZr.png",
              },
              image: {
                url: c.thumbnail_url,
              },
              thumbnail: {
                url: c.profile_image_url,
              },
            },
          ],
        };

<<<<<<< HEAD
  request.open("POST", process.env.DISCORD_WEBHOOK_URL, true);
  request.setRequestHeader("Content-type", "application/json");
=======
  request.open("POST", "[DISCORD_WEBHOOK_URL]")
  request.setRequestHeader('Content-type', 'application/json');
>>>>>>> 2147360174b6b301681588b8e11d8506fe301f4e

  request.send(JSON.stringify(content));
};

module.exports = notifyUser;
