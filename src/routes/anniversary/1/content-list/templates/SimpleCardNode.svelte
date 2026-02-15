<svelte:options customElement="simple-card-node" />

<script lang="ts">
  import { select } from "d3-selection";
  import type { TimelineEventProps } from "../types";
  import FluidText from "../../misc/FluidText.svelte";

  let {
    title = [],
    subtitle = "",
    imageUrl: image = "",
    externalLink = undefined,
    animate = true,
    accentColor = "var(--accent-color)",
    onHeaderResize: onHeaderResize = undefined,
  }: TimelineEventProps = $props();

  let isImageLoaded = $state(false);

  function dispatchHeaderResize(v: any) {
    if (!onHeaderResize) {
      return;
    }

    onHeaderResize(new CustomEvent("headerResize", { detail: v }));
  }

  let headerRef: HTMLDivElement;
  export function getNodeRect(): DOMRect | undefined {
    return select(headerRef)?.node()?.getBoundingClientRect();
  }
</script>

{#snippet tImage()}
  {#if typeof image === "string"}
    <div class="card-media">
      <enhanced:img src={image} sizes="400px" loading="lazy" />
    </div>
  {:else if image instanceof Promise}
    {#await image then image}
      {#if image}
        <div
          class="card-media"
          style:width={isImageLoaded || !animate ? "100%" : "0%"}
          style:transition="width 0.3s, height 0.3s"
        >
          <enhanced:img
            src={image}
            sizes="400px"
            loading="lazy"
            onload={() => (isImageLoaded = true)}
          />
        </div>
      {/if}
    {/await}
  {/if}
{/snippet}

{#snippet tHeader()}
  <FluidText class="card-header-wrapper">
    <h3 class="card-title delius-regular">
      {#each title as line}
        {line} <br />
      {/each}
    </h3>
    {#if subtitle}
      <div
        class={["flex", "flex-row", "items-center", "mt-0.25", "space-x-0.25"]}
      >
        {@render tExternalLink()}
        <p class={["card-subtitle", "m-0!"]}>{subtitle}</p>
      </div>
    {/if}
  </FluidText>
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

<div
  class="card-root"
  style:--card-accent-color={accentColor}
  role="article"
  aria-label={`Card: ${title}`}
>
  <!-- Accent Line -->
  <div class="accent-bar"></div>

  <!-- HEAD SECTION -->
  <div
    class="card-head"
    bind:borderBoxSize={null, (v) => dispatchHeaderResize(v)}
    bind:this={headerRef}
  >
    {#if image}
      {@render tImage()}
    {/if}
    {@render tHeader()}
  </div>
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
    --card-body-bg: var(--bg-color-paper);
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
    border-radius: var(--card-radius);
    box-shadow: var(--card-shadow);
    transition: all var(--transition-speed) ease;
    overflow: hidden;
    display: flex;
    border: 1px solid rgba(0, 0, 0, 0.05);

    min-width: 200px;
    max-width: 400px;
    max-height: 150px;
    min-height: 100px;
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
    background-color: var(--card-accent-color);
    transition: all var(--transition-speed) ease;
  }

  .accent-bar {
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  }

  /* --- HEAD SECTION LAYOUTS --- */
  .card-head {
    display: flex;
    flex-direction: row;
  }
  .card-media {
    flex-grow: 1;
    flex-basis: auto;
    flex-shrink: 2;
  }
  :global(.card-header-wrapper) {
    height: 100%;
    flex-grow: 2;
    flex-shrink: 0;
    flex-basis: min-content;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
</style>
