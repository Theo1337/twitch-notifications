const express = require("express");
const app = express();

app.get("/", (request, response) => {
  response.sendFile("./pages/home.html", { root: __dirname });
});

app.listen(3002); // Recebe solicitações que o deixa online

let access_token;
let notifiedChannels;
let channels;

const saveData = () => {
  const fs = require("fs");
  const value = JSON.stringify(channels);

  fs.writeFileSync("channels_list.txt", value, "utf-8");
};

const saveNotifiedData = () => {
  const fs = require("fs");
  const value = JSON.stringify(notifiedChannels);

  fs.writeFileSync("notified_channels_list.txt", value, "utf-8");
};

const getData = () => {
  const fs = require("fs");

  const channels_value = fs.readFileSync("channels_list.txt", "utf-8");
  channels = JSON.parse(channels_value);

  const notified_value = fs.readFileSync("notified_channels_list.txt", "utf-8");
  notifiedChannels = JSON.parse(notified_value);
};

const getChannels = async (el) => {
  const getChannels = require("../functions/getChannels");
  const notifyUser = require("../functions/notifyUser");

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
  const getToken = require("../functions/getToken");

  const token_func = await getToken();

  const token = token_func.access_token;

  if (token) {
    access_token = token;
    getChannels({ token: token });
  }
};

setInterval(() => {
  if (access_token) {
    console.log("Refreshing content!");
    getChannels({ token: access_token });

    console.clear();
  }
}, 90000);

const schedule = require("node-schedule");

schedule.scheduleJob("5 9 * * *", function () {
  const notifyUser = require("../functions/notifyUser");
  console.log("Resetting Channels!");
  notifiedChannels = [""];

  saveNotifiedData();
  notifyUser({ type: "reset" });
});

getData();
tokenFunction();
