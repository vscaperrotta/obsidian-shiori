import { requestUrl } from "obsidian";
import type { SearchItem, GoogleVolume } from "../types/googleBooks";
import type { VolumeInfo } from "../types/VolumeInfoType";
import { nullSafe } from "src/utils/helpers";

type SearchResponse = { items?: GoogleVolume[] };

export async function searchBooks(query: string): Promise<SearchItem[]> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
    const response = await requestUrl(url);
    const data = response.json as SearchResponse;

    if (!data || !Array.isArray(data.items)) return [];

    return data.items.map((it: GoogleVolume) => {
      const info: VolumeInfo = it.volumeInfo ?? {};
      const thumbnail = nullSafe(() => info?.imageLinks?.thumbnail, "");
      return {
        volumeId: it.id,
        volumeInfo: {
          ...info,
          image: thumbnail
        }
      } as SearchItem;
    });
  } catch (error) {
    console.error("Error searching Google Books:", error);
    return [];
  }
}

export async function getBookDetails(id: string): Promise<GoogleVolume | null> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`;
    const response = await requestUrl(url);
    const data = response.json as GoogleVolume;

    if (!data) return null;
    return data;
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
}
