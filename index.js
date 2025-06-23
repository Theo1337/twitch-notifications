const express = require("express");
const app = express();
const webpush = require("web-push");

require("dotenv").config();

app.use(express.json());

app.get("/", (request, response) => {
  const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(
    `Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`
  );
  response.sendFile("./src/index.html", { root: __dirname });
});

app.use(express.static(__dirname + "/public"));
app.listen(process.env.PORT || 3002); // Recebe solicitações que o deixa online

var cors = require("cors");
app.use(cors());

app.get("/serverStatus", (req, res) => {
  res.sendStatus(200);
});

let access_token;
let notifiedChannels;
let ytNotifiedChannels;
let channels;
let ytChannels;
let subscriptions = []; // In production, store in a DB

const fs = require("fs");

const saveData = () => {
  try {
    const value = JSON.stringify(channels, null, 2); // Format JSON for readability
    fs.writeFileSync("./public/channels_list.txt", value, "utf-8");

    const value2 = JSON.stringify(subscriptions, null, 2); // Format JSON for readability
    fs.writeFileSync("./public/subscriptions.txt", value2, "utf-8");
  } catch (error) {
    console.error("Error saving channels data:", error.message);
  }
};

const saveNotifiedData = () => {
  try {
    const value = JSON.stringify(notifiedChannels, null, 2); // Format JSON for readability
    fs.writeFileSync("notified_channels_list.txt", value, "utf-8");
  } catch (error) {
    console.error("Error saving notified channels data:", error.message);
  }
};

const getData = () => {
  try {
    const channels_value = fs.readFileSync(
      "./public/channels_list.txt",
      "utf-8"
    );
    channels = JSON.parse(channels_value) || [];

    const subscriptions_value = fs.readFileSync(
      "./public/subscriptions.txt",
      "utf-8"
    );
    subscriptions = JSON.parse(subscriptions_value) || [];
  } catch (error) {
    console.error("Error reading channels data:", error.message);
    channels = []; // Reset to an empty array if the file is corrupted
  }

  try {
    const notified_value = fs.readFileSync(
      "notified_channels_list.txt",
      "utf-8"
    );
    notifiedChannels = JSON.parse(notified_value) || [];
  } catch (error) {
    console.error("Error reading notified channels data:", error.message);
    notifiedChannels = []; // Reset to an empty array if the file is corrupted
  }
};

function notifyUser(channel) {
  console.log(channel);
  const payload = JSON.stringify({
    title: `${channel.user_name} is playing ${channel.game_name}!`,
    body: channel.title,
    icon: channel.profile_image_url,
    image: channel.thumbnail_url,
    url: `https://twitch.tv/${channel.user_login}`,
  });
  subscriptions.forEach((sub) => {
    webpush.sendNotification(sub, payload).catch(console.error);
  });
}

const getChannels = async (el) => {
  const getTwtChannels = require("./functions/getChannels");

  const token = el.token;

  if (channels.length > 0) {
    const res = await getTwtChannels({ channels: channels, token: token });
    const notified_live_channels = channels?.filter((e) =>
      res?.some(({ user_name }) => e.name === user_name.toLowerCase())
    );

    const livesToNotify = res?.filter(
      ({ user_name }) =>
        !notifiedChannels?.some((e) => e.name === user_name.toLowerCase())
    );

    livesToNotify.forEach((ch) => {
      notifyUser(ch);

      notifiedChannels.push({ name: ch.user_name.toLowerCase(), games: [] });
    });

    if (notifiedChannels.length > 0 || notifiedChannels) {
      res.forEach((ch) => {
        const current = channels?.filter(
          (e) => ch.user_name.toLowerCase() === e.name
        );
        ch.games = current[0].games;

        const current_notified = notifiedChannels?.filter(
          (e) => e.name === ch.user_name.toLowerCase()
        );
        const gamesToNotify = ch.games?.filter(
          (c) => !current_notified[0].games.some((e) => e === c)
        );

        gamesToNotify?.forEach((g) => {
          if (ch.game_name === g) {
            notifyUser(ch);

            current_notified[0].games.push(g);
          }
        });
      });
    }

    notifiedChannels = notifiedChannels.filter(({ name }) =>
      notified_live_channels?.some((e) => e.name === name)
    );
    saveNotifiedData();
  }
};

const tokenFunction = async () => {
  const getToken = require("./functions/getToken");

  const token_func = await getToken();

  const token = token_func.access_token;

  if (token) {
    access_token = token;
    getChannels({ token: token });
  }
};

// const getYtChannels = async () => {
//   const {
//     setIdForChannel,
//     getChannelLive,
//   } = require("./functions/getYoutubeChannel");

//   const res = await getChannelLive({ channels: ytChannels });

//   const yt_channels_to_notify = res?.filter(
//     (e) => !ytNotifiedChannels?.some(({ id }) => e.id === id)
//   );

//   const saveYtNotifiedData = () => {
//     const fs = require("fs");
//     const value = JSON.stringify(ytNotifiedChannels);

//     fs.writeFileSync("./public/yt_notified_channels_list.txt", value, "utf-8");
//   };

//   yt_channels_to_notify.forEach((c) => {
//     if (!c.id) {
//       console.log("Setting id for channel: " + c.name);
//       setIdForChannel({ c, channels: ytChannels });
//     } else {
//       console.log("Notifying channel: " + c.name);

//       notifyUser(c);
//       ytNotifiedChannels.push({ name: c.name, id: c.id });
//       saveYtNotifiedData();
//     }
//   });

//   // ytNotifiedChannels = ytNotifiedChannels.filter(({ name }) =>
//   //   yt_channels_to_notify?.some((e) => e.name === name)
//   // );
//   // saveYtNotifiedData();
// };

setInterval(() => {
  if (access_token) {
    console.log("Refreshing content!");
    getChannels({ token: access_token });

    console.clear();
  }

  // getYtChannels();
}, 90000);

app.get("/getFavChannels", async (req, res) => {
  const getChannels = require("./functions/getFavChannels");

  const token = access_token;

  const favChannels = await getChannels({ channels: channels, token: token });

  res.send(favChannels.data);
});

app.post("/api/add-channel", (req, res) => {
  const { channel } = req.body;
  if (!channel) return res.status(400).send("No channel provided");

  channels.push({
    name: channel.toLowerCase(),
    games: [],
  });
  saveData();
  res.status(200).send("Channel added successfully");
});

app.post("/api/add-game", (req, res) => {
  const { channel, game } = req.body;
  if (!channel || !game) return res.status(400).send("Missing channel or game");
  const ch = channels.find((c) => c.name === channel.toLowerCase());
  if (!ch) return res.status(404).send("Channel not found");
  if (!ch.games) ch.games = [];
  if (!ch.games.includes(game)) ch.games.push(game);
  saveData();
  res.sendStatus(200);
});

app.post("/api/remove-channel", (req, res) => {
  const { channel } = req.body;
  if (!channel) return res.status(400).send("Missing channel");
  const idx = channels.findIndex((c) => c.name === channel.toLowerCase());
  if (idx === -1) return res.status(404).send("Channel not found");
  channels.splice(idx, 1);
  saveData();
  res.sendStatus(200);
});

app.post("/api/remove-game", (req, res) => {
  const { channel, game } = req.body;
  if (!channel || !game) return res.status(400).send("Missing channel or game");
  const ch = channels.find((c) => c.name === channel.toLowerCase());
  if (!ch) return res.status(404).send("Channel not found");
  if (!ch.games) ch.games = [];
  ch.games = ch.games.filter((g) => g !== game);
  saveData();
  res.sendStatus(200);
});

webpush.setVapidDetails(
  "mailto:your@email.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.post("/api/subscribe", (req, res) => {
  console.log("New subscription received");

  const subscription = req.body;
  // Check for existing subscription by endpoint
  const alreadySubscribed = subscriptions.some(
    (sub) => sub.endpoint === subscription.endpoint
  );
  if (!alreadySubscribed) {
    subscriptions.push(subscription);
    saveData(); // Save subscriptions to file (or DB in production)
  }
  res.status(201).json({});
});

getData();
tokenFunction();
// getYtChannels();
