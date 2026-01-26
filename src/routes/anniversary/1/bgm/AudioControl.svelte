<script lang="ts">
  import { onMount } from "svelte";
  import type { AudioControlProps } from "./types";

  let audioRef: HTMLAudioElement;
  let isPlaying = $state(false);
  let volume = $state(0.25);
  let playSession = $state(0);

  let { src, autoplay = true }: AudioControlProps = $props();

  function playMusic() {
    playSession += 1;
    audioRef
      .play()
      .then(() => {
        isPlaying = true;
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function pauseMusic() {
    audioRef.pause();
    isPlaying = false;
  }

  function toggleMusic() {
    if (!audioRef) return;

    if (audioRef.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  }

  if (autoplay) {
    //onMount(() => setInterval(playMusic, 3000));
  }
</script>

{#snippet iconPlay()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class={["icon", "size-1"]}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
    />
  </svg>
{/snippet}

{#snippet iconPause()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class={["icon", "size-1"]}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15.75 5.25v13.5m-7.5-13.5v13.5"
    />
  </svg>
{/snippet}

<audio
  bind:this={audioRef}
  {src}
  loop
  bind:volume
  onplay={() => {
    if (!isPlaying) {
      playSession += 1;
      isPlaying = true;
    }
  }}
  onpause={() => (isPlaying = false)}
  autoplay
></audio>

<div
  class={[
    "fixed",
    "bottom-1",
    "right-1",
    "flex",
    "items-center",
    "flex-col",
    "p-0.5",
    "rounded-xl",
    "bg-white/10",
    "root",
    "overflow-visible",
    "space-y-0.5",
  ]}
>
  <span class={["text-xl", "m-0"]}>BGM</span>
  <button
    onclick={toggleMusic}
    class={[
      "relative",
      "rounded-lg",
      "flex",
      "items-center",
      "cursor-pointer",
      "font-bold",
    ]}
  >
    {#if isPlaying}
      {@render iconPause()}
    {:else}
      {@render iconPlay()}
    {/if}
  </button>
  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    bind:value={volume}
    title="Volume"
    class={["w-2", "cursor-pointer"]}
    style:height="4px"
  />
  <div
    class={[
      "notes",
      isPlaying ? "opacity-100" : "opacity-0",
      "pointer-events-none",
    ]}
  >
    {#key playSession}
      <div class="note-1">&#9835; &#9833;</div>
      <div class="note-2">&#9833;</div>
      <div class="note-3">&#9839; &#9834;</div>
      <div class="note-4">&#9834;</div>
    {/key}
  </div>
</div>

<style>
  .root {
    background-color: var(--accent-color-darkgreen);
    color: var(--text-color-bright);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    --thumb-color: var(--accent-color-darkgreen);
    --thumb-outline-color: var(--track-color);
    --track-color: #fff;
    --stroke-size: 2px;
  }
  input[type="range"]:focus {
    outline: none;
  }

  /* Track Styles */
  input[type="range"]::-webkit-slider-runnable-track {
    height: var(--stroke-size);
    background: var(--track-color);
    border-radius: 5px;
  }
  /* Thumb Styles */
  input[type="range"]::-webkit-slider-thumb {
    border: var(--stroke-size) solid var(--thumb-outline-color);
    border-radius: 50%;
    background: var(--thumb-color);
    -webkit-appearance: none;
  }
  /* Firefox Styles */
  input[type="range"]::-moz-range-track {
    background: var(--track-color);
    border-radius: 5px;
    height: var(--stroke-size);
  }
  input[type="range"]::-moz-range-thumb {
    border: var(--stroke-size) solid var(--thumb-outline-color);
    border-radius: 50%;
    background: var(--thumb-color);
  }
  /* MS Styles (TODO) */
  input[type="range"]::-ms-track {
    height: 10px;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  input[type="range"]::-ms-fill-lower,
  input[type="range"]::-ms-fill-upper {
    background: #3071a9;
    border: 1px solid #000000;
    border-radius: 10px;
    box-shadow: 1px 1px 1px #000000;
  }
  input[type="range"]::-ms-thumb {
    margin-top: 1px;
    box-shadow: 1px 1px 1px #000000;
    border: 1px solid #000000;
    border-radius: 5px;
    background: #ffffff;
  }

  .root > * {
    padding: 0;
  }

  button {
    transition: transform 0.1s;
  }

  button:active {
    transform: scale(0.95);
  }

  .icon {
    display: inline;
  }

  .notes {
    position: absolute;
    display: relative; /* Note: display: relative is not valid CSS, but kept as requested */
    right: 50%;
    top: 0;
    transition: opacity 1s ease-out; /* Smooth fade added here */
  }

  .note-1,
  .note-2,
  .note-3,
  .note-4 {
    position: absolute;
    animation: notes 2s infinite linear;
    font-size: 35px;
    opacity: 0;
  }

  .note-1 {
    top: 60px;
    left: 0;
    animation-delay: 0.5s;
  }

  .note-2 {
    top: 30px;
    left: 30%;
    animation-delay: 1s;
  }

  .note-3 {
    top: 90px;
    left: 60%;
    animation-delay: 1.5s;
  }

  .note-4 {
    top: 40px;
    left: 90%;
    animation-delay: 2s;
  }

  @keyframes notes {
    0% {
      transform: scale(1) translate(0, 0);
      opacity: 0;
    }
    50% {
      opacity: 1;
      transform: scale(1.5) translate(50%, -50%);
    }
    80% {
      opacity: 0;
      transform: scale(1.5) translate(100%, -100%);
    }
    100% {
      transform: scale(1.5) translate(100%, -100%);
      opacity: 0;
    }
  }
</style>
