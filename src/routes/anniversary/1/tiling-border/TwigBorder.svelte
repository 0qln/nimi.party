<svelte:options customElement="twig-border" />

<script lang="ts">
  import TilingBorder from "./TilingBorder.svelte";
  import TwigSprite from "./TwigSprite.svelte";
</script>

<TilingBorder size={{ width: 150, height: 150 }} sprite={TwigSprite}>
  <slot />
</TilingBorder>
