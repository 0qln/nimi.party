<script lang="ts">
  import CustomCardNode from "./content-list/templates/CustomCardNode.svelte";
  import {
    TimelineEvent,
    TimelineSkip,
    type StreamMetadata,
    type TimelineDatum,
    type TimelineNodePosition,
  } from "./content-list/types";
  import PlushyGallery from "./plushie-gallery/PlushyGallery.svelte";
  import Timeline from "./content-list/Timeline.svelte";
  import HorizontalScroll from "./content-list/HorizontalScroll.svelte";
  import TwigBorder from "./frame/TwigBorder.svelte";
  import BlossomBorder from "./frame/BlossomBorder.svelte";
  import PlushyPhoto from "./plushie-gallery/PlushyPhoto.svelte";
  import { PlushyPhotoDatum } from "./plushie-gallery/types";
  import AudioControl from "./bgm/AudioControl.svelte";
  import TapirSteps from "./misc/TapirSteps.svelte";
  import Papa from "papaparse";
  import bgm from "$lib/assets/bgm/NN Anniv BGM Arr v1.wav";
  import {
    extractGoogleDriveId,
    readGoogleSheetBoolean,
    unpackModule,
  } from "./utils";
  import type { Volunteer } from "./types";
  import volunteersRaw from "$lib/assets/credits/volunteers.json?raw";
  import streamCsv from "$lib/assets/content-list/NIMI_CONTENT.csv?raw";
  import SimpleCardNode from "./content-list/templates/SimpleCardNode.svelte";

  // We use a maxium width of 350 pixels for each event note in the timeline.
  // Thus we don't need the images to be any bigger.
  const thumbnailModules = import.meta.glob(
    "$lib/assets/content-list/thumbnails/*",
    {
      query: {
        enhanced: true,
        w: "1280;640;400",
      },
    },
  );

  const plushyModules = import.meta.glob("$lib/assets/plushie-gallery/*", {
    query: {
      enhanced: true,
      w: "1280;640;400",
    },
  });

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
        isPreformatted: true,
      },
    });
  });

  const volunteers: Array<Volunteer> = JSON.parse(volunteersRaw);

  async function parseStreamCSV(csvData: string): Promise<StreamMetadata[]> {
    // 0: STREAM/EVENT TITLE
    // 1: DATE
    // 2: Thumbnail Image
    // 3: TYPE
    // 4: LOGGED?
    // 5: ON WEBSITE?
    // 6: LINK
    const headers = [
      "title",
      "date",
      "thumbnail",
      "type",
      "isLogged",
      "isOnWebsite",
      "link",
    ];

    const parseResult = Papa.parse(csvData, {
      header: false,
      skipEmptyLines: true, // data may contain empty rows
    });

    // remove the very first row (headers)
    const rows = parseResult.data.slice(1) as string[][];

    const metadata = rows
      .map((row) => {
        const item: any = {};

        headers.forEach((key, index) => {
          item[key] = row[index] ? row[index].trim() : "";
        });

        item["isLogged"] = readGoogleSheetBoolean(item["isLogged"]);
        item["isOnWebsite"] = readGoogleSheetBoolean(item["isOnWebsite"]);

        return item as StreamMetadata;
      })

      // The CSV has section dividers like "January Thumbnails..." or empty rows
      // where date or type is missing... We filter these out.
      .filter((item) => item.date !== "" && item.type !== "");

    return metadata;
  }

  const streamData = await parseStreamCSV(streamCsv);

  async function fetchThumbnail(url: string): Promise<string | undefined> {
    const findThumbnail = (id: string) => {
      return Object.entries(thumbnailModules).find(([k, _]) => k.includes(id));
    };
    const id = extractGoogleDriveId(url);
    const mod = id && findThumbnail(id);
    return mod && unpackModule(mod[1]);
  }

  function switchPosition(pos: TimelineNodePosition): TimelineNodePosition {
    return pos === "above" ? "below" : "above";
  }

  function eventId(link: string, date: Date): string {
    function linkId(link: string): string | null {
      const patterns = [/watch\?v=([a-zA-Z0-9_-]+)/];

      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    }

    function dateId(date: Date): string {
      const dateIso = date.toISOString().split("T")[0];
      return dateIso;
    }

    return [linkId(link), dateId(date)].filter((x) => x).join("_");
  }

  function partitionTitle(title: string): string[] {
    if (title.includes("【") && title.includes("】")) {
      const split = title.indexOf("】") + 1;
      return [title.slice(0, split), title.slice(split)];
    }
    return [title];
  }

  let currPosition: TimelineNodePosition = "above";
  function tsEventNode(
    row: StreamMetadata,
    args: {
      position?: TimelineNodePosition;
    } = {},
  ): TimelineEvent {
    const { position } = args;

    currPosition = position || switchPosition(currPosition);
    const thumbnail = row.thumbnail && fetchThumbnail(row.thumbnail);
    const dateObj = new Date(row.date);
    const id = eventId(row.link, dateObj);
    const title = partitionTitle(row.title);

    return new TimelineEvent({
      id,
      date: dateObj,
      component: SimpleCardNode,
      props: {
        title,
        subtitle: dateObj.toLocaleDateString(),
        imageUrl: thumbnail,
        externalLink: row.link,
        width: "350px",
        accentColor:
          row.type === "Stream"
            ? "var(--accent-color)"
            : "var(--accent-color-pink)",
      },
      position,
      expansion: "inside",
    });
  }

  function tsSkipNode(): TimelineSkip {
    return new TimelineSkip();
  }

  const timelineNodes: TimelineDatum[] = streamData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((nodes, event, index, array) => {
      // insert time skips
      if (index > 0) {
        const prevDate = new Date(array[index - 1].date).getTime();
        const currDate = new Date(event.date).getTime();
        const DAY_MS = 24 * 60 * 60 * 1000;
        if (Math.abs(currDate - prevDate) >= 6 * DAY_MS) {
          nodes.push(tsSkipNode());
        }
      }

      // add the current event node
      nodes.push(tsEventNode(event, {}));

      return nodes;
    }, [] as TimelineDatum[]);
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

  <AudioControl src={bgm} autoplay={true} />
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
