<svelte:options customElement="tiling-border" />

<script lang="ts">
  import { hashCode, mulberry32 } from "../utils";
  import type { RngRange } from "./types";
  import type { Component } from "svelte";

  interface SpriteProps {
    style: {
      position: string;
      height: string;
      width: string;
      transform: string;
      left: string;
      right: string;
      top: string;
      bottom: string;
    };
  }

  interface Props {
    sprite: Component<SpriteProps, {}, "">;
    size: Size;
    clazz?: string[];
    uRandom?: RngRange;
    vRandom?: RngRange;
    angleRandom?: RngRange;
    density?: { u: number; v: number };
  }

  let {
    sprite: Sprite,
    size,
    clazz = [],
    uRandom = { lo: -5, hi: 5 },
    vRandom = { lo: -20, hi: 10 },
    angleRandom = { lo: -5, hi: 5 },
    density = {
      u: 5,
      v: 0.05,
    },
  }: Props = $props();

  let tilesRef: HTMLDivElement;
  let containerRef: HTMLDivElement;

  let containerWidth = $state(0);
  let containerHeight = $state(0);

  let dims: Size = $derived({ width: containerWidth, height: containerHeight });

  interface Size {
    width: number;
    height: number;
  }

  type Side = "left" | "right" | "top" | "bottom";

  interface Datum {
    x: string;
    y: string;
    w: number;
    h: number;
    isOuter: boolean;
    isHighside: boolean;
    angle: number;
    mirror: "x" | "y" | false;
  }

  type Data = Datum[];

  const px = (x: number) => `${x}px`;

  function genData(side: Side, containerW: number, containerH: number): Data {
    const isHighside = side == "right" || side == "bottom";
    const isHorizontal = side == "left" || side == "right";
    const isVertical = !isHorizontal;
    const sideLength = isHorizontal ? containerH : containerW;
    const tileLength = Math.max(size.height, size.width);

    const tileSize = {
      u: isHorizontal ? size.height : size.width,
      v: isHorizontal ? size.width : size.height,
    };

    const sprite = {
      adjustments: {
        v: tileSize.v / 7,
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
        (i * tileSize.u) / density.u + sprite.adjustments.u + localRng(uRandom);

      const v =
        -(tileSize.v / 2) +
        density.v * tileSize.v * (isOuter ? 1 : -1) +
        sprite.adjustments.v * (isOuter ? -1 : 1) +
        localRng(vRandom);

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
        w: tileLength,
        h: tileLength,
        angle,
        mirror: sprite.flip ? (!isOuter ? "x" : false) : isOuter ? "x" : false,
      };
    });
  }

  let tiles = $derived.by(() => {
    return [
      ...genData("left", dims.width, dims.height),
      ...genData("right", dims.width, dims.height),
      ...genData("top", dims.width, dims.height),
      ...genData("bottom", dims.width, dims.height),
    ];
  });
</script>

<div
  class={["tiling-border", "wrap-content", ...clazz]}
  style="--size: {size}px"
  bind:this={containerRef}
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  <div class="tiling-content wrap-content">
    <div class={["content", "wrap-content"]}>
      <slot />
    </div>

    <div class="tiles-group" bind:this={tilesRef}>
      {#each tiles as tile}
        <Sprite
          style={{
            position: "absolute",
            height: px(tile.h) || "unset",
            width: px(tile.w) || "unset",
            transform: `rotate(${tile.angle}deg) ${tile.mirror == "x" ? "scaleX(-1)" : tile.mirror == "y" ? "scaleY(-1)" : ""}`,
            left: !tile.isHighside ? tile.x : "unset",
            right: tile.isHighside ? tile.x : "unset",
            top: !tile.isHighside ? tile.y : "unset",
            bottom: tile.isHighside ? tile.y : "unset",
          }}
        />
      {/each}
    </div>
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
