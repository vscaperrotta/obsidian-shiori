import { App, TFile } from "obsidian";
import { NAME, FOLDER } from "../constants";
import { Data } from "../types/DataType";
import { VolumeInfo } from "src/types/VolumeInfoType";
import { Book } from "../types/BookType";

const DEFAULT_NAME = `${NAME}.json`;

export function getDefaultPath(folder?: string) {
  const folderPath = folder ?? FOLDER;
  return `${folderPath}/${DEFAULT_NAME}`;
}

export function getFolder(folder?: string) {
  return folder ?? FOLDER;
}

export function createEmptyElement(): Book {
  return {
    id: Math.random().toString(36),
    volumeInfo: null as unknown as VolumeInfo,
    starRating: 0,
    note: ""
  };
}

export function createDefaultData(): Data {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    libraryName: FOLDER,
    owner: "",
    source: FOLDER,
    items: []
  };
}

function normalizeData(data: Data): Data {
  return {
    ...data,
    items: data.items.map((item) => ({
      ...createEmptyElement(),
      volumeInfo: item.volumeInfo || null,
      starRating: typeof item.starRating === "number" ? item.starRating : 0,
      note: typeof item.note === "string" ? item.note : "",
      readDate: typeof item.readDate === "string" ? item.readDate : ""
    }))
  };
}

export async function ensureFolder(app: App, folder?: string) {
  const folderPath = getFolder(folder);
  if (!app.vault.getAbstractFileByPath(folderPath)) {
    await app.vault.createFolder(folderPath);
  }
}

export async function createJsonFile(app: App, folder?: string): Promise<TFile> {
  const folderPath = getFolder(folder);
  await ensureFolder(app, folder);
  const existing = app.vault.getAbstractFileByPath(getDefaultPath(folder));
  const filename = existing ? `Library-${Date.now()}.json` : DEFAULT_NAME;
  const path = `${folderPath}/${filename}`;

  return app.vault.create(path, JSON.stringify(createDefaultData(), null, 2));
}

export async function loadLocalFile(app: App, file: TFile): Promise<Data> {
  const raw = await app.vault.read(file);
  const parsed = JSON.parse(raw) as Data;
  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error("Invalid JSON format");
  }
  return normalizeData(parsed);
}

export async function saveLocalData(app: App, file: TFile, data: Data) {
  await app.vault.modify(file, JSON.stringify(data, null, 2));
}
