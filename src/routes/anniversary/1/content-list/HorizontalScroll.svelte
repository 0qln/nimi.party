<svelte:options customElement="horizontal-scroll" />

<script lang="ts">
  interface Props {
    as?: keyof HTMLElementTagNameMap;
    clazz?: string[];
    hideScrollbar?: boolean;
    snap?: boolean;
    snapType?: "mandatory" | "proximity";
    gap?: string;
    padding?: string;
    style?: string;
  }

  let {
    as = "div",
    clazz = [],
    hideScrollbar = false,
    snap = false,
    snapType = "proximity",
    gap = "1rem",
    padding = "0",
    style = "",
  }: Props = $props();
</script>

<svelte:element
  this={as}
  class={["horizontal-scroll", ...clazz]}
  class:no-scrollbar={hideScrollbar}
  class:snap
  style="--gap: {gap}; --padding: {padding}; {style}"
>
  <slot />
</svelte:element>

<style>
  .horizontal-scroll {
    overflow-x: auto;
    overflow-y: auto;
    white-space: nowrap;
    padding: var(--padding, 1rem 0);
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb, #888)
      var(--scrollbar-track, #f1f1f1);

    /* Custom properties for styling */
    --scrollbar-thumb: #888;
    --scrollbar-track: #f1f1f1;
    --gap: 1rem;
  }

  /* Flexbox layout for children */
  .horizontal-scroll :global(*) {
    white-space: normal;
  }

  /* Alternative: Use flex display for the container */
  .horizontal-scroll {
    display: inline-flex;
    gap: var(--gap);
  }

  .horizontal-scroll > :global(*) {
    flex: 0 0 auto;
  }

  /* Snap scrolling */
  .horizontal-scroll.snap {
    scroll-snap-type: x var(--snap-type, proximity);
  }

  .horizontal-scroll.snap > :global(*) {
    scroll-snap-align: start;
  }

  /* Scrollbar styling */
  .horizontal-scroll::-webkit-scrollbar {
    height: 8px;
  }

  .horizontal-scroll::-webkit-scrollbar-track {
    background: var(--scrollbar-track, #f1f1f1);
    border-radius: 4px;
  }

  .horizontal-scroll::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb, #888);
    border-radius: 4px;
  }

  .horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover, #555);
  }

  /* Hide scrollbar but keep functionality */
  .horizontal-scroll.no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .horizontal-scroll.no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Wheel event isolation - prevents vertical page scroll when scrolling horizontally */
  .horizontal-scroll {
    overscroll-behavior-x: contain;
  }
</style>
