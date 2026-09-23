import useLocalStorage from "./useLocalStorage";
import { deburr, isEqual } from "es-toolkit";
import { tLC } from "@/utils/helpers";
import type { Book } from "@/utils/types";

function useTitles(title?: string): Titles {
  const [allTitles, setAllTitles] = useLocalStorage<string[]>("all-titles", []);

  const titlesArray = Array.isArray(allTitles) ? allTitles : [];

  const isRepeated: boolean = titlesArray.some((itemTitle: string) => {
    if (!title || typeof itemTitle !== "string") return false;
    return isEqual(deburr(tLC(itemTitle)), deburr(tLC(title)));
  });

  function updateTitles(arr: Book[]): void {
    if (!Array.isArray(arr)) return;
    setAllTitles(arr.map((b: Book) => b?.data?.title).filter((t): t is string => !!t));
  }

  return { isRepeated, allTitles: titlesArray, updateTitles };
}

export default useTitles;

interface Titles {
  isRepeated: boolean;
  allTitles: string[];
  updateTitles: (books: Book[]) => void;
}
