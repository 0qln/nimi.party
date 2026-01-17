import type { Component } from "svelte";

export interface PlushyPhotoProps {
    imageUrl?: string|Promise<string>;
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
