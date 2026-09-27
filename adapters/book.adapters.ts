import { COLLECTION_BOOKS, PAGES } from "@/utils/consts";
import { isNull, isEqual } from "es-toolkit";
import { type Unsubscribe } from "firebase/auth";
import type { ArgsSync, Book, BookData, Doc, StateHistoryEntry } from "@/utils/types";
import {
  arrayUnion,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  type Query,
  query,
  type QuerySnapshot,
  setDoc,
  where,
} from "firebase/firestore";

export class BookAdapters {
  static async getBooks(UID: string): Promise<BooksRes> {
    const books: Book[] = [];
    let isEmpty: boolean = false;

    try {
      const q: Query = query(COLLECTION_BOOKS, where("owner", "==", UID));
      const res: QuerySnapshot = await getDocs(q);
      res.forEach((doc: Doc) => books.push({ id: doc.id, data: doc.data() }));
      isEmpty = res.empty;
    } catch (err: any) {
      console.error(`catch 'getBooks' ${err.message}`);
      location.href = PAGES.ERROR;
    }

    return { books, isEmpty };
  }

  static syncBooks(props: ArgsSync): SyncRes {
    if (isNull(props.UID)) return undefined;

    try {
      const myQuery: Query = query(
        COLLECTION_BOOKS,
        where("owner", "==", props.UID)
      );
      const unsub: Unsubscribe = onSnapshot(myQuery, (qs: QuerySnapshot) => {
        const remoteBooks: Book[] = qs.docs.map((d: Doc) => ({
          id: d?.id,
          data: d?.data(),
        }));

        props.setCacheBooks((prev: Book[] | null) => 
          isEqual(prev, remoteBooks) ? prev : remoteBooks
        );
        props.setMyBooks((prev: Book[]) => 
          isEqual(prev, remoteBooks) ? prev : remoteBooks
        );
        props.setAllTitles((prev: string[]) => {
          const newTitles = remoteBooks.map(b => b?.data?.title ?? "");
          return isEqual(prev, newTitles) ? prev : newTitles;
        });
      });

      return unsub;
    } catch (err: any) {
      console.error(`catch 'syncBooks' ${err.message}`);
      location.href = PAGES.ERROR;
    }
  }

  static async manageBook(
    bookId: string,
    data: BookData,
    UID: string,
    newHistoryEntry?: StateHistoryEntry
  ): Promise<void> {
    if (data.owner !== UID) {
      console.error("Unauthorized: cannot modify book belonging to another user");
      return;
    }

    if (newHistoryEntry) {
      const { stateHistory, ...restData } = data;
      await setDoc(
        doc(COLLECTION_BOOKS, bookId),
        {
          ...restData,
          stateHistory: arrayUnion(newHistoryEntry),
        },
        { merge: true }
      );
    } else {
      await setDoc(doc(COLLECTION_BOOKS, bookId), data);
    }
  }

  static async deleteBook(bookId: string, UID: string, ownerCheck: string): Promise<void> {
    if (ownerCheck !== UID) {
      console.error("Unauthorized: cannot delete book belonging to another user");
      return;
    }
    await deleteDoc(doc(COLLECTION_BOOKS, bookId));
  }
}

type BooksRes = { books: Book[]; isEmpty: boolean };

type SyncRes = Unsubscribe | null | undefined;
