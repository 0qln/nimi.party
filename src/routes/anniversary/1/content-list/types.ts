import type { Component } from "svelte";

export type TimelineData = Array<TimelineDatum>;

export type TimelineDatum = TimelineSkip | TimelineEvent;

export enum TimelineNodeType  { Skip, Event }

export class TimelineSkip {
    type = TimelineNodeType.Skip;
}

export class TimelineEvent {
    type = TimelineNodeType.Event;

    date?: Date;
    component?: Component;
    componentCtor?: CustomElementConstructor;
    componentTag?: string;
    props?: Record<string, any>;
    id?: string;
    position?: TimelineNodePosition;
    expansion?: TimelineNodeExpansion;
    branchLenY?: number;
    branchLenX?: number;

  constructor(data: Partial<TimelineEvent>) {
    Object.assign(this, data);
  }
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
