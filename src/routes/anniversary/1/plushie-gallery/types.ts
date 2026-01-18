import type { Component } from "svelte";
import type { RngParams } from "../utils";

export interface PlushyPhotoProps {
    imageUrl?: string|Promise<string>;
    rng?: (p: RngParams) => number;
  }

export interface PlushyPhotoExports {
    // getRect: () => DOMRect|undefined
}

export type PlushyPhotoComponent = Component<
    PlushyPhotoProps,
    PlushyPhotoExports,
    ""
>;

export class PlushyPhotoDatum {
    component?: PlushyPhotoComponent;
    props?: PlushyPhotoProps;

  constructor(data: Partial<PlushyPhotoDatum>) {
    Object.assign(this, data);
  }
}
