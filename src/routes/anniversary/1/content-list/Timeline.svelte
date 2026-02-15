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

  import { select } from "d3";
  import * as d3 from "d3";
  import { tick } from "svelte";

  import lineLeaf from "$lib/assets/frame/eucalyptus-leaf.png?enhanced&w=100";
  import lineBranch2 from "$lib/assets/frame/eucalyptus-branch-small-2.png?enhanced&w=100";
  import lineBranchYoung from "$lib/assets/frame/eucalyptus-branch-young.png?enhanced&w=100";
  import lineBlossom from "$lib/assets/frame/blossom-single.png?enhanced&w=100";

  import { isBetween, mulberry32 } from "../utils";

  let {
    data = [],
    orientation = "horizontal",
    lineColor = "#6F5548",
    branchColor = "#755950",
    lineWidth = 2,
    lineArtifactGap = 300,
    lineLeafSize = { w: 20, h: 20 },
    lineLeafRoot = "bottom-center",
    lineBranch2Size = { w: 40, h: 40 },
    lineBranch2Root = "bottom-center",
    lineBranchYoungSize = { w: 40, h: 30 },
    lineBranchYoungRoot = "bottom-left",
    lineBlossomSize = { w: 25, h: 25 },
    lineBlossomRoot = "none",
    pxPerDay = 150,
    showBranches = true,
    animateBranch = false,
    animateNodes = true,
    animationDuration = 300,
    easing = "cubic",
    padding = 50,
    branchLenX = 60,
    branchLenY = 60,
  }: Props = $props();

  let branchesRef: SVGSVGElement;
  let lineGroupRef: SVGGElement;
  let eventsRef: HTMLDivElement;
  let containerRef: HTMLDivElement;

  let containerWidth = $state(0);
  let containerHeight = $state(0);

  let events: Array<{ node: TimelineEvent; index: number }> = $derived(
    nodes<TimelineEvent>(TimelineNodeType.Event),
  );

  let skips: Array<{ node: TimelineSkip; index: number }> = $derived(
    nodes<TimelineSkip>(TimelineNodeType.Skip),
  );

  let xPositions = $derived.by(() => {
    return Array.from({ length: data.length }, (_, datumIndex: number) => {
      return d3.reduce(
        data.slice(0, datumIndex + 1),
        function (acc, curr, index) {
          const prev = data[index - 1];

          if (!prev) {
            return firstDatumX();
          }

          return acc + segmentWidth(prev, curr);
        },
        0,
      );
    });
  });

  let decorations = $derived.by<TimelineDecoration[]>(() => {
    const dims = {
      width: containerWidth,
      height: containerHeight,
    };
    const xs: TimelineDecoration[] = [];
    if (lineArtifactGap) {
      const rng = mulberry32(69);
      const lineArtifactStart = lineArtifactGap;
      const lineArtifactEnd = datumXPosition(data.length - 2);

      const addDecoration = (
        xMain: number,
        type: "leaf" | "branch2" | "young" | "blossom",
      ) => {
        let size: Size;
        let rootStr: string;
        let src: string | object;
        let xOffset = 0;
        let yOffsetMod = 0;
        let rngOffFactor = 1;

        if (type === "leaf") {
          size = lineLeafSize;
          rootStr = lineLeafRoot;
          src = lineLeaf;
          rngOffFactor = 1;
        } else if (type === "branch2") {
          size = lineBranch2Size;
          rootStr = lineBranch2Root;
          src = lineBranch2;
          rngOffFactor = 0.33;
        } else if (type === "young") {
          size = lineBranchYoungSize;
          rootStr = lineBranchYoungRoot;
          src = lineBranchYoung;
          xOffset = 10;
          rngOffFactor = 0.33;
        } else {
          // blossom
          size = lineBlossomSize;
          rootStr = lineBlossomRoot;
          src = lineBlossom;
          xOffset = 5;
        }

        const width = size.w;
        const height = size.h;
        const index = xMain / lineArtifactGap;
        const pos =
          type === "leaf"
            ? index % 3 == 0
              ? "above"
              : "below"
            : index % 2 == 0
              ? "above"
              : "below";

        const isLast = xMain + lineArtifactGap >= lineArtifactEnd;
        const isFirst = xMain == lineArtifactStart;
        const rngOff = lineArtifactGap * rngOffFactor;

        if (type === "blossom") {
          const x = padding + xMain + 5;
          const y =
            mainlineY(dims) -
            (pos === "above" ? height : 0) +
            (pos === "above" ? -10 : 10);
          const root = rootToOffset(rootStr, size);
          if (!isOnSkipSection(x)) {
            xs.push({
              id: `blossom-${index}`,
              src,
              width,
              height,
              style: `position: absolute; left: 0; top: 0; width: ${width}px; height: ${height}px; transform-origin: 0 0; transform: translate(${x}px, ${y}px) scale(1, 1) translate(${root.x}px, ${root.y}px);`,
            });
          }
          return;
        }

        const xRng = rng({ lo: isFirst ? 0 : rngOff, hi: isLast ? 0 : rngOff });
        const x = padding + xMain + xRng + xOffset;
        const y = mainlineY(dims);
        const root = rootToOffset(rootStr, size);

        if (!isOnSkipSection(x)) {
          const mirror = pos === "below";
          xs.push({
            id: `${type}-${index}`,
            src,
            width,
            height,
            style: `position: absolute; left: 0; top: 0; width: ${width}px; height: ${height}px; transform-origin: 0 0; transform: translate(${x}px, ${y}px) scale(1, ${mirror ? -1 : 1}) translate(${root.x}px, ${root.y}px);`,
          });
        }
      };

      for (
        let xMain = lineArtifactStart;
        xMain < lineArtifactEnd;
        xMain += lineArtifactGap
      ) {
        addDecoration(xMain, "leaf");
        addDecoration(xMain, "branch2");
        addDecoration(xMain, "young");
        // addDecoration(xMain, "blossom");
      }
    }

    return xs;
  });

  interface MainlineDatum {
    padding: number;
    y: number;
  }

  interface Size {
    w: number;
    h: number;
  }

  type YAnchor = "top" | "bottom";

  type AbsPos = { top: number | null; bottom: number | null };

  interface TimelineDecoration {
    id: string;
    src: string | object;
    style: string;
    width: number;
    height: number;
  }

  interface Props {
    data: TimelineData;
    orientation?: TimelineOrientation;
    lineColor?: string;
    branchColor?: string;
    lineWidth?: number;
    lineArtifactGap?: number | undefined;
    lineLeafSize?: Size | undefined;
    lineLeafRoot?: string | undefined;
    lineBranch2Size?: Size | undefined;
    lineBranch2Root?: string | undefined;
    lineBranchYoungSize?: Size | undefined;
    lineBranchYoungRoot?: string | undefined;
    lineBlossomSize?: Size | undefined;
    lineBlossomRoot?: string | undefined;
    /// The space in px occupied by a single day.
    pxPerDay?: number;
    showBranches?: boolean;
    animateBranch?: boolean;
    animateNodes?: boolean;
    animationDuration?: number;
    easing?: AnimationEasing;
    padding?: number;
    /// Default branch x length
    branchLenX?: number;
    /// Default branch y length
    branchLenY?: number;
  }

  function nodes<T>(type: TimelineNodeType): Array<{ node: T; index: number }> {
    return data
      .map((x, i) => ({ x, i }))
      .filter(({ x }) => x.type == type)
      .map(({ x, i }) => ({ node: x as T, index: i }));
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
          const width = firstDatumX() - startX;
          return acc + movePath(width / 2) + fadeInPath(width / 2);
        }

        return acc + tweenPath(prev, datum);
      },

      startPath(startX, startY),
    );
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

    return eventWidth(prev as TimelineEvent, curr as TimelineEvent);
  }

  function firstDatumX(): number {
    return padding + pxPerDay;
  }

  function lastDatumX(): number {
    return datumXPosition(data.length - 1);
  }

  /// x position on the main line.
  function datumXPosition(datumIndex: number): number {
    return xPositions[datumIndex];
  }

  /// whether this x coordinate is on a skip section.
  function isOnSkipSection(x: number): boolean {
    return skips.some(({ node, index }) =>
      isBetween(
        x,
        datumXPosition(index) - skipWidth(node),
        datumXPosition(index) + skipWidth(node),
      ),
    );
  }

  /// css-like content width of the timeline graph.
  function contentWidth(): number {
    return (
      padding * 2 +
      datumXPosition(data.length - 1) +
      branchWidth(data[data.length - 1] as TimelineEvent)
    );
  }

  function getNodeX(
    datumIndex: number,
    branchWidth: number,
    node: Rect,
  ): number {
    const segmentPos = datumXPosition(datumIndex);
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

  function resolveCollisions(
    rects: Rect[],
    center: number,
    margin: number = 10,
  ) {
    function moveDir(pos: TimelineNodePosition): 1 | -1 {
      switch (pos) {
        case "above":
          return -1;
        case "below":
          return 1;
        default:
          throw new Error("not implemented");
      }
    }

    function moveRect(
      dir: TimelineNodePosition,
      theOneBeingMoved: Rect,
      ...theOnesStayingInPlace: Rect[]
    ) {
      const resolvingDistance = Math.max(
        ...[
          ...theOnesStayingInPlace.map((x) => x.height),
          ...theOnesStayingInPlace
            .map((x) => getRectIntersection(x, theOneBeingMoved)?.height)
            .filter((x) => x != null),
        ],
      );
      theOneBeingMoved.y += moveDir(dir) * (resolvingDistance + margin);

      // make sure that the node is not covering the problem's branch
      const rightEdge = (r: Rect) => r.x + r.width;
      const xCenter = (r: Rect) => r.x + r.width / 2;
      const branch: Rect = {
        x: xCenter(theOneBeingMoved) - branchLenX,
        y: null!,
        width: branchLenX,
        height: null!,
      };
      for (const rect of theOnesStayingInPlace) {
        const leftIntersect = rightEdge(rect) - branch.x;
        const rightIntersect = rect.x - rightEdge(branch);
        if (leftIntersect > 0 && rightIntersect < 0) {
          rect.x -= leftIntersect;
        }
        if (leftIntersect < 0 && rightIntersect > 0) {
          rect.x += rightIntersect;
        }
      }
    }

    const aboveRects = rects.filter((r) => r.y < center);
    const belowRects = rects.filter((r) => r.y > center);

    // first make sure that we resolve 3-collisions by moving the middle.
    function resolve3Collisions(dir: TimelineNodePosition, rects: Rect[]) {
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        const prev = rects[i - 1];
        const next = rects[i + 1];
        const prevCollision = prev && doRectsIntersect(rect, prev);
        const nextCollision = next && doRectsIntersect(rect, next);
        if (prevCollision && nextCollision) {
          // move this
          moveRect(dir, rect, next, prev);
        }
      }
    }
    resolve3Collisions("above", aboveRects);
    resolve3Collisions("below", belowRects);

    // then resolve 2-collisions.
    function resolve2Collisions(dir: TimelineNodePosition, rects: Rect[]) {
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        const prev = rects[i - 1];
        const next = rects[i + 1];

        if (next && doRectsIntersect(rect, next)) {
          // move next
          moveRect(dir, next, rect);
          continue;
        }

        if (prev && doRectsIntersect(rect, prev)) {
          // move this
          moveRect(dir, rect, prev);
          continue;
        }
      }
    }
    resolve2Collisions("above", aboveRects);
    resolve2Collisions("below", belowRects);
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

  $effect(() => {
    const dims = {
      width: containerWidth,
      height: containerHeight,
    };
    tick().then(() => {
      dims.width = Math.max(contentWidth(), containerWidth);

      if (dims.width != 0 && dims.height != 0) {
        scheduleDraw();
      }
    });
  });

  let isDrawing = false;
  let redrawPending = false;
  async function scheduleDraw() {
    // 1. If we are already running, just flag that we need another run after this one.
    // This effectively "queues" the LATEST request and discards intermediate ones.
    if (isDrawing) {
      redrawPending = true;
      return;
    }

    // 2. Lock the process
    isDrawing = true;

    try {
      // 3. Keep drawing as long as there is a pending request.
      do {
        redrawPending = false;
        await drawTimeline({
          width: containerWidth,
          height: containerHeight,
        });
      } while (redrawPending);
    } finally {
      // 4. Release the lock only when we are totally caught up
      isDrawing = false;
    }
  }

  async function drawTimeline(dims: TimelineDimensions) {
    if (!lineGroupRef || !branchesRef || !eventsRef || data.length === 0)
      return;

    // 1. Render/Update Nodes DOM elements
    await drawNodes();

    // 2. Position everything
    if (orientation === "horizontal") {
      drawHorizontalTimeline(dims);
    } else {
      throw new Error("not implemented");
    }
  }

  async function drawNodes() {
    // Wait for Svelte to render so we can measure dimensions in the next step
    await tick();
  }

  // The final width is the maximum of the viewport (available space) and the required content width.
  function getFinalWidth(): number {
    const minRequiredWidth = contentWidth();
    const parentWidth = containerRef.parentElement?.clientWidth || 0;
    const finalWidth = Math.max(parentWidth, minRequiredWidth);
    return finalWidth;
  }

  function mainlineY(dims: TimelineDimensions): number {
    return dims.height / 2;
  }

  function rootToOffset(root: string, size: Size): { x: number; y: number } {
    switch (root) {
      case "bottom-center":
        return { x: size.w / 2, y: -size.h };
      case "bottom-left":
        return { x: size.w, y: -size.h };
      case "none":
        return { x: 0, y: 0 };
      default:
        throw Error("unimplemented");
    }
  }

  // Draw Main Line
  $effect(() => {
    const dims = {
      width: containerWidth,
      height: containerHeight,
    };

    const timelineSel = select(lineGroupRef)
      .select<SVGPathElement>("path")
      .datum({ y: mainlineY(dims), padding })
      .attr("d", (d) => mainPath(d.padding, d.y))
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);

    if (animateBranch) {
      const len = timelineSel.node()?.getTotalLength() || 0;
      timelineSel
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(animationDuration * 2)
        .ease(easingFunctions[easing])
        .attr("stroke-dashoffset", 0);
    }
  });

  function drawHorizontalTimeline(dims: TimelineDimensions): void {
    // Apply width to container
    const finalWidth = getFinalWidth();
    select(containerRef).style("width", `${finalWidth}px`);

    const yPos = mainlineY(dims);
    const eventsData = events;

    // 0. Measure Nodes
    const rects: Rect[] = eventsData.map((d) => {
      const { node } = d;
      return node.getNodeRect() as Rect;
    });

    // 1. Calculate Arrangement
    for (let i = 0; i < eventsData.length; i++) {
      const { node, index } = eventsData[i];
      const position = node.position || defaultPos(i);
      const rect = rects[i];
      rect.x = getNodeX(index, branchWidth(node), rect);
      rect.y = getNodeY(position, yPos, branchHeight(node), rect);
    }

    resolveCollisions(rects, yPos);

    // 2. Apply Arrangement
    const nodeData: any[] = eventsData.map((d, i) => {
      const { node, index } = d;
      const pos = node.position || defaultPos(i);
      const rect = rects[i];
      const exp = node.expansion || "down";
      const left = rect.x;
      const { top, bottom } = anchorNodeY(exp, pos, (a) =>
        defineNodeY(a, rect, dims),
      );

      return { left, top, bottom, rect, pos, node, index };
    });

    // Node
    select(eventsRef)
      .selectAll<HTMLDivElement, any>(".timeline-node-container")
      .data(nodeData)
      .style("left", (d) => cssPos(d.left))
      .style("top", (d) => cssPos(d.top))
      .style("bottom", (d) => cssPos(d.bottom));

    // Branch
    if (showBranches) {
      const branchesSel = select(branchesRef)
        .selectAll<SVGPathElement, any>("*")
        .data(nodeData, (d: any) => d.index)
        .join("path")
        .attr("d", (d) => {
          const xPos = datumXPosition(d.index);
          const branchLenY =
            yPos - (d.pos === "above" ? d.top : d.bottom)! - d.rect.height;
          const dY = d.pos === "above" ? -branchLenY : +branchLenY;
          const dX = branchWidth(d.node);
          return startPath(xPos, yPos) + branchPath(dX, dY);
        })
        .attr("stroke", branchColor)
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("class", "timeline-branch");

      if (animateBranch) {
        branchesSel
          .attr("stroke-dasharray", function () {
            return this?.getTotalLength() || 0;
          })
          .attr("stroke-dashoffset", function () {
            return this?.getTotalLength() || 0;
          })
          .transition()
          .duration(animationDuration / 2)
          .delay(animationDuration / 4)
          .ease(easingFunctions[easing])
          .attr("stroke-dashoffset", 0);
      }
    }
  }
</script>

<div
  class="timeline-container"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
  bind:this={containerRef}
>
  <svg
    class="timeline-branches"
    bind:this={branchesRef}
    width="100%"
    height="100%"
    aria-label="Timeline branches"
  ></svg>

  <svg
    class="timeline-main"
    width="100%"
    height="100%"
    aria-label="Timeline main line"
  >
    <!-- Group for D3 to draw the main path into -->
    <g bind:this={lineGroupRef}
      ><path class="timeline-main-line" fill="none"></path></g
    >
  </svg>

  <div class="timeline-decorations">
    {#each decorations as d (d.id)}
      <enhanced:img
        class="timeline-main-line-leaf"
        src={d.src}
        alt=""
        style={d.style}
        sizes="100px"
      />
    {/each}
  </div>

  <div class="timeline-nodes" bind:this={eventsRef}>
    {#each events.map( (x, i) => ({ x, i }), ) as { x: { node }, i } (node.id || i)}
      <div
        id="timeline-event-{i}"
        class={[
          "timeline-node-container",
          animateNodes && "timeline-node-animation",
        ]}
        style="position: absolute; left: 0px; top: 0px;"
        aria-label={`Timeline node ${i + 1}`}
      >
        <node.component
          bind:this={node.ref}
          maxHeight="{containerHeight / 2}px"
          onHeaderResize={(_v: any) => {
            scheduleDraw();
          }}
          {...node.props}
          animate={animateNodes}
        />
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
  .timeline-branches,
  .timeline-decorations {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .timeline-decorations {
    overflow: hidden;
  }

  :global(.timeline-main-line-leaf) {
    pointer-events: none;
  }

  :global(.timeline-branches path) {
    pointer-events: stroke;
  }

  .timeline-nodes {
    position: relative;
    width: calc(100% + 500px);
    height: 100%;
    pointer-events: none;
  }

  .timeline-node-container {
    pointer-events: auto;
    cursor: pointer;
    outline: none;
  }

  .timeline-node-animation {
    transition:
      transform 0.3s ease,
      left 0.3s ease,
      top 0.3s ease,
      bottom 0.3s ease,
      right 0.3s ease;
  }

  .timeline-node-container:hover {
    transform: scale(1.05);
    z-index: 10;
  }
</style>
