<script lang="ts">
  import type { FluidTextProps } from "./types";

  let { class: className = "", children }: FluidTextProps = $props();

  let container = $state<HTMLDivElement>();
  let innerBlock = $state<HTMLDivElement>();

  const DEBOUNCE_MS = 100;
  const MAX_ITERATIONS = 20;

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let mutationObserver: MutationObserver | undefined;

  const fitText = async () => {
    if (!container || !innerBlock || typeof window === "undefined") return;

    const targetHeight = container.clientHeight;
    if (targetHeight === 0) return;

    // 1. Get the "Hard Minimum" (width of the longest word/element)
    innerBlock.style.width = "min-content";
    const minW = Math.ceil(innerBlock.getBoundingClientRect().width);

    // 2. Get the "Maximum Necessary Width" (Single line width)
    innerBlock.style.width = "max-content";
    const maxW = Math.ceil(innerBlock.getBoundingClientRect().width);

    // 3. Binary Search
    let low = minW;
    let high = maxW;
    let optimalWidth = maxW;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      if (low > high) break;

      const midW = Math.floor((low + high) / 2);
      innerBlock.style.width = `${midW}px`;

      // Check height:
      if (innerBlock.scrollHeight > targetHeight) {
        // Content is too tall (overflowing vertically) -> Needs MORE width
        low = midW + 1;
      } else {
        // Content fits vertically -> Try to squeeze Width TIGHTER
        optimalWidth = midW;
        high = midW - 1;
      }
    }

    // 4. Apply Final Width
    innerBlock.style.width = `${Math.max(optimalWidth, minW)}px`;
  };

  const triggerUpdate = () => {
    if (typeof window === "undefined") return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      requestAnimationFrame(fitText);
    }, DEBOUNCE_MS);
  };

  $effect(() => {
    if (!container || !innerBlock) return;

    triggerUpdate();

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) triggerUpdate();
      }
    });
    resizeObserver.observe(container);

    mutationObserver = new MutationObserver(() => triggerUpdate());
    mutationObserver.observe(innerBlock, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      clearTimeout(debounceTimer);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  });
</script>

<div
  bind:this={container}
  class={className}
  style="width: fit-content; height: 100%; overflow: hidden;"
>
  <div bind:this={innerBlock} style="word-wrap: break-word; width: auto;">
    {@render children?.()}
  </div>
</div>
