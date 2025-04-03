const notifyUser = require("./functions/notifyUser");
const express = require("express");
const app = express();

require("dotenv").config();

app.get("/", (request, response) => {
  const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(
    `Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`
  );
  response.sendFile("./src/index.html", { root: __dirname });
});

app.use(express.static(__dirname + "/public"));
app.listen(3002); // Recebe solicitações que o deixa online

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

const fs = require("fs");

const saveData = () => {
  try {
    const value = JSON.stringify(channels, null, 2); // Format JSON for readability
    fs.writeFileSync("channels_list.txt", value, "utf-8");
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

const getChannels = async (el) => {
  const getChannels = require("./functions/getChannels");

  const token = el.token;

  if (channels.length > 0) {
    const res = await getChannels({ channels: channels, token: token });
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

const schedule = require("node-schedule");

schedule.scheduleJob("5 9 * * *", function () {
  const notifyUser = require("./functions/notifyUser");
  console.log("Resetting Channels!");
  notifiedChannels = [""];

  saveNotifiedData();
  notifyUser({ type: "reset" });
});

app.get("/getFavChannels", async (req, res) => {
  const getChannels = require("./functions/getFavChannels");

  const token = access_token;

  const favChannels = await getChannels({ channels: channels, token: token });

  res.send(favChannels.data);
});

getData();
tokenFunction();
// getYtChannels();
