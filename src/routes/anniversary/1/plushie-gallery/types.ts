import type { Component } from "svelte";
import type { RngParams } from "../utils";

export interface PlushMetadata {
  timestamp: string;
  emailAddress: string;
  country: string;
  message: string;
  nickname: string;
  socialAccount: string;
  secondaryEmail: string;
  photoFilename: string;
  isImageAssetMade: boolean;
}

export interface PlushyPhotoProps {
  imageUrl?: string | Promise<unknown>;
  path?: string;
  meta?: PlushMetadata;
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
