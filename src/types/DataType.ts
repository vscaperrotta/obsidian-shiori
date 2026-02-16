import { Book } from "./BookType";

export type Data = {
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  libraryName: string;
  owner: string;
  source: string;
  items: Book[];
};
