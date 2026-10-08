import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type {
  ChangeEvent,
  Dispatch,
  JSX,
  ReactNode,
  SetStateAction,
} from "react";

type Component = JSX.Element | JSX.Element[] | ReactNode;

type Handler<T, R> = (arg: T) => R;

type InputEvent = ChangeEvent<HTMLInputElement>;

type SelectEvent = ChangeEvent<HTMLSelectElement>;

type Timer = ReturnType<typeof setTimeout>;

type Doc = QueryDocumentSnapshot<DocumentData, DocumentData>;



type SortModes = "asc" | "desc" | "random";

type PopupIds =
  | "add_book"
  | "edit_book"
  | "delete_book"
  | "offline"
  | "notes"
  | "login"
  | "recommendation"
  | "suggestions"
  | "history";

interface StateHistoryEntry {
  state: string;
  changedAt: string;
  loaned?: string;
}

interface Book {
  id: string;
  data: BookData;
}

interface BookData {
  owner?: string;
  title?: string;
  state?: string;
  author?: string;
  image?: string;
  gender?: string;
  loaned?: string;
  notes?: string;
  isFav?: boolean;
  url?: string;
  publishYear?: number | string;
  editionCount?: number;
  stateHistory?: StateHistoryEntry[];
}

interface ArgsSync {
  UID: string;
  cacheBooks: Book[] | null;
  setCacheBooks: Dispatch<SetStateAction<Book[] | null>>;
  setMyBooks: Dispatch<SetStateAction<Book[]>>;
  setAllTitles: Dispatch<SetStateAction<string[]>>;
}

interface ShuffleAtom {
  data: BookData[];
  version: string;
  mode: "shuffle" | null;
}

export type {
  SortModes,
  Book,
  BookData,
  StateHistoryEntry,
  Component,
  Doc,
  InputEvent,
  Handler,
  PopupIds,
  SelectEvent,
  ArgsSync,
  Timer,

  ShuffleAtom,
};
