import type { Component } from "svelte";

export type TimelineData = Array<TimelineDatum>;

export type TimelineDatum = TimelineSkip | TimelineEvent;

export enum TimelineNodeType {
  Skip,
  Event,
}

export class TimelineSkip {
  type = TimelineNodeType.Skip;
}

export interface TimelineEventProps {
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string | Promise<string | undefined>;
  externalLink?: string;
  width?: string;
  contentWidth?: string;
  titleWidth?: string;
  height?: string;
  maxHeight?: string;
  direction?: "down" | "right" | "left" | "up";
  onHeaderResize?: (e: CustomEvent) => void;
}

export interface TimelineEventExports {
  getNodeRect: () => DOMRect | undefined;
}

export type TimelineEventComponent = Component<
  TimelineEventProps,
  TimelineEventExports,
  ""
>;

export class TimelineEvent {
  type = TimelineNodeType.Event;

  date?: Date;
  component?: TimelineEventComponent;
  props?: TimelineEventProps;
  id?: string;
  position?: TimelineNodePosition;
  expansion?: TimelineNodeExpansion;
  branchLenY?: number;
  branchLenX?: number;

  constructor(data: Partial<TimelineEvent>) {
    Object.assign(this, data);
  }

  // todo: clean up this mess
  ref?: any;
  getNodeRect(): DOMRect | undefined {
    return this.ref?.getNodeRect();
  }
}

export interface TimelineDecorationProps {}

export interface TimelineDecorationExports {
  // maybe use something like this later if you want to animate
  // the decoration using d3
  // getRef():
}

export type TimelineDecorationComponent = Component<
  TimelineDecorationProps,
  TimelineDecorationExports,
  ""
>;

export class TimelineDecoration {
  component?: TimelineDecorationComponent;
}

export type TimelineOrientation = "horizontal" | "vertical";

export type TimelineNodePosition = "above" | "below" | "left" | "right";

export type TimelineNodeExpansion = "down" | "up" | "inside" | "outside";

export type AnimationEasing = "linear" | "cubic" | "elastic" | "bounce";

export interface TimelineDimensions {
  width: number;
  height: number;
}

export interface NodeClickEvent {
  node: TimelineEvent;
  index: number;
}

export interface NodePosition {
  x: number;
  y: number;
  rect: DOMRect;
  branchLength: number;
}
