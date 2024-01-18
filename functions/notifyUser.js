const notifyUser = (c) => {
  const XMLHttpRequest = require('xhr2');
  const request = new XMLHttpRequest();

  const content = c.type === "reset" ? {
    "embeds": [{
      "description": `**Resetting channels!**`,
      "color": 5814783,
    }]
  } : {
    "embeds": [
        {
          "description": `**${c.user_name}** is playing: ${c.game_name ? `***${c.game_name}***` : "__**NO GAME**__"}`,
          "color": 5814783,
          "fields": [
            {
              "name": `**${c.title}**`,
              "value": `https://twitch.tv/${c.user_name}`
            }
          ],
          "author": {
            "name": `${c.user_name} is live!`,
            "url": `https://twitch.tv/${c.user_name}`,
            "icon_url": c.profile_image_url
          },
          "footer": {
            "text": "QSMP - NOTIFICATIONS",
            "icon_url": "https://pbs.twimg.com/media/FwNLjk7XgAABXZr.png"
          },
          "image": {
            "url": c.thumbnail_url
          },
          "thumbnail": {
            "url": c.profile_image_url
          }
        }
    ],
  }

  request.open("POST", "https://discord.com/api/webhooks/1154861224421502986/6PF_326hUdaqpIm2OYgP2CTYgKrMdlzyr0p6S7tuMB7zhBOlgrBOu19BKxmNMVAMHOva")
  request.setRequestHeader('Content-type', 'application/json');

  request.send(JSON.stringify(content));
}

module.exports = notifyUser;