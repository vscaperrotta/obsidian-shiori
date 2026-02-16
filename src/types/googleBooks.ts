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
  saleInfo?: any;
  accessInfo?: any;
  searchInfo?: any;
};
