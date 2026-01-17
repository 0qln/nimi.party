<svelte:options customElement="plushy-gallery" />

<script lang="ts">
  import type { PlushyPhotoDatum } from "./types";

  interface Props {
    data: Array<PlushyPhotoDatum>;
    cols?: number;
  }

  let { data, cols = 3 }: Props = $props();
</script>

<div
  class="w-full space-y-1"
  style="column-count: {cols}; column-gap: var(--spacing);"
>
  {#each data as photo}
    <div class="break-inside-avoid w-full">
      <photo.component {...photo.props} />
    </div>
  {/each}
</div>
