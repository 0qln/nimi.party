<script lang="ts">
  import type { Component } from "svelte";
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
  import TwigBorder from "./tiling-border/TwigBorder.svelte";
  import BlossomBorder from "./tiling-border/BlossomBorder.svelte";

  // We use a maxium width of 350 pixels for each event note in the timeline.
  // Thus we don't need the images to be any bigger.
  const thumbnailModules = import.meta.glob("$lib/assets/content-list/**/*", {
    query: {
      enhanced: true,
      w: "1280;640;400",
    },
  });

  async function tsEventNode(
    date: string,
    title: string,
    content: string,
    position: TimelineNodePosition,
    externalLink: string | undefined = undefined,
    imageName: string | undefined = "thumbnail.jpg",
    id: string = date,
  ): Promise<TimelineEvent> {
    let image;
    if (imageName) {
      const thumbnailPath = `/src/lib/assets/content-list/${date}/${imageName}`;
      const thumbnailModule = thumbnailModules[thumbnailPath];
      if (thumbnailModule) {
        const module: any = await thumbnailModule();
        image = module?.default;
      }
    }
    console.log(image);

    const dateObj = new Date(date);

    return new TimelineEvent({
      id: id,
      date: dateObj,
      component: CustomCardNode,
      props: {
        title,
        subtitle: dateObj.toLocaleDateString(),
        content,
        imageUrl: image,
        externalLink,
        width: "350px",
      },
      position,
      expansion: "inside",
    });
  }

  async function tsSkipNode(): Promise<TimelineSkip> {
    return new TimelineSkip();
  }

  const timelineNodes: TimelineDatum[] = [
    await tsEventNode(
      "2025-09-01",
      "【Hollow Knight】 The one where Nimi beats the game for real",
      `
        After marathoning Hollow Knight for 4 days, Nimi starts looking for dream bosses to fight.
        Nimi fights Markoth, the White Defender then starts attempting the platforming challenges of the White Palace. She eventually retreats and begins exploring the Hive and takes on the Hive Knight for the Hiveblood. With the Hiveblood Charm, Nimi returns to the White Palace and claims the Kingsoul. After evolving the Kingsoul to the Void Heart in the Abyss’s Birthplace, Nimi reaches one of the endings of Hollow Knight and attempts to fight Radiance. Satisfied with the ending she got and longing for Minecraft, she decides to stop her marathon.
      `,
      "below",
      "https://youtu.be/rq7oYfJAMRw",
    ),
    await tsEventNode(
      "2025-09-04",
      "【SKYBLOCK MINECRAFT】 In my happy space",
      `
        After not having attended to her Skyblock Minecraft world for a week, Nimi doesn’t remember what were her planned tasks. She works on grinding more cobblestone, XP and gold while discussing what games and shows she is thinking of consuming next. While grinding her mob farm, she manages to isolate a zombified villager and witch to use the witch’s weakness potion to cure the villager. She then builds out a housing space for the new villager and works on expanding her skyblock island. Afterwards, she starts grinding the mob farm again in hopes of finding another zombified villager until a creeper destroys part of the structure. She repairs the farm and continues grinding until she finds another zombified villager. She then gathers the materials and witch, cures the villager, brings it into her villager house and closes the stream for the day.
      `,
      "above",
      "https://youtu.be/eQT4U2_rwWc",
    ),
    await tsEventNode(
      "2025-09-05",
      "Learning to be a mother from questionable Wii games",
      `
        Nimi starts off with playing “Babysitting Mama” with partial 3D tracking on and comments about the cursed baby doll accessory she doesn’t have that is intended for the wiimote. She performs various tasks with janky motion controls that are part of raising a baby like comforting a baby, feeding milk, burping a baby and changing diapers. After clearing all the task minigames for one baby, she decides to switch the Wii game to “Star Wars: The Clone Wars - Lightsaber Duels”. After briefly going through the tutorial and trying the main campaign, she decides to switch to “Hannah Montana: Spotlight World Tour”. She is quickly reminded though that Hannah Montana is a Disney property (as well as Star Wars) and switches to “Dora Saves the Snow Princess”. However, she was not mentally strong enough to play the children’s game for very long. She then switches to “Big Brain Academy: Wii Degree” and scores an above average score on the test in game. Satisfied with her score, she changes the game to “Spore Hero”. After playing “Spore Hero” briefly, she decides to give a quick review of all the games she played this stream and ends for the day.
      `,
      "below",
      "https://youtu.be/BlAkThwMZY0",
    ),
    await tsSkipNode(),
    await tsEventNode(
      "2025-09-12",
      "【KU100 ASMR】 ✂️ Spider Girl Sizes You Up 🕸️",
      `
        You make a late night visit to the spider Ariadne.
      `,
      "above",
      "https://youtu.be/d4Byvoh_Z0s",
    ),
    await tsEventNode(
      "2025-09-13",
      "Nimi finds the go live button",
      `
        After a week-long break from streaming, Nimi finds the go live button without much of a plan on what to do. She chats about how she spent her break, her recent ASMR video, her Autumn plans and other miscellaneous topics. She eventually gets on the subject of monster girls and starts making a quick monster girl tier list. She also remembers to do some free pulls in Umamusume and gets a new outfit for Gold Ship. She ends her free talk with chatting a little about the book she’s writing and what she plans on playing on stream the next day.

      `,
      "below",
      "https://youtu.be/fldbRmQ91Pk",
    ),
    await tsEventNode(
      "2025-09-14",
      "【The Quarry】 Nimi controls the fate of nine teenagers (they are doomed)",
      `
        Nimi opens the stream with a chat about her experience in Vegas and about her recent watch of Star Wars Episode 4. She starts the game and talks a bit about what she has heard about it and what actors she recognizes in the game. While playing the Prologue, she selects options leaning towards more honesty and helpfulness and failing only a few quick time events. She goes through Chapter 1 while selecting choices that lean towards safety but with a little skepticism. In Chapter 2, she is a bit more inquisitive and tries nurturing relationships while having some problems with stick drift on her controller. She progresses to Chapter 3 and plays defensively after feeling a bit betrayed by some of the characters. After reaching the start of Chapter 4, she decides to end the stream for the day.

      `,
      "above",
      "https://youtu.be/dZwZ2LMItvw",
    ),
    await tsEventNode(
      "2025-09-17",
      " 【The Quarry】 I have a bad feeling about this | #2",
      `
        Despite catching and still recovering from a cold, Nimi decides to stream. She starts the stream off talking a bit about a new book she has been reading, tells a story about a Zoo summer camp she attended and then resumes the game from Chapter 4. Unfortunately during Chapter 4, she makes a fatal mistake that costs the life of one of the characters (she didn’t like that character anyways). While progressing through Chapter 5, she starts selecting decisions that sow some discord between the characters but she manages to keep the remaining characters alive. She manages to survive Chapter 6 with everyone still while also trying to make decisions to ruin certain character relationships that she doesn’t like. In Chapter 7, she learns about the monsters that are attacking the characters and what she must do to be rid of them. She starts going on the offensive for Chapter 8 against the Hacketts and manages to survive all the encounters in Chapter 9. In the finale of Chapter 10, her controller stick drift manages to mess up some crucial quick time events and gets multiple characters killed. With that ending, she decides to end the stream and thinks about getting a new controller.
      `,
      "below",
      "https://youtu.be/FFPqDKcsLfk",
    ),
    await tsEventNode(
      "2025-09-18",
      "【Half Sword】 Medieval Combat Simulator but make it QWOP",
      `
        Still feeling a little sick, Nimi decides on a shorter stream of Half Sword. She starts off with clumsily engaging in fisticuffs with random opponents in a small arena as a beggar. As she fights more opponents (and avoids looking at the gore), she realizes that weapons are important for victory. After some wins against smaller groups of opponents, a great champion appears and Nimi struggles many times to win against them. She ends the stream after defeating the great champion and trying out the new class she unlocked.
      `,
      "above",
      "https://youtu.be/HMry7BzvMig",
    ),
    await tsEventNode(
      "2025-09-20",
      "【The Wolf Among Us】 Making very good decisions in this classic Telltale Game",
      `
        Still feeling a little bit congested, Nimi decides to keep playing movie-like games to make things easier for streams. Before starting the game, she talks about how her cold has been and her new favorite book “Kushiel’s Dart”. She plays Episode 1 selecting choices that give her a mean “bad cop” attitude, but after getting berated by a character for being mean, she eases up. A murder happens in the game and she is set to investigate the crime. In Episode 2 she starts talking to suspects, following leads and using the Gerald censor to (poorly) cover up a club scene. After finishing Episode 2, she decides it’s a good stopping point and ends the stream.
      `,
      "below",
      "https://youtu.be/VIy7mIOW8p8",
    ),
    await tsEventNode(
      "2025-09-22",
      "【Sims 2】 Can I survive as a lone child in The Sims 2?",
      `
        Despite being a Minecraft Monday, Nimi really felt like playing the Sims in this stream. She starts the stream with an already made “Mega Nightmare” Sims adult with a child “Mini Nightmare” to act as the lone child for a challenge. The challenge is to have the child be the one earning money and surviving while keeping the parent locked in the basement so child protection services don’t immediately end the challenge. She first builds a basement with the minimal necessities to house the parent and then a small house for the child. The child is then put to work by making paintings to sell and running a lemonade stand. After some struggles with the repo man and keeping Mega Nightmare alive, Mini Nightmare grows into a teenager and Nimi immediately removes Mega Nightmare. Mini goes through many struggles as a teenager like losing her part time job, loneliness, school and more before finally becoming an adult. Nimi then declares herself victorious over the challenge and proceeds to do a quick few free pulls in Umamusume before ending the stream.
      `,
      "above",
      "https://youtu.be/xeVuA5AziB8",
    ),
    await tsEventNode(
      "2025-09-24",
      " 【The Wolf Among Us】 We've got ourselves a murder mystery | #2",
      `
        Starting the stream off with a short chat, Nimi talks a little about Star Wars, Lord of the Rings and Dungeons & Dragons before getting to the game. Resuming from the cliffhanger of the last episode, Nimi gets a big lead and a prime suspect on the murders. She spends Episode 3 trying to keep to less violent decisions while chasing down the suspect only to find there is more to the mystery. In Episode 4, she learns that she may need to be cautious of the people close to her and starts facing some moral dilemmas with some of the characters that she meets. Nimi tries sticking to options that are more level-headed despite really wanting to play the bad cop sometimes. At the end of Episode 4, Nimi still manages to keep calm even when faced with the possible mastermind behind the crimes. With the ending cliffhanger, Nimi decides to leave Episode 5 for the next stream.
      `,
      "below",
      "https://youtu.be/M0VtCrS9D0s",
    ),
    await tsEventNode(
      "2025-09-25",
      " 【The Wolf Among Us】 That's it, I'm sending everyone to the farm | FINALE",
      `
        Starting with her usual short chat before the game, Nimi talks about her cats, what Churus (cat treats) would taste the best for a human and health care. She also gives her theory on the mystery in the game before starting the final episode. Resuming from the cliffhanger on Episode 4, Nimi manages to survive the onslaught of attacks from criminals and accomplices while chasing down the mastermind. Along the way, she is faced with many moral dilemmas and tries to do what she thinks is right. In the end, she dispenses justice as she sees fit and ends Episode 5. Curious about the results of some of the other choices she could have made, she replays part of Episode 5 and feels that she made the right choices the first time. Even after finishing “The Wolf Among Us”, Nimi still feels like streaming and starts playing Elden Ring: Nightreign with Naplings. With one successful round of Nightreign done, she ends the stream for the day.
      `,
      "above",
      "https://youtu.be/rD_WW200Aqg",
    ),
    await tsEventNode(
      "2025-09-26",
      " 【No, I'm Not a Human】 Your Neighbors are NOT what They Seem (Full Release)",
      `
        For the pregame chatting, Nimi talks about the new Pokemon Legends game, some of the new Mega Evolutions she saw circulating online, baked goods and alcohol. Upon starting the game, Nimi admires some of the new features and lore that have been added since the demo she played earlier in the year. Remembering how she played last time, she decides to be a bit more cautious on who she lets into the house instead of letting everyone in. She lets in some eccentric characters thinking that Visitors wouldn’t be capable of imitating their eccentricity, but quickly learns that might not always be true. At some point, a character holding a cat shows up and Nimi lets them in (She loves the cat). As the days progress in the game, Nimi survives without many Visitors killing other characters she brought in and rather abruptly gets an ending after receiving a baby. She admires how many more characters they added to the game since the demo and wants to look up the other endings. Satisfied with the apparent rare ending she got, she ends the stream for the day.
      `,
      "below",
      "https://youtu.be/8oFlHDVBYLs",
    ),
    await tsEventNode(
      "2025-09-28",
      " 【ELDEN RING: SHADOW OF THE ERDTREE】 DLC starts NOW! | #1",
      `
        For the stream today, Nimi was unsure what to play but she felt like playing Elden Ring possibly from recently playing Nightreign. She decided on trying the DLC and also wants to use a different build. Looking up builds online, she decides on a bleed build and starts exploring the DLC area. As she explores, she struggles with her controller stick drift and talks about what she has heard about the difficulty of the DLC and Hollow Knight: Silksong. She eventually finds a boss and manages to defeat it with relative ease and finds her bleed build doing good damage. However, as she continues exploring, she also finds some areas with enemies that are resistant to her bleed build. After defeating a few more bosses and progressing the story, she is satisfied with her new build and ends the stream for the day.
      `,
      "above",
      "https://youtu.be/g8fdYvx3_mw",
    ),
    await tsEventNode(
      "2025-09-29",
      "【SKYBLOCK MINECRAFT】 0 days since last mob spawner incident",
      `
        Nimi returns to Minecraft Monday and tries to remember what she needs to do next. She realizes that she left the mob spawner broken since the last time she played, but she wants to expand the villager living area instead. As she grinds for materials and builds, she talks about miscellaneous topics like programming, math, cooking and Airbnbs. After building a new house for the villagers, she starts working on adding a fence around the village as well while talking about other random topics like Kushiel’s Dart and Twilight. She also decides on creating a farm to get food for repopulating the villagers. As she waits for the crops to grow, she fishes and talks about other topics like her cats and foods. After getting the food, the villagers successfully multiply and Nimi marks off an item on the to-do list for Skyblock before ending the stream for the day.
      `,
      "below",
      "https://youtu.be/7meuhc4aPwk",
    ),
    await tsEventNode(
      "2025-10-01",
      "10012025_forest.mp4",
      `
        To start off the month of October, Nimi puts up a mysterious stream where she is walking through some dark woods. To calm herself down while walking through the scary woods, she starts singing various songs that fit the mood of autumn and horror (and whatever she feels like). She eventually spots something truly terrifying.
      `,
      "above",
      "https://youtu.be/h-mlJwFKnSY",
    ),
    await tsEventNode(
      "2025-10-03",
      " 【MEGABONK】 Addictive new roguelite where you BONK",
      `
        Nimi discovers a new addictive roguelite with good reviews and decides to try it out on stream. Jumping right in she immediately sees the Vampire Survivors influence on the game and is also immediately overstimulated. Fighting motion sickness and controller stick drift, she tries surviving many waves of enemies as long as she can in a couple of rounds while getting new upgrades. As she keeps playing rounds, she unlocks new characters that she tries as well. After many rounds of trying to survive, she eventually finds a stopping point and ends the stream for the day.
      `,
      "below",
      "https://youtu.be/-9ofHHGZHWU",
    ),
    await tsSkipNode(),
    await tsEventNode(
      "2025-10-08",
      "【Unfair Flips】 Gambling with a coin that can only flip tails",
      `
        After a short break, Nimi has once again forgotten how to stream and starts a new gambling game. She starts off with an announcement that she has finally gotten a new controller (the 8bitdo ultimate 2) and her upcoming birthday stream plan. Eventually after talking about wanting a clone of herself, she starts the game where she simply flips a coin that is rigged to mostly land on tails. As she flips the coin and aims for the objective of getting 10 heads in a row, she talks about miscellaneous topics like Sonic The Hedgehog characters, the upcoming Pokemon Legends game, washing clothes and weddings. At some point while talking about backseating someone’s financials and forging signatures, she gets 10 heads in a row and gets an ending of the game. Satisfied with the ending, she decides to switch to playing Elden Ring: Nightreign. After a few successful runs with Naplings in Nightreign, she ends the stream for the day.
      `,
      "above",
      "https://youtu.be/MW3ZM5yyBcg",
    ),
    await tsEventNode(
      "2025-10-09",
      '【Road To Empress】 Ruling the palace one "good" decision at a time',
      `
        Nimi decides on trying a FMV type of game with a story and setting in China’s Tang Dynasty era after seeing a bit of gameplay of it from another streamer. After a short story of how she took a class on ancient chinese literature, she starts the game and also quickly learns how easy it is to get a bad ending. As she navigates the maze of incorrect decisions, YouTube randomly suspends her stream for policy violations multiple times and also unsuspends it multiple times mid-stream. Fearing how these random policy violations could affect her channel, Nimi decides to drop the stream and start a new one without this particular game.
      `,
      "below",
      "https://youtu.be/6_Sa67bo53I",
      "thumbnail-0.jpg",
      "2025-10-09_0",
    ),
    await tsEventNode(
      "2025-10-09",
      "youtube please",
      `
        Confused and afraid as to why her Road To Empress stream was getting blocked, Nimi switches to a walking simulator type of horror game called Eclipsium. The game starts in a hospital and after solving a puzzle to leave the hospital, Nimi starts walking through a bizarre dreamscape-like environment. As she progresses, she also gains strange and slightly disturbing power ups to solve puzzles. With each little bit of lore told through cutscenes, Nimi theorizes about the environment that she is in and about the main character. The game continues presenting many bizarre and slightly disturbing environments that trigger certain fears for Nimi, but she goes through and enjoys the strange environments to the end.
      `,
      "above",
      "https://youtu.be/q42ucyHBSZ8",
      "thumbnail-1.jpg",
      "2025-10-09_1",
    ),
    await tsEventNode(
      "2025-10-10",
      "【BIRTHDAY STREAM】 Nimi's Maze of Horrors #BirthdayBaku2025",
      `
        It’s Nimi’s birthday and she has a TTRPG game set up to play with Phoebe and Mint. The objective is to get to the center of a hedge maze set up by the minotaur Nimi. After explaining how the game and stats works, Phoebe and Mint select their stats with Phoebe going for a charisma build and Mint going for a yeet build.
      `,
      "below",
      "https://youtu.be/2-heo8MsGoY",
    ),
    await tsEventNode(
      "2025-10-12",
      "【CARIMARA】 Beautiful & Creepy Horror Game Where You have no voice",
      `
        A few days after her birthday stream and still a little tired from birthday preparations, Nimi decides to stream a less intense horror game for October. Before starting the game, she talks about the birthday merch, how to draw herself and imagining where bugs could possibly be. Nimi starts the game off in a small house of an old lady who is seeking a carimara for help with a ghost problem. As the carimara, she explores the house and immediately finds the ghost and is attacked by it. She learns that she needs to unravel the mystery of who the ghost was first before attempting to exorcise it. Nimi sets off on talking to other characters and exploring more of the property for clues about the ghost. After gathering some more information, she figures out the mystery behind the ghost and finishes the game. Happy with the ending, Nimi moves onto the game Threshold. The game starts her off as a character clocking into their new job at a train station. After another character explains the job and what to do, Nimi performs the tasks for the job while exploring the area she is assigned to. As she explores, she finds the station is in need of repairs and has concerns about some of the things she sees around like a fresh grave. She eventually discovers something disturbing about the train contents and reaches one of the endings of the game. Still confused about the story, she tries looking up some theories before ending the stream for the day.
      `,
      "above",
      "https://youtu.be/G03zV4PlHxs",
    ),
    await tsEventNode(
      "2025-10-13",
      "【MINECRAFT SKYBLOCK】 My island is so cottagecore cozycore prisoncore",
      `
        It’s Minecraft Monday once again and Nimi also doesn’t remember what she was doing again. She talks about miscellaneous topics like her recent dance lessons for something that is coming up, some Minecraft challenge videos she watched and difficult games she thinks about playing or going back to while mindlessly grinding more resources. At some point, a baby zombie piglin somehow manages to follow her from the nether to her overworld and she decides to keep it safe. As time passes, she sees her village starting to become self-sufficient and growing by itself. She gathers the materials for a fletching table and gets a villager that can trade sticks for emeralds so she can eventually trade for more resources with the emeralds. She continues grinding more resources while talking about miscellaneous topics including the origin of her name.
      `,
      "below",
      "https://youtu.be/FhdqJ-HYSP0",
    ),
    await tsEventNode(
      "2025-10-15",
      "Nimi attempts to draw Pokémon from memory",
      `
        todo...
      `,
      "above",
      "https://youtu.be/Q5BGyVWWl_4",
    ),
  ];

  import tape from "$lib/assets/frame/paper-tape.png";
</script>

<svelte:head>
  <title>Nimi 1st Anniversary</title>
</svelte:head>

<main class={["bg-tartan"]}>
  <div
    class={["max-w-screen", "flex", "flex-col", "space-y-1", "mt-1", "mx-auto"]}
  >
    <h1 class={["text-8xl", "underline", "text-center"]}>Happy Nimiversary!</h1>

    <hr />

    <div
      style:--bg-lines-spacing={"1.8em"}
      class={[
        "max-w-5xl",
        "rounded-4xl",
        "mx-auto",
        "bg-lines",
        "flex",
        "relative",
        "flex-col",
        "space-y-1",
        "p-1",
        "shadow-xl",
      ]}
    >
      <img
        src={tape}
        alt=""
        class={[
          "absolute",
          "-left-1",
          "-top-1",
          "h-2.5",
          "w-2.5",
          "pt-0.5",
          "pl-0.5",
        ]}
      />
      <img
        src={tape}
        alt=""
        class={[
          "absolute",
          "-right-1",
          "-top-1",
          "h-2.5",
          "w-2.5",
          "pt-0.5",
          "pl-0.5",
          "-scale-x-100",
          "-rotate-6",
        ]}
      />
      <p class={["font-medium", "text-xl", "px-1", "text-center"]}>
        From many Naplings across North America and around the world, we wish
        Nimi a happy 1 year anniversary. Thank you for being here with us! 💚
      </p>

      <p class={["font-medium", "text-xl", "px-1", "text-center"]}>
        This fan website was created by a very small team along with Napling
        Project. The website may not be 100% perfect but we hope Nimi and
        Naplings enjoy this little project.
      </p>
    </div>

    <hr class={["my-1"]} />

    <div
      class={[
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "overflow-hidden",
        "px-3",
      ]}
    >
      <h2 class={["text-4xl", "text-center", "pacifico-regular", "underline"]}>
        Nimi content timeline
      </h2>
      <BlossomBorder clazz={["mt-3", "mb-2"]}>
        <TwigBorder>
          <HorizontalScroll clazz={["rounded-4xl", "shadow-xl", "bg-dots"]}>
            <Timeline data={timelineNodes} orientation="horizontal" />
          </HorizontalScroll>
        </TwigBorder>
      </BlossomBorder>
    </div>

    <hr />

    <h2>Nimi Plushy Travel Photo Gallery</h2>
    <PlushyGallery />

    <hr />

    <h3>Closing words</h3>
    <h3>Credits</h3>
    <h3>Socials</h3>
  </div>
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

  :global(:root) {
    --bg-lines-height: 0.9px;
    --bg-lines-spacing: 20px;

    --bg-dots-size: 1.5px;
    --bg-dots-spacing: 24px;

    --spacing: 2rem;
  }

  :global(:root:has(main.bg-lines), .bg-lines) {
    background-color: var(--bg-color);
    opacity: 1;
    background-size: var(--bg-lines-spacing) var(--bg-lines-spacing);
    background-image: repeating-linear-gradient(
      0deg,
      var(--bg-color-alt),
      var(--bg-color-alt) var(--bg-lines-height),
      var(--bg-color) var(--bg-lines-height),
      var(--bg-color)
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

  :global(hr) {
    color: color-mix(in srgb, var(--bg-color-accent) 30%, transparent);
  }
</style>
