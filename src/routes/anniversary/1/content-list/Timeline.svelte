<svelte:options customElement="time-line" />

<script lang="ts">
  import {
    type TimelineOrientation,
    type AnimationEasing,
    type TimelineData,
    type TimelineEvent,
    TimelineNodeType,
    type TimelineNodePosition,
    type TimelineNodeExpansion,
    TimelineSkip,
    type TimelineDatum,
    type TimelineDimensions,
  } from "./types";

  import { select, type Selection } from "d3";
  import * as d3 from "d3";
  import { onMount, tick } from "svelte";

  let timelineRef: SVGSVGElement;
  let branchesRef: SVGSVGElement;
  let eventsRef: HTMLDivElement;
  let containerRef: HTMLDivElement;

  let containerWidth = $state(0);
  let containerHeight = $state(0);

  let timelineSel: Selection<SVGPathElement, unknown, null, undefined>;
  let branchesSel: Selection<SVGPathElement, unknown, null, undefined>[] = [];

  interface Props {
    data: TimelineData;
    orientation?: TimelineOrientation;
    lineColor?: string;
    branchColor?: string;
    lineWidth?: number;
    /// The space in px occupied by a single day.
    pxPerDay?: number;
    showBranches?: boolean;
    animate?: boolean;
    animationDuration?: number;
    easing?: AnimationEasing;
    padding?: number;
    /// Default branch x length
    branchLenX?: number;
    /// Default branch y length
    branchLenY?: number;
  }

  let {
    data = [],
    orientation = "horizontal",
    lineColor = "#4a5568",
    branchColor = "#4a5568",
    lineWidth = 2,
    pxPerDay = 150,
    showBranches = true,
    animate = false,
    animationDuration = 800,
    easing = "cubic",
    padding = 50,
    branchLenX = 60,
    branchLenY = 60,
  }: Props = $props();

  function nodes<T>(type: TimelineNodeType): Array<{ node: T; index: number }> {
    return data
      .map((x, i) => ({ x, i }))
      .filter(({ x }) => x.type == type)
      .map(({ x, i }) => ({ node: x as T, index: i }));
  }

  function events(): Array<{ node: TimelineEvent; index: number }> {
    return nodes<TimelineEvent>(TimelineNodeType.Event);
  }

  function skips(): Array<{ node: TimelineSkip; index: number }> {
    return nodes<TimelineSkip>(TimelineNodeType.Skip);
  }

  const easingFunctions = {
    linear: (t: number) => t,
    cubic: (t: number) => t * t * t,
    elastic: (t: number) =>
      t === 0
        ? 0
        : t === 1
          ? 1
          : Math.pow(2, -10 * t) *
              Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3) +
            1,
    bounce: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
  };

  function squigglePath(dX: number, amplitude = 30, wavelength = 25): string {
    if (dX < wavelength) {
      return `l ${dX},0`;
    }

    const numWaves = Math.floor(dX / wavelength);
    const remaining = dX % wavelength;

    let path = ``;
    for (let i = 0; i < numWaves; i++) {
      path += ` q ${wavelength / 4},${-amplitude} ${wavelength / 2},0`;
      path += ` q ${wavelength / 4},${amplitude} ${wavelength / 2},0`;
    }

    // connect any remaining distance with a straight line
    if (remaining > 0) {
      path += ` l ${remaining},0`;
    }

    return path;
  }

  // draw a branch to dX dY
  function branchPath(dX: number, dY: number) {
    return `c 0 0, ${dX} 0, ${dX} ${dY}`;
  }

  function straightPath(dX: number, dY: number = 0): string {
    return `l${dX},${dY}`;
  }

  function startPath(startX: number, yPos: number): string {
    return `M${startX},${yPos}`;
  }

  function fadeInPath(dX: number): string {
    let path = "";
    const factor = 2;
    for (let i = 0; i < 50; i++) {
      dX /= factor;
      path = `m${dX / 2},0` + straightPath(dX / 2, 0) + path;
    }
    return path;
  }

  function movePath(dX: number, yPos: number = 0): string {
    return `m${dX},${yPos}`;
  }

  function tweenPath(d1: TimelineDatum, d2: TimelineDatum): string {
    const width = segmentWidth(d1, d2);
    const squiggleWidth = width / 2;
    const paddingWidth = width - squiggleWidth;

    if (d1.type === TimelineNodeType.Skip) {
      return squigglePath(squiggleWidth) + straightPath(paddingWidth, 0);
    }
    if (d2.type === TimelineNodeType.Skip) {
      return straightPath(paddingWidth, 0) + squigglePath(squiggleWidth);
    }
    return straightPath(width, 0);
  }

  function mainPath(startX: number, startY: number): string {
    return d3.reduce(
      data,
      function (acc, datum, index) {
        const prev = data[index - 1];

        if (!prev) {
          const width = firstEventX() - startX;
          return acc + movePath(width / 2) + fadeInPath(width / 2);
        }

        return acc + tweenPath(prev, datum);
      },

      startPath(startX, startY),
    );
  }

  $effect(() => {
    const dims = {
      width: containerWidth,
      height: containerHeight,
    };
    tick().then(() => {
      dims.width = Math.max(contentWidth(), containerWidth);

      if (dims.width != 0 && dims.height != 0) {
        requestAnimationFrame(() => {
          drawTimeline(dims);
        });
      }
    });
  });

  async function drawTimeline(dims: TimelineDimensions) {
    if (!timelineRef || !branchesRef || !eventsRef || data.length === 0) return;

    // 1. Render/Update Nodes DOM elements
    await drawNodes();

    // 2. Position everything
    if (orientation === "horizontal") {
      drawHorizontalTimeline(dims);
    } else {
      throw new Error(
        "Vertical orientation not implemented in this D3 refactor yet.",
      );
    }
  }

  async function drawNodes() {
    // Wait for Svelte to render so we can measure dimensions in the next step
    await tick();
  }

  function eventWidth(event1: TimelineEvent, event2: TimelineEvent): number {
    const d1 = (event1 as TimelineEvent).date;
    const d2 = (event2 as TimelineEvent).date;
    if (!d1 || !d2) return 0;

    const pxPerMs = pxPerDay / 24 / 60 / 60 / 1000;
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return diff * pxPerMs;
  }

  function skipWidth(_skip: TimelineSkip): number {
    return pxPerDay / 2;
  }

  function branchWidth(datum?: TimelineEvent): number {
    return datum?.branchLenX ?? branchLenX;
  }

  function branchHeight(datum?: TimelineEvent): number {
    return datum?.branchLenY ?? branchLenY;
  }

  /// width of the segment between prev and curr datum.
  function segmentWidth(prev: TimelineDatum, curr: TimelineDatum): number {
    if (
      prev.type === TimelineNodeType.Skip ||
      curr.type === TimelineNodeType.Skip
    ) {
      return skipWidth(prev) + skipWidth(curr);
    }

    return eventWidth(prev, curr);
  }

  function firstEventX(): number {
    return padding + pxPerDay;
  }

  /// x position on the main line.
  function eventXPosition(datumIndex: number): number {
    return d3.reduce(
      data.slice(0, datumIndex + 1),
      function (acc, curr, index) {
        const prev = data[index - 1];

        if (!prev) {
          return firstEventX();
        }

        return acc + segmentWidth(prev, curr);
      },
      0,
    );
  }

  /// css-like content width of the timeline graph.
  function contentWidth(): number {
    return (
      padding * 2 +
      eventXPosition(data.length - 1) +
      branchWidth(data[data.length - 1])
    );
  }

  type YAnchor = "top" | "bottom";

  type AbsPos = { top: number | null; bottom: number | null };

  function getNodeX(
    datumIndex: number,
    branchWidth: number,
    node: Rect,
  ): number {
    const segmentPos = eventXPosition(datumIndex);
    return segmentPos - node.width / 2 + branchWidth;
  }

  function getNodeY(
    position: TimelineNodePosition,
    yPos: number,
    branchLen: number,
    node: Rect,
  ): number {
    switch (position) {
      case "above":
        return yPos - branchLen - node.height;
      case "below":
        return yPos + branchLen;
      default:
        throw new Error("not implemented");
    }
  }

  function defineNodeY(
    relativeTo: "top" | "bottom",
    node: Rect,
    dims: TimelineDimensions,
  ): number {
    switch (relativeTo) {
      case "top":
        return node.y;
      case "bottom":
        return dims.height - node.y - node.height;
    }
  }

  function anchorNodeY(
    expansion: TimelineNodeExpansion,
    pos: TimelineNodePosition,
    y: (a: YAnchor) => number,
  ): AbsPos {
    let p: AbsPos = { top: null, bottom: null };
    switch (expansion) {
      case "inside":
        if (pos === "above") p.top = y("top");
        if (pos === "below") p.bottom = y("bottom");
        break;
      case "outside":
        if (pos === "above") p.top = y("bottom");
        if (pos === "below") p.bottom = y("top");
        break;
      case "down":
        p.top = y("top");
        break;
      case "up":
        p.bottom = y("bottom");
        break;
    }
    return p;
  }

  function resolveCollision(
    rects: Rect[],
    node: Rect,
    direction: TimelineNodePosition,
    margin: number = 10,
  ): number {
    let problem, intersect;
    while (
      (problem = rects.find((x) => doRectsIntersect(x, node))) &&
      (intersect = getRectIntersection(problem, node))
    ) {
      const branchLeftEdge = node.x + node.width / 2 - branchLenX;
      const problemRightEdge = problem.x + problem.width;
      const problemBranchCollision = problemRightEdge - branchLeftEdge;
      if (problemBranchCollision > 0) {
        problem.x -= problemBranchCollision + margin;
      }

      switch (direction) {
        case "above":
          node.y -= intersect.height + margin;
          break;
        case "below":
          node.y += intersect.height + margin;
          break;
        default:
          throw new Error("not implemented");
      }
    }

    return node.y;
  }

  const cssPos = (x: number | null) => (x ? `${x}px` : "unset");

  interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  function getRectIntersection(rect1: Rect, rect2: Rect): Rect | null {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    // Check for valid intersection
    const width = x2 - x1;
    const height = y2 - y1;

    if (width > 0 && height > 0) {
      return { x: x1, y: y1, width, height };
    }

    return null;
  }

  // Additional helper to check if rectangles intersect
  function doRectsIntersect(rect1: Rect, rect2: Rect): boolean {
    return !(
      rect1.x > rect2.x + rect2.width ||
      rect1.x + rect1.width < rect2.x ||
      rect1.y > rect2.y + rect2.height ||
      rect1.y + rect1.height < rect2.y
    );
  }

  function defaultPos(index: number): TimelineNodePosition {
    return index % 2 === 0 ? "above" : "below";
  }

  function drawHorizontalTimeline(dims: TimelineDimensions): void {
    const root = select(timelineRef);
    const branchRoot = select(branchesRef);

    // Clear previous SVG elements to redraw
    branchRoot.selectAll("*").remove();
    root.selectAll("*").remove();
    branchesSel = [];

    const minRequiredWidth = contentWidth();

    // The final width is the maximum of the viewport (available space) and the required content width.
    // This allows the timeline to scroll if content > viewport, but span full width if content < viewport.
    const parentWidth = containerRef.parentElement?.clientWidth || 0;
    const finalWidth = Math.max(parentWidth, minRequiredWidth);

    // Apply width to container and update state
    select(containerRef).style("width", `${finalWidth}px`);
    dims = { width: finalWidth, height: dims.height };

    const yPos = dims.height / 2;

    // Draw Solid Path
    timelineSel = root
      .append("path")
      .attr("d", mainPath(padding, yPos))
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth)
      .attr("fill", "none")
      .attr("class", "timeline-main-line");

    if (animate) {
      // Animate Solid Line (Draw effect)
      const len = timelineSel.node()?.getTotalLength() || 0;
      timelineSel
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(animationDuration * 2)
        .ease(easingFunctions[easing])
        .attr("stroke-dashoffset", 0);
    }

    // Bind data
    const eventsSel = select(eventsRef)
      .selectAll<HTMLDivElement, any>(".timeline-node-container")
      .data(events());

    const rects: Rect[] = [];

    // 1. Calculate Arrangement
    eventsSel.each(function (d, i) {
      const { node, index } = d;
      const nodeRect = this.getBoundingClientRect();
      const position = node.position || defaultPos(i);

      nodeRect.x = getNodeX(index, branchWidth(node), nodeRect);
      nodeRect.y = getNodeY(position, yPos, branchHeight(node), nodeRect);
      nodeRect.y = resolveCollision(rects, nodeRect, position);

      rects[i] = nodeRect as Rect;
    });

    // 2. Apply Arrangement
    eventsSel.each(function (d, i) {
      const { node, index } = d;
      const pos = node.position || defaultPos(i);
      const rect = rects[i];
      const nodeSel = select(this);
      const expansion = node.expansion || "down";

      const left = rect.x;
      const { top, bottom } = anchorNodeY(expansion, pos, (a) =>
        defineNodeY(a, rect, dims),
      );
      const xPos = eventXPosition(index);

      // Node
      nodeSel
        .style("left", cssPos(left))
        .style("top", cssPos(top))
        .style("bottom", cssPos(bottom));

      if (animate) {
        nodeSel
          .transition()
          .duration(animationDuration)
          .ease(easingFunctions[easing])
          .style("opacity", "1");
      }

      // Branch
      if (showBranches) {
        const branchLenY =
          yPos - (pos === "above" ? top : bottom)! - rect.height;
        const dY = pos === "above" ? -branchLenY : +branchLenY;
        const dX = branchWidth(node);
        const branchStr = startPath(xPos, yPos) + branchPath(dX, dY);

        const branch = branchRoot
          .append("path")
          .attr("d", branchStr)
          .attr("stroke", branchColor)
          .attr("stroke-width", 1.5)
          .attr("fill", "none")
          .attr("class", "timeline-branch");

        branchesSel.push(branch);

        if (animate) {
          const length = branch.node()?.getTotalLength() || 0;
          branch
            .attr("stroke-dasharray", length)
            .attr("stroke-dashoffset", length)
            .transition()
            .duration(animationDuration / 2)
            .delay(animationDuration / 4)
            .ease(easingFunctions[easing])
            .attr("stroke-dashoffset", 0);
        }
      }
    });
  }
</script>

<div
  class="timeline-container"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
  bind:this={containerRef}
>
  <svg
    class="timeline-main"
    bind:this={timelineRef}
    width="100%"
    height="100%"
    aria-label="Timeline main line"
  ></svg>

  <svg
    class="timeline-branches"
    bind:this={branchesRef}
    width="100%"
    height="100%"
    aria-label="Timeline branches"
  ></svg>

  <div class="timeline-nodes" bind:this={eventsRef}>
    {#each events().map( (x, i) => ({ x, i }), ) as { x: { node }, i } (node.id || i)}
      <div
        id="timeline-event-{i}"
        class="timeline-node-container"
        style="position: absolute; left: 0px; top: 0px;"
        aria-label={`Timeline node ${i + 1}`}
      >
        <node.component {...node.props} />
      </div>
    {/each}
  </div>
</div>

<style>
  .timeline-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 80vh;
    overflow: visible;
  }

  .timeline-main,
  .timeline-branches {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  :global(.timeline-branches path) {
    pointer-events: stroke;
  }

  .timeline-nodes {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  :global(.timeline-node-container) {
    pointer-events: auto;
    cursor: pointer;
    transition: transform 0.3s ease;
    outline: none;
  }

  :global(.timeline-node-container:hover) {
    transform: scale(1.05);
    z-index: 10;
  }
</style>
