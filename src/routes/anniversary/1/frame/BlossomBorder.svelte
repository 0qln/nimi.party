<svelte:options customElement="blossom-border" />

<script lang="ts">
  import BlossomSprite from "./BlossomSprite.svelte";
  import TilingBorder from "./TilingBorder.svelte";

  let props = $props();
</script>

<TilingBorder
  size={{ width: 30, height: 30 }}
  density={{ u: 0.3, v: 0.05 }}
  uRandom={{ lo: -20, hi: 20 }}
  vRandom={{ lo: -20, hi: 0 }}
  sprite={BlossomSprite}
  {...props}
>
  <slot />
</TilingBorder>
