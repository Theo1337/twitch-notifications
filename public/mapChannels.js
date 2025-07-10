import { getChannels } from "./getTwitchChannel.js";

const mainFunc = async () => {
  fetch("./channels_list.txt")
    .then((res) => res.text())
    .then((txt) => {
      const val = JSON.parse(txt);
      const channels_list = document.getElementById("list");

      let channels = [];
      let channelsArr = [];
      let channelsNames = [];

      val.forEach((c) => channelsArr.push(c.name));

      channelsArr.forEach((e, i) => {
        channelsNames.push(`${i === 0 ? "?" : "&"}login=${e}`);
      });
      const channels_string = channelsNames.toString().replaceAll(",", "");

      const CHANNELS_URL = `https://api.twitch.tv/helix/users${channels_string}`;

      const getChannelsFunction = async () => {
        const fetchChannels = await getChannels({
          channels: channelsArr,
          url: CHANNELS_URL,
        });

        channels = fetchChannels;

        channels.forEach((c) => {
          //prettier-ignore
          const channel = val.filter((ch) => c.display_name.toLowerCase() == ch.name);

          c.games = channel[0]?.games ? channel[0]?.games : [];
        });

        channels_list.innerHTML = channels
          .sort((a, b) => a.display_name.localeCompare(b.display_name))
          .map((c, idx) => {
            return `
      <div
         class="rounded-lg bg-stone-700 p-1 w-3/12 m-4 relative transition channelBox">
        <div>
          <img
            class="rounded-2xl p-2"
            src=${
              c.offline_image_url
                ? c.offline_image_url
                : "https://static.vecteezy.com/system/resources/thumbnails/053/821/289/small_2x/offline-glitch-banner-glitch-effect-offline-video.jpg"
            }
          />
        </div>
        <div class="flex items-center gap-4 p-2">
          <div>
            <img class="rounded-full w-16" src=${c.profile_image_url} />
          </div>
          <div>
            <a href="https://twitch.tv/${c.display_name}" class="hover:underline font-bold">${c.display_name}</a>
            <div class="max-w-[270px] truncate text-neutral-400" title="${
              c.description ? c.description : "No description!"
            }">
              ${c.description ? c.description : "No description!"}
            </div>
          </div>
        </div>
        <div class="flex gap-2 p-2 w-full">
          <input type="text" placeholder="Add game..." class="add-game-input bg-stone-800 w-full text-white rounded px-2 py-1 text-sm" data-idx="${idx}" />
          <button class="add-game-btn bg-green-600 text-white rounded px-2 py-1 text-sm" data-idx="${idx}">Add Game</button>
        </div>
        <div class="px-2 pb-2 float-right pt-4">
          <button class="remove-channel-btn bg-red-600 text-white rounded px-2 py-1 text-sm" data-idx="${idx}">Remove channel</button>
        </div>
         <div class="flex items-center max-w-full overflow-x-auto justify-start gap-2 p-2 w-full channelBoxImage ${
           c.games.length <= 0 && "hidden"
         }">
            <div class="text-neutral-200 font-bold">Games:</div>
            ${c.games
              .map(
                (g, gameIdx) => `
      <div class="flex items-center justify-start font-bold text-xs text-nowrap even:text-neutral-400 ">
        <div>${g}</div>
        <button 
          class="remove-game-btn ml-2 bg-red-500 text-white rounded px-1 py-0.5 text-xs" 
          data-idx="${idx}" data-game-idx="${gameIdx}" title="Remove game">
          ✕
        </button>
      </div>`,
              )
              .join("  ")}
          </div>
      </div>
      `;
          })
          .join(" ");

        // Add Game functionality
        document.querySelectorAll(".add-game-btn").forEach((btn) => {
          btn.onclick = async (e) => {
            const idx = btn.getAttribute("data-idx");
            const input = document.querySelector(
              `.add-game-input[data-idx="${idx}"]`,
            );
            const game = input.value.trim();
            if (!game) return;
            // Send to backend
            await fetch("/api/add-game", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                channel: channels[idx].display_name,
                game,
              }),
            });
            input.value = "";
            location.reload(); // Reload to update UI
          };
        });

        // Remove Channel functionality
        document.querySelectorAll(".remove-channel-btn").forEach((btn) => {
          btn.onclick = async (e) => {
            const idx = btn.getAttribute("data-idx");
            if (!confirm(`Remove channel ${channels[idx].display_name}?`))
              return;
            await fetch("/api/remove-channel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ channel: channels[idx].display_name }),
            });
            location.reload(); // Reload to update UI
          };
        });

        document.querySelectorAll(".remove-game-btn").forEach((btn) => {
          btn.onclick = async (e) => {
            const idx = btn.getAttribute("data-idx");
            const gameIdx = btn.getAttribute("data-game-idx");
            const channelName = channels[idx].display_name;
            const gameName = channels[idx].games[gameIdx];
            if (!confirm(`Remove game "${gameName}" from ${channelName}?`))
              return;
            await fetch("/api/remove-game", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ channel: channelName, game: gameName }),
            });
            location.reload(); // Reload to update UI
          };
        });
      };

      getChannelsFunction();
    });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then(function (reg) {
      const key =
        "BO3X9jaW74ubvrJv8BUZN2-9WoWil6tp2aD-27UHjMEi3EoF_P1DZoLE34FY4p4BPTYTf43zQ5fXmsyXxy--oLw";
      // Subscribe for push
      reg.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        })
        .then(function (subscription) {
          fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription),
          });
        });
    });

    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  }
};

mainFunc();
