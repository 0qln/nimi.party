<svelte:options customElement="plushy-photo" />

<script lang="ts">
  import type { PlushyPhotoProps } from "./types";
  import nimiBall from "$lib/assets/misc/nimi-ball.gif";

  let {
    imageUrl = "",
    meta = undefined,
    rng = (_) => 0,
  }: PlushyPhotoProps = $props();

  let isLoaded = $state(false);

  $effect(() => {
    imageUrl; // to register the dependency
    isLoaded = false;
  });

  const funfunColors = [
    "var(--accent-color-pink)",
    "var(--accent-color-orange)",
    "var(--accent-color-turquoise)",
    "var(--accent-color-blue)",
    "var(--accent-color-darkblue)",
    "var(--accent-color-green)",
    "var(--accent-color-darkgreen)",
  ];
  const randomFunFunColor = () => {
    const index = Math.round(rng({ lo: 0, hi: funfunColors.length - 1 }));
    return funfunColors[index];
  };
</script>

{#snippet tape(classes: string[], width: number = 90)}
  <enhanced:img
    src="$lib/assets/frame/paper-tape-horizontal.png?w=100"
    sizes="100px"
    alt=""
    style:transform="translateY(-50%)"
    style:width="{width}px"
    style:rotate="{rng({ lo: -10, hi: +10 })}deg"
    style:opacity="80%"
    class={["absolute", "left-0", "right-0", "mx-auto", ...classes]}
  />
{/snippet}

{#snippet img(url: any)}
  <div style:max-width="400px" class={["relative"]}>
    {#if !isLoaded}
      <div
        class={[
          "absolute",
          "top-0",
          "left-0",
          "w-full",
          "h-full",
          "inset-0",
          "flex",
          "items-center",
          "justify-center",
        ]}
      >
        <img
          alt="loading..."
          width="100"
          height="100"
          src={nimiBall}
          style="object-fit: contain;"
          loading="eager"
        />
      </div>
    {/if}

    <div
      class={["relative", "overflow-visible", "shadow-md/60", "bg-lines"]}
      style="transition: opacity 0.3s ease-in-out;"
      style:opacity={isLoaded ? 1 : 0}
    >
      {@render tape([])}

      <div
        class={[
          "p-0.5",
          "flex",
          "flex-col",
          "items-center",
          "space-y-0.5",
          "relative",
        ]}
      >
        <div
          class={["absolute", "top-0", "left-0"]}
          style:rotate="{rng({ lo: -5, hi: -15 })}deg"
          style:transform="translate(max(-30%, -50px), -30%)"
        >
          <p
            class={["chewy-regular", "white-text-outline", "text-3xl"]}
            style:color={`${randomFunFunColor()}`}
          >
            {meta?.country}
          </p>
        </div>

        <enhanced:img
          src={url}
          sizes="400px"
          alt={"Plushy Photo"}
          loading="lazy"
          onload={() => (isLoaded = true)}
        />

        <b class={["font-extrabold", "rinnet-regular"]}
          >{meta?.nickname}
          {#if meta?.socialAccount}
            ({meta?.socialAccount})
          {/if}</b
        >

        <p class={["text-xs", "rinnet-regular", "text-center"]}>
          {meta?.message}
        </p>
      </div>
    </div>
  </div>
{/snippet}

{#if typeof imageUrl === "string"}
  {@render img(imageUrl)}
{:else if imageUrl instanceof Promise}
  {#await imageUrl}
    <div
      class={["w-full", "h-full", "flex", "items-center", "justify-center"]}
    ></div>
  {:then image}
    {@render img(image)}
  {/await}
{/if}

<style>
  @import url("https://fonts.googleapis.com/css2?family=Chewy&display=swap");
  @import url("https://db.onlinewebfonts.com/c/687a7a923300a7408ffe4914c7c9e380?family=Rinnet");

  .chewy-regular {
    font-family: "Chewy", system-ui;
    font-weight: 400;
    font-style: normal;
  }

  .rinnet-regular {
    font-family: "Rinnet", monospace;
    font-weight: 400;
    font-style: normal;
  }

  .white-text-outline {
    text-shadow:
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
      1px 1px 0 #fff;
  }
</style>
