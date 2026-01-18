<svelte:options customElement="plushy-photo" />

<script lang="ts">
  import type { PlushyPhotoProps } from "./types";
  import nimiBall from "$lib/assets/misc/nimi-ball.gif";

  let { imageUrl = "", rng = (_) => 0 }: PlushyPhotoProps = $props();

  let isLoaded = $state(false);

  $effect(() => {
    imageUrl; // to register the dependency
    isLoaded = false;
  });
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

{#snippet img(url: string)}
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
      class={["relative", "overflow-visible", "shadow-md/60"]}
      style="transition: opacity 0.3s ease-in-out;"
      style:opacity={isLoaded ? 1 : 0}
    >
      {@render tape([])}

      <enhanced:img
        src={url}
        sizes="400px"
        alt={"Plushy Photo"}
        loading="lazy"
        onload={() => (isLoaded = true)}
      />
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
