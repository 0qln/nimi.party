<svelte:options customElement="plushy-photo" />

<script lang="ts">
  import type { PlushyPhotoProps } from "./types";

  let { imageUrl = "" }: PlushyPhotoProps = $props();
</script>

{#snippet img(url: string)}
  <div style:max-width="400px">
    <enhanced:img src={url} sizes="400px" alt={"Plushy Photo"} loading="lazy" />
  </div>
{/snippet}

{#if typeof imageUrl === "string"}
  {@render img(imageUrl)}
{:else if imageUrl instanceof Promise}
  {#await imageUrl then image}
    {@render img(image)}
  {/await}
{/if}
