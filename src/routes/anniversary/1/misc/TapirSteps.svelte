<script lang="ts">
  import type { TapirStepsProps } from "./types";
  import maskUrl from "$lib/assets/misc/tapir-hoof-print-0.png";
  console.log(maskUrl);

  let {
    count = 10,
    size = 40,
    pathWidth = 100,
    gap = 25,
    dir = "down",
    color = "var(--bg-color-dark)",
  }: TapirStepsProps = $props();
</script>

<div
  class="tapir-path"
  style:--path-width="{pathWidth}px"
  style:--step-size="{size}px"
  style:--step-gap="{gap}px"
  style:--step-color={color}
  style:--mask-url="url({maskUrl})"
>
  {#each Array(count) as _, i}
    <div class={["step-wrapper", i % 2 === 0 ? "left" : "right", dir]}>
      <div class="hoof-print" role="img" aria-label="Tapir Step {i + 1}"></div>
      <!-- <enhanced:img -->
      <!--   src="$lib/assets/misc/tapir-hoof-print-0.png" -->
      <!--   sizes="100px" -->
      <!--   alt="Tapir Step {i + 1}" -->
      <!--   class="hoof-print" -->
      <!-- /> -->
    </div>
  {/each}
</div>

<style>
  .tapir-path {
    display: flex;
    flex-direction: column;
    width: var(--path-width);
    margin: 2rem auto;
    gap: var(--step-gap);
    box-sizing: border-box;
  }

  .step-wrapper {
    display: flex;
    width: 100%;
    position: relative;
  }

  .step-wrapper.left {
    justify-content: flex-start;
  }

  .step-wrapper.right {
    justify-content: flex-end;
  }

  .step-wrapper.down {
    transform: scaleY(-1);
  }

  .hoof-print {
    width: var(--step-size);
    opacity: 0.85;
    filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.2));
    transition: transform 0.2s ease;

    height: var(--step-size);

    background-color: var(--step-color);

    -webkit-mask-image: var(--mask-url);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: contain;

    mask-image: var(--mask-url);
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
  }

  .left .hoof-print {
    transform: rotate(-15deg);
  }

  .right .hoof-print {
    transform: rotate(15deg);
  }

  .hoof-print:hover {
    opacity: 1;
    transform: scale(1.1);
  }
</style>
