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
  import csv from "csvtojson";
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
    // We manually define headers to map the CSV columns to our clean interface keys.
    // This array must match the column order in your CSV exactly.
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

    const converter = csv({
      noheader: false,
      headers: headers,
      output: "json",
      checkType: false,
      colParser: {
        isImageAssetMade: (item: string) => item?.toUpperCase() === "TRUE",
      },
    });

    return (await converter.fromString(csvData)) as PlushMetadata[];
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
    content: string,
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
        content,
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
      `
        Fashionably late at the beginning of the end of summer, Nimi reveals her summer 3D outfit, a lifeguard outfit! Equipped with her yapmaster 500 and legs that stretch so long that they couldn’t fit on the cover of Vogue, she debuts her mega scuffed whistle and celebrates with a fun beach themed karaoke. Aside from the outfit reveal itself, stream kicked off with a fun review of Napling submitted guesses of her outfit based on her silhouette and perhaps the most important emotes to ever be revealed: the bald emote, the m’lady emote, and the “absolute cinema” emote.
      `,
    ),
    tsEventNode(
      "2025-08-03",
      "[Animal Revolt Battle Simulator] Determining once and for all who would win: 100 men or 1 t-rex ",
      `
        The 100 men vs 1 gorilla discourse is at its peak, so Nimi sets out to put the debate to rest once and for all in Animal Revolt Battle Simulator, a game similar to Totally Accurate Battle Simulator. It’s a thrilling affair, with the Naplings placing bets on who will win each of the battles she sets up. There’s definitely a Lord of the Rings reference in there somewhere to sum up the battles, especially the ones between the armored elephant and the polar bears with giant fits mounted to their head. The final record is 13-16, Nimi - Naplings. The slide whistle returns in all its glory.
      `,
    ),
    tsEventNode(
      "2025-08-06",
      "[Crusader Kings III] I watched too much Game of Thrones so now I’m Playing CK3",
      `
        Fresh off the summer 3D outfit debut, Nimi took some time off for some well deserved R&R and naturally got sucked into Game of Thrones. With the GOT brainrot in full swing, Nimi decides to scratch that itch with the Game of Thrones mod on Crusader Kings with the a. Updates on her vampire novel and the health of Artemis and Luna are also given.
      `,
    ),
    tsEventNode(
      "2025-08-08",
      "[Static Dread] DON’T LET THEM IN Eldritch Horror + Paper, Please",
      `
        Inspired by Sameko Saba playing this game, Nimi embarks on a cozy spooky indie horror menu type game stream. The Game of Thrones brainrot continues and Nimi laments her quickly diminishing supply of “good” GOT episodes. This marks Nimi’s continued arc of breaking free of her hipster phase and finally working her way through American prestige TV, with her now having now worked through The Wire, Breaking Bad, Better Call Saul, and now GOT with the Walking Dead on the horizon. For the prestream yap sesh, she talks about apart from being part of the bunion club, she’s also a part of the 10% overbite club, and the difference between traveling to Kyoto and Tokyo as a tourist.
      `,
    ),
    tsEventNode(
      "2025-08-09",
      "[Crusader Kings III] Fixing the Game of Thrones timeline with the power of fatherly love",
      `
        In classic fashion, Nimi cold opens with a long winded yap about a horrific poop incident involving her cat Artemis. Basically, after Artemis finished doing his business in the litter box, Nimi saw that he hadn’t fully “pinched off his last log”. Springing into action, Nimi menacingly chased him down, but this caused him to dart which flung “the log” into a splatter on the wall. Nimi has also succumbed to the power of marketing and has admitted that she really likes the Rihanna perfume which led to a discussion about how good celebrities tend to smell on average. Basically, the full spectrum of smells was covered in this tangent. In the stream proper, she actually manages to somehow get rid of The Mountain, but this promptly causes the entire timeline to fall apart. Obviously a quick Uma pull break was unavoidable.
      `,
    ),
    tsEventNode(
      "2025-08-10",
      "[RESIDENT EVIL 6] Green girls vs classic action horror WITH @mintfantome",
      `
        Green collab! Mint and Nimi collab to take control of Leon The Hunk Kennedy to start playing through RE6. Before getting into the game, Mint tries to hard sell Metal Gear Solid on Nimi and Nimi tries to hard sell Hitman back. This naturally leads to the two green ladies comparing bald heads.
      `,
    ),
    tsEventNode(
      "2025-08-11",
      "[Wii Fit] Nimi gets fit with the Wii’s most ruthless fitness assistant",
      `
        Our 79 year old tapir grandma nurse who was born in 1910 embarks on a journey to GET SWOLE and bulk up to the prime tapir bodyweight of 600 lbs. She dazzles us with her incredible balance (only 3% skew to the right) and mindblowingly good BMI with Gerald cameos galore during the starting body test.
      `,
    ),
    tsEventNode(
      "2025-08-13",
      "[Elden Ring] GETTING GOOD OR ELSE FOR REAL | #20",
      `
        Nimi returns to Elden Ring with a vengeance. So much vengeance in fact that she doesn’t even yap for 30 minutes at the title screen like usual. Equipped with an iced water, a hot tea, and a matcha latte, Nimi finally Nimi Beams Godfrey into oblivion first try and fells the Elden Beast with much gusto, all while managing to yap about Game of Thrones in tandem. Congrats on rolling credits Nimi!
      `,
    ),
    tsEventNode(
      "2025-08-14",
      "[RESIDENT EVIL 6] This game is ridiculous (and awesome) | #2",
      `
        Green collab continued! With the majority of her RE experiences having been with Ethan Winters, Nimi continues to be floored by the high octane action and over-the-top camp of the series helmed by Leon. The will-they-won’t-they between Ada and Leon does start to tickle Nimi’s toxic Twilight romance loving senses as well. The green ladies are left speechless at Leon’s final line in the game.
      `,
    ),
    tsEventNode(
      "2025-08-15",
      "[Teddy’s Haven] Living out my dream of opening a fantasy shop",
      `
        After quite a slew of exciting streams, Nimi settles into a cozy early access fantasy shop sim game with her house style of yaps. This does end up involving committing lots of health code violations and wreaking untold amounts of environmental damage. Incredibly comfy stream for a promising early access indie game.
      `,
    ),
    tsEventNode(
      "2025-08-20",
      "[SKYBLOCK MINECRAFT] Day 1",
      `
        The long awaited return of The Block Game! Fresh off of her recent cover release with Mint, Nimi debuts a new all-timer catchphrase: KonBLOCKuwa and blesses us with an excellent return to form of comfy Minecraft streams with classics like yapping sessions and browsing her Epidemic Sound library. Gaming tapir manages to get the cobblestone generator set up on the first try. Shoutout to Elegancki for making the Nimi Minecraft Skin!
      `,
    ),
    tsEventNode(
      "2025-08-21",
      "[SKYBLOCK MINECRAFT] The one where Nimi makes a mob farm | Day 2",
      `
        Rocking a brand new trucker hat, Nimi returns to skyblock to continue her ceaseless advance towards fully autonomous self-sufficiency. Over comfy cobblestone mining, Nimi demonstrates elite ball knowledge by name dropping texture packs that she might download to ragebait the viewership. Something something lava chicken. Something something, down in the mine, all of the time…crafting.
      `,
    ),
    tsEventNode(
      "2025-08-22",
      "[Teddy’s Haven] This medieval shop simulator is my cozy GOTY",
      `
        After learning that Teddy’s Haven is not only a comfy shop/life simulator game, but also a tribute to the developer’s late dog, Nimi continues to advocate for this little indie game that could. With Silksong’s release date freshly announced, Nimi ponders the idea of beating Hollow Knight in time for Silksong’s release. She also drops some lore about some rebrands over her streamer career while teasing a potential future vampire form.
      `,
    ),
    tsEventNode(
      "2025-08-24",
      "[The Life and Suffering of Sir Brante] Your choices decide his fate & his suffering",
      `
        Unsure of what to play and with a certain egg on vacation, Nimi delves deep into the archives and dredges up this decision driven branching narrative game centered around a deliciously atmospheric dark gothic fantasy setting. In the prestream yap, Nimi talks about how boring she found History as a subject, citing that while both her favorite subject, Biology, and History involve lots of memorization, History’s messiness made it boring and hard to follow for her. Obligatory plug for The Elegant Universe by Brian Greene.
      `,
    ),
    tsEventNode(
      "2025-08-25",
      "[SKYBLOCK MINECRAFT] On a Monday??? | Day 3",
      `
        Minecraft? On a Monday??? New texture pack locked and loaded, Nimi advocates from the Mizuno Craft aesthetic. EMBRACE THE COTTAGECORE AESTHETIC. Basically, according to our gaming tapir, the ability to install Minecraft texture packs is the tech literacy litmus test. While the Nether reached and the mob farm humming, Nimi turns her attention back to building her cozy Skyblock cottage with a real nice view of Party City.
      `,
    ),
    tsEventNode(
      "2025-08-27",
      "[Hollow Knight] Is this game hard?",
      `
        Our gaming tapir finally decides to face her demons and return to Hollow Knight for the first(?) time! In the wake of the imminent release of Silksong, Nimi finally buckles down to attempt to speedrun the base game in a week. Naplings rejoice as Nimi finally sinks into the cute and creepy world of Hallownest, and swoon alongside her as she meets “bapadana” bug lady Iselda. The stream concludes cinematically with the defeat of the Mantis Lords. She’s hooked!
      `,
    ),
    tsEventNode(
      "2025-08-28",
      "[Hollow Knight] One Nimi tries to beat Hollow Knight before Silksong | #2",
      `
        The Hollow Knight marathon continues! Nimi’s in it to win it and the gaming tapir pushes through, taking down the Soul Master and the Vessel while also obtaining the Desolate Dive and the Crystal Heart. The game is challenging and slightly traumatizing (the mimic Grub certainly left an impression) but Nimi pushes on!
      `,
    ),
    tsEventNode(
      "2025-08-29",
      "[Hollow Knight] When I close my eyes, all I see is Hollow Knight | #3",
      `
        Twitter YikYak repost intro tangent aside, Nimi returns to the Watcher Knights fight with a vengeance. After many hardfought attempts, Nimi manages to pull out the W and then also goes on to take down Dung Defender, Crystal Knight, and finally comes across her rematch with Hornet at the kingdom’s edge. Clearing even that, Nimi finally claims the King’s Brand and takes her rightful place as the king of Hallownest. Truly, she’s flying through this game at a breakneck speed.
      `,
    ),
    tsEventNode(
      "2025-08-30",
      "[Hollow Knight] Please no more deepnest | #4",
      `
        Nimi takes a brief detour to the Colosseum of Fools, Nimi barrels towards the finish line and takes on the titular Hollow Knight. After several nailbiting fights, Nimi finally squeaked out a win against her brother. As the music crescendos, she absorbs the infection from her brother and unlocks the first ending of the game. Congratulations on rolling credits Nimi! However, like a true gamer, Nimi looked at this and said “Is that it?” And so, the journey goes into overtime as she begins going for the true ending.
      `,
    ),
    tsEventNode(
      "2025-08-31",
      "[Hollow Knight] The one where Nimi beat the game for real | #5",
      `
        Hollow Knight has completely consumed our tapir. Both of her YouTube algorithms have been taken over by Hollow Knight speedruns and lore videos. She basically lives in Hallownest at this point. Resolute in seeking a better ending, Nimi pushes onward to fight the dream variants of many of the previously felled bosses, challenges the Hive, and braves the endless buzzsaws in the White Palace. With all her trophies in tow, she re-challenges the Hollow Knight and finally reaches the true final boss. But alas, sometimes too much is too much. Us Naplings can still hope and dream that she can one day return to conquer the Radiance!
      `,
    ),
    // september
    tsEventNode(
      "2025-09-01",
      "【Hollow Knight】 The one where Nimi beats the game for real",
      `
        After marathoning Hollow Knight for 4 days, Nimi starts looking for dream bosses to fight.
        Nimi fights Markoth, the White Defender then starts attempting the platforming challenges of the White Palace. She eventually retreats and begins exploring the Hive and takes on the Hive Knight for the Hiveblood. With the Hiveblood Charm, Nimi returns to the White Palace and claims the Kingsoul. After evolving the Kingsoul to the Void Heart in the Abyss’s Birthplace, Nimi reaches one of the endings of Hollow Knight and attempts to fight Radiance. Satisfied with the ending she got and longing for Minecraft, she decides to stop her marathon.
      `,
      { externalLink: "https://youtu.be/rq7oYfJAMRw" },
    ),
    tsEventNode(
      "2025-09-04",
      "【SKYBLOCK MINECRAFT】 In my happy space",
      `
        After not having attended to her Skyblock Minecraft world for a week, Nimi doesn’t remember what were her planned tasks. She works on grinding more cobblestone, XP and gold while discussing what games and shows she is thinking of consuming next. While grinding her mob farm, she manages to isolate a zombified villager and witch to use the witch’s weakness potion to cure the villager. She then builds out a housing space for the new villager and works on expanding her skyblock island. Afterwards, she starts grinding the mob farm again in hopes of finding another zombified villager until a creeper destroys part of the structure. She repairs the farm and continues grinding until she finds another zombified villager. She then gathers the materials and witch, cures the villager, brings it into her villager house and closes the stream for the day.
      `,
      { externalLink: "https://youtu.be/eQT4U2_rwWc" },
    ),
    tsEventNode(
      "2025-09-05",
      "Learning to be a mother from questionable Wii games",
      `
        Nimi starts off with playing “Babysitting Mama” with partial 3D tracking on and comments about the cursed baby doll accessory she doesn’t have that is intended for the wiimote. She performs various tasks with janky motion controls that are part of raising a baby like comforting a baby, feeding milk, burping a baby and changing diapers. After clearing all the task minigames for one baby, she decides to switch the Wii game to “Star Wars: The Clone Wars - Lightsaber Duels”. After briefly going through the tutorial and trying the main campaign, she decides to switch to “Hannah Montana: Spotlight World Tour”. She is quickly reminded though that Hannah Montana is a Disney property (as well as Star Wars) and switches to “Dora Saves the Snow Princess”. However, she was not mentally strong enough to play the children’s game for very long. She then switches to “Big Brain Academy: Wii Degree” and scores an above average score on the test in game. Satisfied with her score, she changes the game to “Spore Hero”. After playing “Spore Hero” briefly, she decides to give a quick review of all the games she played this stream and ends for the day.
      `,
      { externalLink: "https://youtu.be/BlAkThwMZY0" },
    ),
    tsSkipNode(),
    tsEventNode(
      "2025-09-12",
      "【KU100 ASMR】 ✂️ Spider Girl Sizes You Up 🕸️",
      `
        You make a late night visit to the spider Ariadne.
      `,
      { externalLink: "https://youtu.be/d4Byvoh_Z0s" },
    ),
    tsEventNode(
      "2025-09-13",
      "Nimi finds the go live button",
      `
        After a week-long break from streaming, Nimi finds the go live button without much of a plan on what to do. She chats about how she spent her break, her recent ASMR video, her Autumn plans and other miscellaneous topics. She eventually gets on the subject of monster girls and starts making a quick monster girl tier list. She also remembers to do some free pulls in Umamusume and gets a new outfit for Gold Ship. She ends her free talk with chatting a little about the book she’s writing and what she plans on playing on stream the next day.

      `,
      { externalLink: "https://youtu.be/fldbRmQ91Pk" },
    ),
    tsEventNode(
      "2025-09-14",
      "【The Quarry】 Nimi controls the fate of nine teenagers (they are doomed)",
      `
        Nimi opens the stream with a chat about her experience in Vegas and about her recent watch of Star Wars Episode 4. She starts the game and talks a bit about what she has heard about it and what actors she recognizes in the game. While playing the Prologue, she selects options leaning towards more honesty and helpfulness and failing only a few quick time events. She goes through Chapter 1 while selecting choices that lean towards safety but with a little skepticism. In Chapter 2, she is a bit more inquisitive and tries nurturing relationships while having some problems with stick drift on her controller. She progresses to Chapter 3 and plays defensively after feeling a bit betrayed by some of the characters. After reaching the start of Chapter 4, she decides to end the stream for the day.

      `,
      { externalLink: "https://youtu.be/dZwZ2LMItvw" },
    ),
    tsEventNode(
      "2025-09-17",
      " 【The Quarry】 I have a bad feeling about this | #2",
      `
        Despite catching and still recovering from a cold, Nimi decides to stream. She starts the stream off talking a bit about a new book she has been reading, tells a story about a Zoo summer camp she attended and then resumes the game from Chapter 4. Unfortunately during Chapter 4, she makes a fatal mistake that costs the life of one of the characters (she didn’t like that character anyways). While progressing through Chapter 5, she starts selecting decisions that sow some discord between the characters but she manages to keep the remaining characters alive. She manages to survive Chapter 6 with everyone still while also trying to make decisions to ruin certain character relationships that she doesn’t like. In Chapter 7, she learns about the monsters that are attacking the characters and what she must do to be rid of them. She starts going on the offensive for Chapter 8 against the Hacketts and manages to survive all the encounters in Chapter 9. In the finale of Chapter 10, her controller stick drift manages to mess up some crucial quick time events and gets multiple characters killed. With that ending, she decides to end the stream and thinks about getting a new controller.
      `,
      { externalLink: "https://youtu.be/FFPqDKcsLfk" },
    ),
    tsEventNode(
      "2025-09-18",
      "【Half Sword】 Medieval Combat Simulator but make it QWOP",
      `
        Still feeling a little sick, Nimi decides on a shorter stream of Half Sword. She starts off with clumsily engaging in fisticuffs with random opponents in a small arena as a beggar. As she fights more opponents (and avoids looking at the gore), she realizes that weapons are important for victory. After some wins against smaller groups of opponents, a great champion appears and Nimi struggles many times to win against them. She ends the stream after defeating the great champion and trying out the new class she unlocked.
      `,
      { externalLink: "https://youtu.be/HMry7BzvMig" },
    ),
    tsEventNode(
      "2025-09-20",
      "【The Wolf Among Us】 Making very good decisions in this classic Telltale Game",
      `
        Still feeling a little bit congested, Nimi decides to keep playing movie-like games to make things easier for streams. Before starting the game, she talks about how her cold has been and her new favorite book “Kushiel’s Dart”. She plays Episode 1 selecting choices that give her a mean “bad cop” attitude, but after getting berated by a character for being mean, she eases up. A murder happens in the game and she is set to investigate the crime. In Episode 2 she starts talking to suspects, following leads and using the Gerald censor to (poorly) cover up a club scene. After finishing Episode 2, she decides it’s a good stopping point and ends the stream.
      `,
      { externalLink: "https://youtu.be/VIy7mIOW8p8" },
    ),
    tsEventNode(
      "2025-09-22",
      "【Sims 2】 Can I survive as a lone child in The Sims 2?",
      `
        Despite being a Minecraft Monday, Nimi really felt like playing the Sims in this stream. She starts the stream with an already made “Mega Nightmare” Sims adult with a child “Mini Nightmare” to act as the lone child for a challenge. The challenge is to have the child be the one earning money and surviving while keeping the parent locked in the basement so child protection services don’t immediately end the challenge. She first builds a basement with the minimal necessities to house the parent and then a small house for the child. The child is then put to work by making paintings to sell and running a lemonade stand. After some struggles with the repo man and keeping Mega Nightmare alive, Mini Nightmare grows into a teenager and Nimi immediately removes Mega Nightmare. Mini goes through many struggles as a teenager like losing her part time job, loneliness, school and more before finally becoming an adult. Nimi then declares herself victorious over the challenge and proceeds to do a quick few free pulls in Umamusume before ending the stream.
      `,
      { externalLink: "https://youtu.be/xeVuA5AziB8" },
    ),
    tsEventNode(
      "2025-09-24",
      " 【The Wolf Among Us】 We've got ourselves a murder mystery | #2",
      `
        Starting the stream off with a short chat, Nimi talks a little about Star Wars, Lord of the Rings and Dungeons & Dragons before getting to the game. Resuming from the cliffhanger of the last episode, Nimi gets a big lead and a prime suspect on the murders. She spends Episode 3 trying to keep to less violent decisions while chasing down the suspect only to find there is more to the mystery. In Episode 4, she learns that she may need to be cautious of the people close to her and starts facing some moral dilemmas with some of the characters that she meets. Nimi tries sticking to options that are more level-headed despite really wanting to play the bad cop sometimes. At the end of Episode 4, Nimi still manages to keep calm even when faced with the possible mastermind behind the crimes. With the ending cliffhanger, Nimi decides to leave Episode 5 for the next stream.
      `,
      { externalLink: "https://youtu.be/M0VtCrS9D0s" },
    ),
    tsEventNode(
      "2025-09-25",
      " 【The Wolf Among Us】 That's it, I'm sending everyone to the farm | FINALE",
      `
        Starting with her usual short chat before the game, Nimi talks about her cats, what Churus (cat treats) would taste the best for a human and health care. She also gives her theory on the mystery in the game before starting the final episode. Resuming from the cliffhanger on Episode 4, Nimi manages to survive the onslaught of attacks from criminals and accomplices while chasing down the mastermind. Along the way, she is faced with many moral dilemmas and tries to do what she thinks is right. In the end, she dispenses justice as she sees fit and ends Episode 5. Curious about the results of some of the other choices she could have made, she replays part of Episode 5 and feels that she made the right choices the first time. Even after finishing “The Wolf Among Us”, Nimi still feels like streaming and starts playing Elden Ring: Nightreign with Naplings. With one successful round of Nightreign done, she ends the stream for the day.
      `,
      { externalLink: "https://youtu.be/rD_WW200Aqg" },
    ),
    tsEventNode(
      "2025-09-26",
      " 【No, I'm Not a Human】 Your Neighbors are NOT what They Seem (Full Release)",
      `
        For the pregame chatting, Nimi talks about the new Pokemon Legends game, some of the new Mega Evolutions she saw circulating online, baked goods and alcohol. Upon starting the game, Nimi admires some of the new features and lore that have been added since the demo she played earlier in the year. Remembering how she played last time, she decides to be a bit more cautious on who she lets into the house instead of letting everyone in. She lets in some eccentric characters thinking that Visitors wouldn’t be capable of imitating their eccentricity, but quickly learns that might not always be true. At some point, a character holding a cat shows up and Nimi lets them in (She loves the cat). As the days progress in the game, Nimi survives without many Visitors killing other characters she brought in and rather abruptly gets an ending after receiving a baby. She admires how many more characters they added to the game since the demo and wants to look up the other endings. Satisfied with the apparent rare ending she got, she ends the stream for the day.
      `,
      { externalLink: "https://youtu.be/8oFlHDVBYLs" },
    ),
    tsEventNode(
      "2025-09-28",
      " 【ELDEN RING: SHADOW OF THE ERDTREE】 DLC starts NOW! | #1",
      `
        For the stream today, Nimi was unsure what to play but she felt like playing Elden Ring possibly from recently playing Nightreign. She decided on trying the DLC and also wants to use a different build. Looking up builds online, she decides on a bleed build and starts exploring the DLC area. As she explores, she struggles with her controller stick drift and talks about what she has heard about the difficulty of the DLC and Hollow Knight: Silksong. She eventually finds a boss and manages to defeat it with relative ease and finds her bleed build doing good damage. However, as she continues exploring, she also finds some areas with enemies that are resistant to her bleed build. After defeating a few more bosses and progressing the story, she is satisfied with her new build and ends the stream for the day.
      `,
      { externalLink: "https://youtu.be/g8fdYvx3_mw" },
    ),
    tsEventNode(
      "2025-09-29",
      "【SKYBLOCK MINECRAFT】 0 days since last mob spawner incident",
      `
        Nimi returns to Minecraft Monday and tries to remember what she needs to do next. She realizes that she left the mob spawner broken since the last time she played, but she wants to expand the villager living area instead. As she grinds for materials and builds, she talks about miscellaneous topics like programming, math, cooking and Airbnbs. After building a new house for the villagers, she starts working on adding a fence around the village as well while talking about other random topics like Kushiel’s Dart and Twilight. She also decides on creating a farm to get food for repopulating the villagers. As she waits for the crops to grow, she fishes and talks about other topics like her cats and foods. After getting the food, the villagers successfully multiply and Nimi marks off an item on the to-do list for Skyblock before ending the stream for the day.
      `,
      { externalLink: "https://youtu.be/7meuhc4aPwk" },
    ),
    // october
    tsEventNode(
      "2025-10-01",
      "10012025_forest.mp4",
      `
        To start off the month of October, Nimi puts up a mysterious stream where she is walking through some dark woods. To calm herself down while walking through the scary woods, she starts singing various songs that fit the mood of autumn and horror (and whatever she feels like). She eventually spots something truly terrifying.
      `,
      { externalLink: "https://youtu.be/h-mlJwFKnSY" },
    ),
    tsEventNode(
      "2025-10-03",
      " 【MEGABONK】 Addictive new roguelite where you BONK",
      `
        Nimi discovers a new addictive roguelite with good reviews and decides to try it out on stream. Jumping right in she immediately sees the Vampire Survivors influence on the game and is also immediately overstimulated. Fighting motion sickness and controller stick drift, she tries surviving many waves of enemies as long as she can in a couple of rounds while getting new upgrades. As she keeps playing rounds, she unlocks new characters that she tries as well. After many rounds of trying to survive, she eventually finds a stopping point and ends the stream for the day.
      `,
      { externalLink: "https://youtu.be/-9ofHHGZHWU" },
    ),
    tsSkipNode(),
    tsEventNode(
      "2025-10-08",
      "【Unfair Flips】 Gambling with a coin that can only flip tails",
      `
        After a short break, Nimi has once again forgotten how to stream and starts a new gambling game. She starts off with an announcement that she has finally gotten a new controller (the 8bitdo ultimate 2) and her upcoming birthday stream plan. Eventually after talking about wanting a clone of herself, she starts the game where she simply flips a coin that is rigged to mostly land on tails. As she flips the coin and aims for the objective of getting 10 heads in a row, she talks about miscellaneous topics like Sonic The Hedgehog characters, the upcoming Pokemon Legends game, washing clothes and weddings. At some point while talking about backseating someone’s financials and forging signatures, she gets 10 heads in a row and gets an ending of the game. Satisfied with the ending, she decides to switch to playing Elden Ring: Nightreign. After a few successful runs with Naplings in Nightreign, she ends the stream for the day.
      `,
      { externalLink: "https://youtu.be/MW3ZM5yyBcg" },
    ),
    tsEventNode(
      "2025-10-09",
      '【Road To Empress】 Ruling the palace one "good" decision at a time',
      `
        Nimi decides on trying a FMV type of game with a story and setting in China’s Tang Dynasty era after seeing a bit of gameplay of it from another streamer. After a short story of how she took a class on ancient chinese literature, she starts the game and also quickly learns how easy it is to get a bad ending. As she navigates the maze of incorrect decisions, YouTube randomly suspends her stream for policy violations multiple times and also unsuspends it multiple times mid-stream. Fearing how these random policy violations could affect her channel, Nimi decides to drop the stream and start a new one without this particular game.
      `,
      {
        externalLink: "https://youtu.be/6_Sa67bo53I",
        imageName: "thumbnail-0.jpg",
        id: "2025-10-09_0",
      },
    ),
    tsEventNode(
      "2025-10-09",
      "youtube please",
      `
        Confused and afraid as to why her Road To Empress stream was getting blocked, Nimi switches to a walking simulator type of horror game called Eclipsium. The game starts in a hospital and after solving a puzzle to leave the hospital, Nimi starts walking through a bizarre dreamscape-like environment. As she progresses, she also gains strange and slightly disturbing power ups to solve puzzles. With each little bit of lore told through cutscenes, Nimi theorizes about the environment that she is in and about the main character. The game continues presenting many bizarre and slightly disturbing environments that trigger certain fears for Nimi, but she goes through and enjoys the strange environments to the end.
      `,
      {
        externalLink: "https://youtu.be/q42ucyHBSZ8",
        imageName: "thumbnail-1.jpg",
        id: "2025-10-09_1",
      },
    ),
    tsEventNode(
      "2025-10-10",
      "【BIRTHDAY STREAM】 Nimi's Maze of Horrors #BirthdayBaku2025",
      `
        It’s Nimi’s birthday and she has a TTRPG game set up to play with Phoebe and Mint. The objective is to get to the center of a hedge maze set up by the minotaur Nimi. After explaining how the game and stats works, Phoebe and Mint select their stats with Phoebe going for a charisma build and Mint going for a yeet build.
      `,
      { externalLink: "https://youtu.be/2-heo8MsGoY" },
    ),
    tsEventNode(
      "2025-10-12",
      "【CARIMARA】 Beautiful & Creepy Horror Game Where You have no voice",
      `
        A few days after her birthday stream and still a little tired from birthday preparations, Nimi decides to stream a less intense horror game for October. Before starting the game, she talks about the birthday merch, how to draw herself and imagining where bugs could possibly be. Nimi starts the game off in a small house of an old lady who is seeking a carimara for help with a ghost problem. As the carimara, she explores the house and immediately finds the ghost and is attacked by it. She learns that she needs to unravel the mystery of who the ghost was first before attempting to exorcise it. Nimi sets off on talking to other characters and exploring more of the property for clues about the ghost. After gathering some more information, she figures out the mystery behind the ghost and finishes the game. Happy with the ending, Nimi moves onto the game Threshold. The game starts her off as a character clocking into their new job at a train station. After another character explains the job and what to do, Nimi performs the tasks for the job while exploring the area she is assigned to. As she explores, she finds the station is in need of repairs and has concerns about some of the things she sees around like a fresh grave. She eventually discovers something disturbing about the train contents and reaches one of the endings of the game. Still confused about the story, she tries looking up some theories before ending the stream for the day.
      `,
      { externalLink: "https://youtu.be/G03zV4PlHxs" },
    ),
    tsEventNode(
      "2025-10-13",
      "【MINECRAFT SKYBLOCK】 My island is so cottagecore cozycore prisoncore",
      `
        It’s Minecraft Monday once again and Nimi also doesn’t remember what she was doing again. She talks about miscellaneous topics like her recent dance lessons for something that is coming up, some Minecraft challenge videos she watched and difficult games she thinks about playing or going back to while mindlessly grinding more resources. At some point, a baby zombie piglin somehow manages to follow her from the nether to her overworld and she decides to keep it safe. As time passes, she sees her village starting to become self-sufficient and growing by itself. She gathers the materials for a fletching table and gets a villager that can trade sticks for emeralds so she can eventually trade for more resources with the emeralds. She continues grinding more resources while talking about miscellaneous topics including the origin of her name.
      `,
      { externalLink: "https://youtu.be/FhdqJ-HYSP0" },
    ),
    tsEventNode(
      "2025-10-15",
      "Nimi attempts to draw Pokémon from memory",
      `
        todo...
      `,
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
      "pb-2",
      "pm-2",
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
        "h-1.5",
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
        "max-w-5xl",
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
          Please note that this website is optimized desktop browsers and might
          not look right on mobile :)
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

    <hr class={["my-3"]} />

    <div
      class={[
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-3",
        "w-full",
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

      <BlossomBorder clazz={["mt-3", "mb-2"]}>
        <TwigBorder>
          <HorizontalScroll clazz={["rounded-4xl", "shadow-xl", "bg-dots"]}>
            <Timeline data={timelineNodes} orientation="horizontal" />
          </HorizontalScroll>
        </TwigBorder>
      </BlossomBorder>
    </div>

    <hr class={["my-3"]} />

    <div
      id="plushy-section"
      class={[
        "relative",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "overflow-hidden",
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

    <hr class={["my-3"]} />

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
</style>
