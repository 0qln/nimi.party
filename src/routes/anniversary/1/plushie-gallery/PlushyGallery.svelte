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
  class={[
    "flex",
    "flex-row",
    "justify-center",
    "flex-wrap",
    "space-x-1",
    "space-y-1",
  ]}
>
  {#each data as photo}
    <div class="w-1/4">
      <photo.component {...photo.props} />
    </div>
  {/each}
</div>
