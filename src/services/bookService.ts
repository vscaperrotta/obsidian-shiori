import { requestUrl } from "obsidian";
import type { SearchItem, GoogleVolume } from "../types/googleBooks";
import { nullSafe } from "src/utils/helpers";

export async function searchBooks(query: string): Promise<SearchItem[]> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;
    const response = await requestUrl(url);
    const data = response.json as any;

    if (!data || !Array.isArray(data.items)) return [];

    return data.items.map((it: any) => {
      const info = it.volumeInfo || {};
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
    const data = response.json as any;

    console.log('Google Books details raw response:', data);

    if (!data) return null;
    return data as GoogleVolume;
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
}
