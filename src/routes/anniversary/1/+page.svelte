<script lang="ts">
  import CustomCardNode from "./content-list/templates/CustomCardNode.svelte";
  import {
    TimelineEvent,
    TimelineSkip,
    type TimelineDatum,
    type TimelineNodePosition,
  } from "./content-list/types";
  import PlushyGallery from "./plushie-gallery/PlushyGallery.svelte";
  import Timeline from "./content-list/Timeline.svelte";
  import HorizontalScroll from "./content-list/HorizontalScroll.svelte";
  import TwigBorder from "./frame/TwigBorder.svelte";
  import BlossomBorder from "./frame/BlossomBorder.svelte";
  import PlushyPhoto from "./plushie-gallery/PlushyPhoto.svelte";
  import {
    PlushyPhotoDatum,
    type PlushMetadata,
  } from "./plushie-gallery/types";
  import Papa from "papaparse";
  import bgm from "$lib/assets/bgm/NN Anniv BGM Arr v1.wav";

  // We use a maxium width of 350 pixels for each event note in the timeline.
  // Thus we don't need the images to be any bigger.
  const thumbnailModules = import.meta.glob("$lib/assets/content-list/**/*", {
    query: {
      enhanced: true,
      w: "1280;640;400",
    },
  });

  const plushyModules = import.meta.glob("$lib/assets/plushie-gallery/*", {
    query: {
      enhanced: true,
      w: "1280;640;400",
    },
  });

  async function parsePlushCSV(csvData: string): Promise<PlushMetadata[]> {
    const headers = [
      "timestamp",
      "emailAddress",
      "country",
      "message",
      "nickname",
      "socialAccount",
      "secondaryEmail",
      "photoFilename",
      "isImageAssetMade",
    ];

    const parseResult = Papa.parse(csvData, {
      header: false,
      skipEmptyLines: true,
    });

    const rows = parseResult.data.slice(1) as string[][];

    const metadata = rows.map((row) => {
      const item: any = {};
      headers.forEach((key, index) => {
        item[key] = row[index];
      });

      const boolVal = item["isImageAssetMade"];
      item["isImageAssetMade"] = boolVal?.toUpperCase() === "TRUE";

      return item;
    });

    return metadata as PlushMetadata[];
  }

  import plushyCsv from "$lib/assets/plushie-gallery/meta/plush-Photos_form-responses.csv?raw";
  const plushyResponses = await parsePlushCSV(plushyCsv);
  const sanitize = (x: string) => x.replace(/'/g, "_");
  const findPlushyMeta = (imageUrl: string) => {
    return plushyResponses.find((x) =>
      imageUrl.includes(sanitize(x.photoFilename)),
    );
  };

  const unpackModule = async (modFuture: any) => {
    const mod: any = await modFuture();
    return mod?.default;
  };

  const plushyPhotos = Object.keys(plushyModules).map((path) => {
    return {
      path,
      mod: unpackModule(plushyModules[path]),
    };
  });

  const plushyComponents = plushyPhotos.map(({ path, mod }) => {
    return new PlushyPhotoDatum({
      component: PlushyPhoto,
      props: {
        imageUrl: mod,
        path: path,
        meta: findPlushyMeta(path),
      },
    });
  });

  interface Volunteer {
    role: string;
    name: string;
    link?: string;
  }

  import volunteersRaw from "$lib/assets/credits/volunteers.json?raw";
  import AudioControl from "./bgm/AudioControl.svelte";
  import TapirSteps from "./misc/TapirSteps.svelte";
  const volunteers: Array<Volunteer> = JSON.parse(volunteersRaw);

  async function fetchThumbnail(
    date: string,
    imageName: string,
  ): Promise<string | undefined> {
    const thumbnailPath = `/src/lib/assets/content-list/${date}/${imageName}`;
    const thumbnailModule = thumbnailModules[thumbnailPath];
    if (thumbnailModule) {
      const module: any = await thumbnailModule();
      return module?.default;
    }
  }

  function switchPosition(pos: TimelineNodePosition): TimelineNodePosition {
    return pos === "above" ? "below" : "above";
  }

  let currPosition: TimelineNodePosition = "above";
  function tsEventNode(
    date: string,
    title: string,
    args: {
      position?: TimelineNodePosition;
      externalLink?: string;
      imageName?: string;
      id?: string;
    } = {},
  ): TimelineEvent {
    const {
      position,
      externalLink,
      imageName = "thumbnail.jpg",
      id = date,
    } = args;

    let image = imageName && fetchThumbnail(date, imageName);
    currPosition = position || switchPosition(currPosition);

    const dateObj = new Date(date);

    return new TimelineEvent({
      id: id,
      date: dateObj,
      component: CustomCardNode,
      props: {
        title,
        subtitle: dateObj.toLocaleDateString(),
        imageUrl: image,
        externalLink,
        width: "350px",
      },
      position,
      expansion: "inside",
    });
  }

  function tsSkipNode(): TimelineSkip {
    return new TimelineSkip();
  }

  const timelineNodes: TimelineDatum[] = [
    // august
    tsEventNode(
      "2025-08-01",
      "[3D OUTFIT REVEAL] Summer isn’t over yet! #BeachBaku",
    ),
    tsEventNode(
      "2025-08-03",
      "[Animal Revolt Battle Simulator] Determining once and for all who would win: 100 men or 1 t-rex ",
    ),
    tsEventNode(
      "2025-08-06",
      "[Crusader Kings III] I watched too much Game of Thrones so now I’m Playing CK3",
    ),
    tsEventNode(
      "2025-08-08",
      "[Static Dread] DON’T LET THEM IN Eldritch Horror + Paper, Please",
    ),
    tsEventNode(
      "2025-08-09",
      "[Crusader Kings III] Fixing the Game of Thrones timeline with the power of fatherly love",
    ),
    tsEventNode(
      "2025-08-10",
      "[RESIDENT EVIL 6] Green girls vs classic action horror WITH @mintfantome",
    ),
    tsEventNode(
      "2025-08-11",
      "[Wii Fit] Nimi gets fit with the Wii’s most ruthless fitness assistant",
    ),
    tsEventNode(
      "2025-08-13",
      "[Elden Ring] GETTING GOOD OR ELSE FOR REAL | #20",
    ),
    tsEventNode(
      "2025-08-14",
      "[RESIDENT EVIL 6] This game is ridiculous (and awesome) | #2",
    ),
    tsEventNode(
      "2025-08-15",
      "[Teddy’s Haven] Living out my dream of opening a fantasy shop",
    ),
    tsEventNode("2025-08-20", "[SKYBLOCK MINECRAFT] Day 1"),
    tsEventNode(
      "2025-08-21",
      "[SKYBLOCK MINECRAFT] The one where Nimi makes a mob farm | Day 2",
    ),
    tsEventNode(
      "2025-08-22",
      "[Teddy’s Haven] This medieval shop simulator is my cozy GOTY",
    ),
    tsEventNode(
      "2025-08-24",
      "[The Life and Suffering of Sir Brante] Your choices decide his fate & his suffering",
    ),
    tsEventNode("2025-08-25", "[SKYBLOCK MINECRAFT] On a Monday??? | Day 3"),
    tsEventNode("2025-08-27", "[Hollow Knight] Is this game hard?"),
    tsEventNode(
      "2025-08-28",
      "[Hollow Knight] One Nimi tries to beat Hollow Knight before Silksong | #2",
    ),
    tsEventNode(
      "2025-08-29",
      "[Hollow Knight] When I close my eyes, all I see is Hollow Knight | #3",
    ),
    tsEventNode("2025-08-30", "[Hollow Knight] Please no more deepnest | #4"),
    tsEventNode(
      "2025-08-31",
      "[Hollow Knight] The one where Nimi beat the game for real | #5",
    ),
    // september
    tsEventNode(
      "2025-09-01",
      "【Hollow Knight】 The one where Nimi beats the game for real",
      { externalLink: "https://youtu.be/rq7oYfJAMRw" },
    ),
    tsEventNode(
      "2025-09-04",
      "【SKYBLOCK MINECRAFT】 In my happy space",

      { externalLink: "https://youtu.be/eQT4U2_rwWc" },
    ),
    tsEventNode(
      "2025-09-05",
      "Learning to be a mother from questionable Wii games",

      { externalLink: "https://youtu.be/BlAkThwMZY0" },
    ),
    tsSkipNode(),
    tsEventNode(
      "2025-09-12",
      "【KU100 ASMR】 ✂️ Spider Girl Sizes You Up 🕸️",

      { externalLink: "https://youtu.be/d4Byvoh_Z0s" },
    ),
    tsEventNode("2025-09-13", "Nimi finds the go live button", {
      externalLink: "https://youtu.be/fldbRmQ91Pk",
    }),
    tsEventNode(
      "2025-09-14",
      "【The Quarry】 Nimi controls the fate of nine teenagers (they are doomed)",
      { externalLink: "https://youtu.be/dZwZ2LMItvw" },
    ),
    tsEventNode(
      "2025-09-17",
      " 【The Quarry】 I have a bad feeling about this | #2",

      { externalLink: "https://youtu.be/FFPqDKcsLfk" },
    ),
    tsEventNode(
      "2025-09-18",
      "【Half Sword】 Medieval Combat Simulator but make it QWOP",

      { externalLink: "https://youtu.be/HMry7BzvMig" },
    ),
    tsEventNode(
      "2025-09-20",
      "【The Wolf Among Us】 Making very good decisions in this classic Telltale Game",

      { externalLink: "https://youtu.be/VIy7mIOW8p8" },
    ),
    tsEventNode(
      "2025-09-22",
      "【Sims 2】 Can I survive as a lone child in The Sims 2?",

      { externalLink: "https://youtu.be/xeVuA5AziB8" },
    ),
    tsEventNode(
      "2025-09-24",
      " 【The Wolf Among Us】 We've got ourselves a murder mystery | #2",

      { externalLink: "https://youtu.be/M0VtCrS9D0s" },
    ),
    tsEventNode(
      "2025-09-25",
      " 【The Wolf Among Us】 That's it, I'm sending everyone to the farm | FINALE",

      { externalLink: "https://youtu.be/rD_WW200Aqg" },
    ),
    tsEventNode(
      "2025-09-26",
      " 【No, I'm Not a Human】 Your Neighbors are NOT what They Seem (Full Release)",

      { externalLink: "https://youtu.be/8oFlHDVBYLs" },
    ),
    tsEventNode(
      "2025-09-28",
      " 【ELDEN RING: SHADOW OF THE ERDTREE】 DLC starts NOW! | #1",

      { externalLink: "https://youtu.be/g8fdYvx3_mw" },
    ),
    tsEventNode(
      "2025-09-29",
      "【SKYBLOCK MINECRAFT】 0 days since last mob spawner incident",

      { externalLink: "https://youtu.be/7meuhc4aPwk" },
    ),
    // october
    tsEventNode(
      "2025-10-01",
      "10012025_forest.mp4",

      { externalLink: "https://youtu.be/h-mlJwFKnSY" },
    ),
    tsEventNode(
      "2025-10-03",
      " 【MEGABONK】 Addictive new roguelite where you BONK",

      { externalLink: "https://youtu.be/-9ofHHGZHWU" },
    ),
    tsSkipNode(),
    tsEventNode(
      "2025-10-08",
      "【Unfair Flips】 Gambling with a coin that can only flip tails",

      { externalLink: "https://youtu.be/MW3ZM5yyBcg" },
    ),
    tsEventNode(
      "2025-10-09",
      '【Road To Empress】 Ruling the palace one "good" decision at a time',

      {
        externalLink: "https://youtu.be/6_Sa67bo53I",
        imageName: "thumbnail-0.jpg",
        id: "2025-10-09_0",
      },
    ),
    tsEventNode(
      "2025-10-09",
      "youtube please",

      {
        externalLink: "https://youtu.be/q42ucyHBSZ8",
        imageName: "thumbnail-1.jpg",
        id: "2025-10-09_1",
      },
    ),
    tsEventNode(
      "2025-10-10",
      "【BIRTHDAY STREAM】 Nimi's Maze of Horrors #BirthdayBaku2025",

      { externalLink: "https://youtu.be/2-heo8MsGoY" },
    ),
    tsEventNode(
      "2025-10-12",
      "【CARIMARA】 Beautiful & Creepy Horror Game Where You have no voice",

      { externalLink: "https://youtu.be/G03zV4PlHxs" },
    ),
    tsEventNode(
      "2025-10-13",
      "【MINECRAFT SKYBLOCK】 My island is so cottagecore cozycore prisoncore",

      { externalLink: "https://youtu.be/FhdqJ-HYSP0" },
    ),
    tsEventNode(
      "2025-10-15",
      "Nimi attempts to draw Pokémon from memory",

      { externalLink: "https://youtu.be/Q5BGyVWWl_4" },
    ),
  ];
</script>

<svelte:head>
  <title>Nimi 1st Anniversary</title>
</svelte:head>

{#snippet tape1()}
  <enhanced:img
    src="$lib/assets/frame/tape-1.png"
    sizes="200px"
    alt=""
    style:width="{90}px"
    style:opacity="80%"
  />
{/snippet}

{#snippet tape2()}
  <enhanced:img
    src="$lib/assets/frame/tape-2.png"
    sizes="200px"
    alt=""
    style:width="{90}px"
    style:opacity="80%"
  />
{/snippet}

{#snippet pinRight()}
  <enhanced:img
    src="$lib/assets/frame/pin-right.png"
    sizes="100px"
    alt=""
    style:width="{50}px"
  />
{/snippet}

{#snippet pinLeft()}
  <enhanced:img
    src="$lib/assets/frame/pin-left.png"
    sizes="100px"
    alt=""
    style:width="{50}px"
  />
{/snippet}

<main class={["bg-tartan"]}>
  <div
    id="home-section"
    class={[
      "max-w-screen",
      "items-center",
      "flex",
      "flex-col",
      "space-y-1",
      "mx-auto",
      "pt-1",
      "pb-3",
      "overflow-x-hidden",
    ]}
  >
    <h1
      id="home-header"
      class={["text-8xl", "underline", "text-center", "z-10"]}
    >
      Happy Nimiversary!
    </h1>

    <div
      class={[
        "flex",
        "flex-row",
        "flex-wrap",
        "items-center",
        "justify-center",
        "w-full",
        "pacifico-regular",
        "space-x-2",
      ]}
    >
      <div class={["relative"]}>
        <enhanced:img
          src="$lib/assets/misc/note-rounded-blue.png"
          style:width="230px"
          style:transform="translate(0, -10%)"
        />
        <a
          class={[
            "absolute",
            "hover:underline",
            "text-2xl",
            "z-10",
            "w-full",
            "left-0",
            "right-0",
            "text-center",
            "top-1/2",
          ]}
          style:transform="translate(0, -50%)"
          href="#home-section">Home</a
        >
      </div>
      <div class={["relative"]}>
        <enhanced:img
          src="$lib/assets/misc/note-rounded-yellow.png"
          style:width="230px"
          style:transform="translate(0, -10%)"
        />
        <a
          class={[
            "absolute",
            "hover:underline",
            "text-2xl",
            "z-10",
            "w-full",
            "left-0",
            "right-0",
            "text-center",
            "top-1/2",
          ]}
          style:transform="translate(0, -50%)"
          href="#timeline-section">Timeline</a
        >
      </div>
      <div class={["relative"]}>
        <enhanced:img
          src="$lib/assets/misc/note-rounded-pink.png"
          style:width="230px"
          style:transform="translate(0, -10%)"
        />
        <a
          class={[
            "absolute",
            "hover:underline",
            "text-2xl",
            "z-10",
            "w-full",
            "left-0",
            "right-0",
            "text-center",
            "top-1/2",
          ]}
          style:transform="translate(0, -50%)"
          href="#plushy-section">Hello Nimi!</a
        >
      </div>
      <div class={["relative"]}>
        <enhanced:img
          src="$lib/assets/misc/note-rounded-blue.png"
          style:width="230px"
          style:transform="translate(0, -10%)"
        />
        <a
          class={[
            "absolute",
            "hover:underline",
            "text-2xl",
            "z-10",
            "w-full",
            "left-0",
            "right-0",
            "text-center",
            "top-1/2",
          ]}
          style:transform="translate(0, -50%)"
          href="#credits-section">Project Credits</a
        >
      </div>
    </div>

    <hr class={["my-0.5"]} />

    <div
      style:--bg-lines-spacing={"1.8em"}
      class={[
        "relative",
        "max-w-6xl",
        "mx-2",
        "p-1",
        "bg-lines",
        "shadow-xl",
        "rounded-4xl",
      ]}
    >
      <div class={["flex", "flex-col", "space-y-1"]}>
        <p class={["font-medium", "text-xl", "px-1", "text-center"]}>
          From many Naplings across North America and around the world, we wish
          Nimi Nightmare a happy 1 year anniversary, thank you for being here
          with us 💚
        </p>

        <p class={["font-medium", "text-xl", "px-1", "text-center"]}>
          This fan website was created by a very small team along with Napling
          Project. The website may not be 100% perfect but we hope Nimi and
          Naplings enjoy this little project.
        </p>

        <p class={["font-medium", "text-xl", "px-1", "text-center"]}>
          Please note that this website is for optimized desktop browsers and
          might not look as intended on mobile :)
        </p>
      </div>

      <div
        class={["absolute", "top-0.5", "left-0.5"]}
        style:transform="translate(-50%, -50%) rotate(-45deg)"
      >
        {@render tape1()}
      </div>

      <div
        class={["absolute", "top-0.5", "right-0.5"]}
        style:transform="translate(50%, -50%) rotate(45deg)"
      >
        {@render tape2()}
      </div>
    </div>

    <TapirSteps count={7} />

    <div
      class={[
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-2",
        "w-full",
        "overflow-y-visible",
        "space-y-2",
      ]}
    >
      <div
        id="timeline-section"
        style:--bg-lines-spacing={"1.8em"}
        class={[
          "relative",
          "max-w-3xl",
          "mx-2",
          "p-1",
          "bg-lines",
          "shadow-xl",
          "rounded-4xl",
          "flex",
          "flex-col",
          "overflow-visible",
        ]}
      >
        <div class={["flex", "flex-col", "space-y-1"]}>
          <h2
            class={[
              "text-4xl",
              "-mt-0.5",
              "text-center",
              "pacifico-regular",
              "underline",
            ]}
          >
            Timeline
          </h2>
          <p class={["font-medium", "text-xl", "px-1", "text-center"]}>
            Lots of things happened in the past year! Let’s look back at the
            streams, events, and milestones Nimi has done!
          </p>
        </div>

        <div
          class={["absolute", "top-0", "left-1/4"]}
          style:transform="translate(-50%, -50%) rotate(-5deg)"
        >
          {@render tape1()}
        </div>

        <div
          class={["absolute", "top-0", "left-3/4"]}
          style:transform="translate(-50%, -50%) rotate(5deg)"
        >
          {@render tape2()}
        </div>
      </div>

      <BlossomBorder>
        <TwigBorder>
          <div
            class={[
              "overflow-hidden",
              "inline-flex",
              "bg-dots",
              "shadow-xl",
              "rounded-4xl",
              "w-full",
            ]}
          >
            <HorizontalScroll clazz={["relative", "w-full"]}>
              <Timeline data={timelineNodes} orientation="horizontal" />
            </HorizontalScroll>
          </div>
        </TwigBorder>
      </BlossomBorder>
    </div>

    <TapirSteps count={6} />

    <div
      class={[
        "relative",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "mx-2",
        "mt-3",
        "p-1",
        "bg-dots",
        "shadow-xl",
        "rounded-4xl",
        "w-full",
        "max-w-6xl",
        "space-y-1",
        "overflow-visible",
      ]}
    >
      <enhanced:img
        id="plushy-section"
        src="$lib/assets/misc/hellonimi-header.png"
        style:width="500px"
        style:margin-top="-30%"
      />
      <p class={["font-medium", "text-2xl", "px-1", "text-center"]}>
        Where have the Nimi plushies been? Thank you Naplings for taking her
        around!
      </p>
      <PlushyGallery data={plushyComponents} />

      <!-- todo: y spacing fix -->
      <div
        class={["absolute", "top-1", "right-0"]}
        style:transform="translate(-50%, -50%)"
      >
        {@render pinRight()}
      </div>
      <div
        class={["absolute", "top-1", "left-1"]}
        style:transform="translate(-50%, -50%)"
      >
        {@render pinLeft()}
      </div>
    </div>

    <TapirSteps count={7} />

    <div
      id="credits-section"
      style:--bg-lines-spacing={"var(--spacing)"}
      class={[
        "relative",
        "max-w-5xl",
        "mx-2",
        "p-1",
        "bg-lines",
        "shadow-xl",
        "rounded-4xl",
        "flex",
        "flex-col",
      ]}
    >
      <div class={["flex", "flex-col", "space-y-1"]}>
        <h2
          class={[
            "text-4xl",
            "-mt-0.5",
            "text-center",
            "pacifico-regular",
            "underline",
          ]}
        >
          Project Credits
        </h2>
        <div class={["grid", "grid-cols-2", "gap-x-1", "mt-0.5"]}>
          {#each volunteers as volunteer}
            <p
              style:line-height={"var(--spacing)"}
              class={["font-medium", "text-xl", "text-right", "text-end"]}
            >
              <span style:vertical-align="bottom">{volunteer.role}</span>
            </p>
            <div
              style:height={"1.8em"}
              class={["flex", "flex-row", "items-center", "space-x-0.5"]}
            >
              <p class={["font-medium", "text-xl"]}>
                {volunteer.name}
              </p>
              {#if volunteer.link}
                <a
                  href={volunteer.link}
                  target="_blank"
                  aria-label="External link to volunteer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class={["size-0.5", "card-icon"]}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                  </svg>
                </a>
              {/if}
            </div>
          {/each}
        </div>
        <p class={["font-extrabold", "text-xl", "px-1", "text-center"]}>
          Thank you to the team for making this project happen!
        </p>
      </div>

      <div
        class={["absolute", "top-0.5", "left-0.5"]}
        style:transform="translate(-50%, -50%) rotate(-45deg)"
      >
        {@render tape1()}
      </div>

      <div
        class={["absolute", "top-0.5", "right-0.5"]}
        style:transform="translate(50%, -50%) rotate(45deg)"
      >
        {@render tape2()}
      </div>
    </div>
  </div>

  <AudioControl src={bgm} />
</main>

<style>
  @import "/src/fonts.css";
  @import "./palettes/1.css";

  :global(h1) {
    color: var(--text-color-h1);
  }

  :global(h2) {
    color: var(--text-color-h2);
  }

  p {
    color: var(--text-color-p);
  }

  a {
    color: var(--text-color-a);
  }

  :global(:root) {
    --bg-lines-height: 0.9px;
    --bg-lines-spacing: 20px;

    --bg-dots-size: 1.5px;
    --bg-dots-spacing: 24px;

    --spacing: 2rem;
  }

  :global(hr) {
    color: color-mix(in srgb, var(--bg-color-accent) 30%, transparent);
  }

  :global(:root:has(main.bg-lines), .bg-lines) {
    background-color: var(--bg-color);
    opacity: 1;
    background-size: var(--bg-lines-spacing) var(--bg-lines-spacing);
    background-image: repeating-linear-gradient(
      0deg,
      var(--bg-color-alt),
      var(--bg-color-alt) var(--bg-lines-height),
      var(--bg-color-paper) var(--bg-lines-height),
      var(--bg-color-paper)
    );
  }

  :global(:root:has(main.bg-dots), .bg-dots) {
    background-color: var(--bg-color);
    opacity: 1;
    background-image: radial-gradient(
      var(--bg-color-alt) var(--bg-dots-size),
      var(--bg-color) var(--bg-dots-size)
    );
    background-size: var(--bg-dots-spacing) var(--bg-dots-spacing);
  }

  :global(:root:has(main.bg-tartan)) {
    --dark-50: color-mix(in srgb, var(--bg-color-dark) 50%, transparent);
    --dark-60: color-mix(in srgb, var(--bg-color-dark) 60%, transparent);
    --dark-20: color-mix(in srgb, var(--bg-color-dark) 20%, transparent);
    --dark-30: color-mix(in srgb, var(--bg-color-dark) 30%, transparent);
    --bright-1-30: color-mix(in srgb, var(--bg-color-accent) 30%, transparent);
    --bright-2-30: color-mix(in srgb, var(--bg-color-alt) 30%, transparent);

    background-color: var(--bg-color);

    background-image:
      repeating-linear-gradient(
        transparent,
        transparent 50px,
        var(--dark-30) 50px,
        var(--dark-30) 53px,
        transparent 53px,
        transparent 63px,
        var(--dark-30) 63px,
        var(--dark-30) 66px,
        transparent 66px,
        transparent 116px,
        var(--dark-20) 116px,
        var(--dark-20) 166px,
        var(--bright-2-30) 166px,
        var(--bright-2-30) 169px,
        var(--dark-20) 169px,
        var(--dark-20) 179px,
        var(--bright-2-30) 179px,
        var(--bright-2-30) 182px,
        var(--dark-20) 182px,
        var(--dark-20) 232px,
        transparent 232px
      ),
      repeating-linear-gradient(
        270deg,
        transparent,
        transparent 50px,
        var(--dark-30) 50px,
        var(--dark-30) 53px,
        transparent 53px,
        transparent 63px,
        var(--dark-30) 63px,
        var(--dark-30) 66px,
        transparent 66px,
        transparent 116px,
        var(--dark-20) 116px,
        var(--dark-20) 166px,
        var(--bright-1-30) 166px,
        var(--bright-1-30) 169px,
        var(--dark-20) 169px,
        var(--dark-20) 179px,
        var(--bright-1-30) 179px,
        var(--bright-1-30) 182px,
        var(--dark-20) 182px,
        var(--dark-20) 232px,
        transparent 232px
      ),
      repeating-linear-gradient(
        125deg,
        transparent,
        transparent 2px,
        var(--dark-20) 2px,
        var(--dark-20) 3px,
        transparent 3px,
        transparent 5px,
        var(--dark-20) 5px
      );
  }

  :global(*:has(+ .tapir-path)) {
    margin-bottom: 0;
  }

  :global(* + .tapir-path) {
    margin-top: 0;
  }
</style>
