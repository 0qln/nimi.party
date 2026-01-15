<svelte:options customElement="blossom-border" />

<script lang="ts">
  import blossom from "$lib/assets/frame/cherry-blossom.png";
  import TilingBorder from "./TilingBorder.svelte";
</script>

<TilingBorder
  size={30}
  density={{ u: 0.3, v: 0.05 }}
  uRandom={{ lo: -20, hi: 20 }}
  vRandom={{ lo: -20, hi: 0 }}
  spritePath={blossom}
>
  <slot />
</TilingBorder>
