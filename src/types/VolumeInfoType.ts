import { IndustryIdentifier } from "./IndustryIdentifierType";
import { ImageLinks } from "./ImageLinksType";

export type VolumeInfo = {
  allowAnonLogging?: boolean;
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: IndustryIdentifier[];
  readingModes?: Record<string, boolean>;
  pageCount?: number;
  printType?: string;
  categories?: string[];
  maturityRating?: string;
  imageLinks?: ImageLinks;
  image?: string;
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
  contentVersion?: string;
  panelizationSummary?: {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
  };
};