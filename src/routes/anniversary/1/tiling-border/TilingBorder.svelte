<svelte:options customElement="tiling-border" />

<script lang="ts">
  import * as d3 from "d3";
  import { hashCode, mulberry32 } from "../utils";
  import type { RngRange } from "./types";

  interface Props {
    spritePath: string;
    size?: number;
    clazz?: string[];
    uRandom?: RngRange;
    vRandom?: RngRange;
    angleRandom?: RngRange;
    density?: { u: number; v: number };
  }

  let {
    spritePath,
    size = 150,
    clazz = [],
    uRandom = { lo: -5, hi: 5 },
    vRandom = { lo: -20, hi: 10 },
    angleRandom = { lo: -5, hi: 5 },
    density = {
      u: 5,
      v: 0.05,
    },
  }: Props = $props();
  let sizeVal = (() => size)();

  let tilesRef: HTMLDivElement;
  let containerRef: HTMLDivElement;

  interface Size {
    width: number;
    height: number;
  }
  let containerWidth = $state(0);
  let containerHeight = $state(0);
  let dims: Size = $derived({ width: containerWidth, height: containerHeight });

  interface TileData {
    size: Size;
  }
  let tileInfo: TileData = {
    size: { width: sizeVal, height: sizeVal },
  };

  $effect(() => {
    const dimensions = $state.snapshot(dims);
    requestAnimationFrame(() => draw(dimensions));
  });

  let left;
  let right;
  let bottom;
  let top;

  function draw(dims: Size): void {
    type Side = "left" | "right" | "top" | "bottom";
    interface Datum {
      x: string;
      y: string;
      xInit: string;
      yInit: string;
      w: number;
      h: number;
      isOuter: boolean;
      isHighside: boolean;
      angle: number;
      mirror: "x" | "y" | false;
    }

    type Data = Datum[];

    const px = (x: any) => `${x}px`;

    const genData = (side: Side): Data => {
      const isHighside = side == "right" || side == "bottom";
      const isHorizontal = side == "left" || side == "right";
      const isVertical = !isHorizontal;
      const sideLength = isHorizontal ? dims.height : dims.width;
      const tileLength = Math.max(tileInfo.size.height, tileInfo.size.width);

      const size = {
        u: isHorizontal ? tileInfo.size.height : tileInfo.size.width,
        v: isHorizontal ? tileInfo.size.width : tileInfo.size.height,
      };

      const sprite = {
        adjustments: {
          v: size.v / 7,
          u: -10,
        },
        flip: true,
      };

      const numTiles = Math.floor(sideLength / tileLength) * density.u;

      const rng = mulberry32(hashCode(side));
      return Array.from({ length: numTiles }, (_, i: number) => {
        const seed = rng({ lo: 67, hi: 420 });
        const localRng = mulberry32(seed);

        const nthOuter = Math.max(2, Math.ceil(density.u * 0.66));
        const isOuter = i % nthOuter != 0;

        const u =
          (i * size.u) / density.u + sprite.adjustments.u + localRng(uRandom);

        const v =
          -(size.v / 2) +
          density.v * size.v * (isOuter ? 1 : -1) +
          sprite.adjustments.v * (isOuter ? -1 : 1) +
          localRng(vRandom);

        const uInit = u - size.u;
        const vInit = v;

        const angle =
          (isOuter ? 180 : 0) +
          (isHighside ? 180 : 0) +
          (isVertical ? 180 : 0) +
          (isHorizontal ? 90 : 0) +
          localRng(angleRandom) * (isOuter ? 5.1 : 0.8);

        return {
          isOuter,
          isHighside,
          x: px(isHorizontal ? v : u),
          y: px(isHorizontal ? u : v),
          xInit: px(isHorizontal ? vInit : vInit),
          yInit: px(isHorizontal ? uInit : vInit),
          w: tileLength,
          h: tileLength,
          angle,
          mirror: sprite.flip
            ? !isOuter
              ? "x"
              : false
            : isOuter
              ? "x"
              : false,
        };
      });
    };

    function update(
      root: d3.Selection<HTMLDivElement, unknown, null, undefined>,
      side: Side,
    ) {
      return root
        .selectAll(`img.${side}`)
        .data(genData(side))
        .join("img")
        .attr("src", spritePath)
        .classed(`tile ${side}`, true)
        .call((s) =>
          s
            .style("right", (d) => (d.isHighside ? d.x : "unset"))
            .style("bottom", (d) => (d.isHighside ? d.y : "unset"))
            .style("left", (d) => (!d.isHighside ? d.x : "unset"))
            .style("top", (d) => (!d.isHighside ? d.y : "unset")),
        )
        .style("width", (d) => px(d.w) || "unset")
        .style("height", (d) => px(d.h) || "unset")
        .style("position", "absolute")
        .style(
          "transform",
          (d) =>
            `rotate(${d.angle}deg) ${d.mirror == "x" ? "scaleX(-1)" : d.mirror == "y" ? "scaleY(-1)" : ""}`,
        )
        .style("pointer-events", "none")
        .style("object-fit", "contain");
    }

    const root = d3.select(tilesRef);

    left = update(root, "left");
    right = update(root, "right");
    bottom = update(root, "bottom");
    top = update(root, "top");
  }
</script>

<div
  class={["tiling-border", "wrap-content"]}
  style="--size: {size}px"
  bind:this={containerRef}
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  <div class="tiling-content wrap-content">
    <div class={["content", "wrap-content", ...clazz]}>
      <slot />
    </div>
    <div class="tiles-group" bind:this={tilesRef}></div>
  </div>
</div>

<style>
  .wrap-content {
    display: inline-flex;
    max-width: 100%;
    max-height: 100%;
  }

  .tiles-group {
    overflow: visible;
    position: absolute;
    pointer-events: none;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .tiling-content {
    position: relative;
    overflow: visible;
  }

  .tiling-border {
    overflow: visible;
  }

  .content {
    position: relative;
  }
</style>
