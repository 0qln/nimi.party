<script lang="ts">
  import { onMount, tick } from "svelte";

  let className = "";
  export { className as class };

  let container: HTMLDivElement;
  let innerBlock: HTMLDivElement;
  let observer: ResizeObserver;

  // The Binary Search Logic
  const fitText = () => {
    if (!container || !innerBlock) return;

    const targetHeight = container.clientHeight;
    if (targetHeight === 0) return; // Element is hidden or has no height

    // --- STEP 1: Find the Hard Minimum Width ---
    // We temporarily set width to 'min-content'. This shrinks the container
    // to the width of the widest unbreakable element (long word, image, etc.).
    // If we go smaller than this, content will overflow horizontally.
    innerBlock.style.width = "min-content";

    // We use Math.ceil to ensure we don't lose sub-pixel precision
    // causing a slight overflow.
    const safeMinWidth = Math.ceil(innerBlock.getBoundingClientRect().width);

    // --- STEP 2: Binary Search ---

    // Start the search at the safe minimum, not 0.
    let minW = safeMinWidth;
    let maxW = 10000; // Arbitrary large number
    let optimalWidth = maxW;

    // Safety check: if our arbitrary max is somehow smaller than the content,
    // just use the content width.
    if (maxW < minW) maxW = minW;

    while (minW <= maxW) {
      const midW = Math.floor((minW + maxW) / 2);
      innerBlock.style.width = midW + "px";

      // Check height:
      // Note: We also check if scrollWidth > clientWidth to catch edge cases
      // where the browser refuses to wrap despite our width setting.
      if (innerBlock.scrollHeight > targetHeight) {
        // Text is too tall (wrapping too much) -> Needs MORE width
        minW = midW + 1;
      } else {
        // Text fits vertically -> Try to squeeze Width TIGHTER
        optimalWidth = midW;
        maxW = midW - 1;
      }
    }

    // Apply final width
    // We ensure it never goes below the safe minimum we calculated at the start
    innerBlock.style.width = Math.max(optimalWidth, safeMinWidth) + "px";
  };

  onMount(() => {
    // Run initially
    fitText();

    // Re-run if the window resizes or the element changes size
    if (container) {
      observer = new ResizeObserver(() => fitText());
      observer.observe(container);
    }

    return () => observer?.disconnect();
  });

  // Re-run if the content inside the slot changes
  const setupSlotObserver = (node: Node) => {
    const mutationObserver = new MutationObserver(async () => {
      await tick(); // Wait for Svelte to render changes
      fitText();
    });
    mutationObserver.observe(node, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return {
      destroy() {
        mutationObserver.disconnect();
      },
    };
  };
</script>

<div
  bind:this={container}
  class={className}
  style="width: fit-content; overflow: hidden;"
>
  <div
    bind:this={innerBlock}
    use:setupSlotObserver
    style="word-wrap: break-word;"
  >
    <slot />
  </div>
</div>
