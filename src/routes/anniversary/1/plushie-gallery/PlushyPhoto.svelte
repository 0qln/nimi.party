<svelte:options customElement="plushy-photo" />

<script lang="ts">
  import type { PlushyPhotoProps } from "./types";
  import nimiBall from "$lib/assets/misc/nimi-ball.gif";

  let { imageUrl = "" }: PlushyPhotoProps = $props();

  let isLoaded = $state(false);

  $effect(() => {
    imageUrl; // to register the dependency
    isLoaded = false;
  });
</script>

{#snippet img(url: string)}
  <div style:max-width="400px" class={["relative", "overflow-hidden"]}>
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
        />
      </div>
    {/if}

    <div
      class={["relative", "z-10"]}
      style="transition: opacity 0.3s ease-in-out;"
      style:opacity={isLoaded ? 1 : 0}
    >
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
