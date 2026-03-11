import { VolumeInfo } from "./VolumeInfoType";

export type SearchItem = {
  volumeId: string;
  volumeInfo: VolumeInfo;
};

export type GoogleVolume = {
  kind?: string;
  id?: string;
  etag?: string;
  selfLink?: string;
  volumeInfo?: VolumeInfo;
  saleInfo?: Record<string, unknown>;
  accessInfo?: Record<string, unknown>;
  searchInfo?: Record<string, unknown>;
};
