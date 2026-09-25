import { atom, type RecoilState } from "recoil";
import type { ShuffleAtom } from "./types";

const atomCache: Map<string, RecoilState<any>> =
  ((globalThis as any).__RECOIL_ATOM_CACHE ??= new Map());

function cachedAtom<T>(key: string, defaultVal: T): RecoilState<T> {
  const cached = atomCache.get(key);
  if (cached) return cached as RecoilState<T>;
  const a = atom<T>({ key, default: defaultVal });
  atomCache.set(key, a);
  return a;
}

const searchAtom = cachedAtom<string>("search-atom", "");

const stateAtom = cachedAtom<string>("state-atom", "");

const popupsAtom = cachedAtom<any>("popups-atom", {
  add_book: false,
  edit_book: false,
  delete_book: false,
  profile: false,
  settings: false,
  offline: false,
  login: false,
  recommendation: false,
  suggestions: false,
});

const zeroAtom = cachedAtom<boolean>("zero-atom", false);

const animListAtom = cachedAtom<boolean>("anim-list-atom", false);

const coverAtom = cachedAtom<boolean>("cover-atom", false);

const menuAtom = cachedAtom<boolean>("menu-atom", false);

const scrollAtom = cachedAtom<number>("scroll-atom", 0);

const shuffleAtom = cachedAtom<ShuffleAtom>("shuffle-atom", {
  data: [],
  version: "",
  mode: null,
});

const showFavsAtom = cachedAtom<boolean>("show-favs-atom", false);

export {
  animListAtom,
  popupsAtom,
  searchAtom,
  stateAtom,
  zeroAtom,
  coverAtom,
  menuAtom,
  scrollAtom,
  shuffleAtom,
  showFavsAtom,
};
