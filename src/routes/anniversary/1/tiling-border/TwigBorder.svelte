<svelte:options customElement="twig-border" />

<script lang="ts">
  import twig from "$lib/assets/frame/eucalyptus-branch.png";
  import TilingBorder from "./TilingBorder.svelte";
</script>

<TilingBorder spritePath={twig}>
  <slot />
</TilingBorder>
