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
          .map((c) => {
            return (
              `
            <a href="https://twitch.tv/${
              c.display_name
            }" class="rounded-lg bg-stone-700 p-1 w-3/12 m-4 relative cursor-pointer transition hover:scale-105 channelBox">
                
                <div>
                  <div class="flex items-center flex-row justify-start gap-2 p-2 w-full flex-wrap hidden channelBoxImage ${
                    c.games.length <= 0 && "hidden"
                  }">
                    <div class="text-neutral-200 font-bold">Games:</div>
                  ` +
              c.games
                .map(
                  (g) =>
                    `<div class="flex items-center justify-start font-bold even:text-neutral-400 ">
                          <div>
                          ${g}
                          </div>
                      </div>`
                )
                .join("  ") +
              `
              </div>
                  <img
                    class="rounded-2xl p-2"
                    src=${
                      c.offline_image_url
                        ? c.offline_image_url
                        : "https://placehold.co/1920x1080"
                    }
                  />
                </div>
                <div class="flex items-center gap-4 p-2">
                    <div>
                        <img 
                            class="rounded-full w-16"
                            src=${c.profile_image_url}
                        />
                    </div>
                    <div>
                        <div class="font-bold">
                            ${c.display_name}
                        </div>
                        <div class="max-w-[270px] truncate text-neutral-400" title="${
                          c.description ? c.description : "No description!"
                        }">
                            ${c.description ? c.description : "No description!"}
                        </div>
                    </div>
                </div>
            </a>
        `
            );
          })
          .join(" ");
      };

      getChannelsFunction();
    });
};

mainFunc();
