import { COLLECTION_BOOKS, PAGES } from "@/utils/consts";
import { isNull } from "es-toolkit";
import { type Unsubscribe } from "firebase/auth";
import type { ArgsSync, Book, BookData, Doc } from "@/utils/types";
import {
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

        props.setCacheBooks(remoteBooks);
        props.setMyBooks(remoteBooks);
        props.setAllTitles(remoteBooks.map(b => b?.data?.title ?? ""));
      });

      return unsub;
    } catch (err: any) {
      console.error(`catch 'syncBooks' ${err.message}`);
      location.href = PAGES.ERROR;
    }
  }

  static async manageBook(bookId: string, data: BookData, UID: string): Promise<void> {
    if (data.owner !== UID) {
      console.error("Unauthorized: cannot modify book belonging to another user");
      return;
    }
    await setDoc(doc(COLLECTION_BOOKS, bookId), data);
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
