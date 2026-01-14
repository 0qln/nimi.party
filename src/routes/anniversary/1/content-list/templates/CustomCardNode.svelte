<svelte:options customElement="custom-card-node" />

<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    content?: string;
    imageUrl?: string;
    externalLink?: string;
    width?: string;
    contentWidth?: string;
    titleWidth?: string;
    height?: string;
    direction?: "down" | "right" | "left" | "up";
  }

  let {
    title = "",
    subtitle = "",
    content = "",
    imageUrl = "",
    externalLink = undefined,
    width = "",
    contentWidth = "",
    titleWidth = "",
    height = "",
    direction = "down",
  }: Props = $props();

  // Determine orientation group
  let isVertical = $derived(direction === "down" || direction === "up");

  // Determine defaults based on orientation
  let cssWidth = $derived(width || (isVertical ? "400px" : "unset"));
  let cssContentWidth = $derived(
    contentWidth || (isVertical ? "unset" : "300px"),
  );
  let cssTitleWidth = $derived(titleWidth || (isVertical ? "unset" : "200px"));
  let cssHeight = $derived(height || (isVertical ? "fit-content" : "230px"));
</script>

{#snippet tImage()}
  {#if imageUrl}
    <div class="card-media">
      <img src={imageUrl} alt={title} loading="lazy" />
    </div>
  {/if}
{/snippet}

{#snippet tHeader()}
  <div class="card-header-wrapper">
    <h3 class="card-title delius-regular">{title}</h3>
    {#if subtitle}
      <div
        class={["flex", "flex-row", "items-center", "mt-0.25", "space-x-0.25"]}
      >
        {@render tExternalLink()}
        <p class={["card-subtitle", "m-0!"]}>{subtitle}</p>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet tContent()}
  {#if content}
    <div class="card-content-wrapper">
      <p class="card-content-inner">
        {content}
      </p>
    </div>
  {/if}
{/snippet}

{#snippet tExternalLink()}
  {#if externalLink}
    <a href={externalLink} target="_blank" aria-label="External link to event">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class={["size-0.5", "card-icon"]}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
        />
      </svg>
    </a>
  {/if}
{/snippet}

<!--
  Logic:
  - dir-down: column (Head Top, Content Bottom)
  - dir-up: column-reverse (Head Bottom, Content Top)
  - dir-right: row (Head Left, Content Right)
  - dir-left: row-reverse (Head Right, Content Left)
-->
<div
  class="card-root dir-{direction} {isVertical
    ? 'is-vertical'
    : 'is-horizontal'}"
  style:--card-width={cssWidth}
  style:--card-height={cssHeight}
  style:--content-width={cssContentWidth}
  style:--title-width={cssTitleWidth}
  role="article"
  aria-label={`Card: ${title}`}
>
  <!-- Accent Line -->
  <div class="accent-bar"></div>

  <!-- HEAD SECTION -->
  <div class="card-head">
    {@render tImage()}
    {@render tHeader()}
  </div>

  <!-- CONTENT SECTION -->
  {@render tContent()}
</div>

<style>
  @import "/src/fonts.css";

  :host {
    display: block;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    line-height: 1.5;
  }

  div,
  img,
  h3,
  p {
    box-sizing: border-box;
  }

  /* --- VARIABLES --- */
  .card-root {
    --transition-speed: 0.4s;
    --card-bg: var(--bg-color-dark);
    --card-body-bg: var(--bg-color);
    --card-radius: 12px;
    --card-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --card-shadow-hover:
      0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --text-primary: var(--text-color-bright);
    --text-secondary: var(--text-color-bright-alt);
    --text-body: #4a5568;
    --border-color: #edf2f7;

    position: relative;
    background: var(--card-bg);
    width: var(--card-width);
    height: var(--card-height);
    border-radius: var(--card-radius);
    box-shadow: var(--card-shadow);
    transition: all var(--transition-speed) ease;
    overflow: hidden;
    display: flex;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .card-icon {
    color: var(--text-secondary);
  }

  .card-icon:hover {
    color: var(--text-secondary);
    border-bottom: 1px solid var(--text-secondary);
  }

  /* Hover Effects */
  .card-root:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow-hover);
  }

  /* --- ACCENT BAR --- */
  .accent-bar {
    position: absolute;
    background-color: var(--accent-color);
    transition: all var(--transition-speed) ease;
  }

  /* --- DIRECTIONAL LAYOUTS --- */

  /* DOWN (Vertical Standard) */
  .dir-down {
    flex-direction: column;
  }
  .dir-down .accent-bar {
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  }

  /* UP (Vertical Reverse) */
  .dir-up {
    flex-direction: column-reverse;
  }
  .dir-up .accent-bar {
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
  }

  /* RIGHT (Horizontal Standard) */
  .dir-right {
    flex-direction: row;
  }
  .dir-right .accent-bar {
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
  }

  /* LEFT (Horizontal Reverse) */
  .dir-left {
    flex-direction: row-reverse;
  }
  .dir-left .accent-bar {
    top: 0;
    bottom: 0;
    right: 0;
    width: 4px;
  }

  /* --- HEAD SECTION LAYOUTS --- */

  /* Vertical Group (Up/Down): Image and Header are side-by-side inside the Head block */
  .is-vertical .card-head {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    width: 100%;
  }
  .is-vertical .card-media {
    flex-shrink: 1.5;
    /* Optional: Limit image width in vertical mode if needed, usually managed by flex */
  }
  .is-vertical .card-header-wrapper {
    flex: 2 1 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Horizontal Group (Left/Right): Image and Header are stacked inside the Head block */
  .is-horizontal .card-head {
    display: flex;
    flex-direction: column;
    /* Flex grow logic for the head section vs content section */
    flex: 1 2 var(--title-width);
  }
  .is-horizontal .card-media {
    height: 30%; /* Fixed portion of height for image */
    flex-shrink: 1.5;
  }
  .is-horizontal .card-header-wrapper {
    flex: 2 1 auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    justify-content: left;
    inline-size: var(--title-width);
    max-height: 100%;
  }

  /* --- COMMON STYLES --- */
  .card-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .card-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .card-subtitle {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  /* --- CONTENT ANIMATION --- */

  .card-content-wrapper {
    display: grid;
    opacity: 0;
    background: var(--card-body-bg);
    overflow: hidden;
    transition:
      grid-template-rows var(--transition-speed) ease,
      grid-template-columns var(--transition-speed) ease,
      opacity var(--transition-speed) ease,
      border var(--transition-speed) ease;
    flex: 2 0 auto;
  }

  .card-content-inner {
    overflow: hidden;
    padding: 0;
    color: var(--text-body);
    font-size: 0.95rem;
  }

  /* --- VERTICAL ANIMATIONS (Down / Up) --- */

  .is-vertical .card-content-wrapper {
    grid-template-rows: 0fr;
  }

  .is-vertical:hover .card-content-wrapper {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .is-vertical .card-content-inner {
    padding: 0 1rem;
  }

  /* Vertical Padding Animation */
  .is-vertical:hover .card-content-inner {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  /* Specific Borders for Vertical */
  /* Down: Content appears below head */
  .dir-down:hover .card-content-wrapper {
    border-top: 1px solid var(--border-color);
  }
  /* Up: Content appears above head */
  .dir-up:hover .card-content-wrapper {
    border-bottom: 1px solid var(--border-color);
  }

  /* --- HORIZONTAL ANIMATIONS (Right / Left) --- */

  .is-horizontal .card-content-wrapper {
    grid-template-columns: 0fr;
  }

  .is-horizontal:hover .card-content-wrapper {
    grid-template-columns: 1fr;
    opacity: 1;
  }

  .is-horizontal .card-content-inner {
    height: 100%;
    padding: 1.25rem;
    max-width: var(--content-width);
  }

  /* Note: Borders for horizontal modes are less critical visually as the background color shift defines the area, but can be added if desired. */
  /* Right: Content appears right of head */
  .dir-right:hover .card-content-wrapper {
    border-left: 1px solid var(--border-color);
  }
  /* Left: Content appears left of head */
  .dir-left:hover .card-content-wrapper {
    border-right: 1px solid var(--border-color);
  }
</style>
