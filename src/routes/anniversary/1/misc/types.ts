export interface TapirStepsProps {
  count?: number;
  size?: number;
  pathWidth?: number;
  gap?: number;
  dir?: Direction;
  color?: string;
}

export type Direction = "up" | "down";

export interface FluidTextProps {
  class?: string;
  children?: import("svelte").Snippet;
}
