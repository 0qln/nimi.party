import type { Component } from "svelte";

export interface Tile {
  comopnent: Component;
  props?: Record<string, any>;
}

export interface RngRange {
  lo?: number;
  hi?: number;
}
