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

type SelectOpt = { value: string; label: string }[];

type SortModes = "asc" | "desc" | "random";

type PopupIds =
  | "add_book"
  | "edit_book"
  | "delete_book"
  | "offline"
  | "notes"
  | "login"
  | "recommendation"
  | "suggestions";

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
  Component,
  Doc,
  InputEvent,
  Handler,
  PopupIds,
  SelectEvent,
  ArgsSync,
  Timer,
  SelectOpt,
  ShuffleAtom,
};
